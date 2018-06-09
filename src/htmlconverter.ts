interface ParserOptions {
    isParent?: boolean,
    tabLevel: number,
    paddingType?: number
    removeEmpty?: boolean,
    templateLiterals?: boolean,
    functional?: boolean,
    ES6?: boolean,
    childName?: string,
    parentName?: string,
}

const CHILDNAME = 0;
const INSERTABLE = 1;
const TREE = 2;

export class HTML2JS {
    private static funcString = "(() => {";
    private static functional = true;
    private static varString = "let";
    private static templateLiterals = false;
    private static paddingType = 4;
    private static beautify = true;
    private static parentName = "el";
    private static childName = "Ch";
    private static removeEmpty = true;

    static create(element: HTMLElement, options: ParserOptions): string {
        //disabling ES6 should also disable template literals
        if (options.functional === undefined) options.functional = true;
        if (options.ES6 === undefined) options.ES6 = true;
        if (options.templateLiterals === undefined) options.templateLiterals = false;
        if (options.removeEmpty === undefined) options.removeEmpty = true;
        if (options.tabLevel === undefined) options.tabLevel = 1;
        if (options.paddingType === undefined) options.paddingType = 4;
        if (options.isParent === undefined) options.isParent = true;
        if (options.parentName === undefined) options.parentName = "el";
        if (options.childName === undefined) options.childName = "el";
        if (options.removeEmpty === undefined) options.removeEmpty = true;
        if (options.functional === undefined) options.functional = true;

        if (options.functional) {
            if (options.ES6)
                this.funcString = "(() => {";
            else
                this.funcString = "(function(){";
            this.functional = true;
        } else {
            this.funcString = "";
            this.functional = false;
        }

        if (options.ES6)
            this.varString = "let";
        else
            this.varString = "var";


        if (options.templateLiterals && options.ES6)
            this.templateLiterals = true;
        else
            this.templateLiterals = false;


        this.paddingType = options.paddingType;
        this.parentName = options.parentName;
        this.childName = options.childName;
        this.removeEmpty = options.removeEmpty;

        return this.createTree(element, options.isParent, this.parentName, options.tabLevel);
    }

    private static createTree(el: any, parent: boolean, varName: string, blockLevel: number): string {
        let out: string[] = [];

        if (el.nodeType === Node.ELEMENT_NODE) {
            if (this.functional)
                out.push(this.funcString)

            out.push(
                this.getPadding(this.functional && blockLevel)
                + this.varString + " " + varName
                + ' = '
                + this.getAccessString(el)
                + ";"
            );

            let startedWith = out.length;

            if (el.hasAttributes && el.hasAttributes())
                for (let i = 0; i < el.attributes.length; i++) {
                    let attrib = el.attributes[i];

                    out.push(
                        this.getPadding(this.functional && blockLevel)
                        + varName + '.setAttribute("'
                        + attrib.name + '", '
                        + this.encapsulate(attrib.value) + ');'
                    );
                }

            let children = Array
                .from(el.childNodes)
                .map((child: any, index) => {
                    let childName = this.functional ? this.childName : varName + this.childName + this.numberToLetter(index);
                    return [
                        childName,
                        this.canBeInserted(child),
                        this.createTree(child, !this.functional, childName, !this.functional ? 0 : (blockLevel ? blockLevel + 1 : 0))
                    ];
                })
                .filter((object: any) => object[TREE].length)
                .map((object) => {
                    if(object[INSERTABLE]){
                        if (this.functional)
                            return [this.getPadding(blockLevel) + varName + ".appendChild(" + object[TREE] + ");"];
                        else
                            return [object[TREE], varName + ".appendChild(" + object[CHILDNAME] + ");"];
                    }else{
                        if (this.functional)
                            return [this.getPadding(blockLevel) +  object[TREE] + ";"];
                        else
                            return [object[TREE]];
                    }
                });

            if(children.length) children
                .reduce((lines, line) => lines.concat(line))
                .forEach((line: any) => out.push(line));

            if(out.length === startedWith && !this.canBeInserted(el))
                return "";

            if (this.functional) {
                out.push(this.getPadding(blockLevel)     + "return " + varName + ";");
                out.push(this.getPadding(blockLevel - 1) + "})()" + (parent ? ";" : ""));
            }
        } else if (el.nodeType === Node.TEXT_NODE) {
            let text:string;

            if(this.removeEmpty)
                text = el.data.trim();
            else
                text = el.data;

            if (text.length) 
                out.push(
                    (!this.functional ? this.varString + " " + varName + " = " : "")
                    + "document.createTextNode("
                    + this.encapsulate(text)
                    + ")" + (parent ? ";" : "")
                );
        }

        return out.join(blockLevel || !this.functional ? "\n" : "");
    }

    private static canBeInserted(el: HTMLElement): boolean{
        if(el.tagName === "HTML" || el.tagName === "HEAD" || el.tagName === "BODY")
            return false;
        else
            return true;
    }

    private static getAccessString(el: HTMLElement): string{
        if(el.tagName === "HTML")
            return "document.documentElement"
        else if(el.tagName === "HEAD")
            return "document.head";
        else if(el.tagName === "BODY")
            return "document.body";
        else 
            return 'document.createElement("' + el.tagName.toLowerCase() + '")';
    }
    
    private static encapsulate(string: string): string {
        if (this.templateLiterals)
            return "`" + string.replace(/\`/g, "\\\`") + "`";
        else
            return JSON.stringify(string);

    }

    private static getPadding(blockLevel: number): string {
        let indent: string;

        if (blockLevel > 0) {
            if (this.paddingType < 1)
                indent = "\t";
            else
                indent = " ".repeat(this.paddingType);
            return indent.repeat(blockLevel);
        } else {
            return ""
        }
    }

    private static numberToLetter(index: number): string {
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let digits: string[] = [];
        // basically the same thing as convering base 10 to base 26
        do {
            let remainder = index % 26;
            index = (index - remainder) / 26;
            digits.push(alphabet[remainder]);
        } while (index != 0)

        return digits.reverse().join("");
    }
}
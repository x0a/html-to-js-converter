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

export class HTML2JS {
    private static funcString = "(() => {";
    private static varString = "let";
    private static templateLiterals = false;
    private static paddingType = 4;
    private static parentName = "el";
    private static childName = "Ch";

    static create(element: HTMLElement, options: ParserOptions): string {
        //disabling ES6 should also disable template literals
        if (options.functional === undefined) options.functional = true;
        if (options.ES6 === undefined) options.ES6 = true;
        if (options.templateLiterals === undefined) options.templateLiterals = false;
        if (options.removeEmpty === undefined) options.removeEmpty = true;
        if (options.tabLevel === undefined) options.tabLevel = 1;
        if (options.paddingType === undefined) options.paddingType = 4;
        if (options.isParent === undefined) options.isParent = true;
        if (options.parentName === undefined || options.parentName.length < 2) options.parentName = "el";
        if (options.childName === undefined || options.childName.length < 2) options.childName = "Ch"

        if (options.functional) {
            if (options.ES6)
                this.funcString = "(() => {";
            else
                this.funcString = "(function(){";
        } else {
            this.funcString = "";
        }

        if (options.ES6)
            this.varString = "let";
        else
            this.varString = "var";


        if (options.templateLiterals && options.ES6)
            this.templateLiterals = true;
        else
            this.templateLiterals = false;

        if (options.paddingType !== undefined)
            this.paddingType = options.paddingType;
        this.parentName = options.parentName;
        this.childName = options.childName

        return this.createTree(element, options.isParent, this.parentName, options.tabLevel, options.removeEmpty, options.templateLiterals, options.functional);
    }

    private static createTree(el: any, parent: boolean, varName: string, level: number, removeEmpty: boolean, templateLiterals: boolean, functional: boolean): string {
        let out = "";
        if (el.nodeType === Node.ELEMENT_NODE) {
            out += this.funcString;

            if (level && functional)
                out += this.addPadding(level);

            out += this.varString + " " + varName + ` = document.createElement("` + el.tagName.toLowerCase() + `");`;

            if (level || !functional)
                out += this.addPadding(level)

            if (el.hasAttributes && el.hasAttributes())
                for (let i = 0; i < el.attributes.length; i++) {
                    let attrib = el.attributes[i];

                    out += varName + '.setAttribute("' + attrib.name + '", ' + this.encapsulate(attrib.value) + ');';

                    if (level || !functional)
                        out += this.addPadding(level)
                }

            out += Array.from(el.childNodes)
                .filter((child: any) => {
                    return !(removeEmpty && child.nodeType === Node.TEXT_NODE && !child.data.trim().length)
                })
                .map((child, index) => {
                    let childName = functional ? this.parentName : varName + this.childName + this.numberToLetter(index);
                    return [
                        childName,
                        this.createTree(child, !functional, childName, !functional ? 0 : (level ? level + 1 : 0), removeEmpty, templateLiterals, functional)
                    ];
                })
                .map((child, index) => {
                    if (functional)
                        return varName + ".appendChild(" + child[1] + ");"
                    else
                        return child[1] + this.addPadding(level) + varName + ".appendChild(" + child[0] + ");"
                })
                .filter(child => child.length)
                .join(level || !functional ? this.addPadding(level) : "");


            if (functional) {
                if (level)
                    out += this.addPadding(level)
                out += "return el;"
                if (level)
                    out += this.addPadding(level - 1)
                out += "})()" + (parent ? ";" : "");
            }
        } else if (el.nodeType === Node.TEXT_NODE) {
            if (!removeEmpty || removeEmpty && (el.data = el.data.trim()) && el.data.length !== 0)
                out += (!functional ? this.varString + " " + varName + " = " : "") + "document.createTextNode(" + this.encapsulate(el.data) + ")" + (parent ? ";" : "");
        }
        return out;
    }

    private static encapsulate(string: string): string {
        if (this.templateLiterals)
            return "`" + string + "`";
        else
            return JSON.stringify(string);

    }

    private static addPadding(level: number): string {
        let indent: string;
        let out: string = "";

        if (level) {
            if (this.paddingType < 1)
                indent = "\t";
            else
                indent = " ".repeat(this.paddingType);
            out = "\n" + indent.repeat(level);
        } else {
            out = "\n";
        }

        return out;
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
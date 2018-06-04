interface ParserOptions{
    isParent: boolean,
    tabLevel: number,
    paddingType: number
    removeEmpty: boolean, 
    templateLiterals: boolean, 
    functional?: boolean,
    ES6?: boolean
}

export class HTML2JS{
    private static funcString = "(() => {";
    private static varString = "let";

    static create(element: HTMLElement, options: ParserOptions): string{
        //disabling ES6 should also disable template literals
        if(options.functional === undefined) options.functional = true;

        if(options.functional){
            if(options.ES6)
                this.funcString = "(() => {";
            else
                this.funcString = "(function(){";
        }else{
            this.funcString = "";
        }

        if(options.ES6)
            this.varString = "let";
        else
            this.varString = "var";


        return this.createTree(element, options.isParent, "el", options.tabLevel, options.removeEmpty, options.templateLiterals, options.paddingType, options.functional);
    }

    private static createTree(el: any, parent: boolean, varName: string, level: number, removeEmpty: boolean, templateLiterals: boolean, paddingType: number, functional:boolean): string{
        let out = "";
        if(el.nodeType === Node.ELEMENT_NODE){
            out += this.funcString;

            if(level && functional)
                out += this.addPadding(level, paddingType);

            out += this.varString + " " + varName + ` = document.createElement("`+ el.tagName.toLowerCase() + `");`;

            if(level || !functional)
                out += this.addPadding(level, paddingType)
        
            if(el.hasAttributes && el.hasAttributes())
                for(let i = 0; i < el.attributes.length; i++) {
                    let attrib = el.attributes[i];

                    out += varName + '.setAttribute("' + attrib.name + '", ' + this.encapsulate(attrib.value, templateLiterals) + ');';

                    if(level || !functional)
                        out += this.addPadding(level, paddingType)
                }
        
            let children = el.childNodes
            out += Array.from(children)
                .filter((child: any) => {
                    return !(removeEmpty && child.nodeType === Node.TEXT_NODE && !child.data.trim().length)
                })
                .map((child, index) => {
                    let childName = functional ? "el" : varName + "Child" + (index + 1);
                    return [
                        childName,
                        this.createTree(child, !functional, childName, !functional ? 0 : (level ? level + 1 : 0), removeEmpty, templateLiterals, paddingType, functional)
                    ];
                })
                .map((child, index) => {
                    if(functional)
                        return varName + ".appendChild(" + child[1] + ");"
                    else
                        return child[1] + this.addPadding(level, paddingType) + varName + ".appendChild(" + child[0] + ");" 
                })
                .filter(child => child.length)
                .join(level || !functional ? this.addPadding(level, paddingType) : "");
            

            if(functional){
                if(level)
                    out += this.addPadding(level, paddingType)
                out += "return el;"
                if(level)
                    out += this.addPadding(level - 1, paddingType)
                out += "})()" + (parent ? ";" : "");
            }
        }else if(el.nodeType === Node.TEXT_NODE){
            if(!removeEmpty || removeEmpty && (el.data = el.data.trim()) && el.data.length !== 0)
                out += (!functional ? this.varString + " " + varName + " = " : "") + "document.createTextNode(" + this.encapsulate(el.data, templateLiterals) + ")" + (parent ? ";" : "");
        }
        return out;
    }

    private static encapsulate(string: string, templateLiterals: boolean): string{
        if(templateLiterals)
            return "`" + string + "`";
        else
            return JSON.stringify(string);
        
    }

    private static addPadding(level: number, type: number): string{
        let indent: string;
        let out: string = "";

        if(level){
            if(type < 1)
                indent = "\t";
            else
                indent = " ".repeat(type);
            out = "\n" + indent.repeat(level);
        }else{
            out = "\n";
        }

        return out;
    }
    private static numberToLetter(index:number): string{
        return "";
    }
}
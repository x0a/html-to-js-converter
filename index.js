(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CHILDNAME = 0;
const INSERTABLE = 1;
const TREE = 2;
class HTML2JS {
    static create(element, options) {
        //disabling ES6 should also disable template literals
        if (options.functional === undefined)
            options.functional = true;
        if (options.ES6 === undefined)
            options.ES6 = true;
        if (options.templateLiterals === undefined)
            options.templateLiterals = false;
        if (options.removeEmpty === undefined)
            options.removeEmpty = true;
        if (options.tabLevel === undefined)
            options.tabLevel = 1;
        if (options.paddingType === undefined)
            options.paddingType = 4;
        if (options.isParent === undefined)
            options.isParent = true;
        if (options.parentName === undefined)
            options.parentName = "el";
        if (options.childName === undefined)
            options.childName = "el";
        if (options.removeEmpty === undefined)
            options.removeEmpty = true;
        if (options.functional === undefined)
            options.functional = true;
        if (options.functional) {
            if (options.ES6)
                this.funcString = "(() => {";
            else
                this.funcString = "(function(){";
            this.functional = true;
        }
        else {
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
    static createTree(el, parent, varName, blockLevel) {
        let out = [];
        if (el.nodeType === Node.ELEMENT_NODE) {
            if (this.functional)
                out.push(this.funcString);
            out.push(this.getPadding(this.functional && blockLevel)
                + this.varString + " " + varName
                + ' = '
                + this.getAccessString(el)
                + ";");
            let startedWith = out.length;
            if (el.hasAttributes && el.hasAttributes())
                for (let i = 0; i < el.attributes.length; i++) {
                    let attrib = el.attributes[i];
                    out.push(this.getPadding(this.functional && blockLevel)
                        + varName + '.setAttribute("'
                        + attrib.name + '", '
                        + this.encapsulate(attrib.value) + ');');
                }
            let children = Array
                .from(el.childNodes)
                .map((child, index) => {
                let childName = this.functional ? this.childName : varName + this.childName + this.numberToLetter(index);
                return [
                    childName,
                    this.canBeInserted(child),
                    this.createTree(child, !this.functional, childName, !this.functional ? 0 : (blockLevel ? blockLevel + 1 : 0))
                ];
            })
                .filter((object) => object[TREE].length)
                .map((object) => {
                if (object[INSERTABLE]) {
                    if (this.functional)
                        return [this.getPadding(blockLevel) + varName + ".appendChild(" + object[TREE] + ");"];
                    else
                        return [object[TREE], varName + ".appendChild(" + object[CHILDNAME] + ");"];
                }
                else {
                    if (this.functional)
                        return [this.getPadding(blockLevel) + object[TREE] + ";"];
                    else
                        return [object[TREE]];
                }
            });
            if (children.length)
                children
                    .reduce((lines, line) => lines.concat(line))
                    .forEach((line) => out.push(line));
            if (out.length === startedWith && !this.canBeInserted(el))
                return "";
            if (this.functional) {
                out.push(this.getPadding(blockLevel) + "return " + varName + ";");
                out.push(this.getPadding(blockLevel - 1) + "})()" + (parent ? ";" : ""));
            }
        }
        else if (el.nodeType === Node.TEXT_NODE) {
            let text;
            if (this.removeEmpty)
                text = el.data.trim();
            else
                text = el.data;
            if (text.length)
                out.push((!this.functional ? this.varString + " " + varName + " = " : "")
                    + "document.createTextNode("
                    + this.encapsulate(text)
                    + ")" + (parent ? ";" : ""));
        }
        return out.join(blockLevel || !this.functional ? "\n" : "");
    }
    static canBeInserted(el) {
        if (el.tagName === "HTML" || el.tagName === "HEAD" || el.tagName === "BODY")
            return false;
        else
            return true;
    }
    static getAccessString(el) {
        if (el.tagName === "HTML")
            return "document.documentElement";
        else if (el.tagName === "HEAD")
            return "document.head";
        else if (el.tagName === "BODY")
            return "document.body";
        else
            return 'document.createElement("' + el.tagName.toLowerCase() + '")';
    }
    static encapsulate(string) {
        if (this.templateLiterals)
            return "`" + string.replace(/\`/g, "\\\`") + "`";
        else
            return JSON.stringify(string);
    }
    static getPadding(blockLevel) {
        let indent;
        if (blockLevel > 0) {
            if (this.paddingType < 1)
                indent = "\t";
            else
                indent = " ".repeat(this.paddingType);
            return indent.repeat(blockLevel);
        }
        else {
            return "";
        }
    }
    static numberToLetter(index) {
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let digits = [];
        // basically the same thing as convering base 10 to base 26
        do {
            let remainder = index % 26;
            index = (index - remainder) / 26;
            digits.push(alphabet[remainder]);
        } while (index != 0);
        return digits.reverse().join("");
    }
}
HTML2JS.funcString = "(() => {";
HTML2JS.functional = true;
HTML2JS.varString = "let";
HTML2JS.templateLiterals = false;
HTML2JS.paddingType = 4;
HTML2JS.beautify = true;
HTML2JS.parentName = "el";
HTML2JS.childName = "Ch";
HTML2JS.removeEmpty = true;
exports.HTML2JS = HTML2JS;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const htmlconverter_1 = require("./htmlconverter");
(function (window, document, undefined) {
    "use strict";
    let testHtml = `<ul id="fruits">
    <li class="apple">Apple</li>
    <li class="orange">Orange</li>
    <li class="pear">Pear</li>
</ul>`;
    document.addEventListener("DOMContentLoaded", () => {
        const DOM = {
            output: document.querySelector("#outputs"),
            input: document.querySelector("#input"),
            convertBtn: document.querySelector("#convertBtn"),
            emptyNodes: document.querySelector("#emptyNodes"),
            beautify: document.querySelector("#beautify"),
            beautifyContainer: document.querySelector(".b-container"),
            templateLiterals: document.querySelector("#templateLiterals"),
            padding: document.querySelector("#padding"),
            functional: document.querySelector("#functional"),
            ES6: document.querySelector("#ES6"),
            parentName: document.querySelector("#parentName"),
            childName: document.querySelector("#childName")
        };
        DOM.convertBtn.addEventListener("click", () => {
            let inputHtml = parseHTML(DOM.input.value);
            let removeEmpty = !!DOM.emptyNodes.checked;
            let beautify = !!DOM.beautify.checked;
            let templateLiterals = !!DOM.templateLiterals.checked;
            let padding = ~~DOM.padding.value;
            let functional = !!DOM.functional.checked;
            let ES6 = !!DOM.ES6.checked;
            let parentName = DOM.parentName.value;
            let childName = DOM.childName.value;
            while (DOM.output.lastChild) //remove all children from #outputs
                DOM.output.removeChild(DOM.output.lastChild);
            let fragment = document.createDocumentFragment();
            for (let child of inputHtml.childNodes) { //add new children
                let output, tree = htmlconverter_1.HTML2JS.create(child, {
                    functional: functional,
                    ES6: ES6,
                    isParent: true,
                    tabLevel: functional && beautify ? 1 : 0,
                    removeEmpty: removeEmpty,
                    templateLiterals: templateLiterals,
                    paddingType: padding,
                    childName: childName,
                    parentName: parentName
                });
                if (removeEmpty && tree.length === 0)
                    continue;
                fragment.appendChild((() => {
                    let el = document.createElement("pre");
                    el.setAttribute("class", "jscontainer");
                    el.appendChild(output = (() => {
                        let el = document.createElement("code");
                        el.textContent = tree;
                        el.setAttribute("class", "javascript");
                        return el;
                    })());
                    el.appendChild((() => {
                        let el = document.createElement("button");
                        el.setAttribute("class", "btn btn-secondary btn-sm jscopy");
                        el.setAttribute("type", "button");
                        el.addEventListener("click", () => {
                            const selection = window.getSelection();
                            const range = document.createRange();
                            range.selectNodeContents(output);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        });
                        el.appendChild(document.createTextNode("Select all"));
                        return el;
                    })());
                    return el;
                })());
                hljs.highlightBlock(output); //add syntax highlighting
            }
            DOM.output.appendChild(fragment);
        });
        DOM.input.addEventListener("keydown", function (event) {
            //allow use of tab key in html editor
            let key = event.keyCode || event.which || 0;
            let oldSelectionStart;
            let padding, add = "";
            if (key === 9 || key === 13) {
                event.preventDefault();
                oldSelectionStart = this.selectionStart;
                padding = ~~DOM.padding.value;
            }
            else
                return;
            if (key === 9) {
                let padding = ~~DOM.padding.value;
                add = padding < 1 ? "\t" : " ".repeat(padding);
            }
            else if (key === 13) {
                let lastLn = this.value.lastIndexOf("\n", oldSelectionStart - 1);
                let lastLine = this.value.substring(lastLn + 1, oldSelectionStart); //from selection, get last 
                let deWhiteSpace = lastLine.trim();
                let whiteSpaceEnd = deWhiteSpace.length ? lastLine.indexOf(deWhiteSpace) : undefined;
                add = "\n" + lastLine.substring(0, whiteSpaceEnd);
            }
            this.value = this.value.substring(0, oldSelectionStart) + add + this.value.substring(this.selectionEnd);
            this.selectionEnd = oldSelectionStart + add.length;
        });
        DOM.functional.addEventListener("change", () => {
            //show padding selector
            if (DOM.functional.checked) {
                DOM.beautifyContainer.classList.add("show");
                if (DOM.childName.value !== "el")
                    DOM.childName.value = "el";
            }
            else {
                DOM.beautifyContainer.classList.remove("show");
                if (DOM.childName.value === "el")
                    DOM.childName.value = "Ch";
            }
        });
        DOM.ES6.addEventListener("change", () => {
            if (DOM.templateLiterals.checked && !DOM.ES6.checked)
                DOM.templateLiterals.checked = false;
        });
        DOM.templateLiterals.addEventListener("change", () => {
            if (DOM.templateLiterals.checked && !DOM.ES6.checked)
                DOM.ES6.checked = true;
        });
        DOM.parentName.addEventListener("keyup", () => {
            if (!DOM.parentName.value.length) {
                if (!DOM.parentName.classList.contains("is-invalid"))
                    DOM.parentName.classList.add("is-invalid");
            }
            else
                DOM.parentName.classList.remove("is-invalid");
        });
        DOM.parentName.addEventListener("change", () => {
            if (DOM.parentName.value.length < 1) {
                DOM.parentName.value = "el";
                DOM.parentName.classList.remove("is-invalid");
            }
        });
        DOM.childName.addEventListener("keyup", () => {
            if (!DOM.childName.value.length) {
                if (!DOM.childName.classList.contains("is-invalid"))
                    DOM.childName.classList.add("is-invalid");
            }
            else
                DOM.childName.classList.remove("is-invalid");
        });
        DOM.childName.addEventListener("change", () => {
            if (DOM.childName.value.length < 1) {
                DOM.childName.value = "el";
                DOM.childName.classList.remove("is-invalid");
            }
        });
        DOM.input.value = testHtml;
        DOM.convertBtn.click();
        for (let name in DOM) {
            //changing any settings other than #input and #output should result in the conversion being re-done
            if (name !== "input" && name !== "output")
                watch(DOM[name]);
        }
        function watch(el) {
            el.addEventListener("change", () => DOM.convertBtn.click());
        }
    });
    function parseHTML(markup) {
        let beginsWith = getFront(markup);
        if (beginsWith === "<!doct" || beginsWith === "<html>" || beginsWith === "<head>" || beginsWith === "<body>") {
            let doc = document.implementation.createHTMLDocument("");
            doc.documentElement.innerHTML = markup;
            return doc;
        }
        else if ('content' in document.createElement('template')) {
            // Template tag exists!
            let el = document.createElement('template');
            el.innerHTML = markup;
            return el.content;
        }
        else {
            // Template tag doesn't exist!
            let docfrag = document.createDocumentFragment();
            let el = document.createElement('body');
            el.innerHTML = markup;
            for (let i = 0; 0 < el.childNodes.length; i++) {
                docfrag.appendChild(el.childNodes[i]);
            }
            return docfrag;
        }
    }
    function getFront(markup) {
        // gets first 6 non-whitespace, non-comment characters
        let commentMode = 0;
        let nwspace = false;
        let out = 0;
        for (let i = 0; i < markup.length; i++) {
            let char = markup.charAt(i);
            if (nwspace || (char !== " " && char !== "\n" && char !== "\r" && char !== "\t" && char !== "\v" && char !== "\f")) {
                if (!nwspace) {
                    nwspace = true;
                    out = i;
                }
                if (commentMode === 0 && char === "<") {
                    commentMode = 1; // potential comment
                }
                else if (commentMode === 1) {
                    if (char === "!")
                        commentMode = 2; // almost assuredly a comment
                    else
                        commentMode = 0;
                }
                else if (commentMode === 2) {
                    if (char === "-")
                        commentMode = 3; //definitely a comment, we will ignore everything from here on
                    else
                        commentMode = 0;
                }
                else if (commentMode === 3 && char === ">") {
                    commentMode = 0; // comment ended, resume reading
                    nwspace = false;
                }
                if (commentMode !== 3 && i - out === 6)
                    return markup.substring(out, i).toLowerCase();
            }
        }
        return markup.substring(0, 6).toLowerCase();
    }
})(window, document);

},{"./htmlconverter":1}]},{},[2]);

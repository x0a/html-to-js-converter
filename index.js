(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
                + ' = document.createElement("' + el.tagName.toLowerCase() + '");');
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
                    this.createTree(child, !this.functional, childName, !this.functional ? 0 : (blockLevel ? blockLevel + 1 : 0))
                ];
            })
                .filter(child => {
                return child[1].length;
            })
                .map(child => {
                if (this.functional)
                    return [this.getPadding(blockLevel) + varName + ".appendChild(" + child[1] + ");"];
                else
                    return [child[1], varName + ".appendChild(" + child[0] + ");"];
            });
            if (children.length)
                children
                    .reduce((lines, line) => lines.concat(line))
                    .forEach(line => out.push(line));
            if (this.functional) {
                out.push(this.getPadding(blockLevel) + "return el;");
                out.push(this.getPadding(blockLevel - 1) + "})()" + (parent ? ";" : ""));
            }
        }
        else if (el.nodeType === Node.TEXT_NODE) {
            let text;
            if (!this.removeEmpty || (this.removeEmpty && (text = el.data.trim()) && text.length))
                out.push((!this.functional ? this.varString + " " + varName + " = " : "")
                    + "document.createTextNode("
                    + this.encapsulate(el.data)
                    + ")" + (parent ? ";" : ""));
        }
        return out.join(blockLevel || !this.functional ? "\n" : "");
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
            childName: document.querySelector("#childName"),
            childNameContainer: document.querySelector(".c-container")
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
                DOM.output.appendChild((() => {
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
        });
        DOM.input.addEventListener("keydown", function (event) {
            //allow use of tab key in html editor
            let key = event.keyCode || event.which || 0;
            let oldSelectionStart;
            let padding;
            if (key === 9 || key === 13) {
                event.preventDefault();
                oldSelectionStart = this.selectionStart;
                padding = ~~DOM.padding.value;
            }
            if (key === 9) {
                let padding = ~~DOM.padding.value;
                let add = padding < 1 ? "\t" : " ".repeat(padding);
                this.value = this.value.substring(0, this.selectionStart) + add + this.value.substring(this.selectionEnd);
                this.selectionEnd = oldSelectionStart + add.length;
            }
            else if (key === 13) {
                let lastLn = this.value.lastIndexOf("\n", oldSelectionStart - 1);
                let lastLine = this.value.substring(lastLn + 1, oldSelectionStart); //from selection, get last 
                let deWhiteSpace = lastLine.trim();
                let whiteSpaceEnd = deWhiteSpace.length ? lastLine.indexOf(deWhiteSpace) : undefined;
                let whiteSpace = lastLine.substring(0, whiteSpaceEnd);
                this.value = this.value.substring(0, oldSelectionStart) + "\n" + whiteSpace + this.value.substring(this.selectionEnd);
                this.selectionEnd = oldSelectionStart + whiteSpace.length + 1;
            }
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
            if (DOM.parentName.value.length < 1)
                DOM.parentName.value = "el";
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
        if ('content' in document.createElement('template')) {
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
            for (let i = 0; 0 < el.childNodes.length;) {
                docfrag.appendChild(el.childNodes[i]);
            }
            return docfrag;
        }
    }
})(window, document);

},{"./htmlconverter":1}]},{},[2]);
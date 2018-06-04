(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HTML2JS {
    static create(element, options) {
        //disabling ES6 should also disable template literals
        if (options.functional === undefined)
            options.functional = true;
        if (options.functional) {
            if (options.ES6)
                this.funcString = "(() => {";
            else
                this.funcString = "(function(){";
        }
        else {
            this.funcString = "";
        }
        if (options.ES6)
            this.varString = "let";
        else
            this.varString = "var";
        return this.createTree(element, options.isParent, "el", options.tabLevel, options.removeEmpty, options.templateLiterals, options.paddingType, options.functional);
    }
    static createTree(el, parent, varName, level, removeEmpty, templateLiterals, paddingType, functional) {
        let out = "";
        if (el.nodeType === Node.ELEMENT_NODE) {
            out += this.funcString;
            if (level && functional)
                out += this.addPadding(level, paddingType);
            out += this.varString + " " + varName + ` = document.createElement("` + el.tagName.toLowerCase() + `");`;
            if (level || !functional)
                out += this.addPadding(level, paddingType);
            if (el.hasAttributes && el.hasAttributes())
                for (let i = 0; i < el.attributes.length; i++) {
                    let attrib = el.attributes[i];
                    out += varName + '.setAttribute("' + attrib.name + '", ' + this.encapsulate(attrib.value, templateLiterals) + ');';
                    if (level || !functional)
                        out += this.addPadding(level, paddingType);
                }
            let children = el.childNodes;
            out += Array.from(children)
                .filter((child) => {
                return !(removeEmpty && child.nodeType === Node.TEXT_NODE && !child.data.trim().length);
            })
                .map((child, index) => {
                let childName = functional ? "el" : varName + "Child" + (index + 1);
                return [
                    childName,
                    this.createTree(child, !functional, childName, !functional ? 0 : (level ? level + 1 : 0), removeEmpty, templateLiterals, paddingType, functional)
                ];
            })
                .map((child, index) => {
                if (functional)
                    return varName + ".appendChild(" + child[1] + ");";
                else
                    return child[1] + this.addPadding(level, paddingType) + varName + ".appendChild(" + child[0] + ");";
            })
                .filter(child => child.length)
                .join(level || !functional ? this.addPadding(level, paddingType) : "");
            if (functional) {
                if (level)
                    out += this.addPadding(level, paddingType);
                out += "return el;";
                if (level)
                    out += this.addPadding(level - 1, paddingType);
                out += "})()" + (parent ? ";" : "");
            }
        }
        else if (el.nodeType === Node.TEXT_NODE) {
            if (!removeEmpty || removeEmpty && (el.data = el.data.trim()) && el.data.length !== 0)
                out += (!functional ? this.varString + " " + varName + " = " : "") + "document.createTextNode(" + this.encapsulate(el.data, templateLiterals) + ")" + (parent ? ";" : "");
        }
        return out;
    }
    static encapsulate(string, templateLiterals) {
        if (templateLiterals)
            return "`" + string + "`";
        else
            return JSON.stringify(string);
    }
    static addPadding(level, type) {
        let indent;
        let out = "";
        if (level) {
            if (type < 1)
                indent = "\t";
            else
                indent = " ".repeat(type);
            out = "\n" + indent.repeat(level);
        }
        else {
            out = "\n";
        }
        return out;
    }
    static numberToLetter(index) {
        return "";
    }
}
HTML2JS.funcString = "(() => {";
HTML2JS.varString = "let";
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
            ES6: document.querySelector("#ES6")
        };
        DOM.convertBtn.addEventListener("click", () => {
            let inputHtml = parseHTML(DOM.input.value);
            let removeEmpty = !!DOM.emptyNodes.checked;
            let beautify = !!DOM.beautify.checked;
            let templateLiterals = !!DOM.templateLiterals.checked;
            let padding = ~~DOM.padding.value;
            let functional = !!DOM.functional.checked;
            let ES6 = !!DOM.ES6.checked;
            while (DOM.output.lastChild) //remove all children from #outputs
                DOM.output.removeChild(DOM.output.lastChild);
            for (let child of inputHtml.childNodes) { //add new children
                let output, tree = htmlconverter_1.HTML2JS.create(child, { functional: functional, ES6: ES6, isParent: true, tabLevel: functional && beautify ? 1 : 0, removeEmpty: removeEmpty, templateLiterals: templateLiterals, paddingType: padding });
                if (removeEmpty && tree.length === 0)
                    continue;
                DOM.output.appendChild((() => {
                    let el = document.createElement("pre");
                    el.setAttribute("class", "jscontainer");
                    el.appendChild(output = (() => {
                        let el = document.createElement("code");
                        el.innerHTML = tree;
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
            if (DOM.functional.checked)
                DOM.beautifyContainer.classList.add("show");
            else
                DOM.beautifyContainer.classList.remove("show");
        });
        DOM.ES6.addEventListener("change", () => {
            if (DOM.templateLiterals.checked && !DOM.ES6.checked)
                DOM.templateLiterals.checked = false;
        });
        DOM.templateLiterals.addEventListener("change", () => {
            if (DOM.templateLiterals.checked && !DOM.ES6.checked)
                DOM.ES6.checked = true;
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

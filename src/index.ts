declare const hljs: any;
import { HTML2JS } from "./htmlconverter";

interface DOM {
    output: HTMLDivElement,
    input: HTMLTextAreaElement,
    convertBtn: HTMLButtonElement,
    emptyNodes: HTMLInputElement,
    beautify: HTMLInputElement,
    beautifyContainer: HTMLDivElement,
    templateLiterals: HTMLInputElement,
    padding: HTMLSelectElement,
    functional: HTMLSelectElement,
    ES6: HTMLSelectElement,
    parentName: HTMLInputElement,
    childName: HTMLInputElement,
    [key: string]: HTMLElement
}


(function (window: Window, document: Document, undefined?: any) {
    "use strict";

    let testHtml = `<ul id="fruits">
    <li class="apple">Apple</li>
    <li class="orange">Orange</li>
    <li class="pear">Pear</li>
</ul>`;

    document.addEventListener("DOMContentLoaded", () => {
        const DOM: DOM = {
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

            for (let child of <any>inputHtml.childNodes) { //add new children
                let output: HTMLElement,
                    tree = HTML2JS.create(child, {
                        functional: functional,
                        ES6: ES6,
                        isParent: true,
                        tabLevel: functional && beautify ? 1 : 0, //setting tab level to 1 automatically enables beautification
                        removeEmpty: removeEmpty,
                        templateLiterals: templateLiterals,
                        paddingType: padding,
                        childName: childName,
                        parentName: parentName
                    });
                if (removeEmpty && tree.length === 0) continue;

                fragment.appendChild((() => {
                    let el = document.createElement("pre");
                    el.setAttribute("class", "jscontainer");
                    el.appendChild(output = (() => {
                        let el = document.createElement("code");
                        el.textContent = tree
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
                        })
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
            } else return;

            if (key === 9) {
                let padding = ~~DOM.padding.value;
                add = padding < 1 ? "\t" : " ".repeat(padding);
            } else if (key === 13) {
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
                if (DOM.childName.value !== "el") DOM.childName.value = "el";
            } else {
                DOM.beautifyContainer.classList.remove("show");
                if (DOM.childName.value === "el") DOM.childName.value = "Ch";
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
                    DOM.parentName.classList.add("is-invalid")
            } else
                DOM.parentName.classList.remove("is-invalid")
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
                    DOM.childName.classList.add("is-invalid")
            } else
                DOM.childName.classList.remove("is-invalid")
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

        function watch(el: HTMLElement): void {
            el.addEventListener("change", () => DOM.convertBtn.click())
        }
    })

    function parseHTML(markup: string): DocumentFragment {
        let beginsWith = getFront(markup);

        if (beginsWith === "<!doct" || beginsWith === "<html>" || beginsWith === "<head>" || beginsWith === "<body>") {
            let doc = document.implementation.createHTMLDocument("");
            doc.documentElement.innerHTML = markup;
            return doc;
        } else if ('content' in document.createElement('template')) {
            // Template tag exists!
            let el = document.createElement('template');
            el.innerHTML = markup;
            return el.content;
        } else {
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
    function getFront(markup: string): string{
        // gets first 6 non-whitespace, non-comment characters
        let commentMode = 0;
        let nwspace = false;
        let out = 0;

        for(let i = 0; i < markup.length; i++){
            let char = markup.charAt(i);

            if(nwspace || (char !== " " && char !== "\n" && char !== "\r" && char !== "\t" && char !== "\v" && char !== "\f")){
                if(!nwspace){
                    nwspace = true;
                    out = i;
                }

                if(commentMode === 0 && char === "<"){
                    commentMode = 1; // potential comment
                }else if(commentMode === 1){
                    if(char === "!")
                        commentMode = 2; // almost assuredly a comment
                    else 
                        commentMode = 0;
                }else if(commentMode === 2){
                    if(char === "-")
                        commentMode = 3; //definitely a comment, we will ignore everything from here on
                    else
                        commentMode = 0;
                }else if(commentMode === 3 && char === ">"){
                    commentMode = 0; // comment ended, resume reading
                    nwspace = false;
                }

                if(commentMode !== 3 && i - out === 6)
                    return markup.substring(out, i).toLowerCase();
            }
        }
        return markup.substring(0, 6).toLowerCase();
    }
})(window, document)
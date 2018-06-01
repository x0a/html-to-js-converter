(function (window, document, undefined) {
    var testHtml = "<ul id=\"fruits\">\n    <li class=\"apple\">Apple</li>\n    <li class=\"orange\">Orange</li>\n    <li class=\"pear\">Pear</li>\n</ul>";
    document.addEventListener("DOMContentLoaded", function () {
        var DOM = {
            output: document.querySelector("#outputs"),
            input: document.querySelector("#input"),
            convertBtn: document.querySelector("#convertBtn"),
            emptyNodes: document.querySelector("#emptyNodes"),
            beautify: document.querySelector("#beautify"),
            templateLiterals: document.querySelector("#templateLiterals"),
            padding: document.querySelector("#padding")
        };
        DOM.convertBtn.addEventListener("click", function () {
            var inputHtml = parseHTML(DOM.input.value);
            var removeEmpty = !!DOM.emptyNodes.checked;
            var beautify = !!DOM.beautify.checked;
            var templateLiterals = !!DOM.templateLiterals.checked;
            var padding = ~~DOM.padding.value;
            while (DOM.output.lastChild) //remove all children from #outputs
                DOM.output.removeChild(DOM.output.lastChild);
            var _loop_1 = function (child) {
                var output, tree = createTree(child, true, beautify ? 1 : 0, removeEmpty, templateLiterals, padding);
                if (removeEmpty && tree.length === 0)
                    return "continue";
                DOM.output.appendChild((function () {
                    var el = document.createElement("pre");
                    el.setAttribute("class", "jscontainer");
                    el.appendChild(output = (function () {
                        var el = document.createElement("code");
                        el.innerHTML = tree;
                        el.setAttribute("class", "javascript");
                        return el;
                    })());
                    el.appendChild((function () {
                        var el = document.createElement("button");
                        el.setAttribute("class", "btn btn-secondary btn-sm jscopy");
                        el.setAttribute("type", "button");
                        el.addEventListener("click", function () {
                            var selection = window.getSelection();
                            var range = document.createRange();
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
            };
            for (var _i = 0, _a = inputHtml.childNodes; _i < _a.length; _i++) {
                var child = _a[_i];
                _loop_1(child);
            }
        });
        DOM.input.addEventListener("keydown", function (event) {
            //allow use of tab key in html editor
            if (event.keyCode === 9 || event.which === 9) {
                event.preventDefault();
                var oldSelectionStart = this.selectionStart;
                var padding = ~~DOM.padding.value;
                var add = padding < 1 ? "\t" : " ".repeat(padding);
                this.value = this.value.substring(0, this.selectionStart) + add + this.value.substring(this.selectionEnd);
                this.selectionEnd = oldSelectionStart + add.length;
            }
        });
        DOM.beautify.addEventListener("change", function () {
            //show padding selector
            if (DOM.beautify.checked)
                DOM.padding.classList.add("show");
            else
                DOM.padding.classList.remove("show");
        });
        DOM.input.value = testHtml;
        DOM.convertBtn.click();
        for (var name_1 in DOM) {
            //changing any settings other than #input and #output should result in the conversion being re-done
            if (name_1 !== "input" && name_1 !== "output")
                watch(DOM[name_1]);
        }
        function watch(el) {
            el.addEventListener("change", function () { return DOM.convertBtn.click(); });
        }
    });
    function createTree(el, parent, level, removeEmpty, templateLiterals, paddingType) {
        var out = "";
        if (el.nodeType === Node.ELEMENT_NODE) {
            out += "(() => {";
            if (level)
                out += addPadding(level, paddingType);
            out += "let el = document.createElement(\"" + el.tagName.toLowerCase() + "\");";
            if (level)
                out += addPadding(level, paddingType);
            if (el.hasAttributes && el.hasAttributes())
                for (var i = el.attributes.length - 1; i >= 0; i--) {
                    var attrib = el.attributes[i];
                    out += 'el.setAttribute("' + attrib.name + '", ' + encapsulate(attrib.value, templateLiterals) + ');';
                    if (level)
                        out += addPadding(level, paddingType);
                }
            var children = el.childNodes;
            if (children && children.length) {
                for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                    var child = children_1[_i];
                    var t = createTree(child, false, (level ? level + 1 : 0), removeEmpty, templateLiterals, paddingType);
                    if (t) {
                        out += "el.appendChild(" + t + ");";
                        if (level)
                            out += addPadding(level, paddingType);
                    }
                }
            }
            out += "return el;";
            if (level)
                out += addPadding(level - 1, paddingType);
            out += "})()" + (parent ? ";" : "");
        }
        else if (el.nodeType === Node.TEXT_NODE) {
            if (!removeEmpty || removeEmpty && (el.data = el.data.trim()) && el.data.length !== 0)
                out += "document.createTextNode(" + encapsulate(el.data, templateLiterals) + ")" + (parent ? ";" : "");
        }
        return out;
    }
    function encapsulate(string, templateLiterals) {
        if (templateLiterals)
            return "`" + string + "`";
        else
            return JSON.stringify(string);
    }
    function addPadding(level, type) {
        var indent;
        var out = "";
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
    function parseHTML(markup) {
        if ('content' in document.createElement('template')) {
            // Template tag exists!
            var el = document.createElement('template');
            el.innerHTML = markup;
            return el.content;
        }
        else {
            // Template tag doesn't exist!
            var docfrag = document.createDocumentFragment();
            var el = document.createElement('body');
            el.innerHTML = markup;
            for (var i = 0; 0 < el.childNodes.length;) {
                docfrag.appendChild(el.childNodes[i]);
            }
            return docfrag;
        }
    }
})(window, document);

(function (window, document, undefined) {
    var testHtml = "<ul id=\"fruits\">\n\t<li class=\"apple\">Apple</li>\n\t<li class=\"orange\">Orange</li>\n\t<li class=\"pear\">Pear</li>\n</ul>";
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
        DOM.input.value = testHtml;
        DOM.convertBtn.addEventListener("click", function () {
            var inputHtml = parseHTML(DOM.input.value);
            var removeEmpty = !!DOM.emptyNodes.checked;
            var beautify = !!DOM.beautify.checked;
            var templateLiterals = !!DOM.templateLiterals.checked;
            var padding = ~~DOM.padding.value;
            while (DOM.output.lastChild)
                DOM.output.removeChild(DOM.output.lastChild);
            var _loop_1 = function (child) {
                var output;
                DOM.output.appendChild((function () {
                    var el = document.createElement("pre");
                    el.appendChild(output = (function () {
                        var el = document.createElement("code");
                        el.innerHTML = createTree(child, null, beautify ? 1 : 0, removeEmpty, templateLiterals, padding);
                        el.setAttribute("class", "javascript");
                        return el;
                    })());
                    return el;
                })());
                hljs.highlightBlock(output);
            };
            for (var _i = 0, _a = inputHtml.childNodes; _i < _a.length; _i++) {
                var child = _a[_i];
                _loop_1(child);
            }
        });
        DOM.input.addEventListener("keydown", function (event) {
            if (event.keyCode == 9 || event.which == 9) {
                event.preventDefault();
                var s = this.selectionStart;
                this.value = this.value.substring(0, this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
                this.selectionEnd = s + 1;
            }
        });
        DOM.beautify.addEventListener("change", function () {
            if (DOM.beautify.checked)
                DOM.padding.classList.add("show");
            else
                DOM.padding.classList.remove("show");
        });
        DOM.convertBtn.click();
        for (var name_1 in DOM) {
            if (name_1 !== "input" && name_1 != "output") {
                watch(DOM[name_1]);
            }
        }
        function watch(el) {
            el.addEventListener("change", function () {
                DOM.convertBtn.click();
            });
        }
    });
    function createTree(el, child, level, removeEmpty, templateLiterals, paddingType) {
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
                    var child_1 = children_1[_i];
                    var t = createTree(child_1, true, (level ? level + 1 : 0), removeEmpty, templateLiterals, paddingType);
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
            out += "})()" + (child ? "" : ";");
        }
        else if (el.nodeType === Node.TEXT_NODE) {
            if (!removeEmpty || removeEmpty && (el.data = el.data.trim()) && el.data.length !== 0)
                out += "document.createTextNode(" + encapsulate(el.data, templateLiterals) + ")" + (child ? "" : ";");
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

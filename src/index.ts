declare const hljs:any;

interface DOM{
	output: HTMLDivElement,
	input: HTMLTextAreaElement,
	convertBtn: HTMLButtonElement,
	emptyNodes: HTMLInputElement,
	beautify: HTMLInputElement,
	templateLiterals: HTMLInputElement,
	padding: HTMLSelectElement,
	[key: string]: HTMLElement
}

(function(window: Window, document: Document, undefined?:any){

	let testHtml = `<ul id="fruits">
	<li class="apple">Apple</li>
	<li class="orange">Orange</li>
	<li class="pear">Pear</li>
</ul>`;

	document.addEventListener("DOMContentLoaded", () => {
		const DOM:DOM = {
			output: document.querySelector("#outputs"),
			input: document.querySelector("#input"),
			convertBtn: document.querySelector("#convertBtn"),
			emptyNodes: document.querySelector("#emptyNodes"),
			beautify: document.querySelector("#beautify"),
			templateLiterals: document.querySelector("#templateLiterals"),
			padding: document.querySelector("#padding")
		}
		
		DOM.input.value = testHtml;

		DOM.convertBtn.addEventListener("click", () => {
			let inputHtml = parseHTML(DOM.input.value);
			let removeEmpty = !!DOM.emptyNodes.checked;
			let beautify = !!DOM.beautify.checked;
			let templateLiterals = !!DOM.templateLiterals.checked;
			let padding = ~~DOM.padding.value;

			while(DOM.output.lastChild)
				DOM.output.removeChild(DOM.output.lastChild);
	
			for(let child of <any>inputHtml.childNodes){
				let output:HTMLElement, tree = createTree(child, null, beautify ? 1 : 0, removeEmpty, templateLiterals, padding);

				if(removeEmpty && tree.length === 0) continue;

				DOM.output.appendChild((() => {
					let el = document.createElement("pre");
					el.setAttribute("class", "jscontainer");
					el.appendChild(output = (() => {
						let el = document.createElement("code");
						el.innerHTML = tree
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
	
				hljs.highlightBlock(output);
			}
			
		})

		DOM.input.addEventListener("keydown", function(event){
			if(event.keyCode == 9 || event.which == 9){
				event.preventDefault();
				let s = this.selectionStart;
				this.value = this.value.substring(0, this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
				this.selectionEnd = s + 1; 
			}
		})

		DOM.beautify.addEventListener("change", () => {
			if(DOM.beautify.checked)
				DOM.padding.classList.add("show");
			else
				DOM.padding.classList.remove("show");
		})

		DOM.convertBtn.click();

		for(let name in DOM){
			if(name !== "input" && name != "output"){
				watch(DOM[name]);
			}
		}

		function watch(el: HTMLElement){
			el.addEventListener("change", () => {
				DOM.convertBtn.click();
			})
		}
	})

	function createTree(el: any, child: boolean, level: number, removeEmpty: boolean, templateLiterals: boolean, paddingType: number){
		let out = "";
		if(el.nodeType === Node.ELEMENT_NODE){
			out += `(() => {`

			if(level)
				out += addPadding(level, paddingType);

			out += `let el = document.createElement("`+ el.tagName.toLowerCase() + `");`;

			if(level)
				out += addPadding(level, paddingType)
		
			if(el.hasAttributes && el.hasAttributes())
				for(let i = el.attributes.length - 1; i >= 0; i--) {
					let attrib = el.attributes[i];
					out += 'el.setAttribute("' + attrib.name + '", ' + encapsulate(attrib.value, templateLiterals) + ');';
					if(level)
					out += addPadding(level, paddingType)
				}
		
			let children = el.childNodes

			if(children && children.length){
				for(let child of children){

					let t = createTree(child, true, (level ? level + 1 : 0), removeEmpty, templateLiterals, paddingType);

					if(t){
						out += `el.appendChild(` + t + `);`;
						if(level)
							out += addPadding(level, paddingType)
					}
				}
			}

			out += "return el;"
			if(level)
				out += addPadding(level - 1, paddingType)
			out += "})()" + (child ? "" : ";");
		}else if(el.nodeType === Node.TEXT_NODE){
			if(!removeEmpty || removeEmpty && (el.data = el.data.trim()) && el.data.length !== 0)
				out += "document.createTextNode(" + encapsulate(el.data, templateLiterals) + ")" + (child ? "" : ";");
		}
		return out;
	}

	function encapsulate(string: string, templateLiterals: boolean){
		if(templateLiterals)
			return "`" + string + "`";
		else
			return JSON.stringify(string);
		
	}

	function addPadding(level: number, type: number){
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

	function parseHTML(markup: string): DocumentFragment {
		if ('content' in document.createElement('template')) {
			// Template tag exists!
			let el = document.createElement('template');
			el.innerHTML = markup;
			return el.content;
		} else {
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
})(window, document)
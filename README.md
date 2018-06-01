# Working demo at https://x0a.github.io/html-to-js-converter/


Converts HTML to ES6-compatible functional javascript.

Sample input:
```html
<nav class="navbar navbar-light bg-light">
  <span class="navbar-text">
    Navbar text with an inline element
  </span>
</nav>
```

Produces sample output:

```js
(() => {
    let el = document.createElement("nav");
    el.setAttribute("class", "navbar navbar-light bg-light");
    el.appendChild((() => {
        let el = document.createElement("span");
        el.setAttribute("class", "navbar-text");
        el.appendChild(document.createTextNode("Navbar text with an inline element"));
        return el;
    })());
    return el;
})();
```
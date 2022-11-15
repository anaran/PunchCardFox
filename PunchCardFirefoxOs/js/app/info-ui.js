'use strict';

export class InfoUI extends HTMLElement {
  constructor() {
    try {
      // Trying to extent HTMLPreElement I get:
      // VM1330:1 Uncaught TypeError: Illegal constructor
      // In Brave Browser on 2022/09/25 12:20:58:
      // "Illegal constructor: autonomous custom elements must extend HTMLElement"
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = `
<pre></pre>
<style>
pre {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

pre.selected {
  overflow: visible;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
`;
      this.pre = this.shadow.querySelector('pre');
    }
    catch (e) {
      window.alert(JSON.stringify(e, null, 2));
    }
  }
  connectedCallback() {
    try {
      this.pre.addEventListener('click', event => {
        if (event.target.classList.contains('selected')) {
          event.target.classList.remove('selected');
        }
        else {
          event.target.classList.add('selected');
          // Too invasive. Todo: Add way to select all via button or similar.
          // window.getSelection().selectAllChildren(event.target);
        }
        this.pre.contentEditable = false;
        // let s = window.getSelection();
        // s.selectAllChildren(event.target);
      });
    }
    catch (e) {
      window.alert(JSON.stringify(e, null, 2));
    }
  }
  static get observedAttributes() {
    return [
      'class',
    ];
  }
  attributeChangedCallback(name, oldValue, newValue, namespace) {
    try {
      this.pre.setAttribute(name, newValue);
    }
    catch (e) {
      window.alert(JSON.stringify(e, null, 2));
    }
  }
  get textContent() {
    try {
      return this.pre.textContent;
    }
    catch (e) {
      window.alert(JSON.stringify(e, null, 2));
    }
  }
  set textContent(newContent) {
    this.pre.textContent = newContent;
  }
}

if (!customElements.get('info-ui')) {
  customElements.define('info-ui', InfoUI);
}

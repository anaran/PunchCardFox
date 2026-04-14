'use strict';

import * as infojs from './info.js';

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

  .error {
      background-color: red;
      color: white;
  }

  :host-context(.dark_theme) .error {
      background-color: orangered;
      color: white;
  }

  .warning {
      background-color: orange;
      color: white;
  }

  :host-context(.dark_theme) .warning {
      background-color: darkorange;
      color: white;
  }

  .orientation {
      background-color: lightgreen;
  }

  :host-context(.dark_theme) .orientation {
      background-color: darkgreen;
      color: white;
  }

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
      infojs.error(e);
    }
  }
  connectedCallback() {
    try {
      this.pre.addEventListener('click', event => {
        event.preventDefault();
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
      infojs.error(e);
    }
  }
  static get observedAttributes() {
    return [
      'class',
    ];
  }
  attributeChangedCallback(name, oldValue, newValue, namespace) {
    try {
      infojs.info(`attribute ${name} changed from ${oldValue} to ${newValue}`);
      this.pre.setAttribute(name, newValue);
    }
    catch (e) {
      infojs.error(e);
    }
  }
  get textContent() {
    try {
      return this.pre.textContent;
    }
    catch (e) {
      infojs.error(e);
    }
  }
  set textContent(newContent) {
    this.pre.textContent = newContent;
  }
}

if (!customElements.get('info-ui')) {
  customElements.define('info-ui', InfoUI);
}

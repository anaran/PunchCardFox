'use strict';

import { infojs } from './info.js';

class InputUI extends HTMLElement {
  constructor() {
    try {
      // Trying to extent HTMLPreElement I get:
      // VM1330:1 Uncaught TypeError: Illegal constructor
      super();
      // this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow = this;
      this.shadow.innerHTML = `
        <input>
        <span>&times;</span>
        <style>
        input:invalid {
          border-color: red;
        }
      input + span {
        margin-left: -1em;
        font-size: large;
      }
      input.empty + span {
        display: none;
      }
      </style>
        <!--
      input:focus + span {
        margin-left: -1em;
        display: inline;
      }
      -->
        `;
      this.erase = this.shadow.querySelector('span');
      this.inp = this.shadow.querySelector('input');
    }
    catch (e) {
      infojs(e, document.body, "append");
    }
  }
  connectedCallback() {
    try {
      // this.erase.addEventListener('input', event => {
      //   // console.log(event.type, event, event.target, event.currentTarget);
      //   console.log(event.type, event.eventPhase, `${event.target.localName}#${event.target.id}.${event.target.className}`, event.target.value);
      //   console.log(event.data, event.dataTransfer, event.inputType, event.isComposing);
      //   if (event.isComposing) {
      //     event.stopPropagation();
      //     event.preventDefault();
      //   }
      // }, true);
      // this.erase.addEventListener('input', event => {
      //   console.log(event.type, event.eventPhase, `${event.target.localName}#${event.target.id}.${event.target.className}`, event.target.value);
      //   console.log(event.data, event.dataTransfer, event.inputType, event.isComposing);
      //   if (event.isComposing) {
      //     event.stopPropagation();
      //     event.preventDefault();
      //   }
      // }, false);

      // this.addEventListener('input', event => {
      //   console.log(event.type, event);
      //   // event.stopPropagation();
      //   // event.preventDefault();
      // }, true);
      this.inp.addEventListener('input', event => {
        event.preventDefault();
        event.stopPropagation();
        console.log(event.type, event.eventPhase, event);
        this.setAttribute('value', event.target.value);
      }, true);
      // this.inp.addEventListener('input', event => {
      //   console.log(event.type, event);
      //   event.stopPropagation();
      //   event.preventDefault();
      // }, true);
      // this.inp.addEventListener('input', event => {
      //   console.log(event.type, event);
      //   event.stopPropagation();
      //   event.preventDefault();
      // }, false);
      this.erase.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        // console.log(event, this);
        if (this.inp && this.inp.value) {
          this.value = '';
          this.setAttribute('value', '');
          let changeEvent = new Event("change", {"bubbles":true, "cancelable":false});
          this.inp.dispatchEvent(changeEvent);
        }
        this.inp.focus();
      }, true);
      // this.SpanElement.addEventListener('click', event => {
      //   console.log(event, this);
      //   if (this.InputElement && this.InputElement.value) {
      //     this.InputElement.value = '';
      //   }
      // });
    }
    catch (e) {
      infojs(e, document.body, "append");
    }
  }
  static get observedAttributes() {
    return [
      'autofocus',
      'class',
      'id',
      'pattern',
      'persistent',
      'placeholder',
      'required',
      'type',
      'value'
    ];
  }
  attributeChangedCallback(name, oldValue, newValue, namespace) {
    try {
      // this.inp = this.shadow.querySelector('input');
      // this.setAttribute(name, newValue);
      this.inp.setAttribute(name, newValue);
      if (name == 'value') {
        if (newValue == '') {
          this.inp.classList.add('empty');
        }
        else {
          this.inp.classList.remove('empty');
        }
      }
      // switch (name) {
      // case 'type': {
      //   break;
      // }
      // default: {
      //   console.error(`unknown attribute ${name}, NS: ${namespace} for element ${this}`);
      // }
      // }
    }
    catch (e) {
      infojs(e, document.body, "append");
    }
  }
  get type() {
    try {
      return this.inp.getAttribute('type');
    }
    catch (e) {
      infojs(e, document.body, "append");
    }
  }
  set type(newType) {
    this.inp.type = newType;
    this.inp.setAttribute('type', newType);
  }
  get value() {
    try {
      return this.inp.value;
    }
    catch (e) {
      infojs(e, document.body, "append");
    }
  }
  set value(newValue) {
    try {
      this.setAttribute('value', newValue);
      this.inp.value = newValue;
    }
    catch (e) {
      infojs(e, document.body, "append");
    }
  }
  addEventListener(...args) {
    try {
      this.inp.addEventListener(...args);
    }
    catch (e) {
      infojs(e, document.body, "append");
    }
  }
  blur() {
    this.inp.blur();
  }
  focus() {
    this.inp.focus();
  }
}

if (!customElements.get('input-ui')) {
  customElements.define('input-ui', InputUI);
}

export default {
  InputUI
};

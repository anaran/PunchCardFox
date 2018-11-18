'use strict';

import { infojs } from './info.js';

class InputUI extends HTMLElement {
  constructor() {
    try {
      // Trying to extent HTMLPreElement I get:
      // VM1330:1 Uncaught TypeError: Illegal constructor
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      // this.shadow = this;
this.shadow.innerHTML = `
<span class="top">
<input/>
<span class="undo">&#x238c;</span>
<span class="erase">&times;</span>
</span>
<style>
span.top {
  border: solid grey 1px;
}
input {
  border: hidden;
}
input:invalid {
  background: lightpink;
}
span.erase {
  border: hidden;
}
span.undo {
  border: hidden;
}
input.empty ~ span.erase {
  opacity: 0.3;
}
input:not(.empty) ~ span.undo {
  display: none;
}
span.undo:not(.undoable) {
  display: none;
}
input.empty + span.undo.undoable + span.erase {
  display: none;
}
</style>
`;
      this.erase = this.shadow.querySelector('span.erase');
      this.undo = this.shadow.querySelector('span.undo');
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
        // event.preventDefault();
        // event.stopPropagation();
        // console.log(event, this);
        this.inp.click();
        if (this.inp && this.inp.value.length) {
          this.undoValue = this.inp.value;
          this.undo.classList.add('undoable');
          this.value = '';
          this.setAttribute('value', '');
          let changeEvent = new Event("change", {"bubbles":true, "cancelable":false});
          this.inp.dispatchEvent(changeEvent);
        }
        this.inp.focus();
      }, true);
      this.undo.addEventListener('click', event => {
        // event.preventDefault();
        // event.stopPropagation();
        // console.log(event, this);
        this.inp.click();
        if (this.inp && !this.inp.value.length) {
          this.inp.value = this.undoValue;
          // Same undoValue can be used again when users empties value via keyboard.
          // this.undo.classList.remove('undoable');
          this.value = this.undoValue;
          this.setAttribute('value', this.undoValue);
          let changeEvent = new Event("change", {"bubbles":true, "cancelable":false});
          this.inp.dispatchEvent(changeEvent);
        }
        this.inp.focus();
      }, true);
      if (!this.inp.value.length) {
        this.inp.classList.add('empty');
      }
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
  click() {
    this.inp.click();
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

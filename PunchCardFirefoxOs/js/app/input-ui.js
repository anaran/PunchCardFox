'use strict';

import * as infojs from './info.js';

const LOG = false;

export class InputUI extends HTMLElement {
  constructor() {
    try {
      // Trying to extent HTMLPreElement I get:
      // VM1330:1 Uncaught TypeError: Illegal constructor
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = `
<input class="val"/>
<input type="button" class="undo" value="&#x238c;"/>
<input type="button" class="erase" value="&Cross;"/>
<style>

:host {
    background-color: inherit;
    color: inherit;
    font-size: inherit;
}

input {
  font-size: inherit;
}

input.val {
  background-color: inherit;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  padding-inline-end: 1rem;
  width: inherit;
}

input.erase, input.undo {
  color: inherit;
  padding: 0;
  border: 0;
  margin-inline-start: -1.5rem;
  margin-inline-end: 1rem;
  background-color: transparent;
  width: 1rem;
}

input:invalid {
  background-color: lightpink;
}

input.empty ~ input.erase {
  opacity: 0.3;
}

input:not(.empty) ~ input.undo {
  display: none;
}

input.undo:not(.undoable) {
  display: none;
}

input.empty + input.undo.undoable + input.erase {
  display: none;
}

</style>
`;
      this.erase = this.shadow.querySelector('input.erase');
      this.undo = this.shadow.querySelector('input.undo');
      this.inp = this.shadow.querySelector('input.val');
    }
    catch (err) {
      infojs.error(err, document.body, "append");
    }
  }
  connectedCallback() {
    try {
      this.inp.addEventListener('input', event => {
        // Don't block listeners added by user of this web component.
        // event.preventDefault();
        // event.stopPropagation();
        LOG && console.log(event.type, event.eventPhase, event);
        this.setAttribute('value', event.target.value);
      }, true);
      this.erase.addEventListener('click', event => {
        // event.preventDefault();
        // event.stopPropagation();
        // LOG && console.log(event, this);
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
        // LOG && console.log(event, this);
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
    }
    catch (err) {
      infojs.error(err, document.body, "append");
    }
  }
  static get observedAttributes() {
    return [
      'autofocus',
      'checked',
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
      if (name != 'class') {
        this.inp.setAttribute(name, newValue);
      }
      if (name == 'value') {
        if (newValue == '') {
          this.inp.classList.add('empty');
        }
        else {
          this.inp.classList.remove('empty');
        }
      }
    }
    catch (err) {
      infojs.error(err, document.body, "append");
    }
  }
  get type() {
    try {
      return this.inp.getAttribute('type');
    }
    catch (err) {
      infojs.error(err, document.body, "append");
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
    catch (err) {
      infojs.error(err, document.body, "append");
    }
  }
  set value(newValue) {
    try {
      this.setAttribute('value', newValue);
      this.inp.value = newValue;
    }
    catch (err) {
      infojs.error(err, document.body, "append");
    }
  }
  get valueAsDate() {
    try {
      return this.inp.valueAsDate;
    }
    catch (err) {
      infojs.error(err, document.body, "append");
    }
  }
  addEventListener(...args) {
    try {
      this.inp.addEventListener(...args);
    }
    catch (err) {
      infojs.error(err, document.body, "append");
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

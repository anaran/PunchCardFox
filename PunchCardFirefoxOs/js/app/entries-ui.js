'use strict';

import * as infojs from './info.js';

export class EntriesUI extends HTMLElement {
  constructor(id, update_function) {
    try {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = `
<div class="entries_header">
  <a class="add">&plus;</a>
  <a class="close">&Cross;</a>
  <a class="update">&circlearrowright;</a>
  <a class="stop">&Omega;</a>
  <span class="info">result header</span>
</div>
<slot></slot>
<style>

 
:host(.updating) {
    background-color: lightgrey;
}

/*
Firefox does not implement :host-context()
See
https://developer.mozilla.org/en-US/docs/Web/CSS/:host-context
*/
:host-context(.dark_theme):host(.updating) {
    background-color: dimgrey;
}

div.entries_header {
    background-color: inherit;
}

div.entries_header a {
    padding: 0.5rem;
}

</style>
`;
      this.id = id;
      this.update_function = update_function;
    }
    catch (e) {
      infojs.error(e);
    }
  }
  connectedCallback() {
    try {
      this.stop_query = false;
      this.span_info = this.shadow.querySelector('span.info');
      this.a_close = this.shadow.querySelector('a.close');
      this.a_update = this.shadow.querySelector('a.update');
      this.a_stop = this.shadow.querySelector('a.stop');
      // Use arrow function to preserve this value of the enclosing
      // execution context.
      this.a_update.addEventListener('click', (event) => {
        event.preventDefault();
        alert('rerun query is not implemented yet. \u221E');
      });
      // Use arrow function to preserve this value of the enclosing
      // execution context.
      this.a_close.addEventListener('click', (event) => {
        event.preventDefault();
        this.parentElement.removeChild(this);
        this.update_function();
      });
      // Use arrow function to preserve this value of the enclosing
      // execution context.
      this.a_stop.addEventListener('click', (event) => {
        event.preventDefault();
        this.stop_query = true;
      });
      this.update_function();
    }
    catch (e) {
      infojs.error(e);
    }
  }
  static get observedAttributes() {
    return [
      'class',
      'id', // COUCHDB DOC ID(_REVISION)?
      'linked'
    ];
  }
  attributeChangedCallback(name, oldValue, newValue, namespace) {
    // try {
    // }
    // catch (e) {
    //   infojs.error(e);
    // }
  }
  get info() {
    try {
      return this.span_info.textContent;
    }
    catch (e) {
      infojs.error(e);
    }
  }
  set info(text) {
    try {
      this.span_info.textContent = text;
    }
    catch (e) {
      infojs.error(e);
    }
  }
  // get update() {
  //   try {
  //     return this.a_update;
  //   }
  //   catch (e) {
  //     infojs.error(e);
  //   }
  // }
  // get close() {
  //   try {
  //     return this.a_close;
  //   }
  //   catch (e) {
  //     infojs.error(e);
  //   }
  // }
  get stop() {
    try {
      return this.stop_query;
    }
    catch (e) {
      infojs.error(e);
    }
  }
}

if (!customElements.get('entries-ui')) {
  customElements.define('entries-ui', EntriesUI);
}

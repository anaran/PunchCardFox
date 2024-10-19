'use strict';

import * as infojs from './info.js';
import * as appjs from './app.js';

export class EntriesUI extends HTMLElement {
  constructor(id, update_function) {
    try {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = `
<input type="checkbox" id="cb1" class="cb1" checked><label for="cb1">
<div class="entries_header">
  <a class="add">&plus;</a>
  <a class="close">&Cross;</a>
  <a class="update">&circlearrowright;</a>
  <a class="stop">&Omega;</a>
  <span class="info">result header</span>
</div>
  </label>
<slot></slot>
<style>
@import url(css/section_expander.css);

/* Override top offset of section_expander.css, since entries are not */
/* top-level sections. */
.cb1 + label > * {
    top: 0;
}

slot {
  overflow: scroll;
  scrollbar-width: none;
}

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

:host(:target) .entries_header {
    border: 0.2rem dashed;
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
        try {
          event.preventDefault();
          // alert('rerun query is not implemented yet. \u221E');
          const options = JSON.parse(this.dataset.query);
          options.rerun = this.id;
          infojs.warn(`runQuery(${options})`);
          const element = document.getElementById("idOfParent");
          while (this.firstChild) {
            this.removeChild(this.firstChild);
          }
          appjs.runQuery(options);
        }
        catch (e) {
          infojs.error(e);
        }
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
      let stop = this.stop_query;
      // Clear on read. Could create race condition with a_stop click listener
      this.stop_query = false;
      return stop;
    }
    catch (e) {
      infojs.error(e);
    }
  }
}

if (!customElements.get('entries-ui')) {
  customElements.define('entries-ui', EntriesUI);
}

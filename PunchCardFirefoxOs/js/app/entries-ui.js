'use strict';

import * as infojs from './info.js';
import * as appjs from './app.js';

export class EntriesUI extends HTMLElement {
  constructor(id, update_function) {
    try {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = `
<input type="checkbox" id="cb1" class="cb1" checked>
<label for="cb1">
  <div class="entries_header">
  <span class="first">&top;</span>
  <span class="last">&bottom;</span>
  <button class="close">&Cross;</button>
  <button class="update">&circlearrowright;</button>
  <button class="stop">&Omega;</button>
  <span class="info">result header</span>
  </div>
</label>
<slot></slot>
<style>
@import url(css/section_expander.css);

/* Override top offset of section_expander.css, since entries are not */
/* top-level sections. */
.cb1:checked + label > * {
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
      this.button_close = this.shadow.querySelector('button.close');
      this.button_update = this.shadow.querySelector('button.update');
      this.button_stop = this.shadow.querySelector('button.stop');
      let first_entry = this.shadow.querySelector('div.entries_header>.first');
      let last_entry = this.shadow.querySelector('div.entries_header>.last');
      first_entry.addEventListener('click', (event) => {
        event.preventDefault();
        this.firstElementChild.scrollIntoView({block: "center", inline: "center"});
      });
      last_entry.addEventListener('click', (event) => {
        event.preventDefault();
        this.lastElementChild.scrollIntoView({block: "center", inline: "center"});
      });
      this.button_update.setAttribute('disabled', '');
      this.button_stop.setAttribute('disabled', '');
      // Use arrow function to preserve this value of the enclosing
      // execution context.
      this.button_close.addEventListener('click', (event) => {
        event.preventDefault();
        this.parentElement.removeChild(this);
        this.update_function();
      });
    }
    catch (e) {
      infojs.error(e);
    }
  }
  static get observedAttributes() {
    return [
      'class',
      'data-query',
      'id', // COUCHDB DOC ID(_REVISION)?
      'linked'
    ];
  }
  attributeChangedCallback(name, oldValue, newValue, namespace) {
    try {
      infojs.info(`attribute ${name} changed from ${oldValue} to ${newValue}`);
      if (name == 'data-query' && !oldValue) {
        this.button_update.removeAttribute('disabled');
        this.button_stop.removeAttribute('disabled');
        // Use arrow function to preserve this value of the enclosing
        // execution context.
        this.button_update.addEventListener('click', (event) => {
          try {
            event.preventDefault();
            const options = JSON.parse(this.dataset.query);
            options.rerun = this.id;
            infojs.info(`rerun runQuery(${JSON.stringify(options, null, 2)})`);
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
        this.button_stop.addEventListener('click', (event) => {
          event.preventDefault();
          this.stop_query = true;
        });
      }
    }
    catch (e) {
      infojs.error(e);
    }
  }
  // get info() {
  //   try {
  //     return this.span_info.textContent;
  //   }
  //   catch (e) {
  //     infojs.error(e);
  //   }
  // }
  set info(text) {
    try {
      this.span_info.innerHTML = text;
    }
    catch (e) {
      infojs.error(e);
    }
  }
  get stop() {
    try {
      let stop = this.stop_query;
      // Clear on read. Could create race condition with button_stop click listener
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

'use strict';

import * as infojs from './info.js';

export class EntriesUI extends HTMLElement {
  constructor(id) {
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
    }
    catch (e) {
      infojs.error(e);
    }
  }
  connectedCallback() {
    try {
      this.span_info = this.shadow.querySelector('span.info');
      this.a_close = this.shadow.querySelector('a.close');
      this.a_update = this.shadow.querySelector('a.update');
      this.a_stop = this.shadow.querySelector('a.stop');
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
  get update() {
    try {
      return this.a_update;
    }
    catch (e) {
      infojs.error(e);
    }
  }
  get close() {
    try {
      return this.a_close;
    }
    catch (e) {
      infojs.error(e);
    }
  }
  get stop() {
    try {
      return this.a_stop;
    }
    catch (e) {
      infojs.error(e);
    }
  }
}

if (!customElements.get('entries-ui')) {
  customElements.define('entries-ui', EntriesUI);
}

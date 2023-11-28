'use strict';

import * as infojs from './info.js';

export class EntriesUI extends HTMLElement {
  constructor() {
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


</style>
`;
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
      return this.span_info;
    }
    catch (e) {
      // infojs.error(e);
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
  // entries(query) {
  //   return this.querySelectorAll(query || 'entry-ui');
  // }
  // insertBefore(entry, before) {
  //   this.shadow.insertBefore(entry, before);
  // }
  // appendchild(entry) {
  //   this.shadow.appendchild(entry);
  // }
  // get revisions() {
  //   try {
  //     return this.shadow.children[4];
  //   }
  //   catch (e) {
  //     infojs.error(e);
  //   }
  // }
  // get activity() {
  //   try {
  //     return this.shadow.children[5];
  //   }
  //   catch (e) {
  //     infojs.error(e);
  //   }
  // }
}

if (!customElements.get('entries-ui')) {
  customElements.define('entries-ui', EntriesUI);
}

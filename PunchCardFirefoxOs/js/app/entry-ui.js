'use strict';

import * as infojs from './info.js';
import '../libs/marked.min.js';

export class EntryUI extends HTMLElement {
  constructor() {
    try {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = `
  <pre class="start"></pre>
  <pre class="end"></pre>
  <pre class="duration"></pre>
  <input class="checked" type="checkbox">
  <pre class="revisions"></pre>
  <pre class="activity"></pre>
  <div class="view" style="display: none"></div>
<style>

:host>pre {
    margin: 0 0 0;
    padding: 0 0 0;
    border: 0;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

pre.start {
    white-space: pre-wrap;
    /* width: 49%; */
    grid-column: 1 / 3;
    grid-row: 1;
}

pre.end {
    white-space: pre-wrap;
    /* width: 49%; */
    grid-column: 3;
    grid-row: 1;
}

pre.duration {
    white-space: pre-wrap;
    /* width: 49%; */
    grid-column: 1;
    grid-row: 2;
}

input[type=checkbox] {
    grid-column: 2;
    grid-row: 2;
    height: 1rem;
}

pre.revisions {
    /* width: 49%; */
    grid-column: 3;
    grid-row: 2;
}

pre.activity {
  grid-column: 1 / 4;
  grid-row: 3;
}

div.view {
  grid-column: 1 / 4;
  grid-row: 3;
}

input[type=checkbox]:checked ~ pre.activity {
  overflow: visible;
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
}

/*
:host-context(.updating) {
    background-color: inherit;
}
*/

:host-context(.updating) {
    background-color: lightgrey;
}

:host-context(.dark_theme):host-context(.updating) {
    background-color: dimgrey;
}

:host {
    margin: 0 0 0;
    padding: 0 0 0;
    border: 0.1rem solid;
    display: grid;
    grid-template-columns: 0.75fr 0.25fr 1fr;
}

:host(:not(.deleted)) pre.changed {
    background-color: greenyellow;
    color: black;
}

:host-context(.dark_theme):host(:not(.deleted)) pre.changed {
    background-color: darkgreen;
    color: white;
}

:host(.deleted) {
    background-color: red;
    color: white;
}

:host-context(.dark_theme):host(.deleted) {
    background-color: darkred;
    color: white;
}

:host(.available) {
    background-color: lightgrey;
}

:host-context(.dark_theme):host(.available) {
    background-color: dimgrey;
}

:host(.filtered) {
    display: none;
}

:host(.linked) {
    border: 0.2rem solid;
}

:host(:target) {
    border: 0.2rem dashed;
}

*:hover {
    color: white;
    background-color: black;
}

:host-context(.dark_theme) *:hover {
    color: black;
    background-color: white;
}

:host(:not(.deleted)) pre.changed:hover {
    color: white;
    background-color: black;
}

:host-context(.dark_theme):host(:not(.deleted)) pre.changed:hover {
    color: black;
    background-color: white;
}

</style>
`;
    }
    catch (e) {
      infojs.error(e);
    }
  }
  connectedCallback() {
    try {
      this.checkbox = this.shadow.children[3];
      this.checked = this.checkbox.checked;
      this.view = this.shadow.children[6];
      // this.view.style.display = 'none';
      this.checkbox.addEventListener('change', (event) => {
        this.checked = event.target.checked;
        if (event.target.checked) {
          this.activity.style.display = 'none';
          this.view.innerHTML = marked.parse(this.activity.textContent);
          this.view.style.display = '';
        }
        else {
          this.view.style.display = 'none';
          this.activity.style.display = '';
        }
      });
    }
    catch (e) {
      infojs.error(e);
    }
  }
  static get observedAttributes() {
    return [
      // 'class',
      // 'id', // COUCHDB DOC ID(_REVISION)?
      // 'linked'
    ];
  }
  attributeChangedCallback(name, oldValue, newValue, namespace) {
    try {
      infojs.info(`new value ${newValue} for attribute ${name}`);
    }
    catch (e) {
      infojs.error(e);
    }
  }
  get start() {
    try {
      return this.shadow.children[0];
    }
    catch (e) {
      infojs.error(e);
    }
  }
  get end() {
    try {
      return this.shadow.children[1];
    }
    catch (e) {
      infojs.error(e);
    }
  }
  get duration() {
    try {
      return this.shadow.children[2];
    }
    catch (e) {
      infojs.error(e);
    }
  }
  get checked() {
    try {
      return this.checkbox.checked;
    }
    catch (e) {
      infojs.error(e);
    }
  }
  set checked(value) {
    try {
      this.checkbox.checked = value;
    }
    catch (e) {
      infojs.error(e);
    }
  }
  get revisions() {
    try {
      return this.shadow.children[4];
    }
    catch (e) {
      infojs.error(e);
    }
  }
  get activity() {
    try {
      return this.shadow.children[5];
    }
    catch (e) {
      infojs.error(e);
    }
  }
}

if (!customElements.get('entry-ui')) {
  customElements.define('entry-ui', EntryUI);
}

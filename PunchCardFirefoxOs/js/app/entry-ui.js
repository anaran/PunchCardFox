'use strict';

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
<style>

pre {
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

input[type=checkbox]:checked ~ pre.activity {
    overflow: visible;
    display: block;
    white-space: pre-wrap;
    word-break: break-all;
}

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

pre:hover {
    color: white;
    background-color: black;
}

:host-context(.dark_theme) pre:hover {
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
  // <link rel="stylesheet" href="../css/app.css">
    }
    catch (e) {
      window.alert(JSON.stringify(e, null, 2));
    }
  }
  connectedCallback() {
    try {
    }
    catch (e) {
      window.alert(JSON.stringify(e, null, 2));
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
    //   window.alert(JSON.stringify(e, null, 2));
    // }
  }
  get start() {
    try {
      return this.shadow.children[0];
    }
    catch (e) {
      window.alert(JSON.stringify(e, null, 2));
    }
  }
  get end() {
    try {
      return this.shadow.children[1];
    }
    catch (e) {
      window.alert(JSON.stringify(e, null, 2));
    }
  }
  get duration() {
    try {
      return this.shadow.children[2];
    }
    catch (e) {
      window.alert(JSON.stringify(e, null, 2));
    }
  }
  get checked() {
    try {
      return this.shadow.children[3];
    }
    catch (e) {
      window.alert(JSON.stringify(e, null, 2));
    }
  }
  get revisions() {
    try {
      return this.shadow.children[4];
    }
    catch (e) {
      window.alert(JSON.stringify(e, null, 2));
    }
  }
  get activity() {
    try {
      return this.shadow.children[5];
    }
    catch (e) {
      window.alert(JSON.stringify(e, null, 2));
    }
  }
}

if (!customElements.get('entry-ui')) {
  customElements.define('entry-ui', EntryUI);
}

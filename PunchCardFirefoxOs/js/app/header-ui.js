'use strict';

import * as infojs from './info.js';
import { AboutUI } from './about-ui.js';
import { NewEntryUI }  from './new-entry.js';
import { OptionsUI } from './options-ui.js';

export class HeaderUI extends HTMLElement {
  constructor() {
    try {
      // Trying to extent HTMLPreElement I get:
      // VM1330:1 Uncaught TypeError: Illegal constructor
      // In Brave Browser on 2022/09/25 12:20:58:
      // "Illegal constructor: autonomous custom elements must extend HTMLElement"
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = `
<h1 id="app_header">
  <span class="scrollbar" aria-hidden="true">&equiv;</span>
  <span class="hide_unchecked"><input type="checkbox"></input></span>
  <span class="app_title" aria-hidden="true">Punchcard v??</span>
  <span class="edit" aria-hidden="true">+</span>
  <span class="settings" aria-hidden="true">*</span>
  <span class="about" aria-hidden="true">&hellip;</span>
  <span class="search" aria-hidden="true">&#x1f50d;</span>
  <span class="reload" aria-hidden="true">&circlearrowleft;</span>
</h1>
<style>

#app_header {
    color: inherit;
    display: flex;
    font-size: 6mm;
    margin: 0;
    /* padding-top: 6mm; */
    position: fixed;
    text-align: center;
    top: 0;
    width: 100vw;
}

#app_header > span {
    flex: auto;
}

</style>
`;
      this.pre = this.shadow.querySelector('pre');
    }
    catch (e) {
      infojs.error(e);
    }
  }
  connectedCallback() {
    try {
      this.hideUncheckedItem = this.shadow.querySelector('.hide_unchecked');
      this.scrollbaritem = this.shadow.querySelector('span.scrollbar');
      this.titleItem = this.shadow.querySelector('span.app_title');
      this.optionsItem = this.shadow.querySelector('span.settings');
      this.reloadItem = this.shadow.querySelector('span.reload');
      this.searchItem = this.shadow.querySelector('span.search');
      this.aboutItem = this.shadow.querySelector('span.about');
      this.editNewItem = this.shadow.querySelector('span.edit');
      this.editNewItem = this.shadow.querySelector('span.edit');
      if (this.scrollbaritem) {
        this.scrollbaritem.addEventListener('click', this.toggleScrollbar);
      }
      if (this.titleItem) {
        this.titleItem.addEventListener('click', this.toggleFilter);
      }
      if (this.hideUncheckedItem) {
        this.hideUncheckedItem.addEventListener('change', this.toggleUnchecked);
      }
      if (this.editNewItem) {
        this.editNewItem.addEventListener('click', this.toggleEdit);
      }
      let aboutUI = new AboutUI();
      document.querySelector('#filter').insertAdjacentElement('afterend', aboutUI);
      if (this.aboutItem) {
        this.aboutItem.addEventListener('click', (event) => {
          aboutUI.toggle(event);
        }, 'capture');
      }
      let optionsUI = new OptionsUI();
      document.querySelector('#filter').insertAdjacentElement('afterend', optionsUI);
      if (this.optionsItem) {
        this.optionsItem.addEventListener('click', (event) => {
          optionsUI.toggle(event);
        }, 'capture');
      }
      if (this.reloadItem) {
        this.reloadItem.addEventListener('click', this.reloadApp, 'capture');
      }
      if (this.searchItem) {
        this.searchItem.addEventListener('click', this.searchFilter, 'capture');
      }
    }
    catch (e) {
      infojs.error(e);
    }
  }
  static get observedAttributes() {
    return [
      'class',
    ];
  }
  attributeChangedCallback(name, oldValue, newValue, namespace) {
    try {
      // this.pre.setAttribute(name, newValue);
    }
    catch (e) {
      infojs.error(e);
    }
  }
  set title(text) {
    this.titleItem.textContent = text;
  }
  get title() {
    return this.titleItem.textContent;
  }
  toggleFilter = (event) => {
      // event.preventDefault();
      if (filter.style['display'] == 'none') {
        filter.style['display'] = '';
        filter.focus();
        // filter.scrollIntoView({block: "center", inline: "center"});
      }
      else {
        filter.style['display'] = 'none';
      }
  };
    // Don't display filter when application loads.
    // toggleFilter();
    // Query recent changes when application starts.
    // runQuery({
    //   db_changes: true, // run db.changes instead of db.allDocs
    //   descending: true,
    //   include_docs: true,
    //   // conflicts: true,
    //   limit: 99,
    //   live: false,
    //   return_docs: false,
    //   since: 'now'
    // });
  toggleScrollbar = (event) => {
    let scrollBar = document.querySelector('nav#punchcard_scrollbar');
    event.target.style.opacity = 0.3;
    event.preventDefault();
    event.stopPropagation();
    window.setTimeout((event) => {
      if (scrollBar.style['display'] == 'none') {
        scrollBar.style['display'] = 'block';
      }
      else {
        scrollBar.style['display'] = 'none';
      }
      // recenterCenterElement();
      infojs.warn('FIXME: recenterCenterElement');
      event.target.style.opacity = 1;
    }, 50, event);
  };
  toggleUnchecked = (event) => {
    let checkbox = event.target;
    checkbox.disabled = true;
    event.preventDefault();
    event.stopPropagation();
    let entries = document.querySelectorAll('entry-ui');
    window.setTimeout((event) => {
      Array.prototype.forEach.call(entries, (value) => {
        if (checkbox.checked && !value.checked) {
          value.style.display = 'none';
        }
        else {
          value.style.display = '';
        }
      });
      checkbox.disabled = false;
    }, 50, event);
  }

  addNewEdit = (id, copy) => {
    let neu = new NewEntryUI(id, copy);
    document.querySelector('#filter').insertAdjacentElement('afterend', neu);
  };

  toggleEdit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.addNewEdit(undefined);
  }

  searchFilter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    infojs.time('searching');
    let entryNodes = scrollView.querySelectorAll('entry-ui');
    let regexp = stringToRegexp(filter.value.trim());
    if (regexp) {
      let firstEntry = Array.prototype.find.call(entryNodes, function(node, index) {
        var activity = node.activity;
        if (regexp.test(activity.textContent)) {
          return node;
        }
      });
      firstEntry && firstEntry.scrollIntoView({block: "center", inline: "center"});
      infojs.timeEnd('searching');
    }
  }

  reloadApp = (event) => {
    event.preventDefault();
    // in linux nightly firefox there is no way to get at app after reloadApp
    // when local python webserver is stopped or hosted app cannot be reached
    // because network is turned off.
    // nightly firefox for android just displays a footer overlay stating
    // "showing offline version" and works fine after reloadApp!
    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.getRegistration().then(function(registration) {
    //     registration.unregister();
    //   });
    // }
    // document.location.reload('force');
    // See https://developer.mozilla.org/en-US/docs/Web/API/Location/reload#location.reload_has_no_parameter
    document.location.reload();
  };

      // NOTE: Let's bring up a menu on click, if necessary, as is already done for #start_menu, etc.
      // optionsItem.addEventListener('contextmenu', function (event) {
      //   window.alert('This could be useful to pick from saved queries, e.g.\nAround now\n100 newest\n100 oldest\netc.');
      // });
}

if (!customElements.get('header-ui')) {
  customElements.define('header-ui', HeaderUI);
}

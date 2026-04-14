'use strict';

// import '../libs/pouchdb-9.0.0.min.js';
import '../libs/pouchdb-9.0.0.js';
// import '../libs/pouchdb.all-dbs.js';

import * as infojs from './info.js';

export class PouchdbUI extends HTMLElement {
  constructor() {
    // Trying to extent HTMLPreElement I get:
    // VM1330:1 Uncaught TypeError: Illegal constructor
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
<section>
  <h1></h1>
  <!-- input of type file is too ugly to display.
See https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications#Using_hidden_file_input_elements_using_the_click()_method
-->
  <input id="import_file" type="file" style="display:none">
  <input id="import_db" data-l10n-id="import_db" value="Import" type="button">
  <input id="export_db" data-l10n-id="export_db" value="Export" type="button">
  <input id="delete_db" data-l10n-id="delete_db" value="Delete" type="button">
  <template id="template_link">
    <div>
      <a download="options-15-1460462700712.txt" href="blob:https://apa.dedyn.io/7a03383f-460d-4d6e-9028-5b5d1bfe8842">
        Download N docs exported at DATETIME
      </a>
      <span class="close">&times;</span>
    </div>
  </template>
  <template id="template_info">
    <div>
      <span class="close">&times;</span>
    </div>
  </template>
</section>
<style>
  @import url(css/form.css);
  @import url(css/links.css);
  div {
      padding: 1em;
      /*border: solid 0.2em;*/
      opacity: 0.7;
  }
  span.close {
      padding: 1em;
      /*border: solid 0.2em;*/
      opacity: 0.7;
  }
</style>
`;
  }
  connectedCallback() {
    let self = this;
    let checkFileCount = function(files) {
      if (files.length === 0) {
        alert('Please pick some .txt file for import, e.g. a previously exported db.');
        return false;
      } else {
        return true;
      }
    };
    let errorHandler = function (domError) {
      addInfo(self.shadow.children[0], `${domError}`);
      alert(domError);
    }
    let readFileUpdateUI = function(file, dbObj) {
      let db = dbObj;
      let fileName = file.name;
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        var filesLoaded = 0;
        reader.onerror = errorHandler;
        infojs.time('read and parse of ' + file.name);
        reader.onload = function(readEvent) {
          try {
            filesLoaded++;
            var data = JSON.parse(readEvent.target.result);
            infojs.timeEnd('read and parse of ' + file.name);
            infojs.time(`db.bulkDocs of ${db.name} for import`);
            db.bulkDocs(data, { new_edits: false }).then(function (result) {
              infojs.timeEnd(`db.bulkDocs of ${db.name} for import`);
              resolve({ result: result, file: fileName });
            }).catch(function (err) {
              reject(err);
            });
          }
          catch (err) {
            addInfo(self.shadow.children[0], `${err}`);
            reject(err);
          }
        };
        reader.readAsText(file);
      });
    };
    // proto.createdCallback = function() {
    // infojs.info(`proto ${Object.getPrototypeOf(this)}`);
    // let two = document.createElement('span');
    // two.setAttribute('slot', 'two');
    // two.textContent = 'hättest du gern!';
    // this.appendChild(two);
    // infojs.info(this);
    let addInfo = (element, text) => {
      let infoTemplate = this.infoTemplate;
      let div = document.importNode(infoTemplate.content, true).children[0];
      // let info = div.querySelector('span.info');
      let close = div.querySelector('span.close');
      close.addEventListener('click', event => {
        div.parentElement.removeChild(div);
      });
      infojs.info(text, div);
      element.appendChild(div);
    };
    let addDownloadLink = (element, obj, text, filename) => {
      infojs.time(`new window.Blob, URL of ${this.db.name}`);
      let linkTemplate = this.linkTemplate;
      let blob = new window.Blob([JSON.stringify(obj, null, 2)], {
        type: 'text/plain; charset=utf-8'
      });
      let div = document.importNode(linkTemplate.content, true).children[0];
      let download = div.querySelector('a');
      let close = div.querySelector('span');
      close.addEventListener('click', event => {
        window.URL.revokeObjectURL(download.href);
        div.parentElement.removeChild(div);
      });
      download.href = window.URL.createObjectURL(blob);
      infojs.timeEnd(`new window.Blob, URL of ${this.db.name}`);
      download.download = filename;
      download.textContent = text;
      element.appendChild(div);
    };
    this.headline = this.shadow.querySelector('h1');
    this.importButton = this.shadow.querySelector('#import_db');
    this.importFile = this.shadow.querySelector('#import_file');
    this.importFile.addEventListener('change', event => {
      infojs.info(event.target.files);
      if (checkFileCount(event.target.files)) {
        // TODO files are added to head of the list, so we have to process in reverse order.
        infojs.info("Loading files, please wait...");
        for (var i = 0, len = event.target.files.length; i < len; i++) {
          readFileUpdateUI(event.target.files[i], this.db).then(result => {
            let importFile = result.file;
            if (result.result instanceof Array) {
              let okCount = result.result.reduce((previousValue, currentValue, currentIndex, array) => {
                if ('ok' in currentValue && currentValue.ok) {
                  return previousValue + 1;
                }
                else {
                  return previousValue;
                }
              }, 0);
              let errorCount = result.result.reduce((previousValue, currentValue, currentIndex, array) => {
                if ('error' in currentValue && currentValue.error) {
                  return previousValue + 1;
                }
                else {
                  return previousValue;
                }
              }, 0);
              addInfo(self.shadow.children[0], `Imported ${okCount} documents, got errors on ${errorCount}`);
              if (result.result.some((value, index) => {
                if ('error' in value && value.error) {
                  return true;
                }
              })) {
                addDownloadLink(self.shadow.children[0], result.result,
                                'Download import response', `errors-${importFile}`);
              }
            }
          }).catch(err => {
            addInfo(self.shadow.children[0], `failed to import ${event.target.files[i].name}`);
          });
        }
        this.importButton.removeAttribute('disabled');
      }
    }, false);
    this.importButton.addEventListener('click', event => {
      this.importButton.setAttribute('disabled', '');
      event.preventDefault();
      infojs.info(event);
      this.importFile.click();
    });
    this.exportButton = this.shadow.querySelector('#export_db');
    this.exportButton.addEventListener('click', event => {
      try {
        this.exportButton.setAttribute('disabled', '');
        infojs.info(event);
        infojs.time(`get db.allDocs of ${this.db.name} for export`);
        this.db.allDocs({
          timeout: 1000000,
          include_docs: true
        }).then(result => {
          // handle result
          let exportDate = new Date();
          infojs.timeEnd(`get db.allDocs of ${this.db.name} for export`);
          infojs.info(`db.allDocs of ${this.db.name} returned ${result.rows.length} entries.`);
          // Map to JSON which can be directly loaded into new database using
          // curl -u USER -k -d @punchcard-ROWS-DATE.txt -X POST \
          // https://HOST/NEWDB/_bulk_docs -H "Content-Type: application/json"
          var docs = {
            'docs': result.rows.map(function (row) {
              // NOTE Causes "error":"conflict","reason":"Document update conflict."
              // on second time POST _bulk_docs to database.
              // delete row.doc._rev;
              return row.doc;
            })
          };
          addDownloadLink(self.shadow.children[0], docs,
                          `Download all ${result.total_rows} docs exported at ${exportDate.toLocaleString()}`,
                          `${this.db.name}-${result.total_rows}-${exportDate.getTime()}.txt`);
          this.exportButton.removeAttribute('disabled');
        }).catch(function (err) {
          infojs.error(err);
          this.exportButton.removeAttribute('disabled');
        });
        // this.parentElement.removeChild(this);
      }
      catch (e) {
        infojs.error(e);
      }
    });
    this.deleteButton = this.shadow.querySelector('#delete_db');
    this.deleteButton.addEventListener('click', event => {
      try {
        this.deleteButton.setAttribute('disabled', '');
        infojs.info(event);
        if ('db' in this &&
            this.db instanceof PouchDB &&
            window.confirm('Make sure you have downloaded all docs, else they will be lost forever')) {
          this.db.destroy().then(response => {
            infojs.info(`deleted database ${this.db.name}`);
          }).catch(function (err) {
            infojs.error(err);
          });
        }
        this.deleteButton.removeAttribute('disabled');
      }
      catch (e) {
        infojs.error(e);
      }
    });
    this.linkTemplate = this.shadow.querySelector('#template_link');
    this.infoTemplate = this.shadow.querySelector('#template_info');
  }
  static get observedAttributes() {
    return ['db_name'];
  }
  attributeChangedCallback(name, oldValue, newValue, namespace) {
    try {
      infojs.info(`attribute ${name} changed from ${oldValue} to ${newValue}`);
      switch (name) {
      case 'db_name': {
        this.headline.textContent = `Datebase ${newValue}`;
        this.db = new PouchDB(newValue);
        break;
      }
      default: {
        infojs.error(`unknown attribute ${name}, NS: ${namespace} for element ${this}`);
      }
      }
    }
    catch (e) {
      infojs.error(e);
    }
  }
}

if (!customElements.get('pouchdb-ui')) {
  customElements.define('pouchdb-ui', PouchdbUI);
}

// export default {
//   PouchdbUI
// };

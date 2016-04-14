'use strict';

define(function (require) {
  let proto = Object.create(HTMLDivElement.prototype);
  proto.template = `
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
      <span class="info">
      </span>
      <span class="close">&times;</span>
    </div>
  </template>
</section>
<style>
  /*div {
  position: fixed;
  top: 1em;
  left: 1em;
  }*/
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
  let checkFileCount = function(files) {
    if (files.length === 0) {
      alert('Please pick some .txt file for import, e.g. a previously exported db.');
      return false;
    } else {
      return true;
    }
  };
  let errorHandler = function (domError) {
    alert(domError);
  }
  let readFileUpdateUI = function(file, dbObj) {
    let db = dbObj;
    let fileName = file.name;
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      var filesLoaded = 0;
      reader.onerror = errorHandler;
      reader.onload = function(readEvent) {
        try {
          filesLoaded++;
          console.timeEnd('read of ' + file.name);
          var result = readEvent.target.result;
          // console.log(result);
          console.time(`db.bulkDocs of ${db._db_name}`);
          db.bulkDocs(JSON.parse(result)).then(function (result) {
            console.timeEnd(`db.bulkDocs of ${db._db_name}`);
            resolve({ result: result, file: fileName });
            // handle result
          }).catch(function (err) {
            reject(err);
          });
        }
        catch (err) {
          reject(err);
        }
      };
      console.time('read of ' + file.name);
      reader.readAsText(file);
    });
  };
  proto.createdCallback = function() {
    // console.log('proto', Object.getPrototypeOf(this));
    // let two = document.createElement('span');
    // two.setAttribute('slot', 'two');
    // two.textContent = 'hättest du gern!';
    // this.appendChild(two);
    // console.log(this);
    let addInfo = (element, text) => {
      let infoTemplate = this.infoTemplate;
      let div = document.importNode(infoTemplate.content, true).children[0];
      let info = div.querySelector('span.info');
      let close = div.querySelector('span.close');
      close.addEventListener('click', event => {
        div.parentElement.removeChild(div);
      });
      info.textContent = text;
      element.appendChild(div);
    };
    let addDownloadLink = (element, obj, text, filename) => {
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
      console.timeEnd(`window.Blob, URL of ${this.db._db_name}`);
      download.download = filename;
      download.textContent = text;
      element.appendChild(div);
    };
    let shadow = this.createShadowRoot();
    if (this.template) {
      let te = document.createElement('template');
      te.innerHTML = this.template;
      shadow.appendChild(document.importNode(te.content, true));
      this.headline = shadow.querySelector('h1');
      this.importButton = shadow.querySelector('#import_db');
      this.importFile = shadow.querySelector('#import_file');
      this.importFile.addEventListener('change', event => {
        console.log(event.target.files);
        if (checkFileCount(event.target.files)) {
          // TODO files are added to head of the list, so we have to process in reverse order.
          console.log("Loading files, please wait...");
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
                addInfo(shadow.children[0], `Imported ${okCount} documents, got errors on ${errorCount}`);
                if (result.result.some((value, index) => {
                  if ('error' in value && value.error) {
                    return true;
                  }
                })) {
                  addDownloadLink(shadow.children[0], result.result,
                                  'Download import response', `errors-${importFile}`);
                }
              }
            }).catch(err => {
              addInfo(shadow.children[0], `failed to import ${importFile}`);
            });
          }
        }
      }, false);
      this.importButton.addEventListener('click', event => {
        event.preventDefault();
        console.log(event, this);
        this.importFile.click();
      });
      this.exportButton = shadow.querySelector('#export_db');
      this.exportButton.addEventListener('click', event => {
        console.log(event, this);
        console.time(`db.allDocs of ${this.db._db_name}`);
        this.db.allDocs({
          include_docs: true/*, 
  attachments: true*/
        }).then(result => {
          // handle result
          let exportDate = new Date();
          console.timeEnd(`db.allDocs of ${this.db._db_name}`);
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
          console.time(`window.Blob, URL of ${this.db._db_name}`);
          addDownloadLink(shadow.children[0], docs,
                          `Download all ${result.total_rows} doc exported at ${exportDate.toLocaleString()}`,
                          `${this.db._db_name}-${result.total_rows}-${exportDate.getTime()}.txt`);
        }).catch(function (err) {
          console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        });
        // this.parentElement.removeChild(this);
      });
      this.deleteButton = shadow.querySelector('#delete_db');
      this.deleteButton.addEventListener('click', event => {
        console.log(event, this);
        if ('db' in this &&
            this.db instanceof PouchDB &&
            window.confirm('Make sure you have downloaded all docs, else they will be lost forever')) {
          this.db.destroy().then(response => {
            console.log('deleted database', this.db._db_name);
          }).catch(function (err) {
            console.log(err);
          });
        }
      });
      this.linkTemplate = shadow.querySelector('#template_link');
      this.infoTemplate = shadow.querySelector('#template_info');
    }
  };
  proto.attributeChangedCallback = function(name, oldValue, newValue, namespace) {
    switch (name) {
      case 'db_name': {
        this.headline.textContent = `Datebase ${newValue}`;
        this.db = new PouchDB(newValue);
        break;
      }
      default: {
        console.error(`unknown attribute ${name}, NS: ${namespace} for element ${this}`);
      }
    }
  };
  let PouchdbUI = document.registerElement('pouchdb-ui', {
    prototype: proto,
  });
  return {
    PouchdbUI: PouchdbUI
  };
});

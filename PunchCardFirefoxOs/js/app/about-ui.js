'use strict';

import * as infojs from './info.js';
import * as readmejs from './readme.js';
import '../../js/libs/pouchdb-8.0.1.min.js';
// import '../../js/libs/pouchdb-8.0.1.js';
import '../../bower_components/pouchdb-all-dbs/dist/pouchdb.all-dbs.js';
import { PouchdbUI } from './pouchdb-ui.js';

export class AboutUI extends HTMLElement {
  constructor() {
    try {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = `
<section id="about" style="display: none;">
  <h1 data-l10n-id="app_title">Privileged empty app</h1>
  <p data-l10n-id="app_description">This app is empty. Fill it with your own stuff!</p>
  <section>
    <p>
      <a id="application_link" href="#application_link">Application Info</a>
      <a id="application_clear" href="#application_link">Clear</a>
    </p>
    <p id="application_info"></p>
    <p>
      <a id="databases_link" href="#databases_link">Databases Info</a>
      <a id="databases_clear" href="#databases_link">Clear</a>
    </p>
    <p id="databases_info"></p>
    <p>
      <a id="readme_link" href="README.md">README.md</a>
    </p>
    <p>
      <a id="readme2_link" href="README2.md">README2.md</a>
    </p>
    <div>
      <p>
        <!-- &#x1f589; is not available in Firefox Beta for Android as of (format-time-string "%Y-%m-%d") "2018-11-15" -->
      <a id="readme_edit_toggle" aria-hidden="true" data-icon="compose" style="visibility: hidden">&#x270e;<!-- &#x270f;&#x2710; --></a>
      <a id="readme_close" href="#readme_close">Close READMEs</a>
    </p>
      <div id="render_markdown"></div>
      <pre contentEditable id="edit_markdown"></pre>
    </div>
  </section>
</section>
<style>
@import url(css/links.css);

#edit_markdown {
  margin:  0.2rem;
  margin: 0.3rem;
  border: 1px solid;
  padding: 0.2rem;
  overflow: visible;
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
}

#render_markdown {
  margin: 0.5rem;
  margin: 0.3rem;
  border: 1px solid;
  padding: 0.2rem;
  display: none;
}

:host(:target) {
    border: 0.2rem dashed;
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
      var databasesLinkNode = this.shadow.getElementById('databases_link');
      var applicationLinkNode = this.shadow.getElementById('application_link');
      var databasesInfoNode = this.shadow.getElementById('databases_info');
      var applicationInfoNode = this.shadow.getElementById('application_info');
      var databasesClearNode = this.shadow.getElementById('databases_clear');
      var applicationClearNode = this.shadow.getElementById('application_clear');
      databasesClearNode.addEventListener('click', function (event) {
        // NOTE Do not go to link, which is somewhat disruptive.
        event.preventDefault();
        databasesInfoNode.textContent = '';
      });
      applicationClearNode.addEventListener('click', function (event) {
        // NOTE Do not go to link, which is somewhat disruptive.
        event.preventDefault();
        applicationInfoNode.textContent = '';
      });
      databasesLinkNode.addEventListener('click', function (event) {
        try {
          // NOTE Do not go to link, which is somewhat disruptive.
          event.preventDefault();
          // event.stopPropagation();
          var databaseName = document.getElementById('db_name');
          // var db = new PouchDB(databaseName.value);
          // // var db = new PouchDB('punchcard3');
          // var optionsDB = new PouchDB('options');
          var destination = localStorage.getItem('protocol') +
              localStorage.getItem('hostportpath');
          var myXHR = function () {
            var request;
            request = new XMLHttpRequest();
            return request;
          }
          var opts = {
            ajax: {
              xhr: myXHR,
              // headers: { 'Cookie': cookie },
              timeout: 30000
            }
          };
          PouchDB.allDbs().then(function (dbs) {
            // dbs is an array of strings, e.g. ['mydb1', 'mydb2']
            infojs.info({ 'dbs': dbs, 'destination': destination });
            if (dbs.length) {
              Array.prototype.forEach.call(dbs, function (db) {
                let localDB = new PouchDB(db);
                // let remoteDB = new PouchDB(destination + db, opts);
                localDB.info().then(function (info) {
                  infojs.infojs(info, databasesInfoNode);
                }).catch(function (err) {
                  infojs.error(err, databasesInfoNode);
                  // handle err
                });
                // remoteDB.info().then(function (info) {
                //   infojs.info(info, databasesInfoNode);
                // }).catch(function (err) {
                //   infojs.error(err, databasesInfoNode);
                //   // handle err
                // });
                if (!databasesInfoNode.querySelector (`[db_name="${db}"]`)) {
                  let pui = new PouchdbUI();
                  let dbUI = databasesInfoNode.appendChild(pui);
                  dbUI.setAttribute('db_name', db);
                  // dbUI.setAttribute('bad_db_name', db);
                }
              });
            }
          }).catch(function (err) {
            infojs.error(err, databasesInfoNode);
            // handle err
          });
          var remoteOptionsDatabaseName = localStorage.getItem('options_db_name');
          var remotePunchcardDatabaseName = localStorage.getItem('punchcard_db_name');
          var remoteOptionsDB = new PouchDB(destination + remoteOptionsDatabaseName, opts);
          var remotePunchcardDB = new PouchDB(destination + remotePunchcardDatabaseName, opts);
          remoteOptionsDB.info().then(function (info) {
            infojs.infojs(info, databasesInfoNode);
          }).catch(function (err) {
            infojs.error(err, databasesInfoNode);
            // handle err
          });
          remotePunchcardDB.info().then(function (info) {
            infojs.infojs(info, databasesInfoNode);
          }).catch(function (err) {
            infojs.error(err, databasesInfoNode);
            // handle err
          });
        }
        catch(err) {
          infojs.error(err, databasesInfoNode);
        }
      });
      applicationLinkNode.addEventListener('click', function (event) {
        // NOTE Do not go to link, which is somewhat disruptive.
        event.preventDefault();
        // event.stopPropagation();
        // Force exception:   "message": "cyclic object value"
        // infojs.info(window, applicationInfoNode);
        infojs.infojs(window.location, applicationInfoNode);
        infojs.infojs(window.navigator.userAgent, applicationInfoNode);
        infojs.infojs(document.head.querySelector('link[rel=manifest]').href, applicationInfoNode);
        // NOTE: Only availabe for Firefox OS packaged apps:
        if ('mozApps' in window.navigator) {
          var request = window.navigator.mozApps.getSelf();
          request.onsuccess = function() {
            if (request.result) {
              // Pull the name of the app out of the App object
              infojs.info(request.result.manifest, applicationInfoNode);
              // infojs.info(request.result.manifest, applicationInfoNode);
            } else {
              // alert("Called from outside of an app");
              infojs.info(["Called from outside of an app"], applicationInfoNode);
            }
          };
          request.onerror = function() {
            // Display error name from the DOMError object
            alert(`Error: ${request.error.name}`);
            infojs.error(`Error: ${request.error.name}`);
          };
        }
      });
      if (readmejs) {
        var renderElement = this.shadow.querySelector('#render_markdown');
        var editElement = this.shadow.querySelector('#edit_markdown');
        let readmeLink = this.shadow.getElementById('readme_link');
        var readme2Link = this.shadow.getElementById('readme2_link');
        var toggleEdit = this.shadow.getElementById('readme_edit_toggle');
        var readmeClose = this.shadow.getElementById('readme_close');
        readmeClose.addEventListener('click', function (event) {
          // NOTE Do not go to link, which is somewhat disruptive.
          event.preventDefault();
          if (editElement.style['display'] == 'none') {
            renderElement.textContent = '';
            editElement.textContent = '';
            renderElement.style['display'] = 'none';
            editElement.style['display'] = 'none';
            toggleEdit.style['visibility'] = 'hidden';
          }
        });
        readmeLink.addEventListener('click', function (event) {
          // NOTE Do not go to link, which is somewhat disruptive.
          event.preventDefault();
          readmejs.init(event.target.href + '#' + Date.now(), renderElement, editElement, toggleEdit).
            // event.stopPropagation();
          // then(
          //   function (resolve) {
          //     window.alert(JSON.stringify(resolve, null, 2));
          //   }).
          catch(function (reject) {
            window.alert('Document ' + event.target.href +
                         ' could not be initialized.\n\n' + JSON.stringify(reject, null, 2));
          });
        });
        readme2Link.addEventListener('click', function (event) {
          // NOTE Do not go to link, which is somewhat disruptive.
          event.preventDefault();
          readmejs.init(event.target.href, renderElement, editElement, toggleEdit).
          catch(function (reject) {
            window.alert('Document ' + event.target.href +
                         ' could not be initialized.\n\n' + JSON.stringify(reject, null, 2));
          });
        });
      }
    }
    catch(err) {
      infojs.error(err, databasesInfoNode);
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
  toggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    let aboutElement = this.shadow.querySelector('#about');
    // aboutElement.style.display = 'none';
    if (aboutElement) {
      if (aboutElement.style.display == 'none') {
        // otherView.style.display = 'block';
        aboutElement.style.display = 'block';
        event.target.style.opacity = '0.3';
        // Let user peruse about information...
        aboutElement.scrollIntoView({block: "center", inline: "center"});
      }
      else {
        aboutElement.style.display = 'none';
        event.target.style.opacity = '1.0';
      }
    }
  }
}

if (!customElements.get('about-ui')) {
  customElements.define('about-ui', AboutUI);
}

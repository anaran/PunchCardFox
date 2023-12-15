'use strict';

import * as infojs from './info.js';
import * as utilsjs from './utils.js';
import * as appjs from './app.js';
import '../libs/pouchdb-8.0.1.min.js';
// import '../libs/pouchdb-8.0.1.js';

export class OptionsUI extends HTMLElement {
  constructor() {
    try {
      super();
      this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = `
<section id="options" style="display: none;">
  <section>
    <!-- <span class="persistent" id="include" data-l10n-id="include"contentEditable>bla</span> -->
    <input-ui class="persistent" type="text" id="include" data-l10n-id="include" placeholder="must match"></input-ui>
    <input-ui class="persistent" type="text" id="exclude" data-l10n-id="exclude" placeholder="must not match"></input-ui>
    <input-ui class="persistent" type="number" id="match_limit" data-l10n-id="match_limit" placeholder="match count"></input-ui>
    <input-ui class="persistent" type="number" id="limit" data-l10n-id="limit" placeholder="entries count"></input-ui>
    <input class="persistent" type="checkbox" id="descending" data-l10n-id="descendieng" placeholder="descending">
    <input-ui class="persistent" type="text" id="deleted_id" data-l10n-id="deleted_id" placeholder="deleted id"></input-ui>
    <input-ui class="persistent" type="number" id="changes_since_sequence" data-l10n-id="changes_since_sequence_id" placeholder="Changes since sequence ..."></input-ui>
    <input-ui class="persistent" type="date" id="query_start" data-l10n-id="query_start_id" pattern="\d{4}(-\d{1,2}){0,2}" placeholder="start date limit 1, YYYY-MM-DD"></input-ui>
    <input-ui class="persistent" type="date" id="query_end" data-l10n-id="query_end_id" pattern="\d{4}(-\d{1,2}){0,2}" placeholder="start date limit 2, YYYY-MM-DD"></input-ui>
    <div>
      <input type="checkbox" id="live_changes" name="live_changes"
             value="true" />
      <label for="live_changes">Display Punchcard database changes live</label>
    </div>
  </section>
  <section>
    <p>
      <input type="button" id="login" data-l10n-id="login" value="Login"/>
      <input type="button" id="logout" data-l10n-id="logout" value="Logout"/>
    </p>
  </section>
  <section>
    <input-ui class="persistent" type="text" id="protocol" data-l10n-id="protocol" value="https://"></input-ui>
    <input class="persistent" type="text" id="user" data-l10n-id="user" placeholder="user"></input>
    <slot></slot>
    <input-ui class="persistent" type="text" id="hostportpath" data-l10n-id="hostportpath" placeholder="host:port/path/"></input-ui>
    <h1 data-l10n-id="options_db_title">Options Database</h1>
    <p>
      <input type="button" id="load" data-l10n-id="load" value="Load"/>
      <input type="button" id="save" data-l10n-id="save" value="Save"/>
    </p>
    <select id="options_sync_type">
      <option>Replicate from</option>
      <option>Replicate to</option>
      <option selected>Sync with</option>
    </select>
    <input-ui class="persistent" type="text" id="options_db_name" placeholder="options db name"></input-ui>
    <input type="button" id="options_start_replication" data-l10n-id="options_start_replication" value="now">
    <input type="checkbox" id="options_live_sync">
    <input type="button" id="options_stop_replication" data-l10n-id="options_stop_replication" value="Stop Replication">
  <h1 data-l10n-id="punchcard_db_title">Punchcard Database</h1>
      <select id="punchcard_sync_type">
        <option>Replicate from</option>
        <option>Replicate to</option>
        <option selected>Sync with</option>
      </select>
    <input-ui class="persistent" type="text" id="punchcard_db_name" data-l10n-id="db_name" placeholder="database name"></input-ui>
    <input-ui class="persistent" type="number" id="punchcard_doc_size" data-l10n-id="punchcard_doc_size" value="1000"></input-ui>
    <input type="button" id="punchcard_start_replication" data-l10n-id="punchcard_start_replication" value="now">
    <input type="checkbox" id="punchcard_live_sync">
    <input type="button" id="punchcard_stop_replication" data-l10n-id="punchcard_stop_replication" value="Stop Replication">
    <p>
      <a href="#clear_replication_info" id="clear_replication_info">Clear info</a>
      <select id="verbosity">
        <option>silent</option>
        <option selected>quiet</option>
        <option>verbose</option>
      </select>
    </p>
    <p id="replication_info">
    </p>
    <h1 data-l10n-id="punchcard_font_size_title">Punchcard Font Size</h1>
    <select class="persistent" id="punchcard_font_size_select">
      <option>x-small</option>
      <option>small</option>
      <option selected>medium</option>
      <option>large</option>
      <option>x-large</option>
    </select>
    <h1 data-l10n-id="punchcard_theme_title">Punchcard Theme</h1>
    <select class="persistent" id="punchcard_theme_select">
      <option>Light</option>
      <option>Dark</option>
      <option selected>System</option>
    </select>
  </section>
</section>
<style>
@import url(css/form.css);
@import url(css/links.css);

pre {
  font-family: FiraSans;
}

div {
/*   font-size: small; */
/*   border: 1px solid; */
  padding: 0 0 0;
/*   display: inline; */
}

div.entry {
/*   font-size: small; */
  border: 0.1em solid;
/*   margin: 0 0 1em; */
}

pre {
/*   margin: 0 0 0; */
  width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis ellipsis;
}

pre:focus {
  overflow: visible;
  white-space: pre;
/*   white-space: pre; */
}
</style>
`;
      this.innerHTML = `
    <input type="password" id="pass" data-l10n-id="pass" placeholder="pass"></input>
`;
    }
    catch (e) {
      window.alert(JSON.stringify(e, null, 2));
    }
  }
  connectedCallback() {
    try {
      // try {
      infojs.time('options.js');
      var infoNode = this.shadow.getElementById('replication_info');
      var XHR_TIMEOUT_MS = 65000;
      var cookie;
      var setCookie;
      let loadButton = this.shadow.querySelector('#load');
      let saveButton = this.shadow.querySelector('#save');
      // No need to keep a lot of history for user options.
      infojs.time('new Pouchdb options');
      var optionsDB = new PouchDB('options'/*, { auto_compaction: true }*/);
      infojs.timeEnd('new Pouchdb options');
      infojs.time('new Pouchdb punchcard');
      var punchcardDB = new PouchDB('punchcard');
      infojs.timeEnd('new Pouchdb punchcard');
      // this.shadow.addEventListener('readystatechange', (event) => {
        // if (event.target.readyState !== 'complete') {
        //   return;
        // }
      this.shadow.querySelectorAll('.persistent').forEach((item) => {
        if (item.type == 'checkbox') {
          item.checked = (localStorage.getItem(item.id) == 'true');
        }
        else {
          item.value = localStorage.getItem(item.id);
        }
        // Note: Unlike blur this only fires when value has actually changed.
        item.addEventListener('change', (event) => {
          var element = event.target;
          var value = element.type == 'checkbox' ? element.checked : element.value;
          localStorage.setItem(element.id, value);
        });
      });
      // });
      let liveChanges = this.shadow.getElementById ('live_changes');
      let liveQuery;
      liveChanges.addEventListener('change', (event) => {
        var element = event.target;
        var value = element.checked;
        // window.alert(`${element.id} is ${value}`);
        if (value) {
          liveQuery = appjs.runQuery({
            // conflicts: true,
            db_changes: true, // run db.changes instead of db.allDocs
            descending: false,
            include_docs: true,
            live: true,
            return_docs: false,
            since: 'now'
          });
        }
        else {
          if (liveQuery) {
            liveQuery.cancel();
          }
        }
      });
      let themeSelect = this.shadow.getElementById ('punchcard_theme_select');
      // Create the query list.
      const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
      // Define a callback function for the event listener.
      function handleColorThemeChange(evt) {
        if (evt.matches) {
          document.body.classList.add('dark_theme');
        } else {
          document.body.classList.remove('dark_theme');
        }
        infojs.info(evt);
      }
      let changeTheme = (element) => {
        switch (element.value) {
        case "Light": {
          mediaQueryList.removeEventListener("change", handleColorThemeChange);
          document.body.classList.remove('dark_theme');
          break;
        }
        case "Dark": {
          mediaQueryList.removeEventListener("change", handleColorThemeChange);
          document.body.classList.add('dark_theme');
          break;
        }
        case "System": {
          // Add the callback function as a listener to the query list.
          mediaQueryList.addEventListener("change", handleColorThemeChange);
          // Run the orientation change handler once.
          handleColorThemeChange(mediaQueryList);
          break;
        }
        }
      };
      changeTheme(themeSelect);
      themeSelect.addEventListener ('change', (event) => changeTheme(event.target));
      let fontSizeSelect = this.shadow.getElementById ('punchcard_font_size_select');
      let changeFontSize = (element) => {
        document.documentElement.style.fontSize = element.value;
      };
      changeFontSize(fontSizeSelect);
      fontSizeSelect.addEventListener ('change', (event) => changeFontSize(event.target));

      loadButton.addEventListener('click', (event) => {
        infojs.time('optionsDB.allDocs');
        optionsDB.allDocs({
          include_docs: true,
        }).then((result) => {
          infojs.time('delete no longer used options in optionsDB');
          result.rows && result.rows.forEach((row) => {
            let element = this.shadow.getElementById(row.key);
            if (!element) {
              if (!row.key.startsWith("_design/")) {
                optionsDB.remove({ _id: row.key, _rev: row.value.rev }).then((result) => {
                  infojs.warn(`deleted no longer used ${row.key}, ${row.value.rev}`);
                }).catch((err) => {
                  infojs.error(err);
                });
              }
            }
            else {
              localStorage.setItem(row.key, row.doc.value);
              if (element.type == 'checkbox') {
                element.checked = row.doc.value;
              }
              else {
                element.value = row.doc.value;
              }
            }
          });
          infojs.timeEnd('delete no longer used options in optionsDB');
          infojs.timeEnd('optionsDB.allDocs');
        });
        infojs.time('optionsDB.info()');
        optionsDB.info().then((info) => {
          infojs.info(info);
          infojs.timeEnd('optionsDB.info()');
        }).catch((err) => {
          infojs.error(err);
        });
      });

      saveButton.addEventListener('click', (event) => {
        infojs.time('delete optionsDB conflicts');
        this.shadow.querySelectorAll('.persistent').forEach((element) => {
          optionsDB.get(element.id, {
            conflicts: true
          }).then((otherDoc) => {
            if (otherDoc._conflicts) {
              infojs.info({ conflicts: otherDoc._conflicts }, infoNode);
              // FIXME: just delete conflict for now for options.
              // DON'T DO THIS FOR VALUABLE DOCUMENTS!
              otherDoc._conflicts.forEach((conflict) => {
                optionsDB.put({
                  _id: otherDoc._id,
                  _rev: conflict,
                  _deleted: true
                }).then((response) => {
                  infojs.info('options db conflict deleted');
                  infojs.info(response);
                  // this.shadow.location.reload('force');
                  // saveLink.click();
                }).catch((err) => {
                  infojs.error(err);
                });
              });
            }
            if (element.type == 'checkbox') {
              otherDoc.value = element.checked;
            }
            else {
              otherDoc.value = element.value;
            }
          }).catch((err) => {
            //errors
            console.log(err, element);
            var value = element.type == 'checkbox' ? element.checked : element.value;
            if (element.id) {
              optionsDB.put({ _id: element.id, value: value });
            }
            else {
              console.log("no id for saving options doc", element);
            }
          });
        });
        infojs.timeEnd('delete optionsDB conflicts');
      });

      var infoNode = this.shadow.getElementById('replication_info');
      var clearNode = this.shadow.getElementById('clear_replication_info');
      clearNode.addEventListener('click', (event) => {
        // NOTE Do not go to link, which is somewhat disruptive.
        event.preventDefault();
        if (!infoNode.childElementCount) {
        }
        else {
          Array.prototype.forEach.call(infoNode.querySelectorAll('info-ui'), (elem) => {
            infoNode.removeChild(elem);
          });
        }
      });
      var optionsStartButton = this.shadow.getElementById('options_start_replication');
      var optionsStopButton = this.shadow.getElementById('options_stop_replication');
      var punchcardStartButton = this.shadow.getElementById('punchcard_start_replication');
      var punchcardStopButton = this.shadow.getElementById('punchcard_stop_replication');
      var myXHR = () => {
        var request;
        request = new XMLHttpRequest();
        return request;
      }
      var opts = {
        ajax: {
          xhr: myXHR,
          // headers: { 'Cookie': cookie },
          timeout: XHR_TIMEOUT_MS
        }
      };
      var syncOptions = {
        // live: !!liveSyncing.checked,
        retry: true,
        timeout: XHR_TIMEOUT_MS,
        // return_docs: false
        // back_off_function: (delay) => {
        //   if (delay === 0) {
        //     return 1000;
        //   }
        //   return delay * 3;
        // }
      };
      let setupRemoteSync = (opt) => {
        opt.startButton.addEventListener('click', (event) => {
          let dbSync;
          var destination = this.shadow.getElementById(opt.protocolId).value +
              this.shadow.getElementById(opt.hostportpathId).value;
          var remoteDatabaseName = this.shadow.getElementById(opt.remoteDatabaseNameId).value;
          let remoteDB = new PouchDB(destination + remoteDatabaseName, opt.remoteOptions);
          let localDbName = opt.localDB.name;
          let startButton = opt.startButton;
          let stopButton = opt.stopButton;
          let syncOptions = opt.syncOptions;
          let pullOptions = syncOptions;
          var syncType = this.shadow.getElementById(opt.syncTypeId).value;
          var verbositySelect = this.shadow.getElementById(opt.verbositySelectId);
          var liveSyncing = !!this.shadow.getElementById(opt.liveId).checked;
          syncOptions.live = liveSyncing;
          pullOptions.live = liveSyncing;
          if ('activitySizeId' in opt) {
            let activityMaxSyncLength = this.shadow.getElementById(opt.activitySizeId).value;
            if (activityMaxSyncLength.length) {
              pullOptions.filter = 'ok/filter_activity_length',
              pullOptions.query_params = {
                "activity_length": Number(activityMaxSyncLength)
              }
            }
          }
          if (true) {
            switch (syncType) {
            case 'Replicate from': {
              dbSync = opt.localDB.replicate.from(remoteDB, pullOptions);
              break;
            }
            case 'Replicate to': {
              dbSync = opt.localDB.replicate.to(remoteDB, syncOptions);
              break;
            }
            case 'Sync with': {
              dbSync = opt.localDB.sync(remoteDB, pullOptions);
              // dbSync = opt.localDB.sync(remoteDB, {
              //   pull: pullOptions,
              //   push: syncOptions
              // });
              break;
            }
            default:
              infojs.info({ 'unknown sync type': syncType }, infoNode);
            }
            var myInfo = {};
            dbSync.on('change', (info) => {
              if (verbositySelect.value != 'verbose') {
                if (info.change && info.change.docs) {
                  info.change.docs = ["..."];
                } 
                if (info.docs) {
                  info.docs = ["..."];
                } 
              }
              if (verbositySelect.value != 'silent') {
                myInfo[localDbName] = info;
                infojs.infojs(myInfo, infoNode);
              }
            })
              .on('paused', () => {
                // replication paused (e.g. user went offline)
                if (verbositySelect.value == 'verbose') {
                  myInfo[localDbName] = "replication paused (e.g. user went offline)";
                  infojs.infojs(myInfo, infoNode);
                }
              })
              .on('active', () => {
                // replicate resumed (e.g. user went back online)
                if (verbositySelect.value == 'verbose') {
                  myInfo[localDbName] = "replicate resumed (e.g. user went back online)";
                  infojs.info(myInfo, infoNode);
                }
              })
              .on('denied', (info) => {
                // a document failed to replicate, e.g. due to permissions
                if (verbositySelect.value != 'silent') {
                  myInfo[localDbName] = info;
                  infojs.error(myInfo, infoNode);
                }
              })
              .on('complete', (info) => {
                if (verbositySelect.value != 'silent') {
                  myInfo[localDbName] = info;
                  infojs.infojs(myInfo, infoNode);
                  remoteDB.info().then((info) => {
                    infojs.infojs(info, infoNode);
                  }).catch((err) => {
                    infojs.error(err, infoNode);
                  });
                }
                startButton.removeAttribute('disabled');
                stopButton.setAttribute('disabled', true);
              })
              .on('uptodate', (info) => {
                myInfo[localDbName] = info;
                infojs.infojs(myInfo, infoNode);
              })
              .on('error', (err) => {
                myInfo[localDbName] = err;
                infojs.error(myInfo, infoNode);
                let sessionUrl = this.shadow.getElementById('protocol').value +
                    this.shadow.getElementById('hostportpath').value + '_session';
                sessionLogin(sessionUrl, this.shadow.getElementById('user').value, this.querySelector('#pass').value);
                startButton.removeAttribute('disabled');
                stopButton.setAttribute('disabled', true);
              });
          }
          startButton.setAttribute('disabled', true);
          stopButton.removeAttribute('disabled');
          var cancelSync = (event) => {
            startButton.removeAttribute('disabled');
            stopButton.setAttribute('disabled', true);
            this.removeEventListener('click', cancelSync);
            dbSync.cancel();
          };
          if (dbSync) {
            stopButton.addEventListener('click', cancelSync);
          }
        });
      };
      infojs.time('setupRemoteSync punchcard');
      setupRemoteSync({
        startButton: punchcardStartButton,
        stopButton: punchcardStopButton,
        localDB: punchcardDB,
        syncOptions: syncOptions,
        remoteOptions: opts,
        syncTypeId: 'punchcard_sync_type',
        protocolId: 'protocol',
        hostportpathId: 'hostportpath',
        remoteDatabaseNameId: 'punchcard_db_name',
        verbositySelectId: 'verbosity',
        liveId: 'punchcard_live_sync',
        activitySizeId: 'punchcard_doc_size'
      });
      infojs.timeEnd('setupRemoteSync punchcard');
      infojs.time('setupRemoteSync options');
      setupRemoteSync({
        startButton: optionsStartButton,
        stopButton: optionsStopButton,
        localDB: optionsDB,
        syncOptions: syncOptions,
        remoteOptions: opts,
        syncTypeId: 'options_sync_type',
        protocolId: 'protocol',
        hostportpathId: 'hostportpath',
        remoteDatabaseNameId: 'options_db_name',
        verbositySelectId: 'verbosity',
        liveId: 'options_live_sync'
      });
      infojs.timeEnd('setupRemoteSync options');
      var include = this.shadow.getElementById('include');
      var exclude = this.shadow.getElementById('exclude');
      var includeCase = this.shadow.getElementById('include_case');
      var excludeCase = this.shadow.getElementById('exclude_case');

      // include.addEventListener('keypress', (event) => {
      //   if (event.key == 'Enter') {
      //     if (include.value.length < 3) {
      //       window.alert(include.value + ' is too short (< 3)');
      //       return;
      //     }
      //     // searchMatchingActivities();
      //   }
      //   // console.log(event.type, event);
      // });
      // exclude.addEventListener('keypress', (event) => {
      //   if (event.key == 'Enter') {
      //     if (include.value.length < 3) {
      //       window.alert(include.value + ' is too short (< 3)');
      //       return;
      //     }
      //     // searchMatchingActivities();
      //   }
      //   // console.log(event.type, event);
      // });
      // NOTE Seem to be supported by desktop safari only:
      // https://developer.mozilla.org/en-US/docs/Web/Events/search#Browser_compatibility
      // include.addEventListener('search', (event) => {
      //   console.log(event.type, event);
      // });
      var searchMatchingActivities = () => {
        var includeRegExp = new RegExp(include.value, include_case.checked ? '' : 'i');
        var excludeRegExp = new RegExp(exclude.value, exclude_case.checked ? '' : 'i');
        punchcardDB.allDocs({ limit: 4500, include_docs: true, descending: true }, (err, doc) => {
          if (err) {
            infojs.error(err);
          } else {
            var search = this.shadow.getElementById('search');
            search && include.parentElement.removeChild(search);
            search = this.shadow.createElement('div');
            search.id = 'search';
            doc.rows.forEach((row) => {
              if (!includeRegExp.test(row.doc.activity) ||
                  exclude.value.length && excludeRegExp.test(row.doc.activity)) {
                return;
              }
              // var start = this.shadow.createElement('div');
              // var end = this.shadow.createElement('div');
              // white-space: pre-wrap;
              var div = this.shadow.createElement('div');
              var diva = this.shadow.createElement('div');
              var start = this.shadow.createElement('pre');
              // var end = this.shadow.createElement('span');
              var activity = this.shadow.createElement('pre');
              var repeat = this.shadow.createElement('a');
              repeat.href = '#';
              repeat.textContent = 'Repeat now';
              repeat.addEventListener('click', (event) => {
                event.preventDefault();
                var entry = {
                  // _id: punchcardDB.post(),
                  activity: activity.textContent,
                  start: (new Date).toJSON(),
                  end: (new Date).toJSON()
                };
                punchcardDB.post(entry).then((response) => {
                  this.shadow.querySelector('a.save').click();
                }).catch((err) => {
                  infojs.error(err);
                });
              });
              var edit = this.shadow.createElement('a');
              edit.href = '/build/new.html#' + row.doc._id;
              edit.textContent = 'Edit';

              // activity.contentEditable = true;
              // activity.addEventListener('input', null);
              // activity.readOnly = true;
              // start.textContent = (new Date(row.doc.start)).toLocaleString();
              // end.textContent = (new Date(row.doc.end)).toLocaleString();
              start.textContent = utilsjs.formatStartDate(new Date(row.doc._id.substring(0, 24)));
              // end.textContent = utilsjs.formatEndDate(new Date(row.doc.end));
              activity.textContent = row.doc.activity;
              start.contentEditable = true;
              activity.contentEditable = true;
              // activity.setAttribute('readonly', true);
              //         activity.addEventListener('focus', (event) => {
              //           event.target.removeAttribute('rows');
              //         });
              //         activity.addEventListener('blur', (event) => {
              //           event.target.setAttribute('rows', 1);
              //         });
              // search.appendChild(start);
              // search.appendChild(end);
              diva.className = 'entry';
              diva.appendChild(start);
              // div.appendChild(end);
              diva.appendChild(div);
              div.appendChild(repeat);
              div.appendChild(edit);
              diva.appendChild(activity);
              search.appendChild(diva);
              // activity.appendChild(repeat);
              // search.appendChild(activity);
            });
            include.parentElement.appendChild(search);
            //     var pre = this.shadow.createElement('pre');
            //     pre.textContent = JSON.stringify(doc.rows, null, 2);
            //     this.shadow.body.appendChild(pre);
          }
        });
      };
      // ---

      var login = this.shadow.querySelector('#login');
      var logout = this.shadow.querySelector('#logout');

      // Forms will take the values in the input fields they contain
      // and send them to a server for further processing,
      // but since we want to stay in this page AND make a request to another server,
      // we will listen to the 'submit' event, and prevent the form from doing what
      // it would usually do, using preventDefault.
      // Read more about it here:
      // https://developer.mozilla.org/Web/API/event.preventDefault
      //
      // Then we search without leaving this page, just as we wanted.
      this.querySelector('#pass').addEventListener('blur', (event) => {
        if (event.target.value.length  > 0) {
          let sessionUrl = this.shadow.getElementById('protocol').value +
              this.shadow.getElementById('hostportpath').value + '_session';
          if (sessionLogin(sessionUrl, this.shadow.getElementById('user').value, event.target.value)) {
          }
        }
        // console.log(event.type, event);
      });
      login.addEventListener('click', (e) => {
        // e.preventDefault();
        // FIXME: async!
        let sessionUrl = this.shadow.getElementById('protocol').value +
            this.shadow.getElementById('hostportpath').value + '_session';
        if (sessionLogin(sessionUrl, this.shadow.getElementById('user').value, this.querySelector('#pass').value)) {
        }
      });
      logout.addEventListener('click', (e) => {
        let sessionUrl = this.shadow.getElementById('protocol').value +
            this.shadow.getElementById('hostportpath').value + '_session';
        // e.preventDefault();
        if (sessionLogout(sessionUrl)) {
          cookie = '';
        }
      });

      let sessionLogin = (url, username, password) => {
        // Returns AuthSession header in Firefox OS App with systemXHR permission
        var request;
        request = new XMLHttpRequest();
        // TODO: sends username:password@ as part of the URL, exposing password in firefox net log!
        // NOTE: fauxton uses Authorization Basic
        // request.open('POST', url, !!'async'/*, username, password*/);
        request.open('POST', url, !!'async'/*, username, password*/);
        request.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
        request.withCredentials = true;
        request.timeout = XHR_TIMEOUT_MS;
        request.ontimeout = onRequestError;
        request.onerror = onRequestError;
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = () => {
          if (request.readyState == request.DONE) {
            if (request.statusText != 'OK') {
              infojs.error(request.responseText);
            }
            var infoNode = this.shadow.getElementById('replication_info');
            infojs.info('request.readyState = ' + request.readyState, infoNode);
            infojs.info('request.status = ' + request.status, infoNode);
            infojs.info('request.getAllResponseHeaders() = ' + request.getAllResponseHeaders(), infoNode);
            infojs.info('request.responseText = ' + request.responseText, infoNode);
            infojs.info('request.response = ' + request.response, infoNode);
            infojs.info('request.response.cookies = ' + request.response.cookies, infoNode);
            // alert('request.getAllResponseHeaders() = ' + request.getAllResponseHeaders());
            infojs.info('request.getResponseHeader("Cookie") = ' + request.getResponseHeader('Cookie'), infoNode);
            infojs.info('request.getResponseHeader("Set-Cookie") = ' + request.getResponseHeader('Set-Cookie'), infoNode);
            setCookie = request.getResponseHeader('Set-Cookie');
            if (setCookie) {
              cookie = 
                setCookie.split(';')[0];
              infojs.info(cookie, infoNode);
              // load.removeAttribute('disabled');
            }
            // alert('request.responseText = ' + request.responseText);
            // alert('request.response = ' + request.response);
          }
        }
        request.send(JSON.stringify({'name': username, 'password': password/*, 'next': '/'*/}));
        // request.send();
        // FIXME: async!
        // return cookie;
      };
      let sessionLogout = (url) => {
        var request;
        request = new XMLHttpRequest();
        request.open('DELETE', url, !!'async');
        request.withCredentials = true;
        // request.setRequestHeader('Authorization', 'Basic ' + btoa(this.shadow.getElementById('user').value + ':' + this.shadow.getElementById('pass').value));
        // Verified to be necessary in Firefox OS to delete cookie.
        request.timeout = XHR_TIMEOUT_MS;
        request.ontimeout = onRequestError;
        request.onerror = onRequestError;
        // request.onreadystatechange = () => {
        // request.onprogress = () => {
        request.onload = () => {
          if (request.readyState == request.DONE) {
            if (request.statusText != 'OK') {
              infojs.info(request.statusText);
              infojs.info(request.responseText);
            }
            var infoNode = this.shadow.getElementById('replication_info');
            infojs.info('request.getAllResponseHeaders() = ' + request.getAllResponseHeaders(), infoNode);
            infojs.info('request.responseText = ' + request.responseText, infoNode);
            infojs.info('request.response = ' + request.response, infoNode);
            // alert('request.getAllResponseHeaders() = ' + request.getAllResponseHeaders());
            // alert('request.getResponseHeader("Set-Cookie") = ' + request.getResponseHeader('Set-Cookie'));
            var data = request.response && JSON.parse(request.response);
            if (data && data.ok) {
              // load.setAttribute('disabled', true);
            }
            // FIXME: async!
            // return data.ok;
          }
        }
        request.send();
        // FIXME: async!
        // return false;
      };
      var onRequestError = (event) => {
        var errorMessage = JSON.stringify(event, [ 'type', 'lengthComputable', 'loaded', 'total' ], 2);
        if (event.type == 'error') {
          infojs.error(`Network request failed. Browser is ${window.navigator.onLine ? 'online' : 'offline'}`);
        }
        showError(errorMessage);
      };

      var showError = (text) => {
        var infoNode = this.shadow.getElementById('replication_info');
        infojs.error(text, infoNode);
        // errorMsg.textContent = text;
        // errorMsg.hidden = false;
        // results.hidden = true;
      };

      var start = () => {

        var message = this.shadow.getElementById('message');

        // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
        // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
        // message.textContent = translate('message');
        message.textContent = 'message';
      };

      infojs.timeEnd('options.js');
    }
    catch(err) {
            infojs.error(err);
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
    infojs.time('toggleOptionsDisplay');
    event.preventDefault();
    event.stopPropagation();
    var optionsElement = this.shadow.querySelector('#options');
    // optionsElement.style.display = 'none';
    if (optionsElement) {
      if (optionsElement.style.display == 'none') {
        // otherView.style.display = 'block';
        optionsElement.style.display = 'block';
        event.target.style.opacity = '0.3';
        // Let user change options...
        optionsElement.scrollIntoView({block: "center", inline: "center"});
      }
      else {
        // reload document location.
        // otherView.style.display = 'none';
        optionsElement.style.display = 'none';
        event.target.style.opacity = '1.0';
        // document.location.reload('force');
        // document.location.reload();
        let options = {};
        this.shadow.querySelectorAll('.persistent').forEach((item) => {
          infojs.info(`get persistent input for ${item.id}`);
          if (item.type == 'checkbox') {
            options[item.id] = item.checked;
          }
          else {
            options[item.id] = item.value;
          }
        });
        appjs.runQuery(options);
      }
    }
    infojs.timeEnd('toggleOptionsDisplay');
  };
}

if (!customElements.get('options-ui')) {
  customElements.define('options-ui', OptionsUI);
}

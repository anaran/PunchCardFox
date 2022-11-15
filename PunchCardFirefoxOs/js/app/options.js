'use strict';

import * as infojs from './info.js';
import * as utilsjs from './utils.js';
// import '../../bower_components/pouchdb/dist/pouchdb.min.js';
import '../../bower_components/pouchdb/dist/pouchdb.js';

// try {
infojs.time('options.js');
var infoNode = document.getElementById('replication_info');
var XHR_TIMEOUT_MS = 65000;
var cookie;
var setCookie;
let loadButton = document.querySelector('#load');
let saveButton = document.querySelector('#save');
// No need to keep a lot of history for user options.
infojs.time('new Pouchdb options');
var optionsDB = new PouchDB('options'/*, { auto_compaction: true }*/);
infojs.timeEnd('new Pouchdb options');
infojs.time('new Pouchdb punchcard');
var punchcardDB = new PouchDB('punchcard');
infojs.timeEnd('new Pouchdb punchcard');
document.addEventListener('readystatechange', (event) => {
  if (event.target.readyState !== 'complete') {
    return;
  }
  document.querySelectorAll('.persistent').forEach((item) => {
    infojs.time(`load ${item.id} from localStorage`);
    if (item.type == 'checkbox') {
      item.checked = (localStorage.getItem(item.id) == 'true');
    }
    else {
      item.value = localStorage.getItem(item.id);
    }
    infojs.timeEnd(`load ${item.id} from localStorage`);
    // Note: Unlike blur this only fires when value has actually changed.
    item.addEventListener('change', function (event) {
      var element = event.target;
      infojs.time(`save changed ${element.id}`);
      var value = element.type == 'checkbox' ? element.checked : element.value;
      localStorage.setItem(element.id, value);
      infojs.timeEnd(`save changed ${element.id}`);
    });
  });
});
let fontSizeSelect = document.getElementById ('punchcard_font_size_select');
let changeFontSize = (element) => {
  document.documentElement.style.fontSize = element.value;
};
changeFontSize(fontSizeSelect);
fontSizeSelect.addEventListener ('change', (event) => changeFontSize(event.target));
let themeSelect = document.getElementById ('punchcard_theme_select');
let changeTheme = (element) => {
  switch (element.value) {
  case "Light": {
    document.body.classList.remove('dark_theme');
    break;
  }
  case "Dark": {
    document.body.classList.add('dark_theme');
    break;
  }
  case "System": {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add('dark_theme');
    }
    else {
      document.body.classList.remove('dark_theme');
    }
    break;
  }
  }
};
changeTheme(themeSelect);
themeSelect.addEventListener ('change', (event) => changeTheme(event.target));

loadButton.addEventListener('click', (event) => {
  infojs.time('optionsDB.allDocs');
  optionsDB.allDocs({
    include_docs: true,
  }).then(function (result) {
    infojs.time('delete no longer used options in optionsDB');
    result.rows && result.rows.forEach(function (row) {
      let element = document.getElementById(row.key);
      if (!element) {
        if (!row.key.startsWith("_design/")) {
          optionsDB.remove({ _id: row.key, _rev: row.value.rev }).then(function(result) {
            infojs.warn(`deleted no longer used ${row.key}, ${row.value.rev}`);
          }).catch(function(err) {
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
  optionsDB.info().then(function (info) {
    infojs.info(info);
    infojs.timeEnd('optionsDB.info()');
  }).catch(function (err) {
    infojs.error(err);
  });
});

saveButton.addEventListener('click', (event) => {
  infojs.time('delete optionsDB conflicts');
  document.querySelectorAll('.persistent').forEach((element) => {
    optionsDB.get(element.id, {
      conflicts: true
    }).then(function(otherDoc) {
      if (otherDoc._conflicts) {
        infojs.info({ conflicts: otherDoc._conflicts }, infoNode);
        // FIXME: just delete conflict for now for options.
        // DON'T DO THIS FOR VALUABLE DOCUMENTS!
        otherDoc._conflicts.forEach(function (conflict) {
          optionsDB.put({
            _id: otherDoc._id,
            _rev: conflict,
            _deleted: true
          }).then(function(response) {
            infojs.info('options db conflict deleted');
            infojs.info(response);
            // document.location.reload('force');
            // saveLink.click();
          }).catch(function(err) {
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
    }).catch(function(err) {
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

var infoNode = document.getElementById('replication_info');
var clearNode = document.getElementById('clear_replication_info');
clearNode.addEventListener('click', function (event) {
  // NOTE Do not go to link, which is somewhat disruptive.
  event.preventDefault();
  if (!infoNode.childElementCount) {
  }
  else {
    Array.prototype.forEach.call(infoNode.querySelectorAll('info-ui'), function(elem) {
      infoNode.removeChild(elem);
    });
  }
});
var optionsStartButton = document.getElementById('options_start_replication');
var optionsStopButton = document.getElementById('options_stop_replication');
var punchcardStartButton = document.getElementById('punchcard_start_replication');
var punchcardStopButton = document.getElementById('punchcard_stop_replication');
var myXHR = function () {
  var request;
  if (false && /* false && */window.location.protocol == "app:") {
    request = new XMLHttpRequest({ mozSystem: true, mozAnon: true });
  }
  else {
    request = new XMLHttpRequest({ mozSystem: false, mozAnon: false });
    // request = new XMLHttpRequest();
  }
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
  // back_off_function: function (delay) {
  //   if (delay === 0) {
  //     return 1000;
  //   }
  //   return delay * 3;
  // }
};
let setupRemoteSync = function _setupRemoteSync(opt) {
  opt.startButton.addEventListener('click', function (event) {
    let dbSync;
    var destination = document.getElementById(opt.protocolId).value +
        document.getElementById(opt.hostportpathId).value;
    var remoteDatabaseName = document.getElementById(opt.remoteDatabaseNameId).value;
    let remoteDB = new PouchDB(destination + remoteDatabaseName, opt.remoteOptions);
    let localDbName = opt.localDB.name;
    let startButton = opt.startButton;
    let stopButton = opt.stopButton;
    let syncOptions = opt.syncOptions;
    let pullOptions = syncOptions;
    var syncType = document.getElementById(opt.syncTypeId).value;
    var verbositySelect = document.getElementById(opt.verbositySelectId);
    var liveSyncing = !!document.getElementById(opt.liveId).checked;
    syncOptions.live = liveSyncing;
    pullOptions.live = liveSyncing;
    if ('activitySizeId' in opt) {
      let activityMaxSyncLength = document.getElementById(opt.activitySizeId).value;
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
      dbSync.on('change', function (info) {
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
          infojs.info(myInfo, infoNode);
        }
      })
        .on('paused', function () {
          // replication paused (e.g. user went offline)
          if (verbositySelect.value == 'verbose') {
            myInfo[localDbName] = "replication paused (e.g. user went offline)";
            infojs.info(myInfo, infoNode);
          }
        })
        .on('active', function () {
          // replicate resumed (e.g. user went back online)
          if (verbositySelect.value == 'verbose') {
            myInfo[localDbName] = "replicate resumed (e.g. user went back online)";
            infojs.info(myInfo, infoNode);
          }
        })
        .on('denied', function (info) {
          // a document failed to replicate, e.g. due to permissions
          if (verbositySelect.value != 'silent') {
            myInfo[localDbName] = info;
            infojs.info(myInfo, infoNode);
          }
        })
        .on('complete', function (info) {
          if (verbositySelect.value != 'silent') {
            myInfo[localDbName] = info;
            infojs.info(myInfo, infoNode);
            remoteDB.info().then(function (info) {
              infojs.info(info, infoNode);
            }).catch(function (err) {
              infojs.error(err, infoNode);
            });
          }
          startButton.removeAttribute('disabled');
          stopButton.setAttribute('disabled', true);
        })
        .on('uptodate', function (info) {
          myInfo[localDbName] = info;
          infojs.info(myInfo, infoNode);
        })
        .on('error', function (err) {
          myInfo[localDbName] = err;
          infojs.error(myInfo, infoNode);
          startButton.removeAttribute('disabled');
          stopButton.setAttribute('disabled', true);
        });
    }
    startButton.setAttribute('disabled', true);
    stopButton.removeAttribute('disabled');
    var cancelSync = function (event) {
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
var include = document.getElementById('include');
var exclude = document.getElementById('exclude');
var includeCase = document.getElementById('include_case');
var excludeCase = document.getElementById('exclude_case');

// include.addEventListener('keypress', function (event) {
//   if (event.key == 'Enter') {
//     if (include.value.length < 3) {
//       window.alert(include.value + ' is too short (< 3)');
//       return;
//     }
//     // searchMatchingActivities();
//   }
//   // console.log(event.type, event);
// });
// exclude.addEventListener('keypress', function (event) {
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
// include.addEventListener('search', function (event) {
//   console.log(event.type, event);
// });
var searchMatchingActivities = function () {
  var includeRegExp = new RegExp(include.value, include_case.checked ? '' : 'i');
  var excludeRegExp = new RegExp(exclude.value, exclude_case.checked ? '' : 'i');
  punchcardDB.allDocs({ limit: 4500, include_docs: true, descending: true }, function(err, doc) {
    if (err) {
      infojs.error(err);
    } else {
      var search = document.getElementById('search');
      search && include.parentElement.removeChild(search);
      search = document.createElement('div');
      search.id = 'search';
      doc.rows.forEach(function (row) {
        if (!includeRegExp.test(row.doc.activity) ||
            exclude.value.length && excludeRegExp.test(row.doc.activity)) {
          return;
        }
        // var start = document.createElement('div');
        // var end = document.createElement('div');
        // white-space: pre-wrap;
        var div = document.createElement('div');
        var diva = document.createElement('div');
        var start = document.createElement('pre');
        // var end = document.createElement('span');
        var activity = document.createElement('pre');
        var repeat = document.createElement('a');
        repeat.href = '#';
        repeat.textContent = 'Repeat now';
        repeat.addEventListener('click', function (event) {
          event.preventDefault();
          var entry = {
            // _id: punchcardDB.post(),
            activity: activity.textContent,
            start: (new Date).toJSON(),
            end: (new Date).toJSON()
          };
          punchcardDB.post(entry).then(function(response) {
            document.querySelector('a.save').click();
          }).catch(function(err) {
            infojs.error(err);
          });
        });
        var edit = document.createElement('a');
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
        //         activity.addEventListener('focus', function (event) {
        //           event.target.removeAttribute('rows');
        //         });
        //         activity.addEventListener('blur', function (event) {
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
      //     var pre = document.createElement('pre');
      //     pre.textContent = JSON.stringify(doc.rows, null, 2);
      //     document.body.appendChild(pre);
    }
  });
};
// ---

var login = document.querySelector('#login');
var logout = document.querySelector('#logout');

// Forms will take the values in the input fields they contain
// and send them to a server for further processing,
// but since we want to stay in this page AND make a request to another server,
// we will listen to the 'submit' event, and prevent the form from doing what
// it would usually do, using preventDefault.
// Read more about it here:
// https://developer.mozilla.org/Web/API/event.preventDefault
//
// Then we search without leaving this page, just as we wanted.
document.getElementById('pass').addEventListener('keypress', function (event) {
  if (event.key == 'Enter') {
    var sessionUrl = document.getElementById('protocol').value +
        document.getElementById('hostportpath').value + '_session';
    if (sessionLogin(sessionUrl, document.getElementById('user').value, event.target.value)) {
    }
  }
  // console.log(event.type, event);
});
login.addEventListener('click', function(e) {
  // e.preventDefault();
  // FIXME: async!
  var sessionUrl = document.getElementById('protocol').value +
      document.getElementById('hostportpath').value + '_session';
  if (sessionLogin(sessionUrl, document.getElementById('user').value, document.getElementById('pass').value)) {
  }
});
logout.addEventListener('click', function(e) {
  var sessionUrl = document.getElementById('protocol').value +
      document.getElementById('hostportpath').value + '_session';
  // e.preventDefault();
  if (sessionLogout(sessionUrl)) {
    cookie = '';
  }
});

// var search = function () {
// 
//   // Are we searching already? Then stop that search
//   if(request && request.abort) {
//     request.abort();
//   }
// 
//   // results.textContent = translate('searching');
// 
//   // We will be using the 'hidden' attribute throughout the app rather than a
//   // 'hidden' CSS class because it enhances accessibility.
//   // See: http://www.whatwg.org/specs/web-apps/current-work/multipage/editing.html#the-hidden-attribute
//   results.hidden = false;
//   errorMsg.hidden = true;
// 
// 
//   var term = searchInput.value;
//   if(term.length === 0) {
//     term = searchInput.placeholder;
//   }
// 
//   var url = term;
//   jsonFrame.src = url;
//   try {
//     if (!cookie) {
//       window.alert('Please press Login');
//       return;
//     }
//     // If you don't set the mozSystem option, you'll get CORS errors (Cross Origin Resource Sharing)
//     // You can read more about CORS here: https://developer.mozilla.org/docs/HTTP/Access_control_CORS
//     // request = new XMLHttpRequest({ mozSystem: true, withCredentials: true });
//     request = new XMLHttpRequest({ mozSystem: false, mozAnon: true });
//     // request.overrideMimeType("application/json");
//     request.open('GET', url, !!'async');
//     request.setRequestHeader('Cookie', cookie);
//     request.timeout = XHR_TIMEOUT_MS;
//     request.ontimeout = onRequestError;
//     request.onerror = onRequestError;
//     // request.addEventListener('error', onRequestError);
//     request.send();
//     request.onreadystatechange = function() {
//       if (this.readyState == request.DONE) {
//         // alert('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders());
//         // alert('this.getResponseHeader("Set-Cookie") = ' + this.getResponseHeader('Set-Cookie'));
//         // cookie = this.getResponseHeader('Set-Cookie').split(';')[0];
//         // alert('request.responseText = ' + request.responseText);
//         // alert('request.response = ' + request.response);
//         if(request.response === null) {
//           // showError(translate('searching_error'));
//           showError('searching_error');
//           return;
//         }
//         jsonText.textContent = request.response;
//         reportError(jsonText);
//       }
//     }
//   } catch (e) {
//     infojs.error(e, infoNode);
//   }
// };
//   }
// });
export let sessionLogin = function (url, username, password) {
  // Returns AuthSession header in Firefox OS App with systemXHR permission
  var request;
  if (false && /* false && */window.location.protocol == "app:") {
    request = new XMLHttpRequest({ mozSystem: true, mozAnon: true });
  }
  else {
    request = new XMLHttpRequest({ mozSystem: false, mozAnon: false });
    // request = new XMLHttpRequest();
  }
  // TODO: sends username:password@ as part of the URL, exposing password in firefox net log!
  // NOTE: fauxton uses Authorization Basic
  // request.open('POST', url, !!'async'/*, username, password*/);
  request.open('POST', url, !!'async'/*, username, password*/);
  // if (/* false && */window.location.protocol == "app:") {
  // }
  // else {
  // }
  // request.withCredentials = true;
  request.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
  // request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  // request.open('POST', url, !!'async', username, password);
  // request.open('POST', url, !!'async', '_', '_');
  // Required both in Firefox OS and Web App
  // request.setRequestHeader('X-PINGOTHER', 'pingpong');
  if (false && /* false && */window.location.protocol == "app:") {
  }
  else {
    request.withCredentials = true;
  }
  // request.setRequestHeader('Access-Control-Expose-Headers', 'Cookie, Set-Cookie');
  // request.setRequestHeader('Access-Control-Request-Headers', 'authorization,content-type,Set-Cookie');
  request.timeout = XHR_TIMEOUT_MS;
  request.ontimeout = onRequestError;
  request.onerror = onRequestError;
  // request.setRequestHeader('Content-Type', 'text/plain');
  request.setRequestHeader('Content-Type', 'application/json');
  // request.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
  // request.setRequestHeader('Accept', 'application/json');
  //request.setRequestHeader('Access-Control-Allow-Credentials', 'true');
  // Seems to be equivalent to state request.DONE
  // request.onload = function() {
  //     var infoNode = document.getElementById('replication_info');
  //     infojs.info('request.onloadend ... ', infoNode);
  //     infojs.info('this.readyState = ' + this.readyState, infoNode);
  //     infojs.info('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders(), infoNode);
  //     infojs.info('request.responseText = ' + request.responseText, infoNode);
  //     infojs.info('request.response = ' + request.response, infoNode);
  // };
  // request.onreadystatechange = function() {
  // request.onprogress = function() {
  request.onload = function() {
    // if (this.status == 401 || this.status == 0) {
    //   this.abort();
    // }
    if (/*true || */this.readyState == request.DONE) {
      if (this.statusText != 'OK') {
        infojs.error(request.responseText);
      }
      var infoNode = document.getElementById('replication_info');
      infojs.info('this.readyState = ' + this.readyState, infoNode);
      infojs.info('this.status = ' + this.status, infoNode);
      infojs.info('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders(), infoNode);
      infojs.info('request.responseText = ' + request.responseText, infoNode);
      infojs.info('request.response = ' + request.response, infoNode);
      infojs.info('request.response.cookies = ' + request.response.cookies, infoNode);
      // alert('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders());
      infojs.info('this.getResponseHeader("Cookie") = ' + this.getResponseHeader('Cookie'), infoNode);
      infojs.info('this.getResponseHeader("Set-Cookie") = ' + this.getResponseHeader('Set-Cookie'), infoNode);
      setCookie = this.getResponseHeader('Set-Cookie');
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
export let sessionLogout = function (url) {
  var request;
  if (false && /* false && */window.location.protocol == "app:") {
    request = new XMLHttpRequest({ mozSystem: true, mozAnon: true });
  }
  else {
    request = new XMLHttpRequest({ mozSystem: false, mozAnon: false });
    // request = new XMLHttpRequest();
  }
  request.open('DELETE', url, !!'async');
  if (false && /* false && */window.location.protocol == "app:") {
    request.setRequestHeader('Cookie', cookie);
    cookie = "";
  }
  else {
    request.withCredentials = true;
  }
  // request.setRequestHeader('Authorization', 'Basic ' + btoa(document.getElementById('user').value + ':' + document.getElementById('pass').value));
  // Verified to be necessary in Firefox OS to delete cookie.
  request.timeout = XHR_TIMEOUT_MS;
  request.ontimeout = onRequestError;
  request.onerror = onRequestError;
  // request.onreadystatechange = function() {
  // request.onprogress = function() {
  request.onload = function() {
    if (/* true || */this.readyState == request.DONE) {
      if (this.statusText != 'OK') {
        infojs.info(this.statusText);
        infojs.info(request.responseText);
      }
      var infoNode = document.getElementById('replication_info');
      infojs.info('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders(), infoNode);
      infojs.info('request.responseText = ' + request.responseText, infoNode);
      infojs.info('request.response = ' + request.response, infoNode);
      // alert('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders());
      // alert('this.getResponseHeader("Set-Cookie") = ' + this.getResponseHeader('Set-Cookie'));
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
var onRequestError = function (event) {
  var errorMessage = JSON.stringify(event, [ 'type', 'lengthComputable', 'loaded', 'total' ], 2);
  if (event.type == 'error') {
    infojs.error(`Network request failed. Browser is ${window.navigator.onLine ? 'online' : 'offline'}`);
  }
  showError(errorMessage);
};

var showError = function (text) {
  var infoNode = document.getElementById('replication_info');
  infojs.error(text, infoNode);
  // errorMsg.textContent = text;
  // errorMsg.hidden = false;
  // results.hidden = true;
};
var start = function () {

  var message = document.getElementById('message');

  // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
  // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
  // message.textContent = translate('message');
  message.textContent = 'message';

};
// document.body.style.display = 'none';
// export default {
//   sessionLogin,
//   sessionLogout
// };
// }
// catch (e) {
//   window.alert(e.message + '\n' + e.stack);
// }
infojs.timeEnd('options.js');

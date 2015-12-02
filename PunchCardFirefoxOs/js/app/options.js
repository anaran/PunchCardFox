'use strict';
// try {
define(['app/info', 'app/utils'], function (infojs, utilsjs) {
  // define(['require', 'info', 'gaia-header', 'template!../new_entry.html'], function (require, info, gh, newElement) {
  // DOMContentLoaded is fired once the document has been loaded and parsed,
  // but without waiting for other external resources to load (css/images/etc)
  // That makes the app more responsive and perceived as faster.
  // https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
  // NOTE TEmporarily comment out event listener to understand why code does not run when loaded by alameda (requirejs).
  // TODO See also https://github.com/jrburke/requirejs/issues/463
  // window.addEventListener('DOMContentLoaded', function() {
  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  var DEBUG = false;

  var addReadOnlyInfo = infojs;
  var XHR_TIMEOUT_MS = 30000;
  var cookie;
  var setCookie;
  var db = new PouchDB('punchcard3');
  // No need to keep a lot of history for user options.
  var optionsDB = new PouchDB('options', { auto_compaction: true });
  var persistentNodeList = document.querySelectorAll('.persistent');
  Array.prototype.forEach.call(persistentNodeList, function (element) {
    optionsDB.get(element.id).then(function(otherDoc) {
      if (element.type == 'checkbox') {
        element.checked = otherDoc.value;
      }
      else {
        element.value = otherDoc.value;
      }
    }).catch(function(err) {
      //errors
      console.log(err, element);
      var value = element.type == 'checkbox' ? element.checked : element.value;
      if (element.id) {
        return optionsDB.put({ _id: element.id, value: value });
      }
      else {
        console.log("no id for saving options doc", element);
      }
    });
    // Note: Unlike blur this only fires when value has actually changed.
    element.addEventListener('change', function (event) {
      var element = event.target;
      console.log(element.id, 'changed');
      var value = element.type == 'checkbox' ? element.checked : element.value;
      optionsDB.get(element.id).then(function(otherDoc) {
        otherDoc.value = value;
        return optionsDB.put(otherDoc).then(function(response) {
          console.log('saved changed option', response);
          // document.location.reload('force');
          // saveLink.click();
        }).catch(function(err) {
          //errors
          console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        });
      }).catch(function(err) {
        console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        if (element.id) {
          return optionsDB.put({ _id: element.id, value: value });
        }
        else {
          console.log("no id for saving options doc", element);
        }
      });
    });
  });
  optionsDB.allDocs({
    include_docs: false
  }).then(function (result) {
    result.rows && result.rows.forEach(function (row) {
      if (!Array.prototype.map.call(persistentNodeList, function (element) { return element.id }).includes(row.key)) {
        optionsDB.remove({ _id: row.key, _rev: row.value.rev }).then(function(result) {
          console.log('deleted no longer used', row.key, row.value.rev);
        }).catch(function(err) {
          console.log(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        });
      }
    });
  });
  // var options = [
  //   'protocol',
  //   'user',
  //   'pass',
  //   'hostportpath'
  // ];
  // options.forEach(function (option) {
  //   optionsDB.get(option, function (err, doc) {
  //     var input = document.getElementById(option);
  //     input.addEventListener('blur', function (event) {
  //       optionsDB.put({ value: event.target.value }, option, err ? undefined : doc._rev);
  //     });
  //     if (err) {
  //       // window.alert(JSON.stringify(err, null, 2));
  //     }
  //     if (doc.value) {
  //       // window.alert(JSON.stringify(doc, null, 2));
  //       input.value = doc.value;
  //     }
  //     // DEBUG && console.log(doc);
  //   });
  // });
  var exportButton = document.getElementById('export');
  exportButton.addEventListener('click', function (event) {
    db.allDocs({
      include_docs: true/*, 
  attachments: true*/
    }).then(function (result) {
      // handle result
      var div = document.createElement('div');
      var download = document.createElement('a');
      var blob = new window.Blob([JSON.stringify(result, null, 2)], {
        type: 'text/plain; charset=utf-8'
      });
      download.href = window.URL.createObjectURL(blob);
      download.download = 'punchcard-' + result.total_rows + '-' + Date.now() + '.txt';
      download.textContent = 'Download exported data';
      div.appendChild(download);
      exportButton.nextElementSibling.appendChild(div);
      // document.body.appendChild(div);
    }).catch(function (err) {
      console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    });
  });
  var startButton = document.getElementById('start_replication');
  startButton.addEventListener('click', function (event) {
    // TODO Adjust when using more than one template!
    // var imp = document.createElement('link');
    // imp.href = '/build/new_entry.html';
    // imp.rel = 'import';
    // imp.onload = function(e) {
    //   window.alert(e.type, e.target.import);
    // };
    // imp.onerror = function(e) {
    //   window.alert(e.type);
    // };
    // document.head.appendChild(imp);
    // var link = document.querySelector('link[rel=import]');
    // var ne = link.import;
    // var newEntry = ne.querySelector('template');
    // var clonedNewEntry = newEntry.cloneNode(true);
    // document.body.appendChild(clonedNewEntry);
    var destination = document.getElementById('protocol').value +
        document.getElementById('hostportpath').value;
    // window.alert('replicating starts for destination\n' + destination);
    //     var opts = {auth:
    //                     {'username': document.getElementById('user').value,
    //                      'password': document.getElementById('pass').value
    //                     },
    //                     headers: {
    //                       'Content-Type': 'application/json'
    //                     }};
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
        timeout: 30000
      }
    };
    var remoteOptionsDB = new PouchDB(destination + optionsDB._db_name, opts);
    var remoteDB = new PouchDB(destination + db._db_name, opts);
    var infoNode = document.getElementById('replication_info');
    var clearNode = document.getElementById('clear-input-right');
    clearNode.addEventListener('click', function (event) {
      event.preventDefault();
      infoNode.textContent = '';
    });
    var verbositySelect = document.getElementById('verbosity');
    var syncOptions = {
      live: true,
      retry: true,
      // back_off_function: function (delay) {
      //   if (delay === 0) {
      //     return 1000;
      //   }
      //   return delay * 3;
      // }
    };
    // NOTE: Don't share variables in asynchronuous code!
    // myInfo = {};
    var myOptionsInfo = {};
    var optionsSync = optionsDB.sync(remoteOptionsDB, syncOptions)
    .on('change', function (info) {
      if (verbositySelect.value != 'verbose') {
        if (info.change &&  info.change.docs) {
          info.change.docs = ["..."];
        } 
      }
      if (verbositySelect.value != 'silent') {
        myOptionsInfo[optionsDB._db_name] = info;
        addReadOnlyInfo(myOptionsInfo, infoNode);
      }
    })
    .on('paused', function () {
      // replication paused (e.g. user went offline)
      if (verbositySelect.value != 'silent') {
        myOptionsInfo[optionsDB._db_name] = "replication paused (e.g. user went offline)";
        addReadOnlyInfo(myOptionsInfo, infoNode);
      }
    }).on('active', function () {
      // replicate resumed (e.g. user went back online)
      if (verbositySelect.value != 'silent') {
        myOptionsInfo[optionsDB._db_name] = "replicate resumed (e.g. user went back online)";
        addReadOnlyInfo(myOptionsInfo, infoNode);
      }
    }).on('denied', function (info) {
      // a document failed to replicate, e.g. due to permissions
      if (verbositySelect.value != 'silent') {
        myOptionsInfo[optionsDB._db_name] = info;
        addReadOnlyInfo(myOptionsInfo, infoNode);
      }
    })
    .on('complete', function (info) {
      if (verbositySelect.value != 'silent') {
        myOptionsInfo[optionsDB._db_name] = info;
        addReadOnlyInfo(myOptionsInfo, infoNode);
        remoteOptionsDB.info().then(function (info) {
          addReadOnlyInfo(info, infoNode);
        }).catch(function (err) {
          addReadOnlyInfo(err, infoNode);
        });
      }
    })
    .on('uptodate', function (info) {
      myOptionsInfo[optionsDB._db_name] = info;
      addReadOnlyInfo(myOptionsInfo, infoNode);
    })
    .on('error', function (err) {
      myOptionsInfo[optionsDB._db_name] = err;
      addReadOnlyInfo(myOptionsInfo, infoNode);
      // console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    });
    var myInfo = {};
    var dbSync = db.sync(remoteDB, syncOptions)
    .on('change', function (info) {
      if (verbositySelect.value != 'verbose') {
        if (info.change &&  info.change.docs) {
          info.change.docs = ["..."];
        } 
      }
      if (verbositySelect.value != 'silent') {
        myInfo[db._db_name] = info;
        addReadOnlyInfo(myInfo, infoNode);
      }
    })
    .on('paused', function () {
      // replication paused (e.g. user went offline)
      if (verbositySelect.value != 'silent') {
        myInfo[db._db_name] = "replication paused (e.g. user went offline)";
        addReadOnlyInfo(myInfo, infoNode);
      }
    }).on('active', function () {
      // replicate resumed (e.g. user went back online)
      if (verbositySelect.value != 'silent') {
        myInfo[db._db_name] = "replicate resumed (e.g. user went back online)";
        addReadOnlyInfo(myInfo, infoNode);
      }
    }).on('denied', function (info) {
      // a document failed to replicate, e.g. due to permissions
      if (verbositySelect.value != 'silent') {
        myInfo[db._db_name] = info;
        addReadOnlyInfo(myInfo, infoNode);
      }
    })
    .on('complete', function (info) {
      if (verbositySelect.value != 'silent') {
        myInfo[db._db_name] = info;
        addReadOnlyInfo(myInfo, infoNode);
        remoteDB.info().then(function (info) {
          addReadOnlyInfo(info, infoNode);
        }).catch(function (err) {
          addReadOnlyInfo(err, infoNode);
        });
      }
    })
    .on('uptodate', function (info) {
      myInfo[db._db_name] = info;
      addReadOnlyInfo(myInfo, infoNode);
    })
    .on('error', function (err) {
      myInfo[db._db_name] = err;
      addReadOnlyInfo(myInfo, infoNode);
      // console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    });
    var stop = document.getElementById('stop_replication');
    stop.removeAttribute('disabled');
    event.target.setAttribute('disabled', true);
    if (optionsSync && dbSync) {
      stop.addEventListener('click', function (event) {
        startButton.removeAttribute('disabled');
        event.target.setAttribute('disabled', true);
        optionsSync.cancel();
        dbSync.cancel();
      });
    }
  });

  var include = document.getElementById('include');
  var exclude = document.getElementById('exclude');
  var includeCase = document.getElementById('include_case');
  var excludeCase = document.getElementById('exclude_case');

  include.addEventListener('keypress', function (event) {
    if (event.keyCode == 13) {
      if (include.value.length < 3) {
        window.alert(include.value + ' is too short (< 3)');
        return;
      }
      // searchMatchingActivities();
    }
    // console.log(event.type, event);
  });
  exclude.addEventListener('keypress', function (event) {
    if (event.keyCode == 13) {
      if (include.value.length < 3) {
        window.alert(include.value + ' is too short (< 3)');
        return;
      }
      // searchMatchingActivities();
    }
    // console.log(event.type, event);
  });
  // NOTE Seem to be supported by desktop safari only:
  // https://developer.mozilla.org/en-US/docs/Web/Events/search#Browser_compatibility
  // include.addEventListener('search', function (event) {
  //   console.log(event.type, event);
  // });
  var searchMatchingActivities = function () {
    var includeRegExp = new RegExp(include.value, include_case.checked ? '' : 'i');
    var excludeRegExp = new RegExp(exclude.value, exclude_case.checked ? '' : 'i');
    db.allDocs({ limit: 4500, include_docs: true, descending: true }, function(err, doc) {
      if (err) {
        console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
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
              // _id: db.post(),
              activity: activity.textContent,
              start: (new Date).toJSON(),
              end: (new Date).toJSON()
            };
            DEBUG && console.log(JSON.stringify(entry, null, 2));
            db.post(entry).then(function(response) {
              document.querySelector('a.save').click();
            }).catch(function(err) {
              //errors
              console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
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
          start.textContent = utilsjs.formatStartDate(new Date(row.doc.start));
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

  var login = document.querySelector('button#login');
  var logout = document.querySelector('button#logout');

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
    if (event.keyCode == 13) {
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

  var search = function () {

    // Are we searching already? Then stop that search
    if(request && request.abort) {
      request.abort();
    }

    // results.textContent = translate('searching');

    // We will be using the 'hidden' attribute throughout the app rather than a
    // 'hidden' CSS class because it enhances accessibility.
    // See: http://www.whatwg.org/specs/web-apps/current-work/multipage/editing.html#the-hidden-attribute
    results.hidden = false;
    errorMsg.hidden = true;


    var term = searchInput.value;
    if(term.length === 0) {
      term = searchInput.placeholder;
    }

    var url = term;
    jsonFrame.src = url;
    try {
      if (!cookie) {
        window.alert('Please press Login');
        return;
      }
      // If you don't set the mozSystem option, you'll get CORS errors (Cross Origin Resource Sharing)
      // You can read more about CORS here: https://developer.mozilla.org/docs/HTTP/Access_control_CORS
      // request = new XMLHttpRequest({ mozSystem: true, withCredentials: true });
      request = new XMLHttpRequest({ mozSystem: false, mozAnon: true });
      // request.overrideMimeType("application/json");
      request.open('GET', url, !!'async');
      request.setRequestHeader('Cookie', cookie);
      request.timeout = XHR_TIMEOUT_MS;
      request.ontimeout = onRequestError;
      request.onerror = onRequestError;
      // request.addEventListener('error', onRequestError);
      request.send();
      request.onreadystatechange = function() {
        if (this.readyState == request.DONE) {
          // alert('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders());
          // alert('this.getResponseHeader("Set-Cookie") = ' + this.getResponseHeader('Set-Cookie'));
          // cookie = this.getResponseHeader('Set-Cookie').split(';')[0];
          // alert('request.responseText = ' + request.responseText);
          // alert('request.response = ' + request.response);
          if(request.response === null) {
            // showError(translate('searching_error'));
            showError('searching_error');
            return;
          }
          jsonText.textContent = request.response;
          reportError(jsonText);
        }
      }
    } catch (e) {
      alert(e.message + '\n' + e.stack);
      // alert(JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    }
  };

  var sessionLogin = function (url, username, password) {
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
    //     addReadOnlyInfo('request.onloadend ... ', infoNode);
    //     addReadOnlyInfo('this.readyState = ' + this.readyState, infoNode);
    //     addReadOnlyInfo('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders(), infoNode);
    //     addReadOnlyInfo('request.responseText = ' + request.responseText, infoNode);
    //     addReadOnlyInfo('request.response = ' + request.response, infoNode);
    // };
    // request.onreadystatechange = function() {
    // request.onprogress = function() {
    request.onload = function() {
      // if (this.status == 401 || this.status == 0) {
      //   this.abort();
      // }
      if (/*true || */this.readyState == request.DONE) {
        var infoNode = document.getElementById('replication_info');
        addReadOnlyInfo('this.readyState = ' + this.readyState, infoNode);
        addReadOnlyInfo('this.status = ' + this.status, infoNode);
        addReadOnlyInfo('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders(), infoNode);
        addReadOnlyInfo('request.responseText = ' + request.responseText, infoNode);
        addReadOnlyInfo('request.response = ' + request.response, infoNode);
        addReadOnlyInfo('request.response.cookies = ' + request.response.cookies, infoNode);
        // alert('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders());
        addReadOnlyInfo('this.getResponseHeader("Cookie") = ' + this.getResponseHeader('Cookie'), infoNode);
        addReadOnlyInfo('this.getResponseHeader("Set-Cookie") = ' + this.getResponseHeader('Set-Cookie'), infoNode);
        setCookie = this.getResponseHeader('Set-Cookie');
        if (setCookie) {
          cookie = 
            setCookie.split(';')[0];
          addReadOnlyInfo(cookie, infoNode);
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

  var sessionLogout = function (url) {
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
        var infoNode = document.getElementById('replication_info');
        addReadOnlyInfo('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders(), infoNode);
        addReadOnlyInfo('request.responseText = ' + request.responseText, infoNode);
        addReadOnlyInfo('request.response = ' + request.response, infoNode);
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
      window.alert('Please press Login');
    }
    // alert(errorMessage);
    showError(errorMessage);
  };

  var showError = function (text) {
    var infoNode = document.getElementById('replication_info');
    addReadOnlyInfo(text, infoNode);
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
  return {
    login: sessionLogin,
    logout: sessionLogout
  };
});
// }
// catch (e) {
//   window.alert(e.message + '\n' + e.stack);
// }

'use strict';
// try {
  define(function (require) {
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

    var addReadOnlyInfo = require('app/info');
    var XHR_TIMEOUT_MS = 30000;
    var cookie;
    // var translate = navigator.mozL10n.get;
    // var addReadOnlyInfo = require(['js/info.js']);
    // var addReadOnlyInfo = require('../../js/info.js');

    // We want to wait until the localisations library has loaded all the strings.
    // So we'll tell it to let us know once it's ready.
    // navigator.mozL10n.once(start);
    var db = new PouchDB('punchcard3');
    var optionsDB = new PouchDB('options');
    var inputNodeList = document.querySelectorAll('input');
    Array.prototype.forEach.call(inputNodeList, function (element) {
      optionsDB.get(element.id).then(function(otherDoc) {
        if (element.type == 'checkbox') {
          element.checked = otherDoc.value;
        }
        else {
          element.value = otherDoc.value;
        }
      }).catch(function(err) {
        //errors
        console.log(err);
        var value = element.type == 'checkbox' ? element.checked : element.value;
        return optionsDB.put({ _id: element.id, value: value });
      });
      element.addEventListener('blur', function (event) {
        var value = event.target.type == 'checkbox' ? event.target.checked : event.target.value;
        optionsDB.get(event.target.id).then(function(otherDoc) {
          otherDoc.value = value;
          return optionsDB.put(otherDoc).then(function(response) {
            // document.location.reload('force');
            // saveLink.click();
          }).catch(function(err) {
            //errors
            window.alert(err);
          });
        }).catch(function(err) {
          //errors
          window.alert(err.message + '\n' + err.stack);
          return optionsDB.put({ _id: event.target.id, value: value });
        });
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
        window.alert(err);
      });
    });
    var start = document.getElementById('start_replication');
    var stop = document.getElementById('stop_replication');
    start.addEventListener('click', function (event) {
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
          document.getElementById('hostportpath').value + db._db_name;
      // window.alert('replicating starts for destination\n' + destination);
      //     var opts = {auth:
      //                     {'username': document.getElementById('user').value,
      //                      'password': document.getElementById('pass').value
      //                     },
      //                     headers: {
      //                       'Content-Type': 'application/json'
      //                     }};
      var opts = {
        method: 'POST',
        auth:
        {'username': document.getElementById('user').value,
         'password': document.getElementById('pass').value
        },
        // ajax: {
        // 'Cookie': cookie/*'JSESSIONID=1wtfchn9kjjn7xywspx4jz2z1'*/
        // },
        headers: {
          // 'AuthSession': cookie.split('=')[1]/*'JSESSIONID=1wtfchn9kjjn7xywspx4jz2z1'*/
          //'Accept': 'application/json',
          //'Content-Type': 'application/json',
          // 'Accept': 'text/chunked',
          // 'Content-Type': 'text/chunked'
          // 'Accept': 'text/plain',
          // 'Content-Type': 'text/plain'
          //'Access-Control-Request-Method': 'POST'
          //           'Authorization': 'Basic ' +
          //           window.btoa(document.getElementById('user').value + ':' +
          //                       document.getElementById('pass').value)
        }
        //}
      };
      var remoteDB = new PouchDB(destination, opts);
      var infoNode = document.getElementById('replication_info');
      // var remoteDB = new PouchDB(destination);
      remoteDB.info(function (err, info) {
        if (err) {
          addReadOnlyInfo(err, infoNode);
        } else {
          // TypeError: cyclic object value
          // pre.textContent = JSON.stringify(remoteDB, null, 2);
          addReadOnlyInfo(info, infoNode);
        }
        // DEBUG && console.log(info);
      });
      //       var remoteDB = new PouchDB(destination);
      var replication = db.sync(remoteDB)
      .on('change', function (info) {
        addReadOnlyInfo(info, infoNode);
        // window.alert(info);
        // handle change
      }).on('complete', function (info) {
        addReadOnlyInfo(info, infoNode);
        // window.alert(info);
        // handle complete
      }).on('uptodate', function (info) {
        addReadOnlyInfo(info, infoNode);
        // window.alert(info);
        // handle up-to-date
      }).on('error', function (err) {
        addReadOnlyInfo(err, infoNode);
        window.alert(err);
        // shandle error
      });
      // var source = document.getElementById('protocol').value +
      //       document.getElementById('user').value + ':' +
      //       window.encodeURIComponent(document.getElementById('pass').value) + '@' +
      //       document.getElementById('hostportpath').value + 'apa-test-2';
      //   stop.addEventListener('click', function (event) {
      //     window.alert('replicating stop...');
      //     replication.cancel(); // whenever you want to cancel
      //   });
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
          window.alert(err);
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
              DEBUG && window.alert(JSON.stringify(entry, null, 2));
              db.post(entry).then(function(response) {
                document.querySelector('a.save').click();
              }).catch(function(err) {
                //errors
                window.alert(err);
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
            start.textContent = (new Date(row.doc.start)).toString().substring(0, 24);
            // end.textContent = (new Date(row.doc.end)).toString().substring(0, 24);
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
      var sessionUrl = document.getElementById('protocol').value +
          document.getElementById('hostportpath').value + '_session';
      if (event.keyCode == 13) {
        if (sessionLogin(sessionUrl, document.getElementById('user').value, event.target.value)) {
        }
      }
      // console.log(event.type, event);
    });
    // login.addEventListener('click', function(e) {
    //   e.preventDefault();
    //   
    //   // FIXME: async!
    //   if (sessionLogin(sessionUrl, document.getElementById('user').value, password)) {
    //   }
    // });
    logout.addEventListener('click', function(e) {
      e.preventDefault();
      if (sessionLogout(sessionUrl)) {
        cookie = '';
      }
    });

    // We want to wait until the localisations library has loaded all the strings.
    // So we'll tell it to let us know once it's ready.
    // navigator.mozL10n.once(search);

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
        request = new XMLHttpRequest({ mozSystem: false, withCredentials: true });
        // request.overrideMimeType("application/json");
        request.open('GET', url, !!'async');
        request.setRequestHeader('Cookie', cookie);
        request.timeout = XHR_TIMEOUT_MS;
        request.ontimeout = onRequestError;
        request.onerror = onRequestError;
        // request.addEventListener('error', onRequestError);
        request.send();
        request.onreadystatechange = function() {
          if (this.readyState == 4) {
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
      var request = new XMLHttpRequest({ mozSystem: true, withCredentials: true });
      // TODO: sends username:password@ as part of the URL, exposing password in firefox net log!
      // NOTE: fauxton uses Authorization Basic
      // request.open('POST', url, !!'async'/*, username, password*/);
      request.open('POST', url, !!'async'/*, username, password*/);
      // request.open('POST', url, !!'async', username, password);
      // request.open('POST', url, !!'async', '_', '_');
      request.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
      request.timeout = XHR_TIMEOUT_MS;
      request.ontimeout = onRequestError;
      request.onerror = onRequestError;
      request.setRequestHeader('Content-Type', 'application/json');
      // request.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
      request.send(JSON.stringify({'name': username, 'password': password}));
      // request.send();
      request.onreadystatechange = function() {
        if (this.readyState == 4) {
          // alert('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders());
          // alert('this.getResponseHeader("Set-Cookie") = ' + this.getResponseHeader('Set-Cookie'));
          cookie = this.getResponseHeader('Set-Cookie').split(';')[0];
          if (cookie && cookie.length) {
            addReadOnlyInfo(cookie, document.body);
            // load.removeAttribute('disabled');
          }
          // alert('request.responseText = ' + request.responseText);
          // alert('request.response = ' + request.response);
        }
      }
      // FIXME: async!
      // return cookie;
    };

    var sessionLogout = function (url) {
      var request = new XMLHttpRequest({ mozSystem: true, withCredentials: true });
      request.open('DELETE', url, !!'async');
      request.setRequestHeader('Cookie', cookie);
      request.timeout = XHR_TIMEOUT_MS;
      request.ontimeout = onRequestError;
      request.onerror = onRequestError;
      request.send();
      request.onreadystatechange = function() {
        if (this.readyState == 4) {
          // alert('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders());
          // alert('this.getResponseHeader("Set-Cookie") = ' + this.getResponseHeader('Set-Cookie'));
          var data = JSON.parse(request.response);
          if (data && data.ok) {
            // load.setAttribute('disabled', true);
          }
          // FIXME: async!
          // return data.ok;
        }
      }
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


    var onRequestLoad = function () {

      //     var response = request.responseText;
      var arraybuffer = request.response;
      if(response === null) {
        // showError(translate('searching_error'));
        showError('searching_error');
        return;
      }
      jsonText.textContent = response;
      reportError(jsonText);
      return;
      results.textContent = '';

      var documents = response.documents;

      if(documents.length === 0) {

        var p = document.createElement('p');
        // p.textContent = translate('search_no_results');
        p.textContent = 'search_no_results';
        results.appendChild(p);

      } else {

        documents.forEach(function(doc) {

          // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
          // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
          var docLink = document.createElement('a');
          docLink.textContent = doc.title;
          docLink.href = doc.url;

          // We want the links to open in a pop up window with a 'close'
          // button, so that the user can consult the result and then close it and
          // be brought back to our app.
          // If we did nothing, these external links would take over the entirety
          // our app and there would be no way for a user to go back to the app.
          // But Firefox OS allows us to open ONE new window per app; these new
          // windows will have a close button, so the user can close the overlay
          // when they're happy with what they've read.
          // Therefore we will capture click events on links, stop them from
          // doing their usual thing using preventDefault(),
          // and then open the link but in a new window.
          docLink.addEventListener('click', function(evt) {
            evt.preventDefault();
            window.open(evt.target.href, 'overlay');
          });

          var h2 = document.createElement('h2');
          h2.appendChild(docLink);
          results.appendChild(h2);

        });

      }

      // And once we have all the content in place, we can show it.
      results.hidden = false;

    };


    var showError = function (text) {
      addReadOnlyInfo(text, document.body);
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

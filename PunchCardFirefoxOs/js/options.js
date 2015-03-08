// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
try {
  window.addEventListener('DOMContentLoaded', function() {
    // We'll ask the browser to use strict code to help us catch errors earlier.
    // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
    'use strict';
    var DEBUG = false;

    var translate = navigator.mozL10n.get;
    var addReadOnlyInfo = function (info, element) {
      var pre = document.createElement('pre');
      pre.contentEditable = true;
      // Does not work, set attribute instead.
      // pre.readOnly = true;
      pre.setAttribute('readonly', true);
      pre.textContent = JSON.stringify(info, null, 2);
      element.appendChild(pre);
    }

    // We want to wait until the localisations library has loaded all the strings.
    // So we'll tell it to let us know once it's ready.
    navigator.mozL10n.once(start);
    var db = new PouchDB('punchcard3');
    var optionsDB = new PouchDB('options');
    var options = [
      'protocol',
      'user',
      'pass',
      'hostportpath'
    ];
    options.forEach(function (option) {
      optionsDB.get(option, function (err, doc) {
        var input = document.getElementById(option);
        input.addEventListener('blur', function (event) {
          optionsDB.put({ value: event.target.value }, option, err ? undefined : doc._rev);
        });
        if (err) {
          // window.alert(JSON.stringify(err, null, 2));
        }
        if (doc.value) {
          // window.alert(JSON.stringify(doc, null, 2));
          input.value = doc.value;
        }
        // DEBUG && console.log(doc);
      });
    });
    var start = document.getElementById('start');
    var stop = document.getElementById('stop');
    start.addEventListener('click', function (event) {
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
        headers: {
          // 'Accept': 'application/json',
          // 'Content-Type': 'application/json'
          // 'Accept': 'text/chunked',
          // 'Content-Type': 'text/chunked'
          // 'Accept': 'text/plain',
          // 'Content-Type': 'text/plain'
          //           // 'Cookie': 'JSESSIONID=1wtfchn9kjjn7xywspx4jz2z1',
          //           // 'Access-Control-Request-Method': 'POST',
          //           'Authorization': 'Basic ' +
          //           window.btoa(document.getElementById('user').value + ':' +
          //                       document.getElementById('pass').value)
        }
      };
      var remoteDB = new PouchDB(destination, opts);
      // var remoteDB = new PouchDB(destination);
      remoteDB.info(function (err, info) {
        if (err) {
          addReadOnlyInfo(err, document.body);
        } else {
          // TypeError: cyclic object value
          // pre.textContent = JSON.stringify(remoteDB, null, 2);
          addReadOnlyInfo(info, document.body);
        }
        // DEBUG && console.log(info);
      });
      //       var remoteDB = new PouchDB(destination);
      var replication = db.sync(remoteDB)
      .on('change', function (info) {
        addReadOnlyInfo(info, document.body);
        // window.alert(info);
        // handle change
      }).on('complete', function (info) {
        addReadOnlyInfo(info, document.body);
        // window.alert(info);
        // handle complete
      }).on('uptodate', function (info) {
        addReadOnlyInfo(info, document.body);
        // window.alert(info);
        // handle up-to-date
      }).on('error', function (err) {
        addReadOnlyInfo(err, document.body);
        window.alert(err);
        // shandle error
      });
      // var source = document.getElementById('protocol').value +
      //       document.getElementById('user').value + ':' +
      //       window.encodeURIComponent(document.getElementById('pass').value) + '@' +
      //       document.getElementById('hostportpath').value + 'apa-test-2';
      // var replication2 = PouchDB.replicate(db, remoteDB, {live: true,
      var replication2 = PouchDB.replicate("https://admin:PLACEHOLDER@apa.selfhost.eu/apa-test-2", "apa-test-2", {live: false,
                                                                                                                    create_target: false})
      .on('change', function (info) {
        addReadOnlyInfo(info, document.body);
        // window.alert(info);
        // handle change
      }).on('complete', function (info) {
        addReadOnlyInfo(info, document.body);
        // window.alert('complete ' + info);
        // handle complete
      }).on('uptodate', function (info) {
        addReadOnlyInfo(info, document.body);
        // window.alert('uptodate ' + info);
        // handle up-to-date
      }).on('error', function (err) {
        addReadOnlyInfo(err, document.body);
        window.alert(err);
        // handle error
      });
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
        if (include.value.length < 5) {
          window.alert(include.value + ' is too short (< 5)');
          return;
        }
        searchMatchingActivities();
      }
      // console.log(event.type, event);
    });
    exclude.addEventListener('keypress', function (event) {
      if (event.keyCode == 13) {
        if (include.value.length < 5) {
          window.alert(include.value + ' is too short (< 5)');
          return;
        }
        searchMatchingActivities();
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
      db.allDocs({ limit: 450, include_docs: true, descending: true }, function(err, doc) {
        if (err) {
          window.alert(err);
        } else {
          var search = document.getElementById('search');
          search && document.body.removeChild(search);
          search = document.createElement('div');
          search.id = 'search';
          doc.rows.forEach(function (row) {
            if (!includeRegExp.test(row.doc.activity) ||
                exclude.value.length && excludeRegExp.test(row.doc.activity)) {
              return;
            }
            // var start = document.createElement('div');
            // var end = document.createElement('div');
            var activity = document.createElement('pre');
            // activity.contentEditable = true;
            // activity.addEventListener('input', null);
            // activity.readOnly = true;
            // start.textContent = (new Date(row.doc.start)).toLocaleString();
            // end.textContent = (new Date(row.doc.end)).toLocaleString();
            activity.textContent = row.doc.activity;
            activity.contentEditable = true;
            // activity.readOnly = true;
            activity.setAttribute('readonly', true);
            //         activity.addEventListener('focus', function (event) {
            //           event.target.removeAttribute('rows');
            //         });
            //         activity.addEventListener('blur', function (event) {
            //           event.target.setAttribute('rows', 1);
            //         });
            // search.appendChild(start);
            // search.appendChild(end);
            search.appendChild(activity);
          });
          document.body.appendChild(search);
          //     var pre = document.createElement('pre');
          //     pre.textContent = JSON.stringify(doc.rows, null, 2);
          //     document.body.appendChild(pre);
        }
      });
    };
    // ---

    function start() {

      var message = document.getElementById('message');

      // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
      // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
      message.textContent = translate('message');

    }

  });
} catch (e) {
  window.alert(e.message + '\n' + e.stack);
}

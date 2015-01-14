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

    // We want to wait until the localisations library has loaded all the strings.
    // So we'll tell it to let us know once it's ready.
    navigator.mozL10n.once(start);
    var db = new PouchDB('punchcard');
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
        // method: 'POST',
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
      remoteDB.info(function (err, info) {
        var pre = document.createElement('pre');
        // pre.textContent = info;
        pre.contentEditable = true;
        if (err) {
          pre.textContent = JSON.stringify(err, null, 2);
        } else {
          pre.textContent = JSON.stringify(remoteDB, null, 2);
        }
        document.body.appendChild(pre);
        // DEBUG && console.log(info);
      });
      //       var remoteDB = new PouchDB(destination);
      var replication = db.sync(remoteDB);
      //           .on('change', function (info) {
      //             // window.alert(info);
      //             // handle change
      //           }).on('complete', function (info) {
      //             // window.alert(info);
      //             // handle complete
      //           }).on('uptodate', function (info) {
      //             // window.alert(info);
      //             // handle up-to-date
      //           }).on('error', function (err) {
      //             window.alert(err);
      //             // shandle error
      //           });
      // var source = document.getElementById('protocol').value +
      //       document.getElementById('user').value + ':' +
      //       window.encodeURIComponent(document.getElementById('pass').value) + '@' +
      //       document.getElementById('hostportpath').value + 'apa-test-2';
      // var replication2 = PouchDB.replicate(db, remoteDB, {live: true,
      var replication2 = PouchDB.replicate("https://admin:PLACEHOLDER@apa.selfhost.eu/apa-test-2", "apa-test-2", {live: false,
                                                                                                                    create_target: false})
      .on('change', function (info) {
        // window.alert(info);
        // handle change
      }).on('complete', function (info) {
        window.alert('complete ' + info);
        // handle complete
      }).on('uptodate', function (info) {
        window.alert('uptodate ' + info);
        // handle up-to-date
      }).on('error', function (err) {
        window.alert(err);
        // handle error
      });
      //   stop.addEventListener('click', function (event) {
      //     window.alert('replicating stop...');
      //     replication.cancel(); // whenever you want to cancel
      //   });
    });

    false && db.allDocs({include_docs: true, descending: false}, function(err, doc) {
      if (err) {
        alert(err);
      } else {
        doc.rows.forEach(function (row) {
          var entry = document.createElement('div');
          entry.id = 'entry';
          var start = document.createElement('div');
          var end = document.createElement('div');
          var activity = document.createElement('pre');
          // activity.contentEditable = true;
          // activity.addEventListener('input', null);
          // activity.readOnly = true;
          start.textContent = (new Date(row.doc.start)).toLocaleString();
          end.textContent = (new Date(row.doc.end)).toLocaleString();
          activity.textContent = row.doc.activity;
          activity.contentEditable = true;
          //         activity.addEventListener('focus', function (event) {
          //           event.target.removeAttribute('rows');
          //         });
          //         activity.addEventListener('blur', function (event) {
          //           event.target.setAttribute('rows', 1);
          //         });
          entry.appendChild(start);
          entry.appendChild(end);
          entry.appendChild(activity);
          document.body.appendChild(entry);
        });
        //     var pre = document.createElement('pre');
        //     pre.textContent = JSON.stringify(doc.rows, null, 2);
        //     document.body.appendChild(pre);
      }
    });

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

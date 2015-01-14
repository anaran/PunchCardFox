// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';
  var DEBUG = false;
  var translate = navigator.mozL10n.get;

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to let us know once it's ready.
  // navigator.mozL10n.once(start);
  // var db = new PouchDB('punchcard');
  var db = new PouchDB('apa-test-2');
  var remote = document.getElementById('remote');
  // db.allDocs({include_docs: true, descending: false}, function(err, doc) {
  var map = {
    map: 
    function(doc, emit) {
      if (doc.clockin_ms)
        emit(doc.clockin_ms, Date.parse(doc.clockin_ms));
    }
  };
  // db.query(map, {reduce: false, /*startkey: "2010-06-24T15:44:08", endkey: "2010-06-25T15:44:08", */limit: 33, include_docs: true, descending: false}, function(err, doc) {
  db.query('fooling/by_clockin', {/*stale: 'ok', */reduce: false,
                                  startkey: "2010-06-23T15:44:08",
                                  endkey: "2010-06-26T15:44:08",
                                  limit: 103, include_docs: true, descending: false}, function(err, doc) {
                                    if (err) {
                                      alert(err);
                                    } else {
                                      var rowCount = doc.rows.length;
                                      var scrollLinks = document.querySelectorAll('nav[data-type="scrollbar"]>ol>li>a');
                                      var rowsPerLink = (rowCount / scrollLinks.length);
                                      DEBUG && console.log("rowCount, rowsPerLink, scrollLinks.length");
                                      DEBUG && console.log(rowCount, rowsPerLink, scrollLinks.length);
                                      doc.rows.forEach(function (row, index) {
                                        var entry = document.createElement('div');
                                        entry.id = row.doc._id;
                                        entry.className = 'entry';
                                        var start = document.createElement('div');
                                        var end = document.createElement('div');
                                        var activity = document.createElement('pre');
                                        activity.contentEditable = true;
                                        // activity.contentEditable = true;
                                        // activity.addEventListener('input', null);
                                        // activity.readOnly = true;
                                        start.textContent = (new Date(row.doc.start || row.doc.clockin_ms)).toLocaleString();
                                        end.textContent = (new Date(row.doc.end || row.doc.clockout_ms)).toLocaleString();
                                        activity.textContent = row.doc.activity;
                                        //         activity.addEventListener('focus', function (event) {
                                        //           event.target.removeAttribute('rows');
                                        //         });
                                        //         activity.addEventListener('blur', function (event) {
                                        //           event.target.setAttribute('rows', 1);
                                        //         });
                                        entry.appendChild(start);
                                        entry.appendChild(end);
                                        entry.appendChild(activity);
                                        if ((index % rowsPerLink) < 1) {
                                          entry.classList.add('linked');
                                          var link = scrollLinks[Math.floor(index / rowsPerLink)];
                                          link.textContent = (new Date(row.doc.start || row.doc.clockin_ms)).toDateString();
                                          link.href = '#' + row.doc._id;
                                          DEBUG && console.log("index, rowsPerLink, (index % rowsPerLink)");
                                          DEBUG && console.log(index, rowsPerLink, (index % rowsPerLink));
                                        }
                                        remote.parentElement.insertBefore(entry, remote);
                                      });
                                      //     var pre = document.createElement('pre');
                                      //     pre.textContent = JSON.stringify(doc.rows, null, 2);
                                      //     document.body.appendChild(pre);
                                    }
                                  });
  //   var optionsDB = new PouchDB('options');
  //   var options = [
  //     'protocol',
  //     'user',
  //     'pass',
  //     'hostportpath'
  //   ];
  //   var values = {};
  //   options.forEach(function (option) {
  //     optionsDB.get(option, function (err, doc) {
  //       if (err) {
  //         // window.alert(JSON.stringify(err, null, 2));
  //       }
  //       if (doc.value) {
  //         values[doc._id] = doc.value;
  //         // window.alert(JSON.stringify(values, null, 2));
  //       }
  //     });
  //   });
  //   false && remote.addEventListener('click', function (event) {
  //     // window.alert(JSON.stringify(values, null, 2));
  //     var destination = values['protocol'] +
  //         values['hostportpath'] + db._db_name;
  //     var opts = {
  //       auth:
  //       {'username': values['user'],
  //        'password': values['pass']
  //       },
  //       // timeout: 20000,
  //       headers: {
  //         // 'Origin': window.location.origin
  //         // 'Accept': '*/*',
  //         // 'Content-Type': '*/*'
  //         // 'Accept': 'application/json'
  //         // 'Content-Type': 'text/chunked'
  //         // 'Accept': 'text/plain',
  //         // 'Content-Type': 'text/plain'
  //         //           // 'Cookie': 'JSESSIONID=1wtfchn9kjjn7xywspx4jz2z1',
  //         //           // 'Access-Control-Request-Method': 'POST',
  //         //           'Authorization': 'Basic ' +
  //         //           window.btoa(document.getElementById('user').value + ':' +
  //         //                       document.getElementById('pass').value)
  //       }
  // //     }
  //     };
  //     var remoteDB = new PouchDB(destination, opts, function (err, info) {
  //       if (err) {
  //         alert(JSON.stringify(err, null, 2));
  //       } else {
  //         // TypeError: cyclic object value
  //         // alert(JSON.stringify(info, null, 2));
  //         DEBUG && console.log(info);
  //       }
  //     });
  //     remoteDB.info().then(function (info) {
  //       DEBUG && console.log(info);
  //     });
  //     remoteDB.allDocs({include_docs: true, descending: false}, function(err, doc) {
  //       if (err) {
  //         alert(JSON.stringify(err, null, 2));
  //       } else {
  //         doc.rows.forEach(function (row) {
  //           var entry = document.createElement('div');
  //           entry.id = 'entry';
  //           var start = document.createElement('div');
  //           var end = document.createElement('div');
  //           var activity = document.createElement('pre');
  //           activity.contentEditable = true;
  //           // activity.contentEditable = true;
  //           // activity.addEventListener('input', null);
  //           // activity.readOnly = true;
  //           start.textContent = (new Date(row.doc.start)).toLocaleString();
  //           end.textContent = (new Date(row.doc.end)).toLocaleString();
  //           activity.textContent = row.doc.activity;
  //           //         activity.addEventListener('focus', function (event) {
  //           //           event.target.removeAttribute('rows');
  //           //         });
  //           //         activity.addEventListener('blur', function (event) {
  //           //           event.target.setAttribute('rows', 1);
  //           //         });
  //           entry.appendChild(start);
  //           entry.appendChild(end);
  //           entry.appendChild(activity);
  //           document.body.appendChild(entry);
  //         });
  //       }
  //     });
  //  });
  // ---

  function start() {

    var message = document.getElementById('message');

    // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
    // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
    message.textContent = translate('message');

  }

});

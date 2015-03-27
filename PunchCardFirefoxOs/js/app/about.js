define(['app/info', 'app/readme'], function(infojs, readmejs) {
  // DOMContentLoaded is fired once the document has been loaded and parsed,
  // but without waiting for other external resources to load (css/images/etc)
  // That makes the app more responsive and perceived as faster.
  // https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
  // TODO See also https://github.com/jrburke/requirejs/issues/463
  // window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';
  var DEBUG = false;

  // var addReadOnlyInfo = require('info');
  var addReadOnlyInfo = infojs;
  var translate = navigator.mozL10n.get;

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to let us know once it's ready.
  // navigator.mozL10n.once(start);
  var db = new PouchDB('punchcard3');
  var infoNode = document.getElementById('message');
  db.info().then(function (info) {
    addReadOnlyInfo(info, infoNode);
    // DEBUG && console.log(info);
  });
  var optionsDB = new PouchDB('options');
  optionsDB.info().then(function (info) {
    addReadOnlyInfo(info, infoNode);
    // DEBUG && console.log(info);
  });
  var db2 = new PouchDB('apa-test-2');
  db2.info().then(function (info) {
    addReadOnlyInfo(info, infoNode);
    // DEBUG && console.log(info);
  });
  var db3 = new PouchDB('apa-test-3');
  db3.info().then(function (info) {
    addReadOnlyInfo(info, infoNode);
    // DEBUG && console.log(info);
  });
  // var url = window.location.hash.substring(1);
  if (readmejs) {
    var renderElement = document.querySelector('#render_markdown');
    var editElement = document.querySelector('#edit_markdown');
    var readmeLink = document.getElementById('readme_id');
    var readme2Link = document.getElementById('readme2_id');
    var toggleEdit = document.getElementById('readme_edit_toggle');
    readmeLink.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      readmejs.render(event.target.href, renderElement, editElement, toggleEdit);
    });
    readme2Link.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      readmejs.render(event.target.href, renderElement, editElement, toggleEdit);
    });
  }
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
  return true;
});

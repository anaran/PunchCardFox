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
  addReadOnlyInfo(window.location, infoNode);
  var request = window.navigator.mozApps.getSelf();
  request.onsuccess = function() {
    if (request.result) {
      // Pull the name of the app out of the App object
      addReadOnlyInfo(request.result.manifest, infoNode);
    } else {
      // alert("Called from outside of an app");
      addReadOnlyInfo(["Called from outside of an app"], infoNode);
    }
  };
  request.onerror = function() {
    // Display error name from the DOMError object
    alert("Error: " + request.error.name);
  };
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
      readmejs.init(event.target.href + '#' + Date.now(), renderElement, editElement, toggleEdit).
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
      event.preventDefault();
      event.stopPropagation();
      readmejs.init(event.target.href, renderElement, editElement, toggleEdit).
      // then(
      //   function (resolve) {
      //     window.alert(JSON.stringify(resolve, null, 2));
      //   }).
      catch(function (reject) {
        window.alert('Document ' + event.target.href +
                     ' could not be initialized.\n\n' + JSON.stringify(reject, null, 2));
      });
    });
  }
  return true;
});

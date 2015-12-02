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
  var databasesLinkNode = document.getElementById('databases_link');
  var applicationLinkNode = document.getElementById('application_link');
  var databasesInfoNode = document.getElementById('databases_info');
  var applicationInfoNode = document.getElementById('application_info');
  var databasesClearNode = document.getElementById('databases_clear');
  var applicationClearNode = document.getElementById('application_clear');
  databasesClearNode.addEventListener('click', function (event) {
    databasesInfoNode.textContent = '';
  });
  applicationClearNode.addEventListener('click', function (event) {
    applicationInfoNode.textContent = '';
  });
  databasesLinkNode.addEventListener('click', function (event) {
    event.preventDefault();
    // event.stopPropagation();
    db.info().then(function (info) {
      addReadOnlyInfo(info, databasesInfoNode);
      // DEBUG && console.log(info);
    });
    var optionsDB = new PouchDB('options');
    optionsDB.info().then(function (info) {
      addReadOnlyInfo(info, databasesInfoNode);
      // DEBUG && console.log(info);
    });
    var db2 = new PouchDB('apa-test-2');
    db2.info().then(function (info) {
      addReadOnlyInfo(info, databasesInfoNode);
      // DEBUG && console.log(info);
    });
    var db3 = new PouchDB('apa-test-3');
    db3.info().then(function (info) {
      addReadOnlyInfo(info, databasesInfoNode);
      // DEBUG && console.log(info);
    });
  });
  addReadOnlyInfo(window.location, applicationInfoNode);
  applicationLinkNode.addEventListener('click', function (event) {
    event.preventDefault();
    // event.stopPropagation();
    var request = window.navigator.mozApps.getSelf();
    request.onsuccess = function() {
      if (request.result) {
        // Pull the name of the app out of the App object
        addReadOnlyInfo(request.result.manifest, applicationInfoNode);
        // addReadOnlyInfo(request.result.manifest, applicationInfoNode);
      } else {
        // alert("Called from outside of an app");
        addReadOnlyInfo(["Called from outside of an app"], applicationInfoNode);
      }
    };
    request.onerror = function() {
      // Display error name from the DOMError object
      alert("Error: " + request.error.name);
    };
  });
  if (readmejs) {
    var renderElement = document.querySelector('#render_markdown');
    var editElement = document.querySelector('#edit_markdown');
    var readmeLink = document.getElementById('readme_link');
    var readme2Link = document.getElementById('readme2_link');
    var toggleEdit = document.getElementById('readme_edit_toggle');
    var readmeClose = document.getElementById('readme_close');
    readmeClose.addEventListener('click', function (event) {
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
      event.preventDefault();
      readmejs.init(event.target.href, renderElement, editElement, toggleEdit).
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
  }
  return true;
});

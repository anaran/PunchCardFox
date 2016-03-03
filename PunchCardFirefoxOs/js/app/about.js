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

  var databasesLinkNode = document.getElementById('databases_link');
  var applicationLinkNode = document.getElementById('application_link');
  var databasesInfoNode = document.getElementById('databases_info');
  var applicationInfoNode = document.getElementById('application_info');
  var databasesClearNode = document.getElementById('databases_clear');
  var applicationClearNode = document.getElementById('application_clear');
  databasesClearNode.addEventListener('click', function (event) {
    // NOTE Do not go to link, which is somewhat disruptive.
    event.preventDefault();
    databasesInfoNode.textContent = '';
  });
  applicationClearNode.addEventListener('click', function (event) {
    // NOTE Do not go to link, which is somewhat disruptive.
    event.preventDefault();
    applicationInfoNode.textContent = '';
  });
  databasesLinkNode.addEventListener('click', function (event) {
    // NOTE Do not go to link, which is somewhat disruptive.
    event.preventDefault();
    // event.stopPropagation();
    var databaseName = document.getElementById('db_name');
    // var db = new PouchDB(databaseName.value);
    // // var db = new PouchDB('punchcard3');
    // var optionsDB = new PouchDB('options');
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
    // var remoteOptionsDB = new PouchDB(destination + optionsDB._db_name, opts);
    // var remoteDB = new PouchDB(destination + db._db_name, opts);
    // db.info().then(function (info) {
    //   infojs(info, databasesInfoNode);
    //   // DEBUG && console.log(info);
    // });
    // optionsDB.info().then(function (info) {
    //   infojs(info, databasesInfoNode);
    //   // DEBUG && console.log(info);
    // });
    // remoteDB.info().then(function (info) {
    //   infojs(info, databasesInfoNode);
    //   // DEBUG && console.log(info);
    // });
    // remoteOptionsDB.info().then(function (info) {
    //   infojs(info, databasesInfoNode);
    //   // DEBUG && console.log(info);
    // });
    PouchDB.allDbs().then(function (dbs) {
      // dbs is an array of strings, e.g. ['mydb1', 'mydb2']
      console.log('dbs', dbs, 'destination', destination);
      dbs && dbs.forEach(function (db) {
        let localDB = new PouchDB(db);
        let remoteDB = new PouchDB(destination + db, opts);
        localDB.info().then(function (info) {
          infojs(info, databasesInfoNode);
          // DEBUG && console.log(info);
        });
        remoteDB.info().then(function (info) {
          infojs(info, databasesInfoNode);
          // DEBUG && console.log(info);
        });
      }).catch(function (err) {
          infojs(err, databasesInfoNode);
        // handle err
      });
    });
  });
  applicationLinkNode.addEventListener('click', function (event) {
    // NOTE Do not go to link, which is somewhat disruptive.
    event.preventDefault();
    // event.stopPropagation();
    infojs(window.location, applicationInfoNode);
    var request = window.navigator.mozApps.getSelf();
    request.onsuccess = function() {
      if (request.result) {
        // Pull the name of the app out of the App object
        infojs(request.result.manifest, applicationInfoNode);
        // infojs(request.result.manifest, applicationInfoNode);
      } else {
        // alert("Called from outside of an app");
        infojs(["Called from outside of an app"], applicationInfoNode);
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
    let readmeLink = document.getElementById('readme_link');
    var readme2Link = document.getElementById('readme2_link');
    var toggleEdit = document.getElementById('readme_edit_toggle');
    var readmeClose = document.getElementById('readme_close');
    readmeClose.addEventListener('click', function (event) {
      // NOTE Do not go to link, which is somewhat disruptive.
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
      // NOTE Do not go to link, which is somewhat disruptive.
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
      // NOTE Do not go to link, which is somewhat disruptive.
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

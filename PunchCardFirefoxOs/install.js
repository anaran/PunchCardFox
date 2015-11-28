document.addEventListener('readystatechange', function () {
  if (document.readyState != "complete") {
    return;
  }
  // This URL must be a full url.
  var updateUrl = 'http://localhost:8000/update.webapp';
  var manifestUrl = 'http://localhost:8000/manifest.webapp';
  var checkButton = document.getElementById('check');
  var installButton = document.getElementById('install');
  var updateButton = document.getElementById('update');
  var uninstallButton = document.getElementById('uninstall');
  var info = document.getElementById('info');
  var installApp = function () {
    var req = navigator.mozApps.installPackage(updateUrl);
    req.onsuccess = function() {
      // checkInstalled();
      getInstalled(updateUrl);
    };
    req.onerror = function() {
      info.textContent = this.error.name;
    };
  }
  var checkInstalled = function () {
    // [1202437 – DOMApplicationsRegistry.checkInstalled() cannot determine if the app is installed](https://bugzil.la/1202437)
    var checkInstalledRequest = window.navigator.mozApps.checkInstalled(updateUrl);
    checkInstalledRequest.onsuccess = function(e) {
      try {
        // alert(this.result.origin);
        var app = this.result;
        if (app) {
          var uninstallApp = function () {
            try {
              // [1202248 – TypeError: navigator.mozApps.mgmt is undefined](https://bugzil.la/1202248)
              // TypeError: navigator.mozApps.mgmt is undefined
              // in
              // navigator.buildID
              //     20150905030205
              // navigator.javaEnabled()
              //     true
              // navigator.language
              //     de
              // navigator.languages
              //     de,en-US
              // navigator.userAgent
              //     Mozilla/5.0 (Windows NT 5.1; rv:43.0) Gecko/20100101 Firefox/43.0
              var req = navigator.mozApps.mgmt.uninstall(app, function onsuccess(result) {
                console.log(result);
              }, function onerror(error) {
                console.log(error);
              });
            }
            catch (error) {
              info.textContent = JSON.stringify(error, Object.getOwnPropertyNames(error));
            }
          };
          info.textContent = (new Date).toISOString() + ': ' + app.manifest.name + " version " + app.manifest.version + " was last installed " + new Date(app.installTime);
          uninstallButton.addEventListener('click', uninstallApp);
          installButton.setAttribute('disabled', true);
          uninstallButton.removeAttribute('disabled');
          var cfu = app.checkForUpdate();
          cfu.onsuccess = function (result) {
            console.log('cfu.onsuccess', app, result);
            if (app.downloadAvailable) {
              installButton.removeAttribute('disabled');
              updateButton.addEventListener('click', function (event) {
                app.download();
                app.ondownloadsuccess = function (result) {
                  console.log(result);
                  window.navigator.mozApps.applyDownload(app);
                };
                app.ondownloadapplied = function (result) {
                  console.log(result);
                }
                app.ondownloadapplied = function (result) {
                  console.log('app.ondownloadapplied', app);
                };
              });
            }
            else {
              installButton.setAttribute('disabled', true);
            }
          };
          cfu.onerror = function onerror(error) {
            console.log('cfu.onerror', app, error);
          };
          console.log('app.checkForUpdate() returns', cfu, app);
          console.log('after app.checkForUpdate(), look for onsuccess/onerror logging', app);
        }
        else {
          info.textContent = manifestUrl + ' is not installed';
          uninstallButton.setAttribute('disabled', true);
          installButton.removeAttribute('disabled');
        }
      }
      catch (error) {
        info.textContent = JSON.stringify(error, Object.getOwnPropertyNames(error));
      }
    };
    checkInstalledRequest.onerror = function(e) {
      info.textContent = this.error.name;
    };
    console.log('checking', checkInstalledRequest);
  };
  installButton.addEventListener('click', installApp);
  checkButton.addEventListener('click', checkInstalled);
  var getInstalled = function (url) {
    // Takes no argument, multiple apps per origin are possible, contrary to previous restriction to one.
    var request = window.navigator.mozApps.getInstalled();
    request.onerror = function(e) {
      alert("Error calling getInstalled: " + request.error.name);
    };
    request.onsuccess = function(e) {
      // alert("Success, number of apps: " + request.result.length);
      // console.log(request.result);
      info.textContent = manifestUrl + ' is not installed';
      uninstallButton.setAttribute('disabled', true);
      installButton.removeAttribute('disabled');
      request.result.forEach(function (app) {
        if (app.manifestURL == url) {
          var uninstallApp = function () {
            try {
              // [1202248 – TypeError: navigator.mozApps.mgmt is undefined](https://bugzil.la/1202248)
              // TypeError: navigator.mozApps.mgmt is undefined
              // in
              // navigator.buildID
              //     20150905030205
              // navigator.javaEnabled()
              //     true
              // navigator.language
              //     de
              // navigator.languages
              //     de,en-US
              // navigator.userAgent
              //     Mozilla/5.0 (Windows NT 5.1; rv:43.0) Gecko/20100101 Firefox/43.0
              var req = navigator.mozApps.mgmt.uninstall(app, function onsuccess(result) {
                console.log(result);
              }, function onerror(error) {
                console.log(error);
              });
            }
            catch (error) {
              info.textContent = JSON.stringify(error, Object.getOwnPropertyNames(error));
            }
          };
          info.textContent = (new Date).toISOString() + ': ' + app.manifest.name + " version " + app.manifest.version + " was last installed " + new Date(app.installTime);
          uninstallButton.addEventListener('click', uninstallApp);
          installButton.setAttribute('disabled', true);
          uninstallButton.removeAttribute('disabled');
        }
      });
    };
  };
  // checkInstalled();
  getInstalled(updateUrl);
});


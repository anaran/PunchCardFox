window.addEventListener('load', function () {
  // This URL must be a full url.
  var manifestUrl = 'http://localhost:8000/update.webapp';
  var installButton = document.getElementById('install');
  var uninstallButton = document.getElementById('uninstall');
  var installApp = function () {
    var req = navigator.mozApps.installPackage(manifestUrl);
    req.onsuccess = function() {
      alert(this.result.origin);
    };
    req.onerror = function() {
      alert(this.error.name);
    };
  }
  var checkInstalledRequest = window.navigator.mozApps.checkInstalled(manifestUrl);
  checkInstalledRequest.onsuccess = function() {
    alert(this.result.origin);
    var app = this.result;
    if (app) {
      document.getElementById('info').textContent = app.manifest.name + " version " + app.manifest.version + " was last installed " + new Date(app.installTime);
      var uninstallApp = function () {
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
      };
      uninstallButton.addEventListener('click', uninstallApp);
      installButton.setAttribute('disabled', true)
      uninstallButton.removeAttribute('disabled');
    }
    else {
      uninstallButton.setAttribute('disabled', true)
      installButton.removeAttribute('disabled');
    }
  };
  checkInstalledRequest.onerror = function() {
    alert(this.error.name);
  };
  installButton.addEventListener('click', installApp);
});


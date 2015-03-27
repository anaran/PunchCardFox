'use strict';
//Load common code that includes config, then load the app logic for this page.
require(['./common'], function (common) {
    require(['app/app']);
    // Following lines are not necessary when served as web app in nightly firefox on windows xp via 
    // python -m SimpleHTTPServer
    // They are also require()d in app.js itself.
    if (document.location.protocol == "app:") {
        require(['app/new']);
        require(['app/info']);
        require(['app/options']);
    }});

  requirejs.config({
    // waitSeconds is set to the default here; the build step rewrites it to 0
    // in build/email.build.js so that we never timeout waiting for modules in
    // production. This is important when the device is under super-low-memory
    // stress, as it may take a while for the device to get around to loading
    // things email needs for background tasks like periodic sync.
    waitSeconds: 7,
    baseUrl: './js',
    paths: {
    //   l10nbase: '../shared/js/l10n',
    //   l10ndate: '../shared/js/l10n_date',
    info: './js/info'
    // tmpl: '../bower_components/requirejs-tmpl/tmpl',
    // "gaia-header": '../bower_components/gaia-header/gaia-header'
    // element: '/js/element',
    // tmpl: '/js/template'
    //   shared: '../shared'
    }
  });

requirejs(['options'], function(options) { options(); });

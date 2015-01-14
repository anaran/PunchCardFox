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

  //   var db = new PouchDB('punchcard');
  //   var remoteCouch = false;

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to let us know once it's ready.
  navigator.mozL10n.once(start);
  var save = document.querySelector('a#save');
  var activity = document.querySelector('textarea#activity');
  save.addEventListener('click', function (event) {
    var db = new PouchDB('punchcard');
    window.alert('saving...');
    var entry = {
      // _id: db.post(),
      activity: activity.value,
      start: Date.parse(start.textContent),
      end: Date.parse(end.textContent)
    };
    window.alert(JSON.stringify(entry, null, 2));
    db.post(entry, function callback(err, result) {
      if (!err) {
        alert('Successfully posted a todo!');
      }
    });

  });
  var start = document.querySelector('time#start');
  var end = document.querySelector('time#end');
  start.textContent = Date();
  end.textContent = Date();

  // ---

  function start() {

    var message = document.getElementById('message');

    // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
    // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
    message.textContent = translate('message');
  }

});

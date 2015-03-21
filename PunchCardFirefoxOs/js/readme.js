window.addEventListener('DOMContentLoaded', function() {
  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';
  var DEBUG = false;
  var XHR_TIMEOUT_MS = 0;
  var url = window.location.hash.substring(1);
  var translate = navigator.mozL10n.get;
  // console.log(marked);

  // See
  // https://github.com/chjj/marked/issues/545#issuecomment-74505539
  var toc = [];
  var renderer = (function() {
    var renderer = new marked.Renderer();
    renderer.heading = function(text, level, raw) {
      var anchor = this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, '-');
      toc.push({
        anchor: anchor,
        level: level,
        text: text
      });
      return '<h'
      + level
      + ' id="'
      + anchor
      + '">'
      + text
      + '</h'
      + level
      + '>\n'
      + '<a href="#table-of-contents">Table of Contents<a>\n';
    };
    return renderer;
  })();

  // marked.setOptions({
  //     renderer: renderer
  // });

  marked.setOptions({
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
  });
  try {
    var request = new XMLHttpRequest({ mozSystem: true });
    request.open('get', url, !!'async');
    request.timeout = XHR_TIMEOUT_MS;
    request.addEventListener('error', onRequestError);
    request.addEventListener('timeout', onRequestError);
    request.send();
    request.onreadystatechange = function() {
      if (this.readyState == 4) {
        // alert('this.getAllResponseHeaders() = ' + this.getAllResponseHeaders());
        // alert('request.responseText = ' + request.responseText);
        // alert('request.response = ' + request.response);
        if(request.response === null) {
          return;
        }
        document.querySelector('#edit_markdown').textContent = request.response;
        if (true) {
          var html = marked(request.response);
          var tocHTML = '<h1 id="table-of-contents">Table of Contents</h1>\n<ul>';
          toc.forEach(function (entry) {
            tocHTML += '<li><a href="#'+entry.anchor+'">'+entry.text+'<a></li>\n';
          });
          tocHTML += '</ul>\n';
          document.querySelector('#render_markdown').innerHTML = tocHTML + html;
          DEBUG && window.alert(tocHTML);
          DEBUG && window.alert(html);
          DEBUG && window.alert(JSON.stringify(toc, null, 2));
        } else {
          // document.querySelector('#render_markdown').innerHTML = (new Remarkable('commonmark')).render(request.response);
          document.querySelector('#render_markdown').innerHTML = (new Remarkable('full')).render(request.response);
        }
        document.querySelector('#render_markdown').scrollIntoView();
      }
    }
  } catch (e) {
    alert(e.message + '\n' + e.stack);
    // alert(JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
  }

  function onRequestError(event) {

    var errorMessage = request.error;
    // alert(JSON.stringify(request, Object.getOwnPropertyNames(request), 2));
    window.alert(event.type + ': ' + errorMessage);
  }

});
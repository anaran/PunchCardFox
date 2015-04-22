'use strict';
define(['../../bower_components/marked/lib/marked'], function (marked) {
  // window.addEventListener('DOMContentLoaded', function() {
  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';
  var DEBUG = false;
  var XHR_TIMEOUT_MS = 0;
  var init = function (url, renderElement, editElement, toggleElement) {
    return new Promise(function(resolve, reject) {
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
        var edit = editElement;
        edit.style.display = 'none';
        // window.scrollTo(0, 0);
        var render = renderElement;
        var toggleEdit = function(event) {
          event.preventDefault();
          event.stopPropagation();
          if (edit.style.display == 'none') {
            edit.style.display = 'block';
            render.style.display = 'none';
            event.target.style.opacity = '0.3';
          }
          else {
            edit.style.display = 'none';
            render.style.display = 'block';
            event.target.style.opacity = '1.0';
            var blob = new window.Blob([edit.textContent], {
              type: 'text/plain; charset=utf-8'
            });
            var div = document.createElement('div');
            var download = document.createElement('a');
            var now = new Date;
            download.href = window.URL.createObjectURL(blob);
            download.download = (new URL(url)).pathname;
            download.download = download.download.replace(/\.md$/, '@' + Number.parseInt(now.getTime() / 1000) + '.md');
            download.download = download.download.replace(/^.*\//, '');
            download.textContent = 'Download ' + download.download;
            div.appendChild(download);
            event.target.parentElement.appendChild(div);
          }
        };
        // NOTE: addEventListener is not used because listeners added by another setup call cannot be removed.
        // Also, so far we only need a single listener here.
        toggleElement.onclick = toggleEdit;
        // toggleElement.addEventListener('click', toggleEdit);
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
            if (request.response === null) {
              reject(request);
            }
            // TODO: state should not depend on a hardcoded opacity value!
            if (toggleElement.style.opacity == '0.3') {
              if (window.confirm('Discard edits you have not saved and downloaded?')) {
                edit.textContent = request.response;
              }
              else {
                reject('Discard edits you have not saved and downloaded?');
              }
              edit.style.display = 'block';
              render.style.display = 'none';
            }
            else {
              edit.textContent = request.response;
              edit.style.display = 'none';
              render.style.display = 'block';
            }
            if ('use marked again after experimenting with Remarkable') {
              var html = marked(request.response);
              var tocHTML = '<h1 id="table-of-contents">Table of Contents</h1>\n<ul>';
              toc.forEach(function (entry) {
                tocHTML += '<li><a href="#'+entry.anchor+'">'+entry.text+'<a></li>\n';
              });
              tocHTML += '</ul>\n';
              render.innerHTML = tocHTML + html;
              DEBUG && window.alert(tocHTML);
              DEBUG && window.alert(html);
              DEBUG && window.alert(JSON.stringify(toc, null, 2));
            } else {
              // render.innerHTML = (new Remarkable('commonmark')).render(request.response);
              render.innerHTML = (new Remarkable('full')).render(request.response);
            }
            if (edit.textContent) {
              toggleElement.style.visibility = 'visible';
            }
            else {
              toggleElement.style.visibility = 'hidden';
            }
            resolve(toggleElement.style.opacity);
            // render.scrollIntoView();
          }
        };
      }
      catch (e) {
        alert(e.message + '\n' + e.stack);
        // alert(JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
      }
    });
  };
  var onRequestError = function (event) {

    var errorMessage = request.error;
    // alert(JSON.stringify(request, Object.getOwnPropertyNames(request), 2));
    window.alert(event.type + ': ' + errorMessage);
  };
  return {
    init: init
  };
});

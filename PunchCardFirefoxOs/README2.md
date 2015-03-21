# Developer Notes

## Web Components

Mostly using web-components via bower, except for:

https://raw.githubusercontent.com/mozilla-b2g/gaia/v2.0/shared/style/scrolling.css
which was modified from absolute to fixed position.

## Content Security Policy

Did not work:
    "csp": "default-src *; script-src *; object-src 'none'; style-src 'self' 'unsafe-inline' 'unsafe-eval'",
to overcome CSP error in pouchdb when querying couchdb view.
According to daleharvey#pouchdb views cannot work in fxos privileged apps.

I was able to run a trivial `by_clockout` query from a couchdb replicated view using
[pouchdb.mapreduce.noeval](https://github.com/evidenceprime/pouchdb.mapreduce.noeval#pouchdbmapreducenoeval)
## TODO

- ◻ admin password exposed via options.js, change it!

- ✓ use marked.js to parse .md and render it to html document.

- ✓ generate table of contents using marked.js custom renderer (following [Table of contents · Issue #545 · chjj/marked](https://github.com/chjj/marked/issues/545#issuecomment-74505539)).

  - ✗ Used `bower install marked`
  
- ◻ [browserify-markdown-editor](http://thlorenz.github.io/browserify-markdown-editor/) looks very promising

- ◻ [markdown-editor](http://jbt.github.io/markdown-editor) looks good too, uses marked, CM, highlight.js, js-deflate.

## App Documentation

I try
bower install remarkable --save
for github GFM task list support, which works neither in [marked](https://github.com/chjj/marked) nor [remarkable](https://github.com/jonschlinkert/remarkable).

## App Permissions

Missing `systemXHR` permission leads to:

`22:11:56.821 NS_ERROR_DOM_BAD_URI: Access to restricted URI denied app.js:140:0`

```
  "permissions": {
    "systemXHR": {
      "description": "Required to load remote content"
    }
  },
```

## Couchdb Cookie Authentication

Works fine in this sample app.

## Build Environment

While I liked the build-less setup I am now using spock to preprocess link rel import my .html files.

This allows modularization while I investigate how to do this dynamically without a build step.

Initial attempts using requirejs-tmpl, apps/email element.js and template.js (suggested by jrburke, failing due to my gaia-components setup) have all failed so far.

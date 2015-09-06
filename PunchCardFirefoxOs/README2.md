# Developer Notes

## Web Components

Mostly using web-components via bower, except for:

https://raw.githubusercontent.com/mozilla-b2g/gaia/v2.0/shared/style/scrolling.css
which was modified from absolute to fixed position.

### Web Components in Window Desktop Firefox

Works fine in nightly with

dom.webcomponents.enabled;true

in about:config

## Content Security Policy

Did not work:

    "csp": "default-src *; script-src *; object-src 'none'; style-src 'self' 'unsafe-inline' 'unsafe-eval'",
    
to overcome CSP error in pouchdb when querying couchdb view.

According to daleharvey#pouchdb views cannot work in fxos privileged apps.

I was able to run a trivial query on view `'foolin/by_start'` (replicated from a couchdb) using
[pouchdb.mapreduce.noeval](https://github.com/evidenceprime/pouchdb.mapreduce.noeval#pouchdbmapreducenoeval)
## TODO

- ◻ admin password exposed via options.js, change it!

- ✓ use marked.js to parse .md and render it to html document.

- ✓ generate table of contents using marked.js custom renderer (following [Table of contents · Issue #545 · chjj/marked](https://github.com/chjj/marked/issues/545#issuecomment-74505539)).

  - ✗ Used `bower install marked`
  
- ◻ [browserify-markdown-editor](http://thlorenz.github.io/browserify-markdown-editor/) looks very promising

- ◻ [markdown-editor](http://jbt.github.io/markdown-editor) looks good too, uses marked, CM, highlight.js, js-deflate.

## Testing GFM TDO Support

- [ ] open item

- [x] closed item

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

I have decided to not use systemXHR at all.

his app currently (2015-09-06) works as

- hosted app (cannot be privileged unless reviewed and hosted in firefox marketplace),
- firefox os app,
- desktop open web app on linux and windows installable by self-hosted install.html (see [Building Open Web App Package](#building-open-web-app-package)).

systemXHR also exposes the `Set-Cookie` response header to the client and requires it to send the `Cookie` header in subsequent requests.

Without this the authorization cookie is handled transparently to the client in all types of this web app.


## Couchdb Cookie Authentication

Works fine in this sample app.

## Build Environment

While I liked the build-less setup I am now using [spock](https://www.npmjs.com/package/spock) to preprocess link rel import my .html files.

This allows modularization while I investigate how to do this dynamically without a build step.

Initial attempts using requirejs-tmpl, apps/email element.js and template.js (suggested by jrburke, failing due to my gaia-components setup) have all failed so far.

### Building Open Web App Package

Run

```zip -r pea.zip manifest.webapp img js bower_components/ scrolling.css build css data README*```

to build zip file to be installed by install.html

### Install Open Web App Package

Only following files need to be served by web server to allow installation by visiting install.html

 * install.html
 * pea.zip
 * update.webapp


### Uninstall Open Web App Package

Does not seem to work via API in Windows:

[1202248 – TypeError: navigator.mozApps.mgmt is undefined](https://bugzil.la/1202248)

Best way there is to find the app via its shortcut properties.

It is likely located in `%APPDATA%`.

Run its `uninstall\\webapp-uninstaller.exe`
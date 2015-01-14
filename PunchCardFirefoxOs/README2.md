Mostly using web-components via bower, except for:

https://raw.githubusercontent.com/mozilla-b2g/gaia/v2.0/shared/style/scrolling.css
which was modified from absolute to fixed position.

Did not work:
    "csp": "default-src *; script-src *; object-src 'none'; style-src 'self' 'unsafe-inline' 'unsafe-eval'",
to overcome CSP error in pouchdb when querying couchdb view.
According to daleharvey#pouchdb views cannot work in fxos privileged apps.

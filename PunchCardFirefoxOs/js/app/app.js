'use strict';

import * as infojs from './info.js';
import { HeaderUI } from './header-ui.js';
import { AboutUI } from './about-ui.js';
import { OptionsUI } from './options-ui.js';
import * as utilsjs from './utils.js';
import { NewEntryUI }  from './new-entry.js';
import { EntriesUI } from './entries-ui.js';
import '../libs/marked.min.js';

let resultIndex = 1;
let optionsDB = new PouchDB('options');
let db = new PouchDB('punchcard');
let query_info = '';

let updateQueryResults = (result) => {
  const scrollView = document.querySelector('section#view-punchcard-list.view.view-noscroll');
  const entries = document.getElementById(result[4]);
  if (result[0]) {
    query_info = `${query_info} found ${result[2]}`;
    entries.info = `${query_info}`;
  }
  else {
    query_info = `${query_info} found ${result[3]}`;
    entries.info = `${query_info}`;
  }
  infojs.timeEnd('query result processing');
  updateScrollLinks();
  let resultEntries = entries.querySelectorAll('entry-ui');
  Array.prototype.forEach.call(resultEntries, (entry) => {
    if (!entry.classList.contains('deleted')) {
      setAvailableRevisionCount(entry);
    }
    entry.checkbox.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      Array.prototype.forEach.call(resultEntries, (entry) => {
        if (entry.style.display != 'none') {
          entry.checked = !entry.checked;
        }
      });
    });
  });
  entries.classList.remove('updating');

  infojs.timeEnd('runQuery');
};

let setAvailableRevisionCount = function(entry) {
  // Possibly do estimate shortcut when accurate
  // revision reporting is disabled for performance reasons.
  // It takes a while when displaying 1000 entries.
  var revisions = entry.revisions;
  // Revision prefix does not account for unavailable revs (e.g missing).
  if (false) {
    revisions.textContent = resolve(rev.split(/-/)[0]) + ' revs';
  }
  else {
    var parts = entry.id.split(/_/);
    var id = parts[0];
    var rev = parts[1];
    db.get(id, {
      // Defaults to winning revision
      // rev: doc._rev,
      revs_info: true
      // open_revs: "all"
      // conflicts: true
    }).then(function (otherDoc) {
      var currentRev = otherDoc._rev;
      var availableRevisions = otherDoc._revs_info.filter(function (rev) {
        return rev.status == 'available' && rev.rev != currentRev;
      })
      revisions.textContent = (availableRevisions ? availableRevisions.length : 0) + ' revs';
    }).catch(function (err) {
      // var e = new Error("db.get in setAvailableRevisionCount");
      // infojs.error({
      //   get_error: JSON.stringify(e, Object.getOwnPropertyNames(e), 2)
      // }, entries);
      infojs.error(err);
    });
  }
  // getIt.then(function (result) {
  //   return result;
  // }).catch(function (err) {
  //   return err;
  // });
}

export let updateScrollLinks = function() {
  infojs.time('updateScrollLinks');
  const scrollView = document.querySelector('section#view-punchcard-list.view.view-noscroll');
  // query result container
  let entriesNodes = scrollView.querySelectorAll('entries-ui');
  var entryNodes = scrollView.querySelectorAll('entry-ui:not(.filtered)');
  var scrollLinks = document.querySelectorAll('nav[data-type="scrollbar"]>ul>li');
  var rowsPerLink = (entryNodes.length / (scrollLinks.length - 3));
  for (var linkIndex = 3; linkIndex < scrollLinks.length; linkIndex++)  {
    scrollLinks[linkIndex].firstElementChild.style.visibility = 'hidden';
  }
  Array.prototype.forEach.call(scrollView.querySelectorAll('.linked'), function(element) {
    element.classList.remove('linked');
  });
  // let bottom = scrollLinks[scrollLinks.length - 1].firstElementChild;
  // bottom.textContent = (new Date(entryNodes[entryNodes.length - 1].id.substring(0, 24))).toDateString() + entryNodes[entryNodes.length - 1].parentElement.id;
  // bottom.href = '#' + entryNodes[entryNodes.length - 1].id;
  // bottom.style.visibility = 'visible';
  for (var scrollIndex = 0; scrollIndex < entryNodes.length; scrollIndex++) {
    if (scrollLinks.length && (scrollIndex % rowsPerLink) < 1) {
      var classList = entryNodes[scrollIndex].classList;
      if (classList && !classList.contains('filtered')) {
        classList.add('linked');
        // NOTE: this closure will provide the correct link to the asynchronous db.get callback.
        (function () {
          // Skip over first two links reserved for top and results links.
          var link = scrollLinks[Math.floor(scrollIndex / rowsPerLink) + 3].firstElementChild;
          var last = (link == scrollLinks[scrollLinks.length - 1].firstElementChild);
          var result = entryNodes[scrollIndex].parentElement.id;
          if (entryNodes[scrollIndex].classList.contains('deleted')) {
            link.classList.add('deleted');
          }
          else {
            link.classList.remove('deleted');
          }
          // if (entryNodes[scrollIndex].classList.contains('deleted')) {
          //   link.textContent = 'deleted' + (new Date(entryNodes[scrollIndex].id.substring(0, 24))).toDateString() + result;
          //   link.href = '#' + entryNodes[scrollIndex].id;
          //   link.style.visibility = 'visible';
          // }
          // else {
          // db.get(entryNodes[scrollIndex].id).then(function(doc) {
          // link.textContent = (new Date(doc._id.substring(0, 24))).toDateString() + result;
          link.textContent = (new Date(entryNodes[scrollIndex].id.substring(0, 24))).toDateString() + result;
          // link.href = '#' + doc._id;
          link.href = '#' + entryNodes[scrollIndex].id;
          link.style.visibility = 'visible';
          if (last) {
            infojs.timeEnd('updateScrollLinks');
          }
          // });
          // }
        })();
      }
      else {
        entryNodes[scrollIndex].class = 'linked';
      }
    }
  }
  var resultsLink = scrollLinks[1];
  Array.prototype.forEach.call(resultsLink.querySelectorAll('a'), function(elem) {
    elem.parentElement.removeChild(elem);
  });
  Array.prototype.forEach.call(entriesNodes, function(node) {
    var link = document.createElement('a');
    link.textContent = node.id;
    link.href = '#' + node.id;
    resultsLink.appendChild(link);
  });
  infojs.timeEnd('updateScrollLinks');
};

export let stringToRegexp = function(str) {
  let captureGroups = str.match(/^\/?(.+?)(?:\/([gims]*))?$/);
  // Default to ignore case.
  // Regexp syntax requires at least a slash at end, possibly followed by flags.
  return captureGroups &&
    new RegExp(captureGroups[1],
               typeof captureGroups[2] == 'undefined' ? "is" : captureGroups[2]);
};

export let runQuery = function(arg) {
  try {
    // db.query(map, {reduce: false, /*startkey: "2010-06-24T15:44:08", endkey: "2010-06-25T15:44:08", */limit: 33, include_docs: true, descending: false}, function(err, doc) {
    // var obj = db.mapreduce(db);
    // db.query(map, {/*stale: 'ok', */reduce: false,
    let times = [];
    infojs.time('runQuery');
    let options = arg || {};
    if (!arg) {
      document.querySelectorAll('.persistent').forEach((item) => {
        infojs.info(`get persistent input for ${item.id}`);
        if (item.type == 'checkbox') {
          options[item.id] = item.checked;
        }
        else {
          options[item.id] = item.value;
        }
      });
    }
    infojs.info(`runQuery options =  ${JSON.stringify(options, null, 2)}`);
    var dec = !!options.descending;
    var limit = options.limit ? Number(options.limit) : 100;
    var matchLimit = options.match_limit ? Number(options.match_limit) : 50;
    // Limit query to a maximum of 1000 rows, not to use too much
    // memory in mobile browsers on smartphones
    var opts = { include_docs: true, descending: dec, limit: Math.min(limit, 1000) };
    let entries = new EntriesUI('R' + resultIndex, updateScrollLinks);
    const scrollView = document.querySelector('section#view-punchcard-list.view.view-noscroll');
    var previousEntries = scrollView.querySelector('entries-ui');
    entries.classList.add('updating');
    var cacheSection = document.querySelector('#cache_section');
    if (previousEntries) {
      scrollView.insertBefore(entries, previousEntries);
    }
    else {
      scrollView.insertBefore(entries, cacheSection);
    }
    entries.id = 'R' + resultIndex;
    resultIndex += 1;
    entries.scrollIntoView({block: "center", inline: "center"});
    let regexp = options.deleted_id && options.deleted_id.length && stringToRegexp(options.deleted_id.trim());
    if (arg && arg.db_changes) {
      delete arg.db_changes;
      query_info = `Query ${entries.id} ${arg.live ? 'live ' : ' '}db changes`;
      entries.info = `${query_info}`;
      let changesCount = 0;
      infojs.time('db.changes');
      return db.changes(arg).on('change', function(info) {
        infojs.timeEnd('db.changes');
        if (entries.stop) {
          this.cancel();
        }
        changesCount += 1;
        infojs.info(info);
        if ('_deleted' in info.doc) {
          let entry = utilsjs.addNewEntry(info.doc, entries, undefined, 'addRevisionToElementId');
          entry.classList.add('deleted');
        }
        else if ('_conflicts' in info.doc) {
          let entry = utilsjs.addNewEntry(info.doc, entries, undefined, 'addRevisionToElementId');
          entry.classList.add('conflicts');
        }
        else {
          utilsjs.addNewEntry(info.doc, entries, undefined, !'addRevisionToElementId');
        }
      }).on('error', function (err) {
        infojs.error({delete_error: err}, entries);
      }).on('complete', function(info) {
        infojs.timeEnd('db.changes');
        infojs.time('query result processing');
        updateQueryResults([!'isSearch', arg, !'matches', changesCount, entries.id]);
        entries.classList.remove('updating');
      });
    }
    else if (regexp) {
      query_info = `Search ${entries.id} for deleted activity matching "${regexp.toString()}"`;
      entries.info = `${query_info}`;
      var changesSinceSequence = options.changes_since_sequence ? Number(options.changes_since_sequence) : 'now';
      let matchingDeletes = 0;
      db.changes({
        descending: dec,
        include_docs: true,
        limit: limit,
        /*style: 'all_docs', */
        since: changesSinceSequence,
      }).on('change', function(info) {
        if (entries.stop) {
          this.cancel();
        }
        //       PouchDB 5.0.0 (blog post)

        // Removed PouchDB.destroy(); use db.destroy() instead
        // Removed 'create', 'update', 'delete' events; use 'change' instead
        // Removed idb-alt adapter

        // infojs.infojs({delete: info}, entries);
        // db.allDocs({
        //   include_docs: true,
        //   keys: [info.id]
        // }).then(function (otherDoc) {
        //   infojs.infojs({otherDoc: otherDoc}, entries);
        // }).catch(function (err) {
        //   infojs.infojs({all_docs_error: err}, entries);
        // });
        db.get(info.doc._id, {
          rev: info.doc._rev,
          revs: true,
          open_revs: "all"
        }).then(function (otherDoc) {
          if (otherDoc[0].ok && otherDoc[0].ok._deleted && otherDoc[0].ok.activity && otherDoc[0].ok.activity.match(regexp)) {
            // infojs.info({get: otherDoc}, entries);
            // Adding revision to id allows us to add document back
            var entry = utilsjs.addNewEntry(otherDoc[0].ok, entries, undefined, 'addRevisionToElementId');
            entry.classList.add('deleted');
          }
        }).catch(function (err) {
          infojs.error(err, document.getElementById(id).parentElement);
        });
        // }).on('change', function(info) {
        //   var entry = utilsjs.addNewEntry(info.doc, entries, undefined, 'addRevisionToElementId');
      }).on('error', function (err) {
        infojs.error({delete_error: err}, entries);
      }).on('complete', function(info) {
        infojs.time('query result processing');
        updateQueryResults([!'isSearch', arg, !'matches', entries.querySelectorAll('entry-ui.deleted').length, entries.id]);
      });
      // db.get(options.deleted_id, {
      //   // rev: info.doc._rev,
      //   revs: true,
      //   open_revs: "all"
      // }).then(function (otherDoc) {
      //   infojs.info({get:otherDoc}, entries);
      //   otherDoc[0].ok._revisions.ids.forEach(function (rev) {
      //     // infojs.info({ _revisions: [ info.doc._rev, otherDoc[0].ok._revisions.start + '-' + rev ]}, entries);
      //     db.get(otherDoc[0].ok._id, {
      //       open_revs: [otherDoc[0].ok._revisions.start + '-' + rev]
      //     }).then(function (otherDoc) {
      //       // db.get(otherDoc[0].ok._id, rev).then(function (otherDoc) {
      //       if (otherDoc[0].missing || otherDoc[0].ok._deleted) {
      //         // if (otherDoc[0].ok && !otherDoc[0].ok._deleted) {
      //       }
      //       else {
      //       }
      //       infojs.info({ 'rev': otherDoc }, entries);
      //     }).catch(function (err) {
      //       infojs.error({rev_error: err}, entries);
      //     });
      //   });
      // }).catch(function (err) {
      //   infojs.error({get_error:err}, entries);
      // });
    }
    else {
      // if (document.querySelector('#new_entry').style.display != 'none') {
      // let startDate, endDate;
      // if (options.startkey) {
      //   startDate = options.startkey;
      // }
      // // else {
      // //   var start = document.querySelector('#query_start');
      // //   var startDate = start.valueAsDate;
      // // }
      // if (options.endkey) {
      //   endDate = options.endkey;
      // }
      // // else {
      // //   var end = document.querySelector('#query_end');
      // //   var endDate = end.valueAsDate;
      // // }
      // if (startDate && endDate && startDate > endDate) {
      //   [ startDate, endDate ] = [ endDate, startDate ];
      // }
      // // start.value = startDate.toString();
      // // end.value = endDate.toString();
      // if (startDate) {
      //   if (dec) {
      //     opts.endkey = startDate;
      //   }
      //   else {
      //     opts.startkey = startDate;
      //   }
      // }
      // if (endDate) {
      //   if (dec) {
      //     opts.startkey = endDate;
      //   }
      //   else {
      //     opts.endkey = endDate;
      //   }
      // }
      // // }
      if (options.query_start) {
        opts.startkey = options.query_start;
      }
      if (options.query_end) {
        opts.endkey = options.query_end;
      }
      if (opts.startkey > opts.endkey) {
        // [opts.startkey, opts.endkey] = [opts.endkey, opts.startkey];
        infojs.warn('opts.startkey > opts.endkey, consider swapping them to get any results');
      }
      if (dec) {
        [opts.startkey, opts.endkey] = [opts.endkey, opts.startkey];
      }
      var isSearch = ((options.include && options.include.length) || (options.exclude && options.exclude.length));
      var includeRegExp = (options.include && options.include.length) ? stringToRegexp(options.include.trim()) : undefined;
      var excludeRegExp = (options.exclude && options.exclude.length) ? stringToRegexp(options.exclude.trim()) : undefined;
      if (isSearch) {
        query_info = `Search ${entries.id} limited to ${matchLimit} matches of "${includeRegExp}" ${excludeRegExp ? ` (but not "${excludeRegExp}")` : ''}${limit ? `, limited to ${limit} entries, ` : ''}`;
        entries.info = `${query_info}`;
        infojs.time('query allDocs search');
      }
      else {
        query_info = `Query ${entries.id} limited to ${limit} entries`;
        entries.info = `${query_info}`;
        opts.reduce = false;
        infojs.time('query allDocs');
      }
      let rowCount = 0,  matches = 0, loops = 1;
      // for (; rowCount < limit; loops++) {
      let recursiveQuery = (opts, matches, rowCount) => {
        return new Promise((resolve, reject) => {
          var query;
          // if (options.deleted_id) {
          //   return;
          // }
          if (isSearch) {
            query = db.allDocs(opts);
          }
          else {
            query = db.allDocs(opts);
          }
          // window.requestAnimationFrame(function (timestamp) {
          query.then(function(doc) {
            if (isSearch) {
              infojs.timeEnd('query allDocs search');
            }
            else {
              infojs.timeEnd('query allDocs');
            }
            infojs.time('query result processing');
            // NOTE: Iteration statement is needed to use break statement.
            // doc.rows.forEach(function (row, index) {
            // Discard first row on subsequent queries with a opts.startkey because it is the last row of the previous query
            if ('startkey' in opts && rowCount && doc.rows.length) {
              doc.rows.shift();
            }
            for (var index = 0; index < doc.rows.length; index++) {
              var row = doc.rows[index];
              if ((includeRegExp && !includeRegExp.test(row.doc.activity)) ||
                  excludeRegExp && excludeRegExp.test(row.doc.activity)) {
                // forEach function return becomes continue in for loop.
                if (rowCount + index + 1 == limit) {
                  return resolve([isSearch, opts, matches, rowCount + index + 1, entries.id]);
                }
                else {
                  continue;
                }
              }
              var entry;
              if (!('activity' in row.doc)) {
                // FIXME
                // allDocs query finds design documents too.
                // Let's just warn about that for now:
                infojs.warn(`Found document ${row.id} with no activity`);
                if (rowCount + index + 1 == limit) {
                  return resolve([isSearch, opts, matches, rowCount + index + 1, entries.id]);
                }
                else {
                  continue;
                }
              }
              entry = utilsjs.addNewEntry(row.doc, entries, undefined, !'addRevisionToElementId');
              if (isSearch) {
                matches += 1;
                if (matchLimit && (matches == matchLimit)) {
                  return resolve([isSearch, opts, matches, rowCount + index + 1, entries.id]);
                }
              }
              if (rowCount + index + 1 == limit) {
                return resolve([ isSearch, opts, matches, rowCount + index + 1, entries.id]);
              }
            }
            if (doc.rows.length == 0) {
              return resolve([ isSearch, opts, matches, rowCount, entries.id]);
            }
            rowCount += doc.rows.length;
            // Must not drop random part of ID to distinguish
            // between multiple entries with same start time!
            let newStart = doc.rows[doc.rows.length - 1].doc._id;
            // startkey would not change, no use to carry on.
            if (newStart == opts.startkey) {
              return resolve([ isSearch, opts, matches, rowCount + doc.rows.length, entries.id]);
            }
            opts.startkey = newStart;
            entries.info = `${query_info}, processed ${rowCount} ...`;
            if (entries.stop) {
              return resolve([isSearch, opts, matches, rowCount, entries.id]);
            }
            // Just recurse, we already checked for limit and matchLimit above
            return resolve(recursiveQuery(opts, matches, rowCount, entries.id));
          }).catch(function(err) {
            infojs.error(err, document.getElementById(id).parentElement);
          });
        });
      };
      recursiveQuery(opts, matches, rowCount).then(updateQueryResults);
    }
  }
  catch(err) {
    infojs.error(err);
  }
};

// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
// window.addEventListener('DOMContentLoaded', function(event) {
infojs.time('appjs to readyState complete');
document.addEventListener('readystatechange', (event) => {
  if (event.target.readyState !== 'complete') {
    return;
  }
  infojs.timeEnd('appjs to readyState complete');
  let headerUI = new HeaderUI();
  // Make header last element to stack on top of others.
  document.body.insertAdjacentElement('beforeend', headerUI);
  let ORIENTATION = false;
  let SCROLL = false;
  try {
    window.addEventListener('offline', (e) => {
      infojs.info(`Browser is now ${e.type}`);
    });
    window.addEventListener('online', (e) => {
      infojs.info(`Browser is now ${e.type}`);
    });
    const scrollView = document.querySelector('section#view-punchcard-list.view.view-noscroll');
    let startMenu = document.getElementById('start_menu');
    let endMenu = document.getElementById('end_menu');
    let revisionsMenu = document.getElementById('revisions_menu');
    let activityMenu = document.getElementById('activity_menu');
    let operationMenu = document.getElementById('operation_menu');
    // let request = navigator.mozApps.getSelf();
    let info_categories = document.querySelector('#info_categories');
    Array.prototype.forEach.call(info_categories.querySelectorAll('input'), (value) => {
      if (localStorage.getItem(value.id)) {
        value.checked = true;
      }
      else {
        value.checked = false;
      }
    });
    info_categories.addEventListener('click', (event) => {
      if (event.target.checked) {
        event.target.checked = true;
        localStorage.setItem(event.target.id, event.target.id);
      }
      else {
        event.target.checked = false;
        localStorage.removeItem(event.target.id);
      }
    });
    info_categories.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      Array.prototype.forEach.call(info_categories.querySelectorAll('input'), (value) => {
        value.checked = !value.checked;
        if (value.checked) {
          localStorage.setItem(value.id, value.id);
        }
        else {
          localStorage.removeItem(value.id);
        }
      });
    });
    window.addEventListener('storage', (event) => {
      infojs.info(event);
    });

    let loadAutosavedEntries = () => {
      let autosavesJSON = localStorage.getItem('autosaves');
      let autosaves = {};
      if (autosavesJSON) {
        autosaves = JSON.parse(autosavesJSON);
        Object.keys(autosaves).forEach((autosaveID) => {
          let neu = new NewEntryUI();
          document.querySelector('#top').insertAdjacentElement('afterend', neu);
          neu.loadAutosaveGetNewID(autosaveID);
        });
      }
    };
    loadAutosavedEntries();
    let filter = document.querySelector('#filter input-ui');
    filter.minLength = 4;

    let setBackgroundColor = color => {
      window.requestAnimationFrame(function (timestamp) {
        document.body.style.backgroundColor = color;
      });
    };

    let updateFilter = function(event) {
      event.target.classList.add('updating');
      infojs.time('updating');
      let entryNodes = scrollView.querySelectorAll('entry-ui');
      let regexp = stringToRegexp(event.target.value.trim());
      if (regexp) {
        Array.prototype.forEach.call(entryNodes, function(node, index) {
          let activity = node.activity;
          if (regexp.test(activity.textContent)) {
            node.classList.remove('filtered');
          }
          else {
            node.classList.add('filtered');
          }
        });
      }
      else {
        Array.prototype.forEach.call(entryNodes, function(node, index) {
          node.classList.remove('filtered');
        });
      }
      headerUI.toggleFilter();
      updateScrollLinks();
      window.requestAnimationFrame(function (timestamp) {
        let firstUnfilteredEntryNode = scrollView.querySelector('entry-ui:not(.filtered)');
        firstUnfilteredEntryNode.scrollIntoView({block: "center", inline: "center"});
      });
      event.target.classList.remove('updating');
      infojs.timeEnd('updating');
    };
    let timeoutId;
    filter.addEventListener('input', event => {
      if (event.target.value == '') {
        filter.classList.add('empty');
      }
      else {
        filter.classList.remove('empty');
      }
    });
    filter.addEventListener('keyup', event => {
      // infojs.info('^- updating filter -^');
      // infojs.info(event);
      // Brave on Android only receives Enter for input type='search',
      // which we use as workaround.
      if (event.key == 'Enter') {
        updateFilter(event);
      }
    });

    let pendingFrame = false;
    let elementAtCenter;
    let recenterCenterElement = () => {
      if (elementAtCenter) {
        scrollView.removeEventListener('scroll', scrollListener);
        ORIENTATION && console.log('remove scrollListener');
        ORIENTATION && console.log(elementAtCenter.innerText);
        // window.setTimeout(() => {
        // window.requestAnimationFrame(function (timestamp) {
          elementAtCenter.scrollIntoView({block: "center", inline: "center"});
          ORIENTATION && console.log(scrollView.scrollTop);
        // });
        // }, 50);
        window.setTimeout(() => {
          scrollView.addEventListener('scroll', scrollListener);
          ORIENTATION && console.log('add scrollListener');
        }, 1000);
      }
    };
    let scrollListener = (event) => {
      SCROLL && console.log(event.type, event.target.scrollTop);
      elementAtCenter = document.elementFromPoint(scrollView.offsetLeft + scrollView.offsetWidth / 2, scrollView.offsetTop + scrollView.offsetHeight / 2);
      if (!pendingFrame) {
        window.requestAnimationFrame(function (timestamp) {
          // timer = window.setTimeout(() => {
          [
            startMenu,
            endMenu,
            revisionsMenu,
            activityMenu,
            operationMenu,
          ].forEach(function (menu) {
            menu.style.display = 'none';
          });
          pendingFrame = false;
          // }, 500);
        });
        pendingFrame = true;
      }
    };
    scrollView.addEventListener('scroll', scrollListener);
    scrollView.addEventListener('click', function (event) {
      // event.preventDefault();
      // event.stopPropagation();
      var bcr = event.target.getBoundingClientRect();
      let menu = event.composedPath()[0];
      // entry-ui inside shadow dom.
      let entry = event.composedPath()[2];
      // checkbox is a slotted child, hence the space before :checked.
      let checkedEntries = document.querySelectorAll('entry-ui :checked')
      let operationCount = checkedEntries.length;
      if (menu.classList.contains("start")) {
        if (startMenu.style.display == 'none') {
          utilsjs.positionMenu(startMenu, event);
          startMenu.dataset.id = entry.id;
          if (!entry.checked && operationCount == 1) {
            document.getElementById('start_at_checked').removeAttribute('disabled');
          }
          else {
            document.getElementById('start_at_checked').setAttribute('disabled', true);
          }
        }
        else {
          startMenu.style.display = 'none';
          delete startMenu.dataset.id;
        }
      }
      if (menu.classList.contains("end")) {
        if (endMenu.style.display == 'none') {
          utilsjs.positionMenu(endMenu, event);
          endMenu.dataset.id = entry.id;
          if (entry.end.textContent == ' ') {
            document.getElementById('end_undefined').setAttribute('disabled', true);
          }
          else {
            document.getElementById('end_undefined').removeAttribute('disabled');
          }
          if (!entry.checked && operationCount == 1) {
            document.getElementById('end_at_checked').removeAttribute('disabled');
          }
          else {
            document.getElementById('end_at_checked').setAttribute('disabled', true);
          }
        }
        else {
          endMenu.style.display = 'none';
          delete endMenu.dataset.id;
        }
      }
      if (menu.classList.contains("revisions")) {
        if (revisionsMenu.style.display == 'none') {
          utilsjs.positionMenu(revisionsMenu, event);
          revisionsMenu.dataset.id = entry.id;
          if (event.target.parentElement.classList.contains('available')) {
            // document.getElementById('add_as_new_revision').setAttribute('href', '#add_as_new_revision');
            // document.getElementById('show_revisions').removeAttribute('href');
          }
          else {
            // document.getElementById('add_as_new_revision').removeAttribute('href');
            // document.getElementById('show_revisions').setAttribute('href', '#show_revisions');
          }
        }
        else {
          revisionsMenu.style.display = 'none';
          delete revisionsMenu.dataset.id;
        }
      }
      if (menu.classList.contains("activity")) {
        if (operationCount > 0) {
          let title = document.getElementById('operation_menu_title');
          let ids = Array.from(checkedEntries, elem => elem.parentElement.id);
          title.textContent = `${operationCount} checked ${ids}`;
        }
        let menu = entry.checked ? operationMenu : activityMenu;
        if (menu.style.display == 'none') {
          utilsjs.positionMenu(menu, event);
          menu.dataset.id = event.composedPath()[2].id;
          if (!entry.checked && operationCount == 1) {
            document.getElementById('activity_at_checked').removeAttribute('disabled');
          }
          else {
            document.getElementById('activity_at_checked').setAttribute('disabled', true);
          }
          if (entry.checked && operationCount == 2) {
            document.getElementById('fill_gap').removeAttribute('disabled');
          }
          else {
            document.getElementById('fill_gap').setAttribute('disabled', true);
          }
          if (entry.checked && operationCount > 0) {
            document.getElementById('delete').removeAttribute('disabled');
          }
          else {
            document.getElementById('delete').setAttribute('disabled', true);
          }
        }
        else {
          menu.style.display = 'none';
          delete menu.dataset.id;
        }
      }
    });
    let scrollBar = document.querySelector('nav#punchcard_scrollbar');
    // db.allDocs({include_docs: true, descending: false}, function(err, doc) {
    let ignore = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    let log = (event) => {
      // event.preventDefault();
      // event.stopPropagation();
    };
    let click = (event) => {
      // event.preventDefault();
      // event.stopPropagation();
      if (event.changedTouches.length) {
        let it = document.elementFromPoint(event.changedTouches[event.changedTouches.length-1].clientX, event.changedTouches[event.changedTouches.length-1].clientY);
        it.click();
      }
    };
    screen.orientation.addEventListener('change', (event) => {
      ORIENTATION && console.log("orientation.orientation", event.type, event.eventPhase, screen, event);
    }, true);
    screen.orientation.addEventListener('change', (event) => {
      ORIENTATION && console.log("orientation.orientation", event.type, event.eventPhase, screen, event);
      ORIENTATION && console.log(event.type, scrollView.scrollTop);
      // [
      //   startMenu,
      //   endMenu,
      //   revisionsMenu,
      //   activityMenu
      // ].some(function (menu) {
      //   if (menu.style.display == 'block') {
      //     // window.requestAnimationFrame(function (timestamp) {
      //     window.setTimeout(() => {
      //       let element = document.getElementById(menu.dataset.id);
      //       console.log(element, element.id, menu.dataset.id);
      //       console.log(event.type, scrollView.scrollTop);
      //       element.scrollIntoView({block: "center", inline: "center"});
      //       console.log(event.type, scrollView.scrollTop);
      //     }, 500);
      //     // });
      //     return true;
      //   }
      //   // console.log(`centering ${menu.dataset.id}`);
      // });
      recenterCenterElement();
    });
    // All these listener capture values report Event.AT_TARGET
    // screen.orientation.addEventListener('change', (event) => {
    //   ORIENTATION && console.log("orientation.orientation", event.type, event.eventPhase, screen, event);
    // }, true);
    // screen.orientation.addEventListener('change', (event) => {
    //   ORIENTATION && console.log("orientation.orientation", event.type, event.eventPhase, screen, event);
    // }, false);
    // screen.orientation.onchange = function (arg) {
    //   ORIENTATION && console.log("The orientation of the screen is: " + screen.orientation, screen, arg);
    // };

    var addNewEdit = function(id, copy) {
      let neu = new NewEntryUI(id, copy);
      document.querySelector('#top').insertAdjacentElement('afterend', neu);
    };

    var startNow = function (event) {
      let startText = (new Date).toJSON();
      startAt.call(this, event, startText);
    }

    var startAtCheckedEnd = function (event) {
      let startText;
      let allChecked = document.querySelectorAll('entry-ui :checked');
      if (allChecked.length == 1) {
        let id = allChecked[0].parentElement.id;
        db.get(id).then(function(otherDoc) {
          if ('end' in otherDoc) {
            // We derive the _id from the start time and have no start property.
            startText = otherDoc.end;
            startAt.call(this, event, startText);
          }
          else {
            infojs.error('cannot start at undefined end', document.getElementById(id).parentElement);
          }
        }).catch(function(err) {
          //errors
          infojs.error(err, document.getElementById(id).parentElement);
        });
        }
      }

    let startAt = function (event, startText) {
        event.preventDefault();
        var id = getDataSetIdHideMenu(event);
        db.get(id).then(function(otherDoc) {
          let oldStartText = otherDoc._id.substring(0, 24);
          var changedStart = !(oldStartText == startText);
          if (changedStart) {
            let newDoc = {};
            otherDoc._deleted = true;
            db.put(otherDoc).then(function(response) {
              document.getElementById(response.id).classList.add('deleted');
            }).catch(function(err) {
              infojs.error(err, document.getElementById(id).parentElement);
            });
            newDoc = {
              _id: startText + utilsjs.getRandom12HexDigits(),
              activity: otherDoc.activity
            };
            if ('end' in otherDoc) {
              newDoc.end = otherDoc.end;
            }
            db.put(newDoc).then(function(response) {
              var beforeThisElement = document.getElementById(id);
              var newEntry = utilsjs.addNewEntry(newDoc, beforeThisElement.parentElement, beforeThisElement);
              setAvailableRevisionCount(document.getElementById(response.id));
              newEntry.scrollIntoView({block: "center", inline: "center"});
              newEntry.activity.classList.add('changed');
              newEntry.start.classList.add('changed');
              newEntry.end.classList.add('changed');
              newEntry.revisions.classList.add('changed');
            }).catch(function(err) {
              //errors
              infojs.error(err, document.getElementById(id).parentElement);
            });
          }
        }).catch(function(err) {
          //errors
          infojs.error(err, document.getElementById(id).parentElement);
        });
        // An IndexedDB transaction that was not yet complete has been aborted due to page navigation.
        // document.location.reload('force');
      }

    // var startAtChecked = startAt(true);

    var startNowItem = document.querySelector('#start_now');
    if (startNowItem) {
      startNowItem.addEventListener('click', startNow);
    }

    var startAtCheckedItem = document.querySelector('#start_at_checked');
    if (startAtCheckedItem) {
      // Uses start time of only checked entry
      startAtCheckedItem.addEventListener('click', startAtCheckedEnd);
    }

    var endNow = function (event) {
      let endText = (new Date).toJSON();
      endAt.call(this, event, endText);
    }

    var endAtCheckedStart = function (event) {
      let endText;
      let allChecked = document.querySelectorAll('entry-ui :checked');
      if (allChecked.length == 1) {
        let id = allChecked[0].parentElement.id;
        db.get(id).then(function(otherDoc) {
          endText = otherDoc._id.substring(0,24);
          endAt.call(this, event, endText);
        }).catch(function(err) {
          //errors
          infojs.error(err, document.getElementById(id).parentElement);
        });
        }
      }

    var endAt = function (event, endText) {
      event.preventDefault();
      var id = getDataSetIdHideMenu(event);
      db.get(id).then(function(otherDoc) {
        let startText = otherDoc._id.substring(0,24);
        otherDoc.end = endText;
        return db.put(otherDoc).then(function(response) {
          utilsjs.updateEntriesElement(id, 'end', utilsjs.formatEndDate(new Date(endText)));
          setAvailableRevisionCount(document.getElementById(id));
          utilsjs.updateEntriesElement(id, 'duration', utilsjs.reportDateTimeDiff(new Date(startText), new Date(endText)));
        }).catch(function(err) {
          //errors
          infojs.error(err, document.getElementById(id).parentElement);
        });
      }).catch(function(err) {
        //errors
        infojs.error(err, document.getElementById(id).parentElement);
      });
    };
    var endNowItem = document.querySelector('#end_now');
    if (endNowItem) {
      endNowItem.addEventListener('click', endNow);
    }
    var endAtCheckedItem = document.querySelector('#end_at_checked');
    if (endAtCheckedItem) {
      endAtCheckedItem.addEventListener('click', endAtCheckedStart);
    }
    var endUndefined = function (event) {
      event.preventDefault();
      var id = getDataSetIdHideMenu(event);
      db.get(id).then(function(otherDoc) {
        delete otherDoc.end;
        return db.put(otherDoc).then(function(response) {
          utilsjs.updateEntriesElement(id, 'end', ' ');
          setAvailableRevisionCount(document.getElementById(id));
          utilsjs.updateEntriesElement(id, 'duration', ' ');
        }).catch(function(err) {
          //errors
          infojs.error(err, document.getElementById(id).parentElement);
        });
      }).catch(function(err) {
        //errors
        infojs.error(err, document.getElementById(id).parentElement);
      });
    };
    var endUndefinedItem = document.querySelector('#end_undefined');
    if (endUndefinedItem) {
      endUndefinedItem.addEventListener('click', endUndefined);
    }
    var showRevisions = function (event) {
      event.preventDefault();
      // Keep this _ separator in sync with function addNewEntry in utils.js
      let elementId = getDataSetIdHideMenu(event);
      var parts = elementId.split(/_/);
      var id = parts[0];
      var rev = parts[1];
      let entriesNodes = scrollView.querySelectorAll('entries-ui');
      let entryNodes = scrollView.querySelectorAll('entry-ui');
      let beforeThisElement = document.getElementById(elementId);
      if (!beforeThisElement.classList.contains('available')) {
        let options = {
          // Defaults to winning revision
          // rev: doc._rev,
          // open_revs: "all"
          // conflicts: true
          revs_info: true
        };
        if (rev) {
          options.rev = rev;
        }
        else {
        }
        db.get(id, options).then(function (otherDoc) {
          var currentRev = otherDoc._rev;
          otherDoc._revs_info.filter(function (rev) {
            return rev.status == 'available' && rev.rev != currentRev;
          }).forEach(function (available, index, obj) {
            db.get(id, { rev: available.rev }).then(function (availableDoc) {
              var newEntry = utilsjs.addNewEntry(availableDoc, beforeThisElement.parentElement, 
                                                 beforeThisElement, 'addRevisionToElementId');
              newEntry.revisions.textContent = (index + 1) + ' of ' + obj.length + ' revs';
              // NOTE addRevisionToElementId argument makes this more obvious.
              // newEntry.id = entry._id + '.' + entry._rev;
              newEntry.scrollIntoView({block: "center", inline: "center"});
              if (availableDoc._deleted) {
                newEntry.classList.add('deleted');
              }
              else {
                newEntry.classList.add('available');
              }
            });
          });
        }).catch(function (err) {
          infojs.error(err, beforeThisElement.parentNode.host);
        });
      }
    };
    var showRevisionsItem = document.querySelector('#show_revisions');
    if (showRevisionsItem) {
      showRevisionsItem.addEventListener('click', showRevisions);
    }
    let putNewRevision = (id, thisRevision, currentRevision) => {
      db.get(id, {
        rev: thisRevision
      }).then(function(otherDoc) {
        let elementId = otherDoc._id;
        // Put a new doc based on the current revision using otherDoc content.
        // There is no currentRevision when the doc has since be deleted.
        if (currentRevision) {
          otherDoc._rev = currentRevision;
        }
        else {
          elementId += '_' + thisRevision;
        }
        // We need to get rid of _deleted property, if this is a deleted version.
        if (otherDoc._deleted) {
          delete otherDoc._deleted;
        }
        db.put(otherDoc).then(function(response) {
          document.getElementById(elementId).classList.remove('deleted');
          var start = new Date(otherDoc._id.substring(0, 24));
          utilsjs.updateEntriesElement(elementId, 'pre.start', utilsjs.formatStartDate(start));
          if ('end' in otherDoc) {
            let end = new Date(otherDoc.end);
            utilsjs.updateEntriesElement(elementId, 'pre.end', utilsjs.formatStartDate(end));
            utilsjs.updateEntriesElement(elementId, 'pre.duration', utilsjs.reportDateTimeDiff(start, end));
          }
          else {
            // Element needs some content to receive click event to bring up endMenu.
            utilsjs.updateEntriesElement(elementId, 'pre.end', ' ');
          }
          utilsjs.updateEntriesElement(elementId, 'pre.activity', otherDoc.activity);
          setAvailableRevisionCount(document.getElementById(elementId));
        }).catch(function(err) {
          //errors
          infojs.error(err, document.getElementById(id).parentElement);
        });
      }).catch(function(err) {
        //errors
        infojs.error(err, document.getElementById(id).parentElement);
      });
    };
    var addAsNewRevision = function (event) {
      event.preventDefault();
      // Keep this _ separator in sync with function addNewEntry in utils.js
      let elementId = getDataSetIdHideMenu(event);
      var parts = elementId.split(/_/);
      var id = parts[0];
      var rev = parts[1];
      db.get(id).then(function(currentDoc) {
        putNewRevision(id, rev, currentDoc._rev);
      }).catch(function(err) {
        // This is a deleted doc, use revision.
        putNewRevision(id, rev);
        infojs.error(err, document.getElementById(id).parentElement);
      });
    };
    var addAsNewRevisionItem = document.querySelector('#add_as_new_revision');
    if (addAsNewRevisionItem) {
      addAsNewRevisionItem.addEventListener('click', addAsNewRevision);
    }

    var edit = function(event) {
      let id = getDataSetIdHideMenu(event);
      addNewEdit(id);
    };
    var view = function(event) {
      let id = getDataSetIdHideMenu(event);
      let entry = document.getElementById(id);
      if (entry.view.style.display == 'none') {
        entry.view.innerHTML = marked.parse(entry.activity.textContent);
        entry.view.style.display = '';
      }
      else {
        entry.view.style.display = 'none';
        entry.view.innerHTML = '';
      }
    }
    var editItem = document.querySelector('#edit');
    if (editItem) {
      editItem.addEventListener('click', edit);
    }
    var viewItem = document.querySelector('#view');
    if (viewItem) {
      viewItem.addEventListener('click', view);
    }
    var editNewCopy = function (event) {
      event.preventDefault();
      let id = getDataSetIdHideMenu(event);
      addNewEdit(id, 'new_copy');
    }
    var editNewCopyItem = document.querySelector('#edit_new_copy');
    if (editNewCopyItem) {
      editNewCopyItem.addEventListener('click', editNewCopy);
    }

    var activityAtChecked = function (event) {
      let activityText;
      let allChecked = document.querySelectorAll('entry-ui :checked');
      if (allChecked.length == 1) {
        let id = allChecked[0].parentElement.id;
        db.get(id).then(function(otherDoc) {
          activityText = otherDoc.activity;
          activityAt.call(this, event, activityText);
        }).catch(function(err) {
          //errors
          infojs.error(err, document.getElementById(id).parentElement);
        });
        }
      }

    var activityAt = function (event, activityText) {
      event.preventDefault();
      var id = getDataSetIdHideMenu(event);
      db.get(id).then(function(otherDoc) {
        otherDoc.activity = activityText;
        return db.put(otherDoc).then(function(response) {
          utilsjs.updateEntriesElement(id, 'activity', activityText);
          setAvailableRevisionCount(document.getElementById(id));
        }).catch(function(err) {
          //errors
          infojs.error(err, document.getElementById(id).parentElement);
        });
      }).catch(function(err) {
        //errors
        infojs.error(err, document.getElementById(id).parentElement);
      });
    }
    var activityAtCheckedItem = document.querySelector('#activity_at_checked');
    if (activityAtCheckedItem) {
      activityAtCheckedItem.addEventListener('click', activityAtChecked);
    }
    let queryHour = function(event) {
      try {
        let id = getDataSetIdHideMenu(event);
        db.get(id).then(function(currentDoc) {
          let options = {
            descending: true,
            limit: 999,
          };
          options.query_start = (new Date(new Date(currentDoc._id.substring(0, 24)).getTime() - 3.6e6 * 0.5)).toJSON();
          options.query_end = (new Date(new Date(currentDoc._id.substring(0, 24)).getTime() + 3.6e6 * 0.5)).toJSON();
          runQuery(options);
        }).catch(function(err) {
          infojs.error(err);
        });
      }
      catch(err) {
        infojs.error(err);
      }
    };
    let queryHourItem = document.querySelector('#query_hour');
    if (queryHourItem) {
      queryHourItem.addEventListener('click', queryHour);
    }
    let queryDay = function(event) {
      try {
        let id = getDataSetIdHideMenu(event);
        db.get(id).then(function(currentDoc) {
          let options = {
            descending: true,
            limit: 999,
          };
          options.query_start = (new Date(new Date(currentDoc._id.substring(0, 24)).getTime() - 3.6e6 * 24 * 0.5)).toJSON();
          options.query_end = (new Date(new Date(currentDoc._id.substring(0, 24)).getTime() + 3.6e6 * 24 * 0.5)).toJSON();
          runQuery(options);
        }).catch(function(err) {
          infojs.error(err);
        });
      }
      catch(err) {
        infojs.error(err);
      }
    };
    let queryDayItem = document.querySelector('#query_day');
    if (queryDayItem) {
      queryDayItem.addEventListener('click', queryDay);
    }
    let queryWeek = function(event) {
      let id = getDataSetIdHideMenu(event);
      db.get(id).then(function(currentDoc) {
        let options = {
          descending: true,
          limit: 999,
        };
        options.query_start = (new Date(new Date(currentDoc._id.substring(0, 24)).getTime() - 3.6e6 * 24 * 3.5)).toJSON();
        options.query_end = (new Date(new Date(currentDoc._id.substring(0, 24)).getTime() + 3.6e6 * 24 * 3.5)).toJSON();
        runQuery(options);
      }).catch(function(err) {
        infojs.error(err);
      });
    };
    let queryWeekItem = document.querySelector('#query_week');
    if (queryWeekItem) {
      queryWeekItem.addEventListener('click', queryWeek);
    }

    // Query some entries in descending order when application starts.
    false && runQuery({
      descending: true,
      include_docs: true,
      conflicts: true,
      limit: 29,
    });

    // Query recent changes when application starts.
    true && runQuery({
      db_changes: true, // run db.changes instead of db.allDocs
      descending: true,
      include_docs: true,
      conflicts: true,
      limit: 99,
      live: false,
      return_docs: false,
      since: 'now', // ignored when descending is true
      style: 'all_docs'
    });

    var getDataSetIdHideMenu = function(event) {
      let id = event.target.parentElement.parentElement.dataset.id;
      if (id) {
        event.target.parentElement.parentElement.style.display = 'none';
      }
      return id;
    }

    var repeatNow = function (event) {
      event.preventDefault();
      var id = getDataSetIdHideMenu(event);
      db.get(id).then(function(otherDoc) {
        var entry = {
          _id: (new Date()).toJSON() + utilsjs.getRandom12HexDigits(),
          activity: otherDoc.activity,
        };
        db.put(entry).then(function(response) {
          entry._id = response.id;
          // NOTE Don't pass rev if it is the current/new revision.
          // See showRevisions for its use in HTML id to identify
          // historic revisions in UI.
          // entry._rev = response.rev;
          var beforeThisElement = document.getElementById(id);
          var newEntry = utilsjs.addNewEntry(entry, beforeThisElement.parentElement, beforeThisElement);
          setAvailableRevisionCount(document.getElementById(id));
          newEntry.scrollIntoView({block: "center", inline: "center"});
          newEntry.activity.classList.add('changed');
          newEntry.start.classList.add('changed');
          newEntry.end.classList.add('changed');
          newEntry.revisions.classList.add('changed');
          // document.location.reload('force');
        }).catch(function(err) {
          //errors
          infojs.error(err, document.getElementById(id).parentElement);
        });
      }).catch(function(err) {
        //errors
        infojs.error(err, document.getElementById(id).parentElement);
      });
    };
    var repeatNowItem = document.querySelector('#repeat_now');
    if (repeatNowItem) {
      repeatNowItem.addEventListener('click', repeatNow);
    }
    var fillGap = function (event) {
      let id = getDataSetIdHideMenu(event);
      let allChecked = document.querySelectorAll('entry-ui :checked');
      if (allChecked.length == 2) {
        let ids = Array.from(allChecked).map(elem => elem.parentElement.id);
        db.allDocs({
          include_docs: true,
          keys: ids
        }).then(function(otherDocs) {
          otherDocs.rows[0].doc.activity
          let entry = {
            // If there is no end, take start (_id substring) to be the end.
            // FIXME: this code assumes descending order!
          _id: (otherDocs.rows[1].doc.end || otherDocs.rows[1].doc._id.substring(0, 24)) + utilsjs.getRandom12HexDigits(),
          end: otherDocs.rows[0].doc._id.substring(0, 24),
          activity: `Gap between ${otherDocs.rows[1].doc.activity.substring(0, 20)}... *and* ${otherDocs.rows[0].doc.activity.substring(0, 20)}...`,
        };
        db.put(entry).then(function(response) {
          entry._id = response.id;
          // NOTE Don't pass rev if it is the current/new revision.
          // See showRevisions for its use in HTML id to identify
          // historic revisions in UI.
          // entry._rev = response.rev;
          var beforeThisElement = document.getElementById(id);
          var newEntry = utilsjs.addNewEntry(entry, beforeThisElement.parentElement, beforeThisElement);
          setAvailableRevisionCount(document.getElementById(id));
          newEntry.scrollIntoView({block: "center", inline: "center"});
          newEntry.activity.classList.add('changed');
          newEntry.start.classList.add('changed');
          newEntry.end.classList.add('changed');
          newEntry.revisions.classList.add('changed');
        }).catch(function(err) {
          //errors
          infojs.error(err, document.getElementById(id).parentElement);
        });
        }).catch(function(err) {
          //errors
          infojs.error(err, document.getElementById(id).parentElement);
        });
      }
      // addNewEdit(id, 'new_copy');
    }
    var fillGapItem = document.querySelector('#fill_gap');
    if (fillGapItem) {
      fillGapItem.addEventListener('click', fillGap);
    }
    var deleteEntry = function (event) {
      // just hide menu
      getDataSetIdHideMenu(event);
      event.preventDefault();
      let allChecked = document.querySelectorAll('entry-ui :checked');
      allChecked.forEach((entry) => {
        let id = entry.parentElement.id;
        db.get(id).then(function(doc) {
          if (window.confirm('Delete entry? ' + doc.activity)) {
            // db.remove is not equivalent to db.put with _deleted = true
            // as might be assumed from
            // http://pouchdb.com/api.html#delete_document
            // See
            // http://pouchdb.com/api.html#filtered-replication
            // and
            // https://github.com/pouchdb/pouchdb/issues/4796
            if (true) {
              doc._deleted = true;
              return db.put(doc).then(function(response) {
                var deletedElement = document.getElementById(id);
                // Keep this _ separator in sync with function addNewEntry in utils.js
                deletedElement.id = response.id + '_' + response.rev;
                deletedElement.classList.add('deleted');
                // document.location.reload('force');
              }).catch(function (err) {
                infojs.error(err);
              });
            }
            else {
              return db.remove(doc).then(function(response) {
                // document.location.reload('force');
              }).catch(function (err) {
                infojs.error(err, document.getElementById(id).parentElement);
              });
            }
          }
        }).catch(function(err){
          infojs.error(err);
          //errors
        });
      });
    };
    var deleteEntryItem = document.querySelector('#delete');
    if (deleteEntryItem) {
      deleteEntryItem.addEventListener('click', deleteEntry);
    }
    var map = {
      map:
      function(doc) {
        if (doc.clockin_ms) {
          emit(doc.clockin_ms, 1);
        }
      }
    };
  }
  catch(err) {
    infojs.error(err);
  }
});

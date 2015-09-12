;'use strict';
define(['require', 'app/utils'], function(require, utilsjs) {
  // DOMContentLoaded is fired once the document has been loaded and parsed,
  // but without waiting for other external resources to load (css/images/etc)
  // That makes the app more responsive and perceived as faster.
  // https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
  // window.addEventListener('DOMContentLoaded', function(event) {
  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  var DEBUG = false;
  var TIME = true;
  var resultIndex = 1;
  // require('getElementPath');
  // window.alert(gep.getElementPath(event.target));
  // var db = new PouchDB('apa-test-2');
  var db = new PouchDB('punchcard3');
  var entries = document.getElementById('entries');
  var otherView = document.querySelector('section#view-after-punchcard-list');
  var scrollView = document.querySelector('section#view-punchcard-list.view.view-noscroll');
  var startMenu = document.getElementById('start_menu');
  var endMenu = document.getElementById('end_menu');
  var activityMenu = document.getElementById('activity_menu');
  var request = navigator.mozApps.getSelf();
  request.onsuccess = function() { alert(JSON.stringify(request.result, Object.getOwnPropertyNames(request.result), 2)); };
  request.onerror = function() { JSON.stringify(request.result, Object.getOwnPropertyNames(request.error.name), 2); };
  scrollView.addEventListener('scroll', function (event) {
    [
      startMenu,
      endMenu,
      activityMenu
    ].forEach(function (menu) {
      menu.style.display = 'none';
    });
  });
  scrollView.addEventListener('click', function (event) {
    // event.preventDefault();
    // event.stopPropagation();
    var bcr = event.target.getBoundingClientRect();
    if (event.target.classList.contains("start")) {
      if (startMenu.style.display == 'none') {
        startMenu.style = 'display: block; top: ' + event.clientY + 'px; left: ' + event.clientX + 'px';
        startMenu.dataset.id = event.target.parentElement.id;
      }
      else {
        startMenu.style = 'display: none;';
        delete startMenu.dataset.id;
      }
    }
    if (event.target.classList.contains("end")) {
      if (endMenu.style.display == 'none') {
        endMenu.style = 'display: block; top: ' + event.clientY + 'px; left: ' + event.clientX + 'px';
        endMenu.dataset.id = event.target.parentElement.id;
      }
      else {
        endMenu.style = 'display: none;';
        delete endMenu.dataset.id;
      }
    }
    if (event.target.classList.contains("revisions")) {
    }
    if (event.target.classList.contains("activity")) {
      if (activityMenu.style.display == 'none') {
        activityMenu.style = 'display: block; top: ' + event.clientY + 'px; left: ' + event.clientX + 'px';
        activityMenu.dataset.id = event.target.parentElement.id;
      }
      else {
        activityMenu.style = 'display: none;';
        delete activityMenu.dataset.id;
      }
    }
  });
  var scrollBar = document.querySelector('nav#punchcard_scrollbar');
  // scrollView.addEventListener('scroll', function (event) {
  //   scrollBar.style.right = '0';
  // });
  // scrollView.addEventListener('click', function (event) {
  //   // if (event.target === document.body) {
  //     if (scrollBar.style.right == '0px') {
  //       scrollBar.style.right = '-5em';
  //     }
  //     else {
  //       scrollBar.style.right = '0';
  //     }
  //   // }
  // });
  // db.allDocs({include_docs: true, descending: false}, function(err, doc) {
  var startNow = function (event) {
    event.preventDefault();
    var id = getDataSetIdHideMenu(event);
    db.get(id).then(function(otherDoc) {
      var now = new Date;
      otherDoc.start = now.toJSON();
      return db.put(otherDoc).then(function(response) {
        utilsjs.updateEntriesElement(id, 'pre.start', utilsjs.formatStartDate(now));
        utilsjs.updateEntriesElement(id, 'pre.duration', utilsjs.reportDateTimeDiff(now, otherDoc.end));
        // saveLink.click();
      }).catch(function(err) {
        //errors
        window.alert(err);
      });
    }).catch(function(err) {
      //errors
      window.alert(err);
    });
    // An IndexedDB transaction that was not yet complete has been aborted due to page navigation.
    // document.location.reload('force');
  };
  var startNowItem = document.querySelector('#start_now');
  if (startNowItem) {
    startNowItem.addEventListener('click', startNow);
  }
  var endNow = function (event) {
    event.preventDefault();
    var id = getDataSetIdHideMenu(event);
    db.get(id).then(function(otherDoc) {
      var now = new Date;
      otherDoc.end = now.toJSON();
      return db.put(otherDoc).then(function(response) {
        utilsjs.updateEntriesElement(id, 'pre.end', utilsjs.formatEndDate(now));
        utilsjs.updateEntriesElement(id, 'pre.duration', utilsjs.reportDateTimeDiff(new Date(otherDoc.start), now));
        // saveLink.click();
      }).catch(function(err) {
        //errors
        window.alert(err);
      });
    }).catch(function(err) {
      //errors
      window.alert(err);
    });
  };
  var endNowItem = document.querySelector('#end_now');
  if (endNowItem) {
    endNowItem.addEventListener('click', endNow);
  }
  var edit = function (event) {
    event.preventDefault();
    var newEntry = document.querySelector('#new_entry');
    require(['./new'], function (newjs) {
      if (newEntry && newjs) {
        // newEntry.style.display = 'none';
        if (newEntry.style.display == 'none') {
          newEntry.style.display = 'block';
          // TODO: Re-use of header icon for existing and new entries may be confusing.

          ediNewItem.style.opacity = '0.3';
          var id = getDataSetIdHideMenu(event);
          newjs.init(id);
          var a = document.createElement('a');
          // a.href = '/build/new.html#' + id;
          a.href = '#new_entry'/* + id*/;
          document.body.appendChild(a);
          a.click();
        }
      }
    });
  };
  var editItem = document.querySelector('#edit');
  if (editItem) {
    editItem.addEventListener('click', edit);
  }
  var editNewCopy = function (event) {
    event.preventDefault();
    var newEntry = document.querySelector('#new_entry');
    require(['./new'], function (newjs) {
      if (newEntry && newjs) {
        // newEntry.style.display = 'none';
        if (newEntry.style.display == 'none') {
          newEntry.style.display = 'block';
          // TODO: Re-use of header icon for existing and new entries may be confusing.

          ediNewItem.style.opacity = '0.3';
          var id = getDataSetIdHideMenu(event);
          db.get(id).then(function(otherDoc) {
            var entry = {
              // _id: db.post(),
              activity: otherDoc.activity,
              start: otherDoc.start,
              end: otherDoc.end
            };
            db.post(entry).then(function(response) {
              // This is a way to put new entry above others.
              // TODO: Find a cleaner design. entries has acccumulated various foreign elements
              // for the convenience of being nicely scrollable via scrollbar.
              // NOTE: Don't forget to add newlyobtained id!
              entry._id = response.id;
              var newEntry = utilsjs.addNewEntry(entry, entries, document.getElementById(id));
              newEntry.querySelector('pre.activity').classList.add('changed');
              newEntry.querySelector('pre.start').classList.add('changed');
              newEntry.querySelector('pre.end').classList.add('changed');
              newjs.init(response.id);
              var a = document.createElement('a');
              // a.href = '/build/new.html#' + id;
              a.href = '#new_entry'/* + id*/;
              document.body.appendChild(a);
              a.click();
            }).catch(function(err) {
              //errors
              window.alert(err);
            });
          }).catch(function(err) {
            //errors
            window.alert(err);
          });
        }
      }
    });
  };
  var editNewCopyItem = document.querySelector('#edit_new_copy');
  if (editNewCopyItem) {
    editNewCopyItem.addEventListener('click', editNewCopy);
  }
  var copyActivity = function(event) {
    event.preventDefault();
    event.stopPropagation();
    var id = getDataSetIdHideMenu(event);
    // NOTE: Works, but too silly to be considered.
    // var activityItem = document.getElementById(id).querySelector('pre.activity');
    // var s = getSelection();
    // s.removeAllRanges();
    // var r = document.createRange();
    // r.selectNodeContents(activityItem);
    // s.addRange(r);
    // var sel= s.toString();
    // window.alert(sel);
  };
  var copyActivityItem = document.querySelector('#copy_activity_menuitem');
  if (copyActivityItem) {
    copyActivityItem.addEventListener('click', copyActivity);
  }
  var pasteActivityItem = document.querySelector('#paste_activity_menuitem');
  if (pasteActivityItem) {
    pasteActivityItem.addEventListener('click', pasteActivity);
  }
  var toggleEdit = function(event) {
    event.preventDefault();
    event.stopPropagation();
    require(['./new'], function (newjs) {
      var newEntry = document.querySelector('#new_entry');
      if (newjs) {
        if (newEntry) {
          if (newEntry.style.display == 'none') {
            // otherView.style.display = 'block';
            newEntry.style.display = 'block';
            event.target.style.opacity = '0.3';
            var id = event.target.parentElement.parentElement.dataset.id;
            var a = document.createElement('a');
            // a.href = '/build/new.html#' + id;
            a.href = '#new_entry'/* + id*/;
            document.body.appendChild(a);
            a.click();
            // Start editing a new entry, start and end times ticking.
            newjs.init(undefined);
            newEntry.scrollIntoView();
          }
          else {
            var res = newjs.save();
            DEBUG && console.log(res);
            res && res.then(function (result) {
              if (result) {
                // otherView.style.display = 'none';
                newEntry.style.display = 'none';
                event.target.style.opacity = '1.0';
                // document.location.reload('force');
              }
            }).catch(function (err) {
              window.alert('saving entry failed, please review values of start, end, activity.');
            });
          }
        }
      }
    });
  };
  var ediNewItem = document.querySelector('a.edit');
  if (ediNewItem) {
    ediNewItem.addEventListener('click', toggleEdit);
  }
  var toggleAbout = function(event) {
    event.preventDefault();
    event.stopPropagation();
    var aboutElement = document.querySelector('#about');
    // aboutElement.style.display = 'none';
    require(['./about'], function (aboutjs) {
      if (aboutjs) {
        if (aboutElement) {
          if (aboutElement.style.display == 'none') {
            // otherView.style.display = 'block';
            aboutElement.style.display = 'block';
            event.target.style.opacity = '0.3';
            // Let user peruse about information...
            aboutElement.scrollIntoView();
          }
          else {
            // reload document location.
            // otherView.style.display = 'none';
            aboutElement.style.display = 'none';
            event.target.style.opacity = '1.0';

            // TODO: how to best save options without having to actively blur last edit?
            // var value = event.target.type == 'checkbox' ? event.target.checked : event.target.value;
            // optionsDB.get(event.target.id).then(function(otherDoc) {
            //   otherDoc.value = value;
            //   return optionsDB.put(otherDoc).then(function(response) {
            //     // document.location.reload('force');
            //     // saveLink.click();
            //   }).catch(function(err) {
            //     //errors
            //     window.alert(err);
            //   });
            // }).catch(function(err) {
            //   //errors
            //   window.alert(err.message + '\n' + err.stack);
            //   return optionsDB.put({ _id: event.target.id, value: value });
            // });


            // document.location.reload('force');
          }
        }
      }
    });
  };
  var aboutItem = document.querySelector('a.about');
  if (aboutItem) {
    aboutItem.addEventListener('click', toggleAbout);
  }

  var toggleOptionDisplay = function(event) {
    event.preventDefault();
    event.stopPropagation();
    var optionsElement = document.querySelector('#options');
    // optionsElement.style.display = 'none';
    require(['./options'], function (optionjs) {
      if (optionjs) {
        if (optionsElement) {
          if (optionsElement.style.display == 'none') {
            // otherView.style.display = 'block';
            optionsElement.style.display = 'block';
            event.target.style.opacity = '0.3';
            // Let user change options...
            optionsElement.scrollIntoView();
          }
          else {
            // reload document location.
            // otherView.style.display = 'none';
            optionsElement.style.display = 'none';
            event.target.style.opacity = '1.0';
            // document.location.reload('force');
            // DEBUG && console.log('doing document.location.reload();');
            // document.location.reload();
            runQuery();
          }
        }
      }
    });
  };
  var optionsItem = document.querySelector('a.settings');
  if (optionsItem) {
    optionsItem.addEventListener('click', toggleOptionDisplay);
    // NOTE: Let's bring up a menu on click, if necessary, as is already done for #start_menu, etc.
    // optionsItem.addEventListener('contextmenu', function (event) {
    //   window.alert('This could be useful to pick from saved queries, e.g.\nAround now\n100 newest\n100 oldest\netc.');
    // });
  }

  var getDataSetIdHideMenu = function(event) {
    event.target.parentElement.parentElement.style.display = 'none';
    return event.target.parentElement.parentElement.dataset.id;
  }

  var repeatNow = function (event) {
    event.preventDefault();
    var id = getDataSetIdHideMenu(event);
    db.get(id).then(function(otherDoc) {
      var entry = {
        // _id: db.post(),
        activity: otherDoc.activity,
        start: new Date,
        end: new Date
      };
      DEBUG && window.alert(JSON.stringify(entry, null, 2));
      db.post(entry).then(function(response) {
        entry._id = response.id;
        var newEntry = utilsjs.addNewEntry(entry, entries, document.getElementById(id));
        newEntry.querySelector('pre.activity').classList.add('changed');
        newEntry.querySelector('pre.start').classList.add('changed');
        newEntry.querySelector('pre.end').classList.add('changed');
        // document.location.reload('force');
        // saveLink.click();
      }).catch(function(err) {
        //errors
        window.alert(err);
      });
    }).catch(function(err) {
      //errors
      window.alert(err);
    });
  };
  var repeatNowItem = document.querySelector('#repeat_now');
  if (repeatNowItem) {
    repeatNowItem.addEventListener('click', repeatNow);
  }
  var deleteEntry = function (event) {
    event.preventDefault();
    var id = getDataSetIdHideMenu(event);
    db.get(id).then(function(doc) {
      if (window.confirm('Delete entry? ' + doc.activity)) {
        // FIXME: .remove should be equivalent, according to
        // http://pouchdb.com/api.html#delete_document
        if (true) {
          doc._deleted = true;
          return db.put(doc).then(function(response) {
            // document.location.reload('force');
          });
        }
        else {
          return db.remove(doc).then(function(response) {
            // document.location.reload('force');
          });
        }
      }
    }).catch(function(err){
      //errors
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
  var runQuery = function() {
    // db.query(map, {reduce: false, /*startkey: "2010-06-24T15:44:08", endkey: "2010-06-25T15:44:08", */limit: 33, include_docs: true, descending: false}, function(err, doc) {
    // var obj = db.mapreduce(db);
    // db.query(map, {/*stale: 'ok', */reduce: false,
    var queryInfoElement = document.createElement('div');
    var options = {};
    var optionsDB = new PouchDB('options');
    optionsDB.allDocs({
      include_docs: true/*,
  attachments: true*/
    }).then(function (result) {
      if ('rows' in result) {
        DEBUG && console.log('reading all options for db for query configuration', result);
        // window.alert(JSON.stringify(result, null, 2));
        result.rows.forEach(function (option) {
          if ('value' in option.doc) {
            options[option.doc._id] = option.doc.value;
          }
        });
        require(['./info'], function (infojs) {
          var captureGroups = options.deleted_id.match(/^\/?(.+?)(?:\/([gim]*))?$/);
          if (options.deleted_id.length && captureGroups) {
            var regexp = new RegExp(captureGroups[1], captureGroups[2]);
            queryInfoElement.textContent = "\nSearch for deleted activity matching " + regexp.toString(); + "\n";
            entries.appendChild(queryInfoElement);
            db.changes({ include_docs: true, /*style: 'all_docs', */since: 0 }).on('delete', function(info) {
              // infojs({delete: info}, entries);
              // db.allDocs({
              //   include_docs: true,
              //   keys: [info.id]
              // }).then(function (otherDoc) {
              //   infojs({otherDoc: otherDoc}, entries);
              // }).catch(function (err) {
              //   infojs({all_docs_error: err}, entries);
              // });
              db.get(info.doc._id, {
                rev: info.doc._rev,
                revs: true,
                open_revs: "all"
              }).then(function (otherDoc) {
                if (otherDoc[0].ok && otherDoc[0].ok.activity && otherDoc[0].ok.activity.match(regexp)) {
                  infojs({get: otherDoc}, entries);
                  var entry = utilsjs.addNewEntry(otherDoc[0].ok, entries);
                  entry.dataset.result = resultIndex;
                  entry.classList.add('deleted');
                }
                false && otherDoc[0].ok._revisions.ids.forEach(function (rev) {
                  // infojs({ _revisions: [ info.doc._rev, otherDoc[0].ok._revisions.start + '-' + rev ]}, entries);
                  db.get(otherDoc[0].ok._id, {
                    open_revs: [otherDoc[0].ok._revisions.start + '-' + rev]
                  }).then(function (otherDoc) {
                    // db.get(otherDoc[0].ok._id, rev).then(function (otherDoc) {
                    if (otherDoc[0].missing || otherDoc[0].ok._deleted) {
                      // if (otherDoc[0].ok && !otherDoc[0].ok._deleted) {
                    }
                    else {
                    }
                    infojs({ 'rev': otherDoc }, entries);
                  }).catch(function (err) {
                    infojs({rev_error: err}, entries);
                  });
                });
              }).catch(function (err) {
                infojs({get_error:err}, entries);
              });
              //   if (info.seq == 894) {
              //     info.doc._deleted = false;
              //     db.put(info.doc).then(function (otherDoc) {
              //       infojs(otherDoc, entries);
              //     }).catch(function (err) {
              //       infojs(err, entries);
              //     });
              //   }
              // changes() was canceled
            }).on('error', function (err) {
              DEBUG && console.log(err);
              infojs({delete_error: err}, entries);
            });

            // db.get(options.deleted_id, {
            //   // rev: info.doc._rev,
            //   revs: true,
            //   open_revs: "all"
            // }).then(function (otherDoc) {
            //   infojs({get:otherDoc}, entries);
            //   otherDoc[0].ok._revisions.ids.forEach(function (rev) {
            //     // infojs({ _revisions: [ info.doc._rev, otherDoc[0].ok._revisions.start + '-' + rev ]}, entries);
            //     db.get(otherDoc[0].ok._id, {
            //       open_revs: [otherDoc[0].ok._revisions.start + '-' + rev]
            //     }).then(function (otherDoc) {
            //       // db.get(otherDoc[0].ok._id, rev).then(function (otherDoc) {
            //       if (otherDoc[0].missing || otherDoc[0].ok._deleted) {
            //         // if (otherDoc[0].ok && !otherDoc[0].ok._deleted) {
            //       }
            //       else {
            //       }
            //       infojs({ 'rev': otherDoc }, entries);
            //     }).catch(function (err) {
            //       infojs({rev_error: err}, entries);
            //     });
            //   });
            // }).catch(function (err) {
            //   infojs({get_error:err}, entries);
            // });
            resultIndex += 1;
          }
        });
        var limit = options.limit.length ? Number(options.limit) : undefined;
        var matchLimit = options.match_limit.length ? Number(options.match_limit) : undefined;
        var dec = !!options.descending;
        var opts = { include_docs: true, descending: dec, limit: limit };
        // startkey: "2015-02",
        // endkey: "2015-03",
        // var queryInfoElement = document.getElementById('query_search_info');
        var isSearch = (options.include.length || options.exclude.length);
        queryInfoElement.textContent = (isSearch ? 'search' : 'query') + ' in progress...';
        var includeRegExp = options.include.length ? new RegExp(options.include, options.include_case ? '' : 'i') : undefined;
        var excludeRegExp = options.exclude.length ? new RegExp(options.exclude, options.exclude_case ? '' : 'i') : undefined;
        var query;
        if (options.deleted_id.length) {
          queryInfoElement.scrollIntoView();
          resultIndex += 1;
          updateScrollLinks();
          return;
        }
        if (isSearch) {
          queryInfoElement.textContent += '\nSearch limited to ' + matchLimit + ' matches of "' + includeRegExp +
            '"' + (excludeRegExp ? ' (but not "' + excludeRegExp + '")' : '') +
            (limit ? ', limited to ' + limit + ' entries, found ' : ' found ');
          TIME && console.time('query allDocs');
          query = db.allDocs(opts);
          TIME && console.timeEnd('query allDocs');
        }
        else {
          queryInfoElement.textContent += '\nQuery limited to ' + limit + ' entries found ';
          opts.reduce = false;
          TIME && console.time('query by_start');
          query = db.query('foolin/by_start', opts);
          TIME && console.timeEnd('query by_start');
        }
        entries.appendChild(queryInfoElement);
        // window.requestAnimationFrame(function (timestamp) {
        query.then(function(doc) {
          TIME && console.time('query');
          var rowCount = doc.rows.length;
          if (isSearch && !matchLimit) {
            queryInfoElement.textContent += '\nno search limit, providing scroll links every 5 entries.';
            rowsPerLink = 5;
          }
          var matches = 0;
          // NOTE: Iteration statement is needed to use break statement.
          // doc.rows.forEach(function (row, index) {
          for (var index = 0; index < rowCount; index++) {
            var row = doc.rows[index];
            if ((includeRegExp && !includeRegExp.test(row.doc.activity)) ||
                excludeRegExp && excludeRegExp.test(row.doc.activity)) {
              // forEach function return becomes continue in for loop.
              continue;
            }

            var entry;
            if (!('activity' in row.doc)) {
              continue;
            }
            entry = utilsjs.addNewEntry(row.doc, entries);
            entry.dataset.result = resultIndex;
            if (isSearch) {
              if (matchLimit && (matches == matchLimit)) {
                break;
              }
              else {
                matches += 1;
              }
            }
          }
          if (isSearch) {
            queryInfoElement.textContent += matches;
          }
          else {
            queryInfoElement.textContent += rowCount;
          }
          TIME && console.timeEnd('query');
          queryInfoElement.scrollIntoView();
          resultIndex += 1;
          updateScrollLinks();
        }).catch(function(err) {
          alert(err);
        });
        // });
      }
    }).catch(function (err) {
      DEBUG && console.log(err);
    });
  };
  var updateScrollLinks = function() {
    TIME && console.time('updateScrollLinks');
    var scrollLinks = document.querySelectorAll('nav[data-type="scrollbar"]>ol>li>a');
    var rowsPerLink = (entries.childElementCount / (scrollLinks.length - 3));
    for (var linkIndex = 2; linkIndex < scrollLinks.length - 1; linkIndex++)  {
      scrollLinks[linkIndex].style.visibility = 'hidden';
    }
    Array.prototype.forEach.call(entries.querySelectorAll('.linked'), function(element) {
      element.classList.remove('.linked');
    });
    DEBUG && console.log("entries.childElementCount, rowsPerLink, scrollLinks.length");
    DEBUG && console.log(entries.childElementCount, rowsPerLink, scrollLinks.length);
    for (var scrollIndex = 0; scrollIndex < entries.childElementCount; scrollIndex++) {
      if (scrollLinks.length && (scrollIndex % rowsPerLink) < 1) {
        entries.childNodes[scrollIndex].classList.add('linked');
        // NOTE: this closure will provide the correct link to the asynchronous db.get callback.
        (function () {
          var link = scrollLinks[Math.floor(scrollIndex / rowsPerLink) + 2];
          var last = (link == scrollLinks[scrollLinks.length - 2]);
          var result = entries.childNodes[scrollIndex].dataset.result;
          if (entries.childNodes[scrollIndex].classList.contains('deleted')) {
            link.textContent = 'deleted' + ' R' + result;
            link.href = '#' + entries.childNodes[scrollIndex].id;
            link.style.visibility = 'visible';
          }
          else {
            db.get(entries.childNodes[scrollIndex].id).then(function(doc) {
              link.textContent = (new Date(doc.start || doc.clockin_ms)).toDateString() + ' R' + result;
              link.href = '#' + doc._id;
              link.style.visibility = 'visible';
              DEBUG && console.log({ last: last });
              if (last) {
                TIME && console.timeEnd('updateScrollLinks');
              }
            });
          }
        })();
      }
    }
  };
  runQuery();
  // function start() {
  //
  //   var message = document.getElementById('message');
  //
  //   // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
  //   // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
  //   message.textContent = translate('message');
  //
  // }

});

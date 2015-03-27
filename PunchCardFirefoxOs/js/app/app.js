'use strict';
define(/*['require', 'new', 'options'], */function(require/*, newjs, optionsjs*/) {
  // DOMContentLoaded is fired once the document has been loaded and parsed,
  // but without waiting for other external resources to load (css/images/etc)
  // That makes the app more responsive and perceived as faster.
  // https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
  // window.addEventListener('DOMContentLoaded', function(event) {
  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  var DEBUG = false;
  // var gep = require('/libs/getElementPath');
  // window.alert(gep.getElementPath(event.target));
  var pad = function (text, length, padding) {
    padding = padding ? padding : '0';
    text += '';
    while (text.length < length) {
      text = padding + text;
    }
    return text;
  };
  function reportDateTimeDiff(d1, d2) {
    var dt = d2.getTime() - d1.getTime();
    var milliSecondsPerDay = 24 * 3600000;
    var dtd = (dt / milliSecondsPerDay).toFixed();
    var dtDayFraction = dt % milliSecondsPerDay;
    var dth = (dtDayFraction / 3600000).toFixed();
    var dtHourFraction = dtDayFraction % 3600000;
    var dtm = (dtHourFraction / 60000).toFixed();
    var dtMinuteFraction = dtHourFraction % 60000;
    var dts = (dtMinuteFraction / 1000).toFixed();
    return (dt < 0 ? '' : '+') + dtd + 'd ' + pad(dth, 2) + 'h ' + pad(dtm, 2) + 'm ' + pad(dts, 2) + 's'
  }
  var startNow = function (event) {
    var id = event.target.parentElement.dataset.id;
    db.get(id).then(function(otherDoc) {
      otherDoc.start = (new Date).toJSON();
      return db.put(otherDoc).then(function(response) {
        document.location.reload('force');
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
    var id = event.target.parentElement.dataset.id;
    db.get(id).then(function(otherDoc) {
      otherDoc.end = (new Date).toJSON();
      return db.put(otherDoc).then(function(response) {
        document.location.reload('force');
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
    var newEntry = document.querySelector('#new_entry');
    var newjs = require('./new');
    if (newEntry && newjs) {
      // newEntry.style.display = 'none';
      if (newEntry.style.display == 'none') {
        newEntry.style.display = 'block';
        // TODO: Re-use of header icon for existing and new entries may be confusing.

        ediNewItem.style.opacity = '0.3';
        var id = event.target.parentElement.dataset.id;
        newjs.init(id);
        var a = document.createElement('a');
        // a.href = '/build/new.html#' + id;
        a.href = '#new_entry'/* + id*/;
        document.body.appendChild(a);
        a.click();
      }
    }
  };
  var copyActivityItem = document.querySelector('#copy_activity_menuitem');
  if (copyActivityItem) {
    copyActivityItem.addEventListener('click', copyActivity);
  }
  var copyActivity = function(event) {
    // event.preventDefault();
    // event.stopPropagation();
  };
  var pasteActivityItem = document.querySelector('#paste_activity_menuitem');
  if (pasteActivityItem) {
    pasteActivityItem.addEventListener('click', pasteActivity);
  }
  var editItem = document.querySelector('#edit');
  if (editItem) {
    editItem.addEventListener('click', edit);
  }
  var toggleEdit = function(event) {
    event.preventDefault();
    event.stopPropagation();
    var newjs = require('./new');
    if (newjs) {
      var newEntry = document.querySelector('#new_entry');
      if (newEntry) {
        if (newEntry.style.display == 'none') {
          newEntry.style.display = 'block';
          event.target.style.opacity = '0.3';
          var id = event.target.parentElement.dataset.id;
          var a = document.createElement('a');
          // a.href = '/build/new.html#' + id;
          a.href = '#new_entry'/* + id*/;
          document.body.appendChild(a);
          a.click();
          // Start editing a new entry, start and end times ticking.
          newjs.init(undefined);
        }
        else {
          var res = newjs.save();
          console.log(res);
          res.then(function (result) {
            if (result) {
              newEntry.style.display = 'none';
              event.target.style.opacity = '1.0';
              document.location.reload('force');
            }
          }).catch(function (err) {
            window.alert('saving entry failed, please review values of start, end, activity.');
          });
        }
      }
    }
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
    require(['app/about'], function (aboutjs) {
      if (aboutjs) {
        if (aboutElement) {
          if (aboutElement.style.display == 'none') {
            aboutElement.style.display = 'block';
            event.target.style.opacity = '0.3';
            // Let user change options...
          }
          else {
            // reload document location.
            aboutElement.style.display = 'none';
            event.target.style.opacity = '1.0';
            document.location.reload('force');
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
    var optionjs = require('app/options');
    if (optionjs) {
      if (optionsElement) {
        if (optionsElement.style.display == 'none') {
          optionsElement.style.display = 'block';
          event.target.style.opacity = '0.3';
          // Let user change options...
        }
        else {
          // reload document location.
          optionsElement.style.display = 'none';
          event.target.style.opacity = '1.0';
          document.location.reload('force');
        }
      }
    }
  };
  var editOptions = document.querySelector('a.settings');
  if (editOptions) {
    editOptions.addEventListener('click', toggleOptionDisplay);
  }


  var repeatNow = function (event) {
    var id = event.target.parentElement.dataset.id;
    db.get(id).then(function(otherDoc) {
      var entry = {
        // _id: db.post(),
        activity: otherDoc.activity,
        start: new Date,
        end: new Date
      };
      DEBUG && window.alert(JSON.stringify(entry, null, 2));
      db.post(entry).then(function(response) {
        document.location.reload('force');
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
    var id = event.target.parentElement.dataset.id;
    db.get(id).then(function(doc) {
      if (window.confirm('Delete entry? ' + doc.activity)) {
        if (true) {
          doc._deleted = true;
          return db.put(doc).then(function(response) {
            document.location.reload('force');
          });
        }
        else {
          return db.remove(doc).then(function(response) {
            document.location.reload('force');
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
  var translate = navigator.mozL10n.get;

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to let us know once it's ready.
  // navigator.mozL10n.once(start);
  // var db = new PouchDB('punchcard');
  // require is not available.
  // bower package does not seem usable via script tag.
  // using node_modules version.
  // the npm package plugs itself into the global PouchdB object.
  // PouchDB.plugin('mapreduce', NoEvalMapReduce);
  // PouchDB.plugin(require('pouchdb.mapreduce.noeval'));
  // var db = new PouchDB('apa-test-2');
  var db = new PouchDB('punchcard3');
  var entries = document.getElementById('entries');
  var scrollView = document.querySelector('section#view-punchcard-list.view.view-noscroll');
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
  var map = {
    map:
    function(doc) {
      if (doc.clockin_ms) {
        emit(doc.clockin_ms, 1);
      }
    }
  };
  // db.query(map, {reduce: false, /*startkey: "2010-06-24T15:44:08", endkey: "2010-06-25T15:44:08", */limit: 33, include_docs: true, descending: false}, function(err, doc) {
  // var obj = db.mapreduce(db);
  // db.query(map, {/*stale: 'ok', */reduce: false,
  var options = {};
  var optionsDB = new PouchDB('options');
  optionsDB.allDocs({
    include_docs: true/*, 
  attachments: true*/
  }).then(function (result) {
    // window.alert(JSON.stringify(result, null, 2));
    if ('rows' in result) {
      result.rows.forEach(function (option) {
        if ('value' in option.doc) {
          options[option.doc._id] = option.doc.value;
        }
      });
      var n = options.limit.length ? Number(options.limit) : undefined;
      // Only limit query if we will not match against includeRegExp or excludeRegExp.
      var limit = (options.include.length || options.exclude.length) ? undefined : n;
      var dec = !!options.descending;
      var opts = { reduce: false, include_docs: true, descending: dec, limit: limit };
      // startkey: "2015-02",
      // endkey: "2015-03",
      var queryInfoElement = document.getElementById('query_search_info');
      queryInfoElement.textContent = (limit ? 'query' : 'search') + ' in progress...';
      require(['app/info'], function (infojs) {
        // db.get('48E1CA33-EA50-935E-87BD-4E0A8E344FA2', {
        //   include_docs: true,
        //   revs: true,
        //   revs_info: true
        // }).then(function (otherDoc) {
        //   infojs(otherDoc, entries);
        //   otherDoc._deleted = false;
        //   db.put(otherDoc).then(function (otherDoc) {
        //     infojs(otherDoc, entries);
        //   }).catch(function (err) {
        //     infojs(err, entries);
        //   });
        // }).catch(function (err) {
        //   infojs(err, entries);
        // });
        // db.allDocs({
        //   include_docs: true,
        //   key: '48E1CA33-EA50-935E-87BD-4E0A8E344FA2',
        //   revs: true,
        //   revs_info: true
        // }).then(function (otherDoc) {
        //   infojs(otherDoc, entries);
        // }).catch(function (err) {
        //   infojs(err, entries);
        // });
        // db.get('48E1CA33-EA50-935E-87BD-4E0A8E344FA2', {
        //   // include_docs: true,
        //   revs: true,
        //   revs_info: true
        // }).then(function (otherDoc) {
        //   infojs(otherDoc, entries);
        //   otherDoc._revs_info.forEach(function (rev) {
        //     db.get(otherDoc._id, rev).then(function (otherDoc) {
        //       infojs(otherDoc, entries);
        //     }).catch(function (err) {
        //       infojs(err, entries);
        //     });
        //   })
        // }).catch(function (err) {
        //   infojs(err, entries);
        // });
        if (false) {
          db.changes({ include_docs: true, /*style: 'all_docs', */since: 0 })./*on('change', function(info) {
          infojs(info, entries);
          db.get(info.doc._id, {
            rev: info.doc._rev,
            revs: true
          }).then(function (otherDoc) {
            infojs({get:otherDoc}, entries);
            otherDoc[0].ok._revisions.ids.forEach(function (rev) {
              infojs({ _revisions: [ info.doc._rev, otherDoc[0].ok._revisions.start + '-' + rev ]}, entries);
              db.get(otherDoc._id, {
                rev: otherDoc._revisions.start + '-' + rev,
                revs: true,
                open_revs: "all",
                include_docs: true
              }).then(function (otherDoc) {
                infojs({ 'rev': otherDoc }, entries);
              }).catch(function (err) {
                infojs({rev_error: err}, entries);
              });
           });
          // changes() was canceled
        }).catch(function (err) {
            infojs({get_error:err}, entries);
          });
        }).*/on('delete', function(info) {
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
            // infojs({get:otherDoc}, entries);
            otherDoc[0].ok._revisions.ids.forEach(function (rev) {
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
            console.log(err);
            infojs({delete_error: err}, entries);
          });

        }
        db.get(options.deleted_id, {
          // rev: info.doc._rev,
          revs: true,
          open_revs: "all"
        }).then(function (otherDoc) {
          infojs({get:otherDoc}, entries);
          otherDoc[0].ok._revisions.ids.forEach(function (rev) {
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
      });
      db.query('foolin/by_start', opts, function(err, doc) {
        if (err) {
          alert(err);
        } else {
          var rowCount = doc.rows.length;
          var scrollLinks = document.querySelectorAll('nav[data-type="scrollbar"]>ol>li>a');
          var rowsPerLink = limit ? (rowCount / (scrollLinks.length - 3)) : (n / (scrollLinks.length - 3));
          DEBUG && console.log("rowCount, rowsPerLink, scrollLinks.length");
          DEBUG && console.log(rowCount, rowsPerLink, scrollLinks.length);
          var includeRegExp = options.include.length ? new RegExp(options.include, options.include_case ? '' : 'i') : undefined;
          var excludeRegExp = options.exclude.length ? new RegExp(options.exclude, options.exclude_case ? '' : 'i') : undefined;
          var matches = 0;
          // NOTE: Iteration statement is needed to use break statement.
          // doc.rows.forEach(function (row, index) {
          for (var index = 0; index < rowCount; index++) {
            var row = doc.rows[index];
            if ((includeRegExp && !includeRegExp.test(row.doc.activity)) ||
                excludeRegExp && excludeRegExp.test(row.doc.activity)) {
              // forEach return becomes continue in for loop.
              continue;
            }
            var entry = document.createElement('div');
            // var span = document.createElement('span');
            entry.id = row.doc._id;
            entry.className = 'entry';
            var start = document.createElement('pre');
            var end = document.createElement('pre');
            var delta = document.createElement('pre');
            var activity = document.createElement('pre');
            start.contentEditable = true;
            end.contentEditable = true;
            activity.contentEditable = true;
            // start.setAttribute('readonly', true);
            // end.setAttribute('readonly', true);
            // activity.setAttribute('readonly', true);
            start.classList.add('start');
            end.classList.add('end');
            activity.classList.add('activity');
            var startDate = new Date(row.doc.start || row.doc.clockin_ms);
            var endDate = new Date(row.doc.end || row.doc.clockout_ms);
            start.textContent = startDate.toString().substring(0, 24);
            end.textContent = endDate.toString().substring(4, 24);
            delta.textContent = reportDateTimeDiff(startDate, endDate);
            activity.textContent = row.doc.activity;
            start.setAttribute('contextmenu', 'start_menu');
            start.addEventListener('contextmenu', function (event) {
              this.contextMenu.dataset.id = event.target.parentElement.id;
            });
            end.setAttribute('contextmenu', 'end_menu');
            end.addEventListener('contextmenu', function (event) {
              this.contextMenu.dataset.id = event.target.parentElement.id;
            });
            activity.setAttribute('contextmenu', 'activity_menu');
            activity.addEventListener('contextmenu', function (event) {
              this.contextMenu.dataset.id = event.target.parentElement.id;
            });
            //         activity.addEventListener('focus', function (event) {
            //           event.target.removeAttribute('rows');
            //         });
            //         activity.addEventListener('blur', function (event) {
            //           event.target.setAttribute('rows', 1);
            //         });
            // entry.appendChild(start);
            // entry.appendChild(end);
            entry.appendChild(start);
            entry.appendChild(end);
            // entry.appendChild(span);
            entry.appendChild(delta);
            entry.appendChild(activity);
            var scrollIndex = limit ? index : matches;
            if (scrollLinks.length && (scrollIndex % rowsPerLink) < 1) {
              entry.classList.add('linked');
              var link = scrollLinks[Math.floor(scrollIndex / rowsPerLink) + 2];
              link.textContent = (new Date(row.doc.start || row.doc.clockin_ms)).toDateString();
              link.href = '#' + row.doc._id;
              DEBUG && console.log("scrollIndex, rowsPerLink, (index % rowsPerLink)");
              DEBUG && console.log(scrollIndex, rowsPerLink, (index % rowsPerLink));
            }
            entries.appendChild(entry);
            matches += 1;
            if (n && (matches == n)) {
              break;
            }
          }
          if (limit) {
            queryInfoElement.textContent = 'Query limited to ' + limit + ' entries found ' + rowCount;
          } 
          else {
            queryInfoElement.textContent = 'Search limited to ' + n + ' matches of "' + includeRegExp +
              '"' + (excludeRegExp ? ' (but not "' + excludeRegExp + '")' : '') + ' found ' + matches;
          }
          false && entries.addEventListener('click', function (event) {
            // window.alert(getElementPath(event.target));
            // window.alert(event.target.textContent);
            event.preventDefault();
            event.stopPropagation();
            var select = document.querySelector('menu#' + event.target.className);
            if (select) {
              if (select.style.display == 'none') {
                select.style.display = 'block';
                select.style.left = event.layerX + 'px';
                select.style.top = event.layerY + 'px';
                select.style.backgroundColor = document.body.style.backgroundColor;
              }
              else {
                select.style.display = 'none';
              }
            }
            // switch (event.target.className) {
            //   case 'start':
            //     break;
            //   case 'end':
            //     break;
            //   case 'activity':
            //     break;
            //   default:
            //     window.alert('unhandled case ' + event.target.className);
            // }
          });
          //                                         if (scrollLinks.length) {
          //                                           scrollLinks.parentElement.parentElement.parentElement.style.top = "3rem;";
          //                                         }
          //     var pre = document.createElement('pre');
          //     pre.textContent = JSON.stringify(doc.rows, null, 2);
          //     document.body.appendChild(pre);
        }
      });
    }
  }).catch(function (err) {
    console.log(err);
  });
  //   var optionsDB = new PouchDB('options');
  //   var options = [
  //     'protocol',
  //     'user',
  //     'pass',
  //     'hostportpath'
  //   ];
  //   var values = {};
  //   options.forEach(function (option) {
  //     optionsDB.get(option, function (err, doc) {
  //       if (err) {
  //         // window.alert(JSON.stringify(err, null, 2));
  //       }
  //       if (doc.value) {
  //         values[doc._id] = doc.value;
  //         // window.alert(JSON.stringify(values, null, 2));
  //       }
  //     });
  //   });
  //   false && remote.addEventListener('click', function (event) {
  //     // window.alert(JSON.stringify(values, null, 2));
  //     var destination = values['protocol'] +
  //         values['hostportpath'] + db._db_name;
  //     var opts = {
  //       auth:
  //       {'username': values['user'],
  //        'password': values['pass']
  //       },
  //       // timeout: 20000,
  //       headers: {
  //         // 'Origin': window.location.origin
  //         // 'Accept': '*/*',
  //         // 'Content-Type': '*/*'
  //         // 'Accept': 'application/json'
  //         // 'Content-Type': 'text/chunked'
  //         // 'Accept': 'text/plain',
  //         // 'Content-Type': 'text/plain'
  //         //           // 'Cookie': 'JSESSIONID=1wtfchn9kjjn7xywspx4jz2z1',
  //         //           // 'Access-Control-Request-Method': 'POST',
  //         //           'Authorization': 'Basic ' +
  //         //           window.btoa(document.getElementById('user').value + ':' +
  //         //                       document.getElementById('pass').value)
  //       }
  // //     }
  //     };
  //     var remoteDB = new PouchDB(destination, opts, function (err, info) {
  //       if (err) {
  //         alert(JSON.stringify(err, null, 2));
  //       } else {
  //         // TypeError: cyclic object value
  //         // alert(JSON.stringify(info, null, 2));
  //         DEBUG && console.log(info);
  //       }
  //     });
  //     remoteDB.info().then(function (info) {
  //       DEBUG && console.log(info);
  //     });
  //     remoteDB.allDocs({include_docs: true, descending: false}, function(err, doc) {
  //       if (err) {
  //         alert(JSON.stringify(err, null, 2));
  //       } else {
  //         doc.rows.forEach(function (row) {
  //           var entry = document.createElement('div');
  //           entry.id = 'entry';
  //           var start = document.createElement('div');
  //           var end = document.createElement('div');
  //           var activity = document.createElement('pre');
  //           activity.contentEditable = true;
  //           // activity.contentEditable = true;
  //           // activity.addEventListener('input', null);
  //           // activity.readOnly = true;
  //           start.textContent = (new Date(row.doc.start)).toLocaleString();
  //           end.textContent = (new Date(row.doc.end)).toLocaleString();
  //           activity.textContent = row.doc.activity;
  //           //         activity.addEventListener('focus', function (event) {
  //           //           event.target.removeAttribute('rows');
  //           //         });
  //           //         activity.addEventListener('blur', function (event) {
  //           //           event.target.setAttribute('rows', 1);
  //           //         });
  //           entry.appendChild(start);
  //           entry.appendChild(end);
  //           entry.appendChild(activity);
  //           document.body.appendChild(entry);
  //         });
  //       }
  //     });
  //  });
  // ---

  function start() {

    var message = document.getElementById('message');

    // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
    // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
    message.textContent = translate('message');

  }

});

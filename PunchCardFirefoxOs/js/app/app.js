'use strict';

import * as infojs from './info.js';
import './about.js';
import * as utilsjs from './utils.js';
import { NewEntryUI }  from './new-entry.js';
import * as optionsjs from './options.js';

// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
// window.addEventListener('DOMContentLoaded', function(event) {
// We'll ask the browser to use strict code to help us catch errors earlier.
// https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
infojs.time('appjs to readyState complete');
document.addEventListener('readystatechange', (event) => {
  if (event.target.readyState !== 'complete') {
    return;
  }
  infojs.timeEnd('appjs to readyState complete');
  let ORIENTATION = false;
  let SCROLL = false;
  try {
    window.addEventListener('offline', (e) => {
      infojs.info(`Browser is now ${e.type}`);
    });
    window.addEventListener('online', (e) => {
      infojs.info(`Browser is now ${e.type}`);
    });
    let resultIndex = 1;
    let optionsDB = new PouchDB('options');
    let db = new PouchDB('punchcard');
    const scrollView = document.querySelector('section#view-punchcard-list.view.view-noscroll');
    let startMenu = document.getElementById('start_menu');
    let endMenu = document.getElementById('end_menu');
    let revisionsMenu = document.getElementById('revisions_menu');
    let activityMenu = document.getElementById('activity_menu');
    // let request = navigator.mozApps.getSelf();
    let stringToRegexp = function(str) {
      let captureGroups = str.match(/^\/?(.+?)(?:\/([gims]*))?$/);
      // Default to ignore case.
      // Regexp syntax requires at least a slash at end, possibly followed by flags.
      return captureGroups &&
        new RegExp(captureGroups[1],
                   typeof captureGroups[2] == 'undefined' ? "is" : captureGroups[2]);
    };

    let info_categories = document.querySelector('#info_categories');
    Array.prototype.forEach.call(info_categories.querySelectorAll('input'), (value) => {
      if (localStorage.getItem(value.id)) {
        value.setAttribute('checked', true);
        value.checked = true;
      }
      else {
        value.removeAttribute('checked');
        value.checked = false;
      }
    });
    info_categories.addEventListener('click', (event) => {
      if (event.target.checked) {
        event.target.setAttribute('checked', true);
        event.target.checked = true;
        localStorage.setItem(event.target.id, event.target.id);
      }
      else {
        event.target.removeAttribute('checked');
        event.target.checked = false;
        localStorage.removeItem(event.target.id);
      }
    });
    info_categories.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      Array.prototype.forEach.call(info_categories.querySelectorAll('input'), (value) => {
        value.checked = !value.checked;
        if (value.checked) {
          value.setAttribute('checked', true);
          localStorage.setItem(value.id, value.id);
        }
        else {
          value.removeAttribute('checked');
          localStorage.removeItem(value.id);
        }
      });
    });
    window.addEventListener('storage', (event) => {
      infojs.info(event);
    });

    let filter = document.querySelector('#filter input-ui');
    // let erase = document.querySelector('span.erase');
    // erase.addEventListener('click', event => {
    //   event.preventDefault();
    //   event.stopPropagation();
    //   if (filter && filter.value) {
    //     filter.classList.add('empty');
    //     filter.value = '';
    //     // let changeEvent = new Event("change", {"bubbles":true, "cancelable":false});
    //     // filter.dispatchEvent(changeEvent);
    //   }
    //   filter.focus();
    // });
    // let filter = document.querySelector('gaia-text-input#filter');
    // let filter = document.querySelector('input#filter');
    filter.minLength = 4;

    let setBackgroundColor = color => {
      window.requestAnimationFrame(function (timestamp) {
        document.body.style.backgroundColor = color;
      });
    };

    let updateFilter = function(event) {
      // let originalColor = window.getComputedStyle(document.body, null)['background-color'];
      // window.requestAnimationFrame(function (timestamp) {
      // document.body.style['background-color'] = 'blue';
      // setBackgroundColor('blue');
      // });
      event.target.classList.add('updating');
      infojs.time('updating');
      // filter.style['display'] = 'none';
      let entryNodes = scrollView.querySelectorAll('.entry');
      let regexp = stringToRegexp(event.target.value.trim());
      if (regexp) {
        Array.prototype.forEach.call(entryNodes, function(node, index) {
          let activity = node.querySelector('.activity');
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
      // filter.blur();
      // querySelector returns only the first matching node, which is what we want.
      // scrollView.querySelector('.entry:not(.filtered)').scrollIntoView({block: "center", inline: "center"});
      toggleFilter();
      updateScrollLinks();
      window.requestAnimationFrame(function (timestamp) {
        document.querySelector('.entry:not(.filtered)').scrollIntoView({block: "center", inline: "center"});
      });
      // scrollView.querySelector('.entry:not(.filtered)').scrollIntoView();
      // window.requestAnimationFrame(function (timestamp) {
      // document.body.style['background-color'] = originalColor;
      // document.body.style.backgroundColor = originalColor;
      // setBackgroundColor(originalColor);
      event.target.classList.remove('updating');
      infojs.timeEnd('updating');
      // });
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
      // timeoutId && clearTimeout(timeoutId);
      // timeoutId = setTimeout(function () {
      if (event.key == 'Enter') {
        updateFilter(event);
      }
      // }, 1000);
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
            activityMenu
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
      var positionMenu = function(menu) {
        var xProp = 'left', yProp = 'top', xOffset = event.clientX, yOffset = event.clientY;
        if (event.clientX > window.innerWidth * 0.8) {
          xProp = 'right';
          xOffset = window.innerWidth - xOffset;
        }
        if (event.clientY > window.innerHeight * 0.8) {
          yProp = 'bottom';
          yOffset = window.innerHeight - yOffset;
        }
        menu.style = 'display: block; ' + xProp + ': ' + xOffset + 'px; ' + yProp + ': ' + yOffset + 'px';
      }
      if (event.target.classList.contains("start")) {
        if (startMenu.style.display == 'none') {
          positionMenu(startMenu);
          startMenu.dataset.id = event.target.parentElement.id;
        }
        else {
          startMenu.style = 'display: none;';
          delete startMenu.dataset.id;
        }
      }
      if (event.target.classList.contains("end")) {
        if (endMenu.style.display == 'none') {
          positionMenu(endMenu);
          endMenu.dataset.id = event.target.parentElement.id;
          if (event.target.parentElement.querySelector('pre.end').textContent == ' ') {
            document.getElementById('end_undefined').setAttribute('disabled', true);
          }
          else {
            document.getElementById('end_undefined').removeAttribute('disabled');
          }
        }
        else {
          endMenu.style = 'display: none;';
          delete endMenu.dataset.id;
        }
      }
      if (event.target.classList.contains("revisions")) {
        if (revisionsMenu.style.display == 'none') {
          positionMenu(revisionsMenu);
          revisionsMenu.dataset.id = event.target.parentElement.id;
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
          revisionsMenu.style = 'display: none;';
          delete revisionsMenu.dataset.id;
        }
      }
      if (event.target.classList.contains("activity")) {
        if (activityMenu.style.display == 'none') {
          positionMenu(activityMenu);
          activityMenu.dataset.id = event.target.parentElement.id;
        }
        else {
          activityMenu.style = 'display: none;';
          delete activityMenu.dataset.id;
        }
      }
    });
    let scrollBar = document.querySelector('nav#punchcard_scrollbar');
    // let links = document.querySelectorAll('nav#punchcard_scrollbar a');
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
    let toggleNarrow = function(event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.classList.contains('narrow')) {
        this.classList.remove('narrow');
      }
      else {
        this.classList.add('narrow');
      }
      recenterCenterElement();
    };
    scrollBar.addEventListener('contextmenu', toggleNarrow);
    // scrollBar.addEventListener('touchstart', log, !'capture');
    // scrollBar.addEventListener('touchmove', log, !'capture');
    // scrollBar.addEventListener('touchend', click, !'capture');
    // scrollBar.addEventListener('touchcancel', log, !'capture');
    // Array.prototype.forEach.call(links, (link) => {
    //   link.addEventListener('touchend', click, !'capture');
    // });
    // // scrollBar.addEventListener('scroll', log, !'capture');
    // scrollBar.addEventListener('mousedown', log, !'capture');
    // scrollBar.addEventListener('mouseup', click, !'capture');
    // scrollBar.addEventListener('pointerdown', log, !'capture');
    // scrollBar.addEventListener('pointermove', log, !'capture');
    // scrollBar.addEventListener('pointerup', log, !'capture');
    // scrollBar.addEventListener('dragstart', ignore, !'capture');
    // scrollBar.addEventListener('drag', ignore, !'capture');
    
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
      document.querySelector('#filter').insertAdjacentElement('afterend', neu);
    };

    var startNow = function (event) {
      event.preventDefault();
      var id = getDataSetIdHideMenu(event);
      db.get(id).then(function(otherDoc) {
        var startDate = new Date;
        var startText = startDate.toJSON();
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
            newEntry.querySelector('pre.activity').classList.add('changed');
            newEntry.querySelector('pre.start').classList.add('changed');
            newEntry.querySelector('pre.end').classList.add('changed');
            newEntry.querySelector('pre.revisions').classList.add('changed');
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
        let startText = otherDoc._id.substring(0,24);
        otherDoc.end = now.toJSON();
        return db.put(otherDoc).then(function(response) {
          utilsjs.updateEntriesElement(id, 'pre.end', utilsjs.formatEndDate(now));
          setAvailableRevisionCount(document.getElementById(id));
          utilsjs.updateEntriesElement(id, 'pre.duration', utilsjs.reportDateTimeDiff(new Date(startText), now));
          // saveLink.click();
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
    var endUndefined = function (event) {
      event.preventDefault();
      var id = getDataSetIdHideMenu(event);
      db.get(id).then(function(otherDoc) {
        delete otherDoc.end;
        return db.put(otherDoc).then(function(response) {
          utilsjs.updateEntriesElement(id, 'pre.end', ' ');
          setAvailableRevisionCount(document.getElementById(id));
          utilsjs.updateEntriesElement(id, 'pre.duration', ' ');
          // saveLink.click();
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
    var setAvailableRevisionCount = function(entry) {
      // Possibly do estimate shortcut when accurate
      // revision reporting is disabled for performance reasons.
      // It takes a while when displaying 1000 entries.
      var revisions = entry.querySelector('pre.revisions');
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
          infojs.error(err, document.getElementById(id).parentElement);
        });
      }
      // getIt.then(function (result) {
      //   return result;
      // }).catch(function (err) {
      //   return err;
      // });
    }
    var showRevisions = function (event) {
      event.preventDefault();
      // Keep this _ separator in sync with function addNewEntry in utils.js
      let elementId = getDataSetIdHideMenu(event);
      var parts = elementId.split(/_/);
      var id = parts[0];
      var rev = parts[1];
      if (!document.getElementById(elementId).classList.contains('available')) {
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
              var entry = {
                _rev: availableDoc._rev,
                _id: availableDoc._id,
                activity: availableDoc.activity,
                start: availableDoc.start,
                end: availableDoc.end
              };
              var beforeThisElement = document.getElementById(elementId);
              var newEntry = utilsjs.addNewEntry(entry, beforeThisElement.parentElement, 
                                                 beforeThisElement, 'addRevisionToElementId');
              newEntry.querySelector('pre.revisions').textContent = (index + 1) + ' of ' + obj.length + ' revs';
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
          infojs.error(err, document.getElementById(id).parentElement);
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
      // event.preventDefault();
      // event.stopPropagation();
      let id = getDataSetIdHideMenu(event);
      addNewEdit(id);
    };
    var editItem = document.querySelector('#edit');
    if (editItem) {
      editItem.addEventListener('click', edit);
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
    var toggleFilter = function(event) {
      // event.preventDefault();
      if (filter.style['display'] == 'none') {
        filter.style['display'] = 'inline';
        filter.focus();
        // filter.scrollIntoView({block: "center", inline: "center"});
      }
      else {
        filter.style['display'] = 'none';
      }
    };
    var titleItem = document.querySelector('span.app_title');
    if (titleItem) {
      titleItem.addEventListener('click', toggleFilter);
    }
    var toggleScrollbar = function(event) {
      event.preventDefault();
      event.stopPropagation();
      if (scrollBar.style['display'] == 'none') {
        scrollBar.style['display'] = 'block';
      }
      else {
        scrollBar.style['display'] = 'none';
      }
      recenterCenterElement();
    };
    var scrollbaritem = document.querySelector('span.scrollbar');
    if (scrollbaritem) {
      scrollbaritem.addEventListener('click', toggleScrollbar);
    }

    var editNewItem = document.querySelector('span.edit');
    if (editNewItem) {
      editNewItem.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        addNewEdit(undefined);
      });
    }

    var toggleAbout = function(event) {
      event.preventDefault();
      event.stopPropagation();
      var aboutElement = document.querySelector('#about');
      // aboutElement.style.display = 'none';
      if (aboutElement) {
        if (aboutElement.style.display == 'none') {
          // otherView.style.display = 'block';
          aboutElement.style.display = 'block';
          event.target.style.opacity = '0.3';
          // Let user peruse about information...
          aboutElement.scrollIntoView({block: "center", inline: "center"});
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
    };

    let aboutItem = document.querySelector('span.about');
    if (aboutItem) {
      aboutItem.addEventListener('click', toggleAbout, 'capture');
    }

    var searchFilter = function(event) {
      event.preventDefault();
      event.stopPropagation();
      infojs.time('searching');
      let entryNodes = scrollView.querySelectorAll('.entry');
      let regexp = stringToRegexp(filter.value.trim());
      if (regexp) {
        let firstEntry = Array.prototype.find.call(entryNodes, function(node, index) {
          var activity = node.querySelector('.activity');
          if (regexp.test(activity.textContent)) {
            return node;
          }
        });
        firstEntry && firstEntry.scrollIntoView({block: "center", inline: "center"});
        infojs.timeEnd('searching');
      }
    }

    let searchItem = document.querySelector('span.search');
    if (searchItem) {
      searchItem.addEventListener('click', searchFilter, 'capture');
    }

    var reloadApp = function(event) {
      event.preventDefault();
      // in linux nightly firefox there is no way to get at app after reloadApp
      // when local python webserver is stopped or hosted app cannot be reached
      // because network is turned off.
      // nightly firefox for android just displays a footer overlay stating
      // "showing offline version" and works fine after reloadApp!
      // if ('serviceWorker' in navigator) {
      //   navigator.serviceWorker.getRegistration().then(function(registration) {
      //     registration.unregister();
      //   });
      // }
      // document.location.reload('force');
      // See https://developer.mozilla.org/en-US/docs/Web/API/Location/reload#location.reload_has_no_parameter
      document.location.reload();
    };

    var roloadItem = document.querySelector('span.reload');
    if (roloadItem) {
      roloadItem.addEventListener('click', reloadApp, 'capture');
    }

    var toggleOptionDisplay = function(event) {
      infojs.time('toggleOptionDisplay');
      event.preventDefault();
      event.stopPropagation();
      var optionsElement = document.querySelector('#options');
      // optionsElement.style.display = 'none';
      if (optionsElement) {
        if (optionsElement.style.display == 'none') {
          // otherView.style.display = 'block';
          optionsElement.style.display = 'block';
          event.target.style.opacity = '0.3';
          // Let user change options...
          optionsElement.scrollIntoView({block: "center", inline: "center"});
        }
        else {
          // reload document location.
          // otherView.style.display = 'none';
          optionsElement.style.display = 'none';
          event.target.style.opacity = '1.0';
          // document.location.reload('force');
          // document.location.reload();
          runQuery();
        }
      }
      infojs.timeEnd('toggleOptionDisplay');
    };
    var optionsItem = document.querySelector('span.settings');
    if (optionsItem) {
      optionsItem.addEventListener('click', toggleOptionDisplay, 'capture');
      // NOTE: Let's bring up a menu on click, if necessary, as is already done for #start_menu, etc.
      // optionsItem.addEventListener('contextmenu', function (event) {
      //   window.alert('This could be useful to pick from saved queries, e.g.\nAround now\n100 newest\n100 oldest\netc.');
      // });
    }

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
          newEntry.querySelector('pre.activity').classList.add('changed');
          newEntry.querySelector('pre.start').classList.add('changed');
          newEntry.querySelector('pre.end').classList.add('changed');
          newEntry.querySelector('pre.revisions').classList.add('changed');
          // document.location.reload('force');
          // saveLink.click();
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
    var deleteEntry = function (event) {
      event.preventDefault();
      var id = getDataSetIdHideMenu(event);
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
      let times = [];
      infojs.time('runQuery');
      var options = {};

      document.querySelectorAll('.persistent').forEach((item) => {
        if (item.type == 'checkbox') {
          options[item.id] = item.checked;
        }
        else {
          options[item.id] = item.value;
        }
      });

      var limit = options.limit.length ? Number(options.limit) : 100;
      var matchLimit = options.match_limit.length ? Number(options.match_limit) : 50;
      var dec = !!options.descending;
      // Limit query to a maximum of 1000 rows, not to use too much
      // memory in mobile browsers on smartphones
      var opts = { include_docs: true, descending: dec, limit: Math.min(limit, 1000) };
      var content = document.getElementById('entries_template').content;
      var entries = document.importNode(content, "deep").firstElementChild;
      var previousEntries = scrollView.querySelector('div.entries');
      entries.classList.add('updating');
      var cache_versions = document.querySelector('#cache_versions');
      if (previousEntries) {
        scrollView.insertBefore(entries, previousEntries);
      }
      else {
        scrollView.insertBefore(entries, cache_versions);
      }
      entries.id = 'R' + resultIndex;
      var queryInfoElement = entries.querySelector('span.info');
      queryInfoElement.scrollIntoView({block: "center", inline: "center"});
      var update = entries.querySelector('a.update');
      var close = entries.querySelector('a.close');
      update.addEventListener('click', function(event) {
        event.preventDefault();
        alert('rerun query is not implemented yet. \u221E');
      });
      close.addEventListener('click', function(event) {
        event.preventDefault();
        scrollView.removeChild(entries);
        updateScrollLinks();
      });
      var regexp = stringToRegexp(options.deleted_id.trim());
      if (options.deleted_id.length && regexp) {
        queryInfoElement.textContent = `Search for deleted activity matching "${regexp.toString()}"`;
        var changesSinceSequence = options.changes_since_sequence.length ? Number(options.changes_since_sequence) : 'now';
        let matchingDeletes = 0;
        db.changes({
          descending: dec,
          include_docs: true,
          limit: limit,
          /*style: 'all_docs', */
          since: changesSinceSequence,
        }).on('change', function(info) {
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
          resultIndex += 1;
          updateScrollLinks();
          queryInfoElement.textContent += ` found ${entries.querySelectorAll('div.deleted').length}`;
          entries.classList.remove('updating');
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
        var start = document.querySelector('#query_start');
        var end = document.querySelector('#query_end');
        // if (start && end) {
        var startDate = start.valueAsDate;
        var endDate = end.valueAsDate;
        if (startDate && endDate && startDate > endDate) {
          [ startDate, endDate ] = [ endDate, startDate ];
        }
        // start.value = startDate.toString();
        // end.value = endDate.toString();
        if (startDate) {
          if (dec) {
            opts.endkey = startDate;
          }
          else {
            opts.startkey = startDate;
          }
        }
        if (endDate) {
          if (dec) {
            opts.startkey = endDate;
          }
          else {
            opts.endkey = endDate;
          }
        }
        // }
        var isSearch = (options.include.length || options.exclude.length);
        // queryInfoElement.textContent += (isSearch ? 'search' : 'query') + ' in progress...';
        var includeRegExp = options.include.length ? stringToRegexp(options.include.trim()) : undefined;
        var excludeRegExp = options.exclude.length ? stringToRegexp(options.exclude.trim()) : undefined;
        if (isSearch) {
          queryInfoElement.textContent = `Search limited to ${matchLimit} matches of "${includeRegExp}" ${ excludeRegExp ? ` (but not "${excludeRegExp}")` : ''} ${ limit ? `, limited to ${limit} entries, ` : ''}`;
          infojs.time('query allDocs');
        }
        else {
          queryInfoElement.textContent = `Query limited to ${limit} entries`;
          opts.reduce = false;
          infojs.time('query by_start');
        }
        let rowCount = 0,  matches = 0, loops = 1;
        // for (; rowCount < limit; loops++) {

        let updateQueryResults = (result) => {
          // loops end
          if (result[0]) {
            queryInfoElement.textContent += ` found ${result[2]}`;
          }
          else {
            queryInfoElement.textContent += ` found ${result[3]}`;
          }
          infojs.timeEnd('query result processing');
          resultIndex += 1;
          updateScrollLinks();
          Array.prototype.forEach.call(document.querySelectorAll('div.entry'), entry => setAvailableRevisionCount(entry));
          entries.classList.remove('updating');
          infojs.timeEnd('runQuery');
        };
        let recursiveQuery = (opts, matches, rowCount) => {
          return new Promise((resolve, reject) => {
            var query;
            // if (options.deleted_id.length) {
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
                infojs.timeEnd('query allDocs');
              }
              else {
                infojs.timeEnd('query by_start');
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
                  if (rowCount + index +1 == limit) {
                    return resolve([isSearch, opts, matches, rowCount + index + 1]);
                  }
                  else {
                    continue;
                  }
                }
                var entry;
                if (!('activity' in row.doc)) {
                  if (rowCount + index +1 == limit) {
                    return resolve([isSearch, opts, matches, rowCount + index + 1]);
                  }
                  else {
                    continue;
                  }
                }
                entry = utilsjs.addNewEntry(row.doc, entries, undefined, 0);
                if (isSearch) {
                  matches += 1;
                  if (matchLimit && (matches == matchLimit)) {
                    return resolve([isSearch, opts, matches, rowCount + index + 1]);
                  }
                }
                if (rowCount + index + 1 == limit) {
                  return resolve([ isSearch, opts, matches, rowCount + index + 1]);
                }
              }
              if (doc.rows.length == 0) {
                return resolve([ isSearch, opts, matches, rowCount]);
              }
              rowCount += doc.rows.length;
              // Must not drop random part of ID to distinguish
              // between multiple entries with same start time!
              let newStart = doc.rows[doc.rows.length - 1].doc._id;
              // startkey would not change, no use to carry on.
              if (newStart == opts.startkey) {
                return resolve([ isSearch, opts, matches, rowCount + doc.rows.length]);
              }
              opts.startkey = newStart;
              // Just recurse, we already checked for limit and matchLimit above
              return resolve(recursiveQuery(opts, matches, rowCount));
            }).catch(function(err) {
              infojs.error(err, document.getElementById(id).parentElement);
            });
          });
        };
        recursiveQuery(opts, matches, rowCount).then(updateQueryResults);
      }
    };

    var updateScrollLinks = function() {
      infojs.time('updateScrollLinks');
      var entryNodes = scrollView.querySelectorAll('.entry:not(.filtered)');
      // query result container
      var entriesNodes = scrollView.querySelectorAll('.entries');
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
  }
  catch(err) {
    infojs.error(err);
  }
});

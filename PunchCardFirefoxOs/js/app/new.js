'use strict';
try {
  define(['app/utils'], function(utilsjs) {
    // DOMContentLoaded is fired once the document has been loaded and parsed,
    // but without waiting for other external resources to load (css/images/etc)
    // That makes the app more responsive and perceived as faster.
    // https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
    //  window.addEventListener('DOMContentLoaded', function() {

    // We'll ask the browser to use strict code to help us catch errors earlier.
    // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
    var DEBUG = false, LOG = true;
    var saved = false;
    var db = new PouchDB('punchcard3');
    var id = document.location.hash.substring(1);
    var startDateTime = new Date;
    var endDateTime = new Date;
    // NOTE: does don't prompt user when called from beforeunload event listener.
    window.addEventListener("beforeunload", function (event) {
      // event.preventDefault();
      // maybeSave();
      // if (id) {
      //   db.get(id).then(function(otherDoc) {
      //     otherDoc.activity = activity.textContent;
      //     otherDoc.start = startDateTime;
      //     otherDoc.end = endDateTime;
      //     return db.put(otherDoc).then(function(response) {
      //       // saveLink.click();
      //       event.returnValue = 'saved';
      //     }).catch(function(err) {
      //       //errors
      //       window.alert(err);
      //     });
      //   }).catch(function(err) {
      //     //errors
      //     window.alert(err);
      //   });
      // }
      // else {
      //   var entry = {
      //     // _id: db.post(),
      //     activity: activity.textContent,
      //     start: startDateTime,
      //     end: endDateTime
      //   };
      //   DEBUG && window.alert(JSON.stringify(entry, null, 2));
      //   db.post(entry).then(function(response) {
      //     // saveLink.click();
      //     event.returnValue = 'saved';
      //   }).catch(function(err) {
      //     //errors
      //     window.alert(err);
      //   });
      // }
      // var confirmationMessage = "too bad! \o/";
      // (event || window.event).returnValue = confirmationMessage;     //Gecko + IE
      // return confirmationMessage;                                //Webkit, Safari, Chrome etc.
      var newEntry = document.querySelector('#new_entry');
      if (newEntry.style.display != 'none') {
        event.returnValue = "unsaved";
      }
    });
    var setDateFromStringOrNumber = function (ticker, elementUpdater) {
      return function (event) {
        if (event.keyCode == 13) {
          event.preventDefault();
          ticker();
          var newDateTime;
          // Note: Number.parseFloat would parse an ISO date string to the numeric value of its year component!
          // "2015-03-07..." => 2015
          // var milliSeconds = Number(event.target.textContent);
          var milliSeconds = Number(event.target.value);
          if (Number.isNaN(milliSeconds)) {
            // newDateTime = new Date(event.target.textContent);
            newDateTime = new Date(event.target.value);
          }
          else {
            newDateTime = new Date(milliSeconds);
          }
          if (Number.isNaN(newDateTime.getMilliseconds())) {
            // window.alert('Ignoring ' + event.target.textContent + ' (cannot convert to a valid Date).');
            window.alert('Ignoring ' + event.target.value + ' (cannot convert to a valid Date).');
          }
          else {
            elementUpdater(newDateTime);
            // Update weekday, in case user did not do it.
            event.target.value = newDateTime;
          }
        }
      };
    };
    var addTouchable = function(options) {
      var setupDeltaUpdater = function (options) {
        var dy = document.querySelector(options.year.selector);
        var dmo = document.querySelector(options.month.selector);
        var dd = document.querySelector(options.date.selector);
        var dh = document.querySelector(options.hour.selector);
        var dmi = document.querySelector(options.minute.selector);
        var ds = document.querySelector(options.second.selector);
        var element = document.querySelector(options.datetime.selector);
        return function () {
          // Construct a copy.
          // new Date(new Date) loses fractional seconds, hence getTime().
          var d = new Date(options.datetime.getter().getTime());
          d.setUTCFullYear(d.getUTCFullYear() + Number(dy.textContent));
          d.setUTCMonth(d.getUTCMonth() + Number(dmo.textContent));
          d.setUTCDate(d.getUTCDate() + Number(dd.textContent));
          d.setUTCHours(d.getUTCHours() + Number(dh.textContent));
          d.setUTCMinutes(d.getUTCMinutes() + Number(dmi.textContent));
          d.setUTCSeconds(d.getUTCSeconds() + Number(ds.textContent));
          element.value = d.toString();
        }
      };
      var updateDateTimeGui = setupDeltaUpdater(options);
      var setupListener = function(options) {
        var prevX,
            prevY,
            deltaX,
            deltaY,
            deltaSum;
        prevX = prevY = deltaX = deltaY = deltaSum = 0;
        var offset = document.querySelector(options.selector);
        var padWidth = options.padwidth;
        offset.draggable = true;
        offset.addEventListener('touchstart', function(event) {
          // event.preventDefault();
          // event.stopPropagation();
          LOG && console.log(event.type, event.touches[event.touches.length - 1].clientX, event.touches[event.touches.length - 1].clientY);
          prevX = event.touches[event.touches.length - 1].clientX;
          prevY = event.touches[event.touches.length - 1].clientY;
          // event.dataTransfer.effectAllowed = "all";
          // event.dataTransfer.setData('text/plain', 'This text may be dragged');                        deltaSum = Number(offset.textContent);
        }, false);
        true && offset.addEventListener('contextmenu', function(event) {
          event.preventDefault();
          event.stopPropagation();
          LOG && console.log(event.type, event.touches ? event.touches[event.touches.length - 1].clientX : event.clientX, event.touches ? event.touches[event.touches.length - 1].clientY : event.clientY);
          LOG && console.log(event);
          // NOTE: Cannot distinguish between mouse click with and without mouse move.
          // Therefor we only reset value for single click on touch device.
          // if ("touches" in event) {
          offset.style.backgroundColor = 'white';
          offset.textContent = '-' + utilsjs.pad('0', padWidth, '0');
          prevX = prevY = deltaX = deltaY = deltaSum = 0;
          updateDateTimeGui();
          // }
          // prevX = event.touches[event.touches.length - 1].clientX;
          // prevY = event.touches[event.touches.length - 1].clientY;
          // event.dataTransfer.effectAllowed = "all";
          // event.dataTransfer.setData('text/plain', 'This text may be dragged');                        deltaSum = Number(offset.textContent);
        }, false);
        // NOTE: We use double click to reset value for mouse clicks to be sure there was no associated mouse move.
        true && offset.addEventListener('dblclick', function(event) {
          event.preventDefault();
          event.stopPropagation();
          LOG && console.log(event.type, event.touches ? event.touches[event.touches.length - 1].clientX : event.clientX, event.touches ? event.touches[event.touches.length - 1].clientY : event.clientY);
          LOG && console.log(event);
          offset.style.backgroundColor = 'white';
          offset.textContent = '-' + utilsjs.pad('0', padWidth, '0');
          prevX = prevY = deltaX = deltaY = deltaSum = 0;
          updateDateTimeGui();
          // prevX = event.touches[event.touches.length - 1].clientX;
          // prevY = event.touches[event.touches.length - 1].clientY;
          // event.dataTransfer.effectAllowed = "all";
          // event.dataTransfer.setData('text/plain', 'This text may be dragged');                        deltaSum = Number(offset.textContent);
        }, false);
        // offset.addEventListener('click', function(event) {
        //   event.preventDefault();
        //   event.stopPropagation();
        //   LOG && console.log(event.type);
        //   offset.textContent = '-' + utilsjs.pad('0', padWidth, '0');
        //   // timeFromDeltaUpdater(getDateTime(), Math.round(-deltaSum));
        //   elementUpdater(getDateTime());
        //   prevX = prevY = deltaX = deltaY = deltaSum = 0;
        //   // event.dataTransfer.setData('text/plain', 'This text may be dragged');                        deltaSum = Number(offset.textContent);
        // }, false);
        false && offset.addEventListener('mouseenter', function(event) {
          LOG && console.log(event.type, event.touches[event.touches.length - 1].clientX, event.touches[event.touches.length - 1].clientY);
          LOG && console.log(event.target);
          var s = getSelection();
          s.removeAllRanges();
          var r = document.createRange();
          r.selectNodeContents(offset);
          s.addRange(r);
        }, false);
        offset.addEventListener('touchend', function(event) {
          LOG && console.log(event.type, event.touches.length && event.touches[event.touches.length - 1].clientX, event.touches.length && event.touches[event.touches.length - 1].clientY);
          offset.style.backgroundColor = 'white';
        }, false);
        offset.addEventListener('touchmove', function(event) {
          event.preventDefault();
          event.stopPropagation();
          LOG && console.log(event.type, event.touches[event.touches.length - 1].clientX, event.touches[event.touches.length - 1].clientY, event.x, event.y);
          LOG && console.log(event);
          // TODO Need to stop only associated element.
          deltaX = event.touches[event.touches.length - 1].clientX - prevX;
          deltaY = prevY - event.touches[event.touches.length - 1].clientY;
          if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              //     Slow mode
              offset.style.backgroundColor = 'lightcyan';
              // deltaSum += deltaX;
              deltaSum += deltaX > 0 ? 0.1 : -0.1;
              offset.textContent = (deltaSum > 0 ? '+' : '-') + utilsjs.pad(Math.abs(Math.round(deltaSum)), padWidth, '0');
            }
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
              //     Fast mode
              offset.style.backgroundColor = 'lightpink';
              // deltaSum += deltaY * 5;
              deltaSum += deltaY > 0 ? 0.5 : -0.5;
              // TODO Please note toFixed() also produces -0 values.
              offset.textContent = (deltaSum > 0 ? '+' : '-') + utilsjs.pad(Math.abs(Math.round(deltaSum)), padWidth, '0');
            }
          }
          LOG && console.log(deltaX, deltaY, offset.textContent);
          // var d = timeFromDeltaUpdater(getDateTime(), Math.round(deltaSum));
          // elementUpdater(d);
          updateDateTimeGui();
          prevX = event.touches[event.touches.length - 1].clientX;
          prevY = event.touches[event.touches.length - 1].clientY;
        }, false);
        true && offset.addEventListener('mousemove', function(event) {
          event.preventDefault();
          event.stopPropagation();
          if (event.buttons == 0) {
            prevX = event.clientX;
            prevY = event.clientY;
          }
          if (event.buttons == 1) {
            deltaX = event.clientX - prevX;
            deltaY = prevY - event.clientY;
            if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
              if (Math.abs(deltaX) * 2 > Math.abs(deltaY)) {
                //     Slow mode
                offset.style.backgroundColor = 'lightcyan';
                deltaSum += deltaX / 8;
                deltaSum += 0.1;
                offset.textContent = (deltaSum > 0 ? '+' : '-') + utilsjs.pad(Math.abs(Math.round(deltaSum)), padWidth, '0');
              }
              if (Math.abs(deltaY) * 2 > Math.abs(deltaX)) {
                //     Fast mode
                offset.style.backgroundColor = 'lightpink';
                deltaSum += deltaY;
                deltaSum += 0.1;
                // TODO Please note toFixed() also produces -0 values.
                offset.textContent = (deltaSum > 0 ? '+' : '-') + utilsjs.pad(Math.abs(Math.round(deltaSum)), padWidth, '0');
              }
            }
            // var d = timeFromDeltaUpdater(getDateTime(), Math.round(deltaSum));
            // elementUpdater(d);
            updateDateTimeGui();
            LOG && console.log(deltaX, deltaY, offset.textContent);
            prevX = event.clientX;
            prevY = event.clientY;
          }
          LOG && console.log(event.type, event.clientX, event.clientY);
          LOG && console.log(event);
          LOG && console.log(event.buttons);
        }, false);
      };
      setupListener(options.year);
      setupListener(options.month);
      setupListener(options.date);
      setupListener(options.hour);
      setupListener(options.minute);
      setupListener(options.second);
    };
    var updateDateTime = function _updateDateTime(input_element) {
      return function (time) {
        input_element.value = time.toString();
      };
    };
    var getDateTime = function (element) {
      var time = new Date(element.value);
      return time;
    };

    var isValidEntry = function (entry) {
      if (!!entry.activity &&
          !!entry.activity.length &&
          !!entry.start &&
          !!entry.start.length &&
          !!entry.end &&
          !!entry.end.length) {
        return true;
      }
      else {
        return false;
      }
    };
    var saveEntry = function() {
      // event.preventDefault();
      // event.stopPropagation();
      DEBUG && window.alert('saving...');
      if (activity.dataset.id) {
        var id = activity.dataset.id.toString();
        activity.removeAttribute('data-id');
        return db.get(id).then(function(otherDoc) {
          var startDate = getDateTime(start);
          var endDate = getDateTime(end);
          var activityText = activity.value;
          var startText = startDate.toJSON();
          var endText = endDate.toJSON();
          var changedStart = !(otherDoc.start == startText);
          var changedEnd = !(otherDoc.end == endText);
          var changedActivity = !(otherDoc.activity == activityText);
          otherDoc.activity = activityText;
          otherDoc.start = startText;
          otherDoc.end = endText;
          if (isValidEntry(otherDoc)) {
            return db.put(otherDoc).then(function(response) {
              changedStart && utilsjs.updateEntriesElement(id, 'pre.start', utilsjs.formatStartDate(startDate));
              changedEnd && utilsjs.updateEntriesElement(id, 'pre.end', utilsjs.formatEndDate(endDate));
              (changedStart || changedEnd) && utilsjs.updateEntriesElement(id, 'pre.duration', utilsjs.reportDateTimeDiff(startDate, endDate));
              changedActivity && utilsjs.updateEntriesElement(id, 'pre.activity', activityText);
              return true;
            }).catch(function(err) {
              //errors
              window.alert(err);
              return false;
            });
          }
          else {
            return false;
          }
        }).catch(function(err) {
          //errors
          window.alert(err);
          return false;
        });
      }
      else {
        var entry = {
          // _id: db.post(),
          // activity: activity.textContent,
          activity: activity.value,
          start: getDateTime(start).toJSON(),
          end: getDateTime(end).toJSON()
        };
        if (isValidEntry(entry)) {
          return db.post(entry).then(function(response) {
            var entries = document.getElementById('entries');
            entry._id = response.id;
            // Insert before the first entry
            var newEntry = utilsjs.addNewEntry(entry, entries, entries.querySelector('div.entry'));
            newEntry.querySelector('pre.activity').classList.add('changed');
            newEntry.querySelector('pre.start').classList.add('changed');
            newEntry.querySelector('pre.end').classList.add('changed');
            return true;
          }).catch(function(err) {
            //errors
            window.alert(err);
            return false;
          });
        }
        else {
          window.alert('saving entry failed, please review values of start, end, activity.');
          var newEntry = document.querySelector('#new_entry');
          newEntry.scrollIntoView();
          return false;
        }
      }
    };
    var start = document.getElementById('start');
    var updateStartButton = document.getElementById('update_start');
    var startUpdater = updateDateTime(start);
    // var startnow = document.querySelector('#startnow');
    var startAtEnd = document.querySelector('input.start_at_end');
    startAtEnd.addEventListener('click', function (event) {
      updateStartButton.removeAttribute('disabled');
      tack.removeCallback(updateStart);
      startDateTime = getDateTime(end);
      startUpdater(startDateTime);
    });
    var getStartTime = function() { return startDateTime; };
    start.addEventListener('keypress', setDateFromStringOrNumber(function () { tack.removeCallback(updateStart); }, startUpdater));
    addTouchable({ year: { selector: '.start_delta_div>.year', padwidth: 2},
                  month: { selector: '.start_delta_div>.month', padwidth: 2},
                  date: { selector: '.start_delta_div>.date', padwidth: 2},
                  hour: { selector: '.start_delta_div>.hour', padwidth: 2},
                  minute: { selector: '.start_delta_div>.minute', padwidth: 2},
                  second: { selector: '.start_delta_div>.second', padwidth: 2},
                  datetime: { selector: '#start', getter: getStartTime }});
    var end = document.getElementById('end');
    var updateEndButton = document.getElementById('update_end');
    var endUpdater = updateDateTime(end);
    // var endnow = document.querySelector('#endnow');
    var endAtStart = document.querySelector('input.end_at_start');
    endAtStart.addEventListener('click', function (event) {
      updateEndButton.removeAttribute('disabled');
      tack.removeCallback(updateEnd);
      endDateTime = getDateTime(start);
      endUpdater(endDateTime);
    });
    var getEndTime = function() { return endDateTime; };
    end.addEventListener('keypress', setDateFromStringOrNumber(function () { tack.removeCallback(updateEnd); }, endUpdater));
    addTouchable({ year: { selector: '.end_delta_div>.year', padwidth: 2},
                  month: { selector: '.end_delta_div>.month', padwidth: 2},
                  date: { selector: '.end_delta_div>.date', padwidth: 2},
                  hour: { selector: '.end_delta_div>.hour', padwidth: 2},
                  minute: { selector: '.end_delta_div>.minute', padwidth: 2},
                  second: { selector: '.end_delta_div>.second', padwidth: 2},
                  datetime: { selector: '#end', getter: getEndTime }});
    var Tacker = function() {
      this.callbacks = [];
      this.timerId = false;
    };
    Tacker.prototype.addCallback = function(callback) {
      this.callbacks.push(callback);
    };
    Tacker.prototype.toggleCallback = function(callback) {
      this.removeCallback(callback) || this.addCallback(callback);
    };
    Tacker.prototype.removeCallback = function(callback) {
      var found = this.callbacks.some(function(registeredCallback, index) {
        if (registeredCallback == callback) {
          delete this.callbacks[index];
          return true;
        }}, this);
      if (!found) {
        DEBUG && window.alert(callback.toSource() + ' was never registered');
      }
      return found;
    };
    Tacker.prototype.tick = function () {
      var now = new Date;
      this.timerId && window.clearTimeout(this.timerId);
      this.callbacks.forEach(function(callback) {
        callback(now);
      });
      var millisToNextSecond = 1000 - now % 1000;
      // See [Function.prototype.bind() - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Example.3A_With_setTimeout)
      this.timerId = window.setTimeout(this.tick.bind(this), millisToNextSecond);
    };
    Tacker.prototype.start = function () {
      // See tick function for timer rescheduling, start after 20ms delay initially.
      this.timerId = window.setTimeout(this.tick.bind(this), 20);
    };
    var tack = new Tacker();
    var updateStart = function(time) {
      startDateTime = time;
      startUpdater(time);
      start.value = time;
    };
    var updateEnd = function(time) {
      endDateTime = time;
      endUpdater(time);
      end.value = time;
    };
    start.addEventListener('click', (function (event) {
      tack.removeCallback.bind(tack)(updateStart);
      updateStartButton.removeAttribute('disabled');
    }));
    end.addEventListener('click', (function (event) {
      tack.removeCallback.bind(tack)(updateEnd);
      updateEndButton.removeAttribute('disabled');
    }));
    updateStartButton.addEventListener('click', (function (event) {
      tack.addCallback.bind(tack)(updateStart);
      event.target.setAttribute('disabled', true)
    }));
    updateEndButton.addEventListener('click', (function (event) {
      tack.addCallback.bind(tack)(updateEnd);
      event.target.setAttribute('disabled', true)
    }));
    tack.start();
    var id = document.location.hash.substring(1);
    var initEntry = function (id) {
      if (id) {
        activity.dataset.id = id;
        db.get(id).then(function(otherDoc) {
          // activity.textContent = otherDoc.activity;
          activity.value = otherDoc.activity;
          var start = new Date(otherDoc.start);
          startDateTime = start;
          startUpdater(start);
          var end = new Date(otherDoc.end);
          endDateTime = end;
          endUpdater(end);
        }).catch(function(err) {
          //errors
          window.alert(err);
        });
      }
      else {
        tack.addCallback(updateStart);
        tack.addCallback(updateEnd);
      }
    };
    // maybeSave();
    // ---

    var startMessage = function () {

      var message = document.getElementById('message');

      // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
      // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
      message.textContent = translate('message');
    }
    // };
    return {
      save: saveEntry,
      init: initEntry
    };
  });
}
catch (e) {
  window.alert(e.message + '\n' + e.stack);
}

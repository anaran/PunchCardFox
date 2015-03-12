// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';
  var DEBUG = false, LOG = true;
  var saved = false;
  var db = new PouchDB('punchcard3');
  var id = document.location.hash.substring(1);
  var startDateTime = new Date;
  var endDateTime = new Date;
  // NOTE: does don't prompt user when called from beforeunload event listener.
  var maybeSave = function () {
    if (window.confirm('Save changes?')) {
      saveButton.click();
    }
  };
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
    // } else {
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
    event.returnValue = (saved ? "" : "unsaved");
  });
  var setDateFromStringOrNumber = function (ticker, setDate, updater) {
    return function (event) {
      if (event.keyCode == 13) {
        event.preventDefault();
        ticker();
        var newDateTime;
        // Note: Number.parseFloat would parse an ISO date string to the numeric value of its year component!
        // "2015-03-07..." => 2015
        var milliSeconds = Number(event.target.textContent);
        if (Number.isNaN(milliSeconds)) {
          newDateTime = new Date(event.target.textContent);
        } else {
          newDateTime = new Date(milliSeconds);
        }
        if (Number.isNaN(newDateTime.getMilliseconds())) {
          window.alert('Ignoring ' + event.target.textContent + ' (cannot convert to a valid Date).');
        } else {
          setDate(newDateTime);
          updater(newDateTime);
        }
      }
    };
  };
  var addTouchable = function(delta_element, update_elemet, dateTime, updater, padWidth) {
    var offset = delta_element;
    // offset.contentEditable = false;
    // offset.textContent = pad('0', padWidth, '0');
    // offset.style.display = 'inline-block';
    // offset.style.textAlign = 'end';
    // offset.style.width = '3ex';
    // offset.style.fontFamily = 'monospace';
    // offset.style.border = 'solid 2px';
    (function() {
      var prevX,
          prevY,
          deltaX,
          deltaY,
          deltaSum;
      prevX = prevY = deltaX = deltaY = deltaSum = 0;
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
      offset.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        LOG && console.log(event.type);
        offset.textContent = '-' + pad('0', padWidth, '0');
        // updater(dateTime, Math.round(-deltaSum));
        (updateDateTime(update_elemet))(dateTime);
        prevX = prevY = deltaX = deltaY = deltaSum = 0;
        // event.dataTransfer.setData('text/plain', 'This text may be dragged');                        deltaSum = Number(offset.textContent);
      }, false);
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
        // startTicking = false;
        // endTicking = false;
        deltaX = event.touches[event.touches.length - 1].clientX - prevX;
        deltaY = prevY - event.touches[event.touches.length - 1].clientY;
        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            //     Slow mode
            offset.style.backgroundColor = 'lightcyan';
            // deltaSum += deltaX;
            deltaSum += deltaX > 0 ? 0.1 : -0.1;
            offset.textContent = (deltaSum > 0 ? '+' : '-') + pad(Math.abs(Math.round(deltaSum)), padWidth, '0');
          }
          if (Math.abs(deltaY) > Math.abs(deltaX)) {
            //     Fast mode
            offset.style.backgroundColor = 'lightpink';
            // deltaSum += deltaY * 5;
            deltaSum += deltaY > 0 ? 0.5 : -0.5;
            // TODO Please note toFixed() also produces -0 values.
            offset.textContent = (deltaSum > 0 ? '+' : '-') + pad(Math.abs(Math.round(deltaSum)), padWidth, '0');
          }
        }
        LOG && console.log(deltaX, deltaY, offset.textContent);
        var d = updater(dateTime, Math.round(deltaSum));
        (updateDateTime(update_elemet))(d);
        prevX = event.touches[event.touches.length - 1].clientX;
        prevY = event.touches[event.touches.length - 1].clientY;
      }, false);
    })();
  };
  var pad = function(text, length, padding) {
    text += '';
    while (text.length < length) {
      text = padding + text;
    }
    return text;
  };
  var updateDateTime = function _updateDateTime(element) {
    var year = element.querySelector('.year');
    var month = element.querySelector('.month');
    var date = element.querySelector('.date');
    var week = element.querySelector('.week');
    var hour = element.querySelector('.hour');
    var minute = element.querySelector('.minute');
    var second = element.querySelector('.second');
    return function (time) {
      year.textContent = time.getFullYear();
      month.textContent = pad(time.getMonth() + 1, 2, '0');
      date.textContent = pad(time.getDate(), 2, '0');
      week.textContent = pad('0', 2, '0');
      hour.textContent = pad(time.getHours(), 2, '0');
      minute.textContent = pad(time.getMinutes(), 2, '0');
      second.textContent = pad(time.getSeconds(), 2, '0');
    };
  };

  // var translate = navigator.mozL10n.get;

  //   var db = new PouchDB('punchcard');
  //   var remoteCouch = false;

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to let us know once it's ready.
  // navigator.mozL10n.once(start);
  var saveButton = document.querySelector('input.save');
  // var saveLink = document.querySelector('a.save');
  // var activity = document.querySelector('pre#activity');
  var activity = document.querySelector('textarea#activity');
  saveButton.addEventListener('click', function (event) {
    // event.preventDefault();
    // event.stopPropagation();
    DEBUG && window.alert('saving...');
    if (id) {
      db.get(id).then(function(otherDoc) {
        // otherDoc.activity = activity.textContent;
        otherDoc.activity = activity.value;
        otherDoc.start = startDateTime;
        otherDoc.end = endDateTime;
        return db.put(otherDoc).then(function(response) {
          // saveLink.click();
          saved = true;
        }).catch(function(err) {
          //errors
          window.alert(err);
        });
      }).catch(function(err) {
        //errors
        window.alert(err);
      });
    } else {
      var entry = {
        // _id: db.post(),
        // activity: activity.textContent,
        activity: activity.value,
        start: startDateTime,
        end: endDateTime
      };
      DEBUG && window.alert(JSON.stringify(entry, null, 2));
      db.post(entry).then(function(response) {
        // saveLink.click();
        saved = true;
      }).catch(function(err) {
        //errors
        window.alert(err);
      });
    }
  });
  var start = document.querySelector('pre#start');
  var startDiv = document.querySelector('div.start_div');
  var startUpdater = updateDateTime(startDiv);
  // var startnow = document.querySelector('#startnow');
  var startTicking = true;
  startDiv.addEventListener('click', function (event) {
    startTicking = !startTicking;
  });
  var startAtEnd = document.querySelector('#start_at_end');
  startAtEnd.addEventListener('click', function (event) {
    startTicking = false;
    startDateTime = endDateTime;
    startUpdater(endDateTime);
  });
  start.addEventListener('keypress', setDateFromStringOrNumber(function () { startTicking = false; }, function (date) { startDateTime = date; }, startUpdater));
  addTouchable(document.querySelector('.start_delta_div>.year'), startDiv, startDateTime, function (value, delta) {
    var d = new Date(value);
    value.setFullYear(d.getFullYear() + delta);
    return d;
  }, 3);
  addTouchable(document.querySelector('.start_delta_div>.minute'), startDiv, startDateTime, function (value, delta) {
    var d = new Date(value);
    d.setMinutes(d.getMinutes() + delta);
    return d;
  }, 2);
  var end = document.querySelector('pre#end');
  var endDiv = document.querySelector('div.end_div');
  var endUpdater = updateDateTime(endDiv);
  // var endnow = document.querySelector('#endnow');
  var endTicking = true;
  var endAtStart = document.querySelector('#end_at_start');
  endAtStart.addEventListener('click', function (event) {
    endTicking = false;
    endDateTime = startDateTime;
    endUpdater(startDateTime);
  });
  end.addEventListener('keypress', setDateFromStringOrNumber(function () { endTicking = false; }, function (date) { endDateTime = date; }, endUpdater));
  addTouchable(document.querySelector('.end_delta_div>.year'), endDiv, endDateTime, function (value, delta) {
    var d = new Date(value);
    d.setFullYear(d.getFullYear() + delta);
    return d;
  }, 3);
  addTouchable(document.querySelector('.end_delta_div>.minute'), endDiv, endDateTime, function (value, delta) {
    var d = new Date(value);
    d.setMinutes(d.getMinutes() + delta);
    return d;
  }, 2);
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
  };
  var updateEnd = function(time) {
    endDateTime = time;
    endUpdater(time);
  };
  tack.addCallback(updateStart);
  tack.addCallback(updateEnd);
  startDiv.addEventListener('click', (function (event) {
    tack.toggleCallback.bind(tack)(updateStart);
  }));
  endDiv.addEventListener('click', (function (event) {
    tack.toggleCallback.bind(tack)(updateEnd);
  }));
  tack.start();
  var id = document.location.hash.substring(1);
  if (id) {
    startTicking = endTicking = false;
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
  // maybeSave();
  // ---

  function start() {

    var message = document.getElementById('message');

    // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
    // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
    message.textContent = translate('message');
  }

});

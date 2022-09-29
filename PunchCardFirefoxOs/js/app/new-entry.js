'use strict';

import { infojs } from './info.js';
import * as utilsjs from './utils.js';
// import '../../bower_components/pouchdb/dist/pouchdb.min.js';
// import '../../bower_components/pouchdb-all-dbs/dist/pouchdb.all-dbs.min.js';

let DEBUG = false;
let LOG = false;

export class NewEntryUI extends HTMLElement {
  // See
  // https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
  // for constuctor arguments
  constructor(databaseID, copy) {
    super();
    DEBUG && console.log(`new NewEntryUI(${databaseID})`);
    this.databaseID = databaseID;
    this.copy = copy;
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
<section id="new_entry">
  <section id="editor">
    <!-- <h1 data-l10n-id="app_title">Privileged empty app</h1> -->
    <textarea id="activity" placeholder="enter activity"></textarea>
    <span>
      <div>
        <input type="button" id="save_edit" value="&check;"/>
      </div>
      <div>
        <input type="button" id="quit_edit" value="&Cross;"/>
      </div>
    </span>
    <!-- <span> --> <!-- <input type="button" id="resize_ta"
                         value="&DownTeeArrow;"/> --> <!-- </span> -->
    <!-- <pre id="activity" title="activity"
         contenteditable>Activity</pre> -->
  </section>
  <section>
    <input-ui id="start" type="text"></input-ui>
      <input type="button" class="start_at_end" value="&UpTeeArrow;"/>
      <input type="button" id="update_start"
             value="&circlearrowright;" disabled/>
  </section>
  <section class="start">
    <div class="start_delta_div">
      <span class="year">-00</span>
      <span class="sign">Y</span>
      <span class="month">-00</span>
      <span class="sign">M</span>
      <span class="date">-00</span>
      <span class="sign">D</span>
      <span class="week">-00</span>
      <span class="sign">W</span>
      <span class="hour">-00</span>
      <span class="sign">H</span>
      <span class="minute">-00</span>
      <span class="sign">M</span>
      <span class="second">-00</span>
      <span class="sign">S</span>
    </div>
  </section>
  <section>
    <input-ui id="end" type="text"></input-ui>
    <span>
      <input type="button" class="end_at_start"
             value="&DownTeeArrow;"/>
    </span>
    <span>
      <input type="button" id="update_end" value="&circlearrowright;"
             disabled/>
    </span>
  </section>
  <section class="end">
    <div class="end_delta_div">
      <span class="year">-00</span>
      <span class="sign">Y</span>
      <span class="month">-00</span>
      <span class="sign">M</span>
      <span class="date">-00</span>
      <span class="sign">D</span>
      <span class="week">-00</span>
      <span class="sign">W</span>
      <span class="hour">-00</span>
      <span class="sign">H</span>
      <span class="minute">-00</span>
      <span class="sign">M</span>
      <span class="second">-00</span>
      <span class="sign">S</span>
    </div>
  </section>
  <section>
    <footer>
    </footer>
  </section>
</section>
<style>
#start, #end {
  background-color: inherit;
  color: inherit;
  width: 33ch;
    /*font-family: monospace;*/
}

.sign, .year, .month, .date, .week, .hour, .minute, .second {
    background-color: inherit;
    color: inherit;
    font-family: monospace;
    /* margin: 0; */
    padding: 0 0 1rem 0;
    text-align: end;
    /* border: 0 solid; */
    display: inline-block;
}

.changed {
  /*font-weight: bold;
    color: black;
    background-color: white;*/
    text-decoration-style: wavy;
    text-decoration-color: red;
    text-decoration-line: underline;
}

/*:host-context(body.dark_theme) span.changed {
    color: white;
    background-color: black;
    filter: invert(100%);
}

:host-context(body) span.changed {
    color: black;
    background-color: white;
    filter: invert(100%);
}*/

/* #new_entry {
    font-size: 1.5rem;
    margin: 0;
    position: fixed;
    text-align: center;
    top: 0;
    left: 0;
    display: flex;
    width: 100vw;
} */

#editor {
    display: flex;
}

#activity {
  background-color: inherit;
  color: inherit;
  flex: auto;
  resize: both;
  height: 10ch;
  /*min-height: 6ch;
    min-width: 33ch;
    width: 100%;*/
}

#save_edit, #quit_edit {
    min-width: 2em;
    min-height: 2em;
}
</style>
      `;
  }
  connectedCallback() {
    this.db = new PouchDB('punchcard');
    this.scrollView = document.querySelector('section#view-punchcard-list.view.view-noscroll');
    this.entries = document.querySelector('div#new_entries');
    // var id = document.location.hash.substring(1);
    let quitEdit = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.activity.value.trim().length || window.confirm("Discard edits?")) {
        this.scrollView.removeChild(this);
      }
    }
    let saveEdit = (event) => {
      event.preventDefault();
      event.stopPropagation();
      let res = this.save();
      DEBUG && console.log(res);
      res && res.then((result) => {
        this.scrollView.removeChild(this);
        document.getElementById(('modified' in result) ? result.modified.id : result.new.id).scrollIntoView({block: "center", inline: "center"});
      }).catch((err) => {
        infojs(err, this.shadow.firstElementChild, 'append');
      });
    }
    this.shadow.querySelector ('#quit_edit').addEventListener('click', quitEdit, 'capture');
    this.shadow.querySelector ('#save_edit').addEventListener('click', saveEdit, 'capture');
    this.startDateTime = new Date;
    this.endDateTime = new Date;
    // NOTE: prompt user whether to reload page even when an entry is being edited.
    window.addEventListener("beforeunload", (event) => {
      // event.preventDefault();
      // maybeSave();
      // if (id) {
      //   this.db.get(id).then((otherDoc) => {
      //     otherDoc.activity = activity.textContent;
      //     otherDoc.start = startDateTime;
      //     otherDoc.end = endDateTime;
      //     return this.db.put(otherDoc).then((response) => {
      //       // saveLink.click();
      //       event.returnValue = 'saved';
      //     }).catch((err) => {
      //       //errors
      //       window.alert(err);
      //     });
      //   }).catch((err) => {
      //     //errors
      //     window.alert(err);
      //   });
      // }
      // else {
      //   var entry = {
      //     // _id: this.db.post(),
      //     activity: activity.textContent,
      //     start: startDateTime,
      //     end: endDateTime
      //   };
      //   DEBUG && window.alert(JSON.stringify(entry, null, 2));
      //   this.db.post(entry).then((response) => {
      //     // saveLink.click();
      //     event.returnValue = 'saved';
      //   }).catch((err) => {
      //     //errors
      //     window.alert(err);
      //   });
      // }
      // var confirmationMessage = "too bad! \o/";
      // (event || window.event).returnValue = confirmationMessage;     //Gecko + IE
      // return confirmationMessage;                                //Webkit, Safari, Chrome etc.
      // this.newEntry = document.querySelector('new-entry');
      // if (newEntry.style.display != 'none') {
      if (document.querySelector('new-entry')) {
        event.returnValue = "unsaved";
      }
      // }
    });
    this.setDateFromStringOrNumber = (ticker, elementUpdater) => {
      return (event) => {
        if (event.key == 'Enter') {
          event.preventDefault();
          ticker();
          let newDateTime;
          // Note: Number.parseFloat would parse an ISO date string to the numeric value of its year component!
          // "2015-03-07..." => 2015
          // var milliSeconds = Number(event.target.textContent);
          let milliSeconds = Number(event.target.value);
          if (Number.isNaN(milliSeconds)) {
            // newDateTime = new Date(event.target.textContent);
            newDateTime = new Date(event.target.value);
          }
          else {
            newDateTime = new Date(milliSeconds);
          }
          if (Number.isNaN(newDateTime.getMilliseconds())) {
            // window.alert('Ignoring ' + event.target.textContent + ' (cannot convert to a valid Date).');
            infojs('Ignoring ' + event.target.value + ' (cannot convert to a valid Date).', this.shadow.firstElementChild, 'append');
          }
          else {
            elementUpdater(newDateTime);
            // Update weekday, in case user did not do it.
            // event.target.value = newDateTime;
          }
        }
      };
    }
    this.addTouchable = (options) => {
      let element = this.shadow.querySelector(options.datetime.selector);
      this.setupDeltaUpdater = (options) => {
        let dy = this.shadow.querySelector(options.year.selector);
        let dmo = this.shadow.querySelector(options.month.selector);
        let dd = this.shadow.querySelector(options.date.selector);
        let dw = this.shadow.querySelector(options.week.selector);
        let dh = this.shadow.querySelector(options.hour.selector);
        let dmi = this.shadow.querySelector(options.minute.selector);
        let ds = this.shadow.querySelector(options.second.selector);
        // [ dy, dmo, dd, dh, dmi, ds ].forEach(value => value.textContent = "0");
        [ 'year', 'month', 'date', 'week', 'hour', 'minute', 'second' ].forEach(type => {
          this.shadow.querySelector(options[type].selector).textContent = '-' + utilsjs.pad('0', options[type].padwidth, '0');
        });
        return () => {
          // Construct a copy.
          // new Date(new Date) loses fractional seconds, hence getTime().
          let d = new Date(((options.datetime.getter)()).getTime());
          d.setUTCFullYear(d.getUTCFullYear() + Number(dy.textContent));
          d.setUTCMonth(d.getUTCMonth() + Number(dmo.textContent));
          d.setUTCDate(d.getUTCDate() + Number(dd.textContent));
          d.setUTCDate(d.getUTCDate() + (Number(dw.textContent) * 7));
          d.setUTCHours(d.getUTCHours() + Number(dh.textContent));
          d.setUTCMinutes(d.getUTCMinutes() + Number(dmi.textContent));
          d.setUTCSeconds(d.getUTCSeconds() + Number(ds.textContent));
          element.value = d.toString();
        }
      };
      let updateDateTimeGui = this.setupDeltaUpdater(options);
      this.setupListeners = (options) => {
        let prevX,
            prevY,
            deltaX,
            deltaY,
            deltaSum;
        prevX = prevY = deltaX = deltaY = deltaSum = 0;
        let offset = this.shadow.querySelector(options.selector);
        let padwidth = options.padwidth;
        let firstMove = true;
        offset.addEventListener('touchstart', (event) => {
          // event.preventDefault();
          // event.stopPropagation();
          firstMove = true;
          LOG && console.log(event.type, event.touches[event.touches.length - 1].clientX, event.touches[event.touches.length - 1].clientY);
          prevX = event.touches[event.touches.length - 1].clientX;
          prevY = event.touches[event.touches.length - 1].clientY;
          // event.dataTransfer.effectAllowed = "all";
          // event.dataTransfer.setData('text/plain', 'This text may be dragged');                        deltaSum = Number(offset.textContent);
        }, false);
        // Firefox on a Dell XPS 13 9343 receives mouse events from touch screen, not touch events!
        // No contextmenu event is raised in this configuration, therefor we handle click events to reset offset to 0 as well.
        let clickListener = (event) => {
          event.preventDefault();
          event.stopPropagation();
          LOG && console.log(event.type, event.touches ? event.touches[event.touches.length - 1].clientX : event.clientX, event.touches ? event.touches[event.touches.length - 1].clientY : event.clientY);
          LOG && console.log(event);
          // NOTE: Cannot distinguish between mouse click with and without mouse move.
          // Therefor we only reset value for single click on touch device.
          // if ("touches" in event) {
          // offset.style.backgroundColor = 'white';
          offset.textContent = '-' + utilsjs.pad('0', padwidth, '0');
          prevX = prevY = deltaX = deltaY = deltaSum = 0;
          offset.classList.remove('changed');
          updateDateTimeGui();
          // }
          // prevX = event.touches[event.touches.length - 1].clientX;
          // prevY = event.touches[event.touches.length - 1].clientY;
          // event.dataTransfer.effectAllowed = "all";
          // event.dataTransfer.setData('text/plain', 'This text may be dragged');                        deltaSum = Number(offset.textContent);
        };
        true && offset.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          event.stopPropagation();
          LOG && console.log(event.type, event.touches ? event.touches[event.touches.length - 1].clientX : event.clientX, event.touches ? event.touches[event.touches.length - 1].clientY : event.clientY);
          LOG && console.log(event);
          // NOTE: Cannot distinguish between mouse click with and without mouse move.
          // Therefor we only reset value for single click on touch device.
          // if ("touches" in event) {
          // offset.style.backgroundColor = 'white';
          offset.textContent = '-' + utilsjs.pad('0', padwidth, '0');
          prevX = prevY = deltaX = deltaY = deltaSum = 0;
          offset.classList.remove('changed');
          updateDateTimeGui();
          // }
          // prevX = event.touches[event.touches.length - 1].clientX;
          // prevY = event.touches[event.touches.length - 1].clientY;
          // event.dataTransfer.effectAllowed = "all";
          // event.dataTransfer.setData('text/plain', 'This text may be dragged');                        deltaSum = Number(offset.textContent);
        }, false);
        // NOTE: We use double click to reset value for mouse clicks to be sure there was no associated mouse move.
        // true && offset.addEventListener('dblclick', (event) => {
        //   event.preventDefault();
        //   event.stopPropagation();
        //   LOG && console.log(event.type, event.touches ? event.touches[event.touches.length - 1].clientX : event.clientX, event.touches ? event.touches[event.touches.length - 1].clientY : event.clientY);
        //   LOG && console.log(event);
        //   offset.style.backgroundColor = 'white';
        //   offset.textContent = '-' + utilsjs.pad('0', padwidth, '0');
        //   prevX = prevY = deltaX = deltaY = deltaSum = 0;
        //   updateDateTimeGui();
        //   // prevX = event.touches[event.touches.length - 1].clientX;
        //   // prevY = event.touches[event.touches.length - 1].clientY;
        //   // event.dataTransfer.effectAllowed = "all";
        //   // event.dataTransfer.setData('text/plain', 'This text may be dragged');                        deltaSum = Number(offset.textContent);
        // }, false);
        // offset.addEventListener('click', (event) => {
        //   event.preventDefault();
        //   event.stopPropagation();
        //   LOG && console.log(event.type);
        //   offset.textContent = '-' + utilsjs.pad('0', padwidth, '0');
        //   // timeFromDeltaUpdater(this.getDateTime(), Math.round(-deltaSum));
        //   elementUpdater(this.getDateTime());
        //   prevX = prevY = deltaX = deltaY = deltaSum = 0;
        //   // event.dataTransfer.setData('text/plain', 'This text may be dragged');                        deltaSum = Number(offset.textContent);
        // }, false);
        false && offset.addEventListener('mouseenter', (event) => {
          LOG && console.log(event.type, event.touches[event.touches.length - 1].clientX, event.touches[event.touches.length - 1].clientY);
          LOG && console.log(event.target);
          let s = getSelection();
          s.removeAllRanges();
          let r = document.createRange();
          r.selectNodeContents(offset);
          s.addRange(r);
        }, false);
        offset.addEventListener('touchend', (event) => {
          LOG && console.log(event.type, event.touches.length && event.touches[event.touches.length - 1].clientX, event.touches.length && event.touches[event.touches.length - 1].clientY);
          // offset.style.backgroundColor = 'white';
        }, false);
        offset.addEventListener('touchmove', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (firstMove) {
            LOG && console.log(event.type, 'remove click and click input element');
            offset.classList.add('changed');
            true && offset.removeEventListener('click', clickListener, false);
            element.click();
            firstMove = false;
          }
          LOG && console.log(event.type, event.touches[event.touches.length - 1].clientX, event.touches[event.touches.length - 1].clientY, event.x, event.y);
          LOG && console.log(event);
          // TODO Need to stop only associated element.
          deltaX = event.touches[event.touches.length - 1].clientX - prevX;
          deltaY = prevY - event.touches[event.touches.length - 1].clientY;
          if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              //     Slow mode
              // offset.style.backgroundColor = 'lightcyan';
              // deltaSum += deltaX;
              deltaSum += deltaX > 0 ? 0.1 : -0.1;
              offset.textContent = (deltaSum > 0 ? '+' : '-') + utilsjs.pad(Math.abs(Math.round(deltaSum)), padwidth, '0');
            }
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
              //     Fast mode
              // offset.style.backgroundColor = 'lightpink';
              // deltaSum += deltaY * 5;
              deltaSum += deltaY > 0 ? 0.5 : -0.5;
              // TODO Please note toFixed() also produces -0 values.
              offset.textContent = (deltaSum > 0 ? '+' : '-') + utilsjs.pad(Math.abs(Math.round(deltaSum)), padwidth, '0');
            }
          }
          LOG && console.log(deltaX, deltaY, offset.textContent);
          // let d = timeFromDeltaUpdater(this.getDateTime(), Math.round(deltaSum));
          // elementUpdater(d);
          updateDateTimeGui();
          prevX = event.touches[event.touches.length - 1].clientX;
          prevY = event.touches[event.touches.length - 1].clientY;
        }, false);
        let moveListener = (event) => {
          event.preventDefault();
          event.stopPropagation();
          deltaX = event.clientX - prevX;
          deltaY = prevY - event.clientY;
          // Firefox on a Dell XPS 13 9343 receives mouse events from touch screen, not touch events!
          // Clicking the touchscreen also generates mousemove event.
          // We have to check the deltas to see whether it was
          // actually just a click before we remove the click
          // listener.
          if (firstMove && deltaX && deltaY) {
          offset.classList.add('changed');
            LOG && console.log(event.type, 'remove click and click input element');
            true && offset.removeEventListener('click', clickListener, false);
            element.click();
            firstMove = false;
          }
          // if (event.buttons == 0) {
          //   prevX = event.clientX;
          //   prevY = event.clientY;
          // }
          // if (event.buttons == 1) {
          if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
            if (Math.abs(deltaX) * 2 > Math.abs(deltaY)) {
              //     Slow mode
              // offset.style.backgroundColor = 'lightcyan';
              deltaSum += deltaX / 8;
              deltaSum += 0.1;
              offset.textContent = (deltaSum > 0 ? '+' : '-') + utilsjs.pad(Math.abs(Math.round(deltaSum)), padwidth, '0');
            }
            if (Math.abs(deltaY) * 2 > Math.abs(deltaX)) {
              //     Fast mode
              // offset.style.backgroundColor = 'lightpink';
              deltaSum += deltaY;
              deltaSum += 0.1;
              // TODO Please note toFixed() also produces -0 values.
              offset.textContent = (deltaSum > 0 ? '+' : '-') + utilsjs.pad(Math.abs(Math.round(deltaSum)), padwidth, '0');
            }
          }
          // let d = timeFromDeltaUpdater(this.getDateTime(), Math.round(deltaSum));
          // elementUpdater(d);
          updateDateTimeGui();
          LOG && console.log(deltaX, deltaY, offset.textContent);
          prevX = event.clientX;
          prevY = event.clientY;
          LOG && console.log(event.type, event.clientX, event.clientY);
          LOG && console.log(event);
          LOG && console.log(event.buttons);
          // }
        };
        // Firefox on a Dell XPS 13 9343 receives mouse events from touch screen, not touch events!
        // We have to add and remove listeners on the appropriate parentElement
        // to receive mouse events when cursors leaves the current offset element.
        true && offset.addEventListener('mousedown', (event) => {
          event.preventDefault();
          event.stopPropagation();
          firstMove = true;
          true && offset.addEventListener('click', clickListener, false);
          true && this.addEventListener('mousemove', moveListener, false);
          LOG && console.log(event);
          // TODO: Remove mouseup listener as well!
          let upListener = (event) => {
            event.preventDefault();
            event.stopPropagation();
            true && this.removeEventListener('mousemove', moveListener, false);
            true && this.removeEventListener('mouseup', upListener, false);
            LOG && console.log(event.type, event);
          };
          true && this.addEventListener('mouseup', upListener, false);
        }, false);
      };
      this.setupListeners(options.year);
      this.setupListeners(options.month);
      this.setupListeners(options.date);
      this.setupListeners(options.week);
      this.setupListeners(options.hour);
      this.setupListeners(options.minute);
      this.setupListeners(options.second);
    }

    this.updateDateTime = (input_element) => {
      return (time) => {
        input_element.value = time.toString();
      };
    }

    this.getDateTime = (element) => {
      let time = new Date(element.value);
      return time;
    }

    this.isValidEntry = (entry) => {
      if (!!entry.activity &&
          !!entry.activity.length &&
          !!entry._id &&
          entry._id.length == 36 &&
          (!('end' in entry) ||
           entry.end.length == 24)) {
        return true;
      }
      else {
        return false;
      }
    }

    this.activity = this.shadow.querySelector('#activity');
    this.start = this.shadow.querySelector('#start');
    this.updateStartButton = this.shadow.querySelector('#update_start');
    this.startUpdater = this.updateDateTime(this.start);
    // let startnow = this.shadow.querySelector('#startnow');
    this.startAtEnd = this.shadow.querySelector('input.start_at_end');
    this.startAtEnd.addEventListener('click', (event) => {
      this.updateStartButton.removeAttribute('disabled');
      this.tack.removeCallback(this.updateStart);
      this.startDateTime = this.getDateTime(this.end);
      this.startUpdater(this.startDateTime);
    });

    this.getStartTime = () => { return this.startDateTime; }

    this.updateStart = (time) => {
      this.startDateTime = time;
      this.startUpdater(time);
      // this.start.value = time;
    };

    this.updateEnd = (time) => {
      this.endDateTime = time;
      this.endUpdater(time);
      // this.end.value = time;
    };

    this.start.addEventListener('keypress', this.setDateFromStringOrNumber(() => {
      this.tack.removeCallback(this.updateStart);
    }, this.updateStart));
    this.addTouchable({
      year: { selector: '.start_delta_div>.year', padwidth: 2},
      month: { selector: '.start_delta_div>.month', padwidth: 2},
      date: { selector: '.start_delta_div>.date', padwidth: 2},
      week: { selector: '.start_delta_div>.week', padwidth: 2},
      hour: { selector: '.start_delta_div>.hour', padwidth: 2},
      minute: { selector: '.start_delta_div>.minute', padwidth: 2},
      second: { selector: '.start_delta_div>.second', padwidth: 2},
      datetime: { selector: '#start', getter: this.getStartTime}});
    this.end = this.shadow.querySelector('#end');
    this.updateEndButton = this.shadow.querySelector('#update_end');
    this.endUpdater = this.updateDateTime(this.end);
    // let endnow = this.shadow.querySelector('#endnow');
    this.endAtStart = this.shadow.querySelector('input.end_at_start');
    this.endAtStart.addEventListener('click', (event) => {
      this.updateEndButton.removeAttribute('disabled');
      this.tack.removeCallback(this.updateEnd);
      this.endDateTime = this.getDateTime(this.start);
      this.endUpdater(this.endDateTime);
    });
    this.getEndTime = () => { return this.endDateTime; };
    this.end.addEventListener('keypress', this.setDateFromStringOrNumber(() => {
      this.tack.removeCallback(this.updateEnd);
    }, this.updateEnd));
    this.addTouchable({
      year: { selector: '.end_delta_div>.year', padwidth: 2},
      month: { selector: '.end_delta_div>.month', padwidth: 2},
      date: { selector: '.end_delta_div>.date', padwidth: 2},
      week: { selector: '.end_delta_div>.week', padwidth: 2},
      hour: { selector: '.end_delta_div>.hour', padwidth: 2},
      minute: { selector: '.end_delta_div>.minute', padwidth: 2},
      second: { selector: '.end_delta_div>.second', padwidth: 2},
      datetime: { selector: '#end', getter: this.getEndTime }});
    class Tacker {
      constructor() {
        this.callbacks = [];
        this.timerId = false;
      }
      addCallback(callback) {
        this.callbacks.push(callback);
      }
      toggleCallback(callback) {
        this.removeCallback(callback) || this.addCallback(callback);
      }
      removeCallback(callback) {
        let found = this.callbacks.some((registeredCallback, index) => {
          if (registeredCallback == callback) {
            delete this.callbacks[index];
            return true;
          }
        }, this);
        // if (!found) {
        //   infojs(callback.toString() + ' was never registered', this.entries);
        // }
        return found;
      }
      tick() {
        let now = new Date;
        this.timerId && window.clearTimeout(this.timerId);
        this.callbacks.forEach((callback) => {
          callback(now);
        });
        let millisToNextSecond = 1000 - now % 1000;
        // See [Function.prototype.bind() - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Example.3A_With_setTimeout)
        this.timerId = window.setTimeout(this.tick.bind(this), millisToNextSecond);
      }
      start() {
        // See tick function for timer rescheduling, start after 20ms delay initially.
        this.timerId = window.setTimeout(this.tick.bind(this), 20);
      }
    }
    this.tack = new Tacker();

    this.start.addEventListener('click', ((event) => {
      this.tack.removeCallback.bind(this.tack)(this.updateStart);
      this.updateStartButton.removeAttribute('disabled');
    }));
    this.end.addEventListener('click', ((event) => {
      this.tack.removeCallback.bind(this.tack)(this.updateEnd);
      this.updateEndButton.removeAttribute('disabled');
    }));
    this.updateStartButton.addEventListener('click', ((event) => {
      this.tack.addCallback.bind(this.tack)(this.updateStart);
      event.target.setAttribute('disabled', true)
    }));
    this.updateEndButton.addEventListener('click', ((event) => {
      this.tack.addCallback.bind(this.tack)(this.updateEnd);
      event.target.setAttribute('disabled', true)
    }));
    this.tack.start();
    this.init(this.databaseID);
  }
  static get observedAttributes() {return ['db_name']; }
  attributeChangedCallback(name, oldValue, newValue, namespace) {
    switch (name) {
    case 'db_name': {
      break;
    }
    default: {
      DEBUG && console.log(`unknown attribute ${name}, NS: ${namespace} for element ${this}`);
    }
    }
  }
  // let id = document.location.hash.substring(1);
  init(id) {
    // let editorSizeToggle = this.shadow.querySelector('#resize_ta');
    // this.activity.addEventListener ('focus', event => {
    //   this.activity.rows = 10;
    //   this.activity.style['text-overflow'] = 'unset';
    // });
    // this.activity.addEventListener ('focusout', event => {
    //   this.activity.rows = 1;
    //   this.activity.style['text-overflow'] = 'ellipsis ellipsis';
    // });
    // this.activity.addEventListener ('blur', event => {
    //   this.activity.rows = 1;
    //   this.activity.style['text-overflow'] = 'ellipsis ellipsis';
    // }, 'capture');
    if (id) {
      this.activity.dataset.id = id;
      this.db.get(id).then((otherDoc) => {
        // activity.textContent = otherDoc.activity;
        this.activity.value = otherDoc.activity;
        let start = new Date(otherDoc._id.substring(0, 24));
        this.tack.removeCallback(this.updateStart);
        this.startDateTime = start;
        this.startUpdater(start);
        if ('end' in otherDoc) {
          let end = new Date(otherDoc.end);
          this.tack.removeCallback(this.updateEnd);
          this.endDateTime = end;
          this.endUpdater(end);
        }
      }).catch((err) => {
        infojs(err, this.shadow.firstElementChild, 'append');
      });
    }
    else {
      this.tack.addCallback(this.updateStart);
      this.tack.addCallback(this.updateEnd);
    }
    this.scrollIntoView({block: "start", inline: "start"});
    this.activity.focus();
  }

  save() {
    return new Promise((resolve, reject) => {
      this.entries = this.entries  || document.querySelector('#New');
      if (!this.entries) {
        let content = document.querySelector('#entries_template').content;
        this.entries = document.importNode(content, "deep").firstElementChild;
        let cache_versions = document.querySelector('#cache_versions');
        this.scrollView.insertBefore(this.entries, cache_versions);
        this.entries.id = 'New';
        let queryInfoElement = this.entries.querySelector('span.info');
        queryInfoElement.scrollIntoView({block: "center", inline: "center"});
        let update = this.entries.querySelector('a.update');
        let close = this.entries.querySelector('a.close');
        update.addEventListener('click', (event) => {
          event.preventDefault();
          alert('rerun query is not implemented yet. \u221E');
        });
        close.addEventListener('click', (event) => {
          event.preventDefault();
          this.scrollView.removeChild(this.entries);
          // Would require export of function from app.js and import into this new-entry.js
          // updateScrollLinks();
        });
        queryInfoElement.textContent = 'New Entries';
      }
      if (this.activity.dataset.id && !this.copy) {
        var id = this.activity.dataset.id.toString();
        // NOTE: Make sure edit UI does not accidentally retain attribute for future edits.
        this.activity.removeAttribute('data-id');
        let oldStartString = (new Date(id.substring(0, 24))).toString();
        // document.getElementById(id).scrollIntoView({block: "center", inline: "center"});
        this.db.get(id).then((otherDoc) => {
          let startDate = this.getDateTime(this.start);
          let endDate = this.getDateTime(this.end);
          let activityText = this.activity.value;
          let newStartString = startDate.toString();
          let endText = endDate.toJSON();
          // Compare string representation, which has only whole seconds.
          // Second fractions cannot be edited in UI, only created via
          // menu entries, like "start now" or "repeat now".
          var changedStart = !(oldStartString == newStartString);
          var changedEnd = !(otherDoc.end == endText);
          var changedActivity = !(otherDoc.activity == activityText);
          otherDoc.activity = activityText;
          // Delete old doc when startDate for new doc is a valid date
          if (startDate.toJSON()) {
            if (changedStart) {
              otherDoc._deleted = true;
              this.db.put(otherDoc).then((response) => {
                document.getElementById(response.id).classList.add('deleted');
              }).catch((err) => {
                infojs(err, this.shadow.firstElementChild, 'append');
                reject('Cannot delete entry with old start time.\nDiscard edit?'
                       + JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
              });
              // NOTE: Remove _deleted property before modified doc is put into db!
              // Else it would be created in a deleted state.
              delete otherDoc._deleted;
              // NOTE: Remove _rev property before new doc is put into db!
              delete otherDoc._rev;
              otherDoc._id = startDate.toJSON() + Math.random().toString(16).substring(3, 15);
            }
          }
          else {
            reject('Cannot save modified entry with invalid start date.\nDiscard edit?');
            // FIXME: I need to understand chaining and nesting of promises.
            return;
          }
          // end may be left empty. endText is a valid date, else null.
          if (endText) {
            otherDoc.end = endText;
          }
          else {
            delete otherDoc.end;
          }
          if (this.isValidEntry(otherDoc)) {
            this.db.put(otherDoc).then((response) => {
              changedStart && utilsjs.updateEntriesElement(id, 'pre.start', utilsjs.formatStartDate(startDate));
              changedEnd && utilsjs.updateEntriesElement(id, 'pre.end', endText ? utilsjs.formatEndDate(endDate) : ' ');
              (changedStart || changedEnd) &&
                utilsjs.updateEntriesElement(id, 'pre.duration', endText ? utilsjs.reportDateTimeDiff(startDate, endDate) : ' ');
              changedActivity && utilsjs.updateEntriesElement(id, 'pre.activity', activityText);
              // document.getElementById(response.id).scrollIntoView({block: "center", inline: "center"});
              // Update id attribute to reflect now document id.
              // Fixes bug where future menu operations on replaced entry would not work.
              document.getElementById(id).id = response.id;
              document.getElementById(response.id).classList.remove('deleted');
              resolve({ modified: response });
              // TO be set by caller
              // utilsjs.updateEntriesElement(id, 'pre.revisions', response.rev.split(/-/)[0] + ' revs');
            }).catch((err) => {
              infojs(err, this.shadow.firstElementChild, 'append');
              reject('Cannot save modified entry.\nDiscard edit?'
                     + JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
            });
          }
          else {
            reject('Modified entry has invalid times or empty activity.\nDiscard edit?'
                   + JSON.stringify(otherDoc, Object.getOwnPropertyNames(otherDoc), 2));
          }
        }).catch((err) => {
          infojs(err, this.shadow.firstElementChild, 'append');
          reject('Cannot get entry to be modified.\nDiscard edit?'
                 + JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        });
      }
      else {
        var entry = {
          // activity: activity.textContent,
          activity: this.activity.value,
          _id: this.getDateTime(this.start).toJSON() + Math.random().toString(16).substring(3, 15),
        };
        // end may be left empty.
        if (this.end.value.length) {
          entry.end = this.getDateTime(this.end).toJSON();
        }
        if (this.isValidEntry(entry)) {
          this.db.put(entry).then((response) => {
            // Insert before the first entry
            let newEntry;
            if (this.copy && this.activity.dataset.id) {
              let beforeThisElement = document.getElementById(this.activity.dataset.id);
              // NOTE: Make sure edit UI does not accidentally retain attribute for future edits.
              this.activity.removeAttribute('data-id');
              newEntry = utilsjs.addNewEntry(entry, beforeThisElement.parentElement, beforeThisElement);
            }
            else {
              newEntry = utilsjs.addNewEntry(entry, this.entries, this.entries.querySelector('div.entry'));
            }
            newEntry.querySelector('pre.activity').classList.add('changed');
            newEntry.querySelector('pre.start').classList.add('changed');
            newEntry.querySelector('pre.end').classList.add('changed');
            // Too early, will scroll out of view when new entry UI is no longer displayed in caller.
            // document.getElementById(response.id).scrollIntoView({block: "center", inline: "center"});
            resolve({ new: response });
          }).catch((err) => {
            //errors
            infojs(err, this.shadow.firstElementChild, 'append');
            reject('New entry is valid but cannot be saved.\nDiscard edit?'
                   + JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
          });
        }
        else {
          // window.alert('saving entry failed, please review values of start, end, activity.');
          infojs(entry, this.shadow.firstElementChild, 'append');
          var newEntry = document.querySelector('new-entry');
          newEntry.scrollIntoView({block: "center", inline: "center"});
          reject('New entry has invalid times or empty activity.\nDiscard edit?'
                 + JSON.stringify(entry, Object.getOwnPropertyNames(entry), 2));
        }
      }
    });
  }
}

if (!customElements.get('new-entry')) {
  customElements.define('new-entry', NewEntryUI);
}

// export default {
//   NewEntryUI
// };

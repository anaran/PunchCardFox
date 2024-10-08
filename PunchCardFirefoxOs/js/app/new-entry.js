'use strict';

import * as appjs from './app.js';
import * as infojs from './info.js';
import * as utilsjs from './utils.js';
import { EntriesUI } from './entries-ui.js';

let LOG = false;

export class NewEntryUI extends HTMLElement {
  // See
  // https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
  // for constuctor arguments
  constructor(databaseID, copy) {
    super();
    this.databaseID = databaseID;
    this.copy = copy;
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
<section id="new_entry">
  <h1 data-l10n-id="app_new_entry">New Punchcard Entry</h1>
  <section id="editor">
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
  <section class="start_ui">
    <input-ui id="start" type="text"></input-ui>
    <input type="button" id="start_at_end" value="&UpTeeArrow;"/>
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
  <section class="end_ui">
    <input-ui id="end" type="text"></input-ui>
    <input type="button" id="end_at_start"
    value="&DownTeeArrow;"/>
    <input type="button" id="update_end" value="&circlearrowright;"
      disabled/>
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
input {
  background-color: inherit;
  color: inherit;
  font-size: inherit;
  margin: 0;
  padding: 0;
}

#new_entry {
  height: calc(100vh - 8mm);
  overflow: scroll;
  position: relative;
  scrollbar-width: none;
  top: 8mm;
}

#start, #end {
  background-color: inherit;
  color: inherit;
  display: flex;
  flex: auto;
  font-family: monospace;
  font-size: inherit;
  width: calc(100vw - 4rem);
}

.start_delta_div, .end_delta_div {
  background-color: inherit;
  color: inherit;
  display: flex;
  font-family: monospace;
  font-size: inherit;
  /* width: 100%; */
}

#start_at_end, #end_at_start, #update_start, #update_end {
  width: 1rem;
  flex: auto;
}

.sign, .year, .month, .date, .week, .hour, .minute, .second {
  background-color: inherit;
  color: inherit;
  display: inline-block;
  flex: auto;
  font-family: monospace;
  padding: 0 0 2rem 0;
}

.changed {
    text-decoration-style: wavy;
    text-decoration-color: red;
    text-decoration-line: underline;
}

#editor, .start_ui, .end_ui {
    display: flex;
}

#activity {
  background-color: inherit;
  color: inherit;
  flex: auto;
  font-size: inherit;
  resize: vertical;
  height: 10ch;
}

#save_edit, #quit_edit {
    width: 1rem;
}
</style>
      `;
  }
  connectedCallback() {
    this.db = new PouchDB('punchcard');
    this.scrollView = document.querySelector('section#view-punchcard-list.view.view-noscroll');
    let removeAutosave = () => {
      let autosavesJSON = localStorage.getItem('autosaves');
      let autosaves = {};
      if (autosavesJSON) {
        autosaves = JSON.parse(autosavesJSON);
      }
      localStorage.removeItem(this.autosaveID);
      infojs.info(`removing autosave ${this.autosaveID}`);
      delete autosaves[this.autosaveID];
      localStorage.setItem('autosaves', JSON.stringify(autosaves));
      infojs.info(`${Object.keys(autosaves).length} entries in autosaves ${JSON.stringify(autosaves, null, 2)}`);
    }
    let quitEdit = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.activity.value.trim().length || window.confirm("Discard edits?")) {
        document.body.removeChild(this);
      }
      removeAutosave();
    }
    let saveEdit = (event) => {
      event.preventDefault();
      event.stopPropagation();
      let res = this.save();
      res && res.then((result) => {
        document.body.removeChild(this);
        document.getElementById(('modified' in result) ? result.modified.id : result.new.id).scrollIntoView({block: "center", inline: "center"});
        removeAutosave();
      }).catch((err) => {
        infojs.error(err);
      });
    }
    this.shadow.querySelector ('#quit_edit').addEventListener('click', quitEdit, 'capture');
    this.shadow.querySelector ('#save_edit').addEventListener('click', saveEdit, 'capture');
    this.startDateTime = new Date;
    this.endDateTime = new Date;
    this.setDateFromStringOrNumber = (ticker, elementUpdater) => {
      return (event) => {
        // space
        if (event.type == 'blur') {
          // event.preventDefault();
          // event.stopPropagation();
          ticker();
          let newDateTime;
          newDateTime = new Date(event.target.value);
          if (Number.isNaN(newDateTime.getMilliseconds())) {
            // Note: Number.parseInt parses an ISO date string to
            // the numeric value of its year component!
            // "2015-03-07..." => 2015
            let milliSeconds = Number.parseInt(event.target.value);
            newDateTime = new Date(milliSeconds);
            if (Number.isNaN(newDateTime.getMilliseconds())) {
              infojs.warn('Ignoring ' + event.target.value + ' (cannot convert to a valid Date).');
              return;
            }
          }
          elementUpdater(newDateTime);
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
        // Firefox on a Dell XPS 13 9343 receives mouse events from
        // touch screen, not touch events!
        // No contextmenu event is raised in this configuration,
        // therefor we handle click events to reset offset to 0 as
        // well.
        let clickListener = (event) => {
          event.preventDefault();
          event.stopPropagation();
          LOG && console.log(event.type, event.touches ? event.touches[event.touches.length - 1].clientX : event.clientX, event.touches ? event.touches[event.touches.length - 1].clientY : event.clientY);
          LOG && console.log(event);
          offset.textContent = '-' + utilsjs.pad('0', padwidth, '0');
          prevX = prevY = deltaX = deltaY = deltaSum = 0;
          offset.classList.remove('changed');
          updateDateTimeGui();
        };
        true && offset.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          event.stopPropagation();
          LOG && console.log(event.type, event.touches ? event.touches[event.touches.length - 1].clientX : event.clientX, event.touches ? event.touches[event.touches.length - 1].clientY : event.clientY);
          LOG && console.log(event);
          offset.textContent = '-' + utilsjs.pad('0', padwidth, '0');
          prevX = prevY = deltaX = deltaY = deltaSum = 0;
          offset.classList.remove('changed');
          updateDateTimeGui();
        }, false);
        offset.addEventListener('touchend', (event) => {
          LOG && console.log(event.type, event.touches.length && event.touches[event.touches.length - 1].clientX, event.touches.length && event.touches[event.touches.length - 1].clientY);
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
              deltaSum += deltaX > 0 ? 0.1 : -0.1;
              offset.textContent = (deltaSum > 0 ? '+' : '-') + utilsjs.pad(Math.abs(Math.round(deltaSum)), padwidth, '0');
            }
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
              //     Fast mode
              deltaSum += deltaY > 0 ? 0.5 : -0.5;
              offset.textContent = (deltaSum > 0 ? '+' : '-') + utilsjs.pad(Math.abs(Math.round(deltaSum)), padwidth, '0');
            }
          }
          LOG && console.log(deltaX, deltaY, offset.textContent);
          updateDateTimeGui();
          prevX = event.touches[event.touches.length - 1].clientX;
          prevY = event.touches[event.touches.length - 1].clientY;
        }, false);
        let moveListener = (event) => {
          event.preventDefault();
          event.stopPropagation();
          deltaX = event.clientX - prevX;
          deltaY = prevY - event.clientY;
          // Firefox on a Dell XPS 13 9343 receives mouse events from
          // touch screen, not touch events!
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
          if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
            if (Math.abs(deltaX) * 2 > Math.abs(deltaY)) {
              //     Slow mode
              deltaSum += deltaX / 8;
              deltaSum += 0.1;
              offset.textContent = (deltaSum > 0 ? '+' : '-') + utilsjs.pad(Math.abs(Math.round(deltaSum)), padwidth, '0');
            }
            if (Math.abs(deltaY) * 2 > Math.abs(deltaX)) {
              //     Fast mode
              deltaSum += deltaY;
              deltaSum += 0.1;
              offset.textContent = (deltaSum > 0 ? '+' : '-') + utilsjs.pad(Math.abs(Math.round(deltaSum)), padwidth, '0');
            }
          }
          updateDateTimeGui();
          LOG && console.log(deltaX, deltaY, offset.textContent);
          prevX = event.clientX;
          prevY = event.clientY;
          LOG && console.log(event.type, event.clientX, event.clientY);
          LOG && console.log(event);
          LOG && console.log(event.buttons);
        };
        // Firefox on a Dell XPS 13 9343 receives mouse events from
        // touch screen, not touch events!
        // We have to add and remove listeners on the appropriate
        // parentElement to receive mouse events when cursor leaves
        // the current offset element.
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
      if (!entry.activity.length) {
        infojs.error(`activity text is missing:\n${JSON.stringify(entry, null, 2)}`);
        return false;
      }
      if (entry._id.length != 36) {
        infojs.error(`start time is invalid:\n${JSON.stringify(entry, null, 2)}`);
        return false;
      }
      if ('end' in entry && (!entry.end || entry.end.length != 24)) {
        infojs.error(`end time is invalid:\n${JSON.stringify(entry, null, 2)}`);
        return false;
      }
      return true;
    }
    this.autosaveEntry = () => {
      let autosave = {
        activity: this.activity.value,
        end: this.end.value,
        start: this.start.value,
      };
      infojs.info(`autosaving to ${this.autosaveID} ${JSON.stringify(autosave, null, 2)}`);
      localStorage.setItem(this.autosaveID, JSON.stringify(autosave));
    };
    this.activity = this.shadow.querySelector('#activity');
    this.autosaveID = `new-${(new Date).toJSON()}`;
    let autosavesJSON = localStorage.getItem('autosaves');
    let autosaves = {};
    // WeakMap keeps track of timer id per event.target (activity, end, start).
    const wm = new WeakMap();
    let setupAutosave = (event) => {
      // Causes Permission to access toJSON on click event.
      // event && infojs.info(event);
      // Only clear timeout if weak map has one set for this event target.
      // This prevents a restart of the timeout by an event.target
      // which did not initiate the timeout.
      window.clearTimeout(wm.get(event.target));
      wm.set(event.target, window.setTimeout(this.autosaveEntry, 3000));
    }
    if (autosavesJSON) {
      autosaves = JSON.parse(autosavesJSON);
    }
    autosaves[this.autosaveID] = true;
    localStorage.setItem('autosaves', JSON.stringify(autosaves));
    this.activity.addEventListener('input', setupAutosave);
    this.start = this.shadow.querySelector('#start');
    this.updateStartButton = this.shadow.querySelector('#update_start');
    this.startUpdater = this.updateDateTime(this.start);
    // let startnow = this.shadow.querySelector('#startnow');
    this.startAtEnd = this.shadow.querySelector('#start_at_end');
    this.startAtEnd.addEventListener('click', (event) => {
      setupAutosave(event);
      this.updateStartButton.removeAttribute('disabled');
      this.tack.removeCallback(this.updateStart);
      this.startDateTime = this.getDateTime(this.end);
      this.startUpdater(this.startDateTime);
    });

    this.getStartTime = () => { return this.startDateTime; }

    this.updateStart = (time) => {
      this.startDateTime = time;
      this.startUpdater(time);
    };

    this.updateEnd = (time) => {
      this.endDateTime = time;
      this.endUpdater(time);
    };

    this.start.addEventListener('blur', this.setDateFromStringOrNumber(() => {
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
    this.endAtStart = this.shadow.querySelector('#end_at_start');
    this.endAtStart.addEventListener('click', (event) => {
      setupAutosave(event);
      this.updateEndButton.removeAttribute('disabled');
      this.tack.removeCallback(this.updateEnd);
      this.endDateTime = this.getDateTime(this.start);
      this.endUpdater(this.endDateTime);
    });
    this.getEndTime = () => { return this.endDateTime; };
    this.end.addEventListener('blur', this.setDateFromStringOrNumber(() => {
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
    let maybePasteJSON = (event) => {
      try {
        let paste = (event.clipboardData || window.clipboardData).getData('text');
        let entry = JSON.parse(paste);
        event.preventDefault();
        if (this.activity.value) {
          alert('JSON entry can only be pasted to replace empty entry.');
          return;
        }
        if  ('activity' in entry && 'start' in entry) {
          this.tack.removeCallback.bind(this.tack)(this.updateStart);
          this.updateStartButton.removeAttribute('disabled');
          this.tack.removeCallback.bind(this.tack)(this.updateEnd);
          this.updateEndButton.removeAttribute('disabled');
          this.activity.value = entry.activity;
          this.start.value = entry.start;
          this.end.value = 'end' in entry ? entry.end : '';
        }
        else {
          infojs.error('Parsed JSON is not a valid PunchCard entry.');
        }
      }
      catch(err) {
        infojs.info(err);
      };
    }
    this.activity.addEventListener('paste', maybePasteJSON, 'capture');
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
        //   infojs.info(callback.toString() + ' was never registered', this.entries);
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
      setupAutosave(event);
      this.tack.removeCallback.bind(this.tack)(this.updateStart);
      this.updateStartButton.removeAttribute('disabled');
    }));
    this.end.addEventListener('click', ((event) => {
      setupAutosave(event);
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

  loadAutosaveGetNewID(autosaveID) {
    let autosave = JSON.parse(localStorage.getItem(autosaveID));
      let autosavesJSON = localStorage.getItem('autosaves');
      let autosaves = {};
      if (autosavesJSON) {
        autosaves = JSON.parse(autosavesJSON);
      }
    if (autosave) {
      this.tack.removeCallback(this.updateStart);
      this.tack.removeCallback(this.updateEnd);
      this.activity.value = autosave.activity;
      this.end.value = autosave.end;
      this.start.value = autosave.start;
      this.updateEndButton.removeAttribute('disabled');
      this.updateStartButton.removeAttribute('disabled');
      delete autosaves[this.autosaveID];
      autosaves[autosaveID] = true;
      this.autosaveID = autosaveID;
    }
    else {
      delete autosaves[autosaveID];
    }
    localStorage.setItem('autosaves', JSON.stringify(autosaves));
  }

  init(id) {
    try {
      if (id) {
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
          infojs.error(err);
        });
      }
      else {
        this.tack.addCallback(this.updateStart);
        this.tack.addCallback(this.updateEnd);
      }
      this.scrollIntoView({block: "start", inline: "start"});
      this.activity.focus();
    }
    catch(err) {
      infojs.error(err);
    }
  }

  save() {
    return new Promise((resolve, reject) => {
      this.entries = document.querySelector('entries-ui#New');
      if (!this.entries) {
        this.entries = new EntriesUI('New', appjs.updateScrollLinks);
        let cache_section = document.querySelector('#cache_section');
        this.scrollView.insertBefore(this.entries, cache_section);
        this.entries.scrollIntoView({block: "center", inline: "center"});
        this.entries.info = 'New Entries';
      }
      if (this.databaseID && !this.copy) {
        let oldStartString = (new Date(this.databaseID.substring(0, 24))).toString();
        this.db.get(this.databaseID).then((otherDoc) => {
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
                infojs.error(err);
                reject('Cannot delete entry with old start time.\nDiscard edit?'
                       + JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
              });
              // NOTE: Remove _deleted property before modified doc is put into db!
              // Else it would be created in a deleted state.
              delete otherDoc._deleted;
              // NOTE: Remove _rev property before new doc is put into db!
              delete otherDoc._rev;
              otherDoc._id = startDate.toJSON() + utilsjs.getRandom12HexDigits();
            }
          }
          else {
            reject('Cannot save modified entry with invalid start date.\nDiscard edit?');
            // FIXME: I need to understand chaining and nesting of promises.
            return;
          }
          // end may be left empty. endText is a valid date, else null.
          if (endText && endText != newStartString) {
            otherDoc.end = endText;
          }
          else {
            delete otherDoc.end;
          }
          if (this.isValidEntry(otherDoc)) {
            this.db.put(otherDoc).then((response) => {
              changedStart && utilsjs.updateEntriesElement(this.databaseID, 'start', utilsjs.formatStartDate(startDate));
              changedEnd && utilsjs.updateEntriesElement(this.databaseID, 'end', endText ? utilsjs.formatEndDate(endDate) : ' ');
              (changedStart || changedEnd) &&
                utilsjs.updateEntriesElement(this.databaseID, 'duration', endText ? utilsjs.reportDateTimeDiff(startDate, endDate) : ' ');
              changedActivity && utilsjs.updateEntriesElement(this.databaseID, 'activity', activityText);
              // document.getElementById(response.id).scrollIntoView({block: "center", inline: "center"});
              // Update id attribute to reflect new document id.
              // Fixes bug where future menu operations on replaced entry would not work.
              document.getElementById(this.databaseID).id = response.id;
              document.getElementById(response.id).classList.remove('deleted');
              resolve({ modified: response });
            }).catch((err) => {
              infojs.error(err);
              reject('Modified entry is valid but cannot be saved.\nPlease report this error.'
                     + JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
            });
          }
          else {
            reject('Modified entry is invalid. Please make suggested corrections.'
                   + JSON.stringify(otherDoc, Object.getOwnPropertyNames(otherDoc), 2));
          }
        }).catch((err) => {
          infojs.error(err);
          reject('Cannot get entry to be modified. Please report this error.'
                 + JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        });
      }
      else {
        var entry = {
          // activity: activity.textContent,
          activity: this.activity.value,
          _id: this.getDateTime(this.start).toJSON() + utilsjs.getRandom12HexDigits(),
        };
        // end may be left empty.
        if (this.end.value.length && this.end.value != this.start.value) {
          entry.end = this.getDateTime(this.end).toJSON();
        }
        if (this.isValidEntry(entry)) {
          this.db.put(entry).then((response) => {
            // Insert before the first entry
            let newEntry;
            if (this.copy && this.databaseID) {
              let beforeThisElement = document.getElementById(this.databaseID);
              newEntry = utilsjs.addNewEntry(entry, beforeThisElement.parentElement, beforeThisElement);
              infojs.info(`adding inside ${beforeThisElement.parentElement.id} before ${beforeThisElement.id}`);
            }
            else {
              newEntry = utilsjs.addNewEntry(entry, this.entries);
            }
            newEntry.activity.classList.add('changed');
            newEntry.start.classList.add('changed');
            newEntry.end.classList.add('changed');
            // NOTE: Too early, will scroll out of view when new entry UI is
            // no longer displayed in caller.
            // document.getElementById(response.id).scrollIntoView({block: "center", inline: "center"});
            resolve({ new: response });
          }).catch((err) => {
            //errors
            infojs.error(err);
            reject('New entry is valid but cannot be saved.\nPlease report this error.'
                   + JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
          });
        }
        else {
          infojs.info(entry);
          this.scrollIntoView({block: "center", inline: "center"});
          reject('New entry is invalid. Please make suggested corrections.'
                 + JSON.stringify(entry, Object.getOwnPropertyNames(entry), 2));
        }
      }
    });
  }
}

if (!customElements.get('new-entry')) {
  customElements.define('new-entry', NewEntryUI);
}

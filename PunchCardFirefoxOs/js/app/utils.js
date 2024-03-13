'use strict';

import * as infojs from './info.js';
import * as entryui from './entry-ui.js';

export let getRandom12HexDigits = () => {
  return (Math.floor(Math.random() * (2**48 - 1))).toString(16).padStart(12, '0');
};

// >> (new Date()).toLocaleString(navigator.languages, {
//      month: 'short',
//      hour: 'numeric',
//      minute: 'numeric',
//      second: 'numeric',
//      day: 'numeric',
//      weekday: 'short',
//      year: '2-digit',
//      timeZoneName: 'short'
//    })
// <- "Mi., 9. Sep. 15, 01:07:04 MESZ"
// >> navigator.languages
// <- Array [ "de", "en-US" ]
export let formatStartDate = (date) => {
  return date.toLocaleString();
};

if ('Intl' in window) {
  let idtf = new Intl.DateTimeFormat(navigator.languages, {
    year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short',
    hour: 'numeric', minute: 'numeric', second: 'numeric'
  });
  formatStartDate = (date) => {
    // return date.toLocaleString();
    // return date.toString().substring(0, 24);
    return idtf.format(date);
    // return Intl.DateTimeFormat(date, navigator.languages, {
    //   year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short',
    //   hour: 'numeric', minute: 'numeric', second: 'numeric'
    // });
    // NOTE: These following have bad performance even in Windows Desktop Firefox!
    // return date.toLocaleString(navigator.language);
    // return date.toLocaleString(navigator.languages);
  }
}

export let formatEndDate = (date) => {
  // return date.toString().substring(4, 24);
  // NOTE Make clear we use same format as for start date,
  // instead of duplicating implementation here.
  return formatStartDate(date);
}

export let updateEntriesElement = (id, selector, value) => {
  let updateItem = document.getElementById(id)[selector];
  if (updateItem.textContent != value) {
    updateItem.textContent = value;
    updateItem.classList.add('changed');
  }
  // NOTE: Just a nuisance, UI makes changes obvious.
  // if (window.confirm('Reload changes?')) {
  //   document.location.reload('force');
  // }
}

export let pad = (text, length, padding) => {
  padding = padding ? padding : '0';
  text += '';
  while (text.length < length) {
    text = padding + text;
  }
  return text;
}

export let reportDateTimeDiff = (d1, d2) => {
  let dt = d2.getTime() - d1.getTime(),
      milliSecondsPerDay = 24 * 3600000,
      dtDayFraction = dt % milliSecondsPerDay,
      dtHourFraction = dtDayFraction % 3600000,
      dtMinuteFraction = dtHourFraction % 60000,
      dty, dtd, dtdr, dth, dtm, dts;
  if (dt < 0) {
    dtd = Math.ceil(dt / milliSecondsPerDay);
    dty = Math.ceil(dtd / 365);
    dth = Math.ceil(dtDayFraction / 3600000);
    dtm = Math.ceil(dtHourFraction / 60000);
    dts = Math.ceil(dtMinuteFraction / 1000);
  }
  else {
    dtd = Math.floor(dt / milliSecondsPerDay);
    dty = Math.floor(dtd / 365);
    dth = Math.floor(dtDayFraction / 3600000);
    dtm = Math.floor(dtHourFraction / 60000);
    dts = Math.floor(dtMinuteFraction / 1000);
  }
  // delta time day remainder
  dtdr = dtd % 365;
  return (dt < 0 ? '' : '+') + (dty != 0 ? dty + 'y ' : '') + dtdr + 'd ' + pad(dth, 2) + 'h ' + pad(dtm, 2) + 'm ' + pad(dts, 2) + 's'
}

export let addNewEntry = function (doc, entries, before, addRevisionToElementId) {
  try {
    let entry = new entryui.EntryUI();
    if (addRevisionToElementId) {
      // NOTE _ is allowed in HTML id attribute and not used in my Date.toJSON() _id.
      entry.id = doc._id + '_' + doc._rev;
    }
    else {
      entry.id = doc._id;
    }
    let start = entry.start;
    let end = entry.end;
    let duration = entry.duration;
    let revisions = entry.revisions;
    let activity = entry.activity;
    // start.contentEditable = true;
    // end.contentEditable = true;
    // activity.contentEditable = true;
    let startDate = new Date(doc._id.substring(0, 24));
    if ('end' in doc) {
      let endDate = new Date(doc.end);
      // Legacy values from Sqlite database use 0 for undefined values
      // if (Math.abs(endDate.getTime()) >= 1000) {
        end.textContent = formatEndDate(endDate);
        duration.textContent = reportDateTimeDiff(startDate, endDate);
      // }
    }
    // Element needs some content to receive click event to bring up endMenu.
    if (end.textContent.length == 0) {
      end.textContent = ' ';
    }
    if (isNaN(startDate.getTime())) {
      start.textContent = ' ';
    }
    else {
      start.textContent = formatStartDate(startDate);
    }
    activity.textContent = doc.activity;
    if (activity.textContent.length == 0) {
      activity.textContent = ' ';
    }
    [
      activity,
      end,
      revisions,
      start
    ].forEach(function (elem) {
      // elem.classList.add('changed');
    });
    // start.setAttribute('contextmenu', 'start_menu');
    // start.addEventListener('contextmenu', function (event) {
    //   this.contextMenu.dataset.id = event.target.parentElement.id;
    // });
    // end.setAttribute('contextmenu', 'end_menu');
    // end.addEventListener('contextmenu', function (event) {
    //   this.contextMenu.dataset.id = event.target.parentElement.id;
    // });
    // activity.setAttribute('contextmenu', 'activity_menu');
    // activity.addEventListener('contextmenu', function (event) {
    //   this.contextMenu.dataset.id = event.target.parentElement.id;
    // });
    //         activity.addEventListener('focus', function (event) {
    //           event.target.removeAttribute('rows');
    //         });
    //         activity.addEventListener('blur', function (event) {
    //           event.target.setAttribute('rows', 1);
    //         });
    // entry.appendChild(start);
    // entry.appendChild(end);

    // db.get(doc._id, {
    //   rev: doc._rev,
    //   revs: true,
    //   open_revs: "all"
    // }).then(function (otherDoc) {
    //   revisions.textContent = otherDoc[0].ok._revisions.ids.length + ' revs';
    //   // otherDoc[0].ok._revisions.ids.forEach(function (rev) {
    //   //   // infojs.info({ _revisions: [ info.doc._rev, otherDoc[0].ok._revisions.start + '-' + rev ]}, entries);
    //   //   db.get(otherDoc[0].ok._id, {
    //   //     open_revs: [otherDoc[0].ok._revisions.start + '-' + rev]
    //   //   }).then(function (otherDoc) {
    //   //     // db.get(otherDoc[0].ok._id, rev).then(function (otherDoc) {
    //   //     if (otherDoc[0].missing || otherDoc[0].ok._deleted) {
    //   //       // if (otherDoc[0].ok && !otherDoc[0].ok._deleted) {
    //   //     }
    //   //     else {
    //   //     }
    //   //     infojs.info({ 'rev': otherDoc }, entries);
    //   //   }).catch(function (err) {
    //   //     infojs.info({rev_error: err}, entries);
    //   //   });
    //   // });
    // }).catch(function (err) {
    //   infojs.error({get_error:err}, entries);
    // });
    if (before) {
      // Insert before the first entry we find, if any.
      entries.insertBefore(entry, before);
    }
    else {
      entries.appendChild(entry);
      // entries.insertAdjacentElement('afterend', entry);
    }
    return entry;
  }
  catch (err) {
    // stack is a non-standard property!
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack
    // { get_error: [ err.message, err.stack.split('\n') ] }
    infojs.error(err, entries);
  }
}

export let positionMenu = function(menu, event) {
  let xProp, yProp;
  let xOffset, yOffset;
  if (event.clientX > window.innerWidth * 0.8) {
    xProp = 'right';
    menu.style['left'] = ``;
    xOffset = window.innerWidth - event.clientX + 10;
  }
  else {
    xProp = 'left';
    menu.style['right'] = ``;
    xOffset = event.clientX + 10;
  }
  if (event.clientY > window.innerHeight * 0.8) {
    yProp = 'bottom';
    menu.style['top'] = ``;
    yOffset = window.innerHeight - event.clientY + 10;
  }
  else {
    yProp = 'top';
    menu.style['bottom'] = ``;
    yOffset = event.clientY + 10;
  }
  menu.style.display = 'block';
  menu.style[xProp] = `${xOffset}px`;
  menu.style[yProp] = `${yOffset}px`;
}

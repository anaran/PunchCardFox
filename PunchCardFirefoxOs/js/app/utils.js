'use strict';
define(function (require) {
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
  var idtf = new Intl.DateTimeFormat(navigator.languages, {
    year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'narrow',
    hour: 'numeric', minute: 'numeric', second: 'numeric'
  });
  var formatStartDate = function (date) {
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
  };
  var formatEndDate = function (date) {
    // return date.toString().substring(4, 24);
    // NOTE Make clear we use same format as for start date,
    // instead of duplicating implementation here.
    return formatStartDate(date);
  };
  var updateEntriesElement = function (id, selector, value) {
    var updateItem = document.getElementById(id).querySelector(selector);
    updateItem.textContent = value;
    updateItem.classList.add('changed');
    // NOTE: Just a nuisance, UI makes changes obvious.
    // if (window.confirm('Reload changes?')) {
    //   document.location.reload('force');
    // }
  };
  var pad = function (text, length, padding) {
    padding = padding ? padding : '0';
    text += '';
    while (text.length < length) {
      text = padding + text;
    }
    return text;
  };
  var reportDateTimeDiff = function (d1, d2) {
    var dt = d2.getTime() - d1.getTime(),
        milliSecondsPerDay = 24 * 3600000,
        dtDayFraction = dt % milliSecondsPerDay,
        dtHourFraction = dtDayFraction % 3600000,
        dtMinuteFraction = dtHourFraction % 60000,
        dtd, dth, dtm, dts;
    if (dt < 0) {
      dtd = Math.ceil(dt / milliSecondsPerDay);
      dth = Math.ceil(dtDayFraction / 3600000);
      dtm = Math.ceil(dtHourFraction / 60000);
      dts = Math.ceil(dtMinuteFraction / 1000);
    }
    else {
      dtd = Math.floor(dt / milliSecondsPerDay);
      dth = Math.floor(dtDayFraction / 3600000);
      dtm = Math.floor(dtHourFraction / 60000);
      dts = Math.floor(dtMinuteFraction / 1000);
    }
    return (dt < 0 ? '' : '+') + dtd + 'd ' + pad(dth, 2) + 'h ' + pad(dtm, 2) + 'm ' + pad(dts, 2) + 's'
  };
  // FIXME: this module must not have a hardcoded pouchdb reference!
  var db = new PouchDB('punchcard3');
  var addNewEntry = function (doc, entries, before) {
    var entry = document.createElement('div');
    // var span = document.createElement('span');
    entry.id = doc._id;
    entry.className = 'entry';
    var start = document.createElement('pre');
    var end = document.createElement('pre');
    var duration = document.createElement('pre');
    var revisions = document.createElement('pre');
    var activity = document.createElement('pre');
    // start.contentEditable = true;
    // end.contentEditable = true;
    // activity.contentEditable = true;
    // start.setAttribute('readonly', true);
    // end.setAttribute('readonly', true);
    // activity.setAttribute('readonly', true);
    start.classList.add('start');
    end.classList.add('end');
    duration.classList.add('duration');
    revisions.classList.add('revisions');
    activity.classList.add('activity');
    var startDate = new Date(doc.start || doc.clockin_ms);
    var endDate = new Date(doc.end || doc.clockout_ms);
    start.textContent = formatStartDate(startDate);
    end.textContent = formatEndDate(endDate);
    duration.textContent = reportDateTimeDiff(startDate, endDate);
    activity.textContent = doc.activity;
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
    entry.appendChild(start);
    entry.appendChild(end);
    // entry.appendChild(span);
    entry.appendChild(duration);

    db.get(doc._id, {
      rev: doc._rev,
      revs: true,
      open_revs: "all"
    }).then(function (otherDoc) {
      revisions.textContent = otherDoc[0].ok._revisions.ids.length + ' revs';
      // otherDoc[0].ok._revisions.ids.forEach(function (rev) {
      //   // infojs({ _revisions: [ info.doc._rev, otherDoc[0].ok._revisions.start + '-' + rev ]}, entries);
      //   db.get(otherDoc[0].ok._id, {
      //     open_revs: [otherDoc[0].ok._revisions.start + '-' + rev]
      //   }).then(function (otherDoc) {
      //     // db.get(otherDoc[0].ok._id, rev).then(function (otherDoc) {
      //     if (otherDoc[0].missing || otherDoc[0].ok._deleted) {
      //       // if (otherDoc[0].ok && !otherDoc[0].ok._deleted) {
      //     }
      //     else {
      //     }
      //     infojs({ 'rev': otherDoc }, entries);
      //   }).catch(function (err) {
      //     infojs({rev_error: err}, entries);
      //   });
      // });
    }).catch(function (err) {
      infojs({get_error:err}, entries);
    });
    entry.appendChild(revisions);

    entry.appendChild(activity);
    if (before) {
      // Insert before the first entry we find, if any.
      entries.insertBefore(entry, before);
    }
    else {
      entries.appendChild(entry);
    }
    return entry;
  };
  return {
    formatEndDate: formatEndDate,
    formatStartDate: formatStartDate,
    updateEntriesElement: updateEntriesElement,
    pad: pad,
    reportDateTimeDiff: reportDateTimeDiff,
    addNewEntry: addNewEntry
  };
});

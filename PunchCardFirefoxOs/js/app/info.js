'use strict';

function getAllPropertyNames(obj, props = []) {
  // console.log(obj.constructor.name, props);
  if (obj.constructor.name == 'Object') {
    // console.log(obj.constructor.name, props);
    return props.length ? props : null;
    // return props;
  } else {
    // console.log(obj, props);
    return getAllPropertyNames(Object.getPrototypeOf(obj), props.concat(Object.getOwnPropertyNames(obj)));
  }
}

export function infojs(info, element, append) {
  try {
    var pre = document.createElement('pre');
    pre.classList.add('info');
    // pre.contentEditable = true;
    pre.textContent = `"${(new Date).toJSON()}": ${JSON.stringify(info, getAllPropertyNames(info), 2)}`;
    pre.addEventListener('click', event => {
      if (event.target.classList.contains('selected')) {
        event.target.classList.remove('selected');
      }
      else {
        event.target.classList.add('selected');
      }
      // event.preventDefault();
      pre.contentEditable = false;
      // let s = window.getSelection();
      // s.selectAllChildren(event.target);
    });
    // pre.addEventListener('focus', event => {
    //   event.preventDefault();
    //   pre.contentEditable = false;
    //   let s = window.getSelection();
    //   s.selectAllChildren(event.target);
    // });
    // pre.addEventListener('blur', event => {
    //   pre.contentEditable = true;
    //   // let s = window.getSelection();
    //   // s.selectAllChildren(event.target);
    // });
    // pre.addEventListener('input', event => {
    //   event.preventDefault();
    // }, true);
    if (append) {
      element.appendChild(pre);
    }
    else {
      element.insertBefore(pre, element.firstElementChild);
    }
  }
  catch (e) {
    window.alert(pre.textContent);
    window.alert(JSON.stringify(e, getAllPropertyNames(e), 2));
  }
};

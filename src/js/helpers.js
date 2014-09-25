var 
  _window = window,
  _document = _window.document,

  // When Safari stops producing rounding errors and starts handling 
  // sub-pixels like Chrome & Firefox, this line can be removed.
  // Source: https://github.com/conditionizr/conditionizr/blob/master/detects/safari.js
  _isSafari = /Constructor/.test(_window.HTMLElement),

  find = function(selector, context) {
    return (context || _document).querySelector(selector);
  },

  findAll = function(selector, context) {
    return (context || _document).querySelectorAll(selector);
  },

  hasOwnProperty = Object.prototype.hasOwnProperty,
  slice = Array.prototype.slice,

  error = function(msg) {
    throw new Error(msg);
  },

  merge = function() {
    var 
      source,
      prop,
      i = 0,
      len = arguments.length;

    var result = {};

    for (i, len; i < len; i += 1) {
      source = arguments[i];

      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
          result[prop] = source[prop];
        }
      }
    }

    return result;
  },

  on = function(element, type, callback) {
    var types;

    if (!element || !type || !callback) { return; }

    if (element.addEventListener) {
      types = type.split(' ');

      if (types.length > 1) {
        types.forEach(function(t) {
          element.addEventListener(t, callback, false);
        });
      } else {
        element.addEventListener(type, callback, false);
      }
    }
  },

  off = function(element, type, callback) {
    var types;

    if (!element || !type || !callback) { return; }

    if (element.removeEventListener) {
      types = type.split(' ');

      if (types.length > 1) {
        types.forEach(function(t) {
          element.removeEventListener(t, callback, false);
        });
      } else {
        element.removeEventListener(type, callback, false);
      }
    }
  },

  hide = function(element) { element.style.display = 'none'; },
  showBlock = function(element) { element.style.display = 'block'; },

  getPrefix = function() {
    var 
      prefixes = ['Webkit', 'Moz', 'O', 'ms'],
      style = _document.createElement('div').style,
      property = 'Transform',
      i = 0, len = prefixes.length;

    for(i; i < len; i += 1) {
      if((prefixes[i] + property) in style) {
        return prefixes[i];
      }
    }
  },

  cssPrefix = function(prop) {
    var prefix = getPrefix();

    if (prefix) {
      return prefix + prop[0].toUpperCase() + prop.slice(1);
    } else {
      return prop;
    }
  },

  cssCalc = function() {
    var 
      el = _document.createElement('div'),
      result = { support: false },
      prefixName = getPrefix() || '',
      prefix = ('-' + prefixName + '-').toLowerCase();

    el.style.cssText = 'width:' + prefix + 'calc(10px)';

    // If doesn't support the prefixed version, try the non-prefixed one.
    if (!el.style.length) {
      prefix = '';
      el.style.cssText = 'width:calc(10px)';
    }

    if (el.style.length) {
      result.support = true;
      result.prefix = prefix;
    }

    return result;
  },

  _getStyles = function(elem) {
    return _window.getComputedStyle(elem, null);
  },

  _curCSS = function(prop, computed) {
    if (computed) {
      return computed.getPropertyValue(prop) || computed[prop];
    }
  },

  _prefixedTransitionEnd = function() {
    var el = _document.createElement('div'), prop;
    var names = {
      'WebkitTransition': 'webkitTransitionEnd',
      'MozTransition': 'transitionend',
      'OTransition': 'otransitionend',
      'transition': 'transitionend'
    };

    for(prop in names){
      if(el.style[prop] !== undefined) {
        return names[prop];
      }
    }
  };

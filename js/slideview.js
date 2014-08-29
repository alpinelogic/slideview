// UA sniffer - include if you care to fix rounding erros in safari desktop.
// Borrowed from jQuery 1.8.3
// http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.js
var ua = (function() {
  var matched, browser;

  // Use of jQuery.browser is frowned upon.
  // More details: http://api.jquery.com/jQuery.browser
  // jQuery.uaMatch maintained for back-compat
  var _uaMatch = function(ua) {
    ua = ua.toLowerCase();

    var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
      /(webkit)[ \/]([\w.]+)/.exec(ua) ||
      /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
      /(msie) ([\w.]+)/.exec(ua) ||
      ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
      [];

    return {
      browser: match[ 1 ] || "",
      version: match[ 2 ] || "0"
    };
  };

  matched = _uaMatch(navigator.userAgent);
  browser = {};

  if (matched.browser) {
    browser[matched.browser] = true;
    browser.version = matched.version;
  }

  // Chrome is Webkit, but Webkit is also Safari.
  if (browser.chrome) {
    browser.webkit = true;
  } else if (browser.webkit) {
    browser.safari = true;
  }

  return browser;
})();


/**
 * Slideview (Beta) - v0.7.0
 * A tiny VanillaJS lib for responsive carousels.
 * No crazy features!
 */
Slideview = (function(window) {

var 
  _window = window,
  _document = _window.document,

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

    if (element.addEventListener) {
      types = type.split(' ')

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

    if (element.removeEventListener) {
      types = type.split(' ')

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

  cssPrefix = function(prop) {
    var 
      prefixes = ['Webkit', 'Moz', 'O', 'ms'],
      style = document.createElement('div').style,
      property = prop[0].toUpperCase() + prop.slice(1),
      i = 0, len = prefixes.length;

    for(i; i < len; i += 1) {
      if((prefixes[i] + property) in style) {
        return prefixes[i] + property;
      }
    }
  },

  _getStyles = function(elem) {
    return window.getComputedStyle(elem, null);
  },

  _curCSS = function(prop, computed) {
    if (computed) {
      return computed.getPropertyValue(prop) || computed[prop];
    }
  },

  _isSafari = function() {
    if (!window.ua) { return; }
    return ua.safari;
  },

  // Constants
  SELECTORS = {
    plugin: '.slideview',
    slide: '.slide',
    offscreen: '.offscreen',
    nav: '.nav',
    prev: '.prev',
    next: '.next'
  };

  // Default settings.
  Slideview.defaults = {
    slidesToShow: 4,
    resizeDelay: 150
  };

  function Slideview(selector, userOptions) {
    if (!selector || selector.indexOf('#') === -1) {
      error('Slideview: You must provide and ID selector!');
      return;
    }

    // Elements
    this.element = find(selector);
    this.offscreenContainer = find(SELECTORS.offscreen, this.element);
    this.slides = slice.call(findAll(SELECTORS.slide, this.element));
    this.nextBtn = find(SELECTORS.next, this.element);
    this.prevBtn = find(SELECTORS.prev, this.element);
    
    // Meta
    this._index = this._currentOffset = 0;
    this._total = (this.slides && this.slides.length) || 0;

    // Merge defaults with user options
    this.options = merge(Slideview.defaults, userOptions);

    // Math & Dimension related vars
    this._hundredPercent = 100;
    this._increaseFactor = this._total / this.options.slidesToShow;
    this._offscreenWidth = this._hundredPercent * this._increaseFactor;
    this._slideWidth = this._hundredPercent / this._total;
    // this._initialSlideWidth = this._onscreenPercent / this.options.slidesToShow;
    // this._offscreenWidth = this._total * this._initialSlideWidth;
    // this._slideWidth = this._initialSlideWidth / (this._offscreenWidth / this._onscreenPercent);

    this._init();
  }
  
  Slideview.prototype = {
    constructor: Slideview,

    _init: function() {
      this._setWidths();
      this._onResize();
      this._onClick();
    },

    // Safari gets this performance hit because of rounding erros we have to fix on the slides.
    // This function won't run when the `ua` helper isn't included with the lib.
    _onResize: function() {
      if (!_isSafari()) { return; }
      var self = this, timer;

      on(_window, 'resize',  function(e) {
        this.clearTimeout(timer);
        timer = this.setTimeout(self._setWidths.bind(self), self.options.resizeDelay);
      });
    },

    getSlideWidth: function() { return this._slideWidth; },
    getOffscreenWidth: function() { return this._offscreenWidth; },

    _setSlideWidth: function(slide) {
      var 
        computed = _getStyles(slide),
        marginLeft = _curCSS('marginLeft', computed),
        marginRight = _curCSS('marginRight', computed),
        margins = parseFloat(marginLeft) + parseFloat(marginRight),
        slideWidth = this.getSlideWidth();

        // Assumes that both marginLeft & marginRight have 
        // the same unit, which should be a percent.
        // ------------------------------------------------
        // Set the slide width, minus any margins.
        slide.style.width = slideWidth - (margins || 0)  + '%';
    },

    _tryFixRoundingError: function() {
      var parentWidth = _curCSS('width', _getStyles(this.element.parentNode));
      this.element.style.width = parseFloat(parentWidth) - parseFloat(parentWidth) % this.options.slidesToShow + 'px';

      console.log(parseFloat(parentWidth) - parseFloat(parentWidth) % this.options.slidesToShow);
    },
    
    _setWidths: function() {
      var self = this;

      // At least in Safari there is a rounding error, so 
      // we try to fix it by removing the exess pixel(s).
      if (_isSafari()) {
        this._tryFixRoundingError();
      }

      hide(this.offscreenContainer);
      this.offscreenContainer.style.width = this.getOffscreenWidth() + '%';

      this.slides.forEach(function(slide) {
        self._setSlideWidth(slide);
      });

      this.show(this._index);
      showBlock(this.offscreenContainer);
    },

    _onClick: function() {
      var self = this;

      on(this.prevBtn, 'click', function(e) {
        e && e.preventDefault();
        self.show(self._index - 1);
      });

      on(this.nextBtn, 'click', function(e) {
        e && e.preventDefault();
        self.show(self._index + 1);
      });
    },

    currentSlide: function() {
      return this.slides[this._index];
    },

    _applyActive: function() {
      this.slides.forEach(function(slide) {
        slide.classList.remove('active');
      });

      this.currentSlide().classList.add('active');
    },

    _setIndex: function(index) {
      this._index = Math.min(Math.max(0, index), this._total - 1);
    },

    _move: function(offset) {
      this.offscreenContainer.style[cssPrefix('transform')] = 'translate(' + (-offset) + '%, 0)';
    },

    show: function(index) {
      this._setIndex(index);

      var slideWidthPercent = this.getSlideWidth();

      if(this._index === 0) {
        this._currentOffset = 0;
      } else if(this._index > this._total - this.options.slidesToShow) {
        this._currentOffset = this._currentOffset;
        this._setIndex(this._total - this.options.slidesToShow);
      } else {
        this._currentOffset = slideWidthPercent * this._index;
      }

      this._move(this._currentOffset);
      this._applyActive();
    }
  };

  return Slideview;
}(window));

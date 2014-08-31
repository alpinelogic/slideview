/**
 * Slideview (Beta) - v0.7.2
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

  getPrefix = function() {
    var 
      prefixes = ['Webkit', 'Moz', 'O', 'ms'],
      style = document.createElement('div').style,
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

  supportsCssCalc = function() {
    var el = document.createElement('div');
    el.style.cssText = 'width: -' + (getPrefix() || '').toLowerCase()  +'-calc(10px)';

    return !!el.style.length;
  },

  _getStyles = function(elem) {
    return window.getComputedStyle(elem, null);
  },

  _curCSS = function(prop, computed) {
    if (computed) {
      return computed.getPropertyValue(prop) || computed[prop];
    }
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
    resizeDelay: 150 // only for Browsers that may have rounding errors
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

    this._init();
  }

  Slideview.prototype = {
    constructor: Slideview,

    _init: function() {
      this._setWidths();
      this._attachResize();
      this._attachClick();
    },

    _attachResize: function() {
      var self = this, timer;

      this._tryFixRoundingError();

      on(_window, 'resize',  function(e) {
        this.clearTimeout(timer);
        timer = this.setTimeout(self._handleResize.bind(self), self.options.resizeDelay);
      });
    },

    _handleResize: function() {
      if (this._roundingError === true) {
        this._tryFixRoundingError();
      }
    },

    // Tries to fix rounding errors (mostly Safari) - just a try, no guarantee.
    _tryFixRoundingError: function() {
      var 
        parentWidth = _curCSS('width', _getStyles(this.element.parentNode)),
        excessPixels = parseFloat(parentWidth) % this.options.slidesToShow;

        if (excessPixels > 0) {
          this._roundingError = true;
          this.element.style.width = parseFloat(parentWidth) - excessPixels + 'px';
        } else {
          this._roundingError = false;
          this.element.style.width =  '';
        }
    },

    getSlideWidth: function() {
      return this._slideWidth;
    },

    getOffscreenWidth: function() {
      return this._offscreenWidth;
    },

    _setSlideWidth: function(slide) {
      var 
        computed = _getStyles(slide),
        marginLeft = _curCSS('marginLeft', computed),
        marginRight = _curCSS('marginRight', computed),
        margins = parseFloat(marginLeft) + parseFloat(marginRight),
        slideWidth = this.getSlideWidth(),
        prefix = (getPrefix() || '').toLowerCase();

        // Subtract possible margins with CSS `calc()`.
        if (margins > 0 && prefix && supportsCssCalc()) {
          slide.style.width = '-' + getPrefix() + '-calc(' + slideWidth + '% - ' + marginLeft + ' - ' + marginRight + ')';
        } else {
          // When css `calc()` isn't supported margins are assumed to be in percent.
          slide.style.width = slideWidth - (margins || 0)  + '%';
        }
    },

    _setWidths: function() {
      var self = this;

      hide(this.offscreenContainer);
      this.offscreenContainer.style.width = this.getOffscreenWidth() + '%';

      this.slides.forEach(function(slide) {
        self._setSlideWidth(slide);
      });

      this.show(this._index);
      showBlock(this.offscreenContainer);
    },

    _attachClick: function() {
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

    _applyClasses: function() {
      this.slides.forEach(function(slide) {
        slide.classList.remove('active');
        slide.classList.remove('next-slide');
        slide.classList.remove('last-view-slide');
      });

      this.currentSlide().classList.add('active');
      this.slides[this._index + this.options.slidesToShow - 1].classList.add('last-view-slide');
      this.slides[this._index + this.options.slidesToShow].classList.add('next-slide');
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
      this._applyClasses();
    }
  };

  return Slideview;
}(window));

/**
 *   _____ _ _     _            _
 *  / ____| (_)   | |          (_)
 * | (___ | |_  __| | _____   ___  _____      __
 *  \___ \| | |/ _` |/ _ \ \ / / |/ _ \ \ /\ / /
 *  ____) | | | (_| |  __/\ V /| |  __/\ V  V /
 * |_____/|_|_|\__,_|\___| \_/ |_|\___| \_/\_/
 * ---------------------------------------------
 * Slideview (v0.7.6)
 * A tiny VanillaJS lib for responsive sliders.
 * No crazy features!
 */
!(function(window) {
  'use strict';

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

  // Constants
  var SELECTORS = {
    plugin: '.slideview',
    slide: '.slide',
    offscreen: '.offscreen',
    nav: '.nav',
    prev: '.prev',
    next: '.next'
  };  

  // Default options.
  Slideview.defaults = {
    slidesToShow: 4,

    // When `true` it slides back to the 1st slide when reaching the end
    endSlideBack: false,

    // Only for Safari because of rounding errors
    // Basically it stops rounding errors from compounding when moving through the slides
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

    // Merge defaults with user options
    this.options = merge(Slideview.defaults, userOptions);

    // Meta
    this._index = this._currentOffset = 0;
    this._total = (this.slides && this.slides.length) || 0;

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
      _isSafari && this._attachResize();
      this._attachClick();
      this._attachTransitionEnd();
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
      this._tryFixRoundingError();
    },

    // Tries to fix rounding errors (mostly Safari) - just a try, no guarantee.
    _tryFixRoundingError: function() {
      var 
        parentWidth = _curCSS('width', _getStyles(this.element.parentNode)),
        excessPixels = parseFloat(parentWidth) % this.options.slidesToShow;      

      if (excessPixels > 0) {
        this.element.style.width = parseFloat(parentWidth) - excessPixels + 'px';
      } else {
        this.element.style.width =  '';
      }
    },

    _attachClick: function() {
      var self = this;

      on(this.prevBtn, 'click', function(e) {
        e && e.preventDefault();
        self.show(self._index - 1);
      });

      on(this.nextBtn, 'click', function(e) {
        e && e.preventDefault();
        var hasReachedEnd = (self._index + 1 > self._total - self.options.slidesToShow);

        if (self.options.endSlideBack && hasReachedEnd) {
          return self.slideToFirst();
        }

        self.show(self._index + 1);
      });
    },

    _attachTransitionEnd: function() {
      this._transitionend = {
        type: _prefixedTransitionEnd(),
        executed: false,
        callback: this._handleTransitionEnd.bind(this)
      };

      on(this.offscreenContainer, this._transitionend.type, this._transitionend.callback);
    },

    _handleTransitionEnd: function(e) {
      e && e.stopPropagation();
      var self;

      if (e && e.propertyName === 'transform') {
        self = this;

        slice.call(this.element.classList).forEach(function(name) {
          if (name === 'sliding' || name === 'slide-to-first' || name === 'slide-to-last') {
            self.element.classList.remove(name);
          }
        });

        this._transitionend.executed = true;
      }
    },

    getSlideWidth: function() {
      return this._slideWidth;
    },

    getOffscreenWidth: function() {
      return this._offscreenWidth;
    },

    currentSlide: function() {
      return this.slides[this._index];
    },

    _setSlideWidth: function(slide) {
      var 
        computed = _getStyles(slide),
        marginLeft = _curCSS('marginLeft', computed),
        marginRight = _curCSS('marginRight', computed),
        margins = parseFloat(marginLeft) + parseFloat(marginRight),
        slideWidth = this.getSlideWidth(),
        csscalc = cssCalc(),
        calcRule;

      // Subtract possible margins with CSS `calc()`.
      if (margins > 0 && csscalc.support) {
        calcRule = 'calc(' + slideWidth + '% - ' + marginLeft + ' - ' + marginRight + ')';
        slide.style.width = csscalc.prefix + calcRule;
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

    _setIndex: function(index) {
      this._index = Math.min(Math.max(0, index), this._total - 1);
    },

    _applyClasses: function() {
      var nextSlide;

      this.slides.forEach(function(slide) {
        slide.classList.remove('active');
        slide.classList.remove('next-slide');
        slide.classList.remove('last-view-slide');
      });

      this.currentSlide().classList.add('active');
      this.slides[this._index + this.options.slidesToShow - 1].classList.add('last-view-slide');

      nextSlide = this.slides[this._index + this.options.slidesToShow];
      nextSlide && nextSlide.classList.add('next-slide');
    },

    _move: function() {
      var offset = this._currentOffset === 0 ? 0 : this._currentOffset * -1;

      if (this._transitionend) {
        this.element.classList.add('sliding');
        this._transitionend.executed = false;
      }
      
      this.offscreenContainer.style[cssPrefix('transform')] = 'translate(' + offset + '%, 0)';
      this._applyClasses();
    },

    slideToFirst: function() {
      if (this._index === 0) {
        return;
      }

      this._setIndex(this._currentOffset = 0);
      this.element.classList.add('slide-to-first');
      this._move();
    },

    slideToLast: function() {
      var index = this._total - this.options.slidesToShow;

      if (this._index === index) {
        return;
      }

      this._currentOffset = index * this.getSlideWidth();

      this._setIndex(index);
      this.element.classList.add('slide-to-last');
      this._move();
    },

    show: function(index) {
      var slideWidthPercent = this.getSlideWidth();

      this._index !== index && this._setIndex(index);

      if(this._index === 0) {
        this._currentOffset = 0;
      } else if(this._index > this._total - this.options.slidesToShow) {
        this._currentOffset = slideWidthPercent * (this._total - this.options.slidesToShow);
        this._setIndex(this._total - this.options.slidesToShow);
      } else {
        this._currentOffset = slideWidthPercent * this._index;
      }

      this._move();
    }
  };

  // Export
  _window.Slideview = Slideview;
}(window));

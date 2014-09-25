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

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

    // when `true` it slides back to the 1st slide when reaching the end
    endSlideBack: false,

    // only for Browsers that may have rounding errors
    resizeDelay: 150
  };

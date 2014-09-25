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

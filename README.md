Slideview.js
=========

Slideview is a tiny JS lib for responsive carousel-like sliders.

### Why another slider?
Because every content slider I have tried exeeds 1,000 lines of code. If you only need one feature instead of 99 and you want to support only modern Browsers (IE10+), then Slideview may work for you. IE9 can be supported simply by using any polyfill for the `classList` API.

If non-modern browsers are a concern, then try the Slideview jQuery plugin (_coming soon_).


### Features
* Tiny/lightweight lib (a little over 250 lines of code for the VanillaJS version).
* Sliding effect happens with a simple 2D CSS transition.
* In contrast to many other sliders, Slideview.js uses percentages for all of its elements. This means that we don't have to run any JS code when the Browser window resizes like other sliders do. You initialize Slideview once and the slides get resized by the Browser automatically after that.
* Simple public API to move the slides programmatically.
* Easily stylable with CSS - no default styling is assumed!
* 2 separate libs: plain JavaScript & a jQuery plugin (_jquery plugin coming soon_).
* Free as in "free beer".

**Warning**: Slideview doesn't try to be perfect for every Browser and doesn't try to fix pixel rounding issues in certain Browsers (_except for Safari Desktop & only if you choose to include the Browser sniffing helper_).


### Docs & Demo

<http://istocode.github.io/slideview/>

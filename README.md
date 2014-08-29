Slideview.js
=========

Slideview is a tiny JS lib for responsive carousel-like sliders.

## Why another slider?
Because every content slider I have tried exeeds 1,000 lines of code. If you only need one feature instead of 99 and you want to support only modern Browsers (IE10+), then Slideview may work for you.
If non-modern browsers are a concern, then try the Slideview jQuery plugin.

## Features
* Tiny/lightweight lib (about 250 lines of code for the VanillaJS version & about 140 lines for the jQuery plugin).
* Sliding with CSS transitions.
* All slides use percent units, which means that we don't run any JS code when the Browser window resizes (_except for Safari when choosing so_). The slides automatically get resized by the Browser.
* Public API to move the slides programmatically.
* Easily stylable via CSS.
* 2 separate libs: Plain JavaScript & a jQuery plugin.
* Free as in "free beer".

**Warning**: Slideview doesn't try to be perfect for every Browser and doesn't try to fix pixel rounding issues in certain Browsers (_except for Safari Desktop & only if you choose to include the Browser sniffing helper_).

## Docs & Demo

<http://istocode.github.io/slideview/>

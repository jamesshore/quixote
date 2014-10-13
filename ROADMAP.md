# Quixote Roadmap

## Release Ideas

* Basic DOM manipulation; raw position and style information
* "Cooked" absolute position info; initial assertion API
* Positioning relative to other elements
* Positioning relative to page
* Initial "cooked" styling (colors?)
* ...more TBD


## Current Feature: Basic DOM Manipulation

Work remaining:

* `frame.reset()`
* `element.getRawStyle()`
* `element.getRawPosition()`
* `frame.scrollTo()`
* `quixote.createFrame()`
  * load frame from URL
* ...more TBD


## To Do

* QElement signature checking
* Factor out functionName() (duplicated in ensure.js and assert.js)
* Factor out duplication of message variable manipulation in assert.js
* Integrate


## Future / Off-camera

* Get IE 8 ensure exceptions to show stack trace
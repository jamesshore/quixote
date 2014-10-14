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

* `quixote.createFrame()`


## To Do

* Reset stylesheet link
* "Reset" needs to work properly with src HTML


## Future / Off-camera

* Get IE 8 ensure exceptions to show stack trace
* Factor out functionName() (duplicated in ensure.js and assert.js)
* Factor out duplication of message variable manipulation in assert.js
* Get assert.deepEqual to show objects
* Document API so far
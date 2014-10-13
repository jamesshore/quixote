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
  * load frame from URL
  * create empty frame
* `frame.getElement()`
  * ...by ID
  * ...by selector
* `frame.reset()`
* `frame.destroy()`
* `element.getRawStyle()`
* `element.getRawPosition()`
* `frame.scrollTo()`
* ...more TBD


## To Do

* Frame: factor out repeated this._domElement.contentDocument
* QElement signature checking
* Factor out functionName() (duplicated in ensure.js and assert.js)
* Factor out duplication of message variable manipulation in assert.js
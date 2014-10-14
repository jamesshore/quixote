# Quixote Roadmap

## Release Ideas

* **✔ v0.1** Basic DOM manipulation; raw position and style information
* "Cooked" absolute position info; initial assertion API
* Positioning relative to other elements
* Positioning relative to page
* Initial "cooked" styling (colors?)
* Improve Frame.create() API to be more convenient in before()?
* ...more TBD


## Current Feature: Initial Assertion API


## To Do
* Frame tests need to clean up after themselves; a lot of them create a frame without destroying it


## Future / Off-camera

* Get IE 8 ensure exceptions to show stack trace
* Factor out functionName() (duplicated in ensure.js and assert.js)
* Factor out duplication of message variable manipulation in assert.js
* Get assert.deepEqual to show objects
* Document API so far
* frame.hasElement() or frame.getElementList()?
* Can't create frame with stylesheet AND src document without creating error on iOS Safari (23px???)
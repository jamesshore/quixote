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

```javascript
element.diff({
  top: 13,
  bottom: 40
});
```

## To Do
* How do we use ensure.signature without creating a circular dependency?
* Modify ensure to give better error message when comparison type is not a constructor
* diff() should describe element
* Get IE8 working with ElementEdge

* Frame tests need to clean up after themselves; a lot of them create a frame without destroying it
* Rename `Frame` to `QFrame`?
* Should frame.remove() cause additional frame method calls to fail fast?
* Should frame.toDomElement() cause frame.reset() to fail fast (because it can't guarantee a safe reset)?


## Future / Off-camera

* Get IE 8 ensure exceptions to show stack trace
* Factor out functionName() (duplicated in ensure.js and assert.js)
* Factor out duplication of message variable manipulation in assert.js
* Get assert.deepEqual to show objects
* Document API so far
* frame.hasElement() or frame.getElementList()?
* Can't create frame with stylesheet AND src document without creating error on iOS Safari (23px???)
* watch.js rebuilds too often or not enough
# Quixote Roadmap

## Release Ideas

* **✔ v0.1** Basic DOM manipulation; raw position and style information
* **✔ v0.2** "Cooked" absolute position info; initial assertion API
* Positioning relative to other elements
* Positioning relative to page
* Initial "cooked" styling (colors?)
* ...more TBD


## Current Feature: Relative Positioning

* Relative position comparisons (compare left edge to right edge)
* Offset position comparisons (compare left edge to right edge + 10 px)
* middle and center
* height and width
* fractional height and width

```javascript
element.diff({
  top: foo.top,
  bottom: bar.middle
  left: baz.left.plus(10)
  right: baz.left.plus(element.width)
});
```

## To Do

* Test and fix hardcoded 'top' in ElementEdge.diff 'number' path
* Fail fast with non-sensical comparisons like top to left.
* Constraints need to describe themselves
* Function to resolve ElementEdge? e.g., ElementEdge.is()
* Need polymorphism in ElementEdge.diff()?


## Future Features
* width and height constraints
* Should width and height go inside Frame's "options" object?


## Future To Do / Off-camera

* Should frame.toDomElement() cause frame.reset() to fail fast (because it can't guarantee a safe reset)?
* How do we use ensure.signature in element_edge.js without creating a circular dependency?
* Rename `Frame` to `QFrame`?
* Get IE 8 ensure exceptions to show stack trace
* Factor out functionName() (duplicated in ensure.js and assert.js)
* Factor out duplication of message variable manipulation in assert.js
* Get assert.deepEqual to show objects
* Document API so far
* frame.hasElement() or frame.getElementList()?
* Can't create frame with stylesheet AND src document without creating error on iOS Safari (23px???)
* watch.js rebuilds too often or not enough
* Modify ensure to give better error message when comparison type is not a constructor

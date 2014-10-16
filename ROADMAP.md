# Quixote Roadmap

## Release Ideas

* **✔ v0.1** Basic DOM manipulation; raw position and style information
* **✔ v0.2** "Cooked" absolute position info; initial assertion API
* **✔ v0.3** Positioning relative to other elements
* Advanced positioning (middle, center, height, width, fractions)
* Positioning relative to page
* Initial "cooked" styling (colors?)
* ...more TBD


## Current Feature: Advanced Positioning

* middle and center
* height and width
* fractional height and width
* string together ElementPositions 

```javascript
element.assert({
  top: foo.top,
  bottom: bar.middle
  left: baz.left.plus(10)
  right: baz.left.plus(element.width)
});
```

## To Do

* Generalize descriptor; simplify creation
* Resolve createObject duplication()
* ElementPosition --> RelativePosition?


## Future Features
* Should width and height go inside Frame's "options" object?
* Support multiple assertions? (e.g., `top.diff([bar.left, baz.right]);`)
* Frame.getElement(), Frame.addElement(): take an optional nickname?
* QElement.description() --> QElement.toString()? 


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
* `ensure.signature(arguments, [ [undefined, Object] ]);` failed -- look into it (`ElementEdge.toString()`)

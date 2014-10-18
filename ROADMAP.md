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

* NEXT: ElementEdge.plus/minus(ElementSize)
* RelativeEdge.plus/minus(ElementSize)
* ElementCenter.plus/minus(ElementSize)
* ElementCenter.plus/minus(RelativeSize)
* ElementSize.plus/minus(ElementSize)
* RelativeSize.plus/minus(ElementSize)
* RelativeEdge.plus/minus(RelativeEdge)
* RelativeSize.plus/minus(RelativeSize)
* Good error messages when mix/matching incompatible elements (e.g., `size.plus(edge)`)
* fractional height and width
* Scrolling (and accounting for scrolling in ElementEdge)

```javascript
element.assert({
  top: foo.top,
  bottom: bar.middle
  left: baz.left.plus(10)
  right: baz.left.plus(element.width)
});
```

## To Do

* POP STASH and look for Position "adds size" test. 

* Change Descriptor.convert() --> Descriptor.convertNumber()?
* How do we deal with descriptors that aren't comparable?

* Should Dimension be a value object?
* Value object superclass? (Or "DiffableValue?")
  * value()
  * equals() (defer to diff())


## Future Features

* Investigate re-enabling URL checking (issue #4)
* Should width and height go inside Frame's "options" object?
* Support multiple assertions? (e.g., `top.diff([bar.left, baz.right]);`)
* Frame.getElement(), Frame.addElement(): take an optional nickname?
* QElement.description() --> QElement.toString()? 


## Future To Do

* Clean up QElement tests
* Should frame.toDomElement() cause frame.reset() to fail fast (because it can't guarantee a safe reset)?
* Rename `Frame` to `QFrame`?
* Get IE 8 ensure exceptions to show stack trace
* Factor out duplication of message variable manipulation in assert.js
* Get assert.deepEqual to show objects
* frame.hasElement() or frame.getElementList()?
* Can't create frame with stylesheet AND src document without creating error on iOS Safari (23px???)
* Modify ensure to give better error message when comparison type is not a constructor
* `ensure.signature(arguments, [ [undefined, Object] ]);` failed -- look into it (`ElementEdge.toString()`)

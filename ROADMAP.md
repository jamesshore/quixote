# Quixote Roadmap

## Release Ideas

* **✔ v0.1** Basic DOM manipulation; raw position and style information
* **✔ v0.2** "Cooked" absolute position info; initial assertion API
* **✔ v0.3** Positioning relative to other elements
* Advanced positioning (middle, center, height, width, fractions)
* API hardening
* Positioning relative to page
* Initial "cooked" styling (colors? contrast (fg color vs. bg color?))
* ...more TBD


## Current Feature: Advanced Positioning

* NEXT: fractional height and width

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

* CURRENT: clean up. See below items

* Change Descriptor.convert() --> Descriptor.convertNumber()?
  * Provide default implementation of convert() (do nothing; just return 'undefined')

* Handful of end-to-end tests that confirm human-readable results of diff()


## Future Features

* Split out API and contribution documentation (don't want wall of text in readme)
* Investigate re-enabling URL checking (issue #4)
* Should width and height go inside Frame's "options" object?
* Support multiple assertions? (e.g., `top.diff([bar.left, baz.right]);`)
* Frame.getElement(), Frame.addElement(): take an optional nickname?
* Distances? (e.g., height of menu is equal to distance between logo top and headline bottom)


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

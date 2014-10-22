# Quixote Roadmap

## Release Ideas

* **✔ v0.1** Basic DOM manipulation; raw position and style information
* **✔ v0.2** "Cooked" absolute position info; initial assertion API
* **✔ v0.3** Positioning relative to other elements
* Advanced positioning (middle, center, height, width, arithmetic, fractions)
* API hardening
* Positioning relative to page
* Initial "cooked" styling (colors? contrast (fg color vs. bg color?))
* ...more TBD


## Current Feature: Advanced Positioning

* NEXT: Scrolling (and accounting for scrolling in ElementEdge)

```javascript
element.assert({
  top: foo.top,
  bottom: bar.middle
  left: baz.left.plus(10)
  right: baz.left.plus(element.width)
  center: foo.top.plus(element.height.times(1/3))
});
```

## To Do

* NEXT: Move Frame workarounds to shim.js
* ElementEdge account for scroll position


## Future Features

* Split out API and contribution documentation (don't want wall of text in readme)
* Investigate re-enabling URL checking (issue #4)
* Should width and height go inside Frame's "options" object?
* Support multiple assertions? (e.g., `top.diff([bar.left, baz.right]);`)
* Frame.getElement(), Frame.addElement(): take an optional nickname?
* Distances? (e.g., height of menu is equal to distance between logo top and headline bottom)


## Future To Do

* Should frame.toDomElement() cause frame.reset() to fail fast (because it can't guarantee a safe reset)?
* Rename `Frame` to `QFrame`?
* frame.hasElement() or frame.getElementList()?
* Can't create frame with stylesheet AND src document without creating error on iOS Safari (23px???)
* Consider taking out ensure.signature() calls; they may restrict more than they help
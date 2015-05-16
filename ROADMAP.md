# Quixote Roadmap

## Release Ideas

* **✔ v0.1** Basic DOM manipulation; raw position and style information
* **✔ v0.2** "Cooked" absolute position info; initial assertion API
* **✔ v0.3** Positioning relative to other elements
* **✔ v0.4** Advanced positioning (middle, center, height, width, arithmetic, fractions)
* **✔ v0.5** API hardening
* **✔ v0.6** Responsive design
* Dogfooding and real-world usage
* Initial "cooked" styling (colors? contrast (fg color vs. bg color?))
* ...more TBD


## Current Feature: Page and viewport assertions and diff

* QPage.assert()
* QViewport.assert()


## To Do:

* Update QPage API docs


## Future Features

* Support multiple assertions? (e.g., `top.diff([bar.left, baz.right]);`)
* Distances? (e.g., height of menu is equal to distance between logo top and headline bottom)
* Investigate re-enabling URL checking (issue #4)
* Consider how to support less-than, greater-than, etc.
  * Use case: "the bottom edge of 'foo' is above the fold (600px)".
  * .max and .min?  `foo.assert({ bottom: top.plus(600).max });`   `foo.assert({ bottom: q.max(600) });`


## Future To Do

* Can't create frame with stylesheet AND src document without creating error on iOS Safari (23px???)
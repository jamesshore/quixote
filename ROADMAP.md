# Quixote Roadmap

## Release Ideas

* **✔ v0.1** Basic DOM manipulation; raw position and style information
* **✔ v0.2** "Cooked" absolute position info; initial assertion API
* **✔ v0.3** Positioning relative to other elements
* **✔ v0.4** Advanced positioning (middle, center, height, width, arithmetic, fractions)
* API hardening
* Positioning relative to page
* Initial "cooked" styling (colors? contrast (fg color vs. bg color?))
* ...more TBD


## Current Feature: API Hardening

* width and height inside Frame's "options" object
* Consider taking out ensure.signature() calls; they may restrict more than they help
* Real-world trial


## To Do


## Future Features

* Support multiple assertions? (e.g., `top.diff([bar.left, baz.right]);`)
* Distances? (e.g., height of menu is equal to distance between logo top and headline bottom)
* Investigate re-enabling URL checking (issue #4)


## Future To Do

* Should toDomElement() cause frame.reset() to fail fast (because it can't guarantee a safe reset)?
* Can't create frame with stylesheet AND src document without creating error on iOS Safari (23px???)
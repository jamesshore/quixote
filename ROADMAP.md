# Quixote Roadmap

## Release Ideas

* **✔ v0.1** Basic DOM manipulation; raw position and style information
* **✔ v0.2** "Cooked" absolute position info; initial assertion API
* **✔ v0.3** Positioning relative to other elements
* **✔ v0.4** Advanced positioning (middle, center, height, width, arithmetic, fractions)
* **✔ v0.5** API hardening
* Positioning relative to page
* Initial "cooked" styling (colors? contrast (fg color vs. bg color?))
* ...more TBD


## Current Feature: Positioning relative to page

* ViewportSize plus(), minus(), times()
* Test and document QUIRKS MODE fix in QFrame.js
  * ViewportSize: test behavior when in quirks mode?
* Test and document proper solution to Mobile Safari and its "full size frame" issue.
  * Perhaps just a better browser inspection
  * If 'scrollContainer' fix is removed, update API docs
* Viewport top, right, bottom, left
  * Need to handle scrolling
* Frame.reset(): reset body style AND/OR document that toDomElement() can interfere with frame.reset()
  * setAttribute("style", previousValue) seems like it doesn't work on IE8 (throw exception?)
  * take out workaround in _page_size_test.js
* Test-drive need for scroll container
* Test whether box-sizing affects ElementSize
* Page width, height
* Page top, right, bottom, left
* QFrame.page()
* Document width, height
* Document top, right, bottom, left
* QFrame.document()
* Center & middle for all. (Modify ElementCenter to be generic?)
* QFrame: document difference between viewport, document, and page


## To Do: QFrame.viewport()

* changelog
* api doc

## Future Features

* Support multiple assertions? (e.g., `top.diff([bar.left, baz.right]);`)
* Distances? (e.g., height of menu is equal to distance between logo top and headline bottom)
* Investigate re-enabling URL checking (issue #4)


## Future To Do

* Need better solution for ensure.signature() in RelativePosition and RelativeSize constructors. (Common base class?)
* Should toDomElement() cause frame.reset() to fail fast (because it can't guarantee a safe reset)?
* Can't create frame with stylesheet AND src document without creating error on iOS Safari (23px???)
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

* Page width, height
* Frame.reset(): reset body style AND/OR Document that toDomElement() can interfere with frame.reset()
  * take out workaround in _page_size_test.js
  * setAttribute("style", previousValue) seems like it doesn't work on IE8 (throw exception?)
* Test-drive need for scroll container
* Test whether box-sizing affects ElementSize
* Page top, right, bottom, left
* Frame width, height
* Frame top, right, bottom, left
* Document width, height
* Document top, right, bottom, left
* Center & middle for all. (Modify ElementCenter to be generic?)


## To Do: Page width, height

* NEXT: Deal with Mobile Safari and its "full size frame" issue.
* PageSize --> FrameSize
* page bigger than frame (horz, vert)
* Pass 'body' into PageSize, not contentDocument?
* 'page' property in QFrame
* 'body' property in QFrame?
* Test and document QUIRKS MODE fix in QFrame.js
* Document API (PageSize descriptor, QFrame.page, QFrame.body)
* Changelog


## Future Features

* Support multiple assertions? (e.g., `top.diff([bar.left, baz.right]);`)
* Distances? (e.g., height of menu is equal to distance between logo top and headline bottom)
* Investigate re-enabling URL checking (issue #4)


## Future To Do

* Need better solution for ensure.signature() in RelativePosition and RelativeSize constructors. (Common base class?)
* Should toDomElement() cause frame.reset() to fail fast (because it can't guarantee a safe reset)?
* Can't create frame with stylesheet AND src document without creating error on iOS Safari (23px???)
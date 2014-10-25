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
* Page top, right, bottom, left
* Frame width, height
* Frame top, right, bottom, left


## To Do: Page width, height

* width, height equal to frame size
* test body padding
* test body border
* test body margin
* account for vertical scrollbar
* page bigger than frame (horz, vert)
* 'page' property in QFrame
* Document PageSize descriptor, QFrame.page


## Future Features

* Support multiple assertions? (e.g., `top.diff([bar.left, baz.right]);`)
* Distances? (e.g., height of menu is equal to distance between logo top and headline bottom)
* Investigate re-enabling URL checking (issue #4)


## Future To Do

* Need better solution for ensure.signature() in RelativePosition and RelativeSize constructors. (Common base class?)
* Should toDomElement() cause frame.reset() to fail fast (because it can't guarantee a safe reset)?
* Can't create frame with stylesheet AND src document without creating error on iOS Safari (23px???)
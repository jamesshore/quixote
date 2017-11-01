# Quixote Roadmap

## Release Ideas

* **✔ v0.1** Basic DOM manipulation; raw position and style information
* **✔ v0.2** "Cooked" absolute position info; initial assertion API
* **✔ v0.3** Positioning relative to other elements
* **✔ v0.4** Advanced positioning (middle, center, height, width, arithmetic, fractions)
* **✔ v0.5** API hardening
* **✔ v0.6** Responsive design
* **✔ v0.7** Page and viewport assertions
* **✔ v0.8 - v0.11** Dogfooding and real-world usage (more dogfooding releases to come)
* **✔ v0.12** Element display status descriptors
* **v0.13** Element visibility descriptors, including @woldie's clip
* ...more TBD


## Current Feature: Element Visibility (0.13 release)

* API docs and changelog
* Review GitHub issues for 'ready to implement' issues and pull requests
* Review GitHub issues for 'bug' issues that can be easily fixed


## To Do: API docs and changelog

* PositionDescriptor.to()
* ElementRendered's new descriptor properties (edge and size properties) - considers following scenarios
	* whether element is off-screen (or partially off-screen)
	* zero-width/height
	* `overflow`
	* `clip`
	* `display`
	* `clip-path` (not supported; fails fast)
	* Compatibility note: IE 8 doesn't distinguish between `clip: auto` and `clip: rect(auto, auto, auto, auto)`. So IE 8 won't work with `rendered` descriptor.
	* Compatibility note: IE 11, Chrome Mobile 44 miscompute `clip: rect(auto)` as '0px' (should be 'auto'). So they can't calculate clipping values when the `clip` property is used
* Update SizeDescriptor and PositionDescriptor's "none" option to reflect broader reasons an element could be non-rendered
* ElementRenderedEdge
	* Compatibility note: IE 8 doesn't distinguish between `clip: auto` and `clip: rect(auto, auto, auto, auto)`. So IE 8 won't work with `rendered` descriptor.
	* Compatibility note: IE 11, Chrome Mobile 44 miscompute `clip: rect(auto)` as '0px' (should be 'auto'). So they can't calculate clipping values when the `clip` property is used
* Move descriptors out of special "Descriptor" page and into regular documentation (such as QElement properties)? Or both?
* Code change: Change element.width and .height back to 0 (instead of non-rendered) for zero-width/height elements.
	* Documentation already reflects this change
* Code change: PositionDescriptor needs `ensure.signature`
	* Consider whether it should take a number (and if it should, update the documentation accordingly)


## Dogfooding Notes

* Add ability to easily get font metrics (see issue #44)
* Switch assertion errors to say what the correct value should be? In other words, rather than saying "top edge of '.navbar' was 13px lower than expected.", say "top edge of '.navbar' should be 13px higher."?
* Provide a better way of integrating with standard assertion libraries? Use `valueOf()`?
* Consider how to support less-than, greater-than, etc.
  * Use case: "the bottom edge of 'foo' is above the fold (600px)".
	* Alternative assert mechanism? `element.assert.equal()` `.assert.lessThan()` etc? with `should` as alias to `assert`?
  * .max and .min?  `foo.assert({ bottom: top.plus(600).max });`   `foo.assert({ bottom: q.max(600) });`
* Provide better error message when cross-origin 'src' provided to quixote.createFrame
* Add workaround for IE 8 not working with `frame.add("<style>...</style>")` (addAll? browser feature detect? Need to check if there's no way to insert styles into the document, or if it just doesn't like the way `add()` works.)


## Future Features

* Z-ordering
* Colors? Contrast (fg color vs. bg color?))
* Plugin API

# Quixote Roadmap

## Release Ideas

* **✅ v0.1** Basic DOM manipulation; raw position and style information
* **✅ v0.2** "Cooked" absolute position info; initial assertion API
* **✅ v0.3** Positioning relative to other elements
* **✅ v0.4** Advanced positioning (middle, center, height, width, arithmetic, fractions)
* **✅ v0.5** API hardening
* **✅ v0.6** Responsive design
* **✅ v0.7** Page and viewport assertions
* **✅ v0.8 - v0.11** Dogfooding and real-world usage (more dogfooding releases to come)
* **✅ v0.12** Element display status descriptors
* **✅ v0.13** Element rendering boundaries
* **✅ v0.14** QFrame quality of life improvements
* **✅ v0.15** Support for third-party test runners
* **TBD** New assertions
* See our [work-in-progress roadmap](https://github.com/jamesshore/quixote/blob/master/ROADMAP.md) for the latest release plans.


## Current Feature: Better assertions

* (DONE) .should.equal()
* (DONE) .should.notEqual()
* (DONE) PositionDescriptor assertions
* (DONE) SizeDescriptor assertions
* (DONE) PositionDescriptor.to() return a 'span' that can have a middle/center.
* (DONE) Update nickname generation
* Rename element.rendered --> element.rendering or other? If so, rename ElementRendered class?
	* Fix documentation, including links, if this is changed
* (DONE) Update API documentation (complete overhaul; eliminate separate descriptors catalog)
* (DONE) Update README
* (DONE) Update example
* Update CONTRIBUTING
	* Update src/descriptors README
		* test: "has assertions"
		* code: call createShould()
	* Update src/values README - just a copyedit pass


## To Do: PositionDescriptor.to() returns a 'span' that can have a middle/center.

* (DONE) Rename GenericSize --> Span
* (DONE) span.center, span.middle
* (DONE) PositionDescriptor.to(..., nickname)
	* (DONE) change default nickname to 'span from ...' instead of 'distance from ...'
* API
	* (DONE) Span
	* (DONE) PositionDescriptor.to() is a Span, not a Size
	* (DONE) PositionDescriptor.to() takes a nickname
	* (DONE) SizeDescriptor equivalent - Span
	* (DONE) Check links - Span, SizeDescriptor equivalents, PositionDescriptor.to(), api
* (DONE) CHANGELOG


## Dogfooding Notes

* Provide a better way of integrating with standard assertion libraries? Use `valueOf()`?
* Provide better error message when cross-origin 'src' provided to quixote.createFrame


## Future Features

* Z-ordering
* Colors? Contrast (fg color vs. bg color?))
* Plugin API

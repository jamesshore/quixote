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
* .should.beAbove()
* .should.beBelow()
* .should.beToRightOf()
* .should.beToLeftOf()
* .should.beBiggerThan()
* .should.beSmallerThan()
* (WIP) Test quixote.elementFromDom()
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


## To Do: quixote.elementFromDom

* (DONE) Add tests
* (DONE) Move code out of QElement
* (DONE) nicknames: '#id', '.class', '<tag>'
* Have add() use nickname-generation code?
* CHANGELOG


## Dogfooding Notes

* Add ability to easily get font metrics (see issue #44)
* Switch assertion errors to say what the correct value should be? In other words, rather than saying "top edge of '.navbar' was 13px lower than expected.", say "top edge of '.navbar' should be 13px higher."?
* Provide a better way of integrating with standard assertion libraries? Use `valueOf()`?
* Consider how to support less-than, greater-than, etc.
  * Use case: "the bottom edge of 'foo' is above the fold (600px)".
	* Alternative assert mechanism? `element.assert.equal()` `.assert.lessThan()` etc? with `should` as alias to `assert`?
  * .max and .min?  `foo.assert({ bottom: top.plus(600).max });`   `foo.assert({ bottom: q.max(600) });`
* Provide better error message when cross-origin 'src' provided to quixote.createFrame


## Future Features

* Z-ordering
* Colors? Contrast (fg color vs. bg color?))
* Plugin API

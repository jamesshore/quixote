# Quixote Change Log

Changes are listed by minor version, from newest to oldest. Under each minor version, patches are listed from oldest to newest.


## v1.0.x: New assertion API

**20 Apr 2020.** Quixote's assertion API has been completely overhauled. Instead of using `navbar.assert({ top: header.top})`, you now use the much more natural `navbar.top.should.equal(header.top)`. New assertions have been added and we've improved error messages across the board. We've also overhauled the API documentation and implemented quality-of-life improvements for our official 1.0 release.

*Patches:*

* *1.0.1, 21 Apr 2020:* Documentation fix: Fix broken links in contributor guide and remove reference to deprecated method from readme.

**Breaking changes:**

There are no breaking changes, but several methods and properties have been deprecated. They may stop working in a future release.

* `QElement.assert()` and `QElement.diff()` have been replaced by the new assertion API.

  Old code:

  ```javascript
  navbar.assert({
    top: header.top,
    left: header.left,
    width: header.width
  });
  ```

  New code:

  ```javascript
  navbar.top.should.equal(header.top);
  navbar.left.should.equal(header.left);
  navbar.width.should.equal(header.width);
  ```

* The `QElement.rendered` property has been renamed to `QElement.render`. The old property is still available as an alias, but may be removed in a future release.

*Other changes:*

* All methods have been promoted to '3-Stable'
* Improved error messages when making invalid assertions
* Improved nickname generation
* Added optional `nickname` parameter to `QElement.parent()`
* Added optional `nickname` parameter to `PositionDescriptor.to()``
* PositionDescriptor now returns a `Span`, which is completely compatible with previous return value

*New assertions:*

* ElementRender.should.equal()
* ElementRender.should.notEqual()

* PositionDescriptor.should.equal()
* PositionDescriptor.should.notEqual()
* PositionDescriptor.should.beAbove()
* PositionDescriptor.should.beBelow()
* PositionDescriptor.should.beLeftOf()
* PositionDescriptor.should.beRightOf()

* SizeDescriptor.should.equal()
* SizeDescriptor.should.notEqual()
* SizeDescriptor.should.beBiggerThan()
* SizeDescriptor.should.beSmallerThan()

* Span.should.equal()
* Span.should.notEqual()
* Span.should.beBiggerThan()
* Span.should.beSmallerThan()

*New properties:*

* Span.middle
* Span.center


## 0.15.x: Support for third-party test runners

**10 Apr 2020.** You can now use Quixote with third-party test runners that provide their own test iframe and lifecycle. Instead of creating elements using Quixote, use the new `quixote.elementFromDom()` method to create a QElement from an existing DOM element. A few other quality-of-life improvements have also been added.

**No breaking changes.**

*New methods:*

* QElement.contains()
* QFrame.forceReflow()
* quixote.elementFromDom()


## 0.14.x: Minor QFrame improvements

**14 Nov 2017.** This small release adds quality-of-life improvements to `QFrame`. Quixote now checks URLs asynchronously in `quixote.createFrame()`, which may speed up tests slightly. This also means Firefox and Chrome will no longer show XMLHttpRequest deprecation warnings in the console. In addition, several `QFrame` methods have been updated to fail fast if they're used before the frame is loaded, which will make debugging easier.

*Patches:*

* *0.14.1, 9 Apr 2020:* Bugfix: No longer throw exception when `element.rendered` descriptor sees different values for `overflow-x` and `overflow-y`, or if a compound `overflow` parameter is used. ([Issue #57.](https://github.com/jamesshore/quixote/issues/57))
* *0.14.2, 9 Apr 2020:* Bugfix: Some browsers would report incorrect font sizes after resizing frame. This was fixed by forcing a reflow after resizing. ([Issue #52.](https://github.com/jamesshore/quixote/issues/52))

**Breaking changes:**

* `QFrame.toDomElement()` now throws an exception if it's called before the frame is loaded.


## 0.13.x: Rendered Element Bounds

**2 Nov 2017.** Quixote can now detect what part of an element is rendered and what isn't. In practice, this means you can detect where an element is clipped by the `overflow: hidden` property, the `clip` property, or by being partially off-screen. These new capabilities are available as descriptor properties on the `element.rendered` descriptor. The `element.rendered` descriptor itself is also smarter about when it considers an element to be rendered or not. Several small quality-of-life API improvements have been made as well; see below.

**Breaking changes:**

* The Opera browser is no longer officially supported. (It's likely to continue working, but it's no longer part of our pre-release test suite.)

* The `element.rendered` descriptor now detects several new situations. Elements that were previously considered to be rendered may now be reported as non-rendered. These are the new scenarios that result in an element being reported as non-rendered:

	* Element is positioned off-screen
	* Element has zero width or height
	* Element is clipped out of existence by `clip` or `overflow` property

* The `element.rendered` descriptor no longer works on IE 8. This is due to bugs in IE 8's reporting of the `clip` property, which `element.rendered` now checks. You can check for IE 8's broken behavior with the new `quixote.browser.misreportsClipAutoProperty()` browser detect.

* The `element.rendered` descriptor could fail on some browsers if the `clip` property is used. This is due bugs in the way those browsers report the details of the `clip` property. You can check for this broken behavior with the new `quixote.browser.misreportsAutoValuesInClipProperty()` browser detect. (This is different than the IE 8 bug and browser detect described above.)

* The `element.rendered` descriptor will now fail if the `clip-path` property is used. This is because `element.rendered` is supposed to look at the whole universe of CSS properties to determine if an element is rendered or not, but clip-path is too complicated for Quixote to understand. Rather than say an element is rendered when it might not be when `clip-path` is used, Quixote throws an error instead.

* The `element.rendered` property no longer tracks why an element isn't rendered. (There's so many possibilities it got unwieldy; and it's an implementation detail that doesn't seem necessary to test.) If you have assertions about why an element is non-rendered, you'll need to update your assertion from a string to `false`.

	Old code:

	```javascript
	// I expect the lightbox to have the `display:none` property
	lightbox.assert({
	  rendered: "display:none"
	});
	// I expect the cookie disclaimer to be removed from the DOM
	disclaimer.assert({
	  disclaimer: "detached"
	});
  ```

  New code:

  ```javascript
  // I expect the lightbox to not be rendered
  lightbox.assert({
    rendered: false
  });
  // I expect the cookie disclaimer to not be rendered
  disclaimer.assert({
    rendered: false
  });
  ```

*New descriptors:*

* QElement.rendered.top
* QElement.rendered.right,
* QElement.rendered.bottom,
* QElement.rendered.left,
* QElement.rendered.width,
* QElement.rendered.height,
* QElement.rendered.center,
* QElement.rendered.middle

*New methods:*

* PositionDescriptor.to()
* QElement.parent()
* QElement.add()
* QElement.calculatePixelValue()
* quixote.browser.misreportsClipAutoProperty()
* quixote.browser.misreportsAutoValuesInClipProperty()
* quixote.browser.roundsOffPixelCalculations()

*Other changes:*

* quixote.createFrame() has a `css` option that can be used to inject raw CSS into the frame.
* QElement.toDomElement() has been promoted from '1-Experimental' to '2-Unstable'.

## 0.12.x: Non-Rendered Elements

**21 May 2016.** Quixote is now smarter about elements that aren't rendered into the DOM. Elements that have the `display:none` property or that are detached from the DOM are considered to be non-rendered. To detect non-rendered elements, you can use the new `element.rendered` descriptor. Element positions now also distinguish between "0px" (which means the upper-left corner) and "none" (which means the element isn't rendered). The same idea applies to element sizes.

*Patches:*

* *0.12.1, 21 May 2016:* Documentation: Fixed incorrect property names and descriptions in change log.
* *0.12.2, 22 May 2016:* Documentation: Additional minor fixes.
* *0.12.3, 14 July 2016:* Documentation: Fixed missing parentheses in readme's example source code.
* *0.12.4, 18 Feb 2017:* Bugfix: Browserify can now be used with Quixote npm module.
* *0.12.5, 18 Feb 2017:* Documentation: Fixed incorrect assertion in README example.

**Breaking changes:**

* Non-rendered elements used to report their sizes and positions as "0px." Now they report them as "none." If you have any assertions on non-rendered elements, you'll need to update your assertion from `0` to `"none"`.

	Old code:
	
	```javascript
	// I expect the light box will not be displayed
  lightbox.assert({
  	width: 0
  });
  ```
  
  New code:
  
  ```javascript
  lightbox.assert({
  	width: "none"
  });
  ```
  
  Or, better yet:
  
  ```javascript
  lightbox.assert({
  	rendered: false
  });
  ```
  
*New descriptors:*

* QElement.rendered

*New methods:*

* QElement.remove()

*Other changes:*

* QFrame.add() no longer fails when adding HTML with leading or trailing whitespace.
* Added Value object tutorial to contributor documentation.
  

## 0.11.x: Single-Page App Support

**5 Dec 2015.** The new `QFrame.reload()` method will re-run scripts, unlike `QFrame.reset()`, allowing you to test single-page apps more easily.
 
**No breaking changes.**

*New methods:*

* QFrame.reload()


## 0.10.x: Updated Documentation

**21 Nov 2015.** A revamp of the Quixote documentation, including a working example that can be used as a seed project.

**No breaking changes.**

*Changes:*

* New 'Usage' and 'Gotchas' sections in the Readme.
* New 'Architecture' section in contributor guide.
* Tweaks and refinements to API and contributor documentation.
* Example project.


## 0.9.x: Multiple Stylesheets

**9 Oct 2015.** A small release that improves the handling of stylesheets. You can now use an array to provide multiple stylesheets in quixote.createFrame's `options.stylesheet` parameter. You can also provide stylesheets and src URLs at the same time.

**No breaking changes.**

*Changes:*

* quixote.createFrame() accepts an array of stylesheets in `options.stylesheet`.
* quixote.createFrame() no longer errs out when you specify `options.src` and `options.stylesheet` at the same time.
* quixote.createFrame() checks src and stylesheet URLs and fails fast if they're not found.


## 0.8.x: Browser Font Enlargement Detection

**8 Oct 2015.** This small release adds the ability to detect if the browser enlarges fonts, as Mobile Safari does.

**No breaking changes.**

*New methods:*

* quixote.browser.enlargesFonts()


## 0.7.x: Page and Viewport Assertions

**16 May 2015.** This small release adds `assert()` and `diff()` methods to page and viewport objects provided by `frame.page()` and `frame.viewport()`. They behave just like QElement's `assert` and `diff`.

*Patches:*

* *0.7.1, 11 Sept 2015:* Fix: `QElement.getRawStyle()` returned wrong answer on Firefox when called twice in a row on some properties.

* *0.7.2, 11 Sept 2015:* Chrome Mobile on Android officially supported.

**No breaking changes.**

*New methods:*

* QFrame.page().assert()
* QFrame.page().diff()
* QFrame.viewport().assert()
* QFrame.viewport().diff


## 0.6.x: Responsive Design

**4 Nov 2014.** This release makes it easier to test fluid and responsive layouts. We now have descriptors for the viewport and page, and the new `QFrame.resize()` method allows you to see how your elements render at different sizes.

*Patches:*

* *0.6.1, 16 Feb 2015:* Opera officially supported. PhantomJS 1.x officially *not* supported via compatibility note in README.

**Breaking changes:**

* Frames created without the `src` option are created with `<!DOCTYPE html>` to enable standards mode.
* Replaced `quixote.browser.canScroll()` with `quixote.browser.enlargesFrameToPageSize()`. Note that this returns `true` where the previous function returned `false`.
* QFrame.scroll() no longer throws an exception when called on Mobile Safari.

*Other changes:*

* Clarified documentation around Mobile Safari's handling of frame width and height.
* Removed scrolling container around test frame. I don't think it was doing anything useful.
* Improved and consolidated descriptor documentation.

*New methods:*

* QFrame.viewport()
* QFrame.page()
* QFrame.body()
* QFrame.resize()

*New descriptors:*

* QFrame.viewport().width
* QFrame.viewport().height
* QFrame.viewport().top
* QFrame.viewport().right
* QFrame.viewport().bottom
* QFrame.viewport().left
* QFrame.viewport().center
* QFrame.viewport().middle
* QFrame.page().width
* QFrame.page().height
* QFrame.page().top
* QFrame.page().right
* QFrame.page().bottom
* QFrame.page().left
* QFrame.page().center
* QFrame.page().middle


## 0.5.x: API Hardening

**23 Oct 2014.** API stability was the goal of this release. The API has been thoroughly reviewed and tweaked with the goal of reducing future changes. Other small changes were made to make the API production-ready, and the documentation received a thorough review and update.

*Patches:*

* *0.5.1, 24 Oct 2014:* Minor documentation fixes. The most serious fix (and the motivation for this patch release) was a correction to the `quixote.createFrame` parameters in the README example.

**Breaking changes:**

* Renamed QFrame.getElement() --> QFrame.get()
* Renamed QFrame.addElement() --> QFrame.add()
* Moved quixote.createFrame() width and height parameters into options object

*Enhanced:*

* QFrame.get() and QFrame.add() take an optional "nickname" parameter

*New methods:*

* QFrame.getAll()
* QFrame.toDomElement()
* QElement.toDomElement()
* Descriptor.diff()

*New classes:*

* QElementList

*Renamed:*

* Frame --> QFrame


## 0.4.x: Advanced Positioning

**22 Oct 2014.** This release adds a host of new positioning options. You can get the width and height of elements, look at the center (horizontal) or middle (vertical) of elements, and you can mix and match any descriptor with any other. For example, you could check if your element is in the center third below an 'other' element:
  
```javascript
element.assert({
  top: other.bottom.plus(10),     // we're 10px below the other element
  center: other.center,           // we're centered below that element
  width: other.width.times(1/3)   // and we're one-third its width
});
```

*Patches:*

* *0.4.1, 22 Oct 2014:* Documented `SizeMultiple`'s additional descriptors.   

**No breaking changes.**


*Fixed:*

* Position comparisons are no longer reversed on the vertical axis. (When comparing 10px to an expected value of 13px, Quixote said the actual was "3px lower" than expected, not "3px higher." Although the *number* is lower, the actual *position* on the page is higher.)

*Enhanced:*

* Improved diff messages
* Better errors
* ElementEdge.plus() and ElementEdge.minus() can be passed a descriptor (for example, `element.top.plus(element.width)`). 

*Reverted:*

* Frame.create() fails fast if the HTML or stylesheet URL is invalid: temporarily removed due to potential test suite execution issues with Mobile Safari

*New methods:*

* quixote.browser.canScroll()
* Frame.scroll()
* Frame.getRawScrollPosition()

*New descriptors:*

* QElement.center
* QElement.middle
* QElement.width
* QElement.height
* ElementCenter.plus()
* ElementCenter.minus()
* RelativePosition.plus()
* RelativePosition.minus()
* ElementSize.plus()
* ElementSize.minus()
* ElementSize.times()
* RelativeSize.plus()
* RelativeSize.minus()
* RelativeSize.times()
* SizeMultiple.plus()
* SizeMultiple.minus()
* SizeMultiple.times()


## 0.3.x: Element-to-Element Positioning Comparisons

**15 Oct 2014.** QElement's `diff()` method now supports checking relative positions. As well as specifying an absolute position, you can also describe your element relative to other elements. You can also specify an offset if elements aren't exactly aligned:

```javascript
element.diff({
  left: otherElement.left,            // left edges are aligned
  top: otherElement.bottom.plus(10)   // top is 10px below bottom
});
```

Also, the new `assert()` method works just like `diff()`, except it automatically throws an exception when a difference is found. This is more convenient than writing `assert.equal(element.diff(...), "")` all the time. Now you can just write `element.assert(...)` instead. 
  
*Patches:*

* *0.3.1, 16 Oct 2014:* Documented `message` parameter on `QElement.assert()`   
 
**No breaking changes.**

*Fixed:*

* ElementEdge.diff() reports correct edge instead of saying 'top' for everything.

*Enhanced:*

* ElementEdge.diff() can compare to an ElementPosition (an offset from an edge).
* Frame.create() fails fast if the HTML or stylesheet URL is invalid. (Contributed by @bjornicus)

*New methods:*

* QElement.assert()

*New descriptors:*

* ElementEdge.plus()
* ElementEdge.minus()


## 0.2.x: Absolute Positioning

**14 Oct 2014.** QElement instances now have a `diff()` method that you can use to check multiple properties simultaneously. In this release, it supports the most basic positioning information: the absolute position of the top, right, bottom, and left edge of the element, like this:

```javascript
element.diff({
  top: 40,
  left: 26,
  // etc.
});
```

**Breaking changes:**

* quixote.createFrame() and Frame.create() callback signature changed from `callback(frame)` to `callback(err, frame)`.

*Fixed:*

* IE 8 workaround: IE 8 includes frame border in position calculations. We now create the test frame with frameborder=0 attribute so IE 8's positions are consistent with other browsers. 

*Enhanced:*

* Frame.create() and quixote.createFrame() now return the frame immediately, as well as passing it into the callback. You still need to wait for the callback before using the frame.

*New methods:*

* QElement.diff()

*New descriptors:*

* QElement.top
* QElement.right
* QElement.bottom
* QElement.left


## 0.1.x: Raw Styles and Positions

**13 Oct 2014.** Basic API for setting up a test frame and getting raw (non cross-browser-compatible) style and positioning information. Minimally viable... but viable.
 
*New modules, classes, and methods:*

* quixote
  * createFrame()
  
* Frame
  * Frame.create()
  * reset()
  * remove()
  * addElement()
  * getElement()
  
* QElement
  * getRawStyle()
  * getRawPosition()
  

## 0.0.x: Infrastructure

**30 Sept 2014.** Project infrastructure.

Patches:

* *0.0.1, 30 Sept 2014:* Initial build, integration, and release scripts.   
* *0.0.2, 1 Oct 2014:* Release script publishes to npm and GitHub.   
* *0.0.3, 1 Oct 2014:* Final test of release script.
* *0.0.4, 6 Oct 2014:* Placeholder documentation site at quixote-css.com.
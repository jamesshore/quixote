# Quixote Change Log

Changes are listed by minor version, from newest to oldest. Under each minor version, patches are listed from oldest to newest.


## 0.7.x: Page and Viewport Assertions

**16 May 2015.** This small release adds `assert()` and `diff()` methods to page and viewport objects provided by `frame.page()` and `frame.viewport()`. They behave just like QElement's `assert` and `diff`.

*Patches:*

* *0.7.2, 11 Sept 2015:* Chrome Mobile on Android officially supported.

* *0.7.1, 11 Sept 2015:* Fix: `QElement.getRawStyle()` returned wrong answer on Firefox when called twice in a row on some properties.

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

***Breaking changes:***

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

***Breaking changes:***

* Renamed QFrame.getElement() --> QFrame.get()
* Renamed QFrame.addElement() --> QFrame.add()
* Moved quixote.createFrame() width and height parameters into options object

*Patches:*

* *0.5.1, 24 Oct 2014:* Minor documentation fixes. The most serious fix (and the motivation for this patch release) was a correction to the `quixote.createFrame` parameters in the README example.

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

**No breaking changes.**

*Patches:*

* *0.4.1, 22 Oct 2014:* Documented `SizeMultiple`'s additional descriptors.   


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
 
**No breaking changes.**
  
*Patches:*

* *0.3.1, 16 Oct 2014:* Documented `message` parameter on `QElement.assert()`   

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

***Breaking changes:***

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
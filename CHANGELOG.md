# Quixote Change Log

Changes are listed by minor version, from newest to oldest. Under each minor version, patches are listed from oldest to newest.


## 0.3: Relative Positioning

**15 Oct 2014.** QElement's `diff()` method now supports checking relative positions. As well as specifying an absolute position, you can also describe your element relative to other elements. You can also specify an offset if elements aren't exactly aligned:

```javascript
element.diff({
  left: otherElement.left,            // left edges are aligned
  top: otherElement.bottom.plus(10)   // top is 10px below bottom
});
```

Also, the new `assert()` method works just like `diff()`, except it automatically throws an exception when a difference is found. This is more convenient than writing `assert.equal(element.diff(...), "")` all the time. Now you can just write `element.assert(...)` instead. 

*Fixed:*

* ElementEdge.diff() reports correct edge instead of saying 'top' for everything.

*Enhanced:*

* ElementEdge.diff() can compare to an ElementPosition (an offset from an edge).

*New properties and methods:*

* QElement
  * assert()

* ElementEdge
  * plus()
  * minus()
  
*New classes:*

* ElementPosition
  * diff()

## 0.2: Absolute Positioning

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

*New properties and methods:*

* QElement
  * top, right, bottom, left
  * diff()

*New classes:*

* ElementEdge
  * diff()


## 0.1: Raw Styles and Positions

**13 Oct 2014.** Basic API for setting up a test frame and getting raw (non cross-browser-compatible) style and positioning information. Minimally viable... but viable.
 
*New modules, classes, and methods:*

* quixote
  * createFrame()
  
* Frame
  * Frame.create()
  * reset()
  * toDomElement()
  * remove()
  * addElement()
  * getElement()
  
* QElement
  * getRawStyle()
  * getRawPosition()
  * toDomElement()
  * toString()
  * equals()
  

## 0.0: Infrastructure

**30 Sept 2014.** Project infrastructure.

Patches:

* *0.0.1, 30 Sept 2014:* Initial build, integration, and release scripts.   
* *0.0.2, 1 Oct 2014:* Release script publishes to npm and GitHub.   
* *0.0.3, 1 Oct 2014:* Final test of release script.
* *0.0.4, 6 Oct 2014:* Placeholder documentation site at quixote-css.com.
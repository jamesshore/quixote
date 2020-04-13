# Quixote API: `QPage`

* [Back to overview README](../README.md)
* [Back to API overview](api.md)

`QPage` instances represent the overall browser page. You can get the instance by calling [`QFrame.page()`](QFrame.md#page). You'll use its properties in your assertions.


## Properties

Use these properties in your assertions.

**Compatibility Notes:**

* There is no standard way to get the dimensions of the page. We have implemented a solution that works on our [tested browsers](../build/config/tested_browsers.js), but it may not work on all browsers. If you use these descriptors, perform a visual check to make sure they're working as expected. If they aren't, please file an issue.

* In particular, the current solution for page dimensions only works on pages in standards mode. Specifically, they have been tested on pages using `<!DOCTYPE html>`. They do *not* work on pages without a doctype. If support for another doctype is important to you, please let us know by opening an issue.

**Pixel Rounding Note:** Browsers handle pixel rounding in different ways. We consider pixel values to be the same if they're within 0.5px of each other. If you have rounding errors that are *greater* than 0.5px, make sure your test browsers are set to a zoom level of 100%. Zooming can exaggerate rounding errors.


### Positions and Sizes

```
Stability: 3 - Stable
```

Descriptors for the position and size of the page are available on [`QFrame.page()`](QFrame.md#framepage). Unlike the viewport, these descriptors include the entire page displayed in the frame, whether or not it's scrolled out of view or not, and the page is always at least as big as the viewport. By comparing element positions and sizes to page descriptors, you can make assertions about where elements are positioned on the page.

* `page.top (`[`PositionDescriptor`](PositionDescriptor.md)`)` The top of the page.
* `page.right (`[`PositionDescriptor`](PositionDescriptor.md)`)` The right side of the page.
* `page.bottom (`[`PositionDescriptor`](PositionDescriptor.md)`)` The bottom of the page.
* `page.left (`[`PositionDescriptor`](PositionDescriptor.md)`)` The left side of the page.
* `page.center (`[`PositionDescriptor`](PositionDescriptor.md)`)` Horizontal center: midway between right and left.
* `page.middle (`[`PositionDescriptor`](PositionDescriptor.md)`)` Vertical middle: midway between top and bottom.
* `page.width (`[`SizeDescriptor`](SizeDescriptor.md)`)` Width of the page.
* `page.height (`[`SizeDescriptor`](SizeDescriptor.md)`)` Height of the page.

Example:

```javascript
var page = frame.page();
sidebar.right.should.equal(page.right);    // The sidebar is flush with the right side of the page
sidebar.height.should.equal(page.height);  // The sidebar height is the same as the page height
```
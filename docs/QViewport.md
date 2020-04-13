# Quixote API: `QViewport`

* [Back to overview README](../README.md)
* [Back to API overview](api.md)

`QViewport` instances represent the part of the page that's visible in the test frame, not including scrollbars. You can get an instance by calling [`QFrame.viewport()`](QFrame.md#frameviewport). You'll use its properties in your assertions.


## Properties

Use these properties in your assertions.

**Compatibility Notes:**

* Although there *is* a standard way to get the dimensions of the viewport, and we've confirmed that it works on our [tested browsers](../build/config/tested_browsers.js), it may not be supported properly by all browsers. If you use these properties, perform a visual check to make sure they're working as expected. If they aren't, please file an issue.

* In particular, the current solution for viewport dimensions only works on pages in standards mode. Specifically, they have been tested on pages using `<!DOCTYPE html>`. They do *not* work on pages without a doctype. If support for another doctype is important to you, please let us know by opening an issue.

* Older versions of Mobile Safari ignored the `width` and `height` attributes on an iframe, as described in the compatibility note for [`quixote.createFrame()`](quixote.md#quixotecreateframe). This can result in viewport properties returning larger-than-expected values.

**Pixel Rounding Note:** Browsers handle pixel rounding in different ways. We consider pixel values to be the same if they're within 0.5px of each other. If you have rounding errors that are *greater* than 0.5px, make sure your test browsers are set to a zoom level of 100%. Zooming can exaggerate rounding errors.


### Positions and Sizes

```
Stability: 3 - Stable
```

These properties describe the dimension of the viewport. By them in your element assertions, you can assert what's visible to the user.

* `viewport.top (`[`PositionDescriptor`](PositionDescriptor.md)`)` The highest visible part of the page.
* `viewport.right (`[`PositionDescriptor`](PositionDescriptor.md)`)` The rightmost visible part of the page.
* `viewport.bottom (`[`PositionDescriptor`](PositionDescriptor.md)`)` The lowest visible part of the page.
* `viewport.left (`[`PositionDescriptor`](PositionDescriptor.md)`)` The leftmost visible part of the page.
* `viewport.center (`[`PositionDescriptor`](PositionDescriptor.md)`)` Horizontal center: midway between right and left.
* `viewport.middle (`[`PositionDescriptor`](PositionDescriptor.md)`)` Vertical middle: midway between top and bottom.
* `viewport.width (`[`SizeDescriptor`](SizeDescriptor.md)`)` Width of the viewport.
* `viewport.height (`[`SizeDescriptor`](SizeDescriptor.md)`)` Height of the viewport.

Example:

```javascript
var viewport = frame.viewport();
disclaimer.bottom.should.equal(viewport.bottom);  // The disclaimer should be flush to the bottom of the viewport
disclaimer.width.should.equal(viewport.width);    // The disclaimer width should equal the viewport width
```

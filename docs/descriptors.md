# Quixote API: Descriptors

Descriptors represent some aspect of how an element is displayed, such as its width or the position of its top edge.

[Return to the API overview.](api.md)

[Return to the overview README.](../README.md)

**Compatibility Note:** We make every attempt to ensure that descriptors work identically across browsers. If you discover a cross-browser incompatibility that doesn't correspond to an actual, visible difference, please file an issue.

**Pixel Rounding Note:** Browsers handle pixel rounding in different ways. We consider pixel values to be the same if they're within 0.5px of each other. If you have rounding errors that are *greater* than 0.5px, make sure your test browsers are set to a zoom level of 100%. Zooming can exaggerate rounding errors.


### Element Positions and Sizes

```
Stability: 2 - Unstable
```

The position or size of an element. Includes padding and border, but not margin.

Element positions and sizes are available on all [`QElement`](QElement.md) instances.

* `top (`[`PositionDescriptor`](PositionDescriptor.md)`)` The top edge of the element.
* `right (`[`PositionDescriptor`](PositionDescriptor.md)`)` The right edge of the element.
* `bottom (`[`PositionDescriptor`](PositionDescriptor.md)`)` The bottom edge of the element.
* `left (`[`PositionDescriptor`](PositionDescriptor.md)`)` The left edge of the element.
* `center (`[`PositionDescriptor`](PositionDescriptor.md)`)` Horizontal center: midway between the right and left edges.
* `middle (`[`PositionDescriptor`](PositionDescriptor.md)`)` Vertical middle: midway between the top and bottom edges.
* `width (`[`SizeDescriptor`](SizeDescriptor.md)`)` Width of the element.
* `height (`[`SizeDescriptor`](SizeDescriptor.md)`)` Height of the element.

Example: "The logo matches the height of the navbar and is aligned to its right edge."

```javascript
logo.assert({
  height: navbar.height,
  right: navbar.right
});
```


### Viewport Positions and Sizes

```
Stability: 1 - Experimental
```

The viewport is the part of the webpage you can see, not including scrollbars. Viewport positions and sizes provide information about what parts of the webpage are actually visible. They're most useful as a basis of comparison with element positions and sizes.

Viewport positions and sizes are available on [`QFrame.viewport()`](QFrame.md).

* `top (`[`PositionDescriptor`](PositionDescriptor.md)`)` The highest visible part of the page.
* `right (`[`PositionDescriptor`](PositionDescriptor.md)`)` The rightmost visible part of the page.
* `bottom (`[`PositionDescriptor`](PositionDescriptor.md)`)` The lowest visible part of the page.
* `left (`[`PositionDescriptor`](PositionDescriptor.md)`)` The leftmost visible part of the page.
* `center (`[`PositionDescriptor`](PositionDescriptor.md)`)` Horizontal center: midway between right and left.
* `middle (`[`PositionDescriptor`](PositionDescriptor.md)`)` Vertical middle: midway between top and bottom.
* `width (`[`SizeDescriptor`](SizeDescriptor.md)`)` Width of the viewport.
* `height (`[`SizeDescriptor`](SizeDescriptor.md)`)` Height of the viewport.

Example: "The cookie disclaimer stretches across the bottom of the viewport."

```javascript
var viewport = frame.viewport();
disclaimer.assert({
  bottom: viewport.bottom,
  width: viewport.width
});
```

**Compatibility Notes:**

* Although there *is* a standard way to get the dimensions of the viewport, and we've confirmed that it works on our [tested browsers](../build/config/tested_browsers.js), it may not be supported properly by all browsers. If you use these descriptors, perform a visual check to make sure it's working as expected, and please report compatibility problems.

* In particular, the current solution for viewport dimensions only works on pages in standards mode. Specifically, they have been tested on pages using `<!DOCTYPE html>`. It does *not* work on pages without a doctype. If support for an alternate (or no) doctype is important to you, please let us know by opening an issue.

* Mobile Safari sometimes ignores the `width` and `height` attributes on an iframe, as described in the compatibility note for [`quixote.createFrame()`](quixote.md). This can result in the viewport being larger than expected.


### Page Positions and Sizes

```
Stability: 1 - Experimental
```

The page is everything the user can see or scroll to, not including scrollbars. It's at least the size of the viewport. Page positions and sizes provide information about the boundaries of the page. They're most useful as a basis of comparison with element positions and sizes.

Page positions and sizes are available on [`QFrame.page()`](QFrame.md).

* `top (`[`PositionDescriptor`](PositionDescriptor.md)`)` The top of the page.
* `right (`[`PositionDescriptor`](PositionDescriptor.md)`)` The right side of the page.
* `bottom (`[`PositionDescriptor`](PositionDescriptor.md)`)` The bottom of the page.
* `left (`[`PositionDescriptor`](PositionDescriptor.md)`)` The left side of the page.
* `center (`[`PositionDescriptor`](PositionDescriptor.md)`)` Horizontal center: midway between right and left.
* `middle (`[`PositionDescriptor`](PositionDescriptor.md)`)` Vertical middle: midway between top and bottom.
* `width (`[`SizeDescriptor`](SizeDescriptor.md)`)` Width of the page.
* `height (`[`SizeDescriptor`](SizeDescriptor.md)`)` Height of the page.

Example: "The sidebar extends down the left side of the page."

```javascript
var page = frame.page();
sidebar.assert({
  left: page.left,
  height: page.height
});
```

**Compatibility Notes:**

* There is no standard way to get the dimensions of the page. We have implemented a solution that works on our [tested browsers](../build/config/tested_browsers.js), but it may not work on all browsers. If you use these descriptors, perform a visual check to make sure they're working as expected, and please report compatibility problems.

* In particular, the current solution for page dimensions only works on pages in standards mode. Specifically, they have been tested on pages using `<!DOCTYPE html>`. It does *not* work on pages without a doctype. If support for an alternate (or no) doctype is important to you, please let us know by opening an issue.


### Descriptor API

All descriptors implement the following method. In most cases, you won't need to call this method directly. Instead, use [`QElement.assert()`](QElement.md) or [`QElement.diff()`](QElement.md).


#### diff()

```
Stability: 2 - Unstable
```

Compare the descriptor to an expected value, which may be another descriptor. Throws an exception if the value isn't comparable to the descriptor.

This is the same as calling [`QElement.diff()`](QElement.md), except that it operates on just one descriptor at a time.

`diff = descriptor.diff(expected)`

* `diff (string)` A human-readable description of any differences found, or an empty string if none.

* `expected (any)` The expected value.

Example: `var diff = element.top.diff(otherElement.top);`


### Descriptor: `ElementSize`

```
Stability: 2 - Unstable
```

Represents the width or height of an element.

Example: The width of an element is the same as its height: `element.assert({ width: element.height });`

Chainable descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(multiplier) (SizeMultiple)` A multiple or fraction.


### Descriptor: `ViewportSize`

```
Stability: 1 - Experimental
```

Represents the width or height of the viewport (that is, the visible portion of the webpage), not including scrollbars.

Example: An element is as wide as the viewport: `element.assert({ width: frame.viewport().width });`

Chainable descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(multiplier) (SizeMultiple)` A multiple or fraction.

**Compatibility Note:** Mobile Safari ignores the `width` and `height` attributes on an iframe, as described in the compatibility note for [`quixote.createFrame()`](quixote.md). We work around the problem by putting the frame in a scrollable container, but the underlying frame is still full size, and the results from this descriptor reflect that fact.


### Descriptor: `PageSize`

```
Stability: 1 - Experimental
```

Represents the width or height of everything the user can see or scroll to. Doesn't include scrollbars, but does include the entire viewport, even if the document is smaller than the viewport.

Example: An element spans the entire width of the page, even if the page is wider than the body (it can happen): `element.assert({ width: frame.page().width });`

Chainable descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(multiplier) (SizeMultiple)` A multiple or fraction.

**Compatibility Note:** There is no standard way to get the size of the page (or document). We have implemented a solution that works on our tested browsers, but it may not work on all browsers. If you use this descriptor, perform a visual check to make sure it's working as expected, and please report compatibility problems.


### Descriptor: `RelativeSize`

```
Stability: 2 - Unstable
```

Represents an adjusted size. `RelativeSize` is created with an `amount`, which may be a number or another descriptor.
 
Example: The element is 20px narrower than the menu: `element.assert({ width: menu.width.minus(20) });`

Chainable descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(multiplier) (SizeMultiple)` A multiple or fraction.


### Descriptor: `SizeMultiple`

```
Stability: 2 - Unstable
```

Represents an adjusted size. `SizeMultiple` is created with a `multiplier`, which must be a number.

Example: The element is a golden rectangle: `element.assert({ width: element.height.times(1.618) });`

Chainable descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(multiplier) (SizeMultiple)` A multiple or fraction.

# Quixote API: Descriptors

Descriptors represent some aspect of how an element is displayed, such as its width or the position of its top edge.

[Return to the API overview.](api.md)

[Return to the overview README.](../README.md)


### Descriptor Chaining

A descriptor may have properties or methods that return additional descriptors. Those chaining options are documented with each descriptor, below.

Example: `element.assert({ bottom: otherElement.top.plus(10) });`


### Common API

All descriptors implement the following API. In most cases, you won't need to call this method directly. Instead, use [`QElement.assert()`](QElement.md) or [`QElement.diff()`](QElement.md).


#### diff()

```
Stability: 2 - Unstable
```

Compare the descriptor's value to a hardcoded value or another descriptor's value. This is the same as calling [`QElement.diff()`](QElement.md), except that it operates on just one descriptor at a time. Throws an exception if the expected value isn't compatible with the descriptor.

`diff = descriptor.diff(expected)`

* `diff (string)` A human-readable description of any differences found, or an empty string if none.

* `expected (any)` The expected value as a descriptor or hardcoded value.

Example: `var diff = element.top.diff(otherElement.top);`


### Descriptor: `ElementEdge`

```
Stability: 2 - Unstable
```

Represents the position of one side of an element (the top, left, etc.) relative to the top-left corner of the document. The position includes padding and border, but not margin.

Example: The right side of the logo is flush with the right of the navbar: `logo.assert({ right: navbar.right });`

Chainable descriptors:
 
* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.


### Descriptor: `ViewportEdge`

```
Stability: 1 - Experimental
```

Represents the position of one side of the viewport (that is, the visible portion of the webpage) relative to the top-left corner of the document. Doesn't include scrollbars.

Example: An element is fixed to the bottom of the viewport: `element.assert({ bottom: frame.viewport().bottom });`

Chainable descriptors:

* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.

**Compatibility Note:** Mobile Safari ignores the `width` and `height` attributes on an iframe, as described in the compatibility note for [`quixote.createFrame()`](quixote.md). We work around the problem by putting the frame in a scrollable container, but the underlying frame is still full size, so the viewport is also full size.


### Descriptor: `PageEdge`

```
Stability: 1 - Experimental
```

Represents the position of one side of the page (that is, everything the user can see or scroll to). Doesn't include scrollbars, but does include the entire viewport, even if the document is smaller than the viewport.

Example: An element is flush with the right-hand side of the page: `element.assert({ right: frame.page().right });`

Chainable descriptors:

* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.

**Compatibility Note:** There is no standard way to get the size of the page (or document). We have implemented a solution that works on our tested browsers, but it may not work on all browsers. If you use this descriptor, perform a visual check to make sure it's working as expected, and please report compatibility problems.


### Descriptor: `ElementCenter`

```
Stability: 2 - Unstable
```

Represents the horizontal center or vertical middle of an element.

Example: The center of the element is centered with the menu: `element.assert({ center: menu.center });`

Chainable descriptors:
 
* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.


### Descriptor: `RelativePosition`

```
Stability: 2 - Unstable
```

Represents an adjusted position. `RelativePosition` is created with an `amount`, which may be a number or another descriptor.
 
Example: The top of the element is 10px below the bottom of the menu: `element.assert({ top: menu.bottom.plus(10) });`

Chainable descriptors:

* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.


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

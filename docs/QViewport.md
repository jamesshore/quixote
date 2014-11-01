# Quixote API: `QViewport`

Contains descriptor properties for the test frame's viewport: the part of the webpage that you can see, not including scrollbars. Use the properties on this class to make assertions about how elements relate to the viewport.

[Return to the API overview.](api.md)

[Return to the overview README.](../README.md)


#### Descriptors

```
Stability: 1 - Experimental
```

QViewport instances have several descriptor properties. You'll typically use these properties as comparisons for [`QElement.assert()`](QElement.md) or [`QElement.diff()`](QElement.md).

* `top, right, bottom, left (`[`ViewportEdge`](descriptors.md)`)` Top, right, etc. edge of viewport
* `center, middle (`[`Center`](descriptors.md)`)` Horizontal center and vertical middle of viewport
* `width, height (`[`ViewportSize`](descriptors.md)`)` Width and height of viewport

Example: The element is as wide as the viewport: `element.assert({ width: frame.viewport().width });`

**Compatibility Notes:**

* Although there is a standard way to get the dimensions of the viewport, it may not be supported by all browsers. We have confirmed that it works on our tested browsers (in some cases; see below), but it may not work on all browsers. If you use the properties on this class, perform a visual check to make sure it's working as expected, and please report compatibility problems.

* The current solution for viewport dimensions only works on pages in standards mode. Specifically, they have been tested on pages using `<!DOCTYPE html>`. It does *not* work on pages without a doctype. If support for an alternate (or no) doctype is important to you, please let us know by opening an issue.

* See also the compatibility and pixel-rounding notes in [QElement's "descriptors" section](QElement.md).

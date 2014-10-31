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

**Notes:** See the compatibility and pixel-rounding notes on [QElement's descriptors](QElement.md).

# Quixote API: `QPage`

Contains descriptor properties for the test frame's page: everything you can see or scroll to, not including scrollbars. Includes the entire viewport (the part of the test frame you can see), even if the document is smaller than the viewport.

Use the properties on this class to make assertions about how elements relate to the page.

[Return to the API overview.](api.md)

[Return to the overview README.](../README.md)


#### Descriptors

```
Stability: 1 - Experimental
```

QPage instances have several descriptor properties. You'll typically use these properties as comparisons for [`QElement.assert()`](QElement.md) or [`QElement.diff()`](QElement.md).

* `top, right, bottom, left (`[`PageEdge`](descriptors.md)`)` Top, right, etc. edge of the page
* `center, middle (`[`Center`](descriptors.md)`)` Horizontal center and vertical middle of the page
* `width, height (`[`PageSize`](descriptors.md)`)` Width and height of the page

Example: The element extends the entire height of the page:

```javascript
var page = frame.page();
element.assert({
  top: page.top,
  height: page.height
});
```

**Compatibility Notes:**

* There is no standard way to get the dimensions of the page. We have implemented a solution that works on our tested browsers, but it may not work on all browsers. If you use the properties on this class, perform a visual check to make sure it's working as expected, and please report compatibility problems.

* The current solution for page dimensions only works on pages in standards mode. Specifically, they have been tested on pages using `<!DOCTYPE html>`. It does *not* work on pages without a doctype. If support for an alternate (or no) doctype is important to you, please let us know by opening an issue.

* See also the compatibility and pixel-rounding notes in [QElement's "descriptors" section](QElement.md).

# Quixote API: `ElementRendered`

* [Back to overview README.](../README.md)
* [Back to API overview.](api.md)
* [Back to descriptor overview.](descriptors.md)

The ElementRendered descriptor represents whether an element is rendered on the page or not. It also has sub-descriptors that describe which parts of the element are rendered. An element is non-rendered when:

* It isn't part of the DOM (for example, if [`QElement.remove()`](QElement.md#elementremove) has been called).
* The `display:none` CSS property is set.
* The element is positioned outside of the page boundaries.
* The element has no width or no height.
* The element or one of its ancestors has set the `clip` property in a way that clips the element out of existence.
* One of the element's ancestors has set the `overflow` property in a way that clips the element out of existence or results in it being entirely outside the ancestor's visible scroll area.

Note that an element can be rendered, but still be invisible to the user—for example, if it's composed entirely of transparent pixels, or if the `visibility: hidden` property is set, or some other reason.

**Compatibility Notes:** See the compatibility notes listed in the [descriptor overview](descriptors.md#element-rendering).


### Sub-Descriptors

ElementRendered provides additional descriptors:

* `element.rendered.top (`[`PositionDescriptor`](PositionDescriptor.md)`)` Top edge of the rendered part of the element.
* `element.rendered.right (`[`PositionDescriptor`](PositionDescriptor.md)`)` Right edge of the rendered part of the element.
* `element.rendered.bottom (`[`PositionDescriptor`](PositionDescriptor.md)`)` Bottom edge of the rendered part of the element.
* `element.rendered.left (`[`PositionDescriptor`](PositionDescriptor.md)`)` Left edge of the rendered part of the element.
* `element.rendered.center (`[`PositionDescriptor`](PositionDescriptor.md)`)` Horizontal center: midway between right and left.
* `element.rendered.middle (`[`PositionDescriptor`](PositionDescriptor.md)`)` Vertical middle: midway between the top and bottom.
* `element.rendered.width (`[`SizeDescriptor`](SizeDescriptor.md)`)` Width of the rendered part of the element.
* `element.rendered.height (`[`SizeDescriptor`](SizeDescriptor.md)`)` Height of the rendered part of the element.


### Comparisons

```
Stability: 2 - Unstable
```

ElementRendered descriptor assertions may use another ElementRendered descriptor or a boolean.

* The boolean `true` means the element should be rendered.
* The boolean `false` means that element should be non-rendered.


### Examples

#### Comparing to another descriptor

"The render status of the lightbox is the same as the render status of the image."

```javascript
lightbox.assert({
	rendered: image.rendered
});
```

#### Checking render status

"The lightbox should not be rendered."

```javascript
lightbox.assert({
	rendered: false
});
```

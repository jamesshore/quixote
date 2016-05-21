# Quixote API: `ElementRendered`

* [Back to overview README.](../README.md)
* [Back to API overview.](api.md)
* [Back to descriptor overview.](descriptors.md)

The ElementRendered descriptor represents whether an element is rendered on the page or not. Elements that are not part of the DOM aren't rendered, and neither are elements with the `display:none` CSS property.  

Note that this descriptor doesn't provide information about whether an element is visible. An element can be rendered, but still be invisible to the user.


### Comparisons

```
Stability: 1 - Experimental
```

ElementRendered descriptor assertions may use another ElementRendered descriptor, a boolean, or a string. Use the boolean when you want to check whether an element is rendered in general, and the string when you want to check for a specific reason that an element is not rendered.

* The boolean `true` means the element should be rendered.
* The boolean `false` means that element should not be rendered.
* The string `"display:none"` means that the element should have the `display:none` property set. 
* The string `"detached"` means that the element should be detached from the DOM.


### Examples

#### Comparing to another descriptor

"The render status of the lightbox is the same as the render status of the image."

```javascript
lightbox.assert({
	rendered: image
});
```

#### Checking general render status

"The lightbox should not be rendered."

```javascript
lightbox.assert({
	rendered: false
});
```

#### Checking specific render status
 
"The lightbox should not be attached to the DOM."

```javascript
lightbox.assert({
  rendered: "detached"
});
```

### No API

The ElementRendered descriptor has no API.
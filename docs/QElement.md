# Quixote API: `QElement`

* [Back to overview README](../README.md)
* [Back to API overview](api.md)

`QElement` instances represent individual HTML elements. You'll use their properties to make assertions about your elements. You'll use the properties and their assertions most often. For properties that don't exist yet, use [`element.getRawStyle()`](#elementgetrawstyle).


## QElement Properties

Use these properties to make assertions about the element.

**Compatibility Note:** We make every effort to ensure that properties work identically across browsers. If you discover a cross-browser incompatibility that doesn't correspond to an actual, visible difference, please file an issue.

**Pixel Rounding Note:** Browsers handle pixel rounding in different ways. We consider pixel values to be the same if they're within 0.5px of each other. If you have rounding errors that are *greater* than 0.5px, make sure your test browsers are set to a zoom level of 100%. Zooming can exaggerate rounding errors.


### Positions and Sizes

```
Stability: 2 - Unstable
```

These properties include padding and borders (if any), but not margins.

* `top (`[`PositionDescriptor`](PositionDescriptor.md)`)` The top edge of the element.
* `right (`[`PositionDescriptor`](PositionDescriptor.md)`)` The right edge of the element.
* `bottom (`[`PositionDescriptor`](PositionDescriptor.md)`)` The bottom edge of the element.
* `left (`[`PositionDescriptor`](PositionDescriptor.md)`)` The left edge of the element.
* `center (`[`PositionDescriptor`](PositionDescriptor.md)`)` Horizontal center: midway between right and left.
* `middle (`[`PositionDescriptor`](PositionDescriptor.md)`)` Vertical middle: midway between the top and bottom.
* `width (`[`SizeDescriptor`](SizeDescriptor.md)`)` Width of the element.
* `height (`[`SizeDescriptor`](SizeDescriptor.md)`)` Height of the element.

Examples:

```javascript
logo.height.should.equal(10);           // The logo height should equal 10 pixels.
logo.left.should.equal(navbar.height);  // The logo's left edge should be the same as the navbar's left edge.
```


### Element Rendering

```
Stability: 2 - Unstable
```

This property describes whether an element is rendered. "Rendered" means the parts of the element that would be visible on the page if every pixel was opaque. It can include padding and borders but never includes margins. The rendered portion of an element is governed by the following:

* Whether it's part of the DOM (elements that have been removed from the DOM aren't rendered)
* Its width and height (elements with no width or height aren't rendered)
* Its position on the page (anything positioned off-screen is considered non-rendered, unless you could scroll to it)
* The `display` property
* The `clip` property
* The `overflow` property (anything outside of an element's visible area is considered non-rendered, even if you can use the element's scrollbars to scroll to it)

Note that an element can be rendered, but still be invisible to the user—for example, if it's composed entirely of transparent pixels, or if the `visibility: hidden` property is set, or some other reason.

* `rendered (`[`ElementRendered`](ElementRendered.md)`)` Whether any part of the element is rendered.
* `rendered.top (`[`PositionDescriptor`](PositionDescriptor.md)`)` Top edge of the rendered part of the element.
* `rendered.right (`[`PositionDescriptor`](PositionDescriptor.md)`)` Right edge of the rendered part of the element.
* `rendered.bottom (`[`PositionDescriptor`](PositionDescriptor.md)`)` Bottom edge of the rendered part of the element.
* `rendered.left (`[`PositionDescriptor`](PositionDescriptor.md)`)` Left edge of the rendered part of the element.
* `rendered.center (`[`PositionDescriptor`](PositionDescriptor.md)`)` Horizontal center: midway between right and left.
* `rendered.middle (`[`PositionDescriptor`](PositionDescriptor.md)`)` Vertical middle: midway between the top and bottom.
* `rendered.width (`[`SizeDescriptor`](SizeDescriptor.md)`)` Width of the rendered part of the element.
* `rendered.height (`[`SizeDescriptor`](SizeDescriptor.md)`)` Height of the rendered part of the element.

Example: "The caption doesn't break out of the bottom of the content area."

```javascript
content.assert({
	bottom: caption.rendered.bottom   // The rendered bottom of the caption is the same as the bottom of the content area
});
```

**Compatibility Notes:**

* We do not support the `clip-path` property at this time. If the `clip-path` property is used by an element or its ancestors, none of the `element.rendered` descriptors will work. They'll throw an error instead.

* The `element.rendered` descriptors don't work on IE 8. This is due to bugs in IE 8's reporting of the `clip` property. You can check for IE 8's broken behavior with the [quixote.browser.misreportsClipAutoProperty()](quixote.md#quixotebrowser) browser detect.

* Some browsers, such as IE 11 and Chrome Mobile 44, misreport the value of the `clip` property under certain circumstances. This could cause the `element.rendered` descriptors to throw an error. You can check for this broken behavior with the [quixote.browser.misreportsAutoValuesInClipProperty()](quixote.md#quixotebrowser) browser detect.



## QElement Methods

### element.getRawStyle()

```
Stability: 2 - Unstable
```

Determine how the browser is actually rendering an element's style. This uses [getComputedStyle()](https://developer.mozilla.org/en-US/docs/Web/API/Window.getComputedStyle) under the covers. (On IE 8, it uses [currentStyle](http://msdn.microsoft.com/en-us/library/ie/ms535231%28v=vs.85%29.aspx)).

`style = element.getRawStyle(property)`

* `style (string)` The browser's computed style, or an empty string if the style wasn't recognized.
 
* `property (string)` The name of the property to retrieve. Should always be written in kebab-case, even on IE 8.

Example: `var fontSize = element.getRawStyle("font-size");`

**Compatibility Note:** `getRawStyle` does *not* attempt to resolve cross-browser differences, with two exceptions:

* IE 8 uses `currentStyle` rather than `getComputedStyle()`, and kebab-case property names are converted to camelCase to match currentStyle's expectation.
* Different browsers return `null`, `undefined`, or `""` when a property can't be found. Quixote always returns `""`. 

**Compatibility Note:** When using `getRawStyle("font-size")`, be aware that Mobile Safari may increase the size of small fonts. (You can prevent this behavior by using `-webkit-text-size-adjust: 100%;` in your CSS.) You can detect this behavior by using [`quixote.browser.enlargesFonts()`](quixote.md#quixotebrowser).


### element.getRawPosition()

```
Stability: 2 - Unstable
```

Determine where an element is displayed within the frame viewport, as computed by the browser. This uses [getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect) under the covers. Note that scrolling the document will cause the position to change. You can use [`QFrame.getRawScrollPosition()`](QFrame.md) to compensate for the effect of scrolling.

`position = element.getRawPosition()`

* `position (object)` The position of the element relative to the top-left corner of the viewport. In other words, if you scroll the document down 10 pixels, `top` will be 10 pixels larger. All values include border and padding, but not margin.
  * `top (number)` top edge
  * `right (number)` right edge
  * `bottom (number)` bottom edge
  * `left (number)` left edge
  * `width (number)` width (right edge minus left edge)
  * `height (number)` height (bottom edge minus top edge)

Example: `var top = element.getRawPosition().top;`

**Compatibility Note:** `getRawPosition()` does *not* attempt to resolve cross-browser differences, with one exception:

* IE 8's `getBoundingClientRect()` does not have `width` or `height` properties, but `getRawPosition()` calculates them from the other properties.


### element.calculatePixelValue()

```
Stability: 2 - Unstable
```

Convert a CSS length string, such as `12em`, to the corresponding number of pixels. The calculation is provided by the browser and takes into account all styles currently in effect on the element.

`pixels = element.calculatePixelValue(length)`

* `pixels (number)` The number of pixels in the length.

* `length (string)` A [CSS length string](https://developer.mozilla.org/en-US/docs/Web/CSS/length). Negative values are supported.

**Compatibility Note:** IE 8 and IE 11 round the `pixels` result to the nearest integer value. You can detect this behavior by using [`quixote.browser.roundsOffPixelCalculations()`](quixote.md#quixotebrowser).


### element.add()

```
Stability: 2 - Unstable
```

Create an element and append it as a child of this element. Throws an exception unless exactly one element is created. (But that one element may contain children.)

`child = element.add(html, nickname)`

* `child (QElement)` The element you created.

* `html (string)` HTML for your element.

* `nickname (optional string)` The name to use when describing your element in error messages. Uses the html by default.

Example: `var foo = element.add("<p>foo</p>", "foo");`


### element.remove()

```
Stability: 2 - Unstable
```

Remove the element from the DOM.

`element.remove()`


### element.parent()

```
Stability: 2 - Unstable
```

Get the element's parent element.

`parent = element.parent()`

* `parent (QElement or null)` The parent element. Null if this element is the frame's body element or if this element has been removed from the DOM.


### element.contains()

```
Stability: 2 - Unstable
```

Determine if this element contains another element.

`isContained = element.contains(otherElement)`

* `isContained (boolean)` True if `element` is an ancestor of `otherElement` or if they are the same element. False otherwise.

* `otherElement (QElement)` The possible child element to check.


### element.toDomElement()

```
Stability: 2 - Unstable
```

Retrieve the underlying [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) DOM element for the frame.
 
`dom = element.toDomElement()`

* `dom (`[`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)`)` The DOM element.


### element.assert()

```
Stability: 0 - Deprecated
```

Check whether the element's properties match a set of expected values. If they match, nothing happens; if they don't match, this method throws an exception explaining the difference.

`element.assert(expected, message)`

* `expected (object)` An object containing one or more [QElement properties](#properties) (`top`, `right`, etc.) as keys, along with the expected value as another property or a hard-coded value.

* `message (optional string)` A message to include when the assertion fails and an exception is thrown.

Example:

```javascript
element.assert({
  top: 13,                   // compare to a hard-coded value
  bottom: otherElement.top   // compare to another descriptor
});
```

**Deprecation Warning:** This method may be removed in a future release. Use the `should` assertions available on QElement's [properties](#properties) instead.


### element.diff()

```
Stability: 0 - Deprecated
```

Compare the element's descriptors to a set of expected values. This is the same as [`QElement.assert()`](#elementassert), except that it returns a string rather than throwing an exception.

`diff = element.diff(expected)`

* `diff (string)` A human-readable description of any differences found, or an empty string if none.

* `expected (object)` An object containing one or more [QElement descriptors](descriptors.md) (`top`, `right`, etc.) as keys, along with the expected value as [another descriptor](descriptors.md) or hard-coded value.

**Deprecation Warning:** This method may be removed in a future release. Use the `should` assertions available on QElement's [properties](#properties) instead.

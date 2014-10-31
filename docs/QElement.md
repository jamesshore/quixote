# Quixote API: `QElement`

`QElement` instances represent individual HTML tags. You'll use them to get information about how the elements on your page are styled.

[Return to the API overview.](api.md)

[Return to the overview README.](../README.md)


#### Descriptors

```
Stability: 1 - Experimental
```

QElement instances have several descriptor properties that can be used to make assertions about your element. You'll typically use these properties with `QElement.assert()` or `QElement.diff()`. 
 
* `top, right, bottom, left (`[`ElementEdge`](descriptors.md)`)` Top, right, etc. edge of the element
* `center, middle (`[`Center`](descriptors.md)`)` Horizontal center and vertical middle of the element
* `width, height (`[`ElementSize`](descriptors.md)`)` Width and height of the element

**Compatibility Note:** We make every attempt to ensure that these properties work the same across browsers. If you discover a cross-browser incompatibility that's not visible on the actual page, please file an issue.

**Pixel Rounding Note:** Browsers handle pixel rounding in different ways. We consider pixel values to be the same if they're within 0.5px of each other.

If you have rounding errors that are *greater* than 0.5px, make sure your test browsers are set to a zoom level of 100%. Zooming can exaggerate rounding errors.


#### element.assert()

```
Stability: 2 - Unstable
```

Compare the element's properties to a set of expected values and throw an exception if they don't match. This is the same as `diff()` (below), except that it throws an exception rather than returning a value.

`element.assert(expected, message)`

* `expected (object)` An object containing one or more of the above-listed properties (`top`, `right`, etc.) as keys, along with the expected value as a hard-coded value or another property.

* `message (optional string)` If an exception is thrown, this message will be included at the beginning.

Example: `element.assert({ top: 13, bottom: otherElement.top.plus(10) });`


#### element.diff()

```
Stability: 2 - Unstable
```

Compare the element's properties to a set of expected values. This is the same as `assert()` (above), except that it returns a value rather than throwing an exception.

`diff = element.diff(expected)`

* `diff (string)` A human-readable description of any differences found, or an empty string if none.

* `expected (object)` An object containing one or more of the above-listed properties (`top`, `right`, etc.) as keys, along with the expected value as a hard-coded value or another property.

Example: `assert.equal(element.diff({ top: 13, bottom: otherElement.top.plus(10) }), "");`


#### element.getRawStyle()

```
Stability: 2 - Unstable
```

Determine how the browser is actually rendering an element's style. This uses [getComputedStyle()](https://developer.mozilla.org/en-US/docs/Web/API/Window.getComputedStyle) under the covers. (On IE 8, it uses [currentStyle](http://msdn.microsoft.com/en-us/library/ie/ms535231%28v=vs.85%29.aspx)).

`style = element.getRawStyle(property)`

* `style (string)` The browser's computed style, or an empty string if the style wasn't recognized.
 
* `property (string)` The name of the property to retrieve. Should always be written in snake-case, even on IE 8.

Example: `var fontSize = element.getRawStyle("font-size");`

**Compatibility Note:** `getRawStyle` does *not* attempt to resolve cross-browser differences, with two exceptions:

* IE 8 uses `currentStyle` rather than `getComputedStyle()`, and snake-case property names are converted to camelCase to match currentStyle's expectation.
* Different browsers return `null`, `undefined`, or `""` when a property can't be found. Quixote always returns `""`. 


#### element.getRawPosition()

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


#### element.toDomElement()

```
Stability: 1 - Experimental
```

Retrieve the underlying [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) DOM element for the frame.
 
`dom = element.toDomElement()`

* `dom (`[`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)`)` The DOM element.

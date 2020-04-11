# Quixote API: `QElement`

* [Back to overview README](../README.md)
* [Back to API overview](api.md)

`QElement` instances represent individual HTML elements. You'll use them to make assertions about your elements. The methods you'll use most often are [`element.assert()`](#elementassert), for making style assertions, and [`element.getRawStyle()`](#elementgetrawstyle), for getting styles that [`element.assert()`](#elementassert) doesn't support yet.


#### Descriptors

QElement instances have several descriptor properties. They are documented in the [descriptor list](descriptors.md).


#### element.assert()

```
Stability: 2 - Unstable
```

Check whether the element's descriptors match a set of expected values. If they match, nothing happens; if they don't match, this method throws an exception explaining the difference.

`element.assert(expected, message)`

* `expected (object)` An object containing one or more [QElement descriptors](descriptors.md) (`top`, `right`, etc.) as keys, along with the expected value as [another descriptor](descriptors.md) or a hard-coded value.

* `message (optional string)` A message to include when the assertion fails and an exception is thrown.

Example:

```javascript
element.assert({
  top: 13,                   // compare to a hard-coded value
  bottom: otherElement.top   // compare to another descriptor
});
```

#### element.diff()

```
Stability: 2 - Unstable
```

Compare the element's descriptors to a set of expected values. This is the same as [`QElement.assert()`](#elementassert), except that it returns a string rather than throwing an exception.

`diff = element.diff(expected)`

* `diff (string)` A human-readable description of any differences found, or an empty string if none.

* `expected (object)` An object containing one or more [QElement descriptors](descriptors.md) (`top`, `right`, etc.) as keys, along with the expected value as [another descriptor](descriptors.md) or hard-coded value.


#### element.getRawStyle()

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


#### element.calculatePixelValue()

```
Stability: 2 - Unstable
```

Convert a CSS length string, such as `12em`, to the corresponding number of pixels. The calculation is provided by the browser and takes into account all styles currently in effect on the element.

`pixels = element.calculatePixelValue(length)`

* `pixels (number)` The number of pixels in the length.

* `length (string)` A [CSS length string](https://developer.mozilla.org/en-US/docs/Web/CSS/length). Negative values are supported.

**Compatibility Note:** IE 8 and IE 11 round the `pixels` result to the nearest integer value. You can detect this behavior by using [`quixote.browser.roundsOffPixelCalculations()`](quixote.md#quixotebrowser).


#### element.add()

```
Stability: 2 - Unstable
```

Create an element and append it as a child of this element. Throws an exception unless exactly one element is created. (But that one element may contain children.)

`child = element.add(html, nickname)`

* `child (QElement)` The element you created.

* `html (string)` HTML for your element.

* `nickname (optional string)` The name to use when describing your element in error messages. Uses the html by default.

Example: `var foo = element.add("<p>foo</p>", "foo");`


#### element.remove()

```
Stability: 2 - Unstable
```

Remove the element from the DOM.

`element.remove()`


#### element.parent()

```
Stability: 2 - Unstable
```

Get the element's parent element.

`parent = element.parent()`

* `parent (QElement or null)` The parent element. Null if this element is the frame's body element or if this element has been removed from the DOM.


#### element.contains()

```
Stability: 2 - Unstable
```

Determine if this element contains another element.

`isContained = element.contains(otherElement)`

* `isContained (boolean)` True if `element` is an ancestor of `otherElement` or if they are the same element. False otherwise.

* `otherElement (QElement)` The possible child element to check.


#### element.toDomElement()

```
Stability: 2 - Unstable
```

Retrieve the underlying [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) DOM element for the frame.
 
`dom = element.toDomElement()`

* `dom (`[`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)`)` The DOM element.

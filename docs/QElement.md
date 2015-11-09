# Quixote API: `QElement`

* [Back to overview README](../README.md)
* [Back to API overview](api.md)

`QElement` instances represent individual HTML elements. You'll use them to make assertions about your elements. The methods you'll use most often are [`element.assert()`](#elementassert), for making style assertions, and [`element.getRawStyle()`](#elementgetrawstyle), for getting styles that `element.assert()` doesn't support yet.


#### Descriptors

QElement instances have several descriptor properties. They are documented in the [descriptor list](descriptors.md).


#### element.assert()

```
Stability: 2 - Unstable
```

Check whether the element's descriptors match a set of expected values. If they match, nothing happens; if they don't match, this method throws an exception with a useful explanation.

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

**Compatibility Note:** When using `getRawStyle("font-size")`, be aware that Mobile Safari may increase the size of small fonts. (You can prevent this behavior by using `-webkit-text-size-adjust: 100%;` in your CSS.) You can detect this behavior by using [`quixote.browser.enlargesFonts()`](quixote.md#browser).


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

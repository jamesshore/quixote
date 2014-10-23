# Quixote API

For a Quixote overview, installation notes, and an example, see [the readme](../README.md).


## Compatibility

**The API will change!** This is an early version. Don't use this code if you don't want to be on the bleeding edge.

Class names may change at any time. Don't construct classes manually or refer to them by name. Any object you need can be obtained from a property or method call.

Breaking changes to any property or method documented here will be mentioned in the [change log](CHANGELOG.md). All other properties and methods should be considered non-public and subject to change at any time.


## Table of Contents

There are three primary classes and modules:

* [`quixote`](quixote.md) is your entry point. It allows you to create a iframe for testing.
* [`Frame`](Frame.md) is how you manipulate the DOM inside your test frame.
* [`QElement`](QElement.md) allows you to make assertions and get information.

Your assertions (using `QElement.assert()` or `QElement.diff()`) will use properties or methods that return "Descriptors." They're documented here:

* [Descriptors](descriptors.md) describe some aspect of an element and its CSS.


## Summary

These are the methods you'll use most often:

* `quixote.createFrame(width, height, options, callback(err, frame))` creates the test frame. Call this once per test suite.

* `frame.remove()` removes the test frame. Call this once per test suite.

* `frame.reset()` resets the test frame. Call this before or after each test to reset to a known-good state. (This is faster than creating a new frame each time.)

* `element = frame.getElement(selector)` gets an element out of the frame. Call this for each element you want to test.
 
* `element.assert({ property, property, ... });` checks the styling of an element. Call this in each test.

* `element.getRawStyle(style)` looks up a specific CSS style. You can use it for anything `assert()` doesn't support yet.

The `assert()` function looks at the properties of your element and checks them against hardcoded values *or* other element's properties. For example, `element.assert({ top: 10 });` or `element.assert({ top: otherElement.bottom })`.


### Class: `QElement`

`QElement` instances represent individual HTML tags. You'll use them to get information about how the elements on your page are styled.


#### Descriptors

QElement instances have several descriptor properties that can be used to make assertions about your element. You'll typically use these properties with `QElement.assert()` or `QElement.diff()` method. 
 
Descriptors are documented in more detail under their class names, below.
 
* `top, right, bottom, left (ElementEdge)` Top, right, etc. edge of the element
* `center, middle (ElementCenter)` Horizontal center and vertical middle of the element
* `width, height (ElementSize)` Width and height of the element

**Compatibility Note:** We make every attempt to ensure that these properties work the same across browsers. If there's a cross-browser difference that doesn't show up in the actual page, please file an issue.

**Pixel Rounding Note:** Browsers handle pixel rounding in different ways. As a result, if two values are within 0.5px of each other, we consider them to be the same. This only applies to pixel values, not all numbers.

If you discover that you're having rounding errors that are *greater* than 0.5px, make sure your test browsers are set to a zoom level of 100%. Zooming can exaggerate rounding errors.


#### element.assert()

Compare the element's properties to a set of expected values and throw an exception if they don't match. This is the same as `diff()` (below), except that it throws an exception rather than returning a value.

`element.assert(expected, message)`

* `expected (object)` An object containing one or more of the above-listed properties (`top`, `right`, etc.) as keys, along with the expected value as a number or another property.

* `message (optional string)` If an exception is thrown, this message will be included at the beginning.

Example: `element.assert({ top: 13, bottom: otherElement.top.plus(10) });`


#### element.diff()

Compare the element's properties to a set of expected values. This is the same as `assert()` (above), except that it returns a value rather than throwing an exception.

`diff = element.diff(expected)`

* `diff (string)` A human-readable description of any differences found, or an empty string if none.

* `expected (object)` An object containing one or more of the above-listed properties (`top`, `right`, etc.) as keys, along with the expected value as a number or another property.

Example: `assert.equal(element.diff({ top: 13, bottom: otherElement.top.plus(10) }), "");`


#### element.getRawStyle()

Determine how an element displays a particular style, as computed by the browser. This uses [getComputedStyle()](https://developer.mozilla.org/en-US/docs/Web/API/Window.getComputedStyle) under the covers. (On IE 8, it uses [currentStyle](http://msdn.microsoft.com/en-us/library/ie/ms535231%28v=vs.85%29.aspx)).

`style = element.getRawStyle(property)`

* `style (string)` The browser's computed style, or an empty string if the style wasn't recognized.
 
* `property (string)` The name of the property to retrieve. Should always be written in snake-case, even on IE 8.

Example: `var fontSize = element.getRawStyle("font-size");`

**Compatibility Note:** `getRawStyle` does *not* attempt to resolve cross-browser differences, with two exceptions:

* IE 8 uses `currentStyle` rather than `getComputedStyle()`, and snake-case property names are converted to camelCase to match currentStyle's expectation.
* Different browsers return `null`, `undefined`, or `""` when a property can't be found. Quixote always returns `""`. 


#### element.getRawPosition()

Determine where an element is displayed within the frame viewport, as computed by the browser. This uses [getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect) under the covers. Note that scrolling the document will cause the position to change.

`position = element.getRawPosition()`

* `position (object)` The position of the element relative to the top of the viewport. In other words, if you scroll the viewport down 10 pixels, `top` will be 10 pixels smaller. All values include border and padding, but not margin.
  * `top (number)` top edge
  * `right (number)` right edge
  * `bottom (number)` bottom edge
  * `left (number)` left edge
  * `width (number)` width (right edge minus left edge)
  * `height (number)` height (bottom edge minus top edge)

Example: `var top = element.getRawPosition().top;`

**Compatibility Note:** `getRawPosition()` does *not* attempt to resolve cross-browser differences, with one exception:

* IE 8's `getBoundingClientRect()` does not have `width` or `height` properties, but `getRawPosition()` does, even on IE 8. It calculates them from the other properties.


### Descriptor: `ElementEdge`

Represents the position of one side of an element (the top, left, etc.). The position includes padding and border, but not margin. Get an ElementEdge from `QElement` with a property such as `element.top`.

Example: The left side of the element is aligned with the left side of the menu: `element.assert({ left: logo.left });`

#### Additional descriptors

ElementEdge provides access to additional descriptors:
 
* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.


### Descriptor: `ElementCenter`

Represents the horizontal center or vertical middle of an element. Get an ElementCenter from `QElement` with a property such as `element.center`.

Example: The center of the element is centered with the menu: `element.assert({ center: menu.center });`

#### Additional descriptors

ElementEdge provides access to additional descriptors:
 
* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.


### Descriptor: `RelativePosition`

Represents an adjusted position. Get a RelativePosition by calling `plus(amount)` or `minus(amount)` on another descriptor. `amount` may be a number or another descriptor.
 
Example: The top of the element is 10px below the bottom of the menu: `element.assert({ top: menu.bottom.plus(10) });`

#### Additional descriptors

RelativePosition provides access to additional descriptors:

* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.


### Descriptor: `ElementSize`

Represents the width or height of an element. Get an ElementSize from `QElement` with a property such as `element.width`.

Example: The width of an element is the same as its height: `element.assert({ width: element.height });

#### Additional descriptors

ElementSize provides access to additional descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(amount) (SizeMultiple)` A multiple or fraction.


### Descriptor: `RelativeSize`

Represents an adjusted size. Get a RelativeSize by calling `plus(amount)` or `minus(amount)` on another descriptor. `amount` may be a number or another descriptor.
 
Example: The element is 20px narrower than the menu: `element.assert({ width: menu.width.minus(20) });`

#### Additional descriptors

RelativeSize provides access to additional descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(amount) (SizeMultiple)` A multiple or fraction.


### Descriptor: `SizeMultiple`

Represents an adjusted size. Get a SizeMultiple by calling `times(muliplier)` on another descriptor. `multiplier` must be a number.

Example: The element is a golden rectangle: `element.assert({ width: element.height.times(1.618) });`

#### Additional descriptors

ElementSize provides access to additional descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(amount) (SizeMultiple)` A multiple or fraction.


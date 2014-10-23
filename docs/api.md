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


# Quixote API: Descriptors

Descriptors describe an aspect of an element and its styling.

[Return to the API overview.](api.md)

[Return to the overview README.](../README.md)


### Descriptor Chaining

Many descriptors provide access to additional descriptors via properties or methods. Those chaining options are documented with each descriptor, below.

Example: `element.assert({ bottom: otherElement.top.plus(10) });`


### Common API

Descriptors all share the same API. In most cases, you won't need to call these methods. Instead, use [`QElement.assert()`](QElement.md) (or `diff()`).


#### diff()

```
Stability: 2 - Unstable
```

Compare the descriptor's value to a hardcoded value or another descriptor's value. This is the same as calling [`QElement.diff()`](QElement.md), except that it operates on just one descriptor at a time.

`diff = descriptor.diff(expected)`

* `diff (string)` A human-readable description of any differences found, or an empty string if none.

* `expected (any)` The expected value as a descriptor or hardcoded value. If the expected value can't be compared to this descriptor, `diff()` will throw an explanatory error.

Example: `(element.diff(otherElement.top);`


#### value()

```
Stability: 2 - Unstable
```

Calculate the value described by the descriptor and return it. It's better to use the descriptor itself for assertions, because you get better error messages. 

`value = descriptor.value()`

* `value (object)` A value object representing the calculated value. Value objects can only be converted to strings or compared to other value objects. 


### Descriptor: `ElementEdge`

```
Stability: 2 - Unstable
```

Represents the position of one side of an element (the top, left, etc.). The position includes padding and border, but not margin. Get an ElementEdge from `QElement` with a property such as `element.top`.

Chainable descriptors:
 
* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.


### Descriptor: `ElementCenter`

```
Stability: 2 - Unstable
```

Represents the horizontal center or vertical middle of an element. Get an ElementCenter from `QElement` with a property such as `element.center`.

Example: The center of the element is centered with the menu: `element.assert({ center: menu.center });`

Chainable descriptors:
 
* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.


### Descriptor: `RelativePosition`

```
Stability: 2 - Unstable
```

Represents an adjusted position. Get a RelativePosition by calling `plus(amount)` or `minus(amount)` on another descriptor. `amount` may be a number or another descriptor.
 
Example: The top of the element is 10px below the bottom of the menu: `element.assert({ top: menu.bottom.plus(10) });`

Chainable descriptors:

* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.


### Descriptor: `ElementSize`

```
Stability: 2 - Unstable
```

Represents the width or height of an element. Get an ElementSize from `QElement` with a property such as `element.width`.

Example: The width of an element is the same as its height: `element.assert({ width: element.height });`

Chainable descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(amount) (SizeMultiple)` A multiple or fraction.


### Descriptor: `RelativeSize`

```
Stability: 2 - Unstable
```

Represents an adjusted size. Get a RelativeSize by calling `plus(amount)` or `minus(amount)` on another descriptor. `amount` may be a number or another descriptor.
 
Example: The element is 20px narrower than the menu: `element.assert({ width: menu.width.minus(20) });`

Chainable descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(amount) (SizeMultiple)` A multiple or fraction.


### Descriptor: `SizeMultiple`

```
Stability: 2 - Unstable
```

Represents an adjusted size. Get a SizeMultiple by calling `times(muliplier)` on another descriptor. `multiplier` must be a number.

Example: The element is a golden rectangle: `element.assert({ width: element.height.times(1.618) });`

Chainable descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(amount) (SizeMultiple)` A multiple or fraction.


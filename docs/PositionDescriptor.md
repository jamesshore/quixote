# Quixote API: `PositionDescriptor`

* [Back to overview README.](../README.md)
* [Back to API overview.](api.md)
* [Back to descriptor overview.](descriptors.md)

`PositionDescriptor` instances represent an X or Y position on the web page. The position of the top-left corner of the page is zero. X positions increase to the right and Y positions increase downward.


## Assertions

Use these methods to make assertions about the position. In all cases, if the assertion is true, nothing happens. Otherwise, the assertion throws an exception explaining why it failed.


### Comparisons

```
Stability: 3 - Stable
```

In the following assertions, `expectedPosition` can be one of the following:

* A `PositionDescriptor` instance, such as `element.top`.
* A number representing an X or Y page coordinate in pixels.
* The string `"none"`, which means the position is not rendered.

#### Example: Compare to another position

```javascript
// "The top of the sidebar should be the same as the bottom of the nav bar."
sidebar.top.should.equal(topNav.bottom);
```

#### Example: Compare to a hard-coded page coordinate

```javascript
// "The logo's left edge should have an X-coordinate of 15."
logo.left.should.equal(15);
```

#### Example: Check whether the position is rendered

Note: Although `PositionDescriptor` can tell you if a position is rendered, it's better to use an [`ElementRendered`](ElementRendered.md) property such as [`QElement.rendered`](QElement.md#element-rendering).

```javascript
// "The light box should not be rendered."
lightbox.top.should.equal("none");      // (not recommended)
lightbox.rendered.should.equal(false);  // (recommended)
```


### position.should.equal()

```
Stability: 3 - Stable
```

Check whether the position matches another position.

`position.should.equal(expectedPosition, message)`

* `expectedPosition ([comparison](#comparisons)` The expected position.

* `message (optional string)` A message to include when the assertion fails and an exception is thrown.

Example:

```javascript
// "The logo should be at the top of the header."
logo.top.should.equal(header.top);
```


## Methods

These methods are useful when you want to compare elements that aren't exactly aligned.


#### position.plus()

```
Stability: 3 - Stable
```

Create a `PositionDescriptor` that is further down the page or to the right.

`position.plus(amount)`

* `amount (`[`SizeDescriptor` comparison](SizeDescriptor.md#comparisons)`)` The number of pixels to move the descriptor.

Example:

```javascript
// "The top of the sidebar should be 10px below the bottom of the navigation bar."
sidebar.top.should.equal(navbar.bottom.plus(10));
```


### position.minus()

```
Stability: 3 - Stable
```

Create a `PositionDescriptor` that is further up the page or to the left.

`position.minus(amount)`

* `amount (`[`SizeDescriptor` comparison](SizeDescriptor.md#comparisons)`)` The number of pixels to move the descriptor.

Example:

```javascript
// "The logo should be 15px from the right side of the navigation bar."
logo.right.should.equal(navbar.right.minus(15));
```


### position.to()

```
Stability: 3 - Stable
```

Create a [`SizeDescriptor`](SizeDescriptor.md) that represents the distance between two positions.

`result = position.to(position2)`

* `descriptor2 ([`PositionDescriptor` comparison](#comparisons)`)` The second position. Must represent the same X or Y axis as this position.

* `result (`[`SizeDescriptor`](SizeDescriptor.md)`)` The distance between this descriptor and `descriptor2`. The result is always positive regardless of their order.

Example:

```javascript
// "The header stretches across both columns."
header.width.should.equal(leftColumn.left.to(rightColumn.right));
```

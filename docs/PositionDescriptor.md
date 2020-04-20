# Quixote API: `PositionDescriptor`

* [Back to overview README.](../README.md)
* [Back to API overview.](api.md)

`PositionDescriptor` instances represent an X or Y position on the web page. The position of the top-left corner of the page is zero. X positions increase to the right and Y positions increase downward.


## Equivalents

```
Stability: 3 - Stable
```

Methods with a `PositionDescriptor equivalent` parameter can take any of the following:

* A `PositionDescriptor` instance, such as `QElement.top`.
* A number representing an X or Y page coordinate in pixels.
* The string `"none"`, which means the position is not rendered.

#### Example: `PositionDescriptor`

```javascript
// "The top of the sidebar should be the same as the bottom of the nav bar."
sidebar.top.should.equal(topNav.bottom);
```

#### Example: `number`

```javascript
// "The logo's left edge should have an X-coordinate of 15."
logo.left.should.equal(15);
```

#### Example: `"none"`

Note: Although `PositionDescriptor` can tell you if a position is rendered, it's better to use an [`ElementRender`](ElementRender.md) property such as [`QElement.render`](QElement.md#element-rendering).

```javascript
// "The light box should not be rendered."
lightbox.top.should.equal("none");      // not recommended
lightbox.render.should.equal(false);  // recommended
```


## Assertions

Use these methods to make assertions about the position. In all cases, if the assertion is true, nothing happens. Otherwise, the assertion throws an exception explaining why it failed.


### Equality

```
Stability: 3 - Stable
```

Check whether two positions match.

* `position.should.equal(expectation, message)` Assert that the position matches the expectation.
* `position.should.notEqual(expectation, message)` Assert that the position does not match the expectation.

Parameters:

* `expectation (PositionDescriptor equivalent)` The position to compare against.

* `message (optional string)` A message to include when the assertion fails.

Example:

```javascript
// "The logo should be at the top of the header."
logo.top.should.equal(header.top);
```


### Relative Positioning

```
Stability: 3 - Stable
```

Check whether a position is above, below, left, or right of another position. A position is "above" the expectation when it's closer to the top of the page, and "below" when it's closer to the bottom of the page.

* `position.should.beAbove(expectation, message)` Assert that the position is above the expectation.
* `position.should.beBelow(expectation, message)` Assert that the position is below the expectation.
* `position.should.beLeftOf(expectation, message)` Assert that the position is to the left of the expectation.
* `position.should.beRightOf(expectation, message)` Assert that the position is to the right of the expectation.

Parameters:

* `expectation (PositionDescriptor equivalent)` The position to compare against. Must be be rendered.

* `message (optional string)` A message to include when the assertion fails.

Example:

```javascript
// "The light box should be below the navbar."
lightbox.top.should.beBelow(navbar.bottom);
```


## Methods

These methods are useful when you want to compare elements that aren't exactly aligned.


### position.plus()

```
Stability: 3 - Stable
```

Create a `PositionDescriptor` that is further down the page or to the right.

`newPosition = position.plus(amount)`

* `newPosition (PositionDescriptor)` The new position.

* `amount (`[`SizeDescriptor equivalent`](SizeDescriptor.md)`)` The number of pixels to increase.

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

`newPosition = position.minus(amount)`

* `newPosition (PositionDescriptor)` The new position.

* `amount (`[`SizeDescriptor equivalent`](SizeDescriptor.md)`)` The number of pixels to decrease.

Example:

```javascript
// "The logo should be 15px from the right side of the navigation bar."
logo.right.should.equal(navbar.right.minus(15));
```


### position.to()

```
Stability: 3 - Stable
```

Create a [`Span`](Span.md) that represents an imaginary line between two positions. Useful for compare distances or midpoints.

`span = position.to(position2, nickname)`

* `span (`[`Span`](Span.md)`)` An imaginary line between `position` and `position2`.

* `position2 (PositionDescriptor or number)` The other end of the imaginary line. Must have the same X or Y axis as `position`.

* `nickname (optional string)` The name to use when describing your span in error messages. Defaults to using the two positions.

Example:

```javascript
// "The header stretches across both columns."
header.width.should.equal(leftColumn.left.to(rightColumn.right));
```

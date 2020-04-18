# Quixote API: `Span`

* [Back to overview README.](../README.md)
* [Back to API overview.](api.md)

`Span` instances represent an imaginary line between two X or Y coordinates. They can be horizontal or vertical, but not diagonal. They are created by [`PositionDescriptor.to()`](PositionDescriptor.md#positionto).

If either end of the span is not rendered, the whole span is considered to be not rendered.


## Assertions

Use these methods to make assertions about the size of the span. In all cases, if the assertion is true, nothing happens. Otherwise, the assertion throws an exception explaining why it failed.

Span sizes are always positive.


### Equality

```
Stability: 3 - Stable
```

Check whether the length of a span matches a size.

* `span.should.equal(expectation, message)` Assert that the span length matches the expectation.
* `span.should.notEqual(expectation, message)` Assert that the span length does not match the expectation.

Parameters:

* `expectation (SizeDescriptor equivalent)` The size to compare against.

* `message (optional string)` A message to include when the assertion fails.

Example:

```javascript
// "The whitespace between the columns should be 20 pixels wide."
leftColumn.right.to(rightColumn.left).should.equal(20);
```


### Relative Positioning

```
Stability: 3 - Stable
```

Check whether the length of the span is bigger or smaller than a size.

* `size.should.beBiggerThan(expectation, message)` Assert that the span is bigger than the expectation.
* `size.should.beSmallerThan(expectation, message)` Assert that the span is smaller than the expectation.

Parameters:

* `expectation (PositionDescriptor equivalent)` The size to compare against. Must be be rendered.

* `message (optional string)` A message to include when the assertion fails.

Example:

```javascript
// "The testimonials should be shorter than the viewport."
firstTestimonial.top.to(lastTestimonial.bottom).should.beSmallerThan(frame.viewport().height);
```


## Properties

Use these properties to make additional assertions about the span.

```
Stability: 3 - Stable
```

* `span.center (`[`PositionDescriptor`](PositionDescriptor.md)`)` The horizontal center of the span. For use with horizontal spans only.
* `span.middle (`[`PositionDescriptor`](PositionDescriptor.md)`)` The vertical middle of the span. For use with vertical spans only.

Example:

```javascript
// "The thumbnail should be centered to the left of the description."
thumbnailImage.center.should.equal(thumbnailComponent.left.to(description.left));
```


## Methods

These methods are useful when you want to compare spans that aren't exactly the same.


### span.plus()

```
Stability: 3 - Stable
```

Create a `SizeDescriptor` that's bigger than this span.

`size = span.plus(amount)`

* `size (`[`SizeDescriptor`](SizeDescriptor.md)`)` The size.

* `amount (`[`SizeDescriptor equivalent`](SizeDescriptor.md)`)` The number of pixels to increase.


#### span.minus()

```
Stability: 3 - Stable
```

Create a `SizeDescriptor` that's smaller than this one.

`size = span.minus(amount)`

* `size (`[`SizeDescriptor`](SizeDescriptor.md)`)` The size.

* `amount (`[`SizeDescriptor equivalent`](SizeDescriptor.md)`)` The number of pixels to decrease.


#### span.times()

```
Stability: 3 - Stable
```

Create a `SizeDescriptor` that's a multiple or fraction of the size of this one.

`size = span.times(multiple)`

* `size (`[`SizeDescriptor`](SizeDescriptor.md)`)` The size.

* `multiple (number)` The number to multiply.

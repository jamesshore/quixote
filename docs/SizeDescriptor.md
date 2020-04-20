# Quixote API: `SizeDescriptor`

* [Back to overview README.](../README.md)
* [Back to API overview.](api.md)

`SizeDescriptor` instances represent an width or a height.


## Equivalents

```
Stability: 3 - Stable
```

Methods with a `SizeDescriptor equivalent` parameter can take any of the following:

* A `SizeDescriptor` instance, such as `QElement.width`.
* A [`Span`](Span.md) instance, such as returned by [`PositionDescriptor.to()`](PositionDescriptor.md#positionto). It represents the length of the span.
* A number representing a width or height in pixels.
* The string `"none"`, which means the size is not rendered.

#### Example: `SizeDescriptor`

```javascript
// "The height of the logo matches the height of the top nav."
logo.height.should.equal(topNav.height);
```

#### Example: `Span`

```javascript
// "The width of the header matches the width of the two columns together."
header.width.should.equal(leftColumn.left.to(rightColumn.right));
```

#### Example: `number`

```javascript
// "The sidebar is 200 pixels wide."
sidebar.width.should.equal(200);
```

#### Example: `"none"`

Note: Although `SizeDescriptor` can tell you if a size is rendered, it's better to use an [`ElementRender`](ElementRender.md) property such as [`QElement.render`](QElement.md#element-rendering).

```javascript
// "The light box should not be rendered."
lightbox.width.should.equal("none");    // not recommended
lightbox.rendered.should.equal(false);  // recommended
```


## Assertions

Use these methods to make assertions about the size. In all cases, if the assertion is true, nothing happens. Otherwise, the assertion throws an exception explaining why it failed.


### Equality

```
Stability: 3 - Stable
```

Check whether two sizes match.

* `size.should.equal(expectation, message)` Assert that the size matches the expectation.
* `size.should.notEqual(expectation, message)` Assert that the size does not match the expectation.

Parameters:

* `expectation (SizeDescriptor equivalent)` The size to compare against.

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

Check whether a size is bigger or smaller than another size.

* `size.should.beBiggerThan(expectation, message)` Assert that the size is bigger than the expectation.
* `size.should.beSmallerThan(expectation, message)` Assert that the size is smaller than the expectation.

Parameters:

* `expectation (SizeDescriptor equivalent)` The size to compare against. Must be be rendered.

* `message (optional string)` A message to include when the assertion fails.

Example:

```javascript
// "The search text field should be smaller than the search dialog."
searchField.width.should.beSmallerThan(searchDialog.width);
```


## Methods

These methods are useful when you want to compare sizes that aren't exactly the same.


### size.plus()

```
Stability: 3 - Stable
```

Create a `SizeDescriptor` that's bigger than this one.

`newSize = size.plus(amount)`

* `newSize (SizeDescriptor)` The new size.

* `amount (SizeDescriptor equivalent)` The number of pixels to increase.

Example:

```javascript
// "The navbar is 12px taller than the logo."
navbar.height.should.equal(logo.height.plus(12));
```


#### size.minus()

```
Stability: 3 - Stable
```

Create a `SizeDescriptor` that's smaller than this one.

`newSize = size.minus(amount)`

* `newSize (SizeDescriptor)` The new size.

* `amount (SizeDescriptor equivalent)` The number of pixels to decrease.

Example:

```javascript
// "The content area is the same width as the navbar, excluding the sidebar."
content.width.should.equal(navbar.width.minus(sidebar.width));
```


#### size.times()

```
Stability: 3 - Stable
```

Create a `SizeDescriptor` that's a multiple or fraction of the size of this one.

`newSize = size.times(multiple)`

* `newSize (SizeDescriptor)` The new size.

* `multiple (number)` The number to multiply.

Example:

```javascript
// "The lightbox is half the width of the viewport."
lightbox.width.should.equal(frame.viewport().width.times(1/2));
```

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
* A number representing a width or height in pixels.
* The string `"none"`, which means the size is not rendered.

#### Example: `SizeDescriptor`

```javascript
// "The height of the logo matches the height of the top nav."
logo.height.should.equal(topNav.height);
```

#### Example: `number`

```javascript
// "The sidebar is 200 pixels wide."
sidebar.width.should.equal(200);
```

#### Example: `"none"`

Note: Although `SizeDescriptor` can tell you if a size is rendered, it's better to use an [`ElementRendered`](ElementRendered.md) property such as [`QElement.rendered`](QElement.md#element-rendering).

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

* `position.should.equal(expectation, message)` Assert that the size matches the expectation.
* `position.should.notEqual(expectation, message)` Assert that the size does not match the expectation.

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

* `position.should.beBiggerThan(expectation, message)` Assert that the size is bigger than the expectation.
* `position.should.beSmallerThan(expectation, message)` Assert that the size is smaller than the expectation.

Parameters:

* `expectation (PositionDescriptor equivalent)` The position to compare against. Must be be rendered.

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

`size.plus(amount)`

* `amount (SizeDescriptor equivalent)` The number of pixels to increase.

Example:

```javascript
// "The navbar is 12px taller than the logo."
navbar.height.should.equal(logo.height.plus(12));
```


#### descriptor.minus()

```
Stability: 3 - Stable
```

Create a `SizeDescriptor` that's smaller than this one.

`size.minus(amount)`

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

`size.times(multiple)`

* `multiple (number)` The number to multiply.

Example:

```javascript
// "The lightbox is half the width of the viewport."
lightbox.width.should.equal(frame.viewport().width.times(1/2));
```

# Quixote API: `PositionDescriptor`

* [Back to overview README.](../README.md)
* [Back to API overview.](api.md)
* [Back to descriptor overview.](descriptors.md)

Position descriptors represent an (X, Y) coordinate on the web page. The top-left corner of the page is (0, 0) and the values increase downward and to the right.


### Comparisons

```
Stability: 2 - Unstable
```

Position descriptor assertions may use another position descriptor, a number, or "none".

* A number refers to the X or Y pixel coordinate relative to the top-left corner of the page.
* The string "none" means that the element is not rendered, for example due to having the `display:none` property.


### Examples

#### Comparing to another descriptor

"The top of the sidebar is aligned to the bottom of the nav bar."

```javascript
sidebar.assert({
  top: topNav.bottom
});
```

#### Comparing to a hard-coded coordinate on the page

"The left edge of the logo is 15 pixels from the left edge of the page."

```javascript
logo.assert({
  left: 15
});
```

#### Comparing to a coordinate (see API below)
 
"The top of the sidebar is 10px below the bottom of the navigation bar."

```javascript
sidebar.assert({
  top: navbar.bottom.plus(10)
});
```

#### Getting the distance between two positions (see API below)

"The header is as wide as both columns."

```javascript
header.assert({
  width: leftColumn.left.to(rightColumn.right)
});
```

#### Checking whether an element is rendered

"The light box is no longer rendered after I change the DOM."

(Note that using a PositionDescriptor isn't the best way to make this assertion. Use [QElement.rendered](https://github.com/jamesshore/quixote/blob/dev/docs/descriptors.md#element-rendering) instead.)

```javascript
// First, I expect the light box to be rendered
lightbox.assert({
  rendered: true,   // this is the preferred way
  top: 15           // this is the PositionDescriptor way
});

// Then I vanish it
callProductionCodeThatSetsDisplayNoneOnLightbox();

// And I expect the light box will no longer be rendered
lightbox.assert({
  rendered: false,  // preferred way
  top: "none"       // PositionDescriptor way
});
```


### API

Position descriptors implement the following methods. They're useful when you want to compare elements that aren't exactly aligned.


#### descriptor.plus()

```
Stability: 2 - Unstable
```

Create a new PositionDescriptor that is further down the page or to the right.

`descriptor.plus(amount)`

* `amount (`[`SizeDescriptor`](SizeDescriptor.md)` or number)` The number of pixels to move the descriptor.

Example: "The top of the sidebar is 10px below the bottom of the navigation bar."

```javascript
sidebar.assert({
  top: navbar.bottom.plus(10)
});
```


#### descriptor.minus()

```
Stability: 2 - Unstable
```

Create a new PositionDescriptor that is further up the page or to the left.

`descriptor.minus(amount)`

* `amount (`[`SizeDescriptor`](SizeDescriptor.md)` or number)` The number of pixels to move the descriptor.

Example: "The logo is 15px inside the navigation bar."

```javascript
logo.assert({
  right: navbar.right.minus(15)
});
```


#### descriptor.to()

```
Stability: 2 - Unstable
```

Create a new [SizeDescriptor](SizeDescriptor.md) that represents the distance between two positions.

`result = descriptor.to(descriptor2)`

* `descriptor2 (PositionDescriptor)` The second position. Must represent the same X or Y axis as this descriptor.

* `result (`[`SizeDescriptor`](SizeDescriptor.md)`)` The distance between this descriptor and `descriptor2`. The result is always positive regardless of their order.

Example: "The header is as wide as both columns."

```javascript
header.assert({
  width: leftColumn.left.to(rightColumn.right)
});
```
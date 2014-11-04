# Quixote API: `PositionDescriptor`

Position descriptors represent an X or Y coordinate. The top-left corner of the page is (0, 0) and the values increase downward and to the right.

[Return to the list of descriptors.](descriptors.md)

[Return to the API overview.](api.md)

[Return to the overview README.](../README.md)


### Comparisons

```
Stability: 2 - Unstable
```

Position descriptors may be compared to another position descriptor or to a number. Comparing an X-coordinate to a Y-coordinate will result in an exception.

At present, comparisons are artificially limited. It's possible to allow more flexibility, such as comparing positions to sizes, or X-coordinates to Y-coordinates. The current approach is an experiment to see if it's more useful to fail fast than provide flexibility. Please share your opinion about this tradeoff by contributing to [issue #6](https://github.com/jamesshore/quixote/issues/6).


### Common API

Position descriptors implement the following methods. They're useful when you want to compare positions that aren't exactly aligned.


#### descriptor.plus()

```
Stability: 2 - Unstable
```

Create a new descriptor that is further down the page or to the right.

`descriptor.plus(amount)`

* `amount (SizeDescriptor or number)` The number of pixels to move the descriptor.

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

Create a new descriptor that is further up the page or to the left.

`descriptor.minus(amount)`

* `amount (SizeDescriptor or number)` The number of pixels to move the descriptor.

Example: "The logo is 15px inside the navigation bar."

```javascript
logo.assert({
  right: navbar.right.minus(15)
});
```

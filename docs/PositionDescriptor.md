# Quixote API: `PositionDescriptor`

* [Back to overview README.](../README.md)
* [Back to API overview.](api.md)
* [Back to descriptor overview.](descriptors.md)

Position descriptors represent a page-relative coordinate. The top-left corner of the page is (0, 0) and the values increase downward and to the right.


### Comparisons

```
Stability: 2 - Unstable
```

Position descriptor assertions may use another position descriptor, a number, or "none".

* A number refers to the X or Y pixel coordinate relative to the top-left corner of the page.
* The string "none" means that the element is not rendered due to `display:none` or having been removed from the DOM.


### Examples

#### Comparing to another descriptor

"The top of the sidebar is aligned to the bottom of the nav bar."

```javascript
sidebar.assert({
	top: topNav.bottom
});
```

#### Comparing to a page-relative coordinate

"The left edge of the logo is 15 pixels from the left edge of the page."

```javascript
logo.assert({
	left: 15
});
```

#### Comparing to an element-relative coordinate (see API below)
 
"The top of the sidebar is 10px below the bottom of the navigation bar."

```javascript
sidebar.assert({
  top: navbar.bottom.plus(10)
});
```

#### Checking whether an element is rendered

"The light box is no longer rendered after I change the DOM."

```javascript
// First, I expect the light box to be rendered
lightbox.assert({
	top: 15
});

// Then I vanish it
callProductionCodeThatSetsDisplayNoneOnLightbox();

// And I expect the light box will no longer be rendered
lightbox.assert({
	rendered: false,
	top: "none"
});
```


### API

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

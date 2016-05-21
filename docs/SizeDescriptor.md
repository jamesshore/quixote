# Quixote API: `SizeDescriptor`

* [Back to overview README.](../README.md)
* [Back to API overview.](api.md)
* [Back to descriptor overview.](descriptors.md)

Size descriptors represent a width or height.


### Comparisons

```
Stability: 2 - Unstable
```

Size descriptors may be compared to another size descriptor, a number, or "none". 

* A number refers to the pixel width or height of the element.
* The string "none" means that the element is not rendered due to `display:none` or having been removed from the DOM.


### Examples

#### Comparing to another descriptor

"The height of the logo matches the height of the top nav."

```javascript
logo.assert({
	height: topNav.height
});
```

#### Comparing to a specific size

"The sidebar is 200 pixels wide."

```javascript
sidebar.assert({
	width: 200
});
```

#### Comparing to an element-relative size (see API below)
 
"The left column is one-third the width of the article."

```javascript
leftColumn.assert({
  width: article.width.times(1/3)
});
```

#### Checking whether an element is rendered

"The light box is no longer rendered after I change the DOM."
 
```javascript
// First, I expect the light box to be rendered
lightbox.assert({
	width: 200
});

// Then I vanish it
callProductionCodeThatSetsDisplayNoneOnLightbox();

// And I expect the light box will no longer be rendered
lightbox.assert({
	rendered: false,
	width: "none"
});
```


### API

Size descriptors implement the following methods. They're useful when you want to compare sizes that aren't exactly the same.


#### descriptor.plus()

```
Stability: 2 - Unstable
```

Create a descriptor that's bigger than this one.

`descriptor.plus(amount)`

* `amount (SizeDescriptor or number)` The number of pixels to increase the size.

Example: "The navbar is 12px taller than the logo."

```javascript
navbar.assert({
  height: logo.height.plus(12)
});
```


#### descriptor.minus()

```
Stability: 2 - Unstable
```

Create a descriptor that's smaller than this one.

`descriptor.minus(amount)`

* `amount (SizeDescriptor or number)` The number of pixels to decrease the size.

Example: "The content area is the same width as the navbar, excluding the sidebar."

```javascript
content.assert({
  width: navbar.width.minus(sidebar.width)
});
```


#### descriptor.times()

```
Stability: 2 - Unstable
```

Create a new descriptor that's a multiple or fraction of the size of this one.

`descriptor.times(multiple)`

* `multiple (number)` The number to multiply the size by. (Pro tip: If you use a fraction as shown in the example below, Quixote will report errors as english fractions.)

Example: "The lightbox is half the size of the viewport."

```javascript
var viewport = frame.viewport();
lightbox.assert({
  width: viewport.width.times(1/2),
  height: viewport.height.times(1/2)
});
```

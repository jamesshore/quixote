# Quixote API: `ElementRendered`

* [Back to overview README.](../README.md)
* [Back to API overview.](api.md)

`ElementRendered` instances represent whether an element is rendered on the page or not. For a complete explanation, see the [`QElement.rendered`](QElement.md#element-rendering) property.


## Equivalents

```
Stability: 3 - Stable
```

Methods with a `ElementRendered equivalent` parameter can take any of the following:

* An `ElementRendered` instance, such as `QElement.rendered`.
* A boolean, where `true` means the element is rendered and `false` means it isn't.


#### Example: `ElementRendered`

```javascript
// "The image render status should match the lightbox's."
image.rendered.should.equal(lightbox.rendered);
```

#### Example: `boolean`

```javascript
// "The lightbox should not be rendered."
lightbox.rendered.should.equal(false);
```


## Assertions

Use these methods to make assertions about the element's render status. In all cases, if the assertion is true, nothing happens. Otherwise, the assertion throws an exception explaining why it failed.


### elementRendered.should.equal()

```
Stability: 3 - Stable
```

Check whether the element is rendered.

`elementRendered.should.equal(expectedRender, message)`

* `expectedRender (ElementRendered equivalent)` The expected render status.

* `message (optional string)` A message to include when the assertion fails.

Example:

```javascript
// "The disclaimer banner should be rendered."
disclaimer.rendered.should.equal(true);
```

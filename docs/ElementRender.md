# Quixote API: `ElementRender`

* [Back to overview README.](../README.md)
* [Back to API overview.](api.md)

`ElementRender` instances represent whether an element is rendered on the page or not. For a complete explanation, see the [`QElement.render`](QElement.md#element-rendering) property.


## Equivalents

```
Stability: 3 - Stable
```

Methods with a `ElementRender equivalent` parameter can take any of the following:

* An `ElementRender` instance, such as `QElement.render`.
* A boolean, where `true` means the element is rendered and `false` means it isn't.


#### Example: `ElementRender`

```javascript
// "The image render status should match the lightbox's."
image.render.should.equal(lightbox.render);
```

#### Example: `boolean`

```javascript
// "The lightbox should not be rendered."
lightbox.render.should.equal(false);
```


## Assertions

Use these methods to make assertions about the element's render status. In all cases, if the assertion is true, nothing happens. Otherwise, the assertion throws an exception explaining why it failed.


### elementRender.should.equal()

```
Stability: 3 - Stable
```

Check whether the element is rendered.

`elementRender.should.equal(expectation, message)`

* `expectation (ElementRender equivalent)` The expected render status.

* `message (optional string)` A message to include when the assertion fails.

Example:

```javascript
// "The disclaimer banner should be rendered."
disclaimer.render.should.equal(true);
```


### elementRender.should.notEqual()

```
Stability: 3 - Stable
```

Check whether the element is rendered opposite to another element.

`elementRender.should.notEqual(expectation, message)`

* `expectation (ElementRender equivalent)` The render status to not match.

* `message (optional string)` A message to include when the assertion fails.

Example:

```javascript
// "The disclaimer banner should not be rendered when the cookie banner is rendered."
disclaimer.render.should.notEqual(cookieBanner.render);
```

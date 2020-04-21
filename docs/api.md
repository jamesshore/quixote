# Quixote API

For an overview, installation notes, and an example, see [the readme](../README.md).


## Quick Reference

* Create the Quixote test frame with [`quixote.createFrame()`](quixote.md#quixotecreateframe).
* Add test elements to the frame with [`QFrame.add()`](QFrame.md#frameadd).
* Get elements from the frame with [`QFrame.get()`](QFrame.md#frameget).
* Reset the frame with [`QFrame.reset()`](QFrame.md#framereset) or [`QFrame.reload()`](QFrame.md#framereload).
* Make assertions with [`QElement`](QElement.md) properties.
* When the property you want doesn't exist, use [`QElement.getRawStyle()`](QElement.md#elementgetrawstyle).


## Classes and Modules

* [`quixote`](quixote.md) Create the Quixote test frame, wrap DOM elements, and check browser compatibility.
* [`QFrame`](QFrame.md) Manipulate the DOM inside your test frame.
* [`QElement`](QElement.md) Manipulate, make assertions about, and get styling information for a specific element.
* [`QElementList`](QElementList.md) Multiple QElements.
* [`QPage`](QPage.md) Information about the overall page.
* [`QViewport`](QViewport.md) Information about the viewport (the part of the page you can see).

### Descriptor classes

* [`PositionDescriptor`](PositionDescriptor.md) X and Y coordinates.
* [`SizeDescriptor`](SizeDescriptor.md) Widths, heights, and distances.
* [`ElementRender`](ElementRender.md) Render boundaries.
* [`Span`](Span.md) Imaginary lines between two X or Y coordinates.


## Backwards Compatibility

We strive to maintain backwards compatibility. Breaking changes to the API will be described in the [change log](../CHANGELOG.md).

That said, **any class, property, or method that isn't described in the API documentation is not for public use and may change at any time.** Class names may change at any time. Don't construct classes manually or refer to them by name. Any object you need can be obtained from a property or method call.

Each section of the API is marked with a *stability index* inspired by Node.js. They have the following meaning:
 
```
Stability: 0 - Deprecated
```

This feature is known to be problematic, and changes are planned.  Do not rely on it.  Use of the feature may cause warnings. Backwards compatibility should not be expected.

```
Stability: 1 - Experimental
```

This feature was introduced recently, and may change or be removed in future versions.  Please try it out and provide feedback. If it addresses a use-case that is important to you, tell the core team.

```
Stability: 2 - Unstable
```

The API is in the process of settling, but has not yet had sufficient real-world testing to be considered stable.

```
Stability: 3 - Stable
```

The API has proven satisfactory, but cleanup in the underlying code may cause minor changes. Backwards-compatibility will be maintained as much as possible.

```
Stability: 4 - API Frozen
```

This API has been tested extensively in production and is unlikely to ever have to change.

```
Stability: 5 - Locked
```

Unless serious bugs are found, this code will not ever change.  Please do not suggest changes in this area; they will be refused.

# Quixote API: `QFrame`

* [Back to overview README](../README.md)
* [Back to API overview](api.md)

`QFrame` controls the test frame. You'll use this to create and retrieve elements. Of particular use is [`frame.reset()`](#framereset), which you should call before each test. You'll also call [`frame.remove()`](#frameremove) after all your CSS tests are complete.


#### frame.reset()

```
Stability: 2 - Unstable
```

Reset the frame's DOM back to the state it was in immediately after you called [`quixote.createFrame()`](quixote.md#quixotecreateframe). You will typically call this before every test.

This method does *not* re-run scripts. If you need to re-run scripts, use [`QFrame.reload()`](#framereload) instead.

`frame.reset()`

Example:

```javascript
beforeEach(function() {
  frame.reset();
});
```

**Note:** This method resets the frame size, scroll position, and the `<body>` element's inner HTML. If you make changes to `<head>` or `<html>`, or if you change any `<body>` attributes (including styles), you will need to reset them manually, or use `frame.reload()` instead.


#### frame.reload()

```
Stability: 2 - Unstable
```

Reload the frame page source and stylesheets completely, as if `quixote.createFrame()` were called again, but without the overhead of creating the frame.

This method is most useful when integration testing pages that run scripts after load. Because reloading the page is relatively slow, use [`QFrame.reset()`](#framereset) if you don't need re-run the page's scripts.

`frame.reload(callback(err))`

* `callback(err) (function)` Called when the frame has been reloaded. 
  * `err (Error or null)` Any errors that occurred while loading the frame, or null if frame loaded successfully.

Example:

```javascript
beforeEach(function(done) {
  frame.reload(done);
});
```


#### frame.remove()

```
Stability: 2 - Unstable
```

Remove the test frame entirely. You'll typically call this after all your tests are complete.

`frame.remove()`

Example:

```javascript
after(function() {
  frame.remove();
});
```


#### frame.get()

```
Stability: 2 - Unstable
```

Retrieve an element matching a selector. Throws an exception unless exactly one matching element is found. If you don't want the possibility of an exception, use [`frame.getAll()`](#framegetall) instead.

`element = frame.get(selector, nickname)`

* `element (`[`QElement`](QElement.md)`)` The element that matches your selector.

* `selector (string)` A CSS selector. Any selector that works with [document.querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Document.querySelectorAll) will work. In particular, note that IE 8 is limited to CSS2 selectors only.

* `nickname (optional string)` The name to use when describing your element in error messages. Uses the selector by default.

Example: `var foo = frame.get("#foo");`


#### frame.getAll()

```
Stability: 1 - Experimental
```

Retrieve a list of elements matching a selector. If you want to ensure that exactly one element is retrieved, use [`frame.get()`](#frameget) instead.

`list = frame.getAll(selector, nickname)`

* `list (`[`QElementList`](QElementList.md)`)` The elements that match your selector.

* `selector (string)` A CSS selector. Any selector that works with [document.querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Document.querySelectorAll) will work. In particular, note that IE 8 is limited to CSS2 selectors only.

* `nickname (optional string)` The name to use when describing your list in error messages. Uses the selector by default.

Example `var fooList = frame.getAll(".foo");`


#### frame.add()

```
Stability: 2 - Unstable
```

Create an element and append it to the frame's body. Throws an exception unless exactly one element is created. (But that one element may contain children.)

`element = frame.add(html, nickname)`

* `element (`[`QElement`](QElement.md)`)` The element you created.

* `html (string)` HTML for your element.

* `nickname (optional string)` The name to use when describing your element in error messages. Uses the html by default.

Example: `var foo = frame.add("<p>foo</p>", "foo");`


#### frame.viewport()

```
Stability: 1 - Experimental
```

Provides access to descriptors for the frame's viewport (the part of the page that you can see in the frame, not including scrollbars).

`viewport = frame.viewport()`

* `viewport (`[`see descriptors`](descriptors.md)`)` Viewport descriptors, plus `assert()` and `diff()` methods equivalent to the ones found on [`QElement`](QElement.md).

Example: Assert that a banner is displayed at the top of the window and all the way from side to side.

```javascript
var viewport = frame.viewport();
banner.assert({
  top: viewport.top,
  left: viewport.left,
  width: viewport.width
});
```


#### frame.page()

```
Stability: 1 - Experimental
```

Provides access to descriptors for the frame's page (everything you can see or scroll to, not including scrollbars).

`page = frame.page()`

* `page (`[`see descriptors`](descriptors.md)`)` Page descriptors, plus `assert()` and `diff()` methods equivalent to the ones found on [`QElement`](QElement.md).

Example: Assert that a sidebar extends the entire height of the page.

```javascript
var page = frame.page();
sidebar.assert({
  top: page.top,
  height: page.height
});
```


#### frame.body()

```
Stability: 1 - Experimental
```

Retrieves the frame's `body` element.

`body = frame.body()`

* `body (`[`QElement`](QElement.md)`)` The body element.


#### frame.resize()

```
Stability: 1 - Experimental
```

Changes the size of the frame.

`frame.resize(width, height)`

* `width (number)` The frame's new width
* `height (number)` The frame's new height

**Compatibility Note:** Mobile Safari does not strictly obey the `width` and `height` attributes on an iframe. Instead, it uses the page width/height *or* the requested width/height, whichever is larger. You can detect this behavior by using [`quixote.browser.enlargesFrameToPageSize()`](quixote.md#quixotebrowser).


#### frame.scroll()

```
Stability: 1 - Experimental
```

Scroll the page so that top-left corner of the frame is as close as possible to an (x, y) coordinate. Note that the page may not scroll at all in some cases, such as when the frame already displays the entire page.

`frame.scroll(x, y)`

* `x (number)` The x coordinate to scroll to.

* `y (number)` The y coordinate to scroll to.

Example: `frame.scroll(50, 60);`


#### frame.getRawScrollPosition()

```
Stability: 1 - Experimental
```

Determine the (x, y) coordinate of the top-left corner of the frame. This uses [pageXOffset](https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollX) and [pageYOffset](https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY) under the covers. (On IE 8, it uses [scrollLeft](http://msdn.microsoft.com/en-us/library/ie/ms534617%28v=vs.85%29.aspx) and [scrollTop](http://msdn.microsoft.com/en-us/library/ie/ms534618%28v=vs.85%29.aspx).)

`position = frame.getRawScrollPosition()`

* `position (Object)` The (x, y) coordinate:
  * `x (number)` The x coordinate.
  * `y (number)` The y coordinate.

**Compatibility Note:** `getRawScrollPosition` does *not* attempt to resolve cross-browser differences, with one exception:

* IE 8 uses `scrollLeft` and `scrollTop` rather than `pageXOffset` and `pageYOffset`.


#### frame.toDomElement()

```
Stability: 1 - Experimental
```

Retrieve the underlying [`HTMLIFrameElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement) DOM element for the frame.

`dom = frame.toDomElement()`

* `dom (`[`HTMLIFrameElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement)`)` The DOM element.

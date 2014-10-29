# Quixote API: `QFrame`

`QFrame` instances allow you to control your test frame. You'll use this to create and retrieve elements. Of particular use is `frame.reset()`, which you should call before each test. You'll also need to call `frame.remove()` after all your CSS tests are complete.

[Return to the API overview.](api.md)

[Return to the overview README.](../README.md)


#### frame.reset()

```
Stability: 2 - Unstable
```

Reset the frame back to the state it was in immediately after you called `quixote.createFrame()`.

`frame.reset()`


#### frame.remove()

```
Stability: 2 - Unstable
```

Remove the test frame entirely.

`frame.remove()`


#### frame.get()

```
Stability: 2 - Unstable
```

Retrieve an element matching a selector. Throws an exception unless exactly one matching element is found. If you don't want the possibility of an exception, use `frame.getAll()` instead.

`element = frame.get(selector, nickname)`

* `element (`[`QElement`](QElement.md)`)` The element that matches your selector.

* `selector (string)` A CSS selector. Any selector that works with [querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Document.querySelectorAll) will work. In particular, note that IE 8 is limited to CSS2 selectors only.

* `nickname (optional string)` The name to use when describing your element in error messages. Uses the selector by default.

Example: `var foo = frame.get("#foo");`


#### frame.getAll()

```
Stability: 1 - Experimental
```

Retrieve a list of elements matching a selector. If you want to ensure that exactly one element is retrieved, use `frame.get()` instead.

`list = frame.getAll(selector, nickname)`

* `list (`[`QElementList`](QElementList.md`)` The elements that match your selector.

* `selector (string)` A CSS selector. Any selector that works with [querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Document.querySelectorAll) will work. In particular, note that IE 8 is limited to CSS2 selectors only.

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

Retrieve properties relating to the frame's viewport (the part of the frame that you can see, not including scrollbars).

`viewport = frame.viewport()`

* `viewport (`[`QViewport`](QViewport.md)`)` The viewport properties.

Example: Assert that a banner is displayed at the top of the window and all the way from side to side.

```javascript
var viewport = frame.viewport();
banner.assert({
  top: viewport.top(),
  left: viewport.left(),
  width: viewport.width(),
});
```


#### frame.page()

```
Stability: 1 - Experimental
```

Retrieve properties relating to the frame's page (everthing you can see or scroll to, not including scrollbars).

`page = frame.page()`

* `viewport (`[`QViewport`](QViewport.md)`)` The viewport properties.

Example: Assert that a sidebar extends the entire height of the page.

```javascript
var page = frame.page();
element.assert({
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

* body (`[`QElement`](QElement.md)`)` The body element.


#### frame.scroll()

```
Stability: 1 - Experimental
```

Scroll the top-left corner of the frame to a specific (x, y) coordinate.

`frame.scroll(x, y)`

* `x (number)` The x coordinate to scroll to.

* `y (number)` The y coordinate to scroll to.

Example: `frame.scroll(50, 60);`

**Compatibility Note:** This method throws an exception on Mobile Safari. To check if this method will throw an exception, use [`quixote.browser.canScroll()`](quixote.md).

* Mobile Safari ignores the `width` and `height` attributes on an iframe, as described in the compatibility note for [`quixote.createFrame()`](quixote.md). We work around the problem by putting the frame in a scrollable container, but the underlying frame is still full size. As a result, it can't be scrolled.


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

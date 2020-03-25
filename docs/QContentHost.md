# Quixote API: `QContentHost`

* [Back to overview README](../README.md)
* [Back to API overview](api.md)

`QContentHost` instances represent the hosting document and window. You'll use this to create and retrieve elements as well as get access to the viewport and page descriptors.


#### contentHost.get()

```
Stability: 2 - Unstable
```

Retrieve an element matching a selector. Throws an exception unless exactly one matching element is found. If you don't want the possibility of an exception, use [`contentHost.getAll()`](#contenthostgetall) instead.

`element = contentHost.get(selector, nickname)`

* `element (`[`QElement`](QElement.md)`)` The element that matches your selector.

* `selector (string)` A CSS selector. Any selector that works with [document.querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Document.querySelectorAll) will work. In particular, note that IE 8 is limited to CSS2 selectors only.

* `nickname (optional string)` The name to use when describing your element in error messages. Uses the selector by default.

Example: `var foo = contentHost.get("#foo");`


#### contentHost.getAll()

```
Stability: 1 - Experimental
```

Retrieve a list of elements matching a selector. If you want to ensure that exactly one element is retrieved, use [`contentHost.get()`](#contenthostget) instead.

`list = contentHost.getAll(selector, nickname)`

* `list (`[`QElementList`](QElementList.md)`)` The elements that match your selector.

* `selector (string)` A CSS selector. Any selector that works with [document.querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Document.querySelectorAll) will work. In particular, note that IE 8 is limited to CSS2 selectors only.

* `nickname (optional string)` The name to use when describing your list in error messages. Uses the selector by default.

Example `var fooList = contentHost.getAll(".foo");`


#### contentHost.add()

```
Stability: 2 - Unstable
```

Create an element and append it to the contentHost's body. Throws an exception unless exactly one element is created. (But that one element may contain children.)

`element = contentHost.add(html, nickname)`

* `element (`[`QElement`](QElement.md)`)` The element you created.

* `html (string)` HTML for your element.

* `nickname (optional string)` The name to use when describing your element in error messages. Uses the html by default.

Example: `var foo = contentHost.add("<p>foo</p>", "foo");`


#### contentHost.viewport()

```
Stability: 1 - Experimental
```

Provides access to descriptors for the contentHost's viewport (the part of the page that is visible in the browser window, not including scrollbars).

`viewport = contentHost.viewport()`

* `viewport (`[`see descriptors`](descriptors.md)`)` Viewport descriptors, plus `assert()` and `diff()` methods equivalent to the ones found on [`QElement`](QElement.md).

Example: Assert that a banner is displayed at the top of the window and all the way from side to side.

```javascript
var viewport = contentHost.viewport();
banner.assert({
  top: viewport.top,
  left: viewport.left,
  width: viewport.width
});
```


#### contentHost.page()

```
Stability: 1 - Experimental
```

Provides access to descriptors for the entirety of the contentHost's page (everything you can see or scroll to, not including scrollbars).

`page = contentHost.page()`

* `page (`[`see descriptors`](descriptors.md)`)` Page descriptors, plus `assert()` and `diff()` methods equivalent to the ones found on [`QElement`](QElement.md).

Example: Assert that a sidebar extends the entire height of the page.

```javascript
var page = contentHost.page();
sidebar.assert({
  top: page.top,
  height: page.height
});
```


#### contentHost.body()

```
Stability: 1 - Experimental
```

Retrieves the contentHost's `body` element.

`body = contentHost.body()`

* `body (`[`QElement`](QElement.md)`)` The body element.


#### contentHost.scroll()

```
Stability: 1 - Experimental
```

Scroll the page so that top-left corner of the windows content is as close as possible to an (x, y) coordinate. Note that the page may not scroll at all in some cases, such as when the entire page is already visible in the browser window.

`contentHost.scroll(x, y)`

* `x (number)` The x coordinate to scroll to.

* `y (number)` The y coordinate to scroll to.

Example: `contentHost.scroll(50, 60);`


#### contentHost.getRawScrollPosition()

```
Stability: 1 - Experimental
```

Determine the (x, y) coordinate of the top-left corner of the visible viewport within the windows content. This uses [pageXOffset](https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollX) and [pageYOffset](https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY) under the covers. (On IE 8, it uses [scrollLeft](http://msdn.microsoft.com/en-us/library/ie/ms534617%28v=vs.85%29.aspx) and [scrollTop](http://msdn.microsoft.com/en-us/library/ie/ms534618%28v=vs.85%29.aspx).)

`position = contentHost.getRawScrollPosition()`

* `position (Object)` The (x, y) coordinate:
  * `x (number)` The x coordinate.
  * `y (number)` The y coordinate.

**Compatibility Note:** `getRawScrollPosition` does *not* attempt to resolve cross-browser differences, with one exception:

* IE 8 uses `scrollLeft` and `scrollTop` rather than `pageXOffset` and `pageYOffset`.


#### contentHost.toDomElement()

```
Stability: 1 - Experimental
```

Retrieve the underlying [`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) DOM element for the contentHost.

`dom = contentHost.toDomElement()`

* `dom (`[`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window)`)` The DOM element.


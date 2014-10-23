# Quixote API: `Frame`

`Frame` instances allow you to control your test frame. You'll use this to create and retrieve elements. Of particular use is `frame.reset()`, which you should call before each test. You'll also need to call `frame.remove()` after all your CSS tests are complete.

[Return to the API overview.](api.md)

[Return to the overview README.](../README.md)


#### frame.reset()

Reset the frame back to the state it was in immediately after you called `quixote.createFrame()`.

`frame.reset()`


#### frame.remove()

Remove the test frame entirely.

`frame.remove()`


#### frame.getElement()

Retrieve an element matching `selector`. Throws an exception unless exactly one matching element is found.

`element = frame.getElement(selector)`

* `element (`[`QElement](QElement.md)`)` The element that matches your selector.

* `selector (string)` A CSS selector. Any selector that works with [querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Document.querySelectorAll) will work. In particular, note that IE 8 is limitated to CSS2 selectors only.

Example: `var foo = frame.getElement("#foo");`


#### frame.addElement()

Create an element and add it to the end of the frame's body. Throws an exception unless exactly one element is created.

`element = frame.addElement(html)`

* `element (`[`QElement](QElement.md)`)` The element you created.

* `html (string)` HTML for your element.

Example: `var foo = frame.addElement("<p>foo</p>");`


#### frame.scroll()

Scroll the top-left corner of the frame to a specific (x, y) coordinate. Throws an exception on Mobile Safari; see compatibility note.

`frame.scroll(x, y)`

* `x (number)` The x coordinate to scroll to.

* `y (number)` The y coordinate to scroll to.

Example: `frame.scroll(50, 60);`

**Compatibility Note:** Mobile Safari ignores the `width` and `height` attributes on an iframe, as described under `quixote.createFrame()`. We work around the problem by putting the frame in a scrollable container, but the underlying frame is still full size. As a result, it can't be scrolled. To notify you of the problem, we throw an exception on Mobile Safari. If you still want to call this method and you don't want your tests to fail on Mobile Safari (for example, if you're testing multiple browsers), you can use `quixote.browser.canScroll()` to provide an alternate code path for Mobile Safari.


#### frame.getRawScrollPosition()

Determine the (x, y) coordinate of the top-left corner of the frame. This uses [pageXOffset](https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollX) and [pageYOffset](https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY) under the covers. (On IE 8, it uses [scrollLeft](http://msdn.microsoft.com/en-us/library/ie/ms534617%28v=vs.85%29.aspx) and [scrollTop](http://msdn.microsoft.com/en-us/library/ie/ms534618%28v=vs.85%29.aspx).)

`position = frame.getRawScrollPosition()`

* `position (Object)` The (x, y) coordinate:
  * `x (number)` The x coordinate.
  * `y (number)` The y coordinate.

**Compatibility Note:** `getRawScrollPosition` does *not* attempt to resolve cross-browser differences, with one exception:

* IE 8 uses `scrollLeft` and `scrollTop` rather than `pageXOffset` and `pageYOffset`.


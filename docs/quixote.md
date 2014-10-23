# Quixote API: `quixote`

Use the `quixote` module to create your test frame and check browser compatibility.

[Return to the API documentation.](api.md)

[Return to the overview README.](../README.md)


#### quixote.createFrame()

Create a test iframe. This is a slow operation, so it's best to use `Frame.reset()` rather than creating a fresh frame before each test.

`frame = quixote.createFrame(width, height, options, callback(err, frame))`

* `frame (`[`Frame`](Frame.md)`)` The newly-created frame. Although the frame is returned immediately, you have to wait for the callback to execute before you can use it.

* `width (number)` Width of the iframe

* `height (number)` Height of the iframe

* `options (optional object)` Options for creating the frame:
  * `src (optional string)` URL of an HTML document to load into the frame. Must be served from same domain as the enclosing test document, or you could get same-origin policy errors.
  * `stylesheet (optional string)` URL of a CSS stylesheet to load into the frame
  * Note: `src` and `stylesheet` may not be used at the same time. To load a stylesheet with an HTML document, use a `<link>` tag in the HTML document itself.
  
* `callback(err, loadedFrame) (function)` Called when the frame has been created. 
  * `err (Error or null)` Any errors that occurred while loading the frame (always `null`, for now)
  * `loadedFrame (`[`Frame`](Frame.md)`)` The newly-created frame, loaded and ready to use. This is exact same object reference as `frame` and either may be used.  

**Compatibility Note:** Mobile Safari ignores the `width` and `height` attributes on an iframe. We work around the problem using a scrolling container [as described by David Walsh](http://davidwalsh.name/scroll-iframes-ios). This workaround may result in subtle incompatibilities on Mobile Safari. We will document or work around them when we find them. If you see an issue on Mobile Safari that seems related, please [open an issue](https://github.com/jamesshore/quixote/issues).

#### quixote.browser

Methods for checking browser compatibility. There's just one so far.

* `quixote.browser.canScroll()`: Returns `true` if the browser can scroll the test iframe. See `Frame.scroll()` for details.


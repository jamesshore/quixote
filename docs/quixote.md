# Quixote API: `quixote`

Use the `quixote` module to create your test frame and check browser compatibility.

[Return to the API overview.](api.md)

[Return to the overview README.](../README.md)


#### quixote.createFrame()

```
Stability: 2 - Unstable
```

Create a test iframe. This is a slow operation, so once you have a frame, it's best to use [`QFrame.reset()`](QFrame.md) on it rather than creating a new frame for each test.

`frame = quixote.createFrame(options, callback(err, frame))`

* `frame (`[`QFrame`](QFrame.md)`)` The newly-created frame. Although the frame is returned immediately, you have to wait for the callback to execute before you can use it.

* `options (optional object)` Options for creating the frame:
  * `width (optional number)` Width of the iframe. Defaults to a large value (see stability note below).
  * `height (optional number)` Height of the iframe. Defaults to a large value (see stability note below).
  * `src (optional string)` URL of an HTML document to load into the frame. Must be served from same domain as the enclosing test document, or you could get same-origin policy errors. Defaults to loading nothing.
  * `stylesheet (optional string)` URL of a CSS stylesheet to load into the frame. Defaults to loading nothing.
  * Note: `src` and `stylesheet` may not be used at the same time. To load a stylesheet *and* an HTML document, use a `<link>` tag in the HTML document itself.
  
* `callback(err, loadedFrame) (function)` Called when the frame has been created. 
  * `err (Error or null)` Any errors that occurred while loading the frame (always `null`, for now).
  * `loadedFrame (`[`QFrame`](QFrame.md)`)` The newly-created frame, loaded and ready to use. This is exact same object reference as `frame` and either may be used.  

**Stability Note:** The default width and height are chosen to be "sufficiently large" for most uses. It may increase or decrease in the future. If the size of your frame affects its rendering, be sure to specify the size you want, even if your needs match the current default.

**Compatibility Note:** Mobile Safari ignores the `width` and `height` attributes on an iframe. We work around the problem by using a scrolling container [as described by David Walsh](http://davidwalsh.name/scroll-iframes-ios). This workaround may result in subtle incompatibilities on Mobile Safari. We will document or work around them when we find them. If you see an issue on Mobile Safari that seems related, please [open an issue](https://github.com/jamesshore/quixote/issues).

#### quixote.browser

```
Stability: 1 - Experimental
```

Methods for checking browser compatibility. There's just one so far.

* `quixote.browser.canScroll()`: Returns `true` if the browser can scroll the test iframe. See [`Frame.scroll()`](Frame.md) for details.


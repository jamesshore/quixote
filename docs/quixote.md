# Quixote API: `quixote`

* [Back to overview README](../README.md)
* [Back to API overview](api.md)

Use the `quixote` module to create your test frame and check browser compatibility.


### quixote.createFrame()

```
Stability: 3 - Stable
```

Create a test iframe. This is a slow operation, so once you have a frame, it's best to use [`QFrame.reset()`](QFrame.md#framereset) on it rather than creating a new frame for each test.

`frame = quixote.createFrame(options, callback(err, frame))`

* `frame (`[`QFrame`](QFrame.md)`)` The newly-created frame. Although the frame is returned immediately, you have to wait for the callback to execute before you can use it.

* `options (optional object)` Options for creating the frame:
  * `width (optional number)` Width of the iframe. Defaults to a large value (see stability note below).
  * `height (optional number)` Height of the iframe. Defaults to a large value (see stability note below).
  * `src (optional string)` URL of an HTML document to load into the frame. Must be served from same domain as the enclosing test document, or you could get same-origin policy errors. Defaults to an empty document using `<!DOCTYPE html>` (to enable standards-mode rendering).
  * `stylesheet (optional; string or array of strings)` URL of a CSS stylesheet to add to the frame's `<head>` element. If you have multiple stylesheets to add, use an array of strings. Defaults to loading nothing.
  * `css (optional string)` Raw CSS to add to a `<style>` element in the frame's `<head>`. If both `css` and `stylesheet` are specified, the `css` style tag is added after the `stylesheet` link tags, which means `css` takes precedence in case of conflicts. Defaults to adding nothing.
  
* `callback(err, loadedFrame) (function)` Called when the frame has been created. 
  * `err (Error or null)` Any errors that occurred while loading the frame, or null if frame loaded successfully.
  * `loadedFrame (`[`QFrame`](QFrame.md)`)` The newly-created frame, loaded and ready to use. This is exact same object reference as `frame` and either may be used.  

Example:

```javascript
var frame;
before(function(done) {
  var options = { src: "/base/src/index.html" };
  frame = quixote.createFrame(options, done);
});
```

**Stability Note:** The default width and height are chosen to be "sufficiently large" for most uses. It may increase or decrease in the future. If the size of your frame affects its rendering, be sure to specify the size you want, even if your needs match the current default.

**Compatibility Note:** Older versions of Mobile Safari did not strictly obey the `width` and `height` attributes on an iframe. Instead, they uses the page width/height *or* the requested width/height, whichever is larger. You can detect this behavior by using [`quixote.browser.enlargesFrameToPageSize()`](quixote.md#quixotebrowser).

**Compatibility Note:** Mobile Safari will increase the size of small fonts depending on the width of the frame. (You can prevent this behavior by using `-webkit-text-size-adjust: 100%;` in your CSS.) You can detect this behavior by using [`quixote.browser.enlargesFonts()`](#quixotebrowser).


### quixote.elementFromDom()

```
Stability: 3 - Stable
```

Create a [`QElement`](QElement.md) from an existing DOM element. Useful when using another test framework that has its own test iframe.

`element = quixote.elementFromDom(domElement, nickname)`

* `element (`[`QElement`](QElement.md)`)` The newly-created QElement for the given dom element.

* `domElement (HTMLElement)` DOM element to wrap.

* `nickname (optional string)` The name to use when describing your element in error messages. Defaults to the element ID, class names, or tag name, in that order.

Example:

```javascript
var domElement = document.querySelector("p");		// get the first <p> tag in this window
var firstParagraph = quixote.elementFromDom(domElement);
```


### quixote.browser

```
Stability: 3 - Stable
```

Methods for checking browser compatibility.

Quixote detects browser features via a temporary frame that's created, and immediately destroyed, the first time you call [`quixote.createFrame()`](#quixotecreateframe). If you call one of these methods before `quixote.createFrame()` has been called, an exception will be thrown.

* `quixote.browser.enlargesFrameToPageSize()`: Older versions of Mobile Safari ignore frame width and height attributes when the page is larger than the frame. They use the page dimensions instead. This function returns true if the current browser exhibits that behavior.

* `quixote.browser.enlargesFonts()`: Mobile Safari will increase the size of small fonts depending on the width of the frame. (You can prevent this behavior by using `-webkit-text-size-adjust: 100%;` in your CSS.) This function returns true if the current browser exhibits that behavior.

* `quixote.browser.misreportsAutoValuesInClipProperty()`: IE 11 and Chrome Mobile 44 report the value of `clip: rect(auto)` as `0px` rather than `auto`. This function returns true if the current browser exhibits that behavior.

* `quixote.browser.misreportsClipAutoProperty()`: IE 8 doesn't distinguish between `clip: auto` (which *doesn't* clip children) and `clip: rect(auto, auto, auto, auto)` (which *does* clip children) when reporting the value of the `clip` property. This function returns true if the current browser exhibits that behavior.

* `quixote.browser.roundsOffPixelCalculations()`: IE 8 and IE 11 round fractional pixel values to the nearest integer. In other words, if the font size is 15px and an element is 0.5em wide, IE 8 and IE 11 will report its width as 8px wide rather than 7.5px. (This will typically not affect your use of Quixote, as Quixote considers pixel values within 0.5px of each other to be identical.) This function returns true if the current browser exhibits that behavior.
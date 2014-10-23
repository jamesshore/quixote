# Quixote API

For a Quixote overview, installation notes, and an example, see [the readme](../README.md).

## API

There are three primary classes and modules:

* `quixote` is your entry point. It allows you to create a iframe for testing.
* `Frame` is how you manipulate the DOM inside your test frame.
* `QElement` allows you to make assertions and get information.

You'll use these two methods the most:

* `QElement.assert()` checks multiple properties of an element and throws a nice error message if they don't match. You can also use `QElement.diff()` if you'd rather use your own assertion library.
* `QElement.getRawStyle()` looks up a specific CSS style. Use this for any styles that don't have descriptors.

The `assert()` and `diff()` methods use "descriptor" objects that represent some aspect of an element. For example, `ElementEdge` represents the position of an edge of an element.

Get a descriptors by accessing properties on `QElement`. For example, `element.top` gives you an `ElementEdge` descriptor representing the top edge of an element.

Some descriptors have additional properties and methods you can call. For example, `element.width.times(1/3)` corresponds to one-third the width of an element. See the documentation below for details about the properties available on each descriptor.


### API Compatibility

**The API will change!** This is an early version. Don't use this code if you don't want to be on the bleeding edge.

Class names may change at any time. Don't construct classes manually or refer to them by name. Any object you need can be obtained from a property or method call.

Breaking changes to any property or method documented here will be mentioned in the [change log](CHANGELOG.md). All other properties and methods should be considered non-public and subject to change at any time.


### Entry Point: `quixote`

Use the `quixote` module to create your test frame and check browser compatibility.

#### quixote.createFrame()

Create a test iframe. This is a slow operation, so it's best to use `Frame.reset()` rather than creating a fresh frame before each test.

`frame = quixote.createFrame(width, height, options, callback(err, frame))`

* `frame (Frame)` The newly-created frame. Although the frame is returned immediately, you have to wait for the callback to execute before you can use it.

* `width (number)` Width of the iframe

* `height (number)` Height of the iframe

* `options (optional object)` Options for creating the frame:
  * `src (optional string)` URL of an HTML document to load into the frame. Must be served from same domain as the enclosing test document, or you could get same-origin policy errors.
  * `stylesheet (optional string)` URL of a CSS stylesheet to load into the frame
  * Note: `src` and `stylesheet` may not be used at the same time. To load a stylesheet with an HTML document, use a `<link>` tag in the HTML document itself.
  
* `callback(err, loadedFrame) (function)` Called when the frame has been created. 
  * `err (Error or null)` Any errors that occurred while loading the frame (always `null`, for now)
  * `loadedFrame (Frame)` The newly-created frame, loaded and ready to use. This is exact same object reference as `frame` and either may be used.  

**Compatibility Note:** Mobile Safari ignores the `width` and `height` attributes on an iframe. We work around the problem using a scrolling container [as described by David Walsh](http://davidwalsh.name/scroll-iframes-ios). This workaround may result in subtle incompatibilities on Mobile Safari. We will document or work around them when we find them. If you see an issue on Mobile Safari that seems related, please [open an issue](https://github.com/jamesshore/quixote/issues).

#### quixote.browser

Methods for checking browser compatibility. There's just one so far.

* `quixote.browser.canScroll()`: Returns `true` if the browser can scroll the test iframe. See `Frame.scroll()` for details.


### Class: `Frame`

`Frame` instances allow you to control your test frame. You'll use this to create and retrieve elements. Of particular use is `frame.reset()`, which you should call before each test. You'll also need to call `frame.remove()` after all your CSS tests are complete.

#### frame.reset()

Reset the frame back to the state it was in immediately after you called `quixote.createFrame()`.

`frame.reset()`

#### frame.remove()

Remove the test frame entirely.

`frame.remove()`

#### frame.getElement()

Retrieve an element matching `selector`. Throws an exception unless exactly one matching element is found.

`element = frame.getElement(selector)`

* `element (QElement)` The element that matches your selector.

* `selector (string)` A CSS selector. Any selector that works with [querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Document.querySelectorAll) will work. In particular, note that IE 8 is limitated to CSS2 selectors only.

Example: `var foo = frame.getElement("#foo");`

#### frame.addElement()

Create an element and add it to the end of the frame's body. Throws an exception unless exactly one element is created.

`element = frame.addElement(html)`

* `element (QElement)` The element you created.

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


### Class: `QElement`

`QElement` instances represent individual HTML tags. You'll use them to get information about how the elements on your page are styled.


#### Descriptors

QElement instances have several descriptor properties that can be used to make assertions about your element. You'll typically use these properties with `QElement.assert()` or `QElement.diff()` method. 
 
Descriptors are documented in more detail under their class names, below.
 
* `top, right, bottom, left (ElementEdge)` Top, right, etc. edge of the element
* `center, middle (ElementCenter)` Horizontal center and vertical middle of the element
* `width, height (ElementSize)` Width and height of the element

**Compatibility Note:** We make every attempt to ensure that these properties work the same across browsers. If there's a cross-browser difference that doesn't show up in the actual page, please file an issue.

**Pixel Rounding Note:** Browsers handle pixel rounding in different ways. As a result, if two values are within 0.5px of each other, we consider them to be the same. This only applies to pixel values, not all numbers.

If you discover that you're having rounding errors that are *greater* than 0.5px, make sure your test browsers are set to a zoom level of 100%. Zooming can exaggerate rounding errors.


#### element.assert()

Compare the element's properties to a set of expected values and throw an exception if they don't match. This is the same as `diff()` (below), except that it throws an exception rather than returning a value.

`element.assert(expected, message)`

* `expected (object)` An object containing one or more of the above-listed properties (`top`, `right`, etc.) as keys, along with the expected value as a number or another property.

* `message (optional string)` If an exception is thrown, this message will be included at the beginning.

Example: `element.assert({ top: 13, bottom: otherElement.top.plus(10) });`


#### element.diff()

Compare the element's properties to a set of expected values. This is the same as `assert()` (above), except that it returns a value rather than throwing an exception.

`diff = element.diff(expected)`

* `diff (string)` A human-readable description of any differences found, or an empty string if none.

* `expected (object)` An object containing one or more of the above-listed properties (`top`, `right`, etc.) as keys, along with the expected value as a number or another property.

Example: `assert.equal(element.diff({ top: 13, bottom: otherElement.top.plus(10) }), "");`


#### element.getRawStyle()

Determine how an element displays a particular style, as computed by the browser. This uses [getComputedStyle()](https://developer.mozilla.org/en-US/docs/Web/API/Window.getComputedStyle) under the covers. (On IE 8, it uses [currentStyle](http://msdn.microsoft.com/en-us/library/ie/ms535231%28v=vs.85%29.aspx)).

`style = element.getRawStyle(property)`

* `style (string)` The browser's computed style, or an empty string if the style wasn't recognized.
 
* `property (string)` The name of the property to retrieve. Should always be written in snake-case, even on IE 8.

Example: `var fontSize = element.getRawStyle("font-size");`

**Compatibility Note:** `getRawStyle` does *not* attempt to resolve cross-browser differences, with two exceptions:

* IE 8 uses `currentStyle` rather than `getComputedStyle()`, and snake-case property names are converted to camelCase to match currentStyle's expectation.
* Different browsers return `null`, `undefined`, or `""` when a property can't be found. Quixote always returns `""`. 


#### element.getRawPosition()

Determine where an element is displayed within the frame viewport, as computed by the browser. This uses [getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect) under the covers. Note that scrolling the document will cause the position to change.

`position = element.getRawPosition()`

* `position (object)` The position of the element relative to the top of the viewport. In other words, if you scroll the viewport down 10 pixels, `top` will be 10 pixels smaller. All values include border and padding, but not margin.
  * `top (number)` top edge
  * `right (number)` right edge
  * `bottom (number)` bottom edge
  * `left (number)` left edge
  * `width (number)` width (right edge minus left edge)
  * `height (number)` height (bottom edge minus top edge)

Example: `var top = element.getRawPosition().top;`

**Compatibility Note:** `getRawPosition()` does *not* attempt to resolve cross-browser differences, with one exception:

* IE 8's `getBoundingClientRect()` does not have `width` or `height` properties, but `getRawPosition()` does, even on IE 8. It calculates them from the other properties.


### Descriptor: `ElementEdge`

Represents the position of one side of an element (the top, left, etc.). The position includes padding and border, but not margin. Get an ElementEdge from `QElement` with a property such as `element.top`.

Example: The left side of the element is aligned with the left side of the menu: `element.assert({ left: logo.left });`

#### Additional descriptors

ElementEdge provides access to additional descriptors:
 
* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.


### Descriptor: `ElementCenter`

Represents the horizontal center or vertical middle of an element. Get an ElementCenter from `QElement` with a property such as `element.center`.

Example: The center of the element is centered with the menu: `element.assert({ center: menu.center });`

#### Additional descriptors

ElementEdge provides access to additional descriptors:
 
* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.


### Descriptor: `RelativePosition`

Represents an adjusted position. Get a RelativePosition by calling `plus(amount)` or `minus(amount)` on another descriptor. `amount` may be a number or another descriptor.
 
Example: The top of the element is 10px below the bottom of the menu: `element.assert({ top: menu.bottom.plus(10) });`

#### Additional descriptors

RelativePosition provides access to additional descriptors:

* `plus(amount) (RelativePosition)` Further down or to the right.
* `minus(amount) (RelativePosition)` Further up or to the left.


### Descriptor: `ElementSize`

Represents the width or height of an element. Get an ElementSize from `QElement` with a property such as `element.width`.

Example: The width of an element is the same as its height: `element.assert({ width: element.height });

#### Additional descriptors

ElementSize provides access to additional descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(amount) (SizeMultiple)` A multiple or fraction.


### Descriptor: `RelativeSize`

Represents an adjusted size. Get a RelativeSize by calling `plus(amount)` or `minus(amount)` on another descriptor. `amount` may be a number or another descriptor.
 
Example: The element is 20px narrower than the menu: `element.assert({ width: menu.width.minus(20) });`

#### Additional descriptors

RelativeSize provides access to additional descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(amount) (SizeMultiple)` A multiple or fraction.


### Descriptor: `SizeMultiple`

Represents an adjusted size. Get a SizeMultiple by calling `times(muliplier)` on another descriptor. `multiplier` must be a number.

Example: The element is a golden rectangle: `element.assert({ width: element.height.times(1.618) });`

#### Additional descriptors

ElementSize provides access to additional descriptors:

* `plus(amount) (RelativeSize)` Bigger.
* `minus(amount) (RelativeSize)` Smaller.
* `times(amount) (SizeMultiple)` A multiple or fraction.


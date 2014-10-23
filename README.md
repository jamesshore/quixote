# Quixote - CSS Unit Testing

[![Build Status (Travis-CI)](https://secure.travis-ci.org/jamesshore/quixote.png?branch=master )](http://travis-ci.org/jamesshore/quixote)

Quixote is a library for unit testing CSS. You use it with a unit testing framework such as [Mocha](http://visionmedia.github.io/mocha/) or [Jasmine](http://jasmine.github.io/). It works particularly well when combined with a cross-browser test runner such as [Karma](http://karma-runner.github.io/0.12/index.html) or [Test'em](https://github.com/airportyh/testem).

**Browser Support:** IE 8+, Firefox, Chrome, Safari, and Mobile Safari are known to work. Other modern browsers probably work too. See [tested_browsers.js](./build/config/tested_browsers.js) for the exact list of browsers tested for this release.

**Performance:** Fast. Quixote's own test suite runs over 1000 tests across eight browsers. It completes in 4.3 seconds.

**The API will change!** This is an early version. Don't use this code if you don't want to be on the bleeding edge.


## Installation and Usage

```sh
$ npm install quixote
```

Or download [dist/quixote.js](dist/quixote.js).

Quixote must be run in a browser. It's meant to be used with test frameworks such as Karma, Mocha, and Jasmine.

Quixote is a UMD module. If you just load the file using a `<script>` tag, it will be available via the global variable `quixote`. You can also require it using a module loader such as Browserify or Require.js.

*Performance note:* In some cases (specifically, Safari on Mac OS X), running Quixote while the browser is hidden causes very slow tests. If you have trouble with slow tests, make sure your browser windows are visible.


## Example

In this example, we're testing a page that has a logo, a menu, and three columns of content.

```javascript
describe("Example", function() {

  var frame;        // Quixote test frame
  var logo;         // the logo element on the page
  var menu;         // the menu element
  var contentLeft;  // our three columns of content
  var contentMiddle;     
  var contentRight;   

  before(function(done) {
    // Create a 600x800 pixel iframe and load example.html
    var options = { src: "/base/src/example.html" };
    frame = quixote.createFrame(600, 800, options, done);
  });
  
  after(function() {
    // Destroy the test frame
    frame.remove();
  });
  
  beforeEach(function() {
    // Before each test, reset the test frame to a pristine state.
    // This is faster than re-creating the frame every time.
    frame.reset();
    
    // Get the elements we want to test
    logo = frame.getElement("#logo");       // you can use any CSS selector
    menu = frame.getElement(".menu");
    contentLeft = frame.getElement(".content-left");
    contentMiddle = frame.getElement(".content-middle");
    contentRight = frame.getElement(".content-right");
  });
  
  it("positions logo at top of page", function() {
    // We use the 'assert()' method to check multiple properties
    // of our element all at once. When something doesn't match, it
    // throws an error explaining everything that's different.
    // Alternatively, can use 'diff()' if you'd rather use your own
    // assertion library.
    
    // Check that the logo is in a fixed position on the page
    logo.assert({
      top: 10,    // logo is 10px from top of page
      left: 15    // and 15px from left
    });
  });
  
  it("positions menu below logo", function() {
    // Compare position of menu with position of logo
    menu.assert({
      left: logo.left,            // menu is aligned with logo
      top: logo.bottom.plus(10)   // and below it with a 10px gap
    });
  });
  
  it("groups content into three columns", function() {
    // Compare size and position of content columns to the menu
    
    // left column
    contentLeft.assert({
      left: menu.left,                // aligned with left edge of menu
      width: menu.width.times(1/3)    // one-third width of menu
    });
    
    // We can also factor out useful expressions:
    var columnWidth = menu.width.times(1/3);
    
    // middle column
    contentMiddle.assert({
      center: menu.center,            // aligned with center of menu
      width: columnWidth
    });
    
    // right column 
    contentRight.assert({
      right: menu.right,              // aligned with right edge of menu
      width: columnWidth
    });
  });
  
  it("uses big font for menu", function() {
    // So far, 'assert()' and 'diff()' only support positioning.
    // But you can get any CSS style you want by using 'getRawStyle()'.
  
    // Get the font size actually displayed in the browser
    var fontSize = menu.getRawStyle("font-size");  
    
    // You'll need an assertion library like Chai to make assertions.
    assert.equal(fontSize, "18px");
  });
  
});
```

Quixote provides plain-english, easily-scannable error messages. For example, if the content columns in the example above had an error, you would get an error message like this:

```
Error: Differences found:
left edge of '.contentLeft' was 10px further left than expected.
  Expected: 10px (left edge of '.menu')
  But was:  0px
width of '.contentLeft' was 20px larger than expected.
  Expected: 200px (one third of width of '.menu')
  But was:  220px
```


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


## Contributing

There are many useful ways to contribute. Here's a few:

* **Try Quixote on your own projects.** Download the code, try it out, and [create issues](https://github.com/jamesshore/quixote/issues) for anything that doesn't work smoothly. The bleeding-edge distribution is at [dist/quixote.js](https://raw.githubusercontent.com/jamesshore/quixote/master/dist/quixote.js) and you can install the current official release from npm using `npm install quixote`.

* **Submit a pull request.** See below for instructions.

* **Create a logo.** I'm imagining Don Quixote jousting with a CSS windmill, but feel free to let your imagination run wild.
 
* **Build the website.** I've set up [quixote-css.com](http://www.quixote-css.com) for documentation. I plan to write API documentation as we go, but I don't expect to have time to create the site itself during the hackathon. You can find the site source code in the `docs` folder. (If you work on this, I'd appreciate visual consistency with my other big projects, [letscodejavascript.com](http://www.letscodejavascript.com) and [objectplayground.com](http://www.objectplayground.com). In particular, you can [find the Object Playground styles here](https://github.com/jamesshore/object_playground/blob/master/src/site.css).) 

* **Tell your friends and colleagues.** Even if you can't contribute anything, spreading the word is a big help. Let people know about Quixote and why you like it.


### Pull Requests

Pull requests are welcome. Please [create an issue](https://github.com/jamesshore/quixote/issues) describing the problem or feature that your pull request addresses, then link the pull request to the issue. That will allow us to discuss the issue and consider alternate solutions more easily.

To create a pull request:

1. **[Create an issue](https://github.com/jamesshore/quixote/issues)** on GitHub describing the problem or feature you're addressing. Add a comment saying that you're working on a pull request to address it. (It's probably a good idea to search the existing issues first to see if anybody else is talking about the same thing.)  
2. **[Fork the Quixote repository](https://help.github.com/articles/fork-a-repo/)** on GitHub.
3. **Clone the fork** to your computer by following the "Setup" instructions below. (Use your GitHub user name instead of `jamesshore` in step 2.)
4. **Run the tests** by following the "Running the Tests" instructions below. 
5. **Create a branch** to make your changes in: `git checkout -b <branch_name>`.
6. **Make your changes**, committing as desired. When you're done, make sure the tests pass.
7. **Push your changes** to GitHub: `git push`.
8. **[Create a pull request](https://help.github.com/articles/creating-a-pull-request/)** on GitHub. Add a comment referencing the issue it addresses.

Thank you for your contribution!


### Setup

To work with the code on your own computer:

1. Install [Node.js](http://nodejs.org/download/).
2. Clone the GitHub repository: `git clone https://github.com/jamesshore/quixote.git`
3. All commands must run from the root of the source tree: `cd quixote`.


### Running the Tests

1. Run `./jake.sh karma` to start the Karma server.
2. Start the browsers you want to test and point each one at `http://localhost:9876`.
3. Run `./jake.sh loose=true` to build and test, or `./watch.js loose=true` to automatically rebuild when you make a change.

At this time, the build has only been tested on Mac OS X. It should also work on Unix without any trouble. It's theoretically capable of working on Windows, but needs some script work before that's easy and convenient.


#### Build parameters

You can pass the following options to `./jake.sh`:

* `-T` displays available build targets.

* `loose=true` prevents the build from failing if you don't test [every browser](build/config/tested_browsers.js).

* `capture=Firefox,Safari` automatically launches, uses, and quits the requested browsers. You can use this instead of running `./jake.sh karma` and manually starting the browsers yourself. It's most useful for automated build runners such as Travis CI. Note that you'll need to install the appropriate launcher first; e.g., `npm install karma-firefox-launcher`.


#### Other build scripts

* `./integrate.sh` validates the dev branch and merges it into the known-good master branch.
* `./release.sh` publishes to npm, github, and our [documentation site](http://www.quixote-css.com).

Only the project maintainer (James Shore) is likely to need these scripts. 


### Finding Your Way Around

* `build` contains build scripts.
* `docs` contains the documentation website (online at [quixote-css.com](http://quixote-css.com)).
* `dist` contains the compiled library (downloadable at [dist/quixote.js](https://raw.githubusercontent.com/jamesshore/quixote/master/dist/quixote.js) or using `npm install quixote`).
* `src` contains the source code and tests. Test code starts with an underscore.
* `node_modules` contains third-party libraries needed for build automation.
* `vendor` contains third-party libraries needed for Quixote itself.


### Branches

* `master` is the known-good integration branch. This branch should always build and pass its tests.
* `dev` is for work in progress.

Previous commits on the integration branch have "INTEGRATE" in their commit comment.


## Credits

Created by James Shore as part of the [Let's Code: Test-Driven JavaScript](http://www.letscodejavascript.com) screencast. Let's Code JavaScript is a screencast series on professional, rigorous web development.

Many thanks to our contributors! The @name is the contributors GitHub username. (vX.Y) is the version where their contribution first appeared. 
* Jay Bazuzi (@JayBazuzi): Travis CI integration (v0.1)
* @bjornicus: Fail fast if HTML or stylesheet URL is invalid (v0.3) 


## License

MIT License. See `LICENSE.TXT`.
# Quixote - CSS Unit Testing

[![Build Status (Travis-CI)](https://secure.travis-ci.org/jamesshore/quixote.png?branch=master )](http://travis-ci.org/jamesshore/quixote)

Quixote is a library for unit testing CSS. You use it with a unit testing framework such as [Mocha](http://visionmedia.github.io/mocha/) or [Jasmine](http://jasmine.github.io/). It works particularly well when combined with a cross-browser test runner such as [Karma](http://karma-runner.github.io/0.12/index.html) or [Test'em](https://github.com/airportyh/testem).

**The API will change!** This is a very early version. Don't use this code if you don't want to be on the bleeding edge.


## Installation and Usage

```sh
$ npm install quixote
```

Or download [dist/quixote.js](dist/quixote.js).

Quixote must be run in a browser. It's meant to be used with test frameworks such as Karma, Mocha, and Jasmine.

Quixote is a UMD module. If you just load the file directly, it will be available via the global variable `quixote`. You can also require it using a module loader such as Browserify or Require.js.

*Performance note:* In some cases (specifically, Safari on Mac OS X), running Quixote while the browser is hidden causes very slow tests. If you have trouble with slow tests, make sure your browser windows are visible.


## Example

Here's an example using Mocha. In this example, we're testing a page that has a logo and a menu.

```javascript
describe("Example", function() {

  var frame;      // Quixote test frame
  var logo;       // the logo element on the page
  var menu;       // the menu element

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
    logo = frame.getElement("#logo");           // use any CSS selector
    menu = frame.getElement(".menu");
  });
  
  it("positions logo at top of page", function() {
    // We use the 'assert()' method to check multiple properties
    // of our element all at once. When something doesn't match, it
    // throws an error explaining everything that's different.
    // Alternatively, can use 'diff()' if you'd rather use your own
    // assertion library.
    
    // Check that the logo is in the top-left corner
    logo.assert({
      top: 10,    // logo is 10px from top of page
      left: 15    // and 15px from left
    });
  });
  
  it("positions menu below logo", function() {
    // Check that the menu is aligned with the logo
    menu.assert({
      left: logo.left,            // menu is aligned with logo
      top: logo.bottom.plus(10)   // and below it with a 10px gap
    });
  });
  
  it("uses big font for menu", function() {
    // So far, 'assert()' and 'diff()' only support basic positioning.
    // But you can get any CSS style you want by using 'getRawStyle()'.
  
    var fontSize = menu.getRawStyle("font-size");  
    
    // You'll need an assertion library like Chai to make assertions.
    assert.equal(fontSize, "18px");
  });
  
});
```


## API

There are three classes and modules available to you:

* `quixote` is your entry point. It allows you to create a iframe for testing.
* `Frame` is how you manipulate the DOM inside your test frame.
* `QElement` allows you to get information about your styled elements.

**The API will change!** This is a very early version. Don't use this code if you don't want to be on the bleeding edge.


### Entry Point: `quixote`

The `quixote` module just has one method: `quixote.createFrame()`. You'll use this to create your test frame. For performance, it's best to do this just once per test suite.

#### quixote.createFrame()

Create a test iframe.

`frame = quixote.createFrame(width, height, options, callback(err, frame))`

* `frame` (Frame): The newly-created frame. Although the frame is returned immediately, you have to wait for the callback to execute before you can use it.

* `width` (number): Width of the iframe

* `height` (number): Height of the iframe

* `options` (optional object): Options for creating the frame:
  * `src` (optional string): URL of an HTML document to load into the frame
  * `stylesheet` (optional string): URL of a CSS stylesheet to load into the frame
  * Note: `src` and `stylesheet` may not be used at the same time. To load a stylesheet with an HTML document, use a `<link>` tag in the HTML document itself.
  
* `callback(err, loadedFrame)` (function): Called when the frame has been created. 
  * `err` (Error or null): Any errors that occurred while loading the frame (always `null`, for now)
  * `loadedFrame` (Frame): The newly-created frame, loaded and ready to use. This is exact same object reference as `frame` and either may be used.  


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

* `element` (QElement object): The element that matches your selector.

* `selector` (string): A CSS selector. Any selector that works with [querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Document.querySelectorAll) will work. In particular, note that IE 8 is limitated to CSS2 selectors only.

Example: `var foo = frame.getElement("#foo");`

#### frame.addElement()

Create an element and add it to the end of the frame's body. Throws an exception unless exactly one element is created.

`element = frame.addElement(html)`

* `element` (QElement object): The element you created.

* `html` (string): HTML for your element.

Example: `var foo = frame.addElement("<p>foo</p>");`


### Class: `QElement`

`QElement` instances represent individual HTML tags. You'll use them to get information about how the elements on your page are styled.


#### Properties

QElement instances have several properties that can be used to make assertions about your element's position and (eventually) styling. You'll typically use this with QElement's `diff()` method.
 
* `top`: Top edge of the element, including (outside) the border and padding, but not including the margin 
* `right`: Right edge
* `bottom`: Bottom edge
* `left`: Left edge


#### element.diff

Compare the element's properties to a set of expected values.

`diff = element.diff(expected)`

* `diff` (string): A human-readable description of any differences found, or an empty string if none.

* `expected` (object): An object containing one or more of the above-listed properties (`top`, `right`, etc.) as keys, along with the expected value as a number.

Example: `assert.equal(element.diff({ top: 13, bottom: 42 }), "")`


#### element.getRawStyle

Determine how an element displays a particular style, as computed by the browser. This uses [getComputedStyle()](https://developer.mozilla.org/en-US/docs/Web/API/Window.getComputedStyle) under the covers. (On IE 8, it uses [currentStyle](http://msdn.microsoft.com/en-us/library/ie/ms535231%28v=vs.85%29.aspx)).

`style = element.getRawStyle(property)`

* `style` (string): The browser's computed style, or an empty string if the style wasn't recognized.
 
* `property` (string): The name of the property to retrieve. Should always be written in snake-case, even on IE 8.

Example: `var fontSize = element.getRawStyle("font-size")`;

Cross-Browser Compatibility: `getRawStyle` does not attempt to resolve cross-browser differences, with two exceptions:

* IE 8 uses `currentStyle` rather than `getComputedStyle()`, and snake-case property names are converted to camelCase to match currentStyle's expectation.
* Different browsers return `null`, `undefined`, or `""` when a property can't be found. Quixote always returns `""`. 


#### element.getRawPosition

Determine where an element is displayed within the frame viewport, as computed by the browser. This uses [getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect) under the covers. Note that scrolling the document will cause the position to change.

`position = element.getRawPosition()`

* `position` (object): The position of the element relative to the top of the viewport. In other words, if you scroll the viewport down 10 pixels, `top` will be 10 pixels smaller. All values include border and padding, but not margin.
  * `top` (number): top edge
  * `right` (number): right edge
  * `bottom` (number): bottom edge
  * `left` (number): left edge
  * `width` (number): width (right edge minus left edge)
  * `height` (number): height (bottom edge minus top edge)

Example: `var top = element.getRawPosition().top;`

Cross-Browser Compatibility: `getRawPosition()` does not attempt to resolve cross-browser differences, with one exception:

* IE 8's `getBoundingClientRect()` does not have `width` or `height` properties, but `getRawPosition()` does, even on IE 8. It calculates them from the other properties.


## Virtual Hackathon

This project will developed live Oct 13-16, 2014 starting at 10am PDT (GMT-7). You can watch and participate at [hitbox.tv/jamesshore](http://hitbox.tv/jamesshore) . 


### How to Contribute

Thanks for your interest! There are many useful ways to contribute. Here's a few:

* **Participate in the Virtual Hackathon.** We're starting on Monday, October 13th at 10am PDT (GMT-7). Watch [the livestream](http://hitbox.tv/jamesshore), participate in the chat, and provide suggestions and feedback. (Note: to participate in the chat, you'll need a [hitbox account](http://www.hitbox.tv).) 

* **Try Quixote on your own projects.** Download the code, try it out, and let us know what works well and what needs improvement. The bleeding-edge distribution is at [dist/quixote.js](https://raw.githubusercontent.com/jamesshore/quixote/master/dist/quixote.js) and you can install the current official release from npm using `npm install quixote`.

* **Create a logo.** I'm imagining Don Quixote jousting with a CSS windmill, but feel free to let your imagination run wild.
 
* **Build the website.** I've set up [quixote-css.com](http://www.quixote-css.com) for documentation. I plan to write API documentation as we go, but I don't expect to have time to create the site itself during the hackathon. You can find the site source code in the `docs` folder. (If you work on this, I'd appreciate visual consistency with my other big projects, [letscodejavascript.com](http://www.letscodejavascript.com) and [objectplayground.com](http://www.objectplayground.com). In particular, you can [find the Object Playground styles here](https://github.com/jamesshore/object_playground/blob/master/src/site.css).) 

* **Tell your friends and colleagues.** Even if you can't participate yourself, spreading the word is a big help. Let people know what's going on and how to participate.


#### Pull Requests

Pull requests are welcome! Please [create an issue](https://github.com/jamesshore/quixote/issues) describing the problem or feature that your pull request addresses, then link the pull request to the issue. That will allow us to discuss the issue and consider alternate solutions more easily.

To create a pull request:

1. [Create an issue](https://github.com/jamesshore/quixote/issues) on GitHub describing the problem or feature you're addressing. Add a comment saying that you're working on a pull request to address it. (It's probably a good idea to search the existing issues first to see if anybody else is talking about the same thing.)  
2. [Fork the Quixote repository](https://help.github.com/articles/fork-a-repo/) on GitHub.
3. Clone the fork to your computer by following the "Setup" instructions below. (Use your GitHub user name instead of `jamesshore` in step 2.)
4. Run the tests by following the "Running the Tests" instructions below. 
5. Check out a branch to make your changes in: `git checkout -b <branch_name>`.
6. Make your changes, committing as desired. When you're done, make sure the tests pass.
7. Push your changes to GitHub: `git push`.
8. [Create a pull request](https://help.github.com/articles/creating-a-pull-request/) on GitHub. Add a comment referencing the issue it addresses.

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

Thanks to our contributors!
* Jay Bazuzi (@JayBazuzi): Travis CI integration


## License

MIT License. See `LICENSE.TXT`.
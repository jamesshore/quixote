# Quixote - CSS Unit and Integration Testing

[![Build Status (Travis-CI)](https://secure.travis-ci.org/jamesshore/quixote.png?branch=master )](http://travis-ci.org/jamesshore/quixote)

Quixote is a library for testing CSS. It's fast—over 100 tests/second—and has a powerful API. You can use it for unit testing (test your CSS files directly) or integration testing (test against a real server). Either way, your tests check how page elements are actually rendered by the browser.

Quixote runs in the browser and works with any test framework. You can even test multiple browsers simultaneously by using a tool such as [Karma](http://karma-runner.github.io) or [Test'em](https://github.com/airportyh/testem). It works in modern desktop browsers, mobile browsers, and IE 8+.

**Example test:**

```javascript
// 'frame' is the Quixote test frame. See the complete example linked below for details.
var menu = frame.get(".menu");
var navbar = frame.get("#navbar");

menu.assert({
  top: navbar.bottom.plus(10),    // The menu is 10px below the navbar,
  left: frame.page().left,        // it's flush against the left side of the screen,
  width: frame.viewport().width   // and it's exactly as wide as the viewport.
});
```

**Example output:**

```
top edge of '.menu' was 13px lower than expected.
  Expected: 50px (10px below bottom edge of '#navbar')
  But was:  63px
```

## Useful Links

* **[API Documentation](docs/api.md)**
* **[Browsers Tested for This Release](build/config/tested_browsers.js)**
* **[Change Log](CHANGELOG.md)**
* **[Roadmap](ROADMAP.md)**
* **[Contributing](CONTRIBUTING.md)**
* **[License (MIT)](LICENSE.txt)**


## Installation

```sh
$ npm install quixote
```

Or download [dist/quixote.js](dist/quixote.js).

Quixote is a UMD module. If you just load the file using a `<script>` tag, it will be available via the global variable `quixote`.


## Usage

Quixote runs in the browser and works with any test framework. The following examples use [Karma](http://karma-runner.github.io) and [Mocha](https://mochajs.org/) together.

Quixote works by rendering elements in an iframe, then checking them using [getComputedStyle()](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle) and [getBoundingClientRect(https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)]. These two APIs allow Quixote to check how elements *are actually rendered* in the browser.


## Comparison to Other Tools

The site [CSS Test](http://csste.st) has a great rundown of CSS testing tools and libraries. To summarize, there's two main approaches to CSS testing:

### Automatic Screenshot Comparison

One of the most popular approaches, exemplified by [Wraith](https://github.com/BBC-News/wraith), is to programmatically take a screenshot of a page and compare it to a known-good screenshot. If there's a difference, the test fails and the user gets a composite view with the differences highlighted. This is great for checking if things have changed. However, it's slow and prone to false positives.


### Computed Style Checking

The other popular approach, and the one used by Quixote, is to ask the DOM how the browser has rendered it elements. This is much faster than the screenshot approach, and it allows users to write smaller, simpler tests. However, the DOM calls are cumbersome and suffer from bugs and inconsistencies. Quixote is the only tool we are aware of that attempts to solve these problems.




## Example

```javascript
// Quixote works with your existing test framework.
// In this example, we're using Mocha.

describe("Example", function() {

  var frame;        // Quixote test frame
  var logo;         // the logo element on the page
  var menu;         // the menu element

  // Create the test frame once for all your tests.
  // Here we load example.html. You can also create elements programmatically.
  before(function(done) {
    var options = { src: "/base/src/example.html" };
    frame = quixote.createFrame(options, done);
  });
  
  // Destroy the test frame after your tests are done.
  after(function() {
    frame.remove();
  });
  
  // Reset the test frame before (or after) each test. This is
  // faster than re-creating the frame for every test.
  beforeEach(function() {
    frame.reset();
    
    // Get the elements we want to test
    logo = frame.get("#logo");       // you can use any CSS selector
    menu = frame.get(".menu");
  });
  
  // Here's our test.
  it("positions menu below logo", function() {
    // The 'assert()' method checks multiple properties at once.
    // You can also use 'diff()' with your favorite assertion library.
    menu.assert({
      // We can check a hard-coded value
      left: 15,    // menu is 15px from left side of page
      
      // Or, better yet, check the relationship between elements
      top: logo.bottom.plus(10)   // menu is 10px below logo
    });
  });
  
  it("uses big font for menu", function() {
    // Sometimes, 'assert()' doesn't support what you need.
    // But you can check any CSS style you want by using 'getRawStyle()'.
  
    // Get the font size actually displayed in the browser
    var fontSize = menu.getRawStyle("font-size");  
    
    // Use your preferred assertion library (such as Chai) to make assertions.
    assert.equal(fontSize, "18px");
  });
  
});
```


## API Overview

**[Detailed API documentation is here.](docs/api.md)**

The method you'll use most often is `element.assert({ descriptor: expectation, ... })`. It takes an object containing several [QElement descriptors](docs/descriptors.md) as keys, along with each one's expected value, which can be another descriptor or a hard-coded value. See the [descriptor documentation](docs/descriptors.md) for more information and several examples.

For styles other than positions and sizes, you'll use `element.getRawStyle(style)`. This method determines how an element displays a specific CSS style. See the [QElement documentation](docs/QElement.md) for details.

You'll also use these methods to set up your tests:

* `quixote.createFrame(options, callback(err, frame))` creates the test frame. Call this once per test suite. ([Details in `quixote` documentation.](docs/quixote.md))

* `frame.remove()` removes the test frame. Call this once per test suite. ([Details in `QFrame` documentation.](docs/QFrame.md))

* `frame.reset()` resets the test frame. Call this before or after each test to reset to a known-good state. This is faster than creating a new frame each time. ([Details in `QFrame` documentation.](docs/QFrame.md))

* `element = frame.get(selector)` gets an element out of the frame. Call this for each element you want to test. You can also use `frame.getAll(selector)` to get multiple elements or `frame.add(html)` to programmatically create an element. ([Details in `QElement` documentation.](docs/QElement.md))

For more information, see [the API documentation](docs/api.md).


## Contributing

Pull requests are welcome! Here are some specific contributions we're looking for:

* **Let us know how Quixote works for you.** Download the code, try it out, and [let me know](https://twitter.com/jamesshore) how it worked for you. [Create an issue](https://github.com/jamesshore/quixote/issues) if anything didn't work smoothly or if you had trouble understanding something.

* **Create new descriptors.** Descriptors are small classes that describe how to calculate and describe CSS. Our [descriptor creation tutorial is here](src/descriptors/README.md).

* **Create a logo.** I'm imagining Don Quixote jousting with a CSS windmill, but feel free to let your imagination run wild.
 
* **Start the website.** I've set up [quixote-css.com](http://www.quixote-css.com) for documentation, but so far, everything's just in markdown files. The website source code is in [docs](docs). The [Object Playground site](http://www.objectplayground.com) and [stylesheet](https://github.com/jamesshore/object_playground/blob/master/src/site.css) are a good starting point.

* **Tell your friends and colleagues.** Even if you can't contribute anything, spreading the word is a big help. Let people know about Quixote and why you like it.

Information about [setting up the code and submitting pull requests is here](CONTRIBUTING.md). Please [create an issue](https://github.com/jamesshore/quixote/issues) for anything you start on. It will act as a central point for coordination and let other people know that work is in progress.


## Credits

Created by James Shore as part of the [Let's Code: Test-Driven JavaScript](http://www.letscodejavascript.com) screencast. Let's Code JavaScript is a screencast series on rigorous, professional web development.

Many thanks to our contributors!

* Jay Bazuzi (@JayBazuzi): Travis CI integration (v0.1)
* @bjornicus: Fail fast if HTML or stylesheet URL is invalid (v0.3) 


## License

MIT License. See [LICENSE.txt](LICENSE.txt).
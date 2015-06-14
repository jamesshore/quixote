# Quixote - CSS Unit Testing

[![Build Status (Travis-CI)](https://secure.travis-ci.org/jamesshore/quixote.png?branch=master )](http://travis-ci.org/jamesshore/quixote)
[![Quixote definitons on DefinitelyTyped](https://img.shields.io/badge/quixote-.d.ts-blue.svg)](https://github.com/borisyankov/DefinitelyTyped/blob/master/quixote/quixote.d.ts)

Quixote is a library for unit testing CSS. It lets you make assertions about your pages' elements, their relationships, and how they are actually styled by the browser. It has a compact, powerful API and produces beautiful failure messages.

```javascript
menu.assert({
  top: logo.bottom.plus(10)   // menu is 10px below logo
});
```

```
top edge of '.menu' was 13px lower than expected.
  Expected: 50px (10px below bottom edge of '#logo')
  But was:  63px
```

**Browser Support:** IE 8+, Firefox, Chrome, Safari, Mobile Safari, Opera, and other modern browsers. See [tested_browsers.js](./build/config/tested_browsers.js) for the exact list of browsers tested for this release.

PhantomJS 1.x is *not* supported because its WebKit version is too old. We hope to officially support PhantomJS 2.x when it's ready. See [issue #10](https://github.com/jamesshore/quixote/issues/10) for details.

**Performance:** Fast. Quixote's own test suite runs over 200 tests/sec.

Changes in this version are described in [the change log](CHANGELOG.md).


## Installation and Usage

```sh
$ npm install quixote
```

Or download [dist/quixote.js](dist/quixote.js).

Quixote must be run in a browser. It's meant to be used with test frameworks such as [Karma](http://karma-runner.github.io), [Mocha](http://visionmedia.github.io/mocha/), or [Jasmine](http://jasmine.github.io/).

Quixote is a UMD module. If you just load the file using a `<script>` tag, it will be available via the global variable `quixote`. You can also require it using a module loader such as Browserify or Require.js.

*Performance note:* In some cases (specifically, Safari on Mac OS X), running Quixote while the browser is hidden causes very slow tests. If you have trouble with slow tests, make sure your browser windows are visible.

For a skeleton project to copy and extend, see [@bjornicus' example](https://github.com/bjornicus/tddcss).


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

[Detailed API documentation is here.](docs/api.md)

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

MIT License. See `LICENSE.TXT`.
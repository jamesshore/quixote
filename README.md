# Quixote - CSS Unit Testing

[![Build Status (Travis-CI)](https://secure.travis-ci.org/jamesshore/quixote.png?branch=master )](http://travis-ci.org/jamesshore/quixote)

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

**Browser Support:** IE 8+, Firefox, Chrome, Safari, Mobile Safari, and other modern browsers. See [tested_browsers.js](./build/config/tested_browsers.js) for the exact list of browsers tested for this release.

**Performance:** Fast. Quixote's own test suite runs about 200 tests/sec.


## Installation and Usage

```sh
$ npm install quixote
```

Or download [dist/quixote.js](dist/quixote.js).

Quixote must be run in a browser. It's meant to be used with test frameworks such as [Karma](http://karma-runner.github.io), [Mocha](http://visionmedia.github.io/mocha/), or [Jasmine](http://jasmine.github.io/).

Quixote is a UMD module. If you just load the file using a `<script>` tag, it will be available via the global variable `quixote`. You can also require it using a module loader such as Browserify or Require.js.

*Performance note:* In some cases (specifically, Safari on Mac OS X), running Quixote while the browser is hidden causes very slow tests. If you have trouble with slow tests, make sure your browser windows are visible.


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

These are the methods you'll use most often:

* `quixote.createFrame(options, callback(err, frame))` creates the test frame. Call this once per test suite.

* `frame.remove()` removes the test frame. Call this once per test suite.

* `frame.reset()` resets the test frame. Call this before or after each test to reset to a known-good state. (This is faster than creating a new frame each time.)

* `element = frame.get(selector)` gets an element out of the frame. Call this for each element you want to test. You can also use `frame.getAll(selector)` to get multiple elements.
 
* `element.assert({ property, property, ... });` checks the styling of an element. Call this in each test.

* `element.getRawStyle(style)` looks up a specific CSS style. You can use it for anything `assert()` doesn't support yet.

The `assert()` function looks at the properties of your element and checks them against hardcoded values or other elements' properties. For example, `element.assert({ top: 10 })` or `element.assert({ top: otherElement.bottom })`.

Element properties can be mixed and matched in a variety of ways. For details, see [the API documentation](docs/api.md).


## Contributing

Pull requests are welcome! Here are some specific contributions we're looking for:

* **Let us know how Quixote works for you.** Download the code, try it out, and [let me know](https://twitter.com/jamesshore) how it worked for you. [Create an issue](https://github.com/jamesshore/quixote/issues) if anything didn't work smoothly or if you had trouble understanding something.

* **Create new descriptors.** Descriptors are small classes that describe how to calculate and describe CSS. Our [descriptor creation tutorial is here](src/descriptors/README.md).

* **Create a logo.** I'm imagining Don Quixote jousting with a CSS windmill, but feel free to let your imagination run wild.
 
* **Start the website.** I've set up [quixote-css.com](http://www.quixote-css.com) for documentation, but so far, everything's just in markdown files. The website source code is in [docs](docs). The [Object Playground site](http://www.objectplayground.com) and [stylesheet](https://github.com/jamesshore/object_playground/blob/master/src/site.css) are a good starting point.

* **Tell your friends and colleagues.** Even if you can't contribute anything, spreading the word is a big help. Let people know about Quixote and why you like it.

Information about [setting up the code and submitting pull requests is here](CONTRIBUTING.md). Please [create an issue](https://github.com/jamesshore/quixote/issues) for anything you start on. It will act as a central point for coordination and let other people know that work is in progress.


## Credits

Created by James Shore as part of the [Let's Code: Test-Driven JavaScript](http://www.letscodejavascript.com) screencast. Let's Code JavaScript is a screencast series on professional, rigorous web development.

Many thanks to our contributors!

* Jay Bazuzi (@JayBazuzi): Travis CI integration (v0.1)
* @bjornicus: Fail fast if HTML or stylesheet URL is invalid (v0.3) 


## License

MIT License. See `LICENSE.TXT`.
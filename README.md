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

[Detailed API documentation is here.](docs/api.md)

These are the methods you'll use most often:

* `quixote.createFrame(width, height, options, callback(err, frame))` creates the test frame. Call this once per test suite.

* `frame.remove()` removes the test frame. Call this once per test suite.

* `frame.reset()` resets the test frame. Call this before or after each test to reset to a known-good state. (This is faster than creating a new frame each time.)

* `element = frame.getElement(selector)` gets an element out of the frame. Call this for each element you want to test.
 
* `element.assert({ property, property, ... });` checks the styling of an element. Call this in each test.

The `assert()` function looks at the properties of your element and checks them against hardcoded values *or* other element's properties. For example, `element.assert({ top: 10 });` or `element.assert({ top: otherElement.bottom })`.

The properties use objects called "Descriptors." Descriptors can be mixed and matched in a variety of ways. For details, see [the API documentation](docs/api.md).


## Contributing

Pull requests are welcome! Here's some specific contributions we're looking for:

* **Try Quixote on your own projects.** Download the code, try it out, and [let me know](https://twitter.com/jamesshore) how it worked for you or [create an issue](https://github.com/jamesshore/quixote/issues) for anything that doesn't work smoothly.

* **Create new descriptors.** Descriptors are how Quixote translates CSS into cross-platform tests. They're often small and simple, and the best are designed to mix and match with other descriptors. Our [descriptor creation tutorial is here](src/descriptors/README.md).

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
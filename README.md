# Quixote - CSS Unit and Integration Testing

[![Build Status (Travis-CI)](https://secure.travis-ci.org/jamesshore/quixote.png?branch=master )](http://travis-ci.org/jamesshore/quixote)

Quixote is a library for testing CSS. It's fast—over 100 tests/second—and has a powerful API. You can use it for unit testing (test your CSS files directly) or integration testing (test against a real server). Either way, your tests check how page elements are actually rendered by the browser.

Quixote runs in the browser and works with any test framework. You can even test multiple browsers simultaneously by using a tool such as [Karma](http://karma-runner.github.io) or [Test'em](https://github.com/airportyh/testem). It works in modern desktop browsers, mobile browsers, and IE 8+.

**Example test:**

```javascript
// 'frame' is the Quixote test frame. See the complete examples below for details.
var header = frame.get("#header");
var navbar = frame.get(".navbar");

navbar.assert({
  top: header.bottom.plus(10),    // The navbar is 10px below the header,
  left: frame.page().left,        // it's flush against the left side of the screen,
  width: frame.viewport().width   // and it's exactly as wide as the viewport.
});
```

**Example output:**

```
top edge of '.navbar' was 13px lower than expected.
  Expected: 50px (10px below bottom edge of '#header')
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

Quixote is a UMD module, which means it will work with CommonJS and AMD module loaders. If you just load the file using a `<script>` tag, Quixote will be available via the global variable `quixote`.


## Usage

Quixote runs in the browser and works with any test framework. The following examples use [Karma](http://karma-runner.github.io), [Mocha](https://mochajs.org/), and [Chai](http://chaijs.com/).

Quixote works by rendering elements in an iframe, then checking them using [getComputedStyle()](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle) and [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)]. These two APIs allow Quixote to check how elements *are actually rendered* in the browser.


### 1. Choose your test style

Quixote can be used in a unit-testing style or an integration-testing style (or both).

#### Unit Test Style

Use the unit test style when you want to test-drive individual CSS rules. In the unit test style, you'll use Quixote to:

1. Load your CSS file
2. Create elements that are styled by your CSS
3. Confirm that the elements are displayed correctly.

A Quixote unit test might be used to test-drive a "button" class:

```css
.button {
  display: block;
  width: 100%;
  
  text-align: center;
  text-transform: uppercase;
  text-decoration: none;
}
```

The test code would look like this:  

```javascript
var assert = require("chai").assert;
var quixote = require("quixote");

describe("Button", function() {

  var frame;
  var container;
  var button;
  
  before(function(done) {
    frame = quixote.createFrame({
      stylesheet: "/base/src/client/screen.css"
    }, done);
  });
  
  after(function() {
    frame.remove();
  });
  
  beforeEach(function() {
    frame.reset();
    container = frame.add(
      "<div>" +
      "  <a id='button' class='button' href='#anything'>foo</a>" +
      "</div>"
    );
    button = frame.get("#button");
  });
  
  it("fills its container", function() {
    button.assert({
      width: container.width
    });
  });
  
  it("has styled text", function() {
    assert.equal(button.getRawStyle("text-align"), "center", "should be centered");
    assert.equal(button.getRawStyle("text-decoration"), "underline", "should be underlined");
    assert.equal(button.getRawStyle("text-transform"), "uppercase", "should be uppercase");
  });

});
```

#### Integration Test Style

Use the integration test style when you want to test a complete web page. In the integration test style, you'll use Quixote to:

1. Load your URL
2. Get elements from the page 
3. Confirm that the elements are displayed correctly.

Imagine a site with a home page that contained a logo at the top and a nav bar below it. The logo is centered and the nav bar stretches the width of the window. The integration test for that page would look like this: 

```javascript
var assert = require("chai").assert;
var quixote = require("quixote");

describe("Home page", function() {
  
  var BACKGROUND_BLUE = "rgb(65, 169, 204);
  var WHITE = "rgb(255, 255, 255);
  var MEDIUM_BLUE = "rgb(0, 121, 156)";
  
  var frame;
  var logo;
  var navbar;
  
  before(function(done) {
    frame = quixote.createFrame({
      src: "/",     // the URL must be proxied to localhost
      width: 800
    }, done);
  });
  
  after(function(done) {
    frame.remove();
  });

  beforeEach(function() {
    frame.reset();
    
    logo = frame.get("#logo");
    navbar = frame.get("#navbar");
  });

  it("has an overall layout", function() {
    logo.assert({
      top: 12,
      center: frame.page().center
    }, "logo should be centered at top of page");
    assert.equal(logo.getRawStyle("text-align"), "center", "logo alt text should be centered");
    
    navbar.assert({
      top: logo.bottom.plus(10),
      left: frame.page().left,
      width: frame.viewport().width
    }, "navbar should stretch the width of the window");
  });
  
  it("has a color scheme", function() {
    assert.equal(frame.body().getRawStyle("background-color", BACKGROUND_BLUE, "page background");
    assert.equal(logo.getRawStyle("color", WHITE, "logo text");
    assert.equal(navbar.getRawStyle("background-color", MEDIUM_BLUE, "navbar background color");
    assert.equal(navbar.getRawStyle("color", WHITE, "navbar text");
  });
  
  it("has a typographic scheme", function() {
    // etc
  });
  
});
```


### 2. Install a test framework

To begin, you'll need a way of running tests in the browser. You can use any test framework you like.

If you don't already have a preferred test framework:

1. Install [Karma](http://karma-runner.github.io). Karma runs your test suite in multiple browsers simultaneously.
2. Install [Mocha](https://mochajs.org/). Mocha is a test framework. It organizes and runs your tests.
3. Install [Chai](http://chaijs.com/). Chai is an assertion library. It allows you to check results. 

See the [example](example/) directory for a seed project that has Karma, Mocha, and Chai set up for you. Read [the readme](example/README.md) in that directory to learn how to use it.


### 3. Serve your test files

Quixote gets your CSS and HTML files by loading URLs. You'll need to configure your test tool to make sure they're available. For integration tests, you'll need to proxy your server to localhost to avoid browser security errors.

#### Unit Test Style

In the unit test style, you load your CSS files directly. If you're using Karma, you can do it by modifying the `files` parameter in `karma.conf.js`. By default, they'll be available off of the `/base/` directory. 

```javascript
files: [
  // ...
  { pattern: 'src/client/screen.css', included: false }
  // The 'included' parameter prevents Karma from automatically loading your CSS. 
],
```

#### Integration Test Style

In the integration test style, you load an HTML page that's styled by your CSS. Because of browsers' security rules, the file must be served from the same server as your test, which means your test server will have to proxy the real server.

If you're using Karma, you can do it by setting the `proxies` parameter in `karma.conf.js`. In most cases, you'll want to proxy your server under test to the root directory, which means you'll also want to move the Karma runner from the root to a different directory. You can do that with the `urlRoot` parameter.

```javascript
urlRoot: '/karma/'
proxies: {
  '/': 'http://server_under_test/'
},
```

Normally, to capture a browser for Karma, you visit `http://localhost:9876`. With this configuration, you would visit `http://localhost:9876/karma` instead. Visiting `http://localhost:9876` will show you the proxied server under test.


### 4. Set up your tests

Now you can write your tests. Quixote uses a special test frame for its tests, so you'll need to create and destroy it using [quixote.createFrame()](https://github.com/jamesshore/quixote/blob/dev/docs/quixote.md#quixotecreateframe) and [frame.remove()](https://github.com/jamesshore/quixote/blob/dev/docs/QFrame.md#frameremove). This is a relatively slow operation, so try to do it just once for each file you test.

If you modify the contents of the test frame, you can reset it to a pristine state by calling [frame.reset()](https://github.com/jamesshore/quixote/blob/dev/docs/QFrame.md#framereset). This is faster than recreating the test frame.

#### Unit Test Style

In the unit test style, you create a frame that loads your CSS file:
 
```javascript
var quixote = require("quixote");

var frame;

before(function(done) {
  frame = quixote.createFrame({
    stylesheet: "/base/src/client/screen.css"
  }, done);
});

after(function() {
  frame.remove();
});

beforeEach(function() {
  frame.reset();
});
```

#### Integration Test Style

In the integration test style, you do the same thing, but your frame will load your proxied server under test:

```javascript
var quixote = require("quixote");

var frame;

before(function(done) {
  frame = quixote.createFrame({
    src: "/"
  }, done);
});

after(function() {
  frame.remove();
});

beforeEach(function() {
  frame.reset();
});
```


### 5. Test your code

The Quixote test frame will give you access to everything you need to test your code. You can add elements to the frame using [frame.add()](https://github.com/jamesshore/quixote/blob/dev/docs/QFrame.md#frameadd) or get elements from the frame using [frame.get()](https://github.com/jamesshore/quixote/blob/dev/docs/QFrame.md#frameget). Once you have an element, you can use Quixote's custom assertions by calling [element.assert()](https://github.com/jamesshore/quixote/blob/dev/docs/QElement.md#elementassert). You can also pull style information out of an element, for use with another assertion library, by calling [element.getRawStyle()](https://github.com/jamesshore/quixote/blob/dev/docs/QElement.md#elementgetrawstyle). 

#### Unit Test Style

In the unit test style, you add elements to the frame so they'll be styled by your CSS file. By adding the elements in your test, you make it easier to understand how your test works and you document how your CSS is meant to be used.

For example, if you were planning to test-drive this CSS:

```css
.button {
  display: block;
  width: 100%;
  
  text-align: center;
  text-transform: uppercase;
  text-decoration: none;
}
```

You would use this code:

```javascript
describe("Button") {
  beforeEach(function() {
    frame.reset();
    container = frame.add(
      "<div>" +
      "  <a id='button' class='button' href='#anything'>foo</a>" +
      "</div>"
    );
    button = frame.get("#button");
  });
  
  it("fills its container", function() {
    button.assert({
      width: container.width
    });
  });
  
  it("has styled text", function() {
    assert.equal(button.getRawStyle("text-align"), "center", "should be centered");
    assert.equal(button.getRawStyle("text-decoration"), "underline", "should be underlined");
    assert.equal(button.getRawStyle("text-transform"), "uppercase", "should be uppercase");
  });

});
```

#### Integration Test Style

In the integration test style, you load a complete page, so rather than adding elements to the frame, you'll just pull out the ones you want to test.

```javascript
describe("Home page", function() {
  
  var BACKGROUND_BLUE = "rgb(65, 169, 204);
  var WHITE = "rgb(255, 255, 255);
  var MEDIUM_BLUE = "rgb(0, 121, 156)";
  
  var logo;
  var navbar;
  
  beforeEach(function() {
    frame.reset();
    
    logo = frame.get("#logo");
    navbar = frame.get("#navbar");
  });

  it("has an overall layout", function() {
    logo.assert({
      top: 12,
      center: frame.page().center
    }, "logo should be centered at top of page");
    assert.equal(logo.getRawStyle("text-align"), "center", "logo alt text should be centered");
    
    navbar.assert({
      top: logo.bottom.plus(10),
      left: frame.page().left,
      width: frame.viewport().width
    }, "navbar should stretch the width of the window");
  });
  
  it("has a color scheme", function() {
    assert.equal(frame.body().getRawStyle("background-color", BACKGROUND_BLUE, "page background");
    assert.equal(logo.getRawStyle("color", WHITE, "logo text");
    assert.equal(navbar.getRawStyle("background-color", MEDIUM_BLUE, "navbar background color");
    assert.equal(navbar.getRawStyle("color", WHITE, "navbar text");
  });
  
  it("has a typographic scheme", function() {
    // etc
  });
  
});
```


## Comparison to Other CSS Testing Tools

The site [CSS Test](http://csste.st) has a great rundown of CSS testing tools and libraries. To summarize, there are two main approaches to CSS testing:

### Automatic Screenshot Comparison

One of the most popular approaches, exemplified by [Wraith](https://github.com/BBC-News/wraith), is to programmatically take a screenshot of a page and compare it to a known-good screenshot. If there's a difference, the test fails and the user gets a composite view with the differences highlighted. This is great for checking if things have changed. However, it's slow and prone to false positives.


### Computed Style Checking

The other popular approach, and the one used by Quixote, is to ask the DOM how the browser has rendered it elements. This is orders of magnitude faster than the screenshot approach and it allows users to write smaller, simpler tests. However, the DOM calls are cumbersome and suffer from bugs and inconsistencies. Quixote is the only tool we are aware of that attempts to solve these problems.




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
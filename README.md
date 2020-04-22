# Quixote - CSS Unit and Integration Testing

Quixote is a library for testing CSS. It's fast—over 100 tests/second—and has a powerful API. You can use it for unit testing (test your CSS files directly) or integration testing (test against a real server). Either way, your tests check how HTML elements are actually rendered by the browser.

 Quixote is unique for its ability to test how elements relate to each other. For example, you can test if one element is below another element, or how an element compares to the browser's viewport.

**Example test:**

```javascript
// 'frame' is the Quixote test frame. See below for complete examples.
var header = frame.get("#header");
var navbar = frame.get(".navbar");

navbar.top.should.equal(header.bottom);             // the navbar is immediately below the header
navbar.width.should.equal(frame.viewport().width);  // the navbar is exactly as wide as the viewport
```

**Example output:**

```
top edge of '.navbar' should be 13px higher.
  Expected: 50px (bottom edge of '#header')
  But was:  63px
```

Quixote runs in the browser and works with any test framework. You can even test multiple browsers simultaneously by using a tool such as [Karma](http://karma-runner.github.io) or [Test'em](https://github.com/airportyh/testem). It works in modern desktop browsers, mobile browsers, and IE 8+.


## Resources

* **[API Documentation](docs/api.md)**
* **[Complete Example](example)**
* **[Browsers Tested for This Release](build/config/tested_browsers.js)**
* **[Change Log](CHANGELOG.md)**
* **[Roadmap](ROADMAP.md)**
* **[Contributing](CONTRIBUTING.md)**
* **[License (MIT)](LICENSE.txt)**


## Installation

```sh
$ npm install quixote
```

Or download [dist/quixote.js](https://raw.githubusercontent.com/jamesshore/quixote/master/dist/quixote.js).

Quixote is a UMD module, which means it will work with CommonJS and AMD module loaders. If you just load the file using a `<script>` tag, Quixote will be available via the global variable `quixote`.


## Usage

Quixote runs in the browser and works with any test framework. The following examples use [Karma](http://karma-runner.github.io), [Mocha](https://mochajs.org/), and [Chai](http://chaijs.com/).

Quixote works by rendering elements in an iframe and allowing you to check how they were rendered. Under the covers, it uses the [getComputedStyle()](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle) and [getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) DOM APIs.

To use Quixote, follow these steps:

1. Choose your test style
2. Install a test framework
3. Serve your test files
4. Set up your tests
5. Test your code

See the [example](example/) directory for a seed project containing a complete example.

**Note:** When testing Safari and Chrome on Mac OS X, make sure the browser windows are visible. When the windows aren't visible, Mac OS lowers their priority and the tests will run very slowly or time out.


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
    button.width.should.equal(container.width);
  });
  
  it("has styled text", function() {
    assert.equal(button.getRawStyle("text-align"), "center", "should be centered");
    assert.equal(button.getRawStyle("text-decoration"), "none", "should not be underlined");
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
  
  var BACKGROUND_BLUE = "rgb(65, 169, 204)";
  var WHITE = "rgb(255, 255, 255)";
  var MEDIUM_BLUE = "rgb(0, 121, 156)";
  
  var frame;
  var logo;
  var navbar;
  
  before(function(done) {
    frame = quixote.createFrame({
      src: "/",     // the server under test must be proxied to localhost
      width: 800
    }, done);
  });
  
  after(function(done) {
    frame.remove();
  });

  beforeEach(function(done) {
    frame.reload(done);
  });
    
  beforeEach(function() {
    logo = frame.get("#logo");
    navbar = frame.get("#navbar");
  });

  it("has an overall layout", function() {
    logo.top.should.equal(12, "logo should be at top of page");
    logo.center.should.equal(frame.page().center, "logo should be centered");
    assert.equal(logo.getRawStyle("text-align"), "center", "logo alt text should be centered");

    navbar.top.should.equal(logo.bottom.plus(10), "navbar should be below logo");
    navbar.left.should.equal(frame.page().left, "navbar should be flush to left of page");
    navbar.width.should.equal(frame.page().width, "navbar should stretch the width of window");
  });
  
  it("has a color scheme", function() {
    assert.equal(frame.body().getRawStyle("background-color"), BACKGROUND_BLUE, "page background");
    assert.equal(logo.getRawStyle("color"), WHITE, "logo text");
    assert.equal(navbar.getRawStyle("background-color"), MEDIUM_BLUE, "navbar background color");
    assert.equal(navbar.getRawStyle("color"), WHITE, "navbar text");
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
 
If you're using Karma, you may also want to use the [karma-quixote](https://github.com/woldie/karma-quixote) plugin. This plugin will automatically load Quixote into the global `quixote` variable for you. 


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

Now you can write your tests. Quixote uses a special test frame for its tests, so you'll need to create and destroy it using [quixote.createFrame()](https://github.com/jamesshore/quixote/blob/master/docs/quixote.md#quixotecreateframe) and [frame.remove()](https://github.com/jamesshore/quixote/blob/master/docs/QFrame.md#frameremove). This is a relatively slow operation, so try to do it just once for each file you test.

If you modify the contents of the test frame, you can reset it to a pristine state by calling [frame.reset()](https://github.com/jamesshore/quixote/blob/master/docs/QFrame.md#framereset) or [frame.reload()](https://github.com/jamesshore/quixote/blob/master/docs/QFrame.md#framereload). This is faster than recreating the test frame.


#### Unit Test Style

In the unit test style, you create a frame that loads your CSS file and use `frame.reset()` to reset any changes:
 
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

In the integration test style, you do the same thing, but your frame will load your proxied server under test. Also, because `frame.reset()` doesn't re-run scripts, you'll use the slower but more thorough `frame.reload()` to reset the page.

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

beforeEach(function(done) {
  frame.reload(done);
});
```


### 5. Test your code

The Quixote test frame will give you access to everything you need to test your code. You can add elements to the frame using [frame.add()](docs/QFrame.md#frameadd) and get elements from the frame using [frame.get()](docs/QFrame.md#frameget). Once you have an element, you can use Quixote's custom assertions by using the properties on [QElement](docs/QElement.md) and other classes. You can also pull style information out of an element, for use with another assertion library, by calling [element.getRawStyle()](docs/QElement.md#elementgetrawstyle).

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
  ︙

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
    button.width.should.equal(container.width);
  });

  it("has styled text", function() {
    assert.equal(button.getRawStyle("text-align"), "center", "should be centered");
    assert.equal(button.getRawStyle("text-decoration"), "none", "should not be underlined");
    assert.equal(button.getRawStyle("text-transform"), "uppercase", "should be uppercase");
  });

});
```

#### Integration Test Style

In the integration test style, you load a complete page, so rather than adding elements to the frame, you'll just pull out the ones you want to test.

```javascript
  ︙

  beforeEach(function(done) {
    frame.reload(done);
  });

  beforeEach(function() {
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


## Gotchas

Browsers can be a bit unpredictable when it comes to testing CSS.

* When using the integration testing style, the URL you're testing has to be served from the same server as your test page. (This is due to browser security restrictions.) If you're using Karma, you can use its built-in proxy server to do this. See "3. Serve your test files" in the Usage section for instructions.

* Some browsers run very slowly if the browser window isn't visible. (For example, Safari on Mac OS X.) This can cause your tests to time out. If you have trouble with browser timeouts, make sure the test tab is visible.

* Internet Explorer seems to have a weird caching issue related to font sizes. If you change the size of a font in your CSS and your IE tests don't pick up the change, try reloading the test tab or restarting the browser. We don't yet fully understand this issue, so if you figure out what's going on, let us know by [opening an issue](https://github.com/jamesshore/quixote/issues) on Github.
 
* Browser pixel-rounding issues are exaggerated when the page is not at 100% zoom. If you have trouble with positioning or size-related assertions, check your test pages' zoom level. (To reset to 100% zoom, use Ctrl-0 or Command-0 in most browsers.) 

* If you have issues with tests working on some browsers but not others, check the Quixote documentation. We've documented several cross-browser compatibility issues and their workarounds. You can use also the [`quixote.browser`](https://github.com/jamesshore/quixote/blob/master/docs/quixote.md#quixotebrowser) object to detect some cross-browser differences in your tests.


## Comparison to Other CSS Testing Tools

There are two main approaches to CSS testing:

### Automatic Screenshot Comparison

One of the most popular approaches, exemplified by [Wraith](https://github.com/BBC-News/wraith), is to programmatically take a screenshot of a page and compare it to a known-good screenshot. If there's a difference, the test fails and the user gets a composite view with the differences highlighted. This is great for checking if things have changed. However, it's slow and prone to false positives.


### Computed Style Checking

The other popular approach, and the one used by Quixote, is to ask the DOM how the browser has rendered its elements. This is 100x faster than the screenshot approach and it allows users to write more targeted tests. However, the DOM calls are cumbersome and suffer from bugs and inconsistencies. Quixote is the only tool we are aware of that attempts to solve these problems.


## Credits

Created by James Shore as part of the [Let's Code: Test-Driven JavaScript](http://www.letscodejavascript.com) screencast. Let's Code JavaScript is a screencast series on rigorous, professional web development.

Many thanks to our contributors!

* Jay Bazuzi (@JayBazuzi): Travis CI integration (v0.1; removed in v0.14.1)
* Bjorn Hansen (@bjornicus): Fail fast if HTML or stylesheet URL is invalid (v0.3)
* Steve Henty (@cognivator): `QFrame.reload()` for single-page apps and other scripts (v0.11)
* Dave Woldrich (@woldie): `none` option in position and size descriptors, documentation improvements (v0.12)
* Tim Neil (@moefinley): Documentation bug-fix (v0.12.1)
* Noah Burney (@nwah): Prevent failure when `QFrame.add()` uses HTML with leading or trailing whitespace (v0.12.2)
* Thomas Hallock (@antialias): Documentation bug-fix (v0.12.3)
* Juan Caicedo (@JuanCaicedo): Prevent Browserify from failing when used against Quixote npm module (v0.12.4)
* Juan Caicedo (@JuanCaicedo): Documentation bug-fix (v0.12.5)
* Dave Woldrich (@woldie): Prototype of `element.rendered` descriptor and related collaboration on issue (v0.13)
* Sam Graber (@SamGraber): `css` option in `quixote.createFrame()` (v0.13)
* Justin (@greyepoxy): `quixote.elementFromDom()` for using Quixote with third-party test runners (v0.15)
* Justin (@greyepoxy): Initial work on new nickname generation approach (v1.0.0)


## License

MIT License. See [LICENSE.txt](LICENSE.txt).

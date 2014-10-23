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

Many thanks to our contributors!

* Jay Bazuzi (@JayBazuzi): Travis CI integration (v0.1)
* @bjornicus: Fail fast if HTML or stylesheet URL is invalid (v0.3) 


## License

MIT License. See `LICENSE.TXT`.
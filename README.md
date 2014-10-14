# Quixote - CSS Unit Testing

[![Build Status (Travis-CI)](https://secure.travis-ci.org/jamesshore/quixote.png?branch=master )](http://travis-ci.org/jamesshore/quixote)

This repository will contain the code for Quixote, a library for unit testing CSS. 


## Usage and API

The code is in `dist/quixote.js`. It's a UMD module, so it will work with CommonJS module loaders like Browserify and AMD loaders like Require.js. If you're not using a module loader, it will create a global variable named `quixote`.

### Example of Use

Quixote is intended to be used inside of a test framework such as [Mocha](http://visionmedia.github.io/mocha/) or [Jasmine](http://jasmine.github.io/). It works particularly well when combined with a cross-browser test runner such as [Karma](http://karma-runner.github.io/0.12/index.html) or [Test'em](https://github.com/airportyh/testem) Here's an example using Karma, Mocha, Chai, and Browserify:

```javascript
var quixote = require("quixote");     // Load Quixote
var assert = require("chai").assert   // Load the Chai assertion library

describe("Example CSS test", function() {

  // *** TEST SETUP *** //

  // The Quixote test frame we're going to create
  var frame;

  // Quixote will create a frame and load our HTML and CSS into that frame.
  // This is slow, so we use the Mocha's before() function to do it just once.
  before(function(done) {
    // Create a 600 pixel wide by 800 pixel tall iframe and load test.html into it
    quixote.createFrame(600, 800, { src: "/base/example/test.html" }, function(theFrame) {
      frame = theFrame;     // Store the frame for future use
      done();               // Tell Mocha we're done
    );
  )};
  
  // When this set of tests is done, erase the test frame
  after(function() {
    frame.remove();
  });
  
  // Before each test, reset the test frame to a pristine state.
  // This is faster than re-creating the frame every time.
  beforeEach(function() {
    frame.reset();
  });
  
  
  // *** EXAMPLE TESTS *** //
  
  // You can make assertions about the positions of elements
  it("asserts positions", function() {
    var foo = frame.getElement("#foo");     // Get an element using an #id selector. Any selector can be used.
    
    var position = foo.getRawPosition();    // Get the element's position on the page
    
    assert.equal(position.top, 42);         // You can make assertions about where the element is located 
  });
  
  // You can make assertions about how elements are actually styled
  it("asserts styles", function() {
    var bar = frame.getElement(".bar");             // Get an element using a .class selector.
    
    var fontSize = bar.getRawStyle("font-size");    // Get the font-size actually shown on the page  
    
    assert.equal(fontSize, "42px");                 // Check it
  });
  
  
  // More sophisticated API coming soon!
});

```




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
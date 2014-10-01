# Quixote - CSS Unit Testing

This repository will contain the code for Quixote, a library for unit testing CSS. 

This project will developed live at starting on Oct 13, 2014 at 10am PDT (GMT-7). To watch or participate, go to http://hitbox.tv/jamesshore . 


## Contributing

To contribute to this project, please participate in the livestream.


### Setup

To work with this code on your own computer:

1. Install [Node.js](http://nodejs.org/download/).
2. Clone the GitHub repository: `git clone https://github.com/jamesshore/quixote.git`
3. All commands must run from the root of the source tree: `cd quixote`.

### Running the Tests

1. Run `./jake.sh karma` to start the Karma server.
2. Start the browsers you want to test and point each one at `http://localhost:9876`.
3. Run `./jake.sh loose=true` to build and test, or `./watch.js loose=true` to automatically rebuild when you make a change.

The `loose=true` parameter prevents the build from failing if you don't test every browser in [our list of tested browsers](build/config/tested_browsers.js). 

At this time, the build has only been tested on Mac OS X. It should also work on Unix without any trouble. It's theoretically capable of working on Windows, but needs some script work before that's easy and convenient.

### Finding Your Way Around

* `build` contains build scripts.
* `dist` contains the compiled library.
* `src` contains the source code and tests. (Tests all start with an underscore.)
* `node_modules` contains third-party libraries needed for build automation.
* `vendor` contains third-party libraries needed for Quixote itself.

### Branches

* `master` is the known-good integration branch. This branch should always build and pass its tests.
* `dev` is for work in progress.

Previous commits on the integration branch have "INTEGRATE" in their commit comment.


## Credits

Created by James Shore as part of the [Let's Code: Test-Driven JavaScript](http://www.letscodejavascript.com) screencast. Let's Code JavaScript is a screencast series on professional, rigorous web development. 


## License

MIT License. See `LICENSE.TXT`.
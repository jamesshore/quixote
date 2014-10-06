# Quixote - CSS Unit Testing

This repository will contain the code for Quixote, a library for unit testing CSS. 

## Virtual Hackathon

This project will developed live Oct 13-16, 2014 starting at 10am PDT (GMT-7). You can watch and participate at [hitbox.tv/jamesshore](http://hitbox.tv/jamesshore) . 


### How to Contribute

Thanks for your interest! There are many useful ways to contribute. Here's a few:

* **Participate in the Virtual Hackathon.** We're starting on Monday, October 13th at 10am PDT (GMT-7). Watch [the livestream](http://hitbox.tv/jamesshore), participate in the chat, and provide suggestions and feedback. (Note: to participate in the chat, you'll need a [hitbox account](http://www.hitbox.tv).)

* **Try Quixote on your own projects.** Download the code, try it out, and let us know what works well and what needs improvement. The bleeding-edge distribution is at [dist/quixote.js](https://raw.githubusercontent.com/jamesshore/quixote/master/dist/quixote.js) and you can install the current official release from npm using `npm install quixote`.

* **Create a logo.** I'm imagining Don Quixote jousting with a CSS windmill, but feel free to let your imagination run wild.
 
* **Build the website.** I've set up [quixote-css.com](http://www.quixote-css.com) for documentation. I plan to write API documentation as we go, but I don't expect to have time to create the site itself during the hackathon. You can find the site source code in the `docs` folder. (If you work on this, I'd appreciate visual consistency with my other big projects, [letscodejavascript.com](http://www.letscodejavascript.com) and [objectplayground.com](http://www.objectplayground.com). In particular, you can [find the Object Playground styles here](https://github.com/jamesshore/object_playground/blob/master/src/site.css).) 

* **Tell your friends and colleagues.** Even if you can't participate yourself, spreading the word is a big help. Let people know what's going on and how to participate.


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


## License

MIT License. See `LICENSE.TXT`.
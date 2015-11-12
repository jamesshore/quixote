# Quixote Contribution Guidelines

Pull requests are welcome! Here are some specific contributions we're looking for:

* **Let us know how Quixote works for you.** Download the code, try it out, and [let me know](https://twitter.com/jamesshore) how it worked for you. [Create an issue](https://github.com/jamesshore/quixote/issues) if anything didn't work smoothly or if you had trouble understanding something.

* **Create new descriptors.** Descriptors are small classes that describe how to calculate and describe CSS. Our [descriptor creation tutorial is here](src/descriptors/README.md).

* **Create a logo.** I'm imagining Don Quixote jousting with a CSS windmill, but feel free to let your imagination run wild.
 
* **Start the website.** I've set up [quixote-css.com](http://www.quixote-css.com) for documentation, but so far, everything's just in markdown files. The website source code is in [docs](docs). The [Object Playground site](http://www.objectplayground.com) and [stylesheet](https://github.com/jamesshore/object_playground/blob/master/src/site.css) are a good starting point.

* **Tell your friends and colleagues.** Even if you can't contribute anything, spreading the word is a big help. Let people know about Quixote and why you like it.


## Pull Requests

If you're planning on making a pull request, here's a helpful checklist:

1. **[Create an issue](https://github.com/jamesshore/quixote/issues)** so we know what you're working on and other people who are interested can coordinate with you.

2. **[Fork the Quixote repository](https://help.github.com/articles/fork-a-repo/)** on GitHub.

3. **Set up your computer** by following the "Working with the Code" instructions below.

4. **Create a branch** for your changes. Start from the `master` branch. It has the latest known-good code.
   ```sh
   $ git checkout master
   $ git checkout -b <your_branch>
   ```
   
5. **Make your changes**, committing as desired. When you're done, make sure the tests pass.

6. **Push your changes** to GitHub: `git push`.

7. **[Create a pull request](https://help.github.com/articles/creating-a-pull-request/)** and add a comment referencing the issue it addresses.
   
Thank you!


## Working with the Code

To work with the code on your own computer:

1. Install [Node.js](http://nodejs.org/download/).
2. Clone the GitHub repository: `git clone https://github.com/jamesshore/quixote.git`
3. All commands must run from the root of the source tree: `cd quixote`.
4. Run the tests as described below. They should pass. If not, [open an issue](https://github.com/jamesshore/quixote/issues) or [contact me @jamesshore on Twitter](https://twitter.com/jamesshore).


## Running the Tests

1. Run `./jake.sh karma` to start the Karma server.
2. Start the browsers you want to test and point each one at `http://localhost:9876`.
3. Run `./jake.sh loose=true` to build and test, or `./watch.js loose=true` to automatically rebuild when you make a change.

**If you get a timeout error** in `__reset.js`, particularly on Safari or Chrome, it's probably due to the window being hidden or a different tab being shown. Safari and Chrome deprioritizes tabs that aren't visible, which causes the tests to timeout. To fix the issue, make sure some portion of the Karma page is visible. 

At this time, the build has only been tested on Mac OS X. It should also work on Unix without any trouble. It's theoretically capable of working on Windows, but needs some script work before that's easy and convenient.

### Build parameters

You can pass the following options to `./jake.sh` and `./watch.js`:

* `-T` displays available build targets.

* `loose=true` prevents the build from failing if you don't test [every browser](build/config/tested_browsers.js).

* `capture=Firefox,Safari,etc` automatically launches, uses, and quits the requested browsers. You can use this instead of running `./jake.sh karma` and manually starting the browsers yourself. It's most useful for automated build runners such as Travis CI. Note that you may need to install the appropriate launchers; e.g., `npm install karma-safari-launcher`.

### Other build scripts

You won't need to run these scripts, but in case you're curious: 

* `./integrate.sh` validates the dev branch and merges it into the known-good master branch.
* `./release.sh` publishes to npm, github, and our [documentation site](http://www.quixote-css.com).


## Finding Your Way Around

All the Quixote source and test code is in `src`. Test code starts with an underscore. The `src` directory uses the following structure:

* `src` contains our top-level API.
* `src/descriptors` contains descriptors: objects that describe how a CSS value can be calculated and displayed.
* `src/values` contain values: objects that represent a calculated result.

Other top-level directories contain infrastructure and support.

* `build` contains build scripts and configuration.
* `docs` contains API docs and the placeholder website (online at [quixote-css.com](http://quixote-css.com)).
* `dist` contains the compiled library.
* `spikes` contains one-off experiments.
* `src` contains the source code and tests. Test code starts with an underscore.
* `node_modules` contains third-party libraries needed for the build scripts.
* `vendor` contains third-party libraries needed for Quixote itself.

There's a tutorial for creating new descriptors [in the descriptors directory](src/descriptors/README.md).


## Branches

* `master` is the known-good integration branch. This branch should always build and pass its tests.
* `dev` contains my work in progress.

Previous commits on the integration branch have "INTEGRATE" in their commit comment.


## Release Process

For use by the project maintainer.

1. Remove any temporary branches (list with `git branch`, delete with `git branch -d <name>`)
2. Update readme and API documentation as needed.
3. Update changelog and roadmap.
4. Run `./integrate.sh` to integrate dev branch into master branch.
5. Run `.release [major | minor | patch]` to release. The release script releases to npm and github.
6. Publicize.

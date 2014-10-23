# Quixote Contribution Guidelines

Contributions are welcome! Thank you for your help.


## Contribution Checklist

If you're planning on making a contribution, the following checklist will help you get started:

1. **[Create an issue](https://github.com/jamesshore/quixote/issues)** so we know what you're working on and other people who are interested can coordinate with you.

2. **[Fork the Quixote repository](https://help.github.com/articles/fork-a-repo/)** on GitHub.

3. **Set up your computer** by following the "Setup" instructions below.

4. **Create a branch** for your changes. Start from the `master` branch. It has the latest known-good code.
   ```sh
   $ git checkout master
   $ git checkout -b <your_branch>
   ```
   
5. **Make your changes**, committing as desired. When you're done, make sure the tests pass.

6. **Push your changes** to GitHub: `git push`.

7. **[Create a pull request](https://help.github.com/articles/creating-a-pull-request/)** and add a comment referencing the issue it addresses.
   
Thank you!


## Setup

To work with the code on your own computer:

1. Install [Node.js](http://nodejs.org/download/).
2. Clone the GitHub repository: `git clone https://github.com/jamesshore/quixote.git`
3. All commands must run from the root of the source tree: `cd quixote`.
4. Run the tests as described below. They should pass. If not, [open an issue](https://github.com/jamesshore/quixote/issues) or [contact me @jamesshore on Twitter](https://twitter.com/jamesshore).


## Running the Tests

1. Run `./jake.sh karma` to start the Karma server.
2. Start the browsers you want to test and point each one at `http://localhost:9876`.
3. Run `./jake.sh loose=true` to build and test, or `./watch.js loose=true` to automatically rebuild when you make a change.

At this time, the build has only been tested on Mac OS X. It should also work on Unix without any trouble. It's theoretically capable of working on Windows, but needs some script work before that's easy and convenient.

**Build parameters**

You can pass the following options to `./jake.sh`:

* `-T` displays available build targets.

* `loose=true` prevents the build from failing if you don't test [every browser](build/config/tested_browsers.js).

* `capture=Firefox,Safari` automatically launches, uses, and quits the requested browsers. You can use this instead of running `./jake.sh karma` and manually starting the browsers yourself. It's most useful for automated build runners such as Travis CI. Note that you'll need to install the appropriate launcher first; e.g., `npm install karma-firefox-launcher`.

**Other build scripts**

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
  * `src/
* `node_modules` contains third-party libraries needed for the build scripts.
* `vendor` contains third-party libraries needed for Quixote itself.


## Branches

* `master` is the known-good integration branch. This branch should always build and pass its tests.
* `dev` contains my work in progress.

Previous commits on the integration branch have "INTEGRATE" in their commit comment.

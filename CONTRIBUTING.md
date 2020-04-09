# Quixote Contribution Guidelines

Pull requests are welcome! Here are some specific contributions we're looking for:

* **Let us know how Quixote works for you.** Download the code, try it out, and [let me know](https://twitter.com/jamesshore) how it worked for you. [Create an issue](https://github.com/jamesshore/quixote/issues) if anything didn't work smoothly or if you had trouble understanding something.

* **Add descriptors for more CSS properties.** Quixote can test any CSS element using the [`QElement.getRawStyle()`](https://github.com/jamesshore/quixote/blob/master/docs/QElement.md#elementgetrawstyle) method, but the [`QElement.assert()`](https://github.com/jamesshore/quixote/blob/master/docs/QElement.md#elementassert) method is more sophisticated. (It works consistently across browsers, allows relative comparisons, and provides better failure messages.) `QElement.assert()` uses [descriptors](https://github.com/jamesshore/quixote/blob/master/docs/descriptors.md) and we'd eventually like to have descriptors for every CSS property. To contribute new descriptors, see the [Architecture](#architecture) section below. Please open an issue before doing too much work so we can discuss the API design.

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
3. Run `./jake.sh loose=true` to build and test, or `./watch.js loose=true` to automatically rebuild when you make a change. You can use `./jake.sh quick loose=true` (or `./watch.js quick loose=true`) to only build files that have changed.

**If you get a timeout error** in `__reset.js`, it's probably due to the window being hidden or a different tab being shown. Many browsers deprioritize tabs that aren't visible, which causes the tests to timeout. To fix the issue, make sure some portion of the Karma page is visible.

At this time, the build has only been tested on Mac OS X. It should also work on Unix without any trouble. It's theoretically capable of working on Windows, but needs some script work before that's easy and convenient.

### Debugging with tests

Sometimes, you'll need to manually inspect the results of a test. But Karma (our test runner) automatically resets itself after the end of every test run. To see the results, you need to press the "DEBUG" button on the Karma page in the browser you want to look at. This will open a new tab and run the tests in that tab. It doesn't automatically refresh, so after you make changes, you'll need to run the tests and then manually refresh the tab.

We have a global `beforeEach()` defined in `__reset.js` that resets the test frame before every test run, so you'll only be able to see the results of the last test that runs. Don't change `__reset.js`; instead, make the code run just the one test you want by using Mocha's `.only` feature. To use it, change the test function you care about from `it(...)` to `it.only(...)`. (You can also use `it.skip(...)` to skip tests.)

Therefore, use this process when manually debugging tests:

1. Change the test you want to debug to use `it.only(...)`.
2. Run the tests using the `quick` option so the build only runs the tests you changed.
3. Press the 'Debug' button on the Karma page in the browser you want to check.
4. Debug.
	a. Do some work.
	b. Run the tests.
	c. Refresh the Karma 'Debug' tab.
	d. Repeat until done.
5. When done, remove any uses of `.only` and close the Karma 'Debug' tab.

### Build parameters

You can pass the following options to `./jake.sh` and `./watch.js`:

* `-T` displays available build targets.

* `loose=true` prevents the build from failing if you don't test [every browser](build/config/tested_browsers.js) or if your Node version isn't a perfect match.

* `capture=Firefox,Safari,etc` automatically launches, uses, and quits the requested browsers. You can use this instead of running `./jake.sh karma` and manually starting the browsers yourself. It's most useful for automated build runners such as Travis CI. Note that you may need to install the appropriate launchers; e.g., `npm install karma-safari-launcher`.

### Other build scripts

You won't need to run these scripts, but in case you're curious: 

* `./integrate.sh` validates the dev branch and merges it into the known-good master branch.
* `./release.sh` publishes to npm, github, and our [documentation site](http://www.quixote-css.com).


## Testing Mobile Browsers

To run tests against mobile browsers, you can either use a real mobile device or you can use a simulator. Either way, once you have the mobile OS running, the process is the same as it is on your desktop: start the web browser you want to test, then point it at the Karma server running on your computer.

But, instead of loading `http://localhost:9876`, you'll need to substitute the name or IP address of your computer, such as `http://192.168.0.1:9876`. You'll also need to make sure there's no firewall running that prevents the mobile device from talking to your computer.

### To run the iOS Simulator

1. You'll need a Mac running a recent version of MacOS.
2. Install XCode from the App Store (it's free).
3. Select the "XCode" menu item and choose Open Developer Tool --> Simulator.
4. The simulated iOS device will boot and can be manipulated normally. The window can be moved and resized by dragging the bezel.

You can perform this one-time process to make it easier to run the Simulator:

1. Locate XCode.app in the Finder. It's probably in the Applications folder.
2. Right-click XCode.app and select "Show Package Contents".
3. Navigate to Contents/Developer/Applications. (This path is correct for XCode v11.3.1. It might be different for other versions.)
4. You should see Simulator.app. Right-click it and select "Make Alias".
5. Drag the alias to the Applications folder. You might find it useful to rename it to "iOS Simulator.app".
6. From now on, you should be able to run the Simulator by opening the alias in the Applications folder.

(These instructions were created using XCode v11.3.1.)


### To run the Android Emulator:

1. Install [Android Studio](https://developer.android.com/studio/install). During the install, select the "Performance" and "Android Virtual Device" options. If you already have Android Studio installed, see [these instructions](https://developer.android.com/studio/run/emulator#install) for installing the emulator.
2. After installing, run Android Studio and choose "Start a new Android Studio project," then "Empty Activity." Use the default configuration and press "Finish."
3. After the IDE opens, find and press the "AVD Manager" icon below the title bar. It looks like a small phone with a green blob in the lower right corner. It may also be available in the Tools menu.
4. A window labelled "Your Virtual Devices" will appear. If you see a link labelled "Update System Images," select it and perform the installation.
5. In the "Your Virtual Devices" window, if you don't see the version of Android you want, press the "Create Virtual Device" button.
6. Once you have the device you want, press the small green "play" button on the right.
7. The emulated Android device will boot and can be manipulated normally. The window can be moved by dragging the bezel. It can't be resized.

(These instructions were created using Android Studio v3.6.2.)


## Finding Your Way Around

All the Quixote source and unit test code is in `src`. Test code starts with an underscore. The `src` directory uses the following structure:

* `src` contains our top-level API.
* `src/descriptors` contains descriptors: objects that describe how a CSS value can be calculated and displayed. (See the [Architecture](#architecture) section below for more details.)
* `src/values` contains values: objects that represent a calculated result.
* `src/util` has a few helper modules.

Other top-level directories contain infrastructure and support.

* `build` contains build scripts and configuration.
* `docs` contains API docs and the placeholder website (online at [quixote-css.com](http://quixote-css.com)).
* `dist` contains the compiled library.
* `spikes` contains one-off experiments.
* `test` contains end-to-end tests.
* `node_modules` contains third-party libraries needed for the build scripts.
* `vendor` contains third-party libraries needed for Quixote itself.

There's a tutorial for creating new descriptors [in the descriptors directory](src/descriptors/README.md) and another tutorial for creating value objects [in the values directory](src/values/README.md).


## Branches

* `release` is for releases. It's the default branch shown on GitHub.
* `master` is the known-good integration branch. This branch should always build and pass its tests. When creating a pull request, start from `master`.
* `dev` contains work in progress. This is just for the project maintainer.

Previous commits on the integration branch have "INTEGRATE" in their commit comment.


## Architecture

This discussion assumes you're familiar with the [Quixote API](https://github.com/jamesshore/quixote/blob/master/docs/api.md).

Internally, Quixote's architecture revolves around two core concepts: "Descriptors" and "Values." Descriptor objects represent some aspect of the page, such as "the top edge of element '#foo'", and value objects represent tangible values, such as "60px".

Descriptors and values are implemented with a classical inheritance hierarchy. Descriptor classes ultimately inherit from the [`Descriptor`](src/descriptors/descriptor.js) superclass and value classes inherit from the [`Value`](src/values/value.js) superclass. Descriptor classes are located in the [`src/descriptors`](src/descriptors) folder and value classes are located in [`src/values`](src/values). 

Descriptors are turned into values with the `value()` method implemented by every descriptor class. (This method is for internal use only.) When you make an assertion in Quixote, `value()` is called on both descriptors, then `equals()` is called on the two values to check if they're the same. (This algorithm is implemented by `diff()` in [`descriptor.js`](src/descriptors/descriptor.js).)

Descriptor and Value objects are always instantiated via factory methods, never via constructors.


### Descriptors

Descriptor classes correspond to some visual part of the page. Each descriptor class is focused on one concept, such as [`ElementEdge`](src/descriptors/element_edge.js), which represents the edges of HTML elements.

Descriptor classes often inherit from a superclass that provides a useful public API. For example, `ElementEdge` inherits from [`PositionDescriptor`](src/descriptors/position_descriptor.js), which provides the [`plus()` and `minus()` methods](https://github.com/jamesshore/quixote/blob/master/docs/PositionDescriptor.md). 
 
Descriptor classes have three main features:

1. **They have factory methods** that are used to expose the descriptor in the public API. For example, the public `QElement.top` descriptor is instantiated in [`QElement.js`](src/q_element.js) using this line of code: `this.top = ElementEdge.top(this);`. (You can see the implementation of `ElementEdge.top` in [`element_edge.js`](src/descriptors/element_edge.js).)

2. **They calculate values** via a `value()` method. All CSS logic happens in this method. For example, `ElementEdge.value()` calculates the position of an edge by adding [`QElement.getRawPosition()`](https://github.com/jamesshore/quixote/blob/master/docs/QElement.md#elementgetrawposition) and [`QFrame.getRawScrollPosition()`](https://github.com/jamesshore/quixote/blob/master/docs/QFrame.md#framegetrawscrollposition).

3. **They provide human-readable descriptions** of the part of the page they represent via the `toString()` method. For example, `ElementEdge.toString()` returns strings such as "top edge of 'element'".

Descriptor classes are usually less than 100 lines long. That's because there's one for each kind of CSS calculation. Find them in the [`src/descriptors`](src/descriptors) folder.


### Values

Value classes correspond to concrete units. Each value class represents one unit, such as [`Position`](src/values/position.js), which represents an X or Y coordinate on the web page, or [`Size`](src/values/size.js), which represents width or height.

Value classes are sometimes composed from a more fundamental value. For example, both `Position` and `Size` use a [`Pixels`](src/values/pixels.js) object under the covers.

Value classes have five main features:

1. **They have factory methods** that descriptor classes use in their `value()` method.

2. **They perform calculations** if needed by descriptors. For example, `Position` provides `plus()`, `minus()`, and `midpoint()` calculation methods.

3. **They check for compatibility** via a `compatibility()` method. If two value objects that are incompatible are used together, Quixote will fail fast and throw a useful exception. For example, if you try to add a Position object to a Size, Quixote will throw the error, "Size isn't compatible with Position."

4. **They provide a human-readable comparison** via a `diff()` method. This method checks if two value objects are equal. If they aren't, it returns a human-readable explanation. For example, `Position.diff()` returns strings such as "10px higher". (There's also a traditional `equals()` method that's implemented in the `Value` superclass.)

5. **They provide a human-readable description** via the `toString()` method. For example, `Position.toString()` returns strings such as "60px".

Value classes are usually less than 100 lines long. The logic required isn't very complex. Find them in the [`src/values`](src/values) folder.


## Project Maintenance Checklists

For use by the project maintainer.

### Integrating the dev branch

1. Update documentation as appropriate.
2. Ensure all changes are checked in.
3. Run `./integrate.sh`.
4. If the script fails due to new distribution files, check them in with the comment "Update distribution files", then run `./integrate.sh` again.
5. Consider releasing to GitHub with `./release github`.


## Merging GitHub Pull Requests

1. Start from clean (integrated) dev branch.
2. Merge pull request into dev branch using `git pull` line listed under the "command line instructions" link at the bottom of GitHub's pull request conversation thread.
3. Revise and make additional commits as needed, including updating documentation.
4. Credit contributor at bottom of README.md.
5. Integrate the dev branch as described above.
6. Close pull request. Include a comment saying which version will include the result. Tag associated issue as 'done'.


## Releasing

1. Review Github for 'ready to integrate' issues and pull requests and consider integrating them.
2. Remove any temporary branches (list with `git branch`, delete with `git branch -d <name>`).
3. Review and update readme and API documentation as needed.
4. Update changelog and roadmap.
5. Integrate as described above.
6. Run `./release [major | minor | patch]` to release. The release script releases to npm and github.
7. Close issues tagged 'done' that were released.
8. Publicize.

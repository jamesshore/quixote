# Quixote Contribution Guidelines

Pull requests are welcome! Here are specific contributions we're looking for:

* **Add more assertions.** Quixote can test any CSS property using the [`QElement.getRawStyle()`](docs/QElement.md#elementgetrawstyle) method, but the built-in assertions are more sophisticated. So far, Quixote's assertions have focused on layout, but We'd like to have assertions for every aspect of page rendering. To learn how to add an assertion, see the [Architecture](#architecture) section below. Please open an issue before starting work so we can discuss the API design.

* **Start the website.** I've set up [quixote-css.com](http://www.quixote-css.com) for documentation, but so far, it's just a placeholder. The source code is in [docs](docs).

* **Create a logo.** I'm imagining Don Quixote jousting with a CSS windmill, but feel free to let your imagination run wild.

* **Let us know how Quixote works for you.** Download the code, try it out, and [let me know](https://twitter.com/jamesshore) how it worked for you. [Create an issue](https://github.com/jamesshore/quixote/issues) if anything didn't work smoothly or if you had trouble understanding something.

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

1. Install [Node.js](http://nodejs.org).
2. Clone the GitHub repository: `git clone https://github.com/jamesshore/quixote.git`
3. All commands must run from the root of the source tree: `cd quixote`.
4. Run the tests as described below. They should pass. If not, [open an issue](https://github.com/jamesshore/quixote/issues) or [contact me @jamesshore on Twitter](https://twitter.com/jamesshore).


## Running the Tests

1. Run `./jake.sh karma` to start the Karma server.
2. Start the browsers you want to test and point each one at `http://localhost:9876`.
3. Run `./jake.sh loose=true` to build and test, or `./watch.js loose=true` to automatically rebuild when you make a change. You can use `./jake.sh quick loose=true` (or `./watch.js quick loose=true`) to only build files that have changed.

**If you get a timeout error** in `__reset.js`, it's probably due to the window being hidden or a different tab being shown. Many browsers deprioritize tabs that aren't visible, which causes the tests to timeout. To fix the issue, make sure some portion of the Karma page is visible.

At this time, the build has only been tested on Mac OS X. It should also work on Unix without any trouble. It's theoretically capable of working on Windows, but needs some script work before that's easy and convenient.

### Visually inspecting test output

To look at the results of a test run, use this process:

1. Change the test you want to debug to use `it.only(...)`.
2. Run the tests using the `quick` option so the build only runs the tests you changed.
3. Press the 'Debug' button on the Karma page in the browser you want to check.
4. Karma will open the test in a new tab and you'll be able to see the output.
4. To check again, run the tests again and reload Karma's debug tab.

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
3. Navigate to Contents/Developer/Applications.
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
7. The emulated Android device will boot and can be manipulated normally. The window can be moved by dragging the bezel. It can be resized by dragging one of the corners.

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


## Branches

* `release` is for releases. It's the default branch shown on GitHub.
* `master` is the known-good integration branch. This branch should always build and pass its tests. When creating a pull request, start from `master`.
* `dev` contains work in progress. This is just for the project maintainer.

Previous commits on the integration branch have "INTEGRATE" in their commit comment.


## Architecture

If you aren't familiar with the [Quixote API](docs/api.md), take a moment to review the documentation for the [`QElement`](docs/QElement.md) class, particularly the "Properties" section.

Quixote's architecture revolves around two concepts:

* **Descriptors**, which provide assertions and compute values. They're things like `top edge of .navbar`.
* **Values**, which perform calculations and provide explanations. They're things like `50px`.


### An Example

When you make an assertion with Quixote, you run a line of code that looks like this:

```javascript
navbar.top.should.equal(header.bottom);
```

In this example, `navbar.top` and `header.bottom` are both Descriptors. Specifically, they're `ElementEdge` descriptors (a type of [`PositionDescriptor`](docs/PositionDescriptor.md)). `ElementEdge` descriptors represent the edge of an element.

Here's what the `should.equal()` function does when it's called:

1. `should.equal()` asks `navbar.top` to calculate its Value object.
    1. `navbar.top` uses `QElement.getRawPosition()` and `QElement.getRawScrollPosition()` to find the top edge of the `navbar` element, which is `63` in this example.
    2. `navbar.top` creates a `Position` value object with the value of `63` and returns it.
2. `should.equal()` asks `header.bottom` to calculate its Value object.
    1. `header.bottom` uses `QElement.getRawPosition()` and `QElement.getRawScrollPosition()` to find the bottom edge of the `header` element, which is `50` in this example.
    2. `header.bottom` creates a `Position` value object with the value of `50` and returns it.
3. `should.equal()` asks the two `Position` objects if they're equal.
    1. The Position objects check their values. One is `63`. The other one is `50`.

If the two Value objects were equal, that would be the end. The function would return and the assertion would pass.

In this example, though, they're not equal. The assertion will throw an exception with this error:


```
top edge of '.navbar' should be 13px higher.
  Expected: 50px (bottom edge of '#header')
  But was:  63px
```

Here's how that error is generated:

1. Line one:
    1. `should.equal()` asks the `navbar.top` to convert itself to a string. It says `top edge of '.navbar'`.
    2. `should.equal()` asks the expected `Position` (the one that's `50`) how it's different than the actual `Position` (the one that's `63`). It says `13px higher`.
    3. `should.equal()` concatenates these answers into the first line of the error: `top edge of '.navbar'` `should be` `13px higher`.
2. Line two:
    1. `should.equal()` asks the expected `Position` to convert itself to a string. It says `50px`.
    2. `should.equal()` asks `header.bottom` to convert itself to a string. It says `bottom edge of '#header'`.
    3. `should.equal()` concatenates these answers into the second line of the error: `Expected:` `50px` `(bottom edge of '#header')`
3. Line three:
    1. `should.equal()` asks the actual `Position` to convert itsel to a string. It says `63px`.
    2. `should.equal()` concatenates this answer into the third line of the error: `But was:` `63px`.

Or, to put it differently:

* The Descriptor objects handle what was tested: `top edge of '.navbar'` and `bottom edge of #header`.
* The Value objects handle the results: `13px higher`, `50px`, and `63px`.
* The assertion handles the scaffolding: `should be`, `Expected:`, and `But was:`.


### How To Add New Properties and Assertions

To add new properties and assertions, start by opening an issue so we can discuss the API. Once that's done, you'll need to perform these steps:

1. Decide on a property and assertion API. For example, `element.backgroundColor.should.equal('#ff0000')`
2. Create a new Value class that can represent those sort of values. For example, `Color`.
3. Create a new Descriptor class that can calculate the value of the property. For example, `BackgroundColor`. You can also add custom assertions, such as `element.backgroundColor.should.beDarkerThan()`.
4. Modify an existing class to include your descriptor. For example, add `element.backgroundColor` to `QElement`.
5. Update API documentation.

Your Value class will be responsible for parsing strings, displaying strings, and comparing values.

Your Descriptor class will be responsible for calculating values and making assertions.

For detailed instructions, see our tutorials:

* [Values Tutorial](src/values/README.md).
* [Descriptors Tutorial](src/descriptors/README.md).


### Coding Standards

* Indent with tabs, not spaces. Don't use tabs for anything other than indentation.
* Use factory methods, not constructors. In other words, use `Size.create()`, not `new Size()`.
* All code must be compatible with IE 8. That means no ES6 syntax.
* Use test-driven development to ensure that your code is thoroughly tested and all edge cases considered.


## Project Maintenance Checklists

For use by the project maintainer.

### Integrating the dev branch

1. Update documentation as appropriate.
2. Ensure all changes are checked in.
3. Run `./integrate.sh`.
4. If the script fails due to new distribution files, check them in with the comment "Update distribution files", then run `./integrate.sh` again.
5. Consider releasing to GitHub with `./release github`.

### Merging GitHub Pull Requests

1. Start from clean (integrated) dev branch.
2. Merge pull request into dev branch using `git pull` line listed under the "command line instructions" link at the bottom of GitHub's pull request conversation thread.
3. Revise and make additional commits as needed, including updating documentation.
4. Credit contributor at bottom of README.md.
5. Integrate the dev branch as described above.
6. Close pull request. Include a comment saying which version will include the result. Tag associated issue as 'done'.

### Releasing

1. Review Github for 'ready to integrate' issues and pull requests and consider integrating them.
2. Remove any temporary branches (list with `git branch`, delete with `git branch -d <name>`).
3. Review and update readme and API documentation as needed.
4. Update changelog and roadmap.
5. Integrate as described above.
6. Run `./release [major | minor | patch]` to release. The release script releases to npm and github.
7. Close issues tagged 'done' that were released.
8. Publicize.

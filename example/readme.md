Quixote Example
===========

This example code is based on my "Agile Engineering for the Web" talk, first presented at Øredev in Malmö Sweden on 4 Nov 2015. The talk demonstrates test-driven development of front-end JavaScript and CSS. You can see it online here:

https://vimeo.com/144642399

The Quixote portion starts at 20:50.


Building and Testing
--------------------

Before building for the first time:

1. Install [Node.js](http://nodejs.org/download/).
2. Download the project as described above.
3. All commands must run from the root of the source tree.

To build (and test):

1. Run `./jake.sh karma` (Unix/Mac) or `jake karma` (Windows) to start the Karma server.
2. Start the browsers you want to test and point each one at `http://localhost:9876`.
3. Run `./jake.sh` (Unix/Mac) or `jake` (Windows) every time you want to build and test. Alternatively, use `./watch.sh` (Unix/Mac) or `watch` (Windows) to automatically run `jake` whenever files change.

Add the `loose=true` parameter to relax Node and browser version checking.

To run the app for manual testing:

1. Run `./jake.sh run` (Unix/Mac) or `jake run` (Windows).
2. Open `http://localhost:8080` in a browser.
3. Click the coffee cup icon to see the code in action.


Finding Your Way Around
-----------------------

This repository consists of the following directories:

* `build`: Build, CI, and deployment automation.
* `build/config`: Build configuration.
* `build/scripts`: Build scripts. Don't run them directly; they're used by the scripts in the root directory.
* `build/util`: Modules used by the build scripts.
* `node_modules`: npm dependencies (used by the build).
* `src`: Front-end code.
* `vendor`: Client code's dependencies.

In the repository root, you'll find the following scripts. For each script, there's a `.sh` version for Unix and Mac and a `.bat` version for Windows:

* `jake`: Build and test automation.
* `watch`: Automatically runs `jake` when any files change. Any arguments are passed through to jake.

For all these scripts, use `-T` to see the available build targets and their documentation. If no target is provided, the script will run `default`. Use `--help` for additional options.

The scripts have these additional options:

* `loose=true`: Disable strict browser and version checks.
* `capture=Firefox,Safari,etc`: Automatically launch, use, and quit the requested browsers. You can use this instead of running `./jake.sh karma` and manually starting the browsers yourself. Note that the browser name is case-sensitive. The Firefox launcher is included; if you need additional launchers, you'll need to install them; e.g., `npm install karma-safari-launcher`.



License
-------

MIT License. See `LICENSE.TXT`.
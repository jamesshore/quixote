Talk: Agile Engineering for the Web
===========

This is the source code for my "Agile Engineering for the Web" talk, first presented at Øredev in Malmö Sweden on 4 Nov 2015.

It demonstrates test-driven development of front-end JavaScript and CSS.


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


Finding Your Way Around
-----------------------

This repository consists of the following directories:

* `.idea`: WebStorm IDE settings. (Optional.)
* `build`: Build, CI, and deployment automation.
* `build/config`: Build configuration.
* `build/scripts`: Build scripts. Don't run them directly; they're used by the scripts in the root directory.
* `build/util`: Modules used by the build scripts.
* `node_modules`: npm dependencies.
* `src`: Front-end code.

In the repository root, you'll find the following scripts. For each script, there's a `.sh` version for Unix and Mac and a `.bat` version for Windows:

* `jake`: Build and test automation.
* `watch`: Automatically runs `jake` when any files change. Any arguments are passed through to jake.

For all these scripts, use `-T` to see the available build targets and their documentation. If no target is provided, the script will run `default`. Use `--help` for additional options.

The `jake` script has this additional option:

* `loose=true`: Disable strict browser and version checks.


License
-------

MIT License. See `LICENSE.TXT`.
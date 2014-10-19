// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.

// Main build file. Contains all tasks needed for normal development.

(function() {
	"use strict";

	var startTime = Date.now();

	var jshint = require("simplebuild-jshint");
	var karma = require("../util/karma_runner.js");
	var browserify = require("../util/browserify_runner.js");

	var KARMA_CONFIG = "./build/config/karma.conf.js";
	var TESTED_BROWSERS = require("../config/tested_browsers.js");
	var ENTRY_POINT = "./src/quixote.js";
	var DIST_DIR = "dist";
	var DIST_FILE = DIST_DIR + "/quixote.js";


//*** GENERAL

	desc("Lint, test, and build");
	task("default", [ "lint", "test", "build" ], function() {
		var elapsedSeconds = (Date.now() - startTime) / 1000;

		console.log("\n\nBUILD OK  (" + elapsedSeconds.toFixed(2) +  "s)");
	});


//*** LINT

	desc("Lint everything");
	task("lint", [ "lintBuild", "lintSrc" ]);

	task("lintBuild", function() {
		process.stdout.write("Linting build files: ");
		jshint.checkFiles({
			files: [ "build/**/*.js" ],
			options: nodeLintOptions(),
			globals: nodeLintGlobals()
		}, complete, fail);
	}, { async: true });

	task("lintSrc", function() {
		process.stdout.write("Linting source code: ");
		jshint.checkFiles({
			files: [ "src/**/*.js" ],
			options: clientLintOptions(),
			globals: clientLintGlobals()
		}, complete, fail);
	}, { async: true });


//*** TEST

	desc("Start Karma server -- run this first");
	task("karma", function() {
		console.log("Starting Karma server:");
		karma.serve(KARMA_CONFIG, complete, fail);
	}, { async: true });

	desc("Run tests");
	task("test", function() {
		console.log("Testing source code:");

		var browsersToCapture = process.env.capture ? process.env.capture.split(",") : [];
		karma.runTests({
			configFile: KARMA_CONFIG,
			browsers: TESTED_BROWSERS,
			strict: !process.env.loose,
			capture: browsersToCapture
		}, complete, fail);
	}, { async: true });


//*** BUILD

	desc("Build distribution package");
	task("build", [ DIST_DIR ], function() {
		console.log("Bundling distribution package with Browserify: .");
		browserify.bundle({
			entry: ENTRY_POINT,
			outfile: DIST_FILE,
			options: {
				standalone: "quixote",
				debug: true
			}
		}, complete, fail);
	}, { async: true });

	directory(DIST_DIR);


//*** Helper functions

	function universalLintOptions() {
		return {
			bitwise: true,
			curly: false,
			eqeqeq: true,
			forin: true,
			immed: true,
			latedef: false,
			newcap: true,
			noarg: true,
			noempty: true,
			nonew: true,
			regexp: true,
			undef: true,
			strict: true,
			globalstrict: true,     // "global" stricts are okay when using CommonJS modules
			trailing: true
		};
	}

	function nodeLintOptions() {
		var options = universalLintOptions();
		options.node = true;
		return options;
	}

	function clientLintOptions() {
		var options = universalLintOptions();
		options.browser = true;
		return options;
	}

	function nodeLintGlobals() {
		return {
			// Jake
			jake: false,
			desc: false,
			task: false,
			directory: false,
			complete: false,
			fail: false
		};
	}

	function clientLintGlobals() {
		return {
			// Karma
			console: false,
			dump: false,

			// CommonJS
			exports: false,
			require: false,
			module: false,

			// Mocha
			before: false,
			after: false,
			beforeEach: false,
			afterEach: false,
			describe: false,
			it: false
		};
	}

})();


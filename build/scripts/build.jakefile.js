// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.

// Main build file. Contains all tasks needed for normal development.

(function() {
	"use strict";

	var startTime = Date.now();

	// We've put most of our require statements in functions (or tasks) so we don't have the overhead of
	// loading modules we don't need. The require statements here are just the ones that are used to set up the tasks.
	var paths = require("../config/paths.js");

	var BUILD_NODE_VERSION = "6.11.5";   // The version of Node we use to build Quixote

//*** GENERAL

	jake.addListener('complete', function () {
		var elapsedSeconds = (Date.now() - startTime) / 1000;
		console.log("\n\nBUILD OK (" + elapsedSeconds.toFixed(2) + "s)");
	});

	desc("Lint, test, and build everything");
	task("default", [ "versions", "clean", "quick", "build" ]);

	desc("Lint and test changed files only");
	task("quick", [ "versions", "lint", "test" ]);

	desc("Erase generated files");
	task("clean", function() {
		shell().rm("-rf", paths.generatedDir);
	});


//*** CHECK NODE VERSION

	task("versions", [], function() {
		console.log("Checking Node.js version: .");
		var version = require("../util/version_checker.js");

		version.check({
			name: "Node",
			expected: BUILD_NODE_VERSION,
			actual: process.version,
			strict: false
		}, complete, fail);
	}, { async: true });


//*** LINT

	desc("Lint everything");
	task("lint", [ "lintLog", "incrementalLint" ], function() {
		console.log();
	});

	task("lintLog", function() { process.stdout.write("Linting JavaScript: "); });

	task("incrementalLint", lintDirectories());
	task("incrementalLint", lintOutput());
	createDirectoryDependencies(lintDirectories());

	rule(".lint", determineLintDependency, function() {
		var jshint = require("simplebuild-jshint");
		var self = this;

		process.stdout.write(".");
		jshint.checkOneFile({
			file: this.source,
			options: lintOptions(),
			globals: lintGlobals()
		}, success, fail);

		function success() {
			fs().writeFileSync(self.name, "lint ok");
			complete();
		}
	}, { async: true });

	function lintDirectories() {
		var path = require("path");
		return lintOutput().map(function(lintDependency) {
			return path.dirname(lintDependency);
		});
	}

	function lintOutput() {
		return paths.lintFiles().map(function(pathname) {
			return "generated/incremental/lint/" + pathname + ".lint";
		});
	}

	function determineLintDependency(name) {
		var result = name.replace(/^generated\/incremental\/lint\//, "");
		return result.replace(/\.lint$/, "");
	}

	function createDirectoryDependencies(directories) {
		directories.forEach(function(lintDirectory) {
			directory(lintDirectory);
		});
	}


//*** TEST

	desc("Start Karma server -- run this first");
	task("karma", function() {
		console.log("Starting Karma server:");
		karma().start({
			configFile: paths.karmaConfig
		}, complete, fail);
	}, { async: true });

	desc("Run tests");
	task("test", [ "testFoundation", "testDescriptors", "testUtil", "testValues" ]);

	karmaTask("testFoundation", "FOUNDATION", "foundation", paths.foundationTestDependencies());
	karmaTask("testDescriptors", "DESCRIPTOR", "descriptors", paths.descriptorTestDependencies());
	karmaTask("testUtil", "UTIL", "utility modules", paths.utilTestDependencies());
	karmaTask("testValues", "VALUE", "value classes", paths.valueTestDependencies());

	function karmaTask(taskName, tag, testDescription, fileDependencies) {
		incrementalTask(taskName, [], fileDependencies, function(complete, fail) {
			console.log("Testing " + testDescription + ": ");
			runKarmaOnTaggedSubsetOfTests(tag, complete, fail);
		}, { async: true });
	}

	function runKarmaOnTaggedSubsetOfTests(tag, complete, fail) {
		var browsersToCapture = process.env.capture ? process.env.capture.split(",") : [];
		karma().run({
			configFile: paths.karmaConfig,
			expectedBrowsers: testedBrowsers(),
			strict: !process.env.loose,
			// We use Mocha's "grep" feature as a poor-man's substitute for proper test tagging and subsetting
			// (which Mocha doesn't have at the time of this writing). However, Mocha's grep option disables
			// Mocha's "it.only()" feature. So we don't use grep if the "itonly" option is set on the command
			// line.
			clientArgs: process.env.itonly ? [] : [ "--grep=^" + tag + ":" ],
			capture: browsersToCapture
		}, complete, fail);
	}

//*** BUILD

	desc("Build distribution package");
	task("build", [ paths.distDir, "bundle", "updateExample" ]);

	task("bundle", function() {
		console.log("Bundling distribution package with Browserify: .");
		browserify().bundle({
			entry: paths.mainModule,
			outfile: paths.distFile,
			options: {
				standalone: "quixote",
				debug: true
			}
		}, complete, fail);
	}, { async: true });

	task("updateExample", function() {
		console.log("Updating example with current Quixote distribution: .");
		shell().cp("-f", paths.distFile, "example/vendor/quixote.js");
	});

	directory(paths.distDir);
	directory(paths.incrementalDir);




//*** Helper functions

	function lintOptions() {
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
			strict: "global",
			trailing: true,
			node: true,
			browser: true
		};
	}

	function lintGlobals() {
		return {
			// Jake
			jake: false,
			desc: false,
			task: false,
			rule: false,
			file: false,
			directory: false,
			complete: false,
			fail: false,

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


	function incrementalTask(taskName, taskDependencies, fileDependencies, action) {
		var incrementalFile = paths.incrementalDir + "/" + taskName + ".task";

		task(taskName, taskDependencies.concat(paths.incrementalDir, incrementalFile));
		file(incrementalFile, fileDependencies, function() {
			action(succeed, fail);
		}, {async: true});

		function succeed() {
			fs().writeFileSync(incrementalFile, "ok");
			complete();
		}
	}


	//*** LAZY-LOADED MODULES

	function fs() {
		return require("fs");
	}

	function karma() {
		return require("simplebuild-karma");
	}

	function shell() {
		var shelljs = require("shelljs");
		shelljs.config.fatal = true;
		return shelljs;
	}

	function jshint() {
		return require("simplebuild-jshint");
	}

	function testedBrowsers() {
		return require("../config/tested_browsers.js");
	}

	function browserify() {
		return require("../util/browserify_runner.js");
	}


})();


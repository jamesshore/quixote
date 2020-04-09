// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Main build file. Contains all tasks needed for normal development.

var startTime = Date.now();

// We've put most of our require statements in functions (or tasks) so we don't have the overhead of
// loading modules we don't need. The require statements here are just the ones that are used to set up the tasks.
var paths = require("../config/paths.js");

var BUILD_NODE_VERSION = "12.16.2";   // The version of Node we use to build Quixote

//*** GENERAL

jake.addListener('complete', function () {
	var elapsedSeconds = (Date.now() - startTime) / 1000;
	console.log("\n\nBUILD OK (" + elapsedSeconds.toFixed(2) + "s)");
});

desc("Start Karma server -- run this first");
task("karma", [ "versions" ], function() {
	console.log("Starting Karma server:");
	karma().start({
		configFile: paths.karmaConfig
	}, complete, fail);
}, { async: true });

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

task("incrementalLint", paths.lintDirectories());
task("incrementalLint", paths.lintOutput());
createDirectoryDependencies(paths.lintDirectories());

rule(".lint", determineLintDependency, function() {
	var lint = require("../util/lint_runner.js");
	var lintConfig = require("../config/eslint.conf.js");

	var passed = lint.validateFile(this.source, lintConfig.options);
	if (passed) fs().writeFileSync(this.name, "lint ok");
	else fail("Lint failed");
});

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

desc("Run tests");
task("test", [ "testFoundation", "testDescriptors", "testUtil", "testValues", "testEndToEnd" ]);

karmaTask("testFoundation", "FOUNDATION", "foundation", paths.foundationTestDependencies());
karmaTask("testDescriptors", "DESCRIPTOR", "descriptors", paths.descriptorTestDependencies());
karmaTask("testUtil", "UTIL", "utility modules", paths.utilTestDependencies());
karmaTask("testValues", "VALUE", "value classes", paths.valueTestDependencies());
karmaTask("testEndToEnd", "END-TO-END", "end-to-end", paths.endToEndTestDependencies());

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
		clientArgs: [ "--grep=^" + tag + ":" ],
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

function testedBrowsers() {
	return require("../config/tested_browsers.js");
}

function browserify() {
	return require("../util/browserify_runner.js");
}

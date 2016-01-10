// Copyright (c) 2012-2014 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

// Main build file. Contains all tasks needed for normal development.
// There's no Quixote-specific configuration in this file.

(function() {
	"use strict";

	var startTime = Date.now();

	var shell = require("shelljs");
	var jshint = require("simplebuild-jshint");
	var karma = require("simplebuild-karma");
	var browserify = require("../util/browserify_runner.js");
	var version = require("../util/version_checker.js");

	var browsers = require("../config/tested_browsers.js");
	var jshintConfig = require("../config/jshint.conf.js");
	var paths = require("../config/paths.js");

	var KARMA_CONFIG = "./build/config/karma.conf.js";

	var strict = !process.env.loose;


	//*** GENERAL

	desc("Lint and test");
	task("default", ["version", "lint", "test"], function() {
		var elapsedSeconds = (Date.now() - startTime) / 1000;
		console.log("\n\nBUILD OK  (" + elapsedSeconds.toFixed(2) + "s)");
	});

	desc("Start server (for manual testing)");
	task("run", [ "build" ], function() {
		jake.exec("node ./node_modules/http-server/bin/http-server " + paths.clientDistDir, { interactive: true }, complete);
	}, { async: true });

	desc("Delete generated files");
	task("clean", function() {
		shell.rm("-rf", paths.generatedDir);
	});


	//*** LINT

	desc("Lint everything");
	task("lint", ["lintNode", "lintClient"]);

	task("lintNode", function() {
		process.stdout.write("Linting Node.js code: ");
		jshint.checkFiles({
			files: [ paths.buildDir + "/**/*.js" ],
			options: jshintConfig.nodeOptions,
			globals: jshintConfig.nodeGlobals
		}, complete, fail);
	}, { async: true });

	task("lintClient", function() {
		process.stdout.write("Linting browser code: ");
		jshint.checkFiles({
			files: [ paths.clientDir + "/**/*.js" ],
			options: jshintConfig.clientOptions,
			globals: jshintConfig.clientGlobals
		}, complete, fail);
	}, { async: true });


	//*** TEST

	desc("Start Karma server -- run this first");
	task("karma", function() {
		karma.start({
			configFile: KARMA_CONFIG
		}, complete, fail);
	}, { async: true });

	desc("Run tests");
	task("test", function() {
		console.log("Testing browser code: ");

		var browsersToCapture = process.env.capture ? process.env.capture.split(",") : [];
		karma.run({
			configFile: KARMA_CONFIG,
			expectedBrowsers: browsers,
			strict: strict,
			capture: browsersToCapture
		}, complete, fail);
	}, { async: true });


	//*** BUILD

	desc("Build distribution package");
	task("build", [ "prepDistDir", "buildClient" ]);

	task("prepDistDir", function() {
		shell.rm("-rf", paths.distDir);
	});

	task("buildClient", [ paths.clientDistDir, "bundleClientJs" ], function() {
		console.log("Copying client code: .");
		shell.cp(
			paths.clientDir + "/*.html",
			paths.clientDir + "/*.css",
			paths.clientDir + "/*.svg",
			paths.clientDistDir
		);
	});

	task("bundleClientJs", [ paths.clientDistDir ], function() {
		console.log("Bundling browser code with Browserify: .");
		browserify.bundle({
			entry: paths.clientEntryPoint,
			outfile: paths.clientDistBundle,
			options: {
				standalone: "toggle",
				debug: true
			}
		}, complete, fail);
	}, { async: true });


	//*** CHECK VERSIONS

	desc("Check Node version");
	task("version", function() {
		console.log("Checking Node.js version: .");
		version.check({
			name: "Node",
			expected: require("../../package.json").engines.node,
			actual: process.version,
			strict: strict
		}, complete, fail);
	}, { async: true });


	//*** CREATE DIRECTORIES

	directory(paths.testDir);
	directory(paths.clientDistDir);

}());
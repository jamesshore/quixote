// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var path = require("path");
	var sh = require("./sh.js");
	var runner = require("karma/lib/runner");

	var KARMA = "node node_modules/karma/bin/karma";
	var KARMA_START = " start build/config/karma.conf.js";
	var CONFIG = { configFile: path.resolve("build/config/karma.conf.js") };

	exports.serve = function(configFile, success, fail) {
		var command = KARMA + " start " + configFile;
		if (process.env.launchkarmabrowsers) { command += " --browsers=" + process.env.launchkarmabrowsers; }
		sh.run(command, success, function () {
			fail("Could not start Karma server");
		});
	};

	exports.runTests = function(options, success, fail) {
		var config = {
			configFile: path.resolve(options.configFile)
		};

		var stdout = new CapturedStdout();
		runner.run(config, function(exitCode) {
			stdout.restore();

			if (exitCode) fail("Client tests failed (did you start the Karma server?)");
			var browserMissing = checkRequiredBrowsers(options.browsers, stdout);
			if (browserMissing && options.strict) fail("Did not test all browsers");
			if (stdout.capturedOutput.indexOf("TOTAL: 0 SUCCESS") !== -1) fail("No tests were run!");

			success();
		});
	};

	function checkRequiredBrowsers(requiredBrowsers, stdout) {
		var browserMissing = false;
		requiredBrowsers.forEach(function(browser) {
			browserMissing = lookForBrowser(browser, stdout.capturedOutput) || browserMissing;
		});
		return browserMissing;
	}

	function lookForBrowser(browser, output) {
		var missing = output.indexOf(browser + ": Executed") === -1;
		if (missing) console.log(browser + " was not tested!");
		return missing;
	}

	function CapturedStdout() {
		var self = this;
		self.oldStdout = process.stdout.write;
		self.capturedOutput = "";

		process.stdout.write = function(data) {
			self.capturedOutput += data;
			self.oldStdout.apply(this, arguments);
		};
	}

	CapturedStdout.prototype.restore = function() {
		process.stdout.write = this.oldStdout;
	};

}());
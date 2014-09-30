// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Integration build file. Automates our continuous integration process.

var git = require("../util/git_runner.js");

var BUILD_COMMAND = require("../config/build_command.js");
var DEV_BRANCH = "dev";
var INTEGRATION_BRANCH = "master";


//*** DO THE INTEGRATION

desc("Integrate latest development code into known-good branch");
task("default", [ "integrate" ], function() {
	console.log("\n\nINTEGRATION OK");
});

task("integrate", [ "readyToIntegrate", "integrationBranch" ], function() {
	console.log("Merging " + DEV_BRANCH + " branch into " + INTEGRATION_BRANCH + ": ");
	git.mergeBranch(DEV_BRANCH, wrap(complete), wrap(fail));

	function wrap(callback) {
		return function(message) {
			checkout(DEV_BRANCH, callback.bind(null, message), function(secondMessage) {
				console.log("Error: " + secondMessage);
				console.log("COULD NOT SWITCH BACK TO DEV BRANCH. Be sure to do it manually.");
				callback(message);
			});
		};
	}
}, { async: true });


//*** SWITCH BRANCHES

task("integrationBranch", function() {
	checkout(INTEGRATION_BRANCH, complete, fail);
}, { async: true });

task("devBranch", function() {
	checkout(DEV_BRANCH, complete, fail);
}, { async: true });

function checkout(branch, succeed, fail) {
	console.log("Switching to " + branch + " branch: .");
	git.checkoutBranch(branch, succeed, fail);
}


//*** ENSURE INTEGRATION READINESS

task("readyToIntegrate", [ "onDevBranch", "allCommitted", "upToDate", "buildsClean" ]);

task("onDevBranch", function() {
	console.log("Checking current branch: .");
	git.checkCurrentBranch(DEV_BRANCH, complete, fail);
}, { async: true });

task("allCommitted", function() {
	console.log("Checking for uncommitted files: .");
	git.checkNothingToCommit(complete, fail);
}, { async: true });

task("upToDate", function() {
	console.log("Checking if " + DEV_BRANCH + " branch is up to date: .");
	git.checkFastForwardable(INTEGRATION_BRANCH, DEV_BRANCH, complete, fail);
}, { async: true });

task("buildsClean", function() {
	console.log("Verifying build:");
	jake.exec(BUILD_COMMAND, { printStdout: true, printStderr: true }, complete);
}, { async: true });
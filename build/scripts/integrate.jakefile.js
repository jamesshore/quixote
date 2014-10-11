// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Integration build file. Automates our continuous integration process.

var git = require("../util/git_runner.js");
var branches = require("../config/branches.js");

var BUILD_COMMAND = require("../config/build_command.js");


//*** COMMANDS

desc("Integrate latest code into known-good branch");
task("default", [ "mergeDevIntoIntegration", "fastForwardDevToIntegration" ], function() {
	console.log("\n\nINTEGRATION OK");
});

desc("Check for un-integrated code");
task("check", [ "allCommitted", "upToDate" ], function() {
	git.checkFastForwardable(branches.dev, branches.integration, report(true), report(false));

	function report(isIntegrated) {
		return function() {
			var is = isIntegrated ? "has been" : "has NOT been";
			console.log("\n" + branches.dev + " branch " + is + " integrated with " + branches.integration + " branch");
		};
	}
}, { async: true });


//*** DO THE INTEGRATION

task("mergeDevIntoIntegration", [ "readyToIntegrate", "integrationBranch" ], function() {
	console.log("Merging " + branches.dev + " branch into " + branches.integration + ": ");
	git.mergeBranch(branches.dev, wrap(complete), wrap(fail));

	function wrap(callback) {
		return function(message) {
			checkout(branches.dev, callback.bind(null, message), function(secondMessage) {
				console.log("Error: " + secondMessage);
				console.log("COULD NOT SWITCH BACK TO DEV BRANCH. Be sure to do it manually.");
				callback(message);
			});
		};
	}
}, { async: true });

task("fastForwardDevToIntegration", function() {
	console.log("Updating " + branches.dev + " branch with " + branches.integration + " branch changes: .");
	git.fastForwardBranch(branches.integration, complete, fail);
}, { async: true });


//*** SWITCH BRANCHES

task("integrationBranch", function() {
	checkout(branches.integration, complete, fail);
}, { async: true });

task("devBranch", function() {
	checkout(branches.dev, complete, fail);
}, { async: true });

function checkout(branch, succeed, fail) {
	console.log("Switching to " + branch + " branch: .");
	git.checkoutBranch(branch, succeed, fail);
}


//*** ENSURE INTEGRATION READINESS

task("readyToIntegrate", [ "onDevBranch", "allCommitted", "upToDate", "buildsClean" ]);

task("onDevBranch", function() {
	console.log("Checking current branch: .");
	git.checkCurrentBranch(branches.dev, complete, fail);
}, { async: true });

task("allCommitted", function() {
	console.log("Checking for uncommitted files: .");
	git.checkNothingToCommit(complete, fail);
}, { async: true });

task("upToDate", function() {
	console.log("Checking if " + branches.dev + " branch is up to date: .");
	git.checkFastForwardable(branches.integration, branches.dev, complete, fail);
}, { async: true });

task("buildsClean", function() {
	console.log("Verifying build:");
	jake.exec(BUILD_COMMAND, { printStdout: true, printStderr: true }, complete);
}, { async: true });
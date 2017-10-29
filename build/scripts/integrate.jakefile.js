// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Integration build file. Automates our continuous integration process.

var git = require("../util/git_runner.js");
var branches = require("../config/branches.js");
var paths = require("../config/paths.js");


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

task("mergeDevIntoIntegration", [ "readyToIntegrate", "integrationBranch" ], async () => {
	console.log("Merging " + branches.dev + " branch into " + branches.integration + ": ");
	try {
		await git.mergeBranch(branches.dev);
	}
	finally {
		const callback = function() {}; // temp
		const message = "";
		checkout(branches.dev, callback.bind(null, message), function(secondMessage) {
			console.log("Error: " + secondMessage);
			console.log("COULD NOT SWITCH BACK TO DEV BRANCH. Be sure to do it manually.");
		});
	}
});

task("fastForwardDevToIntegration", async () => {
	console.log("Updating " + branches.dev + " branch with " + branches.integration + " branch changes: .");
	await git.fastForwardBranch(branches.integration);
});


//*** SWITCH BRANCHES

task("integrationBranch", async () => {
	await checkout(branches.integration);
});

task("devBranch", async () => {
	await checkout(branches.dev);
});

async function checkout(branch) {
	console.log("Switching to " + branch + " branch: .");
	await git.checkoutBranch(branch);
}


//*** ENSURE INTEGRATION READINESS

task("readyToIntegrate", [ "onDevBranch", "distBuilt", "allCommitted", "upToDate", "buildsClean" ]);

task("onDevBranch", function() {
	console.log("Checking current branch: .");
	git.checkCurrentBranch(branches.dev, complete, fail);
}, { async: true });

task("distBuilt", function() {
	console.log("Ensuring distribution package is checked in:");

	var command = require("../config/build_command.js");
	run(command + " build", complete);
}, { async: true });

task("allCommitted", function() {
	console.log("Checking for uncommitted files: .");
	git.checkNothingToCommit(complete, fail);
}, { async: true });

task("upToDate", function() {
	console.log("Checking if " + branches.dev + " branch is up to date: .");
	git.checkFastForwardable(branches.integration, branches.dev, complete, fail);
}, { async: true });

task("buildsClean", [ "exampleBuildsClean", "quixoteBuildsClean", "browserifyBuildsClean" ]);

task("quixoteBuildsClean", function() {
	console.log("Verifying Quixote build: STUBBED, FIX ME");

	// var command = require("../config/build_command.js");
	// run(command, complete);
	complete();
}, { async: true });

task("exampleBuildsClean", function() {
	console.log("Verifying example build: STUBBED, FIX ME");
	// run("cd example && ./jake.sh capture=Firefox", complete);
	complete();
}, { async: true });

task("browserifyBuildsClean", function() {
	console.log("Verifying browserify:");
	var command = "echo \"require('.');\" | node_modules/.bin/browserify -";
	jake.exec(command, { printStdout: false, printStderr: true }, complete);
}, { async: true });

function run(command, done) {
	jake.exec(command, { printStdout: true, printStderr: true }, complete);
}
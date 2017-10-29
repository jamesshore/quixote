// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Integration build file. Automates our continuous integration process.

var git = require("../util/git_runner.js");
var branches = require("../config/branches.js");
var paths = require("../config/paths.js");


//*** COMMANDS

desc("Integrate latest code into known-good branch");
task("default", [ "mergeDevIntoIntegration"  ], function() {
	console.log("\n\nINTEGRATION OK");
});

desc("Check for un-integrated code");
task("check", [ "allCommitted", "upToDate" ], async () => {
	try {
		await git.checkFastForwardable(branches.dev, branches.integration);
		report(true);
	}
	catch(err) {
		report(false);
	}

	function report(isIntegrated) {
		var is = isIntegrated ? "has been" : "has NOT been";
		console.log("\n" + branches.dev + " branch " + is + " integrated with " + branches.integration + " branch");
	}
});


//*** DO THE INTEGRATION

task("mergeDevIntoIntegration", [ "readyToIntegrate" ], async () => {
	await checkout(branches.integration);

	console.log("Merging " + branches.dev + " branch into " + branches.integration + ": ");
	try {
		await git.mergeBranch(branches.dev);
	}
	finally {
		try {
			await checkout(branches.dev);
		}
		catch (err) {
			/* eslint no-unsafe-finally: "off" */
			console.log("COULD NOT SWITCH BACK TO DEV BRANCH. Be sure to do it manually.");
			throw err;
		}
	}

	console.log("Updating " + branches.dev + " branch with " + branches.integration + " branch changes: .");
	await git.fastForwardBranch(branches.integration);
});

async function checkout(branch) {
	console.log("Switching to " + branch + " branch: .");
	await git.checkoutBranch(branch);
}


//*** ENSURE INTEGRATION READINESS

task("readyToIntegrate", [ "onDevBranch", "distBuilt", "allCommitted", "upToDate", "buildsClean" ]);

task("onDevBranch", async () => {
	console.log("Checking current branch: .");
	await git.checkCurrentBranch(branches.dev);
});

task("distBuilt", function() {
	console.log("Ensuring distribution package is checked in:");

	var command = require("../config/build_command.js");
	run(command + " build", complete);
}, { async: true });

task("allCommitted", async () => {
	console.log("Checking for uncommitted files: .");
	await git.checkNothingToCommit();
});

task("upToDate", async () => {
	console.log("Checking if " + branches.dev + " branch is up to date: .");
	await git.checkFastForwardable(branches.integration, branches.dev);
});

task("buildsClean", [ "exampleBuildsClean", "quixoteBuildsClean", "browserifyBuildsClean" ]);

task("quixoteBuildsClean", function() {
	console.log("Verifying Quixote build: .");

	var command = require("../config/build_command.js");
	run(command, complete);
}, { async: true });

task("exampleBuildsClean", function() {
	console.log("Verifying example build: .");
	run("cd example && ./jake.sh capture=Firefox", complete);
}, { async: true });

task("browserifyBuildsClean", function() {
	console.log("Verifying browserify:");
	var command = "echo \"require('.');\" | node_modules/.bin/browserify -";
	jake.exec(command, { printStdout: false, printStderr: true }, complete);
}, { async: true });

function run(command, done) {
	jake.exec(command, { printStdout: true, printStderr: true }, done);
}
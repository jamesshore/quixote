// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Release build file. Automates our deployment process.

var git = require("../util/git_runner.js");
var branches = require("../config/branches.js");
var sh = require("../util/sh.js");


//*** RELEASE TASKS

task("default", function() {
	console.log("Use 'major', 'minor', or 'patch' to perform release");
});

desc("Increment major version number and release");
task("major", function() {
	fail("Major version releases are disabled while we're in 0.x releases.");
});

createReleaseTask("minor");
createReleaseTask("patch");

function createReleaseTask(level) {
	desc("Increment " + level + " version number and release");
	task(level, [ level + "Release", "npm", "updateDevBranch", "docs", "github" ], function() {
		console.log("\n\nRELEASE OK");
	}, { async: true });

	task(level + "Release", [ "readyToRelease", "integrationBranch" ], function() {
		console.log("Updating npm version: ");
		sh.run("npm version " + level, complete, fail);
	}, { async: true });
}


//*** PUBLISH

desc("Push source code to GitHub");
task("github", function() {
	console.log("Publishing to GitHub: ");
	sh.run("git push --all && git push --tags", complete, fail);
}, { async: true });

desc("Publish documentation to website");
task("docs", function() {
	console.log("Publishing documentation site: ");
	sh.run(
		"rsync --recursive --keep-dirlinks --perms --times --delete --delete-excluded " +
			"--human-readable --progress --exclude=.DS_Store --include=.* " +
			"docs/* jdlshore_quixote-css@ssh.phx.nearlyfreespeech.net:/home/public/",
		complete, fail
	);
}, { async: true });

task("npm", function() {
	console.log("Publishing to npm: ");
	sh.run("npm publish", complete, fail);
}, { async: true });


//*** MANIPULATE REPO

task("integrationBranch", function() {
	console.log("Switching to " + branches.integration + " branch: .");
	git.checkoutBranch(branches.integration, complete, fail);
}, { async: true });

task("devBranch", function() {
	console.log("Switching to " + branches.dev + " branch: .");
	git.checkoutBranch(branches.dev, complete, fail);
}, { async: true });

task("updateDevBranch", [ "devBranch" ], function() {
	console.log("Updating " + branches.dev + " with release changes: .");
	git.fastForwardBranch(branches.integration, complete, fail);
}, { async: true });


//*** ENSURE RELEASE READINESS

task("readyToRelease", [ "allCommitted", "integrated" ]);

task("allCommitted", function() {
	console.log("Checking for uncommitted files: .");
	git.checkNothingToCommit(complete, fail);
}, { async: true });

task("integrated", function() {
	console.log("Checking if " + branches.dev + " branch is integrated: .");
	git.checkFastForwardable(branches.dev, branches.integration, complete, fail);
}, { async: true });
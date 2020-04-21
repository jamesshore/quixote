// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Release build file. Automates our deployment process.

var git = require("../util/git_runner.js");
var branches = require("../config/branches.js");
var sh = require("../util/sh.js");


//*** RELEASE TASKS

task("default", function() {
	console.log("Use 'major', 'minor', or 'patch' to perform release");
});

createReleaseTask("major");
createReleaseTask("minor");
createReleaseTask("patch");

function createReleaseTask(level) {
	desc("Increment " + level + " version number and release");
	task(level, [ level + "Release", "npm", "docs", "github" ], async () => {
		await mergeBranch(branches.integration);
		await mergeBranch(branches.dev);
		console.log("\n\nRELEASE OK");
	});

	task(level + "Release", [ "releaseBranch" ], function() {
		console.log("Updating npm version: ");
		sh.run("npm", [ "version", level ], complete, fail);
	}, { async: true });
}


//*** PUBLISH

task("npm", function() {
	console.log("Publishing to npm: .");
	sh.run("npm", [ "publish" ], complete, fail);
}, { async: true });

desc("Publish documentation to website");
task("docs", function() {
	console.log("Publishing documentation site: .");
	sh.run(
		"rsync",
		[
			"--recursive", "--keep-dirlinks", "--perms", "--times", "--delete", "--delete-excluded",
			"--human-readable", "--progress", "--exclude=.DS_Store", "--include=.*", "docs/*",
			"jdlshore_quixote-css@ssh.phx.nearlyfreespeech.net:/home/public/"
		],
		complete, fail
	);
}, { async: true });

desc("Push source code to GitHub");
task("github", function() {
	console.log("Publishing to GitHub: .");
	sh.run("git", [ "push", "--all" ], success, fail);

	function success() {
		sh.run("git", [ "push", "--tags" ], complete, fail);
	}
}, { async: true });


//*** MANIPULATE REPO

task("releaseBranch", [ "readyToRelease" ], async () => {
	await checkout(branches.release);

	console.log("Fast-forwarding " + branches.release + " branch to " + branches.integration + ": ");
	await git.fastForwardBranch(branches.integration);
});

async function mergeBranch(branch) {
	await checkout(branch);
	
	console.log("Updating " + branch + " with release changes: .");
	await git.fastForwardBranch(branches.release);
}

async function checkout(branch) {
	console.log("Switching to " + branch + " branch: .");
	await git.checkoutBranch(branch);
}


//*** ENSURE RELEASE READINESS

task("readyToRelease", [ "allCommitted", "integrated" ]);

task("allCommitted", async () => {
	console.log("Checking for uncommitted files: .");
	await git.checkNothingToCommit();
});

task("integrated", async () => {
	console.log("Checking if " + branches.dev + " branch is integrated: .");
	await git.checkFastForwardable(branches.dev, branches.integration);
});
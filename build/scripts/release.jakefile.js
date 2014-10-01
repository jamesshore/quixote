// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Release build file. Automates our deployment process.

var git = require("../util/git_runner.js");
var branches = require("../config/branches.js");
var sh = require("../util/sh.js");


//*** TOP-LEVEL TASKS

task("default", function() {
	console.log("Use 'major', 'minor', or 'bugfix' to perform release");
});

desc("Increment major version number and release");
task("major", function() {
	fail("Major version releases are disabled while we're in 0.x releases.");
});

desc("Increment patch version number and release");
task("patch", [ "performRelease", "updateBranches" ], function() {
	console.log("\n\nRELEASE OK");
}, { async: true });


//*** DO THE RELEASE

task("performRelease", [ "readyToRelease", "integrationBranch" ], function() {
	console.log("Releasing patch: ");
	sh.run("echo npm version patch", complete, fail);
}, { async: true });


//*** MANIPULATE REPO

task("integrationBranch", function() {
	console.log("Switching to " + branches.integration + " branch: .");
	git.checkoutBranch(branches.integration, complete, fail);
}, { async: true });

task("updateBranches");


//*** ENSURE RELEASE READINESS

//task("readyToRelease", [ "allCommitted", "integrated" ]);
task("readyToRelease", function() {
	console.log(" * STUBBED FOR TESTING: readyToRelease");
});

task("allCommitted", function() {
	console.log("Checking for uncommitted files: .");
	git.checkNothingToCommit(complete, fail);
}, { async: true });

task("integrated", function() {
	console.log("Checking if " + branches.dev + " branch is integrated: .");
	git.checkFastForwardable(branches.dev, branches.integration, complete, fail);
}, { async: true });
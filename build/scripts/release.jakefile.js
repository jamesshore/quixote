// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Release build file. Automates our deployment process.

var git = require("../util/git_runner.js");
var branches = require("../config/branches.js");


//*** DO THE RELEASE

task("default", function() {
	console.log("Use 'major', 'minor', or 'bugfix' to perform release");
});

desc("Increment major version number and release");
task("major", function() {
	fail("Major version releases are disabled while we're in 0.x releases.");
});

desc("Increment patch version number and release");
task("patch", [ "readyToRelease" ], function() {
	console.log("\n\nRELEASE OK");
});


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
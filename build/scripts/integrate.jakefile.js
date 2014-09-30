// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Integration build file. Automates our continuous integration process.

var git = require("../util/git_runner.js");

var BUILD_COMMAND = require("../config/build_command.js");
var DEV_BRANCH = "dev";

//*** GENERAL

desc("Integrate latest development code into known-good branch");
task("default", [ "devBranch", "allCommitted", "build" ], function() {
	console.log("\n\nINTEGRATION OK");
});

task("devBranch", function() {
	console.log("Checking git branch: .");
	git.checkBranch(DEV_BRANCH, complete, fail);
}, { async: true });

task("allCommitted", function() {
	console.log("Checking git repository for uncommitted files: .");
	console.log("  STUBBED");
	return complete();
//	git.checkNothingToCommit(complete, fail);
}, { async: true });

task("build", function() {
	console.log("Verifying build:");
	jake.exec(BUILD_COMMAND, { printStdout: true, printStderr: true }, complete);
}, { async: true });
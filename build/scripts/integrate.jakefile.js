// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Integration build file. Automates our continuous integration process.

var git = require("../util/git_runner.js");

var BUILD_COMMAND = require("../config/build_command.js");
var DEV_BRANCH = "dev";

//*** GENERAL

desc("Integrate latest development code into known-good branch");
task("default", [ "integrate" ], function() {
	console.log("\n\nINTEGRATION OK");
});

task("integrate", [ "readyToIntegrate", "integrationBranch" ], function() {

});

task("integrationBranch", function() {
	console.log("Switching to integration branch: .");
});

//*** ENSURE INTEGRATION READINESS

//task("readyToIntegrate", [ "onDevBranch", "allCommitted", "buildsClean" ]);
task("readyToIntegrate", [], function() {
	console.log("*** STUBBED! readyToIntegrate");
});

task("onDevBranch", function() {
	console.log("Checking git branch: .");
	git.checkBranch(DEV_BRANCH, complete, fail);
}, { async: true });

task("allCommitted", function() {
	console.log("Checking git repository for uncommitted files: .");
	git.checkNothingToCommit(complete, fail);
}, { async: true });

task("buildsClean", function() {
	console.log("Verifying build:");
	jake.exec(BUILD_COMMAND, { printStdout: true, printStderr: true }, complete);
}, { async: true });
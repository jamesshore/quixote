// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// Integration build file. Automates our continuous integration process.

var git = require("../util/git_runner.js");


//*** GENERAL

desc("Integrate latest development code into known-good branch");
task("default", [ "correctBranch", "goodStatus" ], function() {
	console.log("\n\nINTEGRATION OK");
});

task("correctBranch", function() {
	console.log("Confirming development branch: .");
	git.checkBranch("FOO", complete, fail);
}, { async: true });

task("goodStatus", function() {
	console.log("Checking git repository for uncommitted files: .");
});


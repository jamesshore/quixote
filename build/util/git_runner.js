// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var child_process = require("child_process");

exports.checkBranch = function(expectedBranch, succeed, fail) {
	git("symbolic-ref HEAD", function(err, stdout) {
		if (err) return fail(err);

		var groups = stdout.match(/^refs\/heads\/(.*)\n$/);
		if (groups === null) return fail("Did not recognize git output: " + stdout);

		var branch = groups[1];
		if (branch !== expectedBranch) return fail("Not on correct branch. Expected '" + expectedBranch + "' but was '" + branch + "'.");

		console.log("OUTPUT:", stdout);
		console.log("GROUPS:", groups);
		console.log("BRANCH:", branch);
		return succeed();
	});
};

function git(args, callback) {
	var command = "git " + args;
	child_process.execFile("git", args.split(" "), function(error, stdout, stderr) {
		if (stderr) {
			console.log("> " + command);
			process.stdout.write(stdout);
			process.stderr.write(stderr);
			if (error.code) return callback("git exited with error code " + error.code);
			else return callback("git wrote to stderr");
		}
		if (error) return callback("Problem running git: " + error);

		return callback(null, stdout);
	});
}

// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var spawn = require("child_process").spawn;

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
	var child = spawn("git", args.split(" "), { stdio: [ "ignore", "pipe", process.stderr ] });

	var output = "";
	var callbackAlreadyCalled = false;

	child.stdout.setEncoding("utf8");
	child.stdout.on("data", function(data) {
		output += data;
	});
	child.stdout.on("end", function() {
		console.log("END event");
	});

	child.on("error", function(error) {
		console.log("ERROR event");
		doCallback("Problem running git: " + error);
	});
	child.on("exit", function(code, signal) {
		console.log("EXIT event");
		if (signal) return doCallback("git exited in response to signal: " + signal);
		if (code) return doCallback("git exited with error code " + code);

		return doCallback();
	});

	function doCallback(error) {
		if (callbackAlreadyCalled) return;
		callbackAlreadyCalled = true;

		if (error) callback(error);
		else callback(null, output);
	}

}
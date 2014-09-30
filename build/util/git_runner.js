// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var spawn = require("child_process").spawn;

exports.checkBranch = function(expectedBranch, success, fail) {
	runGit("symbolic-ref HEAD", function(err, stdout) {
		if (err) return fail(err);

		console.log("OUTPUT: " + stdout);
		return success();
	});
};

function runGit(args, callback) {
	var git = spawn("git", args.split(" "), { stdio: [ "ignore", "pipe", process.stderr ] });

	var output = "";
	var callbackAlreadyCalled = false;

	git.stdout.setEncoding("utf8");
	git.stdout.on("data", function(data) {
		output += data;
	});

	git.on("error", function(error) {
		doCallback("Problem running git: " + error);
	});
	git.on("exit", function(code, signal) {
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
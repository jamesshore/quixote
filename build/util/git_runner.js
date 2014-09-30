// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var spawn = require("child_process").spawn;

exports.checkBranch = function(expectedBranch, success, fail) {
	var git = spawn("git", [ "symbolic-ref", "HEAD" ], { stdio: [ "ignore", "pipe", process.stderr ] });


	var output = "";

	git.stdout.setEncoding("utf8");
	git.stdout.on("data", function(data) {
		console.log("DATA: " + data);
		output += data;
	});



	var callbackAlreadyCalled = false;

	git.on("error", function(error) {
		doCallback("Problem running git: " + error);
	});
	git.once("exit", function(code, signal) {
		if (signal) return doCallback("git exited in response to signal: " + signal);
		if (code) return doCallback("git exited with error code " + code);


		console.log("OUTPUT: " + output);

		return doCallback();
	});

	function doCallback(error) {
		if (callbackAlreadyCalled) return;
		callbackAlreadyCalled = true;

		if (error) fail(error);
		else success();
	}
};


// Copyright (c) 2012-2017 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var child_process = require("child_process");

var run = exports.run = function(command, args, successCallback, failureCallback) {
	console.log(`> ${command} ${args.join(" ")}`);
	var stdout = "";
	var child = child_process.spawn(command, args);
	child.stdout.on("data", (data) => {
		stdout += data;
		process.stdout.write(data);
	});
	child.stderr.on("data", (data) => {
		process.stderr.write(data);
	});
	child.on("error", failureCallback);
	child.on("exit", (code) => {
		successCallback(stdout);
	});
};



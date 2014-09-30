// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var spawn = require("child_process").spawn;

exports.checkCurrentBranch = function(expectedBranch, succeed, fail) {
	git("symbolic-ref HEAD -q", function(err, errorCode, stdout) {
		if (err) return fail(err);
		if (errorCode === 1 && stdout === "") return failBranch("detached HEAD");
		if (errorCode !== 0) return failErrorCode(fail, errorCode);

		var groups = stdout.match(/^refs\/heads\/(.*)\n$/);
		if (groups === null) return fail("Did not recognize git output: " + stdout);

		var branch = groups[1];
		if (branch !== expectedBranch) return failBranch(branch);

		return succeed();
	});

	function failBranch(actualBranch) {
		return fail("Not on correct branch. Expected '" + expectedBranch + "' but was '"+ actualBranch + "'");
	}
};

exports.checkNothingToCommit = function(succeed, fail) {
	git("status --porcelain", function(err, errorCode, stdout) {
		if (err) return fail(err);
		if (errorCode !== 0) return failErrorCode(fail, errorCode);

		if (stdout.trim() !== "") {
			process.stdout.write(stdout);
			return fail("Working directory contains files to commit or ignore");
		}

		return succeed();
	});
};

exports.checkFastForwardable = function(baseBranch, branchToMerge, succeed, fail) {
	git("branch --contains " + baseBranch, function(err, errorCode, stdout) {
		if (err) return fail(err);
		if (errorCode !== 0) return failErrorCode(fail, errorCode);

		if (stdout.indexOf(" " + branchToMerge + "\n") === -1) {
			return fail(branchToMerge + " branch doesn't include latest changes from " + baseBranch + " branch");
		}

		return succeed();
	});
};

exports.checkoutBranch = function(branch, succeed, fail) {
	git("checkout -q " + branch, function(err, errorCode, stdout) {
		if (err) return fail(err);
		if (errorCode !== 0) return failErrorCode(fail, errorCode);

		return succeed();
	});
};

//exports.mergeBranch = function(branch, succeed, fail) {
//	git
//}


function failErrorCode(fail, errorCode) {
	return fail("git exited with error code " + errorCode);
}


function git(args, callback) {
	// Why do we use this monster instead of child_process.execFile()? Because we need fine-grained
	// control over our errors. child_process.execFile() uses a single 'error' object for actual
	// errors and for processes that exit with an error code. We need to distinguish the two, and
	// this seemed like the best way to do it.
	//
	// This code is complicated because of potential race conditions in events:
	//   'exit' and 'error' can fire in any order, and either or both may fire
	//   'end' and 'exit can fire in any order, and we need data from both event

	var child = spawn("git", args.split(" "), { stdio: [ "ignore", "pipe", process.stderr ] });

	var stdout = "";
	var errorCode;

	var endEventFired = false;
	var exitEventFired = false;
	var callbackCalled = false;

	child.stdout.setEncoding("utf8");
	child.stdout.on("data", function(data) {
		stdout += data;
	});
	child.stdout.on("end", function() {
		endEventFired = true;
		if (exitEventFired) doCallback(null);
	});

	child.on("error", function(error) {
		doCallback("Problem running git: " + error);
	});
	child.on("exit", function(code, signal) {
		exitEventFired = true;
		if (signal) return doCallback("git exited in response to signal: " + signal);

		errorCode = code;
		if (endEventFired) doCallback(null);
	});

	function doCallback(error) {
		if (callbackCalled) return;
		callbackCalled = true;

		if (error) callback(error);
		else callback(null, errorCode, stdout);
	}

}
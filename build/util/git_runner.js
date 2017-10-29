// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var child_process = require("child_process");

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

exports.checkoutBranch = async function(branch) {
	const { errorCode } = await git("checkout -q " + branch);
	throwIfErrorCode(errorCode);
};

exports.mergeBranch = async function(branch) {
	// The merge must be interactive because it launches an editor for the commit comment.
	const errorCode = await interactiveGit("merge --no-ff --log=500 -m INTEGRATE: --edit " + branch);
	throwIfErrorCode(errorCode);
};

exports.fastForwardBranch = async function(branch) {
	const { errorCode } = await git("merge --ff-only " + branch);
	throwIfErrorCode(errorCode);
};

function throwIfErrorCode(errorCode) {
	if (errorCode !== 0) throw new Error("git exited with error code " + errorCode);
}

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
	//   'end' and 'exit' can fire in any order, and we need data from both events
	return new Promise((resolve, reject) => {
		var child = child_process.spawn("git", args.split(" "), { stdio: ["ignore", "pipe", process.stderr] });

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

			if (error) {
				if (callback) callback(error);
				else reject(error);
			}
			else {
				if (callback) callback(null, errorCode, stdout);
				else resolve({ errorCode, stdout });
			}
		}
	});
}

function interactiveGit(args, callback) {
	return new Promise((resolve, reject) => {
		let callbackCalled = false;

		const child = child_process.spawn("git", args.split(" "), { stdio: "inherit" });
		child.on("error", function(error) {
			doCallback("Problem running git: " + error);
		});
		child.on("exit", function(code, signal) {
			if (signal) return doCallback("git exited in response to signal: " + signal);
			else doCallback(null, code);
		});

		function doCallback(error, errorCode) {
			if (callbackCalled) return;
			callbackCalled = true;

			if (error) reject(error);
			else resolve(errorCode);
		}
	});
}

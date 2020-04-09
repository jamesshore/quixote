// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

const child_process = require("child_process");

exports.checkCurrentBranch = async function(expectedBranch) {
	const { errorCode, stdout } = await git("symbolic-ref HEAD -q");
	if (errorCode === 1 && stdout === "") throwBranch("detached HEAD");
	throwIfErrorCode(errorCode);

	const groups = stdout.match(/^refs\/heads\/(.*)\n$/);
	if (groups === null) throw new Error("Did not recognize git output: " + stdout);

	const branch = groups[1];
	if (branch !== expectedBranch) throwBranch(branch);

	function throwBranch(actualBranch) {
		throw new Error("Not on correct branch. Expected '" + expectedBranch + "' but was '"+ actualBranch + "'.");
	}
};

exports.checkNothingToCommit = async function() {
	const { errorCode, stdout } = await git("status --porcelain");
	throwIfErrorCode(errorCode);

	if (stdout.trim() !== "") {
		process.stdout.write(stdout);
		throw new Error("Working directory contains files to commit or ignore");
	}
};

exports.checkFastForwardable = async function(baseBranch, branchToMerge) {
	const { errorCode, stdout } = await git("branch --contains " + baseBranch);
	throwIfErrorCode(errorCode);

	if (stdout.indexOf(" " + branchToMerge + "\n") === -1) {
		throw new Error(branchToMerge + " branch doesn't include latest changes from " + baseBranch + " branch");
	}
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

function git(args) {
	// Why do we use this monster instead of child_process.execFile()? Because we need fine-grained
	// control over our errors. child_process.execFile() uses a single 'error' object for actual
	// errors and for processes that exit with an error code. We need to distinguish the two, and
	// this seemed like the best way to do it.
	//
	// This code is complicated because of potential race conditions in events:
	//   'exit' and 'error' can fire in any order, and either or both may fire
	//   'end' and 'exit' can fire in any order, and we need data from both events
	return new Promise((resolve, reject) => {
		const child = child_process.spawn("git", args.split(" "), { stdio: ["ignore", "pipe", process.stderr] });

		let stdout = "";
		let errorCode;

		let endEventFired = false;
		let exitEventFired = false;
		let callbackCalled = false;

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

			if (error) reject(error);
			else resolve({ errorCode, stdout });
		}
	});
}

function interactiveGit(args) {
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

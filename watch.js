#!/usr/local/bin/node

// Automatically runs Jake when files change.
//
// Thanks to Davide Alberto Molin for contributing this code.
// See http://www.letscodejavascript.com/v3/comments/live/7 for details.
//
// NOTE: The "COMMAND" variable must be changed for this to work on Windows.

(function() {
	"use strict";

	var gaze = require("gaze");
	var spawn = require("child_process").spawn;

	var WATCH = [
		"build/**/*.js",
		"src/**/*.js",
		"vendor/**/*.js"
	];

	var COMMAND = require("./build/config/build_command.js");

	var args = process.argv.slice(2);
	var child = null;

	gaze(WATCH, function(err, watcher) {
		if (err) {
			console.log("Error: " + err);
			return;
		}

		console.log("Will run " + COMMAND + " when " + WATCH.join(" or ") + " changes.");
		watcher.on("all", triggerBuild);
		triggerBuild();    // Always run after startup
	});

	function triggerBuild(evt, filepath) {
		if (child === null) runJake(filepath);
	}

	function runJake(filepath) {
		console.log();
		if (filepath) console.log(filepath + " changed");
		console.log("> " + COMMAND + " " + args.join(" "));
		child = spawn(COMMAND, args, { stdio: "inherit" });

		child.once("exit", function(code) {
			child = null;
		});
	}

}());

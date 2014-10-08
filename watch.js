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

	var WATCH = "src/**/*.js";

	var COMMAND = "./jake.sh";   // Mac/Unix
//	var COMMAND = "jake.bat";                 // Windows

	var args = process.argv.slice(2);
	var child = null;
	var buildQueued = false;
	var buildStartedAt;

	gaze(WATCH, function(err, watcher) {
		console.log("Will run " + COMMAND + " when " + WATCH + " changes.");
		watcher.on("all", triggerBuild);
		triggerBuild();    // Always run after startup
	});

	function triggerBuild(evt, filepath) {
		if (child === null) runJake();
		else queueAnotherBuild();
	}

	function runJake() {
		buildStartedAt = Date.now();
		console.log("\n> " + COMMAND + " " + args.join(" "));
		child = spawn(COMMAND, args, { stdio: "inherit" });

		child.once("exit", function(code) {
			child = null;
		});
	}

	function queueAnotherBuild() {
		if (buildQueued) return;
		if (debounce()) return;

		buildQueued = true;
		child.once("exit", function(code) {
			buildQueued = false;
			triggerBuild();
		});

		function debounce() {
			var msSinceLastBuild = Date.now() - buildStartedAt;
			return msSinceLastBuild < 500;
		}
	}

}());

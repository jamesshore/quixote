// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var jshint = require("simplebuild-jshint");

	desc("Lint, test, and build");
	task("default", [ "lint" ], function() {
		console.log("\n\nBUILD OK");
	});

	desc("Lint everything");
	task("lint", [ "lintBuild", "lintSrc" ]);

	task("lintBuild", function() {
		process.stdout.write("Linting build files: ");
		jshint.checkFiles({
			files: [ "build/**/*.js" ],
			options: nodeLintOptions(),
			globals: nodeLintGlobals()
		}, complete, fail);
	}, { async: true });

	task("lintSrc", function() {
		process.stdout.write("Linting source code: ");
		jshint.checkFiles({
			files: [ "src/**/*.js" ],
			options: clientLintOptions(),
			globals: clientLintGlobals()
		}, complete, fail);
	}, { async: true });




	function universalLintOptions() {
		return {
			bitwise: true,
			curly: false,
			eqeqeq: true,
			forin: true,
			immed: true,
			latedef: false,
			newcap: true,
			noarg: true,
			noempty: true,
			nonew: true,
			regexp: true,
			undef: true,
			strict: true,
			globalstrict: true,     // "global" stricts are okay when using CommonJS modules
			trailing: true
		};
	}

	function nodeLintOptions() {
		var options = universalLintOptions();
		options.node = true;
		return options;
	}

	function clientLintOptions() {
		var options = universalLintOptions();
		options.browser = true;
		return options;
	}

	function nodeLintGlobals() {
		return {
			// Jake
			desc: false,
			task: false,
			complete: false,
			fail: false
		};
	}

	function clientLintGlobals() {
		return {
			// Karma
			console: false,
			dump: false,

			// CommonJS
			exports: false,
			require: false,
			module: false,

			// Mocha
			beforeEach: false,
			afterEach: false,
			describe: false,
			it: false
		};
	}

})();


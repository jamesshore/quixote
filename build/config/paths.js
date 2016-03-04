// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var glob = require("glob");

	exports.karmaConfig = "./build/config/karma.conf.js";
	exports.mainModule = "./src/quixote.js";
	exports.distDir = "dist";
	exports.distFile = exports.distDir + "/quixote.js";
	exports.generatedDir = "generated";

	exports.utilTestDependencies = function() {
		return deglob("src/util/*.js");
	};


	function deglob(patternsToFind, patternsToIgnore) {
		var globPattern = patternsToFind;
		if (Array.isArray(patternsToFind)) {
			if (patternsToFind.length === 1) {
				globPattern = patternsToFind[0];
			}
			else {
				globPattern = "{" + patternsToFind.join(",") + "}";
			}
		}

		return glob.sync(globPattern, { ignore: patternsToIgnore });
	}


}());
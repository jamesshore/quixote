// Copyright (c) 2015-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var glob = require("glob");
var path = require("path");

exports.karmaConfig = "./build/config/karma.conf.js";
exports.mainModule = "./src/quixote.js";
exports.distDir = "dist";
exports.distFile = exports.distDir + "/quixote.js";
exports.generatedDir = "generated";
exports.incrementalDir = "generated/incremental";

exports.lintFiles = function() {
	return deglob([ "build/**/*.js", "src/**/*.js", "test/**/*.js" ]);
};

exports.foundationTestDependencies = function() {
	return deglob("src/*.js");
};

exports.descriptorTestDependencies = function() {
	return deglob("src/descriptors/**/*.js");
};

exports.utilTestDependencies = function() {
	return deglob("src/util/**/*.js");
};

exports.valueTestDependencies = function() {
	return deglob("src/values/**/*.js");
};

exports.endToEndTestDependencies = function() {
	return deglob("test/**/*.js");
};

exports.lintOutput = function() {
	return exports.lintFiles().map(function(pathname) {
		return "generated/incremental/lint/" + pathname + ".lint";
	});
};

exports.lintDirectories = function() {
	return exports.lintOutput().map(function(lintDependency) {
		return path.dirname(lintDependency);
	});
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

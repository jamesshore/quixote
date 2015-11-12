// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../vendor/chai-2.1.0").assert;

	// 'module.exports = assert' doesn't work because it's a shallow copy. Any changes (such when we
	// overwrite exports.fail) changes Chai's functions. In the case of export.fail, it causes an infinite
	// loop. Oops.
	Object.keys(assert).forEach(function(property) {
		exports[property] = assert[property];
	});

	exports.fail = function(message) {
		assert.fail(null, null, message);
	};

}());
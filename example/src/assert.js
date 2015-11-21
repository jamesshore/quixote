// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.

// A small modification to Chai. Why? Just to demonstrate how you can customize an assertion library
// without writing it all yourself.
// There's nothing related to Quixote in this file.

(function() {
	"use strict";

	var assert = require("../vendor/chai-2.1.0").assert;

	// 'module.exports = assert' doesn't work because it's a shallow copy. Any changes (such as when we
	// overwrite exports.fail) changes Chai's functions. In the case of export.fail, it causes an infinite
	// loop. Oops.
	Object.keys(assert).forEach(function(property) {
		exports[property] = assert[property];
	});

	exports.fail = function(message) {
		assert.fail(null, null, message);
	};

}());
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// ****
// An assertion library that works the way *I* want it to. <oldmanvoice>Get off my lawn!</oldmanvoice>
// ****

// We use Proclaim rather than Chai because Chai doesn't support IE 8.
// But Proclaim is not stellar, so we build our own in places.
var proclaim = require("../../vendor/proclaim-2.0.0.js");

exports.fail = function(message) {
	proclaim.fail(null, null, message);
};

exports.defined = function(message) {
	proclaim.isDefined(message);
};

exports.type = function(obj, expectedType, message) {
	proclaim.isInstanceOf(obj, expectedType, message);
};

exports.equal = function(actual, expected, message) {
	message = message ? message + ": " : "";
	proclaim.strictEqual(actual, expected, message + "expected '" + expected + "', but got '" + actual + "'");
};

exports.deepEqual = function(actual, expected, message) {
	if (message) message += " expected deep equality";
	proclaim.deepEqual(actual, expected, message);
};

exports.noException = function(fn, message) {
	try {
		fn();
	}
	catch (e) {
		message = message ? message + ": " : "";
		exports.fail(message + "expected no exception, but got '" + e + "'");
	}
};

exports.exception = function(fn, expectedRegexp, message) {
	message = message ? message + ": " : "";
	try {
		fn();
		exports.fail(message + "expected exception");
	}
	catch (e) {
		if (expectedRegexp) {
			proclaim.match(
				e.message,
				expectedRegexp,
				message + "expected exception message to match " + expectedRegexp + ", but was '" + e + "'"
			);
		}
	}
};
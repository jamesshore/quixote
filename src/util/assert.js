// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// ****
// An assertion library that works the way *I* want it to. <oldmanvoice>Get off my lawn!</oldmanvoice>
// ****

// We use Proclaim rather than Chai because Chai doesn't support IE 8
var proclaim = require("../../vendor/proclaim-2.0.0.js");

exports.fail = function(message) {
	proclaim.fail(null, null, message);
};

exports.equal = function(actual, expected, message) {
	proclaim.strictEqual(actual, expected, message);
};

exports.deepEqual = function(actual, expected, message) {
	if (message) message += " expected deep equality";
	proclaim.deepEqual(actual, expected, message);
};

exports.noException = function(fn, message) {
	proclaim.doesNotThrow(fn, message);
};

exports.exception = function(fn, expected, message) {
	proclaim.throws(fn, expected, message);
};
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// ****
// Assertions that work the way *I* want them to. <oldmanvoice>Get off my lawn!</oldmanvoice>
// ****

// We use Proclaim for now because Chai doesn't work on
var proclaim = require("../vendor/proclaim");

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
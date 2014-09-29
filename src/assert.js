// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// ****
// Assertions that work the way *I* want them to. <oldmanvoice>Get off my lawn!</oldmanvoice>
// ****

//var chai = require("chai").assert;
//
exports.fail = function(message) {
//	chai.fail(null, null, message);
};

exports.equal = function(actual, expected, message) {
//	chai.strictEqual(actual, expected, message);
};

exports.deepEqual = function(actual, expected, message) {
	if (message) message += " expected deep equality";
//	chai.deepEqual(actual, expected, message);
};
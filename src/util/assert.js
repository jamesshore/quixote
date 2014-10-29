// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// ****
// An assertion library that works the way *I* want it to. <oldmanvoice>Get off my lawn!</oldmanvoice>
// ****

// We use Proclaim rather than Chai because Chai doesn't support IE 8.
// But Proclaim is not stellar, so we build our own in places.
var proclaim = require("../../vendor/proclaim-2.0.0.js");

var shim = require("./shim.js");

exports.fail = function(message) {
	proclaim.fail(null, null, message);
};

exports.defined = function(value, message) {
	message = message ? message + ": " : "";
	proclaim.isDefined(value, message + "expected any value, but was undefined");
};

exports.type = function(obj, expectedType, message) {
	message = message ? message + ": " : "";
	proclaim.isInstanceOf(
		obj,
		expectedType,
		message + "expected object to be instance of " +
			shim.Function.name(expectedType) + ", but was " + describeObject(obj)
	);
};

exports.implements = function(obj, expectedType, message) {
	exports.type(obj, expectedType, message);

	message = message ? message + ": " : "";
	proclaim.isDefined(obj.checkAbstractMethods, message + describeObject(obj) + " does not extend an abstract class");
	var needed = obj.checkAbstractMethods();
	proclaim.isTrue(needed.length === 0, message + "must implement " + needed.join(" and "));
};

exports.equal = function(actual, expected, message) {
	message = message ? message + ": " : "";
	var expectedType = typeof expected;
	var actualType = typeof actual;

	proclaim.strictEqual(actualType, expectedType, message + "expected " + expectedType + " '" + expected + "', but got " + actualType + " '" + actual + "'");
	proclaim.strictEqual(actual, expected, message + "expected '" + expected + "', but got '" + actual + "'");
};

exports.lte = function(actual, expected, message) {
	message = message ? message + ": " : "";

	proclaim.isTrue(actual <= expected, message + "expected <= '" + expected + "', but got '" + actual + "'");
};

exports.objEqual = function(actual, expected, message) {
	message = message ? message + ": " : "";
	proclaim.isDefined(actual, message + "expected object, but was undefined");
	proclaim.isTrue(actual.equals(expected), message + "object equality expected '" + expected + "', but got '" + actual + "'");
};

exports.objNotEqual = function(actual, expected, message) {
	message = message ? message + ": " : "";
	proclaim.isFalse(actual.equals(expected), message + "expected '" + expected + "' and '" + actual + "' to be not be equal(), but they were");
};

exports.deepEqual = function(actual, expected, message) {
	message = message ? message + ": " : "";
	proclaim.deepEqual(actual, expected, message + "expected deep equality.");
};

exports.match = function(actual, expectedRegex, message) {
	message = message ? message + ": " : "";
	proclaim.match(actual, expectedRegex, message + "expected string to match " + expectedRegex + ", but got '" + actual + "'");
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

exports.exception = function(fn, expected, message) {
	message = message ? message + ": " : "";
	var noException = false;
	try {
		fn();
		noException = true;
	}
	catch (e) {
		if (typeof expected === "string") {
			proclaim.strictEqual(
				e.message,
				expected,
				message + "expected exception message to be '" + expected + "', but was '" + e.message + "'"
			);
		}
		else if (expected instanceof RegExp) proclaim.match(
			e.message,
			expected,
			message + "expected exception message to match " + expected + ", but was '" + e.message + "'"
		);
		else if (expected !== undefined) throw new Error("Unrecognized 'expected' parameter in assertion: " + expected);
	}
	if (noException) exports.fail(message + "expected exception");
};

function describeObject(obj) {
	var actualType = "unknown";
	var prototype = shim.Object.getPrototypeOf(obj);
	if (prototype === null) actualType = "object without a prototype";
	else if (prototype.constructor) actualType = shim.Function.name(prototype.constructor);
	return actualType;
}

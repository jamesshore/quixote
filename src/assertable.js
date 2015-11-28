// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var oop = require("./util/oop.js");
var shim = require("./util/shim.js");
var Descriptor = require("./descriptors/descriptor.js");

var Me = module.exports = function Assertable() {
	ensure.unreachable("Assertable is abstract and should not be constructed directly.");
};
Me.extend = oop.extendFn(Me);
oop.makeAbstract(Me, []);

Me.prototype.assert = function assert(expected, message) {
	ensure.signature(arguments, [ Object, [undefined, String] ]);
	if (message === undefined) message = "Differences found";

	var diff = this.diff(expected);
	if (diff !== "") throw new Error(message + ":\n" + diff + "\n");
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ Object ]);

	var result = [];
	var keys = shim.Object.keys(expected);
	var key;
	for (var i = 0; i < keys.length; i++) {
		key = keys[i];
		this.diffDescriptor(result, key, this[key], expected);
	}

	return result.join("\n");
};

var objToString = Object.prototype.toString;
var objectTag = "[object Object]";

Me.prototype.diffDescriptor = function diffDescriptor(result, key, descriptor, expected) {
	var oneDiff;

	ensure.that(
		descriptor !== undefined,
		this + " doesn't have a property named '" + key + "'. Did you misspell it?"
	);

	var expectedValue = expected[key];

	// if the value from the assertion is something we can diff against, then pass it to descriptor's diff
	if (typeof expectedValue === "string" || typeof expectedValue === "boolean" || typeof expectedValue === "number" ||
		(typeof expectedValue === "object" && expectedValue instanceof Descriptor)) {
		oneDiff = descriptor.diff(expectedValue);
		if (oneDiff !== "") result.push(oneDiff);
	}
	else if (typeof expectedValue === "object") {
		var childKeys = shim.Object.keys(expectedValue);
		var childKey;
		for (var i = 0; i < childKeys.length; i++) {
			childKey = childKeys[i];

			// recurse to diff all the child nodes of the object set as the expected value
			this.diffDescriptor(result, childKey, descriptor[childKey], expectedValue);
		}
	}

};

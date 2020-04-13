// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var shim = require("../util/shim.js");

var Me = module.exports = function Value() {};
Me.extend = oop.extendFn(Me);
oop.makeAbstract(Me, [
	"compatibility",
	"diff",
	"toString"
]);

Me.safe = function safe(fn) {
	return function() {
		ensureCompatibility(this, this.compatibility(), arguments);
		return fn.apply(this, arguments);
	};
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);
	return this;
};

Me.prototype.equals = function equals(that) {
	return this.diff(that) === "";
};

Me.prototype.isCompatibleWith = function isCompatibleWith(that) {
	if (that === null || typeof that !== "object") return false;

	var compatibleTypes = this.compatibility();
	for (var i = 0; i < compatibleTypes.length; i++) {
		if (that instanceof compatibleTypes[i]) return true;
	}
	return false;
};

function ensureCompatibility(self, compatible, args) {
	var arg;
	for (var i = 0; i < args.length; i++) {   // args is not an Array, can't use forEach
		arg = args[i];
		if (!self.isCompatibleWith(arg)) {
			var type = typeof arg;
			if (arg === null) type = "null";
			if (type === "object") type = oop.instanceName(arg);

			throw new Error(
				"A descriptor doesn't make sense. (" + oop.instanceName(self) + " can't combine with " + type + ")"
			);
		}
	}
}


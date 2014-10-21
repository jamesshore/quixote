// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var shim = require("../util/shim.js");

var Me = module.exports = function Value() {};
Me.extend = oop.extendFn(Me);
oop.makeAbstract(Me, [
	"diff",
	"toString",
	"compatibility"
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

Me.prototype.describeMatch = function describeMatch() {
	ensure.signature(arguments, []);
	return "be " + this;
};

function ensureCompatibility(self, compatible, args) {
	var arg;
	var allowed;
	for (var i = 0; i < args.length; i++) {   // args is not an Array, can't use forEach
		arg = args[i];
		allowed = false;
		for (var j = 0; j < compatible.length; j++) {
			if (arg instanceof compatible[j]) allowed = true;
		}
		if (!allowed) throw new Error(oop.instanceName(self) + " isn't compatible with " + oop.instanceName(arg));
	}
}
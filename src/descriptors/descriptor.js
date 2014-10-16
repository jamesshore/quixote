// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var shim = require("../util/shim.js");

var Me = module.exports = function Descriptor() {};

Me.extend = function extend(Subclass) {
	ensure.signature(arguments, [ Function ]);

	Subclass.prototype = shim.objectDotCreate(Me.prototype);
	Subclass.prototype.constructor = Subclass;
};

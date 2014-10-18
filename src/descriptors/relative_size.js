// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Size = require("../values/size.js");

var Me = module.exports = function(relativeTo, amount) {
	var ElementSize = require("./element_size.js");
	ensure.signature(arguments, [  ElementSize, Number ]);

	this._relativeTo = relativeTo;
	this._amount = new Size(amount);
};

Me.prototype.value = function value() {
	return this._relativeTo.value().plus(this._amount);
};
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");

var Me = module.exports = function YPosition(position) {
	ensure.signature(arguments, [ Number ]);

	this._position = position;
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);

	return this._position + "px";
};

Me.prototype.equals = function(that) {
	ensure.signature(arguments, [ [Me, Number] ]);

	var thatPosition = (typeof that === "number") ? that : that._position;
	return this._position === thatPosition;
};
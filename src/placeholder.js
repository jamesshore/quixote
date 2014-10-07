// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");

exports.arithmetic = function(a, b) {
	ensure.signature(arguments, [ Number, Number ]);

	return a + b;
};
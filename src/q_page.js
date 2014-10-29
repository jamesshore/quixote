// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var PageSize = require("./descriptors/page_size.js");

var Me = module.exports = function QPage(frame) {
	var QFrame = require("./q_frame.js");   // break circular dependency
	ensure.signature(arguments, [ QFrame ]);

	// properties
	this.width = PageSize.x(frame);
	this.height = PageSize.y(frame);

};
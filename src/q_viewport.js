// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var ViewportSize = require("./descriptors/viewport_size.js");
var ViewportEdge = require("./descriptors/viewport_edge.js");

var Me = module.exports = function QViewport(frame) {
	var QFrame = require("./q_frame.js");   // break circular dependency
	ensure.signature(arguments, [ QFrame ]);

	// properties
	this.width = ViewportSize.x(frame);
	this.height = ViewportSize.y(frame);

	this.top = ViewportEdge.top(frame);
	this.right = ViewportEdge.right(frame);
	this.bottom = ViewportEdge.bottom(frame);
	this.left = ViewportEdge.left(frame);
};
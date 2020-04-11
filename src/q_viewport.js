// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var ViewportEdge = require("./descriptors/viewport_edge.js");
var Center = require("./descriptors/center.js");
var Assertable = require("./assertable.js");
var GenericSize = require("./descriptors/generic_size.js");

var Me = module.exports = function QViewport(contentHost) {
	var BrowsingContext = require("./browsing_context");   // break circular dependency
	ensure.signature(arguments, [ BrowsingContext ]);

	// properties
	this.top = ViewportEdge.top(contentHost);
	this.right = ViewportEdge.right(contentHost);
	this.bottom = ViewportEdge.bottom(contentHost);
	this.left = ViewportEdge.left(contentHost);

	this.width = GenericSize.create(this.left, this.right, "width of viewport");
	this.height = GenericSize.create(this.top, this.bottom, "height of viewport");

	this.center = Center.x(this.left, this.right, "center of viewport");
	this.middle = Center.y(this.top, this.bottom, "middle of viewport");
};
Assertable.extend(Me);

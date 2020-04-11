// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var PageEdge = require("./descriptors/page_edge.js");
var Center = require("./descriptors/center.js");
var Assertable = require("./assertable.js");
var GenericSize = require("./descriptors/generic_size.js");

var Me = module.exports = function QPage(contentHost) {
	var QContentHost = require("./q_content_host.js");   // break circular dependency
	ensure.signature(arguments, [ QContentHost ]);

	// properties
	this.top = PageEdge.top(contentHost);
	this.right = PageEdge.right(contentHost);
	this.bottom = PageEdge.bottom(contentHost);
	this.left = PageEdge.left(contentHost);

	this.width = GenericSize.create(this.left, this.right, "width of page");
	this.height = GenericSize.create(this.top, this.bottom, "height of page");

	this.center = Center.x(this.left, this.right, "center of page");
	this.middle = Center.y(this.top, this.bottom, "middle of page");
};
Assertable.extend(Me);

// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var PageEdge = require("./descriptors/page_edge.js");
var Center = require("./descriptors/center.js");
var Assertable = require("./assertable.js");
var GenericSize = require("./descriptors/generic_size.js");

var Me = module.exports = function QPage(contentDocument) {
	// Cannot check against HTMLDocument directly because most browsers define HTMLDocument on the Window type
	// Since the document is in an iFrame its HTMLDocument definition is the iFrame window's HTMLDocument and
	// not the top level window's version.
	ensure.signature(arguments, [ Object ]);

	// properties
	this.top = PageEdge.top(contentDocument);
	this.right = PageEdge.right(contentDocument);
	this.bottom = PageEdge.bottom(contentDocument);
	this.left = PageEdge.left(contentDocument);

	this.width = GenericSize.create(this.left, this.right, "width of page");
	this.height = GenericSize.create(this.top, this.bottom, "height of page");

	this.center = Center.x(this.left, this.right, "center of page");
	this.middle = Center.y(this.top, this.bottom, "middle of page");
};
Assertable.extend(Me);

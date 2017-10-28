// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ensure = require("../util/ensure.js");
	var RenderState = require("../values/render_state.js");
	var Position = require("../values/position.js");
	var Descriptor = require("./descriptor.js");
	var ElementRenderedEdge = require("./element_rendered_edge.js");
	var GenericSize = require("./generic_size.js");

	var Me = module.exports = function ElementRendered(element) {
		var QElement = require("../q_element.js");      // break circular dependency
		ensure.signature(arguments, [ QElement ]);

		this._element = element;

		// properties
		this.top = ElementRenderedEdge.top(element);
		this.right = ElementRenderedEdge.right(element);
		this.bottom = ElementRenderedEdge.bottom(element);
		this.left = ElementRenderedEdge.left(element);

		this.width = GenericSize.create(this.left, this.right, "rendered width of " + element);
		this.height = GenericSize.create(this.top, this.bottom, "rendered height of " + element);
	};
	Descriptor.extend(Me);

	Me.create = function create(element) {
		return new Me(element);
	};

	Me.prototype.value = function value() {
		if (this.top.value().equals(Position.noY())) return RenderState.notRendered();
		else return RenderState.rendered();
	};

	Me.prototype.toString = function toString() {
		return "render status of " + this._element.toString();
	};

	Me.prototype.convert = function convert(arg, type) {
	  if (type === "boolean") {
		  return arg ? RenderState.rendered() : RenderState.notRendered();
	  }
	};

}());
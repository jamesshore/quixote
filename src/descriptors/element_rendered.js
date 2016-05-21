// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ensure = require("../util/ensure.js");
	var RenderState = require("../values/render_state.js");
	var Descriptor = require("./descriptor.js");

	var Me = module.exports = function ElementRendered(element) {
		var QElement = require("../q_element.js");      // break circular dependency
		ensure.signature(arguments, [ QElement ]);

		this._element = element;
	};
	Descriptor.extend(Me);

	Me.create = function create(element) {
		return new Me(element);
	};

	Me.prototype.value = function value() {
		if (!this._element.frame.body().toDomElement().contains(this._element.toDomElement())) return RenderState.detached();
		else if (this._element.getRawStyle("display") === "none") return RenderState.displayNone();
		else return RenderState.rendered();
	};

	Me.prototype.toString = function toString() {
		return "display status of " + this._element.toString();
	};

	Me.prototype.convert = function convert(arg, type) {
	  if (type === "boolean") {
		  return arg ? RenderState.rendered() : RenderState.notRendered();
	  }
		if (type === "string") {
			if (arg === "none") return RenderState.displayNone();
			if (arg === "detached") return RenderState.detached();
		}
	};

}());
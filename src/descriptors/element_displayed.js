// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ensure = require("../util/ensure.js");
	var Display = require("../values/display.js");
	var Descriptor = require("./descriptor.js");

	var Me = module.exports = function ElementDisplayed(element) {
		var QElement = require("../q_element.js");      // break circular dependency
		ensure.signature(arguments, [ QElement ]);

		this._element = element;
	};
	Descriptor.extend(Me);

	Me.create = function create(element) {
		return new Me(element);
	};

	Me.prototype.value = function value() {
		if (!this._element.frame.body().toDomElement().contains(this._element.toDomElement())) return Display.detached();
		else if (this._element.getRawStyle("display") === "none") return Display.displayNone();
		else return Display.displayed();
	};

	Me.prototype.toString = function toString() {
		return this._element.toString();
	};

}());
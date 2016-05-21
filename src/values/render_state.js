// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ensure = require("../util/ensure.js");
	var Value = require("./value.js");

	var RENDERED = "rendered";
	var NOT_RENDERED = "not rendered";
	var DISPLAY_NONE = "not rendered due to display:none property";
	var DETACHED = "not rendered due to being detached from DOM";

	var Me = module.exports = function RenderState(state) {
		ensure.signature(arguments, [ String ]);

		this._state = state;
	};
	Value.extend(Me);

	Me.rendered = function rendered() {
		return new Me(RENDERED);
	};

	Me.notRendered = function notRendered() {
		return new Me(NOT_RENDERED);
	};

	Me.displayNone = function displayNone() {
		return new Me(DISPLAY_NONE);
	};

	Me.detached = function detached() {
		return new Me(DETACHED);
	};

	Me.prototype.compatibility = function compatibility() {
		return [ Me ];
	};

	Me.prototype.diff = Value.safe(function diff(expected) {
		var thisState = this._state;
		var expectedState = expected._state;

		if (thisState === expectedState) return "";

		if (thisState === RENDERED) return "different than expected";
		else if (expectedState === RENDERED) return "different than expected";
		else if (thisState === NOT_RENDERED || expectedState === NOT_RENDERED) return "";
		else return "achieved differently than expected";
	});

	Me.prototype.toString = function toString() {
		return this._state;
	};

}());
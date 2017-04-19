// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ensure = require("../util/ensure.js");
	var PositionDescriptor = require("./position_descriptor.js");
  var SizeDescriptor = require("./size_descriptor.js");

	var Me = module.exports = function Span(from, to) {
	  ensure.signature(arguments, [ PositionDescriptor, PositionDescriptor ]);

	  this._from = from;
	  this._to = to;
	};

	Me.create = function(from, to) {
	  return new Me(from, to);
	};

}());
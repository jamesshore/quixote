// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var SizeDescriptor = require("./size_descriptor.js");
var Center = require("./center.js");

var Me = module.exports = function Span(from, to, description) {
  ensure.signature(arguments, [ PositionDescriptor, PositionDescriptor, String ]);

  this.should = this.createShould();

  this.center = Center.x(from, to, "center of " + description);
  this.middle = Center.y(from, to, "middle of " + description);

  this._from = from;
  this._to = to;
  this._description = description;
};
SizeDescriptor.extend(Me);

Me.create = function(from, to, description) {
  return new Me(from, to, description);
};

Me.prototype.value = function() {
  ensure.signature(arguments, []);
  return this._from.value().distanceTo(this._to.value());
};

Me.prototype.toString = function() {
  return this._description;
};

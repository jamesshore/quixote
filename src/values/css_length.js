// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var oop = require("../util/oop.js");
var Value = require("./value.js");

var Me = module.exports = function CssLength() {};
Value.extend(Me);
Me.extend = oop.extendFn(Me);
oop.makeAbstract(Me, [
	"diff",
	"toString",
	"compatibility"
]);


// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");

var Me = module.exports = function Descriptor() {};

Me.extend = function extend(Subclass) {
	ensure.signature(arguments, [ Function ]);

	Subclass.prototype = createObject(Me.prototype);
	Subclass.prototype.constructor = Subclass;
};

// WORKAROUND IE8: no Object.create()
function createObject(prototype) {
	if (Object.create) return Object.create(prototype);

	var Temp = function Temp() {};
	Temp.prototype = prototype;
	return new Temp();
}

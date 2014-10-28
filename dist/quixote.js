!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.quixote=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var Value = require("../values/value.js");

var Me = module.exports = function Descriptor() {};
Me.extend = oop.extendFn(Me);
oop.makeAbstract(Me, [
	"value",
	"toString"
]);

Me.prototype.diff = function diff(expected) {
	expected = normalizeType(this, expected);
	try {
		var actualValue = this.value();
		var expectedValue = expected.value();

		if (actualValue.equals(expectedValue)) return "";

		var difference = actualValue.diff(expectedValue);
		var expectedDesc = expectedValue.toString();
		if (expected instanceof Me) expectedDesc += " (" + expected + ")";

		return this + " was " + difference + " than expected.\n" +
			"  Expected: " + expectedDesc + "\n" +
			"  But was:  " + actualValue;
	}
	catch (err) {
		throw new Error("Can't compare " + this + " to " + expected + ": " + err.message);
	}
};

Me.prototype.convert = function convert(arg, type) {
	// This method is meant to be overridden by subclasses. It should return 'undefined' when an argument
	// can't be converted. In this default implementation, no arguments can be converted, so we always
	// return 'undefined'.
	return undefined;
};

Me.prototype.equals = function equals(that) {
	// Descriptors aren't value objects. They're never equal to anything. But sometimes
	// they're used in the same places value objects are used, and this method gets called.
	return false;
};

function normalizeType(self, expected) {
	var expectedType = typeof expected;
	if (expected === null) expectedType = "null";

	if (expectedType === "object" && (expected instanceof Me || expected instanceof Value)) return expected;

	if (expected === undefined) {
		throw new Error("Can't compare " + self + " to " + expected + ". Did you misspell a property name?");
	}
	else if (expectedType === "object") {
		throw new Error("Can't compare " + self + " to " + oop.instanceName(expected) + " instances.");
	}
	else {
		expected = self.convert(expected, expectedType);
		if (expected === undefined) throw new Error("Can't compare " + self + " to " + expectedType + ".");
	}

	return expected;
}

},{"../util/ensure.js":16,"../util/oop.js":17,"../values/value.js":22}],2:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Position = require("../values/position.js");
var RelativePosition = require("./relative_position.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function ElementCenter(dimension, element) {
	var QElement = require("../q_element.js");    // break circular dependency
	ensure.signature(arguments, [ String, QElement ]);
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._element = element;
};
Descriptor.extend(Me);

Me.x = function(element) {
	return new Me(X_DIMENSION, element);
};

Me.y = function(element) {
	return new Me(Y_DIMENSION, element);
};

Me.prototype.plus = function plus(amount) {
	if (this._dimension === X_DIMENSION) return RelativePosition.right(this, amount);
	else return RelativePosition.down(this, amount);
};

Me.prototype.minus = function minus(amount) {
	if (this._dimension === X_DIMENSION) return RelativePosition.left(this, amount);
	else return RelativePosition.up(this, amount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var position = this._element.getRawPosition();

	if (this._dimension === X_DIMENSION) return Position.x(position.left + ((position.right - position.left) / 2));
	else return Position.y(position.top + ((position.bottom - position.top) / 2));
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "number") return (this._dimension === X_DIMENSION) ? Position.x(arg) : Position.y(arg);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var description = (this._dimension === X_DIMENSION) ? "center" : "middle";
	return description + " of " + this._element;
};
},{"../q_element.js":11,"../util/ensure.js":16,"../values/position.js":20,"./descriptor.js":1,"./relative_position.js":5}],3:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var RelativePosition = require("./relative_position.js");
var Descriptor = require("./descriptor.js");
var ElementSize = require("./element_size.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ElementEdge(element, position) {
	var QElement = require("../q_element.js");      // break circular dependency
	ensure.signature(arguments, [  QElement, String ]);
	ensure.that(
		position === TOP || position === RIGHT || position === BOTTOM || position === LEFT,
		"Unknown position: " + position
	);

	this._element = element;
	this._position = position;
};
Descriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.plus = function plus(amount) {
	if (this._position === RIGHT || this._position === LEFT) return RelativePosition.right(this, amount);
	if (this._position === TOP || this._position === BOTTOM) return RelativePosition.down(this, amount);
};

Me.prototype.minus = function minus(amount) {
	if (this._position === RIGHT || this._position === LEFT) return RelativePosition.left(this, amount);
	if (this._position === TOP || this._position === BOTTOM) return RelativePosition.up(this, amount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var edge = this._element.getRawPosition()[this._position];
	var scroll = this._element.frame.getRawScrollPosition();
	return createPosition(this, edge, scroll);
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "number") return createPosition(this, arg, { x: 0, y: 0 });
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._position + " edge of " + this._element;
};

function factoryFn(position) {
	return function factory(element) {
		return new Me(element, position);
	};
}

function createPosition(self, value, scrollPos) {
	if (self._position === RIGHT || self._position === LEFT) return Position.x(value + scrollPos.x);
	else return Position.y(value + scrollPos.y);
}
},{"../q_element.js":11,"../util/ensure.js":16,"../values/position.js":20,"./descriptor.js":1,"./element_size.js":4,"./relative_position.js":5}],4:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var SizeDescriptor = require("./size_descriptor.js");
var Size = require("../values/size.js");
var RelativeSize = require("./relative_size.js");
var SizeMultiple = require("./size_multiple.js");

var X_DIMENSION = "width";
var Y_DIMENSION = "height";

var Me = module.exports = function ElementSize(dimension, element) {
	var QElement = require("../q_element.js");    // break circular dependency
	ensure.signature(arguments, [ String, QElement ]);
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._element = element;
};
SizeDescriptor.extend(Me);

Me.x = factoryFn(X_DIMENSION);
Me.y = factoryFn(Y_DIMENSION);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var position = this._element.getRawPosition();
	return Size.create(position[this._dimension]);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return this._dimension + " of " + this._element;
};

function factoryFn(dimension) {
	return function factory(element) {
		return new Me(dimension, element);
	};
}
},{"../q_element.js":11,"../util/ensure.js":16,"../values/size.js":21,"./relative_size.js":6,"./size_descriptor.js":7,"./size_multiple.js":8}],5:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var Descriptor = require("./descriptor.js");
var Value = require("../values/value.js");
var Size = require("../values/size.js");
var Pixels = require("../values/pixels.js");
var ElementSize = require("./element_size.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";
var PLUS = 1;
var MINUS = -1;

var Me = module.exports = function RelativePosition(dimension, direction, relativeTo, relativeAmount) {
	ensure.signature(arguments, [ String, Number, Descriptor, [Number, Descriptor, Value] ]);
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._direction = direction;
	this._relativeTo = relativeTo;

	if (typeof relativeAmount === "number") {
		if (relativeAmount < 0) this._direction *= -1;
		this._amount = Size.create(Math.abs(relativeAmount));
	}
	else {
		this._amount = relativeAmount;
	}
};
Descriptor.extend(Me);

Me.right = createFn(X_DIMENSION, PLUS);
Me.down = createFn(Y_DIMENSION, PLUS);
Me.left = createFn(X_DIMENSION, MINUS);
Me.up = createFn(Y_DIMENSION, MINUS);

function createFn(dimension, direction) {
	return function create(relativeTo, relativeAmount) {
		return new Me(dimension, direction, relativeTo, relativeAmount);
	};
}

Me.prototype.plus = function plus(amount) {
	if (this._dimension === X_DIMENSION) return Me.right(this, amount);
	else return Me.down(this, amount);
};

Me.prototype.minus = function minus(amount) {
	if (this._dimension === Y_DIMENSION) return Me.left(this, amount);
	else return Me.up(this, amount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var baseValue = this._relativeTo.value();
	var relativeValue = this._amount.value();

	if (this._direction === PLUS) return baseValue.plus(relativeValue);
	else return baseValue.minus(relativeValue);
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "number") return createPosition(this, arg);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var base = this._relativeTo.toString();
	if (this._amount.equals(Size.create(0))) return base;

	var relation = this._amount.toString();
	if (this._dimension === X_DIMENSION) relation += (this._direction === PLUS) ? " to right of " : " to left of ";
	else relation += (this._direction === PLUS) ? " below " : " above ";

	return relation + base;
};

function createPosition(self, value) {
	if (self._dimension === X_DIMENSION) return Position.x(value);
	else return Position.y(value);
}

},{"../util/ensure.js":16,"../values/pixels.js":19,"../values/position.js":20,"../values/size.js":21,"../values/value.js":22,"./descriptor.js":1,"./element_size.js":4}],6:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Size = require("../values/size.js");
var Descriptor = require("./descriptor.js");
var SizeDescriptor = require("./size_descriptor.js");
var Value = require("../values/value.js");
var SizeMultiple = require("./size_multiple.js");

var PLUS = 1;
var MINUS = -1;

var Me = module.exports = function RelativeSize(direction, relativeTo, amount) {
	ensure.signature(arguments, [ Number, Descriptor, [Number, Descriptor, Value] ]);

	this._direction = direction;
	this._relativeTo = relativeTo;

	if (typeof amount === "number") {
		this._amount = Size.create(Math.abs(amount));
		if (amount < 0) this._direction *= -1;
	}
	else {
		this._amount = amount;
	}
};
SizeDescriptor.extend(Me);

Me.larger = factoryFn(PLUS);
Me.smaller = factoryFn(MINUS);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var baseValue = this._relativeTo.value();
	var relativeValue = this._amount.value();

	if (this._direction === PLUS) return baseValue.plus(relativeValue);
	else return baseValue.minus(relativeValue);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var base = this._relativeTo.toString();
	if (this._amount.equals(Size.create(0))) return base;

	var relation = this._amount.toString();
	if (this._direction === PLUS) relation += " larger than ";
	else relation += " smaller than ";

	return relation + base;
};

function factoryFn(direction) {
	return function factory(relativeTo, amount) {
		return new Me(direction, relativeTo, amount);
	};
}
},{"../util/ensure.js":16,"../values/size.js":21,"../values/value.js":22,"./descriptor.js":1,"./size_descriptor.js":7,"./size_multiple.js":8}],7:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/*jshint newcap:false */
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");

function RelativeSize() {
	return require("./relative_size.js");   	// break circular dependency
}

function SizeMultiple() {
	return require("./size_multiple.js");   	// break circular dependency
}

var Me = module.exports = function SizeDescriptor() {
	ensure.unreachable("SizeDescriptor is abstract and should not be constructed directly.");
};
Descriptor.extend(Me);
Me.extend = oop.extendFn(Me);

Me.prototype.plus = function plus(amount) {
	return RelativeSize().larger(this, amount);
};

Me.prototype.minus = function minus(amount) {
	return RelativeSize().smaller(this, amount);
};

Me.prototype.times = function times(amount) {
	return SizeMultiple().create(this, amount);
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "number") return Size.create(arg);
};

},{"../util/ensure.js":16,"../util/oop.js":17,"../values/size.js":21,"./descriptor.js":1,"./relative_size.js":6,"./size_multiple.js":8}],8:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var SizeDescriptor = require("./size_descriptor.js");
var Size = require("../values/size.js");

var Me = module.exports = function SizeMultiple(relativeTo, multiple) {
	ensure.signature(arguments, [ Descriptor, Number ]);

	this._relativeTo = relativeTo;
	this._multiple = multiple;
};
SizeDescriptor.extend(Me);

Me.create = function create(relativeTo, multiple) {
	return new Me(relativeTo, multiple);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	return this._relativeTo.value().times(this._multiple);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var multiple = this._multiple;
	var base = this._relativeTo.toString();
	if (multiple === 1) return base;

	var desc;
	switch(multiple) {
		case 1/2: desc = "half of "; break;
		case 1/3: desc = "one-third of "; break;
		case 2/3: desc = "two-thirds of "; break;
		case 1/4: desc = "one-quarter of "; break;
		case 3/4: desc = "three-quarters of "; break;
		case 1/5: desc = "one-fifth of "; break;
		case 2/5: desc = "two-fifths of "; break;
		case 3/5: desc = "three-fifths of "; break;
		case 4/5: desc = "four-fifths of "; break;
		case 1/6: desc = "one-sixth of "; break;
		case 5/6: desc = "five-sixths of "; break;
		case 1/8: desc = "one-eighth of "; break;
		case 3/8: desc = "three-eighths of "; break;
		case 5/8: desc = "five-eighths of "; break;
		case 7/8: desc = "seven-eighths of "; break;
		default:
			if (multiple > 1) desc = multiple + " times ";
			else desc = (multiple * 100) + "% of ";
	}

	return desc + base;
};
},{"../util/ensure.js":16,"../values/size.js":21,"./descriptor.js":1,"./size_descriptor.js":7}],9:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Position = require("../values/position.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ViewportEdge(position, frame) {
	var QFrame = require("../q_frame.js");    // break circular dependency
	ensure.signature(arguments, [ String, QFrame ]);
	ensure.that(
		position === TOP || position === RIGHT || position === BOTTOM || position === LEFT,
		"Unknown position: " + position
	);

	this._position = position;
	this._frame = frame;
};
Descriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

function factoryFn(position) {
	return function factory(frame) {
		return new Me(position, frame);
	};
}

Me.prototype.value = function() {
	ensure.signature(arguments, []);

	var Pixels = require("../values/pixels.js");

	var scroll = this._frame.getRawScrollPosition();
	var x = Position.x(scroll.x);
	var y = Position.y(scroll.y);

	switch(this._position) {
		case TOP: return y;
		case RIGHT: return x.plus(this._frame.viewport().width.value());
		case BOTTOM: return y.plus(this._frame.viewport().height.value());
		case LEFT: return x;

		default: ensure.unreachable();
	}
};

Me.prototype.convert = function(value, type) {
	if (type !== "number") return undefined;

	if (this._position === LEFT || this._position === RIGHT) return Position.x(value);
	if (this._position === TOP || this._position === BOTTOM) return Position.y(value);
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);
	return this._position + " edge of viewport";
};

},{"../q_frame.js":13,"../util/ensure.js":16,"../values/pixels.js":19,"../values/position.js":20,"./descriptor.js":1}],10:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var SizeDescriptor = require("./size_descriptor.js");
var Size = require("../values/size.js");
var RelativeSize = require("./relative_size.js");
var SizeMultiple = require("./size_multiple.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function PageSize(dimension, frame) {
	ensure.signature(arguments, [ String, Object ]);
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._frame = frame;
};
SizeDescriptor.extend(Me);

Me.x = factoryFn(X_DIMENSION);
Me.y = factoryFn(Y_DIMENSION);

Me.prototype.value = function() {
	// Width techniques I've tried: (Note: results are different in quirks mode)
	// documentElement.getBoundingClientRect().width
	//    works on Safari, Mobile Safari, Chrome, Firefox
	//    fails on IE 8, 9, 10: includes scrollbar
	// body.clientWidth
	// body.offsetWidth
	// body.getBoundingClientRect().width
	//    fails on all browsers: doesn't include margin
	// body.scrollWidth
	//    works on Safari, Mobile Safari, Chrome
	//    fails on Firefox, IE 8, 9, 10, 11: doesn't include margin
	// html.getBoundingClientRect().width
	// html.offsetWidth
	//    works on Safari, Mobile Safari, Chrome, Firefox
	//    fails on IE 8, 9, 10: includes scrollbar
	// html.clientWidth
	// html.scrollWidth
	//    WORKS! Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11
	// not yet tried: contentWindow.*

	// Height techniques I've tried: (Note that results are different in quirks mode)
	// documentElement.getBoundingClientRect().height
	//    works on IE 8, 9, 10, 11;
	//    fails on Safari, Mobile Safari, Chrome, Firefox: only includes height of content
	// body.clientHeight
	// body.offsetHeight
	// body.getBoundingClientRect().height
	//    fails on all browsers: only includes height of content
	// body getComputedStyle("height")
	//    fails on all browsers: IE8 returns "auto"; others only include height of content
	// body.scrollHeight
	//    works on Safari, Mobile Safari, Chrome;
	//    fails on Firefox, IE 8, 9, 10, 11: only includes height of content
	// documentElement.clientHeight, offsetHeight, scrollHeight
	//    no such property (undefined)
	// html.offsetHeight
	//    works on IE 8, 9, 10
	//    fails on IE 11, Safari, Mobile Safari, Chrome: only includes height of content
	// html.scrollHeight
	//    works on Firefox, IE 8, 9, 10, 11
	//    fails on Safari, Mobile Safari, Chrome: only includes height of content
	// html.clientHeight
	//    WORKS! Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11
	// not yet tried: contentWindow.*

	var html = this._frame.get("html").toDomElement();
	var value = (this._dimension === X_DIMENSION) ? html.clientWidth : html.clientHeight;
	return Size.create(value);
};

Me.prototype.toString = function() {
	var desc = (this._dimension === X_DIMENSION) ? "width" : "height";
	return desc + " of viewport";
};

function factoryFn(dimension) {
	return function factory(frame) {
		return new Me(dimension, frame);
	};
}
},{"../util/ensure.js":16,"../values/size.js":21,"./relative_size.js":6,"./size_descriptor.js":7,"./size_multiple.js":8}],11:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var camelcase = require("../vendor/camelcase-1.0.1-modified.js");
var shim = require("./util/shim.js");
var ElementEdge = require("./descriptors/element_edge.js");
var ElementCenter = require("./descriptors/element_center.js");
var ElementSize = require("./descriptors/element_size.js");

var Me = module.exports = function QElement(domElement, frame, nickname) {
	var QFrame = require("./q_frame.js");    // break circular dependency
	ensure.signature(arguments, [ Object, QFrame, String ]);

	this._domElement = domElement;
	this._nickname = nickname;

	this.frame = frame;

	// properties
	this.top = ElementEdge.top(this);
	this.right = ElementEdge.right(this);
	this.bottom = ElementEdge.bottom(this);
	this.left = ElementEdge.left(this);

	this.center = ElementCenter.x(this);
	this.middle = ElementCenter.y(this);

	this.width = ElementSize.x(this);
	this.height = ElementSize.y(this);
};

Me.prototype.assert = function assert(expected, message) {
	ensure.signature(arguments, [ Object, [undefined, String] ]);
	if (message === undefined) message = "Differences found";

	var diff = this.diff(expected);
	if (diff !== "") throw new Error(message + ":\n" + diff);
};

Me.prototype.diff = function diff(expected) {
	ensure.signature(arguments, [ Object ]);

	var result = [];
	var keys = shim.Object.keys(expected);
	var key, oneDiff, descriptor;
	for (var i = 0; i < keys.length; i++) {
		key = keys[i];
		descriptor = this[key];
		ensure.that(
				descriptor !== undefined,
				this + " doesn't have a property named '" + key + "'. Did you misspell it?"
		);
		oneDiff = descriptor.diff(expected[key]);
		if (oneDiff !== "") result.push(oneDiff);
	}

	return result.join("\n");
};

Me.prototype.getRawStyle = function getRawStyle(styleName) {
	ensure.signature(arguments, [ String ]);

	var styles;
	var result;

	// WORKAROUND IE 8: no getComputedStyle()
	if (window.getComputedStyle) {
		styles = window.getComputedStyle(this._domElement);
		result = styles.getPropertyValue(styleName);
	}
	else {
		styles = this._domElement.currentStyle;
		result = styles[camelcase(styleName)];
	}
	if (result === null || result === undefined) result = "";
	return result;
};

Me.prototype.getRawPosition = function getRawPosition() {
	ensure.signature(arguments, []);

	// WORKAROUND IE 8: No TextRectangle.height or .width
	var rect = this._domElement.getBoundingClientRect();
	return {
		left: rect.left,
		right: rect.right,
		width: rect.width !== undefined ? rect.width : rect.right - rect.left,

		top: rect.top,
		bottom: rect.bottom,
		height: rect.height !== undefined ? rect.height : rect.bottom - rect.top
	};
};

Me.prototype.toDomElement = function toDomElement() {
	ensure.signature(arguments, []);
	return this._domElement;
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return "'" + this._nickname + "'";
};

Me.prototype.equals = function equals(that) {
	ensure.signature(arguments, [ Me ]);
	return this._domElement === that._domElement;
};

},{"../vendor/camelcase-1.0.1-modified.js":23,"./descriptors/element_center.js":2,"./descriptors/element_edge.js":3,"./descriptors/element_size.js":4,"./q_frame.js":13,"./util/ensure.js":16,"./util/shim.js":18}],12:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var QElement = require("./q_element.js");

var Me = module.exports = function QElementList(nodeList, frame, nickname) {
	var QFrame = require("./q_frame.js");    // break circular dependency
	ensure.signature(arguments, [ Object, QFrame, String ]);

	this._nodeList = nodeList;
	this._frame = frame;
	this._nickname = nickname;
};

Me.prototype.length = function length() {
	ensure.signature(arguments, []);

	return this._nodeList.length;
};

Me.prototype.at = function at(requestedIndex, nickname) {
	ensure.signature(arguments, [ Number, [undefined, String] ]);

	var index = requestedIndex;
	var length = this.length();
	if (index < 0) index = length + index;

	ensure.that(
		index >= 0 && index < length,
		"'" + this._nickname + "'[" + requestedIndex + "] is out of bounds; list length is " + length
	);
	var element = this._nodeList[index];

	if (nickname === undefined) nickname = this._nickname + "[" + index + "]";
	return new QElement(element, this._frame, nickname);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return "'" + this._nickname + "' list";
};
},{"./q_element.js":11,"./q_frame.js":13,"./util/ensure.js":16}],13:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var shim = require("./util/shim.js");
var quixote = require("./quixote.js");
var QElement = require("./q_element.js");
var QElementList = require("./q_element_list.js");
var QViewport = require("./q_viewport.js");

var Me = module.exports = function QFrame(frameDom, scrollContainerDom) {
	ensure.signature(arguments, [ Object, Object ]);
	ensure.that(frameDom.tagName === "IFRAME", "QFrame DOM element must be an iframe");
	ensure.that(scrollContainerDom.tagName === "DIV", "Scroll container DOM element must be a div");

	this._domElement = frameDom;
	this._scrollContainer = scrollContainerDom;
	this._loaded = false;
	this._removed = false;
};

function loaded(self) {
	ensure.that(self._scrollContainer.childNodes[0] === self._domElement, "iframe must be embedded in the scroll container");
	self._loaded = true;
	self._document = self._domElement.contentDocument;
	self._originalBody = self._document.body.innerHTML;
}

Me.create = function create(parentElement, options, callback) {
	ensure.signature(arguments, [ Object, [ Object, Function ], [ undefined, Function ] ]);

	if (callback === undefined) {
		callback = options;
		options = {};
	}
	var width = options.width || 2000;
	var height = options.height || 2000;

	// WORKAROUND Mobile Safari 7.0.0: weird style results occur when both src and stylesheet are loaded (see test)
	ensure.that(
		!(options.src && options.stylesheet),
		"Cannot specify HTML URL and stylesheet URL simultaneously due to Mobile Safari issue"
	);

	// WORKAROUND Mobile Safari 7.0.0: Does not respect iframe width and height attributes
	// See also http://davidwalsh.name/scroll-iframes-ios
	var scrollContainer = document.createElement("div");
	//scrollContainer.setAttribute("style",
	//	"-webkit-overflow-scrolling: touch; " +
	//	"overflow-y: scroll; " +
	//	"width: " + width + "px; " +
	//	"height: " + height + "px;"
	//);

	var iframe = document.createElement("iframe");
	iframe.setAttribute("width", width);
	iframe.setAttribute("height", height);
	iframe.setAttribute("frameborder", "0");    // WORKAROUND IE 8: don't include frame border in position calcs

	if (options.src !== undefined) {
		iframe.setAttribute("src", options.src);
		shim.EventTarget.addEventListener(iframe, "load", onFrameLoad);
	}

	var frame = new Me(iframe, scrollContainer);
	scrollContainer.appendChild(iframe);
	parentElement.appendChild(scrollContainer);

	// WORKAROUND IE 8: ensure that the frame is in standards mode, not quirks mode.
	if (options.src === undefined) {
		shim.EventTarget.addEventListener(iframe, "load", onFrameLoad);
		var noQuirksMode = "<!DOCTYPE html>\n" +
			"<html>" +
			"<head></head><body></body>" +
			"</html>";
		iframe.contentWindow.document.open();
		iframe.contentWindow.document.write(noQuirksMode);
		iframe.contentWindow.document.close();
	}

	return frame;

	function onFrameLoad() {

		//console.log("FRAME LOAD");

		// WORKAROUND Mobile Safari 7.0.0, Safari 6.2.0, Chrome 38.0.2125: frame is loaded synchronously
		// We force it to be asynchronous here
		setTimeout(function() {
			loaded(frame);
			loadStylesheet(frame, options.stylesheet, function() {
				callback(null, frame);
			});
		}, 0);
	}
};

function loadStylesheet(self, url, callback) {
	ensure.signature(arguments, [ Me, [ undefined, String ], Function ]);
	if (url === undefined) return callback();

	var link = document.createElement("link");
	shim.EventTarget.addEventListener(link, "load", onLinkLoad);
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("href", url);

	shim.Document.head(self._document).appendChild(link);
	function onLinkLoad() {
		callback();
	}
}

Me.prototype.reset = function() {
	ensure.signature(arguments, []);
	ensureUsable(this);

	this._document.body.innerHTML = this._originalBody;
	if (quixote.browser.canScroll()) this.scroll(0, 0);
};

Me.prototype.toDomElement = function() {
	ensure.signature(arguments, []);
	ensureNotRemoved(this);

	return this._domElement;
};

Me.prototype.remove = function() {
	ensure.signature(arguments, []);
	ensureLoaded(this);
	if (this._removed) return;

	this._removed = true;

	var scrollContainer = this._domElement.parentNode;
	scrollContainer.parentNode.removeChild(scrollContainer);
};

Me.prototype.viewport = function() {
	ensure.signature(arguments, []);
	ensureUsable(this);

	return new QViewport(this);
};

Me.prototype.body = function() {
	ensure.signature(arguments, []);

	return this.get("body");
};

Me.prototype.add = function(html, nickname) {
	ensure.signature(arguments, [ String, [undefined, String] ]);
	if (nickname === undefined) nickname = html;
	ensureUsable(this);

	var tempElement = document.createElement("div");
	tempElement.innerHTML = html;
	ensure.that(
		tempElement.childNodes.length === 1,
		"Expected one element, but got " + tempElement.childNodes.length + " (" + html + ")"
	);

	var insertedElement = tempElement.childNodes[0];
	this._document.body.appendChild(insertedElement);
	return new QElement(insertedElement, this, nickname);
};

Me.prototype.get = function(selector, nickname) {
	ensure.signature(arguments, [ String, [undefined, String] ]);
	if (nickname === undefined) nickname = selector;
	ensureUsable(this);

	var nodes = this._document.querySelectorAll(selector);
	ensure.that(nodes.length === 1, "Expected one element to match '" + selector + "', but found " + nodes.length);
	return new QElement(nodes[0], this, nickname);
};

Me.prototype.getAll = function(selector, nickname) {
	ensure.signature(arguments, [ String, [undefined, String] ]);
	if (nickname === undefined) nickname = selector;

	return new QElementList(this._document.querySelectorAll(selector), this, nickname);
};

Me.prototype.scroll = function scroll(x, y) {
	ensure.signature(arguments, [ Number, Number ]);

	this._domElement.contentWindow.scroll(x, y);

	// WORKAROUND Mobile Safari 7.0.0: frame is not scrollable because it's already full size.
	// We can scroll the container, but that's not the same thing. We fail fast here on the
	// assumption that scrolling the container isn't enough.
	ensure.that(quixote.browser.canScroll(), "Quixote can't scroll this browser's test frame");
};

Me.prototype.getRawScrollPosition = function getRawScrollPosition() {
	ensure.signature(arguments, []);

	return {
		x: shim.Window.pageXOffset(this._domElement.contentWindow, this._document),
		y: shim.Window.pageYOffset(this._domElement.contentWindow, this._document)
	};
};

function ensureUsable(self) {
	ensureLoaded(self);
	ensureNotRemoved(self);
}

function ensureLoaded(self) {
	ensure.that(self._loaded, "QFrame not loaded: Wait for frame creation callback to execute before using frame");
}

function ensureNotRemoved(self) {
	ensure.that(!self._removed, "Attempted to use frame after it was removed");
}

},{"./q_element.js":11,"./q_element_list.js":12,"./q_viewport.js":14,"./quixote.js":15,"./util/ensure.js":16,"./util/shim.js":18}],14:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var ViewportSize = require("./descriptors/viewport_size.js");
var ViewportEdge = require("./descriptors/viewport_edge.js");

var Me = module.exports = function QViewport(frame) {
	var QFrame = require("./q_frame.js");   // break circular dependency
	ensure.signature(arguments, [ QFrame ]);

	// properties
	this.width = ViewportSize.x(frame);
	this.height = ViewportSize.y(frame);

	this.top = ViewportEdge.top(frame);
	this.right = ViewportEdge.right(frame);
	this.bottom = ViewportEdge.bottom(frame);
	this.left = ViewportEdge.left(frame);
};
},{"./descriptors/viewport_edge.js":9,"./descriptors/viewport_size.js":10,"./q_frame.js":13,"./util/ensure.js":16}],15:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var QFrame = require("./q_frame.js");

exports.createFrame = function(options, callback) {
	return QFrame.create(document.body, options, callback);
};

exports.browser = {};

exports.browser.canScroll = function canScroll() {
	ensure.signature(arguments, []);

	// It would be nice if this used feature detection rather than browser detection
	return (!isMobileSafari());
};

function isMobileSafari() {
	return navigator.userAgent.match(/(iPad|iPhone|iPod touch);/i);
}

},{"./q_frame.js":13,"./util/ensure.js":16}],16:[function(require,module,exports){
// Copyright (c) 2013-2014 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

// Runtime assertions for production code. (Contrast to assert.js, which is for test code.)

var shim = require("./shim.js");
var oop = require("./oop.js");

exports.that = function(variable, message) {
	if (message === undefined) message = "Expected condition to be true";

	if (variable === false) throw new EnsureException(exports.that, message);
	if (variable !== true) throw new EnsureException(exports.that, "Expected condition to be true or false");
};

exports.unreachable = function(message) {
	if (!message) message = "Unreachable code executed";

	throw new EnsureException(exports.unreachable, message);
};

exports.signature = function(args, signature, messages) {
	signature = signature || [];
	messages = messages || [];
	var expectedArgCount = signature.length;
	var actualArgCount = args.length;

	if (actualArgCount > expectedArgCount) {
		throw new EnsureException(
			exports.signature,
			"Function called with too many arguments: expected " + expectedArgCount + " but got " + actualArgCount
		);
	}

	var type, arg, name;
	for (var i = 0; i < signature.length; i++) {
		type = signature[i];
		arg = args[i];
		name = "Argument " + i;

		if (!shim.Array.isArray(type)) type = [ type ];
		if (!typeMatches(type, arg, name)) {
			var message = name + " expected " + explainType(type) + ", but was ";
			throw new EnsureException(exports.signature, message + explainArg(arg));
		}
	}
};

function typeMatches(type, arg) {
	for (var i = 0; i < type.length; i++) {
		if (oneTypeMatches(type[i], arg)) return true;
	}
	return false;

	function oneTypeMatches(type, arg) {
		switch (getType(arg)) {
			case "boolean": return type === Boolean;
			case "string": return type === String;
			case "number": return type === Number;
			case "array": return type === Array;
			case "function": return type === Function;
			case "object": return type === Object || arg instanceof type;
			case "undefined": return type === undefined;
			case "null": return type === null;
			case "NaN": return isNaN(type);

			default: exports.unreachable();
		}
	}
}

function explainType(type) {
	var joiner = "";
	var result = "";
	for (var i = 0; i < type.length; i++) {
		result += joiner + explainOneType(type[i]);
		joiner = (i === type.length - 2) ? ", or " : ", ";
	}
	return result;

	function explainOneType(type) {
		switch (type) {
			case Boolean: return "boolean";
			case String: return "string";
			case Number: return "number";
			case Array: return "array";
			case Function: return "function";
			case null: return "null";
			default:
				if (typeof type === "number" && isNaN(type)) return "NaN";
				else {
					return oop.className(type) + " instance";
				}
		}
	}
}

function explainArg(arg) {
	var type = getType(arg);
	if (type !== "object") return type;

	return oop.instanceName(arg) + " instance";
}

function getType(variable) {
	var type = typeof variable;
	if (variable === null) type = "null";
	if (shim.Array.isArray(variable)) type = "array";
	if (type === "number" && isNaN(variable)) type = "NaN";
	return type;
}


/*****/

var EnsureException = exports.EnsureException = function(fnToRemoveFromStackTrace, message) {
	if (Error.captureStackTrace) Error.captureStackTrace(this, fnToRemoveFromStackTrace);
	else this.stack = (new Error()).stack;
	this.message = message;
};
EnsureException.prototype = shim.Object.create(Error.prototype);
EnsureException.prototype.constructor = EnsureException;
EnsureException.prototype.name = "EnsureException";

},{"./oop.js":17,"./shim.js":18}],17:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

// can't use ensure.js due to circular dependency
var shim = require("./shim.js");

exports.className = function(constructor) {
	if (typeof constructor !== "function") throw new Error("Not a constructor");
	return shim.Function.name(constructor);
};

exports.instanceName = function(obj) {
	var prototype = shim.Object.getPrototypeOf(obj);
	if (prototype === null) return "<no prototype>";

	var constructor = prototype.constructor;
	if (constructor === undefined || constructor === null) return "<anon>";

	return shim.Function.name(constructor);
};

exports.extendFn = function extendFn(parentConstructor) {
	return function(childConstructor) {
		childConstructor.prototype = shim.Object.create(parentConstructor.prototype);
		childConstructor.prototype.constructor = childConstructor;
	};
};

exports.makeAbstract = function makeAbstract(constructor, methods) {
	var name = shim.Function.name(constructor);
	shim.Array.forEach(methods, function(method) {
		constructor.prototype[method] = function() {
			throw new Error(name + " subclasses must implement " + method + "() method");
		};
	});

	constructor.prototype.checkAbstractMethods = function checkAbstractMethods() {
		var unimplemented = [];
		var self = this;
		shim.Array.forEach(methods, function(name) {
			if (self[name] === constructor.prototype[name]) unimplemented.push(name + "()");
		});
		return unimplemented;
	};
};
},{"./shim.js":18}],18:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

exports.Array = {

	// WORKAROUND IE 8: no Array.isArray
	isArray: function isArray(thing) {
		if (Array.isArray) return Array.isArray(thing);

		return Object.prototype.toString.call(thing) === '[object Array]';
	},

	// WORKAROUND IE 8: no Array.forEach
	forEach: function forEach(obj, callback, thisArg) {
		/*jshint bitwise:false, eqeqeq:false, -W041:false */

		if (Array.prototype.forEach) return obj.forEach(callback, thisArg);

		// This workaround based on polyfill code from MDN:
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach

		// Production steps of ECMA-262, Edition 5, 15.4.4.18
		// Reference: http://es5.github.io/#x15.4.4.18

    var T, k;

    if (obj == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(obj);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
	}

};


exports.EventTarget = {

	// WORKAROUND IE8: no EventTarget.addEventListener()
	addEventListener: function addEventListener(element, event, callback) {
		if (element.addEventListener) return element.addEventListener(event, callback);

		element.attachEvent("on" + event, callback);
	}

};


exports.Document = {

	// WORKAROUND IE8: no document.head
	head: function head(doc) {
		if (doc.head) return doc.head;

		return doc.querySelector("head");
	}

};


exports.Function = {

	// WORKAROUND IE 8, IE 9, IE 10, IE 11: no function.name
	name: function name(fn) {
		if (fn.name) return fn.name;

		// Based on code by Jason Bunting et al, http://stackoverflow.com/a/332429
		var funcNameRegex = /function\s+(.{1,})\s*\(/;
		var results = (funcNameRegex).exec((fn).toString());
		return (results && results.length > 1) ? results[1] : "<anon>";
	},

};


exports.Object = {

	// WORKAROUND IE 8: no Object.create()
	create: function create(prototype) {
		if (Object.create) return Object.create(prototype);

		var Temp = function Temp() {};
		Temp.prototype = prototype;
		return new Temp();
	},

	// WORKAROUND IE 8: no Object.getPrototypeOf
	// Caution: Doesn't work on IE 8 if constructor has been changed, as is the case with a subclass.
	getPrototypeOf: function getPrototypeOf(obj) {
		if (Object.getPrototypeOf) return Object.getPrototypeOf(obj);

		var result = obj.constructor ? obj.constructor.prototype : null;
		return result || null;
	},

	// WORKAROUND IE 8: No Object.keys
	keys: function keys(obj) {
		if (Object.keys) return Object.keys(obj);

		// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
	  var hasOwnProperty = Object.prototype.hasOwnProperty,
	      hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
	      dontEnums = [
	        'toString',
	        'toLocaleString',
	        'valueOf',
	        'hasOwnProperty',
	        'isPrototypeOf',
	        'propertyIsEnumerable',
	        'constructor'
	      ],
	      dontEnumsLength = dontEnums.length;

	  if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
	    throw new TypeError('Object.keys called on non-object');
	  }

	  var result = [], prop, i;

	  for (prop in obj) {
	    if (hasOwnProperty.call(obj, prop)) {
	      result.push(prop);
	    }
	  }

	  if (hasDontEnumBug) {
	    for (i = 0; i < dontEnumsLength; i++) {
	      if (hasOwnProperty.call(obj, dontEnums[i])) {
	        result.push(dontEnums[i]);
	      }
	    }
	  }
	  return result;
	}

};


exports.Window = {

	// WORKAROUND IE 8: No Window.pageXOffset
	pageXOffset: function(window, document) {
		if (window.pageXOffset !== undefined) return window.pageXOffset;

		// Based on https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY
		var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
		return isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
	},


	// WORKAROUND IE 8: No Window.pageYOffset
	pageYOffset: function(window, document) {
		if (window.pageYOffset !== undefined) return window.pageYOffset;

		// Based on https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY
		var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
		return isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
	}

};
},{}],19:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");

var Me = module.exports = function Pixels(amount) {
	ensure.signature(arguments, [ Number ]);
	this._amount = amount;
};
Value.extend(Me);

Me.create = function create(amount) {
	return new Me(amount);
};

Me.prototype.compatibility = function compatibility() {
	return [ Me ];
};

Me.prototype.plus = Value.safe(function plus(operand) {
	return new Me(this._amount + operand._amount);
});

Me.prototype.minus = Value.safe(function minus(operand) {
	return new Me(this._amount - operand._amount);
});

Me.prototype.times = function times(operand) {
	ensure.signature(arguments, [ Number ]);

	return new Me(this._amount * operand);
};

Me.prototype.compare = Value.safe(function compare(operand) {
	var difference = this._amount - operand._amount;
	if (Math.abs(difference) <= 0.5) return 0;
	else return difference;
});

Me.prototype.diff = Value.safe(function diff(expected) {
	if (this.compare(expected) === 0) return "";

	var difference = Math.abs(this._amount - expected._amount);

	var desc = difference;
	if (difference * 100 !== Math.floor(difference * 100)) desc = "about " + difference.toFixed(2);
	return desc + "px";
});

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._amount + "px";
};

},{"../util/ensure.js":16,"./value.js":22}],20:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");
var Pixels = require("./pixels.js");
var Size = require("./size.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function Position(dimension, value) {
	ensure.signature(arguments, [ String, [Number, Pixels] ]);

	this._dimension = dimension;
	this._value = (typeof value === "number") ? Pixels.create(value) : value;
};
Value.extend(Me);

Me.x = function x(value) {
	return new Me(X_DIMENSION, value);
};

Me.y = function y(value) {
	return new Me(Y_DIMENSION, value);
};

Me.prototype.compatibility = function compatibility() {
	return [ Me, Size ];
};

Me.prototype.plus = Value.safe(function plus(operand) {
	ensureComparable(this, operand);
	return new Me(this._dimension, this._value.plus(operand.toPixels()));
});

Me.prototype.minus = Value.safe(function minus(operand) {
	if (operand instanceof Me) ensureComparable(this, operand);
	return new Me(this._dimension, this._value.minus(operand.toPixels()));
});

Me.prototype.diff = Value.safe(function diff(expected) {
	ensureComparable(this, expected);

	var actualValue = this._value;
	var expectedValue = expected._value;
	if (actualValue.equals(expectedValue)) return "";

	var direction;
	var comparison = actualValue.compare(expectedValue);
	if (this._dimension === X_DIMENSION) direction = comparison < 0 ? "further left" : "further right";
	else direction = comparison < 0 ? "higher" : "lower";

	return actualValue.diff(expectedValue) + " " + direction;
});

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return this._value.toString();
};

Me.prototype.toPixels = function toPixels() {
	ensure.signature(arguments, []);

	return this._value;
};

function ensureComparable(self, other) {
	if (other instanceof Me) {
		ensure.that(self._dimension === other._dimension, "Can't compare X dimension to Y dimension");
	}
}

},{"../util/ensure.js":16,"./pixels.js":19,"./size.js":21,"./value.js":22}],21:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");
var Pixels = require("./pixels.js");

var Me = module.exports = function Size(value) {
	ensure.signature(arguments, [ [Number, Pixels] ]);

	this._value = (typeof value === "number") ? Pixels.create(value) : value;
};
Value.extend(Me);

Me.create = function create(value) {
	return new Me(value);
};

Me.prototype.compatibility = function compatibility() {
	return [ Me ];
};

Me.prototype.plus = Value.safe(function plus(operand) {
	return new Me(this._value.plus(operand._value));
});

Me.prototype.minus = Value.safe(function minus(operand) {
	return new Me(this._value.minus(operand._value));
});

Me.prototype.times = function times(operand) {
	return new Me(this._value.times(operand));
};

Me.prototype.compare = Value.safe(function compare(that) {
	return this._value.compare(that._value);
});

Me.prototype.diff = Value.safe(function diff(expected) {
	var actualValue = this._value;
	var expectedValue = expected._value;

	if (actualValue.equals(expectedValue)) return "";

	var desc = actualValue.compare(expectedValue) > 0 ? " larger" : " smaller";
	return actualValue.diff(expectedValue) + desc;
});

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._value.toString();
};

Me.prototype.toPixels = function toPixels() {
	ensure.signature(arguments, []);
	return this._value;
};

},{"../util/ensure.js":16,"./pixels.js":19,"./value.js":22}],22:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var shim = require("../util/shim.js");

var Me = module.exports = function Value() {};
Me.extend = oop.extendFn(Me);
oop.makeAbstract(Me, [
	"diff",
	"toString",
	"compatibility"
]);

Me.safe = function safe(fn) {
	return function() {
		ensureCompatibility(this, this.compatibility(), arguments);
		return fn.apply(this, arguments);
	};
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);
	return this;
};

Me.prototype.equals = function equals(that) {
	return this.diff(that) === "";
};

function ensureCompatibility(self, compatible, args) {
	var arg;
	for (var i = 0; i < args.length; i++) {   // args is not an Array, can't use forEach
		arg = args[i];
		checkOneArg(self, compatible, arg);
	}
}

function checkOneArg(self, compatible, arg) {
	var type = typeof arg;
	if (arg === null) type = "null";
	if (type !== "object") throwError(type);

	for (var i = 0; i < compatible.length; i++) {
		if (arg instanceof compatible[i]) return;
	}
	throwError(oop.instanceName(arg));

	function throwError(type) {
		throw new Error(oop.instanceName(self) + " isn't compatible with " + type);
	}
}
},{"../util/ensure.js":16,"../util/oop.js":17,"../util/shim.js":18}],23:[function(require,module,exports){
'use strict';
module.exports = function (str) {
	if (str.length === 1) {
		return str;
	}

	return str
	.replace(/^[_.\- ]+/, '')
	.toLowerCase()
	.replace(/[_.\- ]+(\w|$)/g, function (m, p1) {
		return p1.toUpperCase();
	});
};

},{}]},{},[15])(15)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9kZXNjcmlwdG9yLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvZGVzY3JpcHRvcnMvZWxlbWVudF9jZW50ZXIuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9lbGVtZW50X2VkZ2UuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9lbGVtZW50X3NpemUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9yZWxhdGl2ZV9wb3NpdGlvbi5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL2Rlc2NyaXB0b3JzL3JlbGF0aXZlX3NpemUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9zaXplX2Rlc2NyaXB0b3IuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9zaXplX211bHRpcGxlLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvZGVzY3JpcHRvcnMvdmlld3BvcnRfZWRnZS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL2Rlc2NyaXB0b3JzL3ZpZXdwb3J0X3NpemUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9xX2VsZW1lbnQuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9xX2VsZW1lbnRfbGlzdC5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3FfZnJhbWUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9xX3ZpZXdwb3J0LmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvcXVpeG90ZS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3V0aWwvZW5zdXJlLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvdXRpbC9vb3AuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy91dGlsL3NoaW0uanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy92YWx1ZXMvcGl4ZWxzLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvdmFsdWVzL3Bvc2l0aW9uLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvdmFsdWVzL3NpemUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy92YWx1ZXMvdmFsdWUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3ZlbmRvci9jYW1lbGNhc2UtMS4wLjEtbW9kaWZpZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4uL3ZhbHVlcy92YWx1ZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBEZXNjcmlwdG9yKCkge307XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xub29wLm1ha2VBYnN0cmFjdChNZSwgW1xuXHRcInZhbHVlXCIsXG5cdFwidG9TdHJpbmdcIlxuXSk7XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHRleHBlY3RlZCA9IG5vcm1hbGl6ZVR5cGUodGhpcywgZXhwZWN0ZWQpO1xuXHR0cnkge1xuXHRcdHZhciBhY3R1YWxWYWx1ZSA9IHRoaXMudmFsdWUoKTtcblx0XHR2YXIgZXhwZWN0ZWRWYWx1ZSA9IGV4cGVjdGVkLnZhbHVlKCk7XG5cblx0XHRpZiAoYWN0dWFsVmFsdWUuZXF1YWxzKGV4cGVjdGVkVmFsdWUpKSByZXR1cm4gXCJcIjtcblxuXHRcdHZhciBkaWZmZXJlbmNlID0gYWN0dWFsVmFsdWUuZGlmZihleHBlY3RlZFZhbHVlKTtcblx0XHR2YXIgZXhwZWN0ZWREZXNjID0gZXhwZWN0ZWRWYWx1ZS50b1N0cmluZygpO1xuXHRcdGlmIChleHBlY3RlZCBpbnN0YW5jZW9mIE1lKSBleHBlY3RlZERlc2MgKz0gXCIgKFwiICsgZXhwZWN0ZWQgKyBcIilcIjtcblxuXHRcdHJldHVybiB0aGlzICsgXCIgd2FzIFwiICsgZGlmZmVyZW5jZSArIFwiIHRoYW4gZXhwZWN0ZWQuXFxuXCIgK1xuXHRcdFx0XCIgIEV4cGVjdGVkOiBcIiArIGV4cGVjdGVkRGVzYyArIFwiXFxuXCIgK1xuXHRcdFx0XCIgIEJ1dCB3YXM6ICBcIiArIGFjdHVhbFZhbHVlO1xuXHR9XG5cdGNhdGNoIChlcnIpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb21wYXJlIFwiICsgdGhpcyArIFwiIHRvIFwiICsgZXhwZWN0ZWQgKyBcIjogXCIgKyBlcnIubWVzc2FnZSk7XG5cdH1cbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0Ly8gVGhpcyBtZXRob2QgaXMgbWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBieSBzdWJjbGFzc2VzLiBJdCBzaG91bGQgcmV0dXJuICd1bmRlZmluZWQnIHdoZW4gYW4gYXJndW1lbnRcblx0Ly8gY2FuJ3QgYmUgY29udmVydGVkLiBJbiB0aGlzIGRlZmF1bHQgaW1wbGVtZW50YXRpb24sIG5vIGFyZ3VtZW50cyBjYW4gYmUgY29udmVydGVkLCBzbyB3ZSBhbHdheXNcblx0Ly8gcmV0dXJuICd1bmRlZmluZWQnLlxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdC8vIERlc2NyaXB0b3JzIGFyZW4ndCB2YWx1ZSBvYmplY3RzLiBUaGV5J3JlIG5ldmVyIGVxdWFsIHRvIGFueXRoaW5nLiBCdXQgc29tZXRpbWVzXG5cdC8vIHRoZXkncmUgdXNlZCBpbiB0aGUgc2FtZSBwbGFjZXMgdmFsdWUgb2JqZWN0cyBhcmUgdXNlZCwgYW5kIHRoaXMgbWV0aG9kIGdldHMgY2FsbGVkLlxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiBub3JtYWxpemVUeXBlKHNlbGYsIGV4cGVjdGVkKSB7XG5cdHZhciBleHBlY3RlZFR5cGUgPSB0eXBlb2YgZXhwZWN0ZWQ7XG5cdGlmIChleHBlY3RlZCA9PT0gbnVsbCkgZXhwZWN0ZWRUeXBlID0gXCJudWxsXCI7XG5cblx0aWYgKGV4cGVjdGVkVHlwZSA9PT0gXCJvYmplY3RcIiAmJiAoZXhwZWN0ZWQgaW5zdGFuY2VvZiBNZSB8fCBleHBlY3RlZCBpbnN0YW5jZW9mIFZhbHVlKSkgcmV0dXJuIGV4cGVjdGVkO1xuXG5cdGlmIChleHBlY3RlZCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY29tcGFyZSBcIiArIHNlbGYgKyBcIiB0byBcIiArIGV4cGVjdGVkICsgXCIuIERpZCB5b3UgbWlzc3BlbGwgYSBwcm9wZXJ0eSBuYW1lP1wiKTtcblx0fVxuXHRlbHNlIGlmIChleHBlY3RlZFR5cGUgPT09IFwib2JqZWN0XCIpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb21wYXJlIFwiICsgc2VsZiArIFwiIHRvIFwiICsgb29wLmluc3RhbmNlTmFtZShleHBlY3RlZCkgKyBcIiBpbnN0YW5jZXMuXCIpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdGV4cGVjdGVkID0gc2VsZi5jb252ZXJ0KGV4cGVjdGVkLCBleHBlY3RlZFR5cGUpO1xuXHRcdGlmIChleHBlY3RlZCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb21wYXJlIFwiICsgc2VsZiArIFwiIHRvIFwiICsgZXhwZWN0ZWRUeXBlICsgXCIuXCIpO1xuXHR9XG5cblx0cmV0dXJuIGV4cGVjdGVkO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcbnZhciBSZWxhdGl2ZVBvc2l0aW9uID0gcmVxdWlyZShcIi4vcmVsYXRpdmVfcG9zaXRpb24uanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudENlbnRlcihkaW1lbnNpb24sIGVsZW1lbnQpIHtcblx0dmFyIFFFbGVtZW50ID0gcmVxdWlyZShcIi4uL3FfZWxlbWVudC5qc1wiKTsgICAgLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIFFFbGVtZW50IF0pO1xuXHRlbnN1cmUudGhhdChkaW1lbnNpb24gPT09IFhfRElNRU5TSU9OIHx8IGRpbWVuc2lvbiA9PT0gWV9ESU1FTlNJT04sIFwiVW5yZWNvZ25pemVkIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS54ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuXHRyZXR1cm4gbmV3IE1lKFhfRElNRU5TSU9OLCBlbGVtZW50KTtcbn07XG5cbk1lLnkgPSBmdW5jdGlvbihlbGVtZW50KSB7XG5cdHJldHVybiBuZXcgTWUoWV9ESU1FTlNJT04sIGVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBmdW5jdGlvbiBwbHVzKGFtb3VudCkge1xuXHRpZiAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgcmV0dXJuIFJlbGF0aXZlUG9zaXRpb24ucmlnaHQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbi5kb3duKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBmdW5jdGlvbiBtaW51cyhhbW91bnQpIHtcblx0aWYgKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uLmxlZnQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbi51cCh0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIHBvc2l0aW9uID0gdGhpcy5fZWxlbWVudC5nZXRSYXdQb3NpdGlvbigpO1xuXG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZXR1cm4gUG9zaXRpb24ueChwb3NpdGlvbi5sZWZ0ICsgKChwb3NpdGlvbi5yaWdodCAtIHBvc2l0aW9uLmxlZnQpIC8gMikpO1xuXHRlbHNlIHJldHVybiBQb3NpdGlvbi55KHBvc2l0aW9uLnRvcCArICgocG9zaXRpb24uYm90dG9tIC0gcG9zaXRpb24udG9wKSAvIDIpKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHJldHVybiAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgPyBQb3NpdGlvbi54KGFyZykgOiBQb3NpdGlvbi55KGFyZyk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgZGVzY3JpcHRpb24gPSAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgPyBcImNlbnRlclwiIDogXCJtaWRkbGVcIjtcblx0cmV0dXJuIGRlc2NyaXB0aW9uICsgXCIgb2YgXCIgKyB0aGlzLl9lbGVtZW50O1xufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xudmFyIFJlbGF0aXZlUG9zaXRpb24gPSByZXF1aXJlKFwiLi9yZWxhdGl2ZV9wb3NpdGlvbi5qc1wiKTtcbnZhciBEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvci5qc1wiKTtcbnZhciBFbGVtZW50U2l6ZSA9IHJlcXVpcmUoXCIuL2VsZW1lbnRfc2l6ZS5qc1wiKTtcblxudmFyIFRPUCA9IFwidG9wXCI7XG52YXIgUklHSFQgPSBcInJpZ2h0XCI7XG52YXIgQk9UVE9NID0gXCJib3R0b21cIjtcbnZhciBMRUZUID0gXCJsZWZ0XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudEVkZ2UoZWxlbWVudCwgcG9zaXRpb24pIHtcblx0dmFyIFFFbGVtZW50ID0gcmVxdWlyZShcIi4uL3FfZWxlbWVudC5qc1wiKTsgICAgICAvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbICBRRWxlbWVudCwgU3RyaW5nIF0pO1xuXHRlbnN1cmUudGhhdChcblx0XHRwb3NpdGlvbiA9PT0gVE9QIHx8IHBvc2l0aW9uID09PSBSSUdIVCB8fCBwb3NpdGlvbiA9PT0gQk9UVE9NIHx8IHBvc2l0aW9uID09PSBMRUZULFxuXHRcdFwiVW5rbm93biBwb3NpdGlvbjogXCIgKyBwb3NpdGlvblxuXHQpO1xuXG5cdHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuXHR0aGlzLl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xufTtcbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUudG9wID0gZmFjdG9yeUZuKFRPUCk7XG5NZS5yaWdodCA9IGZhY3RvcnlGbihSSUdIVCk7XG5NZS5ib3R0b20gPSBmYWN0b3J5Rm4oQk9UVE9NKTtcbk1lLmxlZnQgPSBmYWN0b3J5Rm4oTEVGVCk7XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gZnVuY3Rpb24gcGx1cyhhbW91bnQpIHtcblx0aWYgKHRoaXMuX3Bvc2l0aW9uID09PSBSSUdIVCB8fCB0aGlzLl9wb3NpdGlvbiA9PT0gTEVGVCkgcmV0dXJuIFJlbGF0aXZlUG9zaXRpb24ucmlnaHQodGhpcywgYW1vdW50KTtcblx0aWYgKHRoaXMuX3Bvc2l0aW9uID09PSBUT1AgfHwgdGhpcy5fcG9zaXRpb24gPT09IEJPVFRPTSkgcmV0dXJuIFJlbGF0aXZlUG9zaXRpb24uZG93bih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gZnVuY3Rpb24gbWludXMoYW1vdW50KSB7XG5cdGlmICh0aGlzLl9wb3NpdGlvbiA9PT0gUklHSFQgfHwgdGhpcy5fcG9zaXRpb24gPT09IExFRlQpIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uLmxlZnQodGhpcywgYW1vdW50KTtcblx0aWYgKHRoaXMuX3Bvc2l0aW9uID09PSBUT1AgfHwgdGhpcy5fcG9zaXRpb24gPT09IEJPVFRPTSkgcmV0dXJuIFJlbGF0aXZlUG9zaXRpb24udXAodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBlZGdlID0gdGhpcy5fZWxlbWVudC5nZXRSYXdQb3NpdGlvbigpW3RoaXMuX3Bvc2l0aW9uXTtcblx0dmFyIHNjcm9sbCA9IHRoaXMuX2VsZW1lbnQuZnJhbWUuZ2V0UmF3U2Nyb2xsUG9zaXRpb24oKTtcblx0cmV0dXJuIGNyZWF0ZVBvc2l0aW9uKHRoaXMsIGVkZ2UsIHNjcm9sbCk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoYXJnLCB0eXBlKSB7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiKSByZXR1cm4gY3JlYXRlUG9zaXRpb24odGhpcywgYXJnLCB7IHg6IDAsIHk6IDAgfSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX3Bvc2l0aW9uICsgXCIgZWRnZSBvZiBcIiArIHRoaXMuX2VsZW1lbnQ7XG59O1xuXG5mdW5jdGlvbiBmYWN0b3J5Rm4ocG9zaXRpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkoZWxlbWVudCkge1xuXHRcdHJldHVybiBuZXcgTWUoZWxlbWVudCwgcG9zaXRpb24pO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQb3NpdGlvbihzZWxmLCB2YWx1ZSwgc2Nyb2xsUG9zKSB7XG5cdGlmIChzZWxmLl9wb3NpdGlvbiA9PT0gUklHSFQgfHwgc2VsZi5fcG9zaXRpb24gPT09IExFRlQpIHJldHVybiBQb3NpdGlvbi54KHZhbHVlICsgc2Nyb2xsUG9zLngpO1xuXHRlbHNlIHJldHVybiBQb3NpdGlvbi55KHZhbHVlICsgc2Nyb2xsUG9zLnkpO1xufSIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBTaXplRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL3NpemVfZGVzY3JpcHRvci5qc1wiKTtcbnZhciBTaXplID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9zaXplLmpzXCIpO1xudmFyIFJlbGF0aXZlU2l6ZSA9IHJlcXVpcmUoXCIuL3JlbGF0aXZlX3NpemUuanNcIik7XG52YXIgU2l6ZU11bHRpcGxlID0gcmVxdWlyZShcIi4vc2l6ZV9tdWx0aXBsZS5qc1wiKTtcblxudmFyIFhfRElNRU5TSU9OID0gXCJ3aWR0aFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJoZWlnaHRcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBFbGVtZW50U2l6ZShkaW1lbnNpb24sIGVsZW1lbnQpIHtcblx0dmFyIFFFbGVtZW50ID0gcmVxdWlyZShcIi4uL3FfZWxlbWVudC5qc1wiKTsgICAgLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIFFFbGVtZW50IF0pO1xuXHRlbnN1cmUudGhhdChkaW1lbnNpb24gPT09IFhfRElNRU5TSU9OIHx8IGRpbWVuc2lvbiA9PT0gWV9ESU1FTlNJT04sIFwiVW5yZWNvZ25pemVkIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG59O1xuU2l6ZURlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUueCA9IGZhY3RvcnlGbihYX0RJTUVOU0lPTik7XG5NZS55ID0gZmFjdG9yeUZuKFlfRElNRU5TSU9OKTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIHBvc2l0aW9uID0gdGhpcy5fZWxlbWVudC5nZXRSYXdQb3NpdGlvbigpO1xuXHRyZXR1cm4gU2l6ZS5jcmVhdGUocG9zaXRpb25bdGhpcy5fZGltZW5zaW9uXSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gdGhpcy5fZGltZW5zaW9uICsgXCIgb2YgXCIgKyB0aGlzLl9lbGVtZW50O1xufTtcblxuZnVuY3Rpb24gZmFjdG9yeUZuKGRpbWVuc2lvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gZmFjdG9yeShlbGVtZW50KSB7XG5cdFx0cmV0dXJuIG5ldyBNZShkaW1lbnNpb24sIGVsZW1lbnQpO1xuXHR9O1xufSIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgVmFsdWUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3ZhbHVlLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG52YXIgUGl4ZWxzID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9waXhlbHMuanNcIik7XG52YXIgRWxlbWVudFNpemUgPSByZXF1aXJlKFwiLi9lbGVtZW50X3NpemUuanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG52YXIgUExVUyA9IDE7XG52YXIgTUlOVVMgPSAtMTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBSZWxhdGl2ZVBvc2l0aW9uKGRpbWVuc2lvbiwgZGlyZWN0aW9uLCByZWxhdGl2ZVRvLCByZWxhdGl2ZUFtb3VudCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIE51bWJlciwgRGVzY3JpcHRvciwgW051bWJlciwgRGVzY3JpcHRvciwgVmFsdWVdIF0pO1xuXHRlbnN1cmUudGhhdChkaW1lbnNpb24gPT09IFhfRElNRU5TSU9OIHx8IGRpbWVuc2lvbiA9PT0gWV9ESU1FTlNJT04sIFwiVW5yZWNvZ25pemVkIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuXHR0aGlzLl9yZWxhdGl2ZVRvID0gcmVsYXRpdmVUbztcblxuXHRpZiAodHlwZW9mIHJlbGF0aXZlQW1vdW50ID09PSBcIm51bWJlclwiKSB7XG5cdFx0aWYgKHJlbGF0aXZlQW1vdW50IDwgMCkgdGhpcy5fZGlyZWN0aW9uICo9IC0xO1xuXHRcdHRoaXMuX2Ftb3VudCA9IFNpemUuY3JlYXRlKE1hdGguYWJzKHJlbGF0aXZlQW1vdW50KSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0dGhpcy5fYW1vdW50ID0gcmVsYXRpdmVBbW91bnQ7XG5cdH1cbn07XG5EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnJpZ2h0ID0gY3JlYXRlRm4oWF9ESU1FTlNJT04sIFBMVVMpO1xuTWUuZG93biA9IGNyZWF0ZUZuKFlfRElNRU5TSU9OLCBQTFVTKTtcbk1lLmxlZnQgPSBjcmVhdGVGbihYX0RJTUVOU0lPTiwgTUlOVVMpO1xuTWUudXAgPSBjcmVhdGVGbihZX0RJTUVOU0lPTiwgTUlOVVMpO1xuXG5mdW5jdGlvbiBjcmVhdGVGbihkaW1lbnNpb24sIGRpcmVjdGlvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gY3JlYXRlKHJlbGF0aXZlVG8sIHJlbGF0aXZlQW1vdW50KSB7XG5cdFx0cmV0dXJuIG5ldyBNZShkaW1lbnNpb24sIGRpcmVjdGlvbiwgcmVsYXRpdmVUbywgcmVsYXRpdmVBbW91bnQpO1xuXHR9O1xufVxuXG5NZS5wcm90b3R5cGUucGx1cyA9IGZ1bmN0aW9uIHBsdXMoYW1vdW50KSB7XG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZXR1cm4gTWUucmlnaHQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gTWUuZG93bih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gZnVuY3Rpb24gbWludXMoYW1vdW50KSB7XG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFlfRElNRU5TSU9OKSByZXR1cm4gTWUubGVmdCh0aGlzLCBhbW91bnQpO1xuXHRlbHNlIHJldHVybiBNZS51cCh0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2VWYWx1ZSA9IHRoaXMuX3JlbGF0aXZlVG8udmFsdWUoKTtcblx0dmFyIHJlbGF0aXZlVmFsdWUgPSB0aGlzLl9hbW91bnQudmFsdWUoKTtcblxuXHRpZiAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSByZXR1cm4gYmFzZVZhbHVlLnBsdXMocmVsYXRpdmVWYWx1ZSk7XG5cdGVsc2UgcmV0dXJuIGJhc2VWYWx1ZS5taW51cyhyZWxhdGl2ZVZhbHVlKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHJldHVybiBjcmVhdGVQb3NpdGlvbih0aGlzLCBhcmcpO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2UgPSB0aGlzLl9yZWxhdGl2ZVRvLnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9hbW91bnQuZXF1YWxzKFNpemUuY3JlYXRlKDApKSkgcmV0dXJuIGJhc2U7XG5cblx0dmFyIHJlbGF0aW9uID0gdGhpcy5fYW1vdW50LnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZWxhdGlvbiArPSAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSA/IFwiIHRvIHJpZ2h0IG9mIFwiIDogXCIgdG8gbGVmdCBvZiBcIjtcblx0ZWxzZSByZWxhdGlvbiArPSAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSA/IFwiIGJlbG93IFwiIDogXCIgYWJvdmUgXCI7XG5cblx0cmV0dXJuIHJlbGF0aW9uICsgYmFzZTtcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZVBvc2l0aW9uKHNlbGYsIHZhbHVlKSB7XG5cdGlmIChzZWxmLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZXR1cm4gUG9zaXRpb24ueCh2YWx1ZSk7XG5cdGVsc2UgcmV0dXJuIFBvc2l0aW9uLnkodmFsdWUpO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgU2l6ZURlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9zaXplX2Rlc2NyaXB0b3IuanNcIik7XG52YXIgVmFsdWUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3ZhbHVlLmpzXCIpO1xudmFyIFNpemVNdWx0aXBsZSA9IHJlcXVpcmUoXCIuL3NpemVfbXVsdGlwbGUuanNcIik7XG5cbnZhciBQTFVTID0gMTtcbnZhciBNSU5VUyA9IC0xO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFJlbGF0aXZlU2l6ZShkaXJlY3Rpb24sIHJlbGF0aXZlVG8sIGFtb3VudCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBOdW1iZXIsIERlc2NyaXB0b3IsIFtOdW1iZXIsIERlc2NyaXB0b3IsIFZhbHVlXSBdKTtcblxuXHR0aGlzLl9kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG5cdHRoaXMuX3JlbGF0aXZlVG8gPSByZWxhdGl2ZVRvO1xuXG5cdGlmICh0eXBlb2YgYW1vdW50ID09PSBcIm51bWJlclwiKSB7XG5cdFx0dGhpcy5fYW1vdW50ID0gU2l6ZS5jcmVhdGUoTWF0aC5hYnMoYW1vdW50KSk7XG5cdFx0aWYgKGFtb3VudCA8IDApIHRoaXMuX2RpcmVjdGlvbiAqPSAtMTtcblx0fVxuXHRlbHNlIHtcblx0XHR0aGlzLl9hbW91bnQgPSBhbW91bnQ7XG5cdH1cbn07XG5TaXplRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS5sYXJnZXIgPSBmYWN0b3J5Rm4oUExVUyk7XG5NZS5zbWFsbGVyID0gZmFjdG9yeUZuKE1JTlVTKTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2VWYWx1ZSA9IHRoaXMuX3JlbGF0aXZlVG8udmFsdWUoKTtcblx0dmFyIHJlbGF0aXZlVmFsdWUgPSB0aGlzLl9hbW91bnQudmFsdWUoKTtcblxuXHRpZiAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSByZXR1cm4gYmFzZVZhbHVlLnBsdXMocmVsYXRpdmVWYWx1ZSk7XG5cdGVsc2UgcmV0dXJuIGJhc2VWYWx1ZS5taW51cyhyZWxhdGl2ZVZhbHVlKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBiYXNlID0gdGhpcy5fcmVsYXRpdmVUby50b1N0cmluZygpO1xuXHRpZiAodGhpcy5fYW1vdW50LmVxdWFscyhTaXplLmNyZWF0ZSgwKSkpIHJldHVybiBiYXNlO1xuXG5cdHZhciByZWxhdGlvbiA9IHRoaXMuX2Ftb3VudC50b1N0cmluZygpO1xuXHRpZiAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSByZWxhdGlvbiArPSBcIiBsYXJnZXIgdGhhbiBcIjtcblx0ZWxzZSByZWxhdGlvbiArPSBcIiBzbWFsbGVyIHRoYW4gXCI7XG5cblx0cmV0dXJuIHJlbGF0aW9uICsgYmFzZTtcbn07XG5cbmZ1bmN0aW9uIGZhY3RvcnlGbihkaXJlY3Rpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkocmVsYXRpdmVUbywgYW1vdW50KSB7XG5cdFx0cmV0dXJuIG5ldyBNZShkaXJlY3Rpb24sIHJlbGF0aXZlVG8sIGFtb3VudCk7XG5cdH07XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cbi8qanNoaW50IG5ld2NhcDpmYWxzZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG5cbmZ1bmN0aW9uIFJlbGF0aXZlU2l6ZSgpIHtcblx0cmV0dXJuIHJlcXVpcmUoXCIuL3JlbGF0aXZlX3NpemUuanNcIik7ICAgXHQvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG59XG5cbmZ1bmN0aW9uIFNpemVNdWx0aXBsZSgpIHtcblx0cmV0dXJuIHJlcXVpcmUoXCIuL3NpemVfbXVsdGlwbGUuanNcIik7ICAgXHQvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG59XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU2l6ZURlc2NyaXB0b3IoKSB7XG5cdGVuc3VyZS51bnJlYWNoYWJsZShcIlNpemVEZXNjcmlwdG9yIGlzIGFic3RyYWN0IGFuZCBzaG91bGQgbm90IGJlIGNvbnN0cnVjdGVkIGRpcmVjdGx5LlwiKTtcbn07XG5EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IGZ1bmN0aW9uIHBsdXMoYW1vdW50KSB7XG5cdHJldHVybiBSZWxhdGl2ZVNpemUoKS5sYXJnZXIodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5taW51cyA9IGZ1bmN0aW9uIG1pbnVzKGFtb3VudCkge1xuXHRyZXR1cm4gUmVsYXRpdmVTaXplKCkuc21hbGxlcih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnRpbWVzID0gZnVuY3Rpb24gdGltZXMoYW1vdW50KSB7XG5cdHJldHVybiBTaXplTXVsdGlwbGUoKS5jcmVhdGUodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHJldHVybiBTaXplLmNyZWF0ZShhcmcpO1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvci5qc1wiKTtcbnZhciBTaXplRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL3NpemVfZGVzY3JpcHRvci5qc1wiKTtcbnZhciBTaXplID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9zaXplLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFNpemVNdWx0aXBsZShyZWxhdGl2ZVRvLCBtdWx0aXBsZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBEZXNjcmlwdG9yLCBOdW1iZXIgXSk7XG5cblx0dGhpcy5fcmVsYXRpdmVUbyA9IHJlbGF0aXZlVG87XG5cdHRoaXMuX211bHRpcGxlID0gbXVsdGlwbGU7XG59O1xuU2l6ZURlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKHJlbGF0aXZlVG8sIG11bHRpcGxlKSB7XG5cdHJldHVybiBuZXcgTWUocmVsYXRpdmVUbywgbXVsdGlwbGUpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX3JlbGF0aXZlVG8udmFsdWUoKS50aW1lcyh0aGlzLl9tdWx0aXBsZSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgbXVsdGlwbGUgPSB0aGlzLl9tdWx0aXBsZTtcblx0dmFyIGJhc2UgPSB0aGlzLl9yZWxhdGl2ZVRvLnRvU3RyaW5nKCk7XG5cdGlmIChtdWx0aXBsZSA9PT0gMSkgcmV0dXJuIGJhc2U7XG5cblx0dmFyIGRlc2M7XG5cdHN3aXRjaChtdWx0aXBsZSkge1xuXHRcdGNhc2UgMS8yOiBkZXNjID0gXCJoYWxmIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDEvMzogZGVzYyA9IFwib25lLXRoaXJkIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDIvMzogZGVzYyA9IFwidHdvLXRoaXJkcyBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAxLzQ6IGRlc2MgPSBcIm9uZS1xdWFydGVyIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDMvNDogZGVzYyA9IFwidGhyZWUtcXVhcnRlcnMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMS81OiBkZXNjID0gXCJvbmUtZmlmdGggb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMi81OiBkZXNjID0gXCJ0d28tZmlmdGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDMvNTogZGVzYyA9IFwidGhyZWUtZmlmdGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDQvNTogZGVzYyA9IFwiZm91ci1maWZ0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMS82OiBkZXNjID0gXCJvbmUtc2l4dGggb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgNS82OiBkZXNjID0gXCJmaXZlLXNpeHRocyBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAxLzg6IGRlc2MgPSBcIm9uZS1laWdodGggb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMy84OiBkZXNjID0gXCJ0aHJlZS1laWdodGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDUvODogZGVzYyA9IFwiZml2ZS1laWdodGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDcvODogZGVzYyA9IFwic2V2ZW4tZWlnaHRocyBvZiBcIjsgYnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGlmIChtdWx0aXBsZSA+IDEpIGRlc2MgPSBtdWx0aXBsZSArIFwiIHRpbWVzIFwiO1xuXHRcdFx0ZWxzZSBkZXNjID0gKG11bHRpcGxlICogMTAwKSArIFwiJSBvZiBcIjtcblx0fVxuXG5cdHJldHVybiBkZXNjICsgYmFzZTtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcblxudmFyIFRPUCA9IFwidG9wXCI7XG52YXIgUklHSFQgPSBcInJpZ2h0XCI7XG52YXIgQk9UVE9NID0gXCJib3R0b21cIjtcbnZhciBMRUZUID0gXCJsZWZ0XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gVmlld3BvcnRFZGdlKHBvc2l0aW9uLCBmcmFtZSkge1xuXHR2YXIgUUZyYW1lID0gcmVxdWlyZShcIi4uL3FfZnJhbWUuanNcIik7ICAgIC8vIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY3lcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBRRnJhbWUgXSk7XG5cdGVuc3VyZS50aGF0KFxuXHRcdHBvc2l0aW9uID09PSBUT1AgfHwgcG9zaXRpb24gPT09IFJJR0hUIHx8IHBvc2l0aW9uID09PSBCT1RUT00gfHwgcG9zaXRpb24gPT09IExFRlQsXG5cdFx0XCJVbmtub3duIHBvc2l0aW9uOiBcIiArIHBvc2l0aW9uXG5cdCk7XG5cblx0dGhpcy5fcG9zaXRpb24gPSBwb3NpdGlvbjtcblx0dGhpcy5fZnJhbWUgPSBmcmFtZTtcbn07XG5EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnRvcCA9IGZhY3RvcnlGbihUT1ApO1xuTWUucmlnaHQgPSBmYWN0b3J5Rm4oUklHSFQpO1xuTWUuYm90dG9tID0gZmFjdG9yeUZuKEJPVFRPTSk7XG5NZS5sZWZ0ID0gZmFjdG9yeUZuKExFRlQpO1xuXG5mdW5jdGlvbiBmYWN0b3J5Rm4ocG9zaXRpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkoZnJhbWUpIHtcblx0XHRyZXR1cm4gbmV3IE1lKHBvc2l0aW9uLCBmcmFtZSk7XG5cdH07XG59XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBQaXhlbHMgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3BpeGVscy5qc1wiKTtcblxuXHR2YXIgc2Nyb2xsID0gdGhpcy5fZnJhbWUuZ2V0UmF3U2Nyb2xsUG9zaXRpb24oKTtcblx0dmFyIHggPSBQb3NpdGlvbi54KHNjcm9sbC54KTtcblx0dmFyIHkgPSBQb3NpdGlvbi55KHNjcm9sbC55KTtcblxuXHRzd2l0Y2godGhpcy5fcG9zaXRpb24pIHtcblx0XHRjYXNlIFRPUDogcmV0dXJuIHk7XG5cdFx0Y2FzZSBSSUdIVDogcmV0dXJuIHgucGx1cyh0aGlzLl9mcmFtZS52aWV3cG9ydCgpLndpZHRoLnZhbHVlKCkpO1xuXHRcdGNhc2UgQk9UVE9NOiByZXR1cm4geS5wbHVzKHRoaXMuX2ZyYW1lLnZpZXdwb3J0KCkuaGVpZ2h0LnZhbHVlKCkpO1xuXHRcdGNhc2UgTEVGVDogcmV0dXJuIHg7XG5cblx0XHRkZWZhdWx0OiBlbnN1cmUudW5yZWFjaGFibGUoKTtcblx0fVxufTtcblxuTWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbih2YWx1ZSwgdHlwZSkge1xuXHRpZiAodHlwZSAhPT0gXCJudW1iZXJcIikgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRpZiAodGhpcy5fcG9zaXRpb24gPT09IExFRlQgfHwgdGhpcy5fcG9zaXRpb24gPT09IFJJR0hUKSByZXR1cm4gUG9zaXRpb24ueCh2YWx1ZSk7XG5cdGlmICh0aGlzLl9wb3NpdGlvbiA9PT0gVE9QIHx8IHRoaXMuX3Bvc2l0aW9uID09PSBCT1RUT00pIHJldHVybiBQb3NpdGlvbi55KHZhbHVlKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fcG9zaXRpb24gKyBcIiBlZGdlIG9mIHZpZXdwb3J0XCI7XG59O1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFNpemVEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vc2l6ZV9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG52YXIgUmVsYXRpdmVTaXplID0gcmVxdWlyZShcIi4vcmVsYXRpdmVfc2l6ZS5qc1wiKTtcbnZhciBTaXplTXVsdGlwbGUgPSByZXF1aXJlKFwiLi9zaXplX211bHRpcGxlLmpzXCIpO1xuXG52YXIgWF9ESU1FTlNJT04gPSBcInhcIjtcbnZhciBZX0RJTUVOU0lPTiA9IFwieVwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFBhZ2VTaXplKGRpbWVuc2lvbiwgZnJhbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBPYmplY3QgXSk7XG5cdGVuc3VyZS50aGF0KGRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04gfHwgZGltZW5zaW9uID09PSBZX0RJTUVOU0lPTiwgXCJVbnJlY29nbml6ZWQgZGltZW5zaW9uOiBcIiArIGRpbWVuc2lvbik7XG5cblx0dGhpcy5fZGltZW5zaW9uID0gZGltZW5zaW9uO1xuXHR0aGlzLl9mcmFtZSA9IGZyYW1lO1xufTtcblNpemVEZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnggPSBmYWN0b3J5Rm4oWF9ESU1FTlNJT04pO1xuTWUueSA9IGZhY3RvcnlGbihZX0RJTUVOU0lPTik7XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuXHQvLyBXaWR0aCB0ZWNobmlxdWVzIEkndmUgdHJpZWQ6IChOb3RlOiByZXN1bHRzIGFyZSBkaWZmZXJlbnQgaW4gcXVpcmtzIG1vZGUpXG5cdC8vIGRvY3VtZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuXHQvLyAgICB3b3JrcyBvbiBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZSwgRmlyZWZveFxuXHQvLyAgICBmYWlscyBvbiBJRSA4LCA5LCAxMDogaW5jbHVkZXMgc2Nyb2xsYmFyXG5cdC8vIGJvZHkuY2xpZW50V2lkdGhcblx0Ly8gYm9keS5vZmZzZXRXaWR0aFxuXHQvLyBib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoXG5cdC8vICAgIGZhaWxzIG9uIGFsbCBicm93c2VyczogZG9lc24ndCBpbmNsdWRlIG1hcmdpblxuXHQvLyBib2R5LnNjcm9sbFdpZHRoXG5cdC8vICAgIHdvcmtzIG9uIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lXG5cdC8vICAgIGZhaWxzIG9uIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogZG9lc24ndCBpbmNsdWRlIG1hcmdpblxuXHQvLyBodG1sLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoXG5cdC8vIGh0bWwub2Zmc2V0V2lkdGhcblx0Ly8gICAgd29ya3Mgb24gU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3hcblx0Ly8gICAgZmFpbHMgb24gSUUgOCwgOSwgMTA6IGluY2x1ZGVzIHNjcm9sbGJhclxuXHQvLyBodG1sLmNsaWVudFdpZHRoXG5cdC8vIGh0bWwuc2Nyb2xsV2lkdGhcblx0Ly8gICAgV09SS1MhIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTFcblx0Ly8gbm90IHlldCB0cmllZDogY29udGVudFdpbmRvdy4qXG5cblx0Ly8gSGVpZ2h0IHRlY2huaXF1ZXMgSSd2ZSB0cmllZDogKE5vdGUgdGhhdCByZXN1bHRzIGFyZSBkaWZmZXJlbnQgaW4gcXVpcmtzIG1vZGUpXG5cdC8vIGRvY3VtZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHRcblx0Ly8gICAgd29ya3Mgb24gSUUgOCwgOSwgMTAsIDExO1xuXHQvLyAgICBmYWlscyBvbiBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZSwgRmlyZWZveDogb25seSBpbmNsdWRlcyBoZWlnaHQgb2YgY29udGVudFxuXHQvLyBib2R5LmNsaWVudEhlaWdodFxuXHQvLyBib2R5Lm9mZnNldEhlaWdodFxuXHQvLyBib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodFxuXHQvLyAgICBmYWlscyBvbiBhbGwgYnJvd3NlcnM6IG9ubHkgaW5jbHVkZXMgaGVpZ2h0IG9mIGNvbnRlbnRcblx0Ly8gYm9keSBnZXRDb21wdXRlZFN0eWxlKFwiaGVpZ2h0XCIpXG5cdC8vICAgIGZhaWxzIG9uIGFsbCBicm93c2VyczogSUU4IHJldHVybnMgXCJhdXRvXCI7IG90aGVycyBvbmx5IGluY2x1ZGUgaGVpZ2h0IG9mIGNvbnRlbnRcblx0Ly8gYm9keS5zY3JvbGxIZWlnaHRcblx0Ly8gICAgd29ya3Mgb24gU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWU7XG5cdC8vICAgIGZhaWxzIG9uIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogb25seSBpbmNsdWRlcyBoZWlnaHQgb2YgY29udGVudFxuXHQvLyBkb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LCBvZmZzZXRIZWlnaHQsIHNjcm9sbEhlaWdodFxuXHQvLyAgICBubyBzdWNoIHByb3BlcnR5ICh1bmRlZmluZWQpXG5cdC8vIGh0bWwub2Zmc2V0SGVpZ2h0XG5cdC8vICAgIHdvcmtzIG9uIElFIDgsIDksIDEwXG5cdC8vICAgIGZhaWxzIG9uIElFIDExLCBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZTogb25seSBpbmNsdWRlcyBoZWlnaHQgb2YgY29udGVudFxuXHQvLyBodG1sLnNjcm9sbEhlaWdodFxuXHQvLyAgICB3b3JrcyBvbiBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTFcblx0Ly8gICAgZmFpbHMgb24gU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWU6IG9ubHkgaW5jbHVkZXMgaGVpZ2h0IG9mIGNvbnRlbnRcblx0Ly8gaHRtbC5jbGllbnRIZWlnaHRcblx0Ly8gICAgV09SS1MhIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTFcblx0Ly8gbm90IHlldCB0cmllZDogY29udGVudFdpbmRvdy4qXG5cblx0dmFyIGh0bWwgPSB0aGlzLl9mcmFtZS5nZXQoXCJodG1sXCIpLnRvRG9tRWxlbWVudCgpO1xuXHR2YXIgdmFsdWUgPSAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgPyBodG1sLmNsaWVudFdpZHRoIDogaHRtbC5jbGllbnRIZWlnaHQ7XG5cdHJldHVybiBTaXplLmNyZWF0ZSh2YWx1ZSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcblx0dmFyIGRlc2MgPSAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgPyBcIndpZHRoXCIgOiBcImhlaWdodFwiO1xuXHRyZXR1cm4gZGVzYyArIFwiIG9mIHZpZXdwb3J0XCI7XG59O1xuXG5mdW5jdGlvbiBmYWN0b3J5Rm4oZGltZW5zaW9uKSB7XG5cdHJldHVybiBmdW5jdGlvbiBmYWN0b3J5KGZyYW1lKSB7XG5cdFx0cmV0dXJuIG5ldyBNZShkaW1lbnNpb24sIGZyYW1lKTtcblx0fTtcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBjYW1lbGNhc2UgPSByZXF1aXJlKFwiLi4vdmVuZG9yL2NhbWVsY2FzZS0xLjAuMS1tb2RpZmllZC5qc1wiKTtcbnZhciBzaGltID0gcmVxdWlyZShcIi4vdXRpbC9zaGltLmpzXCIpO1xudmFyIEVsZW1lbnRFZGdlID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvZWxlbWVudF9lZGdlLmpzXCIpO1xudmFyIEVsZW1lbnRDZW50ZXIgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9lbGVtZW50X2NlbnRlci5qc1wiKTtcbnZhciBFbGVtZW50U2l6ZSA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL2VsZW1lbnRfc2l6ZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBRRWxlbWVudChkb21FbGVtZW50LCBmcmFtZSwgbmlja25hbWUpIHtcblx0dmFyIFFGcmFtZSA9IHJlcXVpcmUoXCIuL3FfZnJhbWUuanNcIik7ICAgIC8vIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY3lcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0LCBRRnJhbWUsIFN0cmluZyBdKTtcblxuXHR0aGlzLl9kb21FbGVtZW50ID0gZG9tRWxlbWVudDtcblx0dGhpcy5fbmlja25hbWUgPSBuaWNrbmFtZTtcblxuXHR0aGlzLmZyYW1lID0gZnJhbWU7XG5cblx0Ly8gcHJvcGVydGllc1xuXHR0aGlzLnRvcCA9IEVsZW1lbnRFZGdlLnRvcCh0aGlzKTtcblx0dGhpcy5yaWdodCA9IEVsZW1lbnRFZGdlLnJpZ2h0KHRoaXMpO1xuXHR0aGlzLmJvdHRvbSA9IEVsZW1lbnRFZGdlLmJvdHRvbSh0aGlzKTtcblx0dGhpcy5sZWZ0ID0gRWxlbWVudEVkZ2UubGVmdCh0aGlzKTtcblxuXHR0aGlzLmNlbnRlciA9IEVsZW1lbnRDZW50ZXIueCh0aGlzKTtcblx0dGhpcy5taWRkbGUgPSBFbGVtZW50Q2VudGVyLnkodGhpcyk7XG5cblx0dGhpcy53aWR0aCA9IEVsZW1lbnRTaXplLngodGhpcyk7XG5cdHRoaXMuaGVpZ2h0ID0gRWxlbWVudFNpemUueSh0aGlzKTtcbn07XG5cbk1lLnByb3RvdHlwZS5hc3NlcnQgPSBmdW5jdGlvbiBhc3NlcnQoZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0LCBbdW5kZWZpbmVkLCBTdHJpbmddIF0pO1xuXHRpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkKSBtZXNzYWdlID0gXCJEaWZmZXJlbmNlcyBmb3VuZFwiO1xuXG5cdHZhciBkaWZmID0gdGhpcy5kaWZmKGV4cGVjdGVkKTtcblx0aWYgKGRpZmYgIT09IFwiXCIpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlICsgXCI6XFxuXCIgKyBkaWZmKTtcbn07XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBPYmplY3QgXSk7XG5cblx0dmFyIHJlc3VsdCA9IFtdO1xuXHR2YXIga2V5cyA9IHNoaW0uT2JqZWN0LmtleXMoZXhwZWN0ZWQpO1xuXHR2YXIga2V5LCBvbmVEaWZmLCBkZXNjcmlwdG9yO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRrZXkgPSBrZXlzW2ldO1xuXHRcdGRlc2NyaXB0b3IgPSB0aGlzW2tleV07XG5cdFx0ZW5zdXJlLnRoYXQoXG5cdFx0XHRcdGRlc2NyaXB0b3IgIT09IHVuZGVmaW5lZCxcblx0XHRcdFx0dGhpcyArIFwiIGRvZXNuJ3QgaGF2ZSBhIHByb3BlcnR5IG5hbWVkICdcIiArIGtleSArIFwiJy4gRGlkIHlvdSBtaXNzcGVsbCBpdD9cIlxuXHRcdCk7XG5cdFx0b25lRGlmZiA9IGRlc2NyaXB0b3IuZGlmZihleHBlY3RlZFtrZXldKTtcblx0XHRpZiAob25lRGlmZiAhPT0gXCJcIikgcmVzdWx0LnB1c2gob25lRGlmZik7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0LmpvaW4oXCJcXG5cIik7XG59O1xuXG5NZS5wcm90b3R5cGUuZ2V0UmF3U3R5bGUgPSBmdW5jdGlvbiBnZXRSYXdTdHlsZShzdHlsZU5hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nIF0pO1xuXG5cdHZhciBzdHlsZXM7XG5cdHZhciByZXN1bHQ7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBnZXRDb21wdXRlZFN0eWxlKClcblx0aWYgKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKSB7XG5cdFx0c3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5fZG9tRWxlbWVudCk7XG5cdFx0cmVzdWx0ID0gc3R5bGVzLmdldFByb3BlcnR5VmFsdWUoc3R5bGVOYW1lKTtcblx0fVxuXHRlbHNlIHtcblx0XHRzdHlsZXMgPSB0aGlzLl9kb21FbGVtZW50LmN1cnJlbnRTdHlsZTtcblx0XHRyZXN1bHQgPSBzdHlsZXNbY2FtZWxjYXNlKHN0eWxlTmFtZSldO1xuXHR9XG5cdGlmIChyZXN1bHQgPT09IG51bGwgfHwgcmVzdWx0ID09PSB1bmRlZmluZWQpIHJlc3VsdCA9IFwiXCI7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG5NZS5wcm90b3R5cGUuZ2V0UmF3UG9zaXRpb24gPSBmdW5jdGlvbiBnZXRSYXdQb3NpdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IE5vIFRleHRSZWN0YW5nbGUuaGVpZ2h0IG9yIC53aWR0aFxuXHR2YXIgcmVjdCA9IHRoaXMuX2RvbUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdHJldHVybiB7XG5cdFx0bGVmdDogcmVjdC5sZWZ0LFxuXHRcdHJpZ2h0OiByZWN0LnJpZ2h0LFxuXHRcdHdpZHRoOiByZWN0LndpZHRoICE9PSB1bmRlZmluZWQgPyByZWN0LndpZHRoIDogcmVjdC5yaWdodCAtIHJlY3QubGVmdCxcblxuXHRcdHRvcDogcmVjdC50b3AsXG5cdFx0Ym90dG9tOiByZWN0LmJvdHRvbSxcblx0XHRoZWlnaHQ6IHJlY3QuaGVpZ2h0ICE9PSB1bmRlZmluZWQgPyByZWN0LmhlaWdodCA6IHJlY3QuYm90dG9tIC0gcmVjdC50b3Bcblx0fTtcbn07XG5cbk1lLnByb3RvdHlwZS50b0RvbUVsZW1lbnQgPSBmdW5jdGlvbiB0b0RvbUVsZW1lbnQoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl9kb21FbGVtZW50O1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiBcIidcIiArIHRoaXMuX25pY2tuYW1lICsgXCInXCI7XG59O1xuXG5NZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKHRoYXQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUgXSk7XG5cdHJldHVybiB0aGlzLl9kb21FbGVtZW50ID09PSB0aGF0Ll9kb21FbGVtZW50O1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFFFbGVtZW50ID0gcmVxdWlyZShcIi4vcV9lbGVtZW50LmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFFFbGVtZW50TGlzdChub2RlTGlzdCwgZnJhbWUsIG5pY2tuYW1lKSB7XG5cdHZhciBRRnJhbWUgPSByZXF1aXJlKFwiLi9xX2ZyYW1lLmpzXCIpOyAgICAvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgUUZyYW1lLCBTdHJpbmcgXSk7XG5cblx0dGhpcy5fbm9kZUxpc3QgPSBub2RlTGlzdDtcblx0dGhpcy5fZnJhbWUgPSBmcmFtZTtcblx0dGhpcy5fbmlja25hbWUgPSBuaWNrbmFtZTtcbn07XG5cbk1lLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiBsZW5ndGgoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX25vZGVMaXN0Lmxlbmd0aDtcbn07XG5cbk1lLnByb3RvdHlwZS5hdCA9IGZ1bmN0aW9uIGF0KHJlcXVlc3RlZEluZGV4LCBuaWNrbmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBOdW1iZXIsIFt1bmRlZmluZWQsIFN0cmluZ10gXSk7XG5cblx0dmFyIGluZGV4ID0gcmVxdWVzdGVkSW5kZXg7XG5cdHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aCgpO1xuXHRpZiAoaW5kZXggPCAwKSBpbmRleCA9IGxlbmd0aCArIGluZGV4O1xuXG5cdGVuc3VyZS50aGF0KFxuXHRcdGluZGV4ID49IDAgJiYgaW5kZXggPCBsZW5ndGgsXG5cdFx0XCInXCIgKyB0aGlzLl9uaWNrbmFtZSArIFwiJ1tcIiArIHJlcXVlc3RlZEluZGV4ICsgXCJdIGlzIG91dCBvZiBib3VuZHM7IGxpc3QgbGVuZ3RoIGlzIFwiICsgbGVuZ3RoXG5cdCk7XG5cdHZhciBlbGVtZW50ID0gdGhpcy5fbm9kZUxpc3RbaW5kZXhdO1xuXG5cdGlmIChuaWNrbmFtZSA9PT0gdW5kZWZpbmVkKSBuaWNrbmFtZSA9IHRoaXMuX25pY2tuYW1lICsgXCJbXCIgKyBpbmRleCArIFwiXVwiO1xuXHRyZXR1cm4gbmV3IFFFbGVtZW50KGVsZW1lbnQsIHRoaXMuX2ZyYW1lLCBuaWNrbmFtZSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gXCInXCIgKyB0aGlzLl9uaWNrbmFtZSArIFwiJyBsaXN0XCI7XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIHNoaW0gPSByZXF1aXJlKFwiLi91dGlsL3NoaW0uanNcIik7XG52YXIgcXVpeG90ZSA9IHJlcXVpcmUoXCIuL3F1aXhvdGUuanNcIik7XG52YXIgUUVsZW1lbnQgPSByZXF1aXJlKFwiLi9xX2VsZW1lbnQuanNcIik7XG52YXIgUUVsZW1lbnRMaXN0ID0gcmVxdWlyZShcIi4vcV9lbGVtZW50X2xpc3QuanNcIik7XG52YXIgUVZpZXdwb3J0ID0gcmVxdWlyZShcIi4vcV92aWV3cG9ydC5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBRRnJhbWUoZnJhbWVEb20sIHNjcm9sbENvbnRhaW5lckRvbSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBPYmplY3QsIE9iamVjdCBdKTtcblx0ZW5zdXJlLnRoYXQoZnJhbWVEb20udGFnTmFtZSA9PT0gXCJJRlJBTUVcIiwgXCJRRnJhbWUgRE9NIGVsZW1lbnQgbXVzdCBiZSBhbiBpZnJhbWVcIik7XG5cdGVuc3VyZS50aGF0KHNjcm9sbENvbnRhaW5lckRvbS50YWdOYW1lID09PSBcIkRJVlwiLCBcIlNjcm9sbCBjb250YWluZXIgRE9NIGVsZW1lbnQgbXVzdCBiZSBhIGRpdlwiKTtcblxuXHR0aGlzLl9kb21FbGVtZW50ID0gZnJhbWVEb207XG5cdHRoaXMuX3Njcm9sbENvbnRhaW5lciA9IHNjcm9sbENvbnRhaW5lckRvbTtcblx0dGhpcy5fbG9hZGVkID0gZmFsc2U7XG5cdHRoaXMuX3JlbW92ZWQgPSBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIGxvYWRlZChzZWxmKSB7XG5cdGVuc3VyZS50aGF0KHNlbGYuX3Njcm9sbENvbnRhaW5lci5jaGlsZE5vZGVzWzBdID09PSBzZWxmLl9kb21FbGVtZW50LCBcImlmcmFtZSBtdXN0IGJlIGVtYmVkZGVkIGluIHRoZSBzY3JvbGwgY29udGFpbmVyXCIpO1xuXHRzZWxmLl9sb2FkZWQgPSB0cnVlO1xuXHRzZWxmLl9kb2N1bWVudCA9IHNlbGYuX2RvbUVsZW1lbnQuY29udGVudERvY3VtZW50O1xuXHRzZWxmLl9vcmlnaW5hbEJvZHkgPSBzZWxmLl9kb2N1bWVudC5ib2R5LmlubmVySFRNTDtcbn1cblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKHBhcmVudEVsZW1lbnQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgWyBPYmplY3QsIEZ1bmN0aW9uIF0sIFsgdW5kZWZpbmVkLCBGdW5jdGlvbiBdIF0pO1xuXG5cdGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0Y2FsbGJhY2sgPSBvcHRpb25zO1xuXHRcdG9wdGlvbnMgPSB7fTtcblx0fVxuXHR2YXIgd2lkdGggPSBvcHRpb25zLndpZHRoIHx8IDIwMDA7XG5cdHZhciBoZWlnaHQgPSBvcHRpb25zLmhlaWdodCB8fCAyMDAwO1xuXG5cdC8vIFdPUktBUk9VTkQgTW9iaWxlIFNhZmFyaSA3LjAuMDogd2VpcmQgc3R5bGUgcmVzdWx0cyBvY2N1ciB3aGVuIGJvdGggc3JjIGFuZCBzdHlsZXNoZWV0IGFyZSBsb2FkZWQgKHNlZSB0ZXN0KVxuXHRlbnN1cmUudGhhdChcblx0XHQhKG9wdGlvbnMuc3JjICYmIG9wdGlvbnMuc3R5bGVzaGVldCksXG5cdFx0XCJDYW5ub3Qgc3BlY2lmeSBIVE1MIFVSTCBhbmQgc3R5bGVzaGVldCBVUkwgc2ltdWx0YW5lb3VzbHkgZHVlIHRvIE1vYmlsZSBTYWZhcmkgaXNzdWVcIlxuXHQpO1xuXG5cdC8vIFdPUktBUk9VTkQgTW9iaWxlIFNhZmFyaSA3LjAuMDogRG9lcyBub3QgcmVzcGVjdCBpZnJhbWUgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzXG5cdC8vIFNlZSBhbHNvIGh0dHA6Ly9kYXZpZHdhbHNoLm5hbWUvc2Nyb2xsLWlmcmFtZXMtaW9zXG5cdHZhciBzY3JvbGxDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHQvL3Njcm9sbENvbnRhaW5lci5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLFxuXHQvL1x0XCItd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzogdG91Y2g7IFwiICtcblx0Ly9cdFwib3ZlcmZsb3cteTogc2Nyb2xsOyBcIiArXG5cdC8vXHRcIndpZHRoOiBcIiArIHdpZHRoICsgXCJweDsgXCIgK1xuXHQvL1x0XCJoZWlnaHQ6IFwiICsgaGVpZ2h0ICsgXCJweDtcIlxuXHQvLyk7XG5cblx0dmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCB3aWR0aCk7XG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblx0aWZyYW1lLnNldEF0dHJpYnV0ZShcImZyYW1lYm9yZGVyXCIsIFwiMFwiKTsgICAgLy8gV09SS0FST1VORCBJRSA4OiBkb24ndCBpbmNsdWRlIGZyYW1lIGJvcmRlciBpbiBwb3NpdGlvbiBjYWxjc1xuXG5cdGlmIChvcHRpb25zLnNyYyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0aWZyYW1lLnNldEF0dHJpYnV0ZShcInNyY1wiLCBvcHRpb25zLnNyYyk7XG5cdFx0c2hpbS5FdmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKGlmcmFtZSwgXCJsb2FkXCIsIG9uRnJhbWVMb2FkKTtcblx0fVxuXG5cdHZhciBmcmFtZSA9IG5ldyBNZShpZnJhbWUsIHNjcm9sbENvbnRhaW5lcik7XG5cdHNjcm9sbENvbnRhaW5lci5hcHBlbmRDaGlsZChpZnJhbWUpO1xuXHRwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHNjcm9sbENvbnRhaW5lcik7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBlbnN1cmUgdGhhdCB0aGUgZnJhbWUgaXMgaW4gc3RhbmRhcmRzIG1vZGUsIG5vdCBxdWlya3MgbW9kZS5cblx0aWYgKG9wdGlvbnMuc3JjID09PSB1bmRlZmluZWQpIHtcblx0XHRzaGltLkV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoaWZyYW1lLCBcImxvYWRcIiwgb25GcmFtZUxvYWQpO1xuXHRcdHZhciBub1F1aXJrc01vZGUgPSBcIjwhRE9DVFlQRSBodG1sPlxcblwiICtcblx0XHRcdFwiPGh0bWw+XCIgK1xuXHRcdFx0XCI8aGVhZD48L2hlYWQ+PGJvZHk+PC9ib2R5PlwiICtcblx0XHRcdFwiPC9odG1sPlwiO1xuXHRcdGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50Lm9wZW4oKTtcblx0XHRpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC53cml0ZShub1F1aXJrc01vZGUpO1xuXHRcdGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50LmNsb3NlKCk7XG5cdH1cblxuXHRyZXR1cm4gZnJhbWU7XG5cblx0ZnVuY3Rpb24gb25GcmFtZUxvYWQoKSB7XG5cblx0XHQvL2NvbnNvbGUubG9nKFwiRlJBTUUgTE9BRFwiKTtcblxuXHRcdC8vIFdPUktBUk9VTkQgTW9iaWxlIFNhZmFyaSA3LjAuMCwgU2FmYXJpIDYuMi4wLCBDaHJvbWUgMzguMC4yMTI1OiBmcmFtZSBpcyBsb2FkZWQgc3luY2hyb25vdXNseVxuXHRcdC8vIFdlIGZvcmNlIGl0IHRvIGJlIGFzeW5jaHJvbm91cyBoZXJlXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdGxvYWRlZChmcmFtZSk7XG5cdFx0XHRsb2FkU3R5bGVzaGVldChmcmFtZSwgb3B0aW9ucy5zdHlsZXNoZWV0LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgZnJhbWUpO1xuXHRcdFx0fSk7XG5cdFx0fSwgMCk7XG5cdH1cbn07XG5cbmZ1bmN0aW9uIGxvYWRTdHlsZXNoZWV0KHNlbGYsIHVybCwgY2FsbGJhY2spIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUsIFsgdW5kZWZpbmVkLCBTdHJpbmcgXSwgRnVuY3Rpb24gXSk7XG5cdGlmICh1cmwgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGNhbGxiYWNrKCk7XG5cblx0dmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcblx0c2hpbS5FdmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKGxpbmssIFwibG9hZFwiLCBvbkxpbmtMb2FkKTtcblx0bGluay5zZXRBdHRyaWJ1dGUoXCJyZWxcIiwgXCJzdHlsZXNoZWV0XCIpO1xuXHRsaW5rLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJ0ZXh0L2Nzc1wiKTtcblx0bGluay5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIHVybCk7XG5cblx0c2hpbS5Eb2N1bWVudC5oZWFkKHNlbGYuX2RvY3VtZW50KS5hcHBlbmRDaGlsZChsaW5rKTtcblx0ZnVuY3Rpb24gb25MaW5rTG9hZCgpIHtcblx0XHRjYWxsYmFjaygpO1xuXHR9XG59XG5cbk1lLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dGhpcy5fZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSB0aGlzLl9vcmlnaW5hbEJvZHk7XG5cdGlmIChxdWl4b3RlLmJyb3dzZXIuY2FuU2Nyb2xsKCkpIHRoaXMuc2Nyb2xsKDAsIDApO1xufTtcblxuTWUucHJvdG90eXBlLnRvRG9tRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRlbnN1cmVOb3RSZW1vdmVkKHRoaXMpO1xuXG5cdHJldHVybiB0aGlzLl9kb21FbGVtZW50O1xufTtcblxuTWUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRlbnN1cmVMb2FkZWQodGhpcyk7XG5cdGlmICh0aGlzLl9yZW1vdmVkKSByZXR1cm47XG5cblx0dGhpcy5fcmVtb3ZlZCA9IHRydWU7XG5cblx0dmFyIHNjcm9sbENvbnRhaW5lciA9IHRoaXMuX2RvbUVsZW1lbnQucGFyZW50Tm9kZTtcblx0c2Nyb2xsQ29udGFpbmVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2Nyb2xsQ29udGFpbmVyKTtcbn07XG5cbk1lLnByb3RvdHlwZS52aWV3cG9ydCA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0cmV0dXJuIG5ldyBRVmlld3BvcnQodGhpcyk7XG59O1xuXG5NZS5wcm90b3R5cGUuYm9keSA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiB0aGlzLmdldChcImJvZHlcIik7XG59O1xuXG5NZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oaHRtbCwgbmlja25hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBbdW5kZWZpbmVkLCBTdHJpbmddIF0pO1xuXHRpZiAobmlja25hbWUgPT09IHVuZGVmaW5lZCkgbmlja25hbWUgPSBodG1sO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dmFyIHRlbXBFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0dGVtcEVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbDtcblx0ZW5zdXJlLnRoYXQoXG5cdFx0dGVtcEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPT09IDEsXG5cdFx0XCJFeHBlY3RlZCBvbmUgZWxlbWVudCwgYnV0IGdvdCBcIiArIHRlbXBFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoICsgXCIgKFwiICsgaHRtbCArIFwiKVwiXG5cdCk7XG5cblx0dmFyIGluc2VydGVkRWxlbWVudCA9IHRlbXBFbGVtZW50LmNoaWxkTm9kZXNbMF07XG5cdHRoaXMuX2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW5zZXJ0ZWRFbGVtZW50KTtcblx0cmV0dXJuIG5ldyBRRWxlbWVudChpbnNlcnRlZEVsZW1lbnQsIHRoaXMsIG5pY2tuYW1lKTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihzZWxlY3Rvciwgbmlja25hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBbdW5kZWZpbmVkLCBTdHJpbmddIF0pO1xuXHRpZiAobmlja25hbWUgPT09IHVuZGVmaW5lZCkgbmlja25hbWUgPSBzZWxlY3Rvcjtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHZhciBub2RlcyA9IHRoaXMuX2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuXHRlbnN1cmUudGhhdChub2Rlcy5sZW5ndGggPT09IDEsIFwiRXhwZWN0ZWQgb25lIGVsZW1lbnQgdG8gbWF0Y2ggJ1wiICsgc2VsZWN0b3IgKyBcIicsIGJ1dCBmb3VuZCBcIiArIG5vZGVzLmxlbmd0aCk7XG5cdHJldHVybiBuZXcgUUVsZW1lbnQobm9kZXNbMF0sIHRoaXMsIG5pY2tuYW1lKTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihzZWxlY3Rvciwgbmlja25hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBbdW5kZWZpbmVkLCBTdHJpbmddIF0pO1xuXHRpZiAobmlja25hbWUgPT09IHVuZGVmaW5lZCkgbmlja25hbWUgPSBzZWxlY3RvcjtcblxuXHRyZXR1cm4gbmV3IFFFbGVtZW50TGlzdCh0aGlzLl9kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSwgdGhpcywgbmlja25hbWUpO1xufTtcblxuTWUucHJvdG90eXBlLnNjcm9sbCA9IGZ1bmN0aW9uIHNjcm9sbCh4LCB5KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE51bWJlciwgTnVtYmVyIF0pO1xuXG5cdHRoaXMuX2RvbUVsZW1lbnQuY29udGVudFdpbmRvdy5zY3JvbGwoeCwgeSk7XG5cblx0Ly8gV09SS0FST1VORCBNb2JpbGUgU2FmYXJpIDcuMC4wOiBmcmFtZSBpcyBub3Qgc2Nyb2xsYWJsZSBiZWNhdXNlIGl0J3MgYWxyZWFkeSBmdWxsIHNpemUuXG5cdC8vIFdlIGNhbiBzY3JvbGwgdGhlIGNvbnRhaW5lciwgYnV0IHRoYXQncyBub3QgdGhlIHNhbWUgdGhpbmcuIFdlIGZhaWwgZmFzdCBoZXJlIG9uIHRoZVxuXHQvLyBhc3N1bXB0aW9uIHRoYXQgc2Nyb2xsaW5nIHRoZSBjb250YWluZXIgaXNuJ3QgZW5vdWdoLlxuXHRlbnN1cmUudGhhdChxdWl4b3RlLmJyb3dzZXIuY2FuU2Nyb2xsKCksIFwiUXVpeG90ZSBjYW4ndCBzY3JvbGwgdGhpcyBicm93c2VyJ3MgdGVzdCBmcmFtZVwiKTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRSYXdTY3JvbGxQb3NpdGlvbiA9IGZ1bmN0aW9uIGdldFJhd1Njcm9sbFBvc2l0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiB7XG5cdFx0eDogc2hpbS5XaW5kb3cucGFnZVhPZmZzZXQodGhpcy5fZG9tRWxlbWVudC5jb250ZW50V2luZG93LCB0aGlzLl9kb2N1bWVudCksXG5cdFx0eTogc2hpbS5XaW5kb3cucGFnZVlPZmZzZXQodGhpcy5fZG9tRWxlbWVudC5jb250ZW50V2luZG93LCB0aGlzLl9kb2N1bWVudClcblx0fTtcbn07XG5cbmZ1bmN0aW9uIGVuc3VyZVVzYWJsZShzZWxmKSB7XG5cdGVuc3VyZUxvYWRlZChzZWxmKTtcblx0ZW5zdXJlTm90UmVtb3ZlZChzZWxmKTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlTG9hZGVkKHNlbGYpIHtcblx0ZW5zdXJlLnRoYXQoc2VsZi5fbG9hZGVkLCBcIlFGcmFtZSBub3QgbG9hZGVkOiBXYWl0IGZvciBmcmFtZSBjcmVhdGlvbiBjYWxsYmFjayB0byBleGVjdXRlIGJlZm9yZSB1c2luZyBmcmFtZVwiKTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlTm90UmVtb3ZlZChzZWxmKSB7XG5cdGVuc3VyZS50aGF0KCFzZWxmLl9yZW1vdmVkLCBcIkF0dGVtcHRlZCB0byB1c2UgZnJhbWUgYWZ0ZXIgaXQgd2FzIHJlbW92ZWRcIik7XG59XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBWaWV3cG9ydFNpemUgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy92aWV3cG9ydF9zaXplLmpzXCIpO1xudmFyIFZpZXdwb3J0RWRnZSA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL3ZpZXdwb3J0X2VkZ2UuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUVZpZXdwb3J0KGZyYW1lKSB7XG5cdHZhciBRRnJhbWUgPSByZXF1aXJlKFwiLi9xX2ZyYW1lLmpzXCIpOyAgIC8vIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY3lcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgUUZyYW1lIF0pO1xuXG5cdC8vIHByb3BlcnRpZXNcblx0dGhpcy53aWR0aCA9IFZpZXdwb3J0U2l6ZS54KGZyYW1lKTtcblx0dGhpcy5oZWlnaHQgPSBWaWV3cG9ydFNpemUueShmcmFtZSk7XG5cblx0dGhpcy50b3AgPSBWaWV3cG9ydEVkZ2UudG9wKGZyYW1lKTtcblx0dGhpcy5yaWdodCA9IFZpZXdwb3J0RWRnZS5yaWdodChmcmFtZSk7XG5cdHRoaXMuYm90dG9tID0gVmlld3BvcnRFZGdlLmJvdHRvbShmcmFtZSk7XG5cdHRoaXMubGVmdCA9IFZpZXdwb3J0RWRnZS5sZWZ0KGZyYW1lKTtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUUZyYW1lID0gcmVxdWlyZShcIi4vcV9mcmFtZS5qc1wiKTtcblxuZXhwb3J0cy5jcmVhdGVGcmFtZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG5cdHJldHVybiBRRnJhbWUuY3JlYXRlKGRvY3VtZW50LmJvZHksIG9wdGlvbnMsIGNhbGxiYWNrKTtcbn07XG5cbmV4cG9ydHMuYnJvd3NlciA9IHt9O1xuXG5leHBvcnRzLmJyb3dzZXIuY2FuU2Nyb2xsID0gZnVuY3Rpb24gY2FuU2Nyb2xsKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdC8vIEl0IHdvdWxkIGJlIG5pY2UgaWYgdGhpcyB1c2VkIGZlYXR1cmUgZGV0ZWN0aW9uIHJhdGhlciB0aGFuIGJyb3dzZXIgZGV0ZWN0aW9uXG5cdHJldHVybiAoIWlzTW9iaWxlU2FmYXJpKCkpO1xufTtcblxuZnVuY3Rpb24gaXNNb2JpbGVTYWZhcmkoKSB7XG5cdHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oaVBhZHxpUGhvbmV8aVBvZCB0b3VjaCk7L2kpO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzLTIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIFNlZSBMSUNFTlNFLlRYVCBmb3IgZGV0YWlscy5cblwidXNlIHN0cmljdFwiO1xuXG4vLyBSdW50aW1lIGFzc2VydGlvbnMgZm9yIHByb2R1Y3Rpb24gY29kZS4gKENvbnRyYXN0IHRvIGFzc2VydC5qcywgd2hpY2ggaXMgZm9yIHRlc3QgY29kZS4pXG5cbnZhciBzaGltID0gcmVxdWlyZShcIi4vc2hpbS5qc1wiKTtcbnZhciBvb3AgPSByZXF1aXJlKFwiLi9vb3AuanNcIik7XG5cbmV4cG9ydHMudGhhdCA9IGZ1bmN0aW9uKHZhcmlhYmxlLCBtZXNzYWdlKSB7XG5cdGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQpIG1lc3NhZ2UgPSBcIkV4cGVjdGVkIGNvbmRpdGlvbiB0byBiZSB0cnVlXCI7XG5cblx0aWYgKHZhcmlhYmxlID09PSBmYWxzZSkgdGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihleHBvcnRzLnRoYXQsIG1lc3NhZ2UpO1xuXHRpZiAodmFyaWFibGUgIT09IHRydWUpIHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oZXhwb3J0cy50aGF0LCBcIkV4cGVjdGVkIGNvbmRpdGlvbiB0byBiZSB0cnVlIG9yIGZhbHNlXCIpO1xufTtcblxuZXhwb3J0cy51bnJlYWNoYWJsZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0aWYgKCFtZXNzYWdlKSBtZXNzYWdlID0gXCJVbnJlYWNoYWJsZSBjb2RlIGV4ZWN1dGVkXCI7XG5cblx0dGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihleHBvcnRzLnVucmVhY2hhYmxlLCBtZXNzYWdlKTtcbn07XG5cbmV4cG9ydHMuc2lnbmF0dXJlID0gZnVuY3Rpb24oYXJncywgc2lnbmF0dXJlLCBtZXNzYWdlcykge1xuXHRzaWduYXR1cmUgPSBzaWduYXR1cmUgfHwgW107XG5cdG1lc3NhZ2VzID0gbWVzc2FnZXMgfHwgW107XG5cdHZhciBleHBlY3RlZEFyZ0NvdW50ID0gc2lnbmF0dXJlLmxlbmd0aDtcblx0dmFyIGFjdHVhbEFyZ0NvdW50ID0gYXJncy5sZW5ndGg7XG5cblx0aWYgKGFjdHVhbEFyZ0NvdW50ID4gZXhwZWN0ZWRBcmdDb3VudCkge1xuXHRcdHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oXG5cdFx0XHRleHBvcnRzLnNpZ25hdHVyZSxcblx0XHRcdFwiRnVuY3Rpb24gY2FsbGVkIHdpdGggdG9vIG1hbnkgYXJndW1lbnRzOiBleHBlY3RlZCBcIiArIGV4cGVjdGVkQXJnQ291bnQgKyBcIiBidXQgZ290IFwiICsgYWN0dWFsQXJnQ291bnRcblx0XHQpO1xuXHR9XG5cblx0dmFyIHR5cGUsIGFyZywgbmFtZTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzaWduYXR1cmUubGVuZ3RoOyBpKyspIHtcblx0XHR0eXBlID0gc2lnbmF0dXJlW2ldO1xuXHRcdGFyZyA9IGFyZ3NbaV07XG5cdFx0bmFtZSA9IFwiQXJndW1lbnQgXCIgKyBpO1xuXG5cdFx0aWYgKCFzaGltLkFycmF5LmlzQXJyYXkodHlwZSkpIHR5cGUgPSBbIHR5cGUgXTtcblx0XHRpZiAoIXR5cGVNYXRjaGVzKHR5cGUsIGFyZywgbmFtZSkpIHtcblx0XHRcdHZhciBtZXNzYWdlID0gbmFtZSArIFwiIGV4cGVjdGVkIFwiICsgZXhwbGFpblR5cGUodHlwZSkgKyBcIiwgYnV0IHdhcyBcIjtcblx0XHRcdHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oZXhwb3J0cy5zaWduYXR1cmUsIG1lc3NhZ2UgKyBleHBsYWluQXJnKGFyZykpO1xuXHRcdH1cblx0fVxufTtcblxuZnVuY3Rpb24gdHlwZU1hdGNoZXModHlwZSwgYXJnKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGg7IGkrKykge1xuXHRcdGlmIChvbmVUeXBlTWF0Y2hlcyh0eXBlW2ldLCBhcmcpKSByZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG5cblx0ZnVuY3Rpb24gb25lVHlwZU1hdGNoZXModHlwZSwgYXJnKSB7XG5cdFx0c3dpdGNoIChnZXRUeXBlKGFyZykpIHtcblx0XHRcdGNhc2UgXCJib29sZWFuXCI6IHJldHVybiB0eXBlID09PSBCb29sZWFuO1xuXHRcdFx0Y2FzZSBcInN0cmluZ1wiOiByZXR1cm4gdHlwZSA9PT0gU3RyaW5nO1xuXHRcdFx0Y2FzZSBcIm51bWJlclwiOiByZXR1cm4gdHlwZSA9PT0gTnVtYmVyO1xuXHRcdFx0Y2FzZSBcImFycmF5XCI6IHJldHVybiB0eXBlID09PSBBcnJheTtcblx0XHRcdGNhc2UgXCJmdW5jdGlvblwiOiByZXR1cm4gdHlwZSA9PT0gRnVuY3Rpb247XG5cdFx0XHRjYXNlIFwib2JqZWN0XCI6IHJldHVybiB0eXBlID09PSBPYmplY3QgfHwgYXJnIGluc3RhbmNlb2YgdHlwZTtcblx0XHRcdGNhc2UgXCJ1bmRlZmluZWRcIjogcmV0dXJuIHR5cGUgPT09IHVuZGVmaW5lZDtcblx0XHRcdGNhc2UgXCJudWxsXCI6IHJldHVybiB0eXBlID09PSBudWxsO1xuXHRcdFx0Y2FzZSBcIk5hTlwiOiByZXR1cm4gaXNOYU4odHlwZSk7XG5cblx0XHRcdGRlZmF1bHQ6IGV4cG9ydHMudW5yZWFjaGFibGUoKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZXhwbGFpblR5cGUodHlwZSkge1xuXHR2YXIgam9pbmVyID0gXCJcIjtcblx0dmFyIHJlc3VsdCA9IFwiXCI7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGg7IGkrKykge1xuXHRcdHJlc3VsdCArPSBqb2luZXIgKyBleHBsYWluT25lVHlwZSh0eXBlW2ldKTtcblx0XHRqb2luZXIgPSAoaSA9PT0gdHlwZS5sZW5ndGggLSAyKSA/IFwiLCBvciBcIiA6IFwiLCBcIjtcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xuXG5cdGZ1bmN0aW9uIGV4cGxhaW5PbmVUeXBlKHR5cGUpIHtcblx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdGNhc2UgQm9vbGVhbjogcmV0dXJuIFwiYm9vbGVhblwiO1xuXHRcdFx0Y2FzZSBTdHJpbmc6IHJldHVybiBcInN0cmluZ1wiO1xuXHRcdFx0Y2FzZSBOdW1iZXI6IHJldHVybiBcIm51bWJlclwiO1xuXHRcdFx0Y2FzZSBBcnJheTogcmV0dXJuIFwiYXJyYXlcIjtcblx0XHRcdGNhc2UgRnVuY3Rpb246IHJldHVybiBcImZ1bmN0aW9uXCI7XG5cdFx0XHRjYXNlIG51bGw6IHJldHVybiBcIm51bGxcIjtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJudW1iZXJcIiAmJiBpc05hTih0eXBlKSkgcmV0dXJuIFwiTmFOXCI7XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBvb3AuY2xhc3NOYW1lKHR5cGUpICsgXCIgaW5zdGFuY2VcIjtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBleHBsYWluQXJnKGFyZykge1xuXHR2YXIgdHlwZSA9IGdldFR5cGUoYXJnKTtcblx0aWYgKHR5cGUgIT09IFwib2JqZWN0XCIpIHJldHVybiB0eXBlO1xuXG5cdHJldHVybiBvb3AuaW5zdGFuY2VOYW1lKGFyZykgKyBcIiBpbnN0YW5jZVwiO1xufVxuXG5mdW5jdGlvbiBnZXRUeXBlKHZhcmlhYmxlKSB7XG5cdHZhciB0eXBlID0gdHlwZW9mIHZhcmlhYmxlO1xuXHRpZiAodmFyaWFibGUgPT09IG51bGwpIHR5cGUgPSBcIm51bGxcIjtcblx0aWYgKHNoaW0uQXJyYXkuaXNBcnJheSh2YXJpYWJsZSkpIHR5cGUgPSBcImFycmF5XCI7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiICYmIGlzTmFOKHZhcmlhYmxlKSkgdHlwZSA9IFwiTmFOXCI7XG5cdHJldHVybiB0eXBlO1xufVxuXG5cbi8qKioqKi9cblxudmFyIEVuc3VyZUV4Y2VwdGlvbiA9IGV4cG9ydHMuRW5zdXJlRXhjZXB0aW9uID0gZnVuY3Rpb24oZm5Ub1JlbW92ZUZyb21TdGFja1RyYWNlLCBtZXNzYWdlKSB7XG5cdGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgZm5Ub1JlbW92ZUZyb21TdGFja1RyYWNlKTtcblx0ZWxzZSB0aGlzLnN0YWNrID0gKG5ldyBFcnJvcigpKS5zdGFjaztcblx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn07XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlID0gc2hpbS5PYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW5zdXJlRXhjZXB0aW9uO1xuRW5zdXJlRXhjZXB0aW9uLnByb3RvdHlwZS5uYW1lID0gXCJFbnN1cmVFeGNlcHRpb25cIjtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxuLy8gY2FuJ3QgdXNlIGVuc3VyZS5qcyBkdWUgdG8gY2lyY3VsYXIgZGVwZW5kZW5jeVxudmFyIHNoaW0gPSByZXF1aXJlKFwiLi9zaGltLmpzXCIpO1xuXG5leHBvcnRzLmNsYXNzTmFtZSA9IGZ1bmN0aW9uKGNvbnN0cnVjdG9yKSB7XG5cdGlmICh0eXBlb2YgY29uc3RydWN0b3IgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiTm90IGEgY29uc3RydWN0b3JcIik7XG5cdHJldHVybiBzaGltLkZ1bmN0aW9uLm5hbWUoY29uc3RydWN0b3IpO1xufTtcblxuZXhwb3J0cy5pbnN0YW5jZU5hbWUgPSBmdW5jdGlvbihvYmopIHtcblx0dmFyIHByb3RvdHlwZSA9IHNoaW0uT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik7XG5cdGlmIChwcm90b3R5cGUgPT09IG51bGwpIHJldHVybiBcIjxubyBwcm90b3R5cGU+XCI7XG5cblx0dmFyIGNvbnN0cnVjdG9yID0gcHJvdG90eXBlLmNvbnN0cnVjdG9yO1xuXHRpZiAoY29uc3RydWN0b3IgPT09IHVuZGVmaW5lZCB8fCBjb25zdHJ1Y3RvciA9PT0gbnVsbCkgcmV0dXJuIFwiPGFub24+XCI7XG5cblx0cmV0dXJuIHNoaW0uRnVuY3Rpb24ubmFtZShjb25zdHJ1Y3Rvcik7XG59O1xuXG5leHBvcnRzLmV4dGVuZEZuID0gZnVuY3Rpb24gZXh0ZW5kRm4ocGFyZW50Q29uc3RydWN0b3IpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKGNoaWxkQ29uc3RydWN0b3IpIHtcblx0XHRjaGlsZENvbnN0cnVjdG9yLnByb3RvdHlwZSA9IHNoaW0uT2JqZWN0LmNyZWF0ZShwYXJlbnRDb25zdHJ1Y3Rvci5wcm90b3R5cGUpO1xuXHRcdGNoaWxkQ29uc3RydWN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY2hpbGRDb25zdHJ1Y3Rvcjtcblx0fTtcbn07XG5cbmV4cG9ydHMubWFrZUFic3RyYWN0ID0gZnVuY3Rpb24gbWFrZUFic3RyYWN0KGNvbnN0cnVjdG9yLCBtZXRob2RzKSB7XG5cdHZhciBuYW1lID0gc2hpbS5GdW5jdGlvbi5uYW1lKGNvbnN0cnVjdG9yKTtcblx0c2hpbS5BcnJheS5mb3JFYWNoKG1ldGhvZHMsIGZ1bmN0aW9uKG1ldGhvZCkge1xuXHRcdGNvbnN0cnVjdG9yLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IobmFtZSArIFwiIHN1YmNsYXNzZXMgbXVzdCBpbXBsZW1lbnQgXCIgKyBtZXRob2QgKyBcIigpIG1ldGhvZFwiKTtcblx0XHR9O1xuXHR9KTtcblxuXHRjb25zdHJ1Y3Rvci5wcm90b3R5cGUuY2hlY2tBYnN0cmFjdE1ldGhvZHMgPSBmdW5jdGlvbiBjaGVja0Fic3RyYWN0TWV0aG9kcygpIHtcblx0XHR2YXIgdW5pbXBsZW1lbnRlZCA9IFtdO1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRzaGltLkFycmF5LmZvckVhY2gobWV0aG9kcywgZnVuY3Rpb24obmFtZSkge1xuXHRcdFx0aWYgKHNlbGZbbmFtZV0gPT09IGNvbnN0cnVjdG9yLnByb3RvdHlwZVtuYW1lXSkgdW5pbXBsZW1lbnRlZC5wdXNoKG5hbWUgKyBcIigpXCIpO1xuXHRcdH0pO1xuXHRcdHJldHVybiB1bmltcGxlbWVudGVkO1xuXHR9O1xufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuQXJyYXkgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBBcnJheS5pc0FycmF5XG5cdGlzQXJyYXk6IGZ1bmN0aW9uIGlzQXJyYXkodGhpbmcpIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheSkgcmV0dXJuIEFycmF5LmlzQXJyYXkodGhpbmcpO1xuXG5cdFx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0aGluZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG5cdH0sXG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBBcnJheS5mb3JFYWNoXG5cdGZvckVhY2g6IGZ1bmN0aW9uIGZvckVhY2gob2JqLCBjYWxsYmFjaywgdGhpc0FyZykge1xuXHRcdC8qanNoaW50IGJpdHdpc2U6ZmFsc2UsIGVxZXFlcTpmYWxzZSwgLVcwNDE6ZmFsc2UgKi9cblxuXHRcdGlmIChBcnJheS5wcm90b3R5cGUuZm9yRWFjaCkgcmV0dXJuIG9iai5mb3JFYWNoKGNhbGxiYWNrLCB0aGlzQXJnKTtcblxuXHRcdC8vIFRoaXMgd29ya2Fyb3VuZCBiYXNlZCBvbiBwb2x5ZmlsbCBjb2RlIGZyb20gTUROOlxuXHRcdC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2ZvckVhY2hcblxuXHRcdC8vIFByb2R1Y3Rpb24gc3RlcHMgb2YgRUNNQS0yNjIsIEVkaXRpb24gNSwgMTUuNC40LjE4XG5cdFx0Ly8gUmVmZXJlbmNlOiBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjQuNC4xOFxuXG4gICAgdmFyIFQsIGs7XG5cbiAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJyB0aGlzIGlzIG51bGwgb3Igbm90IGRlZmluZWQnKTtcbiAgICB9XG5cbiAgICAvLyAxLiBMZXQgTyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgVG9PYmplY3QgcGFzc2luZyB0aGUgfHRoaXN8IHZhbHVlIGFzIHRoZSBhcmd1bWVudC5cbiAgICB2YXIgTyA9IE9iamVjdChvYmopO1xuXG4gICAgLy8gMi4gTGV0IGxlblZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0IGludGVybmFsIG1ldGhvZCBvZiBPIHdpdGggdGhlIGFyZ3VtZW50IFwibGVuZ3RoXCIuXG4gICAgLy8gMy4gTGV0IGxlbiBiZSBUb1VpbnQzMihsZW5WYWx1ZSkuXG4gICAgdmFyIGxlbiA9IE8ubGVuZ3RoID4+PiAwO1xuXG4gICAgLy8gNC4gSWYgSXNDYWxsYWJsZShjYWxsYmFjaykgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAvLyBTZWU6IGh0dHA6Ly9lczUuZ2l0aHViLmNvbS8jeDkuMTFcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoY2FsbGJhY2sgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgLy8gNS4gSWYgdGhpc0FyZyB3YXMgc3VwcGxpZWQsIGxldCBUIGJlIHRoaXNBcmc7IGVsc2UgbGV0IFQgYmUgdW5kZWZpbmVkLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgVCA9IHRoaXNBcmc7XG4gICAgfVxuXG4gICAgLy8gNi4gTGV0IGsgYmUgMFxuICAgIGsgPSAwO1xuXG4gICAgLy8gNy4gUmVwZWF0LCB3aGlsZSBrIDwgbGVuXG4gICAgd2hpbGUgKGsgPCBsZW4pIHtcblxuICAgICAgdmFyIGtWYWx1ZTtcblxuICAgICAgLy8gYS4gTGV0IFBrIGJlIFRvU3RyaW5nKGspLlxuICAgICAgLy8gICBUaGlzIGlzIGltcGxpY2l0IGZvciBMSFMgb3BlcmFuZHMgb2YgdGhlIGluIG9wZXJhdG9yXG4gICAgICAvLyBiLiBMZXQga1ByZXNlbnQgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBIYXNQcm9wZXJ0eSBpbnRlcm5hbCBtZXRob2Qgb2YgTyB3aXRoIGFyZ3VtZW50IFBrLlxuICAgICAgLy8gICBUaGlzIHN0ZXAgY2FuIGJlIGNvbWJpbmVkIHdpdGggY1xuICAgICAgLy8gYy4gSWYga1ByZXNlbnQgaXMgdHJ1ZSwgdGhlblxuICAgICAgaWYgKGsgaW4gTykge1xuXG4gICAgICAgIC8vIGkuIExldCBrVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXQgaW50ZXJuYWwgbWV0aG9kIG9mIE8gd2l0aCBhcmd1bWVudCBQay5cbiAgICAgICAga1ZhbHVlID0gT1trXTtcblxuICAgICAgICAvLyBpaS4gQ2FsbCB0aGUgQ2FsbCBpbnRlcm5hbCBtZXRob2Qgb2YgY2FsbGJhY2sgd2l0aCBUIGFzIHRoZSB0aGlzIHZhbHVlIGFuZFxuICAgICAgICAvLyBhcmd1bWVudCBsaXN0IGNvbnRhaW5pbmcga1ZhbHVlLCBrLCBhbmQgTy5cbiAgICAgICAgY2FsbGJhY2suY2FsbChULCBrVmFsdWUsIGssIE8pO1xuICAgICAgfVxuICAgICAgLy8gZC4gSW5jcmVhc2UgayBieSAxLlxuICAgICAgaysrO1xuICAgIH1cbiAgICAvLyA4LiByZXR1cm4gdW5kZWZpbmVkXG5cdH1cblxufTtcblxuXG5leHBvcnRzLkV2ZW50VGFyZ2V0ID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUU4OiBubyBFdmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKClcblx0YWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50LCBldmVudCwgY2FsbGJhY2spIHtcblx0XHRpZiAoZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKSByZXR1cm4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7XG5cblx0XHRlbGVtZW50LmF0dGFjaEV2ZW50KFwib25cIiArIGV2ZW50LCBjYWxsYmFjayk7XG5cdH1cblxufTtcblxuXG5leHBvcnRzLkRvY3VtZW50ID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUU4OiBubyBkb2N1bWVudC5oZWFkXG5cdGhlYWQ6IGZ1bmN0aW9uIGhlYWQoZG9jKSB7XG5cdFx0aWYgKGRvYy5oZWFkKSByZXR1cm4gZG9jLmhlYWQ7XG5cblx0XHRyZXR1cm4gZG9jLnF1ZXJ5U2VsZWN0b3IoXCJoZWFkXCIpO1xuXHR9XG5cbn07XG5cblxuZXhwb3J0cy5GdW5jdGlvbiA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDgsIElFIDksIElFIDEwLCBJRSAxMTogbm8gZnVuY3Rpb24ubmFtZVxuXHRuYW1lOiBmdW5jdGlvbiBuYW1lKGZuKSB7XG5cdFx0aWYgKGZuLm5hbWUpIHJldHVybiBmbi5uYW1lO1xuXG5cdFx0Ly8gQmFzZWQgb24gY29kZSBieSBKYXNvbiBCdW50aW5nIGV0IGFsLCBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zMzI0Mjlcblx0XHR2YXIgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvblxccysoLnsxLH0pXFxzKlxcKC87XG5cdFx0dmFyIHJlc3VsdHMgPSAoZnVuY05hbWVSZWdleCkuZXhlYygoZm4pLnRvU3RyaW5nKCkpO1xuXHRcdHJldHVybiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpID8gcmVzdWx0c1sxXSA6IFwiPGFub24+XCI7XG5cdH0sXG5cbn07XG5cblxuZXhwb3J0cy5PYmplY3QgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBPYmplY3QuY3JlYXRlKClcblx0Y3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUocHJvdG90eXBlKSB7XG5cdFx0aWYgKE9iamVjdC5jcmVhdGUpIHJldHVybiBPYmplY3QuY3JlYXRlKHByb3RvdHlwZSk7XG5cblx0XHR2YXIgVGVtcCA9IGZ1bmN0aW9uIFRlbXAoKSB7fTtcblx0XHRUZW1wLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcblx0XHRyZXR1cm4gbmV3IFRlbXAoKTtcblx0fSxcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIE9iamVjdC5nZXRQcm90b3R5cGVPZlxuXHQvLyBDYXV0aW9uOiBEb2Vzbid0IHdvcmsgb24gSUUgOCBpZiBjb25zdHJ1Y3RvciBoYXMgYmVlbiBjaGFuZ2VkLCBhcyBpcyB0aGUgY2FzZSB3aXRoIGEgc3ViY2xhc3MuXG5cdGdldFByb3RvdHlwZU9mOiBmdW5jdGlvbiBnZXRQcm90b3R5cGVPZihvYmopIHtcblx0XHRpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKSByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik7XG5cblx0XHR2YXIgcmVzdWx0ID0gb2JqLmNvbnN0cnVjdG9yID8gb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA6IG51bGw7XG5cdFx0cmV0dXJuIHJlc3VsdCB8fCBudWxsO1xuXHR9LFxuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogTm8gT2JqZWN0LmtleXNcblx0a2V5czogZnVuY3Rpb24ga2V5cyhvYmopIHtcblx0XHRpZiAoT2JqZWN0LmtleXMpIHJldHVybiBPYmplY3Qua2V5cyhvYmopO1xuXG5cdFx0Ly8gRnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3Qva2V5c1xuXHQgIHZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXG5cdCAgICAgIGhhc0RvbnRFbnVtQnVnID0gISh7IHRvU3RyaW5nOiBudWxsIH0pLnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpLFxuXHQgICAgICBkb250RW51bXMgPSBbXG5cdCAgICAgICAgJ3RvU3RyaW5nJyxcblx0ICAgICAgICAndG9Mb2NhbGVTdHJpbmcnLFxuXHQgICAgICAgICd2YWx1ZU9mJyxcblx0ICAgICAgICAnaGFzT3duUHJvcGVydHknLFxuXHQgICAgICAgICdpc1Byb3RvdHlwZU9mJyxcblx0ICAgICAgICAncHJvcGVydHlJc0VudW1lcmFibGUnLFxuXHQgICAgICAgICdjb25zdHJ1Y3Rvcidcblx0ICAgICAgXSxcblx0ICAgICAgZG9udEVudW1zTGVuZ3RoID0gZG9udEVudW1zLmxlbmd0aDtcblxuXHQgIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyAmJiAodHlwZW9mIG9iaiAhPT0gJ2Z1bmN0aW9uJyB8fCBvYmogPT09IG51bGwpKSB7XG5cdCAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3Qua2V5cyBjYWxsZWQgb24gbm9uLW9iamVjdCcpO1xuXHQgIH1cblxuXHQgIHZhciByZXN1bHQgPSBbXSwgcHJvcCwgaTtcblxuXHQgIGZvciAocHJvcCBpbiBvYmopIHtcblx0ICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIHtcblx0ICAgICAgcmVzdWx0LnB1c2gocHJvcCk7XG5cdCAgICB9XG5cdCAgfVxuXG5cdCAgaWYgKGhhc0RvbnRFbnVtQnVnKSB7XG5cdCAgICBmb3IgKGkgPSAwOyBpIDwgZG9udEVudW1zTGVuZ3RoOyBpKyspIHtcblx0ICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBkb250RW51bXNbaV0pKSB7XG5cdCAgICAgICAgcmVzdWx0LnB1c2goZG9udEVudW1zW2ldKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gcmVzdWx0O1xuXHR9XG5cbn07XG5cblxuZXhwb3J0cy5XaW5kb3cgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBObyBXaW5kb3cucGFnZVhPZmZzZXRcblx0cGFnZVhPZmZzZXQ6IGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQpIHtcblx0XHRpZiAod2luZG93LnBhZ2VYT2Zmc2V0ICE9PSB1bmRlZmluZWQpIHJldHVybiB3aW5kb3cucGFnZVhPZmZzZXQ7XG5cblx0XHQvLyBCYXNlZCBvbiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2luZG93LnNjcm9sbFlcblx0XHR2YXIgaXNDU1MxQ29tcGF0ID0gKChkb2N1bWVudC5jb21wYXRNb2RlIHx8IFwiXCIpID09PSBcIkNTUzFDb21wYXRcIik7XG5cdFx0cmV0dXJuIGlzQ1NTMUNvbXBhdCA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IDogZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0O1xuXHR9LFxuXG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBObyBXaW5kb3cucGFnZVlPZmZzZXRcblx0cGFnZVlPZmZzZXQ6IGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQpIHtcblx0XHRpZiAod2luZG93LnBhZ2VZT2Zmc2V0ICE9PSB1bmRlZmluZWQpIHJldHVybiB3aW5kb3cucGFnZVlPZmZzZXQ7XG5cblx0XHQvLyBCYXNlZCBvbiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2luZG93LnNjcm9sbFlcblx0XHR2YXIgaXNDU1MxQ29tcGF0ID0gKChkb2N1bWVudC5jb21wYXRNb2RlIHx8IFwiXCIpID09PSBcIkNTUzFDb21wYXRcIik7XG5cdFx0cmV0dXJuIGlzQ1NTMUNvbXBhdCA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgOiBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcblx0fVxuXG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuL3ZhbHVlLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFBpeGVscyhhbW91bnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyIF0pO1xuXHR0aGlzLl9hbW91bnQgPSBhbW91bnQ7XG59O1xuVmFsdWUuZXh0ZW5kKE1lKTtcblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGFtb3VudCkge1xuXHRyZXR1cm4gbmV3IE1lKGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29tcGF0aWJpbGl0eSA9IGZ1bmN0aW9uIGNvbXBhdGliaWxpdHkoKSB7XG5cdHJldHVybiBbIE1lIF07XG59O1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gcGx1cyhvcGVyYW5kKSB7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fYW1vdW50ICsgb3BlcmFuZC5fYW1vdW50KTtcbn0pO1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIG1pbnVzKG9wZXJhbmQpIHtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9hbW91bnQgLSBvcGVyYW5kLl9hbW91bnQpO1xufSk7XG5cbk1lLnByb3RvdHlwZS50aW1lcyA9IGZ1bmN0aW9uIHRpbWVzKG9wZXJhbmQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyIF0pO1xuXG5cdHJldHVybiBuZXcgTWUodGhpcy5fYW1vdW50ICogb3BlcmFuZCk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29tcGFyZSA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gY29tcGFyZShvcGVyYW5kKSB7XG5cdHZhciBkaWZmZXJlbmNlID0gdGhpcy5fYW1vdW50IC0gb3BlcmFuZC5fYW1vdW50O1xuXHRpZiAoTWF0aC5hYnMoZGlmZmVyZW5jZSkgPD0gMC41KSByZXR1cm4gMDtcblx0ZWxzZSByZXR1cm4gZGlmZmVyZW5jZTtcbn0pO1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHRpZiAodGhpcy5jb21wYXJlKGV4cGVjdGVkKSA9PT0gMCkgcmV0dXJuIFwiXCI7XG5cblx0dmFyIGRpZmZlcmVuY2UgPSBNYXRoLmFicyh0aGlzLl9hbW91bnQgLSBleHBlY3RlZC5fYW1vdW50KTtcblxuXHR2YXIgZGVzYyA9IGRpZmZlcmVuY2U7XG5cdGlmIChkaWZmZXJlbmNlICogMTAwICE9PSBNYXRoLmZsb29yKGRpZmZlcmVuY2UgKiAxMDApKSBkZXNjID0gXCJhYm91dCBcIiArIGRpZmZlcmVuY2UudG9GaXhlZCgyKTtcblx0cmV0dXJuIGRlc2MgKyBcInB4XCI7XG59KTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl9hbW91bnQgKyBcInB4XCI7XG59O1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4vdmFsdWUuanNcIik7XG52YXIgUGl4ZWxzID0gcmVxdWlyZShcIi4vcGl4ZWxzLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi9zaXplLmpzXCIpO1xuXG52YXIgWF9ESU1FTlNJT04gPSBcInhcIjtcbnZhciBZX0RJTUVOU0lPTiA9IFwieVwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFBvc2l0aW9uKGRpbWVuc2lvbiwgdmFsdWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBbTnVtYmVyLCBQaXhlbHNdIF0pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fdmFsdWUgPSAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSA/IFBpeGVscy5jcmVhdGUodmFsdWUpIDogdmFsdWU7XG59O1xuVmFsdWUuZXh0ZW5kKE1lKTtcblxuTWUueCA9IGZ1bmN0aW9uIHgodmFsdWUpIHtcblx0cmV0dXJuIG5ldyBNZShYX0RJTUVOU0lPTiwgdmFsdWUpO1xufTtcblxuTWUueSA9IGZ1bmN0aW9uIHkodmFsdWUpIHtcblx0cmV0dXJuIG5ldyBNZShZX0RJTUVOU0lPTiwgdmFsdWUpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbXBhdGliaWxpdHkgPSBmdW5jdGlvbiBjb21wYXRpYmlsaXR5KCkge1xuXHRyZXR1cm4gWyBNZSwgU2l6ZSBdO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIHBsdXMob3BlcmFuZCkge1xuXHRlbnN1cmVDb21wYXJhYmxlKHRoaXMsIG9wZXJhbmQpO1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX2RpbWVuc2lvbiwgdGhpcy5fdmFsdWUucGx1cyhvcGVyYW5kLnRvUGl4ZWxzKCkpKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIG1pbnVzKG9wZXJhbmQpIHtcblx0aWYgKG9wZXJhbmQgaW5zdGFuY2VvZiBNZSkgZW5zdXJlQ29tcGFyYWJsZSh0aGlzLCBvcGVyYW5kKTtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9kaW1lbnNpb24sIHRoaXMuX3ZhbHVlLm1pbnVzKG9wZXJhbmQudG9QaXhlbHMoKSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gVmFsdWUuc2FmZShmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdGVuc3VyZUNvbXBhcmFibGUodGhpcywgZXhwZWN0ZWQpO1xuXG5cdHZhciBhY3R1YWxWYWx1ZSA9IHRoaXMuX3ZhbHVlO1xuXHR2YXIgZXhwZWN0ZWRWYWx1ZSA9IGV4cGVjdGVkLl92YWx1ZTtcblx0aWYgKGFjdHVhbFZhbHVlLmVxdWFscyhleHBlY3RlZFZhbHVlKSkgcmV0dXJuIFwiXCI7XG5cblx0dmFyIGRpcmVjdGlvbjtcblx0dmFyIGNvbXBhcmlzb24gPSBhY3R1YWxWYWx1ZS5jb21wYXJlKGV4cGVjdGVkVmFsdWUpO1xuXHRpZiAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgZGlyZWN0aW9uID0gY29tcGFyaXNvbiA8IDAgPyBcImZ1cnRoZXIgbGVmdFwiIDogXCJmdXJ0aGVyIHJpZ2h0XCI7XG5cdGVsc2UgZGlyZWN0aW9uID0gY29tcGFyaXNvbiA8IDAgPyBcImhpZ2hlclwiIDogXCJsb3dlclwiO1xuXG5cdHJldHVybiBhY3R1YWxWYWx1ZS5kaWZmKGV4cGVjdGVkVmFsdWUpICsgXCIgXCIgKyBkaXJlY3Rpb247XG59KTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX3ZhbHVlLnRvU3RyaW5nKCk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9QaXhlbHMgPSBmdW5jdGlvbiB0b1BpeGVscygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gdGhpcy5fdmFsdWU7XG59O1xuXG5mdW5jdGlvbiBlbnN1cmVDb21wYXJhYmxlKHNlbGYsIG90aGVyKSB7XG5cdGlmIChvdGhlciBpbnN0YW5jZW9mIE1lKSB7XG5cdFx0ZW5zdXJlLnRoYXQoc2VsZi5fZGltZW5zaW9uID09PSBvdGhlci5fZGltZW5zaW9uLCBcIkNhbid0IGNvbXBhcmUgWCBkaW1lbnNpb24gdG8gWSBkaW1lbnNpb25cIik7XG5cdH1cbn1cbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuL3ZhbHVlLmpzXCIpO1xudmFyIFBpeGVscyA9IHJlcXVpcmUoXCIuL3BpeGVscy5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBTaXplKHZhbHVlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFtOdW1iZXIsIFBpeGVsc10gXSk7XG5cblx0dGhpcy5fdmFsdWUgPSAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSA/IFBpeGVscy5jcmVhdGUodmFsdWUpIDogdmFsdWU7XG59O1xuVmFsdWUuZXh0ZW5kKE1lKTtcblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKHZhbHVlKSB7XG5cdHJldHVybiBuZXcgTWUodmFsdWUpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbXBhdGliaWxpdHkgPSBmdW5jdGlvbiBjb21wYXRpYmlsaXR5KCkge1xuXHRyZXR1cm4gWyBNZSBdO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIHBsdXMob3BlcmFuZCkge1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX3ZhbHVlLnBsdXMob3BlcmFuZC5fdmFsdWUpKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIG1pbnVzKG9wZXJhbmQpIHtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl92YWx1ZS5taW51cyhvcGVyYW5kLl92YWx1ZSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS50aW1lcyA9IGZ1bmN0aW9uIHRpbWVzKG9wZXJhbmQpIHtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl92YWx1ZS50aW1lcyhvcGVyYW5kKSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29tcGFyZSA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gY29tcGFyZSh0aGF0KSB7XG5cdHJldHVybiB0aGlzLl92YWx1ZS5jb21wYXJlKHRoYXQuX3ZhbHVlKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHR2YXIgYWN0dWFsVmFsdWUgPSB0aGlzLl92YWx1ZTtcblx0dmFyIGV4cGVjdGVkVmFsdWUgPSBleHBlY3RlZC5fdmFsdWU7XG5cblx0aWYgKGFjdHVhbFZhbHVlLmVxdWFscyhleHBlY3RlZFZhbHVlKSkgcmV0dXJuIFwiXCI7XG5cblx0dmFyIGRlc2MgPSBhY3R1YWxWYWx1ZS5jb21wYXJlKGV4cGVjdGVkVmFsdWUpID4gMCA/IFwiIGxhcmdlclwiIDogXCIgc21hbGxlclwiO1xuXHRyZXR1cm4gYWN0dWFsVmFsdWUuZGlmZihleHBlY3RlZFZhbHVlKSArIGRlc2M7XG59KTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl92YWx1ZS50b1N0cmluZygpO1xufTtcblxuTWUucHJvdG90eXBlLnRvUGl4ZWxzID0gZnVuY3Rpb24gdG9QaXhlbHMoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl92YWx1ZTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIHNoaW0gPSByZXF1aXJlKFwiLi4vdXRpbC9zaGltLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFZhbHVlKCkge307XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xub29wLm1ha2VBYnN0cmFjdChNZSwgW1xuXHRcImRpZmZcIixcblx0XCJ0b1N0cmluZ1wiLFxuXHRcImNvbXBhdGliaWxpdHlcIlxuXSk7XG5cbk1lLnNhZmUgPSBmdW5jdGlvbiBzYWZlKGZuKSB7XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRlbnN1cmVDb21wYXRpYmlsaXR5KHRoaXMsIHRoaXMuY29tcGF0aWJpbGl0eSgpLCBhcmd1bWVudHMpO1xuXHRcdHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHR9O1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdHJldHVybiB0aGlzLmRpZmYodGhhdCkgPT09IFwiXCI7XG59O1xuXG5mdW5jdGlvbiBlbnN1cmVDb21wYXRpYmlsaXR5KHNlbGYsIGNvbXBhdGlibGUsIGFyZ3MpIHtcblx0dmFyIGFyZztcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7ICAgLy8gYXJncyBpcyBub3QgYW4gQXJyYXksIGNhbid0IHVzZSBmb3JFYWNoXG5cdFx0YXJnID0gYXJnc1tpXTtcblx0XHRjaGVja09uZUFyZyhzZWxmLCBjb21wYXRpYmxlLCBhcmcpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNoZWNrT25lQXJnKHNlbGYsIGNvbXBhdGlibGUsIGFyZykge1xuXHR2YXIgdHlwZSA9IHR5cGVvZiBhcmc7XG5cdGlmIChhcmcgPT09IG51bGwpIHR5cGUgPSBcIm51bGxcIjtcblx0aWYgKHR5cGUgIT09IFwib2JqZWN0XCIpIHRocm93RXJyb3IodHlwZSk7XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb21wYXRpYmxlLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKGFyZyBpbnN0YW5jZW9mIGNvbXBhdGlibGVbaV0pIHJldHVybjtcblx0fVxuXHR0aHJvd0Vycm9yKG9vcC5pbnN0YW5jZU5hbWUoYXJnKSk7XG5cblx0ZnVuY3Rpb24gdGhyb3dFcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKG9vcC5pbnN0YW5jZU5hbWUoc2VsZikgKyBcIiBpc24ndCBjb21wYXRpYmxlIHdpdGggXCIgKyB0eXBlKTtcblx0fVxufSIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuXHRpZiAoc3RyLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBzdHI7XG5cdH1cblxuXHRyZXR1cm4gc3RyXG5cdC5yZXBsYWNlKC9eW18uXFwtIF0rLywgJycpXG5cdC50b0xvd2VyQ2FzZSgpXG5cdC5yZXBsYWNlKC9bXy5cXC0gXSsoXFx3fCQpL2csIGZ1bmN0aW9uIChtLCBwMSkge1xuXHRcdHJldHVybiBwMS50b1VwcGVyQ2FzZSgpO1xuXHR9KTtcbn07XG4iXX0=

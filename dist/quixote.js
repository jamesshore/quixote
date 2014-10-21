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

},{"../util/ensure.js":10,"../util/oop.js":11,"../values/value.js":16}],2:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Position = require("../values/position.js");
var RelativePosition = require("./relative_position.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function ElementCenter(dimension, element) {
	ensure.signature(arguments, [ String, require("../q_element.js") ]);
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
},{"../q_element.js":8,"../util/ensure.js":10,"../values/position.js":14,"./descriptor.js":1,"./relative_position.js":5}],3:[function(require,module,exports){
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
	ensure.signature(arguments, [ require("../q_element.js"), String ]);
	ensure.that(
		position === TOP || position === RIGHT || position === BOTTOM || position === LEFT,
		"Unknown position: " + position
	);

	this._element = element;
	this._edge = position;
};
Descriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.plus = function plus(amount) {
	ensure.signature(arguments, [ [Number, ElementSize] ]);

	if (this._edge === RIGHT || this._edge === LEFT) return RelativePosition.right(this, amount);
	if (this._edge === TOP || this._edge === BOTTOM) return RelativePosition.down(this, amount);
};

Me.prototype.minus = function minus(amount) {
	ensure.signature(arguments, [ [Number, ElementSize] ]);

	if (this._edge === RIGHT || this._edge === LEFT) return RelativePosition.left(this, amount);
	if (this._edge === TOP || this._edge === BOTTOM) return RelativePosition.up(this, amount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var result = this._element.getRawPosition()[this._edge];
	return createPosition(this, result);
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "number") return createPosition(this, arg);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._edge + " edge of " + this._element;
};

function factoryFn(position) {
	return function factory(element) {
		return new Me(element, position);
	};
}

function createPosition(self, value) {
	if (self._edge === TOP || self._edge === BOTTOM) return Position.y(value);
	if (self._edge === RIGHT || self._edge === LEFT) return Position.x(value);
}
},{"../q_element.js":8,"../util/ensure.js":10,"../values/position.js":14,"./descriptor.js":1,"./element_size.js":4,"./relative_position.js":5}],4:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");
var RelativeSize = require("./relative_size.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function ElementSize(dimension, element) {
	ensure.signature(arguments, [ String, require("../q_element.js") ]);
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._element = element;
};
Descriptor.extend(Me);

Me.x = function x(element) {
	return new Me(X_DIMENSION, element);
};

Me.y = function y(element) {
	return new Me(Y_DIMENSION, element);
};

Me.prototype.plus = function plus(amount) {
	return RelativeSize.larger(this, amount);
};

Me.prototype.minus = function minus(amount) {
	return RelativeSize.smaller(this, amount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var position = this._element.getRawPosition();
	var result = (this._dimension === X_DIMENSION) ? position.width : position.height;

	return new Size(result);
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "number") return new Size(arg);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var desc = (this._dimension === X_DIMENSION) ? "width" : "height";
	return desc + " of " + this._element;
};
},{"../q_element.js":8,"../util/ensure.js":10,"../values/size.js":15,"./descriptor.js":1,"./relative_size.js":6}],5:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");
var Pixels = require("../values/pixels.js");
var ElementSize = require("./element_size.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";
var PLUS = 1;
var MINUS = -1;

var Me = module.exports = function RelativePosition(dimension, direction, relativeTo, relativeAmount) {
	var ElementEdge = require("./element_edge.js");       // require() is here due to circular dependency
	var ElementCenter = require("./element_center.js");
	ensure.signature(arguments, [ String, Number, Descriptor, [Number, Descriptor] ]);
	ensure.that(dimension === X_DIMENSION || dimension === Y_DIMENSION, "Unrecognized dimension: " + dimension);

	this._dimension = dimension;
	this._direction = direction;
	this._relativeTo = relativeTo;

	if (typeof relativeAmount === "number") {
		if (relativeAmount < 0) this._direction *= -1;
		this._amount = new Size(Math.abs(relativeAmount));
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
	if (this._amount.equals(new Size(0))) return base;

	var relation = this._amount.toString();
	if (this._dimension === X_DIMENSION) relation += (this._direction === PLUS) ? " to right of " : " to left of ";
	else relation += (this._direction === PLUS) ? " below " : " above ";

	return relation + base;
};

function createPosition(self, value) {
	if (self._dimension === X_DIMENSION) return Position.x(value);
	else return Position.y(value);
}

},{"../util/ensure.js":10,"../values/pixels.js":13,"../values/position.js":14,"../values/size.js":15,"./descriptor.js":1,"./element_center.js":2,"./element_edge.js":3,"./element_size.js":4}],6:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Size = require("../values/size.js");
var Descriptor = require("./descriptor.js");

var PLUS = 1;
var MINUS = -1;

var Me = module.exports = function RelativeSize(direction, relativeTo, amount) {
	var ElementSize = require("./element_size.js");
	ensure.signature(arguments, [ Number, Descriptor, [Number, Descriptor] ]);

	this._direction = direction;
	this._relativeTo = relativeTo;

	if (typeof amount === "number") {
		this._amount = new Size(Math.abs(amount));
		if (amount < 0) this._direction *= -1;
	}
	else {
		this._amount = amount;
	}
};
Descriptor.extend(Me);

Me.larger = function larger(relativeTo, amount) {
	return new Me(PLUS, relativeTo, amount);
};

Me.smaller = function smaller(relativeTo, amount) {
	return new Me(MINUS, relativeTo, amount);
};

Me.prototype.plus = function plus(amount) {
	return Me.larger(this, amount);
};

Me.prototype.minus = function minus(amount) {
	return Me.smaller(this, amount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var baseValue = this._relativeTo.value();
	var relativeValue = this._amount.value();

	if (this._direction === PLUS) return baseValue.plus(relativeValue);
	else return baseValue.minus(relativeValue);
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "number") return new Size(arg);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var base = this._relativeTo.toString();
	if (this._amount.equals(new Size(0))) return base;

	var relation = this._amount.toString();
	if (this._direction === PLUS) relation += " larger than ";
	else relation += " smaller than ";

	return relation + base;
};


},{"../util/ensure.js":10,"../values/size.js":15,"./descriptor.js":1,"./element_size.js":4}],7:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var QElement = require("./q_element.js");

var Me = module.exports = function Frame(domElement) {
	ensure.signature(arguments, [ Object ]);
	ensure.that(domElement.tagName === "IFRAME", "DOM element must be an iframe");

	this._domElement = domElement;
	this._loaded = false;
	this._removed = false;
};

function loaded(self) {
	self._loaded = true;
	self._document = self._domElement.contentDocument;
	self._originalBody = self._document.body.innerHTML;
}

Me.create = function create(parentElement, width, height, options, callback) {
	ensure.signature(arguments, [ Object, Number, Number, [ Object, Function ], [ undefined, Function ] ]);

	if (callback === undefined) {
		callback = options;
		options = {};
	}

	// WORKAROUND Mobile Safari 7.0.0: weird style results occur when both src and stylesheet are loaded (see test)
	ensure.that(
		!(options.src && options.stylesheet),
		"Cannot specify HTML URL and stylesheet URL simultaneously due to Mobile Safari issue"
	);

	var iframe = document.createElement("iframe");
	iframe.setAttribute("width", width);
	iframe.setAttribute("height", height);
	iframe.setAttribute("frameborder", "0");    // WORKAROUND IE 8: don't include frame border in position calcs
	if (options.src) iframe.setAttribute("src", options.src);

	var frame = new Me(iframe);
	addLoadListener(iframe, onFrameLoad);
	parentElement.appendChild(iframe);
	return frame;

	function onFrameLoad() {
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
	addLoadListener(link, onLinkLoad);
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("href", url);

	documentHead(self).appendChild(link);

	function onLinkLoad() {
		callback();
	}
}

Me.prototype.reset = function() {
	ensure.signature(arguments, []);
	ensureUsable(this);

	this._document.body.innerHTML = this._originalBody;
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
	this._domElement.parentNode.removeChild(this._domElement);
};

Me.prototype.addElement = function(html) {
	ensure.signature(arguments, [ String ]);
	ensureUsable(this);

	var tempElement = document.createElement("div");
	tempElement.innerHTML = html;
	ensure.that(
		tempElement.childNodes.length === 1,
		"Expected one element, but got " + tempElement.childNodes.length + " (" + html + ")"
	);

	var insertedElement = tempElement.childNodes[0];
	this._document.body.appendChild(insertedElement);
	return new QElement(insertedElement, html);
};

Me.prototype.getElement = function(selector) {
	ensure.signature(arguments, [ String ]);
	ensureUsable(this);

	var nodes = this._document.querySelectorAll(selector);
	ensure.that(nodes.length === 1, "Expected one element to match '" + selector + "', but found " + nodes.length);
	return new QElement(nodes[0], selector);
};

// WORKAROUND IE8: no addEventListener()
function addLoadListener(iframeDom, callback) {
	if (iframeDom.addEventListener) iframeDom.addEventListener("load", callback);
	else iframeDom.attachEvent("onload", callback);
}

// WORKAROUND IE8: no document.head
function documentHead(self) {
	if (self._document.head) return self._document.head;
	else return self._document.querySelector("head");
}

function ensureUsable(self) {
	ensureLoaded(self);
	ensureNotRemoved(self);
}

function ensureLoaded(self) {
	ensure.that(self._loaded, "Frame not loaded: Wait for frame creation callback to execute before using frame");
}

function ensureNotRemoved(self) {
	ensure.that(!self._removed, "Attempted to use frame after it was removed");
}

},{"./q_element.js":8,"./util/ensure.js":10}],8:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var camelcase = require("../vendor/camelcase-1.0.1-modified.js");
var shim = require("./util/shim.js");
var ElementEdge = require("./descriptors/element_edge.js");
var ElementCenter = require("./descriptors/element_center.js");
var ElementSize = require("./descriptors/element_size.js");

var Me = module.exports = function QElement(domElement, nickname) {
	ensure.signature(arguments, [ Object, [ String ] ]);

	this._domElement = domElement;
	this._nickname = nickname;

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

},{"../vendor/camelcase-1.0.1-modified.js":17,"./descriptors/element_center.js":2,"./descriptors/element_edge.js":3,"./descriptors/element_size.js":4,"./util/ensure.js":10,"./util/shim.js":12}],9:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var Frame = require("./frame.js");

exports.createFrame = function(width, height, options, callback) {
	return Frame.create(document.body, width, height, options, callback);
};
},{"./frame.js":7,"./util/ensure.js":10}],10:[function(require,module,exports){
// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
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

},{"./oop.js":11,"./shim.js":12}],11:[function(require,module,exports){
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
},{"./shim.js":12}],12:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

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

},{}],13:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");

var Me = module.exports = function Pixels(amount) {
	ensure.signature(arguments, [ Number ]);
	this._amount = amount;
};
Value.extend(Me);

Me.prototype.compatibility = function compatibility() {
	return [ Me ];
};

Me.prototype.plus = Value.safe(function plus(operand) {
	return new Me(this._amount + operand._amount);
});

Me.prototype.minus = Value.safe(function minus(operand) {
	return new Me(this._amount - operand._amount);
});

Me.prototype.compare = Value.safe(function compare(operand) {
	return this._amount - operand._amount;
});

Me.prototype.diff = Value.safe(function diff(expected) {
	if (this._amount === expected._amount) return "";
	return Math.abs(this._amount - expected._amount) + "px";
});

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._amount + "px";
};

},{"../util/ensure.js":10,"./value.js":16}],14:[function(require,module,exports){
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
	this._edge = (typeof value === "number") ? new Pixels(value) : value;
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
	return new Me(this._dimension, this._edge.plus(operand.toPixels()));
});

Me.prototype.minus = Value.safe(function minus(operand) {
	if (operand instanceof Me) ensureComparable(this, operand);
	return new Me(this._dimension, this._edge.minus(operand.toPixels()));
});

Me.prototype.diff = Value.safe(function diff(expected) {
	ensureComparable(this, expected);

	var actualValue = this._edge;
	var expectedValue = expected._edge;
	if (actualValue.equals(expectedValue)) return "";

	var direction;
	var comparison = actualValue.compare(expectedValue);
	if (this._dimension === X_DIMENSION) direction = comparison < 0 ? "to the left" : "to the right";
	else direction = comparison < 0 ? "lower" : "higher";

	return actualValue.diff(expectedValue) + " " + direction;
});

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return this._edge.toString();
};

Me.prototype.toPixels = function toPixels() {
	ensure.signature(arguments, []);

	return this._edge;
};

function ensureComparable(self, other) {
	if (other instanceof Me) {
		ensure.that(self._dimension === other._dimension, "Can't compare X dimension to Y dimension");
	}
}

},{"../util/ensure.js":10,"./pixels.js":13,"./size.js":15,"./value.js":16}],15:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");
var Pixels = require("./pixels.js");

var Me = module.exports = function Size(value) {
	ensure.signature(arguments, [ [Number, Pixels] ]);

	this._edge = (typeof value === "number") ? new Pixels(value) : value;
};
Value.extend(Me);

Me.prototype.compatibility = function compatibility() {
	return [ Me ];
};

Me.prototype.plus = Value.safe(function(operand) {
	return new Me(this._edge.plus(operand._edge));
});

Me.prototype.minus = Value.safe(function(operand) {
	return new Me(this._edge.minus(operand._edge));
});

Me.prototype.compare = Value.safe(function(that) {
	return this._edge.compare(that._edge);
});

Me.prototype.diff = Value.safe(function(expected) {
	var actualValue = this._edge;
	var expectedValue = expected._edge;

	if (actualValue.equals(expectedValue)) return "";

	var desc = actualValue.compare(expectedValue) > 0 ? " larger" : " smaller";
	return actualValue.diff(expectedValue) + desc;
});

Me.prototype.toString = function() {
	ensure.signature(arguments, []);
	return this._edge.toString();
};

Me.prototype.toPixels = function() {
	ensure.signature(arguments, []);
	return this._edge;
};

},{"../util/ensure.js":10,"./pixels.js":13,"./value.js":16}],16:[function(require,module,exports){
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
},{"../util/ensure.js":10,"../util/oop.js":11,"../util/shim.js":12}],17:[function(require,module,exports){
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

},{}]},{},[9])(9)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9kZXNjcmlwdG9yLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvZGVzY3JpcHRvcnMvZWxlbWVudF9jZW50ZXIuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9lbGVtZW50X2VkZ2UuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9lbGVtZW50X3NpemUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9yZWxhdGl2ZV9wb3NpdGlvbi5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL2Rlc2NyaXB0b3JzL3JlbGF0aXZlX3NpemUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9mcmFtZS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3FfZWxlbWVudC5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3F1aXhvdGUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy91dGlsL2Vuc3VyZS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3V0aWwvb29wLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvdXRpbC9zaGltLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvdmFsdWVzL3BpeGVscy5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3ZhbHVlcy9wb3NpdGlvbi5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3ZhbHVlcy9zaXplLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvdmFsdWVzL3ZhbHVlLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS92ZW5kb3IvY2FtZWxjYXNlLTEuMC4xLW1vZGlmaWVkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4uL3ZhbHVlcy92YWx1ZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBEZXNjcmlwdG9yKCkge307XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xub29wLm1ha2VBYnN0cmFjdChNZSwgW1xuXHRcInZhbHVlXCIsXG5cdFwidG9TdHJpbmdcIlxuXSk7XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHRleHBlY3RlZCA9IG5vcm1hbGl6ZVR5cGUodGhpcywgZXhwZWN0ZWQpO1xuXHR0cnkge1xuXHRcdHZhciBhY3R1YWxWYWx1ZSA9IHRoaXMudmFsdWUoKTtcblx0XHR2YXIgZXhwZWN0ZWRWYWx1ZSA9IGV4cGVjdGVkLnZhbHVlKCk7XG5cblx0XHRpZiAoYWN0dWFsVmFsdWUuZXF1YWxzKGV4cGVjdGVkVmFsdWUpKSByZXR1cm4gXCJcIjtcblxuXHRcdHZhciBkaWZmZXJlbmNlID0gYWN0dWFsVmFsdWUuZGlmZihleHBlY3RlZFZhbHVlKTtcblx0XHR2YXIgZXhwZWN0ZWREZXNjID0gZXhwZWN0ZWRWYWx1ZS50b1N0cmluZygpO1xuXHRcdGlmIChleHBlY3RlZCBpbnN0YW5jZW9mIE1lKSBleHBlY3RlZERlc2MgKz0gXCIgKFwiICsgZXhwZWN0ZWQgKyBcIilcIjtcblxuXHRcdHJldHVybiB0aGlzICsgXCIgd2FzIFwiICsgZGlmZmVyZW5jZSArIFwiIHRoYW4gZXhwZWN0ZWQuXFxuXCIgK1xuXHRcdFx0XCIgIEV4cGVjdGVkOiBcIiArIGV4cGVjdGVkRGVzYyArIFwiXFxuXCIgK1xuXHRcdFx0XCIgIEJ1dCB3YXM6ICBcIiArIGFjdHVhbFZhbHVlO1xuXHR9XG5cdGNhdGNoIChlcnIpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb21wYXJlIFwiICsgdGhpcyArIFwiIHRvIFwiICsgZXhwZWN0ZWQgKyBcIjogXCIgKyBlcnIubWVzc2FnZSk7XG5cdH1cbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0Ly8gVGhpcyBtZXRob2QgaXMgbWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBieSBzdWJjbGFzc2VzLiBJdCBzaG91bGQgcmV0dXJuICd1bmRlZmluZWQnIHdoZW4gYW4gYXJndW1lbnRcblx0Ly8gY2FuJ3QgYmUgY29udmVydGVkLiBJbiB0aGlzIGRlZmF1bHQgaW1wbGVtZW50YXRpb24sIG5vIGFyZ3VtZW50cyBjYW4gYmUgY29udmVydGVkLCBzbyB3ZSBhbHdheXNcblx0Ly8gcmV0dXJuICd1bmRlZmluZWQnLlxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdC8vIERlc2NyaXB0b3JzIGFyZW4ndCB2YWx1ZSBvYmplY3RzLiBUaGV5J3JlIG5ldmVyIGVxdWFsIHRvIGFueXRoaW5nLiBCdXQgc29tZXRpbWVzXG5cdC8vIHRoZXkncmUgdXNlZCBpbiB0aGUgc2FtZSBwbGFjZXMgdmFsdWUgb2JqZWN0cyBhcmUgdXNlZCwgYW5kIHRoaXMgbWV0aG9kIGdldHMgY2FsbGVkLlxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiBub3JtYWxpemVUeXBlKHNlbGYsIGV4cGVjdGVkKSB7XG5cdHZhciBleHBlY3RlZFR5cGUgPSB0eXBlb2YgZXhwZWN0ZWQ7XG5cdGlmIChleHBlY3RlZCA9PT0gbnVsbCkgZXhwZWN0ZWRUeXBlID0gXCJudWxsXCI7XG5cblx0aWYgKGV4cGVjdGVkVHlwZSA9PT0gXCJvYmplY3RcIiAmJiAoZXhwZWN0ZWQgaW5zdGFuY2VvZiBNZSB8fCBleHBlY3RlZCBpbnN0YW5jZW9mIFZhbHVlKSkgcmV0dXJuIGV4cGVjdGVkO1xuXG5cdGlmIChleHBlY3RlZCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY29tcGFyZSBcIiArIHNlbGYgKyBcIiB0byBcIiArIGV4cGVjdGVkICsgXCIuIERpZCB5b3UgbWlzc3BlbGwgYSBwcm9wZXJ0eSBuYW1lP1wiKTtcblx0fVxuXHRlbHNlIGlmIChleHBlY3RlZFR5cGUgPT09IFwib2JqZWN0XCIpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb21wYXJlIFwiICsgc2VsZiArIFwiIHRvIFwiICsgb29wLmluc3RhbmNlTmFtZShleHBlY3RlZCkgKyBcIiBpbnN0YW5jZXMuXCIpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdGV4cGVjdGVkID0gc2VsZi5jb252ZXJ0KGV4cGVjdGVkLCBleHBlY3RlZFR5cGUpO1xuXHRcdGlmIChleHBlY3RlZCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb21wYXJlIFwiICsgc2VsZiArIFwiIHRvIFwiICsgZXhwZWN0ZWRUeXBlICsgXCIuXCIpO1xuXHR9XG5cblx0cmV0dXJuIGV4cGVjdGVkO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcbnZhciBSZWxhdGl2ZVBvc2l0aW9uID0gcmVxdWlyZShcIi4vcmVsYXRpdmVfcG9zaXRpb24uanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudENlbnRlcihkaW1lbnNpb24sIGVsZW1lbnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCByZXF1aXJlKFwiLi4vcV9lbGVtZW50LmpzXCIpIF0pO1xuXHRlbnN1cmUudGhhdChkaW1lbnNpb24gPT09IFhfRElNRU5TSU9OIHx8IGRpbWVuc2lvbiA9PT0gWV9ESU1FTlNJT04sIFwiVW5yZWNvZ25pemVkIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS54ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuXHRyZXR1cm4gbmV3IE1lKFhfRElNRU5TSU9OLCBlbGVtZW50KTtcbn07XG5cbk1lLnkgPSBmdW5jdGlvbihlbGVtZW50KSB7XG5cdHJldHVybiBuZXcgTWUoWV9ESU1FTlNJT04sIGVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBmdW5jdGlvbiBwbHVzKGFtb3VudCkge1xuXHRpZiAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgcmV0dXJuIFJlbGF0aXZlUG9zaXRpb24ucmlnaHQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbi5kb3duKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBmdW5jdGlvbiBtaW51cyhhbW91bnQpIHtcblx0aWYgKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uLmxlZnQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbi51cCh0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIHBvc2l0aW9uID0gdGhpcy5fZWxlbWVudC5nZXRSYXdQb3NpdGlvbigpO1xuXG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZXR1cm4gUG9zaXRpb24ueChwb3NpdGlvbi5sZWZ0ICsgKChwb3NpdGlvbi5yaWdodCAtIHBvc2l0aW9uLmxlZnQpIC8gMikpO1xuXHRlbHNlIHJldHVybiBQb3NpdGlvbi55KHBvc2l0aW9uLnRvcCArICgocG9zaXRpb24uYm90dG9tIC0gcG9zaXRpb24udG9wKSAvIDIpKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHJldHVybiAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgPyBQb3NpdGlvbi54KGFyZykgOiBQb3NpdGlvbi55KGFyZyk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgZGVzY3JpcHRpb24gPSAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgPyBcImNlbnRlclwiIDogXCJtaWRkbGVcIjtcblx0cmV0dXJuIGRlc2NyaXB0aW9uICsgXCIgb2YgXCIgKyB0aGlzLl9lbGVtZW50O1xufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xudmFyIFJlbGF0aXZlUG9zaXRpb24gPSByZXF1aXJlKFwiLi9yZWxhdGl2ZV9wb3NpdGlvbi5qc1wiKTtcbnZhciBEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvci5qc1wiKTtcbnZhciBFbGVtZW50U2l6ZSA9IHJlcXVpcmUoXCIuL2VsZW1lbnRfc2l6ZS5qc1wiKTtcblxudmFyIFRPUCA9IFwidG9wXCI7XG52YXIgUklHSFQgPSBcInJpZ2h0XCI7XG52YXIgQk9UVE9NID0gXCJib3R0b21cIjtcbnZhciBMRUZUID0gXCJsZWZ0XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudEVkZ2UoZWxlbWVudCwgcG9zaXRpb24pIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgcmVxdWlyZShcIi4uL3FfZWxlbWVudC5qc1wiKSwgU3RyaW5nIF0pO1xuXHRlbnN1cmUudGhhdChcblx0XHRwb3NpdGlvbiA9PT0gVE9QIHx8IHBvc2l0aW9uID09PSBSSUdIVCB8fCBwb3NpdGlvbiA9PT0gQk9UVE9NIHx8IHBvc2l0aW9uID09PSBMRUZULFxuXHRcdFwiVW5rbm93biBwb3NpdGlvbjogXCIgKyBwb3NpdGlvblxuXHQpO1xuXG5cdHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuXHR0aGlzLl9lZGdlID0gcG9zaXRpb247XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS50b3AgPSBmYWN0b3J5Rm4oVE9QKTtcbk1lLnJpZ2h0ID0gZmFjdG9yeUZuKFJJR0hUKTtcbk1lLmJvdHRvbSA9IGZhY3RvcnlGbihCT1RUT00pO1xuTWUubGVmdCA9IGZhY3RvcnlGbihMRUZUKTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBmdW5jdGlvbiBwbHVzKGFtb3VudCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBbTnVtYmVyLCBFbGVtZW50U2l6ZV0gXSk7XG5cblx0aWYgKHRoaXMuX2VkZ2UgPT09IFJJR0hUIHx8IHRoaXMuX2VkZ2UgPT09IExFRlQpIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uLnJpZ2h0KHRoaXMsIGFtb3VudCk7XG5cdGlmICh0aGlzLl9lZGdlID09PSBUT1AgfHwgdGhpcy5fZWRnZSA9PT0gQk9UVE9NKSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbi5kb3duKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBmdW5jdGlvbiBtaW51cyhhbW91bnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgW051bWJlciwgRWxlbWVudFNpemVdIF0pO1xuXG5cdGlmICh0aGlzLl9lZGdlID09PSBSSUdIVCB8fCB0aGlzLl9lZGdlID09PSBMRUZUKSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbi5sZWZ0KHRoaXMsIGFtb3VudCk7XG5cdGlmICh0aGlzLl9lZGdlID09PSBUT1AgfHwgdGhpcy5fZWRnZSA9PT0gQk9UVE9NKSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbi51cCh0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIHJlc3VsdCA9IHRoaXMuX2VsZW1lbnQuZ2V0UmF3UG9zaXRpb24oKVt0aGlzLl9lZGdlXTtcblx0cmV0dXJuIGNyZWF0ZVBvc2l0aW9uKHRoaXMsIHJlc3VsdCk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoYXJnLCB0eXBlKSB7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiKSByZXR1cm4gY3JlYXRlUG9zaXRpb24odGhpcywgYXJnKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fZWRnZSArIFwiIGVkZ2Ugb2YgXCIgKyB0aGlzLl9lbGVtZW50O1xufTtcblxuZnVuY3Rpb24gZmFjdG9yeUZuKHBvc2l0aW9uKSB7XG5cdHJldHVybiBmdW5jdGlvbiBmYWN0b3J5KGVsZW1lbnQpIHtcblx0XHRyZXR1cm4gbmV3IE1lKGVsZW1lbnQsIHBvc2l0aW9uKTtcblx0fTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUG9zaXRpb24oc2VsZiwgdmFsdWUpIHtcblx0aWYgKHNlbGYuX2VkZ2UgPT09IFRPUCB8fCBzZWxmLl9lZGdlID09PSBCT1RUT00pIHJldHVybiBQb3NpdGlvbi55KHZhbHVlKTtcblx0aWYgKHNlbGYuX2VkZ2UgPT09IFJJR0hUIHx8IHNlbGYuX2VkZ2UgPT09IExFRlQpIHJldHVybiBQb3NpdGlvbi54KHZhbHVlKTtcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvc2l6ZS5qc1wiKTtcbnZhciBSZWxhdGl2ZVNpemUgPSByZXF1aXJlKFwiLi9yZWxhdGl2ZV9zaXplLmpzXCIpO1xuXG52YXIgWF9ESU1FTlNJT04gPSBcInhcIjtcbnZhciBZX0RJTUVOU0lPTiA9IFwieVwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEVsZW1lbnRTaXplKGRpbWVuc2lvbiwgZWxlbWVudCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIHJlcXVpcmUoXCIuLi9xX2VsZW1lbnQuanNcIikgXSk7XG5cdGVuc3VyZS50aGF0KGRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04gfHwgZGltZW5zaW9uID09PSBZX0RJTUVOU0lPTiwgXCJVbnJlY29nbml6ZWQgZGltZW5zaW9uOiBcIiArIGRpbWVuc2lvbik7XG5cblx0dGhpcy5fZGltZW5zaW9uID0gZGltZW5zaW9uO1xuXHR0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcbn07XG5EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnggPSBmdW5jdGlvbiB4KGVsZW1lbnQpIHtcblx0cmV0dXJuIG5ldyBNZShYX0RJTUVOU0lPTiwgZWxlbWVudCk7XG59O1xuXG5NZS55ID0gZnVuY3Rpb24geShlbGVtZW50KSB7XG5cdHJldHVybiBuZXcgTWUoWV9ESU1FTlNJT04sIGVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBmdW5jdGlvbiBwbHVzKGFtb3VudCkge1xuXHRyZXR1cm4gUmVsYXRpdmVTaXplLmxhcmdlcih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gZnVuY3Rpb24gbWludXMoYW1vdW50KSB7XG5cdHJldHVybiBSZWxhdGl2ZVNpemUuc21hbGxlcih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIHBvc2l0aW9uID0gdGhpcy5fZWxlbWVudC5nZXRSYXdQb3NpdGlvbigpO1xuXHR2YXIgcmVzdWx0ID0gKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pID8gcG9zaXRpb24ud2lkdGggOiBwb3NpdGlvbi5oZWlnaHQ7XG5cblx0cmV0dXJuIG5ldyBTaXplKHJlc3VsdCk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoYXJnLCB0eXBlKSB7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiKSByZXR1cm4gbmV3IFNpemUoYXJnKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBkZXNjID0gKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pID8gXCJ3aWR0aFwiIDogXCJoZWlnaHRcIjtcblx0cmV0dXJuIGRlc2MgKyBcIiBvZiBcIiArIHRoaXMuX2VsZW1lbnQ7XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvc2l6ZS5qc1wiKTtcbnZhciBQaXhlbHMgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3BpeGVscy5qc1wiKTtcbnZhciBFbGVtZW50U2l6ZSA9IHJlcXVpcmUoXCIuL2VsZW1lbnRfc2l6ZS5qc1wiKTtcblxudmFyIFhfRElNRU5TSU9OID0gXCJ4XCI7XG52YXIgWV9ESU1FTlNJT04gPSBcInlcIjtcbnZhciBQTFVTID0gMTtcbnZhciBNSU5VUyA9IC0xO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFJlbGF0aXZlUG9zaXRpb24oZGltZW5zaW9uLCBkaXJlY3Rpb24sIHJlbGF0aXZlVG8sIHJlbGF0aXZlQW1vdW50KSB7XG5cdHZhciBFbGVtZW50RWRnZSA9IHJlcXVpcmUoXCIuL2VsZW1lbnRfZWRnZS5qc1wiKTsgICAgICAgLy8gcmVxdWlyZSgpIGlzIGhlcmUgZHVlIHRvIGNpcmN1bGFyIGRlcGVuZGVuY3lcblx0dmFyIEVsZW1lbnRDZW50ZXIgPSByZXF1aXJlKFwiLi9lbGVtZW50X2NlbnRlci5qc1wiKTtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBOdW1iZXIsIERlc2NyaXB0b3IsIFtOdW1iZXIsIERlc2NyaXB0b3JdIF0pO1xuXHRlbnN1cmUudGhhdChkaW1lbnNpb24gPT09IFhfRElNRU5TSU9OIHx8IGRpbWVuc2lvbiA9PT0gWV9ESU1FTlNJT04sIFwiVW5yZWNvZ25pemVkIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuXHR0aGlzLl9yZWxhdGl2ZVRvID0gcmVsYXRpdmVUbztcblxuXHRpZiAodHlwZW9mIHJlbGF0aXZlQW1vdW50ID09PSBcIm51bWJlclwiKSB7XG5cdFx0aWYgKHJlbGF0aXZlQW1vdW50IDwgMCkgdGhpcy5fZGlyZWN0aW9uICo9IC0xO1xuXHRcdHRoaXMuX2Ftb3VudCA9IG5ldyBTaXplKE1hdGguYWJzKHJlbGF0aXZlQW1vdW50KSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0dGhpcy5fYW1vdW50ID0gcmVsYXRpdmVBbW91bnQ7XG5cdH1cbn07XG5EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnJpZ2h0ID0gY3JlYXRlRm4oWF9ESU1FTlNJT04sIFBMVVMpO1xuTWUuZG93biA9IGNyZWF0ZUZuKFlfRElNRU5TSU9OLCBQTFVTKTtcbk1lLmxlZnQgPSBjcmVhdGVGbihYX0RJTUVOU0lPTiwgTUlOVVMpO1xuTWUudXAgPSBjcmVhdGVGbihZX0RJTUVOU0lPTiwgTUlOVVMpO1xuXG5mdW5jdGlvbiBjcmVhdGVGbihkaW1lbnNpb24sIGRpcmVjdGlvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gY3JlYXRlKHJlbGF0aXZlVG8sIHJlbGF0aXZlQW1vdW50KSB7XG5cdFx0cmV0dXJuIG5ldyBNZShkaW1lbnNpb24sIGRpcmVjdGlvbiwgcmVsYXRpdmVUbywgcmVsYXRpdmVBbW91bnQpO1xuXHR9O1xufVxuXG5NZS5wcm90b3R5cGUucGx1cyA9IGZ1bmN0aW9uIHBsdXMoYW1vdW50KSB7XG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZXR1cm4gTWUucmlnaHQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gTWUuZG93bih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gZnVuY3Rpb24gbWludXMoYW1vdW50KSB7XG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFlfRElNRU5TSU9OKSByZXR1cm4gTWUubGVmdCh0aGlzLCBhbW91bnQpO1xuXHRlbHNlIHJldHVybiBNZS51cCh0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2VWYWx1ZSA9IHRoaXMuX3JlbGF0aXZlVG8udmFsdWUoKTtcblx0dmFyIHJlbGF0aXZlVmFsdWUgPSB0aGlzLl9hbW91bnQudmFsdWUoKTtcblxuXHRpZiAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSByZXR1cm4gYmFzZVZhbHVlLnBsdXMocmVsYXRpdmVWYWx1ZSk7XG5cdGVsc2UgcmV0dXJuIGJhc2VWYWx1ZS5taW51cyhyZWxhdGl2ZVZhbHVlKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHJldHVybiBjcmVhdGVQb3NpdGlvbih0aGlzLCBhcmcpO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2UgPSB0aGlzLl9yZWxhdGl2ZVRvLnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9hbW91bnQuZXF1YWxzKG5ldyBTaXplKDApKSkgcmV0dXJuIGJhc2U7XG5cblx0dmFyIHJlbGF0aW9uID0gdGhpcy5fYW1vdW50LnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZWxhdGlvbiArPSAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSA/IFwiIHRvIHJpZ2h0IG9mIFwiIDogXCIgdG8gbGVmdCBvZiBcIjtcblx0ZWxzZSByZWxhdGlvbiArPSAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSA/IFwiIGJlbG93IFwiIDogXCIgYWJvdmUgXCI7XG5cblx0cmV0dXJuIHJlbGF0aW9uICsgYmFzZTtcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZVBvc2l0aW9uKHNlbGYsIHZhbHVlKSB7XG5cdGlmIChzZWxmLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZXR1cm4gUG9zaXRpb24ueCh2YWx1ZSk7XG5cdGVsc2UgcmV0dXJuIFBvc2l0aW9uLnkodmFsdWUpO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG5cbnZhciBQTFVTID0gMTtcbnZhciBNSU5VUyA9IC0xO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFJlbGF0aXZlU2l6ZShkaXJlY3Rpb24sIHJlbGF0aXZlVG8sIGFtb3VudCkge1xuXHR2YXIgRWxlbWVudFNpemUgPSByZXF1aXJlKFwiLi9lbGVtZW50X3NpemUuanNcIik7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE51bWJlciwgRGVzY3JpcHRvciwgW051bWJlciwgRGVzY3JpcHRvcl0gXSk7XG5cblx0dGhpcy5fZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuXHR0aGlzLl9yZWxhdGl2ZVRvID0gcmVsYXRpdmVUbztcblxuXHRpZiAodHlwZW9mIGFtb3VudCA9PT0gXCJudW1iZXJcIikge1xuXHRcdHRoaXMuX2Ftb3VudCA9IG5ldyBTaXplKE1hdGguYWJzKGFtb3VudCkpO1xuXHRcdGlmIChhbW91bnQgPCAwKSB0aGlzLl9kaXJlY3Rpb24gKj0gLTE7XG5cdH1cblx0ZWxzZSB7XG5cdFx0dGhpcy5fYW1vdW50ID0gYW1vdW50O1xuXHR9XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS5sYXJnZXIgPSBmdW5jdGlvbiBsYXJnZXIocmVsYXRpdmVUbywgYW1vdW50KSB7XG5cdHJldHVybiBuZXcgTWUoUExVUywgcmVsYXRpdmVUbywgYW1vdW50KTtcbn07XG5cbk1lLnNtYWxsZXIgPSBmdW5jdGlvbiBzbWFsbGVyKHJlbGF0aXZlVG8sIGFtb3VudCkge1xuXHRyZXR1cm4gbmV3IE1lKE1JTlVTLCByZWxhdGl2ZVRvLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBmdW5jdGlvbiBwbHVzKGFtb3VudCkge1xuXHRyZXR1cm4gTWUubGFyZ2VyKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBmdW5jdGlvbiBtaW51cyhhbW91bnQpIHtcblx0cmV0dXJuIE1lLnNtYWxsZXIodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBiYXNlVmFsdWUgPSB0aGlzLl9yZWxhdGl2ZVRvLnZhbHVlKCk7XG5cdHZhciByZWxhdGl2ZVZhbHVlID0gdGhpcy5fYW1vdW50LnZhbHVlKCk7XG5cblx0aWYgKHRoaXMuX2RpcmVjdGlvbiA9PT0gUExVUykgcmV0dXJuIGJhc2VWYWx1ZS5wbHVzKHJlbGF0aXZlVmFsdWUpO1xuXHRlbHNlIHJldHVybiBiYXNlVmFsdWUubWludXMocmVsYXRpdmVWYWx1ZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoYXJnLCB0eXBlKSB7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiKSByZXR1cm4gbmV3IFNpemUoYXJnKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBiYXNlID0gdGhpcy5fcmVsYXRpdmVUby50b1N0cmluZygpO1xuXHRpZiAodGhpcy5fYW1vdW50LmVxdWFscyhuZXcgU2l6ZSgwKSkpIHJldHVybiBiYXNlO1xuXG5cdHZhciByZWxhdGlvbiA9IHRoaXMuX2Ftb3VudC50b1N0cmluZygpO1xuXHRpZiAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSByZWxhdGlvbiArPSBcIiBsYXJnZXIgdGhhbiBcIjtcblx0ZWxzZSByZWxhdGlvbiArPSBcIiBzbWFsbGVyIHRoYW4gXCI7XG5cblx0cmV0dXJuIHJlbGF0aW9uICsgYmFzZTtcbn07XG5cbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFFFbGVtZW50ID0gcmVxdWlyZShcIi4vcV9lbGVtZW50LmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEZyYW1lKGRvbUVsZW1lbnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0IF0pO1xuXHRlbnN1cmUudGhhdChkb21FbGVtZW50LnRhZ05hbWUgPT09IFwiSUZSQU1FXCIsIFwiRE9NIGVsZW1lbnQgbXVzdCBiZSBhbiBpZnJhbWVcIik7XG5cblx0dGhpcy5fZG9tRWxlbWVudCA9IGRvbUVsZW1lbnQ7XG5cdHRoaXMuX2xvYWRlZCA9IGZhbHNlO1xuXHR0aGlzLl9yZW1vdmVkID0gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiBsb2FkZWQoc2VsZikge1xuXHRzZWxmLl9sb2FkZWQgPSB0cnVlO1xuXHRzZWxmLl9kb2N1bWVudCA9IHNlbGYuX2RvbUVsZW1lbnQuY29udGVudERvY3VtZW50O1xuXHRzZWxmLl9vcmlnaW5hbEJvZHkgPSBzZWxmLl9kb2N1bWVudC5ib2R5LmlubmVySFRNTDtcbn1cblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKHBhcmVudEVsZW1lbnQsIHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgTnVtYmVyLCBOdW1iZXIsIFsgT2JqZWN0LCBGdW5jdGlvbiBdLCBbIHVuZGVmaW5lZCwgRnVuY3Rpb24gXSBdKTtcblxuXHRpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCkge1xuXHRcdGNhbGxiYWNrID0gb3B0aW9ucztcblx0XHRvcHRpb25zID0ge307XG5cdH1cblxuXHQvLyBXT1JLQVJPVU5EIE1vYmlsZSBTYWZhcmkgNy4wLjA6IHdlaXJkIHN0eWxlIHJlc3VsdHMgb2NjdXIgd2hlbiBib3RoIHNyYyBhbmQgc3R5bGVzaGVldCBhcmUgbG9hZGVkIChzZWUgdGVzdClcblx0ZW5zdXJlLnRoYXQoXG5cdFx0IShvcHRpb25zLnNyYyAmJiBvcHRpb25zLnN0eWxlc2hlZXQpLFxuXHRcdFwiQ2Fubm90IHNwZWNpZnkgSFRNTCBVUkwgYW5kIHN0eWxlc2hlZXQgVVJMIHNpbXVsdGFuZW91c2x5IGR1ZSB0byBNb2JpbGUgU2FmYXJpIGlzc3VlXCJcblx0KTtcblxuXHR2YXIgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlmcmFtZVwiKTtcblx0aWZyYW1lLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIHdpZHRoKTtcblx0aWZyYW1lLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBoZWlnaHQpO1xuXHRpZnJhbWUuc2V0QXR0cmlidXRlKFwiZnJhbWVib3JkZXJcIiwgXCIwXCIpOyAgICAvLyBXT1JLQVJPVU5EIElFIDg6IGRvbid0IGluY2x1ZGUgZnJhbWUgYm9yZGVyIGluIHBvc2l0aW9uIGNhbGNzXG5cdGlmIChvcHRpb25zLnNyYykgaWZyYW1lLnNldEF0dHJpYnV0ZShcInNyY1wiLCBvcHRpb25zLnNyYyk7XG5cblx0dmFyIGZyYW1lID0gbmV3IE1lKGlmcmFtZSk7XG5cdGFkZExvYWRMaXN0ZW5lcihpZnJhbWUsIG9uRnJhbWVMb2FkKTtcblx0cGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZChpZnJhbWUpO1xuXHRyZXR1cm4gZnJhbWU7XG5cblx0ZnVuY3Rpb24gb25GcmFtZUxvYWQoKSB7XG5cdFx0Ly8gV09SS0FST1VORCBNb2JpbGUgU2FmYXJpIDcuMC4wLCBTYWZhcmkgNi4yLjAsIENocm9tZSAzOC4wLjIxMjU6IGZyYW1lIGlzIGxvYWRlZCBzeW5jaHJvbm91c2x5XG5cdFx0Ly8gV2UgZm9yY2UgaXQgdG8gYmUgYXN5bmNocm9ub3VzIGhlcmVcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9hZGVkKGZyYW1lKTtcblx0XHRcdGxvYWRTdHlsZXNoZWV0KGZyYW1lLCBvcHRpb25zLnN0eWxlc2hlZXQsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjYWxsYmFjayhudWxsLCBmcmFtZSk7XG5cdFx0XHR9KTtcblx0XHR9LCAwKTtcblx0fVxufTtcblxuZnVuY3Rpb24gbG9hZFN0eWxlc2hlZXQoc2VsZiwgdXJsLCBjYWxsYmFjaykge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBNZSwgWyB1bmRlZmluZWQsIFN0cmluZyBdLCBGdW5jdGlvbiBdKTtcblx0aWYgKHVybCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gY2FsbGJhY2soKTtcblxuXHR2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuXHRhZGRMb2FkTGlzdGVuZXIobGluaywgb25MaW5rTG9hZCk7XG5cdGxpbmsuc2V0QXR0cmlidXRlKFwicmVsXCIsIFwic3R5bGVzaGVldFwiKTtcblx0bGluay5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dC9jc3NcIik7XG5cdGxpbmsuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCB1cmwpO1xuXG5cdGRvY3VtZW50SGVhZChzZWxmKS5hcHBlbmRDaGlsZChsaW5rKTtcblxuXHRmdW5jdGlvbiBvbkxpbmtMb2FkKCkge1xuXHRcdGNhbGxiYWNrKCk7XG5cdH1cbn1cblxuTWUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHR0aGlzLl9kb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IHRoaXMuX29yaWdpbmFsQm9keTtcbn07XG5cbk1lLnByb3RvdHlwZS50b0RvbUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0ZW5zdXJlTm90UmVtb3ZlZCh0aGlzKTtcblxuXHRyZXR1cm4gdGhpcy5fZG9tRWxlbWVudDtcbn07XG5cbk1lLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0ZW5zdXJlTG9hZGVkKHRoaXMpO1xuXHRpZiAodGhpcy5fcmVtb3ZlZCkgcmV0dXJuO1xuXG5cdHRoaXMuX3JlbW92ZWQgPSB0cnVlO1xuXHR0aGlzLl9kb21FbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fZG9tRWxlbWVudCk7XG59O1xuXG5NZS5wcm90b3R5cGUuYWRkRWxlbWVudCA9IGZ1bmN0aW9uKGh0bWwpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nIF0pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dmFyIHRlbXBFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0dGVtcEVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbDtcblx0ZW5zdXJlLnRoYXQoXG5cdFx0dGVtcEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPT09IDEsXG5cdFx0XCJFeHBlY3RlZCBvbmUgZWxlbWVudCwgYnV0IGdvdCBcIiArIHRlbXBFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoICsgXCIgKFwiICsgaHRtbCArIFwiKVwiXG5cdCk7XG5cblx0dmFyIGluc2VydGVkRWxlbWVudCA9IHRlbXBFbGVtZW50LmNoaWxkTm9kZXNbMF07XG5cdHRoaXMuX2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW5zZXJ0ZWRFbGVtZW50KTtcblx0cmV0dXJuIG5ldyBRRWxlbWVudChpbnNlcnRlZEVsZW1lbnQsIGh0bWwpO1xufTtcblxuTWUucHJvdG90eXBlLmdldEVsZW1lbnQgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcgXSk7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHR2YXIgbm9kZXMgPSB0aGlzLl9kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblx0ZW5zdXJlLnRoYXQobm9kZXMubGVuZ3RoID09PSAxLCBcIkV4cGVjdGVkIG9uZSBlbGVtZW50IHRvIG1hdGNoICdcIiArIHNlbGVjdG9yICsgXCInLCBidXQgZm91bmQgXCIgKyBub2Rlcy5sZW5ndGgpO1xuXHRyZXR1cm4gbmV3IFFFbGVtZW50KG5vZGVzWzBdLCBzZWxlY3Rvcik7XG59O1xuXG4vLyBXT1JLQVJPVU5EIElFODogbm8gYWRkRXZlbnRMaXN0ZW5lcigpXG5mdW5jdGlvbiBhZGRMb2FkTGlzdGVuZXIoaWZyYW1lRG9tLCBjYWxsYmFjaykge1xuXHRpZiAoaWZyYW1lRG9tLmFkZEV2ZW50TGlzdGVuZXIpIGlmcmFtZURvbS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBjYWxsYmFjayk7XG5cdGVsc2UgaWZyYW1lRG9tLmF0dGFjaEV2ZW50KFwib25sb2FkXCIsIGNhbGxiYWNrKTtcbn1cblxuLy8gV09SS0FST1VORCBJRTg6IG5vIGRvY3VtZW50LmhlYWRcbmZ1bmN0aW9uIGRvY3VtZW50SGVhZChzZWxmKSB7XG5cdGlmIChzZWxmLl9kb2N1bWVudC5oZWFkKSByZXR1cm4gc2VsZi5fZG9jdW1lbnQuaGVhZDtcblx0ZWxzZSByZXR1cm4gc2VsZi5fZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImhlYWRcIik7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVVzYWJsZShzZWxmKSB7XG5cdGVuc3VyZUxvYWRlZChzZWxmKTtcblx0ZW5zdXJlTm90UmVtb3ZlZChzZWxmKTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlTG9hZGVkKHNlbGYpIHtcblx0ZW5zdXJlLnRoYXQoc2VsZi5fbG9hZGVkLCBcIkZyYW1lIG5vdCBsb2FkZWQ6IFdhaXQgZm9yIGZyYW1lIGNyZWF0aW9uIGNhbGxiYWNrIHRvIGV4ZWN1dGUgYmVmb3JlIHVzaW5nIGZyYW1lXCIpO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVOb3RSZW1vdmVkKHNlbGYpIHtcblx0ZW5zdXJlLnRoYXQoIXNlbGYuX3JlbW92ZWQsIFwiQXR0ZW1wdGVkIHRvIHVzZSBmcmFtZSBhZnRlciBpdCB3YXMgcmVtb3ZlZFwiKTtcbn1cbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIGNhbWVsY2FzZSA9IHJlcXVpcmUoXCIuLi92ZW5kb3IvY2FtZWxjYXNlLTEuMC4xLW1vZGlmaWVkLmpzXCIpO1xudmFyIHNoaW0gPSByZXF1aXJlKFwiLi91dGlsL3NoaW0uanNcIik7XG52YXIgRWxlbWVudEVkZ2UgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9lbGVtZW50X2VkZ2UuanNcIik7XG52YXIgRWxlbWVudENlbnRlciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL2VsZW1lbnRfY2VudGVyLmpzXCIpO1xudmFyIEVsZW1lbnRTaXplID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvZWxlbWVudF9zaXplLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFFFbGVtZW50KGRvbUVsZW1lbnQsIG5pY2tuYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgWyBTdHJpbmcgXSBdKTtcblxuXHR0aGlzLl9kb21FbGVtZW50ID0gZG9tRWxlbWVudDtcblx0dGhpcy5fbmlja25hbWUgPSBuaWNrbmFtZTtcblxuXHR0aGlzLnRvcCA9IEVsZW1lbnRFZGdlLnRvcCh0aGlzKTtcblx0dGhpcy5yaWdodCA9IEVsZW1lbnRFZGdlLnJpZ2h0KHRoaXMpO1xuXHR0aGlzLmJvdHRvbSA9IEVsZW1lbnRFZGdlLmJvdHRvbSh0aGlzKTtcblx0dGhpcy5sZWZ0ID0gRWxlbWVudEVkZ2UubGVmdCh0aGlzKTtcblxuXHR0aGlzLmNlbnRlciA9IEVsZW1lbnRDZW50ZXIueCh0aGlzKTtcblx0dGhpcy5taWRkbGUgPSBFbGVtZW50Q2VudGVyLnkodGhpcyk7XG5cblx0dGhpcy53aWR0aCA9IEVsZW1lbnRTaXplLngodGhpcyk7XG5cdHRoaXMuaGVpZ2h0ID0gRWxlbWVudFNpemUueSh0aGlzKTtcbn07XG5cbk1lLnByb3RvdHlwZS5hc3NlcnQgPSBmdW5jdGlvbiBhc3NlcnQoZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0LCBbdW5kZWZpbmVkLCBTdHJpbmddIF0pO1xuXHRpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkKSBtZXNzYWdlID0gXCJEaWZmZXJlbmNlcyBmb3VuZFwiO1xuXG5cdHZhciBkaWZmID0gdGhpcy5kaWZmKGV4cGVjdGVkKTtcblx0aWYgKGRpZmYgIT09IFwiXCIpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlICsgXCI6XFxuXCIgKyBkaWZmKTtcbn07XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBPYmplY3QgXSk7XG5cblx0dmFyIHJlc3VsdCA9IFtdO1xuXHR2YXIga2V5cyA9IHNoaW0uT2JqZWN0LmtleXMoZXhwZWN0ZWQpO1xuXHR2YXIga2V5LCBvbmVEaWZmLCBkZXNjcmlwdG9yO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRrZXkgPSBrZXlzW2ldO1xuXHRcdGRlc2NyaXB0b3IgPSB0aGlzW2tleV07XG5cdFx0ZW5zdXJlLnRoYXQoXG5cdFx0XHRcdGRlc2NyaXB0b3IgIT09IHVuZGVmaW5lZCxcblx0XHRcdFx0dGhpcyArIFwiIGRvZXNuJ3QgaGF2ZSBhIHByb3BlcnR5IG5hbWVkICdcIiArIGtleSArIFwiJy4gRGlkIHlvdSBtaXNzcGVsbCBpdD9cIlxuXHRcdCk7XG5cdFx0b25lRGlmZiA9IGRlc2NyaXB0b3IuZGlmZihleHBlY3RlZFtrZXldKTtcblx0XHRpZiAob25lRGlmZiAhPT0gXCJcIikgcmVzdWx0LnB1c2gob25lRGlmZik7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0LmpvaW4oXCJcXG5cIik7XG59O1xuXG5NZS5wcm90b3R5cGUuZ2V0UmF3U3R5bGUgPSBmdW5jdGlvbiBnZXRSYXdTdHlsZShzdHlsZU5hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nIF0pO1xuXG5cdHZhciBzdHlsZXM7XG5cdHZhciByZXN1bHQ7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBnZXRDb21wdXRlZFN0eWxlKClcblx0aWYgKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKSB7XG5cdFx0c3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5fZG9tRWxlbWVudCk7XG5cdFx0cmVzdWx0ID0gc3R5bGVzLmdldFByb3BlcnR5VmFsdWUoc3R5bGVOYW1lKTtcblx0fVxuXHRlbHNlIHtcblx0XHRzdHlsZXMgPSB0aGlzLl9kb21FbGVtZW50LmN1cnJlbnRTdHlsZTtcblx0XHRyZXN1bHQgPSBzdHlsZXNbY2FtZWxjYXNlKHN0eWxlTmFtZSldO1xuXHR9XG5cdGlmIChyZXN1bHQgPT09IG51bGwgfHwgcmVzdWx0ID09PSB1bmRlZmluZWQpIHJlc3VsdCA9IFwiXCI7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG5NZS5wcm90b3R5cGUuZ2V0UmF3UG9zaXRpb24gPSBmdW5jdGlvbiBnZXRSYXdQb3NpdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IE5vIFRleHRSZWN0YW5nbGUuaGVpZ2h0IG9yIC53aWR0aFxuXHR2YXIgcmVjdCA9IHRoaXMuX2RvbUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdHJldHVybiB7XG5cdFx0bGVmdDogcmVjdC5sZWZ0LFxuXHRcdHJpZ2h0OiByZWN0LnJpZ2h0LFxuXHRcdHdpZHRoOiByZWN0LndpZHRoICE9PSB1bmRlZmluZWQgPyByZWN0LndpZHRoIDogcmVjdC5yaWdodCAtIHJlY3QubGVmdCxcblxuXHRcdHRvcDogcmVjdC50b3AsXG5cdFx0Ym90dG9tOiByZWN0LmJvdHRvbSxcblx0XHRoZWlnaHQ6IHJlY3QuaGVpZ2h0ICE9PSB1bmRlZmluZWQgPyByZWN0LmhlaWdodCA6IHJlY3QuYm90dG9tIC0gcmVjdC50b3Bcblx0fTtcbn07XG5cbk1lLnByb3RvdHlwZS50b0RvbUVsZW1lbnQgPSBmdW5jdGlvbiB0b0RvbUVsZW1lbnQoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl9kb21FbGVtZW50O1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiBcIidcIiArIHRoaXMuX25pY2tuYW1lICsgXCInXCI7XG59O1xuXG5NZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKHRoYXQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUgXSk7XG5cdHJldHVybiB0aGlzLl9kb21FbGVtZW50ID09PSB0aGF0Ll9kb21FbGVtZW50O1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIEZyYW1lID0gcmVxdWlyZShcIi4vZnJhbWUuanNcIik7XG5cbmV4cG9ydHMuY3JlYXRlRnJhbWUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0LCBvcHRpb25zLCBjYWxsYmFjaykge1xuXHRyZXR1cm4gRnJhbWUuY3JlYXRlKGRvY3VtZW50LmJvZHksIHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBTZWUgTElDRU5TRS5UWFQgZm9yIGRldGFpbHMuXG5cInVzZSBzdHJpY3RcIjtcblxuLy8gUnVudGltZSBhc3NlcnRpb25zIGZvciBwcm9kdWN0aW9uIGNvZGUuIChDb250cmFzdCB0byBhc3NlcnQuanMsIHdoaWNoIGlzIGZvciB0ZXN0IGNvZGUuKVxuXG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3NoaW0uanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4vb29wLmpzXCIpO1xuXG5leHBvcnRzLnRoYXQgPSBmdW5jdGlvbih2YXJpYWJsZSwgbWVzc2FnZSkge1xuXHRpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkKSBtZXNzYWdlID0gXCJFeHBlY3RlZCBjb25kaXRpb24gdG8gYmUgdHJ1ZVwiO1xuXG5cdGlmICh2YXJpYWJsZSA9PT0gZmFsc2UpIHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oZXhwb3J0cy50aGF0LCBtZXNzYWdlKTtcblx0aWYgKHZhcmlhYmxlICE9PSB0cnVlKSB0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudGhhdCwgXCJFeHBlY3RlZCBjb25kaXRpb24gdG8gYmUgdHJ1ZSBvciBmYWxzZVwiKTtcbn07XG5cbmV4cG9ydHMudW5yZWFjaGFibGUgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdGlmICghbWVzc2FnZSkgbWVzc2FnZSA9IFwiVW5yZWFjaGFibGUgY29kZSBleGVjdXRlZFwiO1xuXG5cdHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oZXhwb3J0cy51bnJlYWNoYWJsZSwgbWVzc2FnZSk7XG59O1xuXG5leHBvcnRzLnNpZ25hdHVyZSA9IGZ1bmN0aW9uKGFyZ3MsIHNpZ25hdHVyZSwgbWVzc2FnZXMpIHtcblx0c2lnbmF0dXJlID0gc2lnbmF0dXJlIHx8IFtdO1xuXHRtZXNzYWdlcyA9IG1lc3NhZ2VzIHx8IFtdO1xuXHR2YXIgZXhwZWN0ZWRBcmdDb3VudCA9IHNpZ25hdHVyZS5sZW5ndGg7XG5cdHZhciBhY3R1YWxBcmdDb3VudCA9IGFyZ3MubGVuZ3RoO1xuXG5cdGlmIChhY3R1YWxBcmdDb3VudCA+IGV4cGVjdGVkQXJnQ291bnQpIHtcblx0XHR0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKFxuXHRcdFx0ZXhwb3J0cy5zaWduYXR1cmUsXG5cdFx0XHRcIkZ1bmN0aW9uIGNhbGxlZCB3aXRoIHRvbyBtYW55IGFyZ3VtZW50czogZXhwZWN0ZWQgXCIgKyBleHBlY3RlZEFyZ0NvdW50ICsgXCIgYnV0IGdvdCBcIiArIGFjdHVhbEFyZ0NvdW50XG5cdFx0KTtcblx0fVxuXG5cdHZhciB0eXBlLCBhcmcsIG5hbWU7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2lnbmF0dXJlLmxlbmd0aDsgaSsrKSB7XG5cdFx0dHlwZSA9IHNpZ25hdHVyZVtpXTtcblx0XHRhcmcgPSBhcmdzW2ldO1xuXHRcdG5hbWUgPSBcIkFyZ3VtZW50IFwiICsgaTtcblxuXHRcdGlmICghc2hpbS5BcnJheS5pc0FycmF5KHR5cGUpKSB0eXBlID0gWyB0eXBlIF07XG5cdFx0aWYgKCF0eXBlTWF0Y2hlcyh0eXBlLCBhcmcsIG5hbWUpKSB7XG5cdFx0XHR2YXIgbWVzc2FnZSA9IG5hbWUgKyBcIiBleHBlY3RlZCBcIiArIGV4cGxhaW5UeXBlKHR5cGUpICsgXCIsIGJ1dCB3YXMgXCI7XG5cdFx0XHR0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMuc2lnbmF0dXJlLCBtZXNzYWdlICsgZXhwbGFpbkFyZyhhcmcpKTtcblx0XHR9XG5cdH1cbn07XG5cbmZ1bmN0aW9uIHR5cGVNYXRjaGVzKHR5cGUsIGFyZykge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAob25lVHlwZU1hdGNoZXModHlwZVtpXSwgYXJnKSkgcmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xuXG5cdGZ1bmN0aW9uIG9uZVR5cGVNYXRjaGVzKHR5cGUsIGFyZykge1xuXHRcdHN3aXRjaCAoZ2V0VHlwZShhcmcpKSB7XG5cdFx0XHRjYXNlIFwiYm9vbGVhblwiOiByZXR1cm4gdHlwZSA9PT0gQm9vbGVhbjtcblx0XHRcdGNhc2UgXCJzdHJpbmdcIjogcmV0dXJuIHR5cGUgPT09IFN0cmluZztcblx0XHRcdGNhc2UgXCJudW1iZXJcIjogcmV0dXJuIHR5cGUgPT09IE51bWJlcjtcblx0XHRcdGNhc2UgXCJhcnJheVwiOiByZXR1cm4gdHlwZSA9PT0gQXJyYXk7XG5cdFx0XHRjYXNlIFwiZnVuY3Rpb25cIjogcmV0dXJuIHR5cGUgPT09IEZ1bmN0aW9uO1xuXHRcdFx0Y2FzZSBcIm9iamVjdFwiOiByZXR1cm4gdHlwZSA9PT0gT2JqZWN0IHx8IGFyZyBpbnN0YW5jZW9mIHR5cGU7XG5cdFx0XHRjYXNlIFwidW5kZWZpbmVkXCI6IHJldHVybiB0eXBlID09PSB1bmRlZmluZWQ7XG5cdFx0XHRjYXNlIFwibnVsbFwiOiByZXR1cm4gdHlwZSA9PT0gbnVsbDtcblx0XHRcdGNhc2UgXCJOYU5cIjogcmV0dXJuIGlzTmFOKHR5cGUpO1xuXG5cdFx0XHRkZWZhdWx0OiBleHBvcnRzLnVucmVhY2hhYmxlKCk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGV4cGxhaW5UeXBlKHR5cGUpIHtcblx0dmFyIGpvaW5lciA9IFwiXCI7XG5cdHZhciByZXN1bHQgPSBcIlwiO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcblx0XHRyZXN1bHQgKz0gam9pbmVyICsgZXhwbGFpbk9uZVR5cGUodHlwZVtpXSk7XG5cdFx0am9pbmVyID0gKGkgPT09IHR5cGUubGVuZ3RoIC0gMikgPyBcIiwgb3IgXCIgOiBcIiwgXCI7XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcblxuXHRmdW5jdGlvbiBleHBsYWluT25lVHlwZSh0eXBlKSB7XG5cdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRjYXNlIEJvb2xlYW46IHJldHVybiBcImJvb2xlYW5cIjtcblx0XHRcdGNhc2UgU3RyaW5nOiByZXR1cm4gXCJzdHJpbmdcIjtcblx0XHRcdGNhc2UgTnVtYmVyOiByZXR1cm4gXCJudW1iZXJcIjtcblx0XHRcdGNhc2UgQXJyYXk6IHJldHVybiBcImFycmF5XCI7XG5cdFx0XHRjYXNlIEZ1bmN0aW9uOiByZXR1cm4gXCJmdW5jdGlvblwiO1xuXHRcdFx0Y2FzZSBudWxsOiByZXR1cm4gXCJudWxsXCI7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwibnVtYmVyXCIgJiYgaXNOYU4odHlwZSkpIHJldHVybiBcIk5hTlwiO1xuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gb29wLmNsYXNzTmFtZSh0eXBlKSArIFwiIGluc3RhbmNlXCI7XG5cdFx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZXhwbGFpbkFyZyhhcmcpIHtcblx0dmFyIHR5cGUgPSBnZXRUeXBlKGFyZyk7XG5cdGlmICh0eXBlICE9PSBcIm9iamVjdFwiKSByZXR1cm4gdHlwZTtcblxuXHRyZXR1cm4gb29wLmluc3RhbmNlTmFtZShhcmcpICsgXCIgaW5zdGFuY2VcIjtcbn1cblxuZnVuY3Rpb24gZ2V0VHlwZSh2YXJpYWJsZSkge1xuXHR2YXIgdHlwZSA9IHR5cGVvZiB2YXJpYWJsZTtcblx0aWYgKHZhcmlhYmxlID09PSBudWxsKSB0eXBlID0gXCJudWxsXCI7XG5cdGlmIChzaGltLkFycmF5LmlzQXJyYXkodmFyaWFibGUpKSB0eXBlID0gXCJhcnJheVwiO1xuXHRpZiAodHlwZSA9PT0gXCJudW1iZXJcIiAmJiBpc05hTih2YXJpYWJsZSkpIHR5cGUgPSBcIk5hTlwiO1xuXHRyZXR1cm4gdHlwZTtcbn1cblxuXG4vKioqKiovXG5cbnZhciBFbnN1cmVFeGNlcHRpb24gPSBleHBvcnRzLkVuc3VyZUV4Y2VwdGlvbiA9IGZ1bmN0aW9uKGZuVG9SZW1vdmVGcm9tU3RhY2tUcmFjZSwgbWVzc2FnZSkge1xuXHRpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIGZuVG9SZW1vdmVGcm9tU3RhY2tUcmFjZSk7XG5cdGVsc2UgdGhpcy5zdGFjayA9IChuZXcgRXJyb3IoKSkuc3RhY2s7XG5cdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59O1xuRW5zdXJlRXhjZXB0aW9uLnByb3RvdHlwZSA9IHNoaW0uT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xuRW5zdXJlRXhjZXB0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVuc3VyZUV4Y2VwdGlvbjtcbkVuc3VyZUV4Y2VwdGlvbi5wcm90b3R5cGUubmFtZSA9IFwiRW5zdXJlRXhjZXB0aW9uXCI7XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIGNhbid0IHVzZSBlbnN1cmUuanMgZHVlIHRvIGNpcmN1bGFyIGRlcGVuZGVuY3lcbnZhciBzaGltID0gcmVxdWlyZShcIi4vc2hpbS5qc1wiKTtcblxuZXhwb3J0cy5jbGFzc05hbWUgPSBmdW5jdGlvbihjb25zdHJ1Y3Rvcikge1xuXHRpZiAodHlwZW9mIGNvbnN0cnVjdG9yICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcIk5vdCBhIGNvbnN0cnVjdG9yXCIpO1xuXHRyZXR1cm4gc2hpbS5GdW5jdGlvbi5uYW1lKGNvbnN0cnVjdG9yKTtcbn07XG5cbmV4cG9ydHMuaW5zdGFuY2VOYW1lID0gZnVuY3Rpb24ob2JqKSB7XG5cdHZhciBwcm90b3R5cGUgPSBzaGltLk9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopO1xuXHRpZiAocHJvdG90eXBlID09PSBudWxsKSByZXR1cm4gXCI8bm8gcHJvdG90eXBlPlwiO1xuXG5cdHZhciBjb25zdHJ1Y3RvciA9IHByb3RvdHlwZS5jb25zdHJ1Y3Rvcjtcblx0aWYgKGNvbnN0cnVjdG9yID09PSB1bmRlZmluZWQgfHwgY29uc3RydWN0b3IgPT09IG51bGwpIHJldHVybiBcIjxhbm9uPlwiO1xuXG5cdHJldHVybiBzaGltLkZ1bmN0aW9uLm5hbWUoY29uc3RydWN0b3IpO1xufTtcblxuZXhwb3J0cy5leHRlbmRGbiA9IGZ1bmN0aW9uIGV4dGVuZEZuKHBhcmVudENvbnN0cnVjdG9yKSB7XG5cdHJldHVybiBmdW5jdGlvbihjaGlsZENvbnN0cnVjdG9yKSB7XG5cdFx0Y2hpbGRDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBzaGltLk9iamVjdC5jcmVhdGUocGFyZW50Q29uc3RydWN0b3IucHJvdG90eXBlKTtcblx0XHRjaGlsZENvbnN0cnVjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGNoaWxkQ29uc3RydWN0b3I7XG5cdH07XG59O1xuXG5leHBvcnRzLm1ha2VBYnN0cmFjdCA9IGZ1bmN0aW9uIG1ha2VBYnN0cmFjdChjb25zdHJ1Y3RvciwgbWV0aG9kcykge1xuXHR2YXIgbmFtZSA9IHNoaW0uRnVuY3Rpb24ubmFtZShjb25zdHJ1Y3Rvcik7XG5cdHNoaW0uQXJyYXkuZm9yRWFjaChtZXRob2RzLCBmdW5jdGlvbihtZXRob2QpIHtcblx0XHRjb25zdHJ1Y3Rvci5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKG5hbWUgKyBcIiBzdWJjbGFzc2VzIG11c3QgaW1wbGVtZW50IFwiICsgbWV0aG9kICsgXCIoKSBtZXRob2RcIik7XG5cdFx0fTtcblx0fSk7XG5cblx0Y29uc3RydWN0b3IucHJvdG90eXBlLmNoZWNrQWJzdHJhY3RNZXRob2RzID0gZnVuY3Rpb24gY2hlY2tBYnN0cmFjdE1ldGhvZHMoKSB7XG5cdFx0dmFyIHVuaW1wbGVtZW50ZWQgPSBbXTtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0c2hpbS5BcnJheS5mb3JFYWNoKG1ldGhvZHMsIGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRcdGlmIChzZWxmW25hbWVdID09PSBjb25zdHJ1Y3Rvci5wcm90b3R5cGVbbmFtZV0pIHVuaW1wbGVtZW50ZWQucHVzaChuYW1lICsgXCIoKVwiKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gdW5pbXBsZW1lbnRlZDtcblx0fTtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLk9iamVjdCA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIE9iamVjdC5jcmVhdGUoKVxuXHRjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZShwcm90b3R5cGUpIHtcblx0XHRpZiAoT2JqZWN0LmNyZWF0ZSkgcmV0dXJuIE9iamVjdC5jcmVhdGUocHJvdG90eXBlKTtcblxuXHRcdHZhciBUZW1wID0gZnVuY3Rpb24gVGVtcCgpIHt9O1xuXHRcdFRlbXAucHJvdG90eXBlID0gcHJvdG90eXBlO1xuXHRcdHJldHVybiBuZXcgVGVtcCgpO1xuXHR9LFxuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbm8gT2JqZWN0LmdldFByb3RvdHlwZU9mXG5cdC8vIENhdXRpb246IERvZXNuJ3Qgd29yayBvbiBJRSA4IGlmIGNvbnN0cnVjdG9yIGhhcyBiZWVuIGNoYW5nZWQsIGFzIGlzIHRoZSBjYXNlIHdpdGggYSBzdWJjbGFzcy5cblx0Z2V0UHJvdG90eXBlT2Y6IGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKG9iaikge1xuXHRcdGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcblxuXHRcdHZhciByZXN1bHQgPSBvYmouY29uc3RydWN0b3IgPyBvYmouY29uc3RydWN0b3IucHJvdG90eXBlIDogbnVsbDtcblx0XHRyZXR1cm4gcmVzdWx0IHx8IG51bGw7XG5cdH0sXG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBObyBPYmplY3Qua2V5c1xuXHRrZXlzOiBmdW5jdGlvbiBrZXlzKG9iaikge1xuXHRcdGlmIChPYmplY3Qua2V5cykgcmV0dXJuIE9iamVjdC5rZXlzKG9iaik7XG5cblx0XHQvLyBGcm9tIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9rZXlzXG5cdCAgdmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcblx0ICAgICAgaGFzRG9udEVudW1CdWcgPSAhKHsgdG9TdHJpbmc6IG51bGwgfSkucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyksXG5cdCAgICAgIGRvbnRFbnVtcyA9IFtcblx0ICAgICAgICAndG9TdHJpbmcnLFxuXHQgICAgICAgICd0b0xvY2FsZVN0cmluZycsXG5cdCAgICAgICAgJ3ZhbHVlT2YnLFxuXHQgICAgICAgICdoYXNPd25Qcm9wZXJ0eScsXG5cdCAgICAgICAgJ2lzUHJvdG90eXBlT2YnLFxuXHQgICAgICAgICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsXG5cdCAgICAgICAgJ2NvbnN0cnVjdG9yJ1xuXHQgICAgICBdLFxuXHQgICAgICBkb250RW51bXNMZW5ndGggPSBkb250RW51bXMubGVuZ3RoO1xuXG5cdCAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnICYmICh0eXBlb2Ygb2JqICE9PSAnZnVuY3Rpb24nIHx8IG9iaiA9PT0gbnVsbCkpIHtcblx0ICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5rZXlzIGNhbGxlZCBvbiBub24tb2JqZWN0Jyk7XG5cdCAgfVxuXG5cdCAgdmFyIHJlc3VsdCA9IFtdLCBwcm9wLCBpO1xuXG5cdCAgZm9yIChwcm9wIGluIG9iaikge1xuXHQgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkge1xuXHQgICAgICByZXN1bHQucHVzaChwcm9wKTtcblx0ICAgIH1cblx0ICB9XG5cblx0ICBpZiAoaGFzRG9udEVudW1CdWcpIHtcblx0ICAgIGZvciAoaSA9IDA7IGkgPCBkb250RW51bXNMZW5ndGg7IGkrKykge1xuXHQgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGRvbnRFbnVtc1tpXSkpIHtcblx0ICAgICAgICByZXN1bHQucHVzaChkb250RW51bXNbaV0pO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfVxuXHQgIHJldHVybiByZXN1bHQ7XG5cdH1cblxufTtcblxuXG5leHBvcnRzLkZ1bmN0aW9uID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgOCwgSUUgOSwgSUUgMTAsIElFIDExOiBubyBmdW5jdGlvbi5uYW1lXG5cdG5hbWU6IGZ1bmN0aW9uIG5hbWUoZm4pIHtcblx0XHRpZiAoZm4ubmFtZSkgcmV0dXJuIGZuLm5hbWU7XG5cblx0XHQvLyBCYXNlZCBvbiBjb2RlIGJ5IEphc29uIEJ1bnRpbmcgZXQgYWwsIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMzMjQyOVxuXHRcdHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKyguezEsfSlcXHMqXFwoLztcblx0XHR2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XG5cdFx0cmV0dXJuIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMSkgPyByZXN1bHRzWzFdIDogXCI8YW5vbj5cIjtcblx0fSxcblxufTtcblxuXG5leHBvcnRzLkFycmF5ID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbm8gQXJyYXkuaXNBcnJheVxuXHRpc0FycmF5OiBmdW5jdGlvbiBpc0FycmF5KHRoaW5nKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkpIHJldHVybiBBcnJheS5pc0FycmF5KHRoaW5nKTtcblxuXHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGhpbmcpID09PSAnW29iamVjdCBBcnJheV0nO1xuXHR9LFxuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbm8gQXJyYXkuZm9yRWFjaFxuXHRmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKG9iaiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcblx0XHQvKmpzaGludCBiaXR3aXNlOmZhbHNlLCBlcWVxZXE6ZmFsc2UsIC1XMDQxOmZhbHNlICovXG5cblx0XHRpZiAoQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHJldHVybiBvYmouZm9yRWFjaChjYWxsYmFjaywgdGhpc0FyZyk7XG5cblx0XHQvLyBUaGlzIHdvcmthcm91bmQgYmFzZWQgb24gcG9seWZpbGwgY29kZSBmcm9tIE1ETjpcblx0XHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9mb3JFYWNoXG5cblx0XHQvLyBQcm9kdWN0aW9uIHN0ZXBzIG9mIEVDTUEtMjYyLCBFZGl0aW9uIDUsIDE1LjQuNC4xOFxuXHRcdC8vIFJlZmVyZW5jZTogaHR0cDovL2VzNS5naXRodWIuaW8vI3gxNS40LjQuMThcblxuICAgIHZhciBULCBrO1xuXG4gICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCcgdGhpcyBpcyBudWxsIG9yIG5vdCBkZWZpbmVkJyk7XG4gICAgfVxuXG4gICAgLy8gMS4gTGV0IE8gYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIFRvT2JqZWN0IHBhc3NpbmcgdGhlIHx0aGlzfCB2YWx1ZSBhcyB0aGUgYXJndW1lbnQuXG4gICAgdmFyIE8gPSBPYmplY3Qob2JqKTtcblxuICAgIC8vIDIuIExldCBsZW5WYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldCBpbnRlcm5hbCBtZXRob2Qgb2YgTyB3aXRoIHRoZSBhcmd1bWVudCBcImxlbmd0aFwiLlxuICAgIC8vIDMuIExldCBsZW4gYmUgVG9VaW50MzIobGVuVmFsdWUpLlxuICAgIHZhciBsZW4gPSBPLmxlbmd0aCA+Pj4gMDtcblxuICAgIC8vIDQuIElmIElzQ2FsbGFibGUoY2FsbGJhY2spIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG4gICAgLy8gU2VlOiBodHRwOi8vZXM1LmdpdGh1Yi5jb20vI3g5LjExXG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGNhbGxiYWNrICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuICAgIH1cblxuICAgIC8vIDUuIElmIHRoaXNBcmcgd2FzIHN1cHBsaWVkLCBsZXQgVCBiZSB0aGlzQXJnOyBlbHNlIGxldCBUIGJlIHVuZGVmaW5lZC5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIFQgPSB0aGlzQXJnO1xuICAgIH1cblxuICAgIC8vIDYuIExldCBrIGJlIDBcbiAgICBrID0gMDtcblxuICAgIC8vIDcuIFJlcGVhdCwgd2hpbGUgayA8IGxlblxuICAgIHdoaWxlIChrIDwgbGVuKSB7XG5cbiAgICAgIHZhciBrVmFsdWU7XG5cbiAgICAgIC8vIGEuIExldCBQayBiZSBUb1N0cmluZyhrKS5cbiAgICAgIC8vICAgVGhpcyBpcyBpbXBsaWNpdCBmb3IgTEhTIG9wZXJhbmRzIG9mIHRoZSBpbiBvcGVyYXRvclxuICAgICAgLy8gYi4gTGV0IGtQcmVzZW50IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgSGFzUHJvcGVydHkgaW50ZXJuYWwgbWV0aG9kIG9mIE8gd2l0aCBhcmd1bWVudCBQay5cbiAgICAgIC8vICAgVGhpcyBzdGVwIGNhbiBiZSBjb21iaW5lZCB3aXRoIGNcbiAgICAgIC8vIGMuIElmIGtQcmVzZW50IGlzIHRydWUsIHRoZW5cbiAgICAgIGlmIChrIGluIE8pIHtcblxuICAgICAgICAvLyBpLiBMZXQga1ZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0IGludGVybmFsIG1ldGhvZCBvZiBPIHdpdGggYXJndW1lbnQgUGsuXG4gICAgICAgIGtWYWx1ZSA9IE9ba107XG5cbiAgICAgICAgLy8gaWkuIENhbGwgdGhlIENhbGwgaW50ZXJuYWwgbWV0aG9kIG9mIGNhbGxiYWNrIHdpdGggVCBhcyB0aGUgdGhpcyB2YWx1ZSBhbmRcbiAgICAgICAgLy8gYXJndW1lbnQgbGlzdCBjb250YWluaW5nIGtWYWx1ZSwgaywgYW5kIE8uXG4gICAgICAgIGNhbGxiYWNrLmNhbGwoVCwga1ZhbHVlLCBrLCBPKTtcbiAgICAgIH1cbiAgICAgIC8vIGQuIEluY3JlYXNlIGsgYnkgMS5cbiAgICAgIGsrKztcbiAgICB9XG4gICAgLy8gOC4gcmV0dXJuIHVuZGVmaW5lZFxuXHR9XG5cbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgVmFsdWUgPSByZXF1aXJlKFwiLi92YWx1ZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBQaXhlbHMoYW1vdW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE51bWJlciBdKTtcblx0dGhpcy5fYW1vdW50ID0gYW1vdW50O1xufTtcblZhbHVlLmV4dGVuZChNZSk7XG5cbk1lLnByb3RvdHlwZS5jb21wYXRpYmlsaXR5ID0gZnVuY3Rpb24gY29tcGF0aWJpbGl0eSgpIHtcblx0cmV0dXJuIFsgTWUgXTtcbn07XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBwbHVzKG9wZXJhbmQpIHtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9hbW91bnQgKyBvcGVyYW5kLl9hbW91bnQpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5taW51cyA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gbWludXMob3BlcmFuZCkge1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX2Ftb3VudCAtIG9wZXJhbmQuX2Ftb3VudCk7XG59KTtcblxuTWUucHJvdG90eXBlLmNvbXBhcmUgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIGNvbXBhcmUob3BlcmFuZCkge1xuXHRyZXR1cm4gdGhpcy5fYW1vdW50IC0gb3BlcmFuZC5fYW1vdW50O1xufSk7XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gVmFsdWUuc2FmZShmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdGlmICh0aGlzLl9hbW91bnQgPT09IGV4cGVjdGVkLl9hbW91bnQpIHJldHVybiBcIlwiO1xuXHRyZXR1cm4gTWF0aC5hYnModGhpcy5fYW1vdW50IC0gZXhwZWN0ZWQuX2Ftb3VudCkgKyBcInB4XCI7XG59KTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl9hbW91bnQgKyBcInB4XCI7XG59O1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4vdmFsdWUuanNcIik7XG52YXIgUGl4ZWxzID0gcmVxdWlyZShcIi4vcGl4ZWxzLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi9zaXplLmpzXCIpO1xuXG52YXIgWF9ESU1FTlNJT04gPSBcInhcIjtcbnZhciBZX0RJTUVOU0lPTiA9IFwieVwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFBvc2l0aW9uKGRpbWVuc2lvbiwgdmFsdWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBbTnVtYmVyLCBQaXhlbHNdIF0pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fZWRnZSA9ICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpID8gbmV3IFBpeGVscyh2YWx1ZSkgOiB2YWx1ZTtcbn07XG5WYWx1ZS5leHRlbmQoTWUpO1xuXG5NZS54ID0gZnVuY3Rpb24geCh2YWx1ZSkge1xuXHRyZXR1cm4gbmV3IE1lKFhfRElNRU5TSU9OLCB2YWx1ZSk7XG59O1xuXG5NZS55ID0gZnVuY3Rpb24geSh2YWx1ZSkge1xuXHRyZXR1cm4gbmV3IE1lKFlfRElNRU5TSU9OLCB2YWx1ZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29tcGF0aWJpbGl0eSA9IGZ1bmN0aW9uIGNvbXBhdGliaWxpdHkoKSB7XG5cdHJldHVybiBbIE1lLCBTaXplIF07XG59O1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gcGx1cyhvcGVyYW5kKSB7XG5cdGVuc3VyZUNvbXBhcmFibGUodGhpcywgb3BlcmFuZCk7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fZGltZW5zaW9uLCB0aGlzLl9lZGdlLnBsdXMob3BlcmFuZC50b1BpeGVscygpKSk7XG59KTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBtaW51cyhvcGVyYW5kKSB7XG5cdGlmIChvcGVyYW5kIGluc3RhbmNlb2YgTWUpIGVuc3VyZUNvbXBhcmFibGUodGhpcywgb3BlcmFuZCk7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fZGltZW5zaW9uLCB0aGlzLl9lZGdlLm1pbnVzKG9wZXJhbmQudG9QaXhlbHMoKSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gVmFsdWUuc2FmZShmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdGVuc3VyZUNvbXBhcmFibGUodGhpcywgZXhwZWN0ZWQpO1xuXG5cdHZhciBhY3R1YWxWYWx1ZSA9IHRoaXMuX2VkZ2U7XG5cdHZhciBleHBlY3RlZFZhbHVlID0gZXhwZWN0ZWQuX2VkZ2U7XG5cdGlmIChhY3R1YWxWYWx1ZS5lcXVhbHMoZXhwZWN0ZWRWYWx1ZSkpIHJldHVybiBcIlwiO1xuXG5cdHZhciBkaXJlY3Rpb247XG5cdHZhciBjb21wYXJpc29uID0gYWN0dWFsVmFsdWUuY29tcGFyZShleHBlY3RlZFZhbHVlKTtcblx0aWYgKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIGRpcmVjdGlvbiA9IGNvbXBhcmlzb24gPCAwID8gXCJ0byB0aGUgbGVmdFwiIDogXCJ0byB0aGUgcmlnaHRcIjtcblx0ZWxzZSBkaXJlY3Rpb24gPSBjb21wYXJpc29uIDwgMCA/IFwibG93ZXJcIiA6IFwiaGlnaGVyXCI7XG5cblx0cmV0dXJuIGFjdHVhbFZhbHVlLmRpZmYoZXhwZWN0ZWRWYWx1ZSkgKyBcIiBcIiArIGRpcmVjdGlvbjtcbn0pO1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gdGhpcy5fZWRnZS50b1N0cmluZygpO1xufTtcblxuTWUucHJvdG90eXBlLnRvUGl4ZWxzID0gZnVuY3Rpb24gdG9QaXhlbHMoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX2VkZ2U7XG59O1xuXG5mdW5jdGlvbiBlbnN1cmVDb21wYXJhYmxlKHNlbGYsIG90aGVyKSB7XG5cdGlmIChvdGhlciBpbnN0YW5jZW9mIE1lKSB7XG5cdFx0ZW5zdXJlLnRoYXQoc2VsZi5fZGltZW5zaW9uID09PSBvdGhlci5fZGltZW5zaW9uLCBcIkNhbid0IGNvbXBhcmUgWCBkaW1lbnNpb24gdG8gWSBkaW1lbnNpb25cIik7XG5cdH1cbn1cbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuL3ZhbHVlLmpzXCIpO1xudmFyIFBpeGVscyA9IHJlcXVpcmUoXCIuL3BpeGVscy5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBTaXplKHZhbHVlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFtOdW1iZXIsIFBpeGVsc10gXSk7XG5cblx0dGhpcy5fZWRnZSA9ICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpID8gbmV3IFBpeGVscyh2YWx1ZSkgOiB2YWx1ZTtcbn07XG5WYWx1ZS5leHRlbmQoTWUpO1xuXG5NZS5wcm90b3R5cGUuY29tcGF0aWJpbGl0eSA9IGZ1bmN0aW9uIGNvbXBhdGliaWxpdHkoKSB7XG5cdHJldHVybiBbIE1lIF07XG59O1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IFZhbHVlLnNhZmUoZnVuY3Rpb24ob3BlcmFuZCkge1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX2VkZ2UucGx1cyhvcGVyYW5kLl9lZGdlKSk7XG59KTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gVmFsdWUuc2FmZShmdW5jdGlvbihvcGVyYW5kKSB7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fZWRnZS5taW51cyhvcGVyYW5kLl9lZGdlKSk7XG59KTtcblxuTWUucHJvdG90eXBlLmNvbXBhcmUgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uKHRoYXQpIHtcblx0cmV0dXJuIHRoaXMuX2VkZ2UuY29tcGFyZSh0aGF0Ll9lZGdlKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IFZhbHVlLnNhZmUoZnVuY3Rpb24oZXhwZWN0ZWQpIHtcblx0dmFyIGFjdHVhbFZhbHVlID0gdGhpcy5fZWRnZTtcblx0dmFyIGV4cGVjdGVkVmFsdWUgPSBleHBlY3RlZC5fZWRnZTtcblxuXHRpZiAoYWN0dWFsVmFsdWUuZXF1YWxzKGV4cGVjdGVkVmFsdWUpKSByZXR1cm4gXCJcIjtcblxuXHR2YXIgZGVzYyA9IGFjdHVhbFZhbHVlLmNvbXBhcmUoZXhwZWN0ZWRWYWx1ZSkgPiAwID8gXCIgbGFyZ2VyXCIgOiBcIiBzbWFsbGVyXCI7XG5cdHJldHVybiBhY3R1YWxWYWx1ZS5kaWZmKGV4cGVjdGVkVmFsdWUpICsgZGVzYztcbn0pO1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX2VkZ2UudG9TdHJpbmcoKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1BpeGVscyA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fZWRnZTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIHNoaW0gPSByZXF1aXJlKFwiLi4vdXRpbC9zaGltLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFZhbHVlKCkge307XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xub29wLm1ha2VBYnN0cmFjdChNZSwgW1xuXHRcImRpZmZcIixcblx0XCJ0b1N0cmluZ1wiLFxuXHRcImNvbXBhdGliaWxpdHlcIlxuXSk7XG5cbk1lLnNhZmUgPSBmdW5jdGlvbiBzYWZlKGZuKSB7XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRlbnN1cmVDb21wYXRpYmlsaXR5KHRoaXMsIHRoaXMuY29tcGF0aWJpbGl0eSgpLCBhcmd1bWVudHMpO1xuXHRcdHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHR9O1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdHJldHVybiB0aGlzLmRpZmYodGhhdCkgPT09IFwiXCI7XG59O1xuXG5mdW5jdGlvbiBlbnN1cmVDb21wYXRpYmlsaXR5KHNlbGYsIGNvbXBhdGlibGUsIGFyZ3MpIHtcblx0dmFyIGFyZztcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7ICAgLy8gYXJncyBpcyBub3QgYW4gQXJyYXksIGNhbid0IHVzZSBmb3JFYWNoXG5cdFx0YXJnID0gYXJnc1tpXTtcblx0XHRjaGVja09uZUFyZyhzZWxmLCBjb21wYXRpYmxlLCBhcmcpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNoZWNrT25lQXJnKHNlbGYsIGNvbXBhdGlibGUsIGFyZykge1xuXHR2YXIgdHlwZSA9IHR5cGVvZiBhcmc7XG5cdGlmIChhcmcgPT09IG51bGwpIHR5cGUgPSBcIm51bGxcIjtcblx0aWYgKHR5cGUgIT09IFwib2JqZWN0XCIpIHRocm93RXJyb3IodHlwZSk7XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb21wYXRpYmxlLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKGFyZyBpbnN0YW5jZW9mIGNvbXBhdGlibGVbaV0pIHJldHVybjtcblx0fVxuXHR0aHJvd0Vycm9yKG9vcC5pbnN0YW5jZU5hbWUoYXJnKSk7XG5cblx0ZnVuY3Rpb24gdGhyb3dFcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKG9vcC5pbnN0YW5jZU5hbWUoc2VsZikgKyBcIiBpc24ndCBjb21wYXRpYmxlIHdpdGggXCIgKyB0eXBlKTtcblx0fVxufSIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuXHRpZiAoc3RyLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBzdHI7XG5cdH1cblxuXHRyZXR1cm4gc3RyXG5cdC5yZXBsYWNlKC9eW18uXFwtIF0rLywgJycpXG5cdC50b0xvd2VyQ2FzZSgpXG5cdC5yZXBsYWNlKC9bXy5cXC0gXSsoXFx3fCQpL2csIGZ1bmN0aW9uIChtLCBwMSkge1xuXHRcdHJldHVybiBwMS50b1VwcGVyQ2FzZSgpO1xuXHR9KTtcbn07XG4iXX0=

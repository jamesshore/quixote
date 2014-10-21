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

},{"../util/ensure.js":11,"../util/oop.js":12,"../values/value.js":17}],2:[function(require,module,exports){
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
},{"../q_element.js":9,"../util/ensure.js":11,"../values/position.js":15,"./descriptor.js":1,"./relative_position.js":5}],3:[function(require,module,exports){
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
	this._value = position;
};
Descriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.plus = function plus(amount) {
	ensure.signature(arguments, [ [Number, ElementSize] ]);

	if (this._value === RIGHT || this._value === LEFT) return RelativePosition.right(this, amount);
	if (this._value === TOP || this._value === BOTTOM) return RelativePosition.down(this, amount);
};

Me.prototype.minus = function minus(amount) {
	ensure.signature(arguments, [ [Number, ElementSize] ]);

	if (this._value === RIGHT || this._value === LEFT) return RelativePosition.left(this, amount);
	if (this._value === TOP || this._value === BOTTOM) return RelativePosition.up(this, amount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var result = this._element.getRawPosition()[this._value];
	return createPosition(this, result);
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "number") return createPosition(this, arg);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._value + " edge of " + this._element;
};

function factoryFn(position) {
	return function factory(element) {
		return new Me(element, position);
	};
}

function createPosition(self, value) {
	if (self._value === TOP || self._value === BOTTOM) return Position.y(value);
	if (self._value === RIGHT || self._value === LEFT) return Position.x(value);
}
},{"../q_element.js":9,"../util/ensure.js":11,"../values/position.js":15,"./descriptor.js":1,"./element_size.js":4,"./relative_position.js":5}],4:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");
var RelativeSize = require("./relative_size.js");
var SizeMultiple = require("./size_multiple.js");

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

Me.prototype.times = function times(amount) {
	return SizeMultiple.create(this, amount);
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
},{"../q_element.js":9,"../util/ensure.js":11,"../values/size.js":16,"./descriptor.js":1,"./relative_size.js":6,"./size_multiple.js":7}],5:[function(require,module,exports){
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

},{"../util/ensure.js":11,"../values/pixels.js":14,"../values/position.js":15,"../values/size.js":16,"./descriptor.js":1,"./element_center.js":2,"./element_edge.js":3,"./element_size.js":4}],6:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Size = require("../values/size.js");
var Descriptor = require("./descriptor.js");
var SizeMultiple = require("./size_multiple.js");

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

Me.prototype.times = function times(amount) {
	return SizeMultiple.create(this, amount);
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


},{"../util/ensure.js":11,"../values/size.js":16,"./descriptor.js":1,"./element_size.js":4,"./size_multiple.js":7}],7:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var Size = require("../values/size.js");

var Me = module.exports = function SizeMultiple(relativeTo, multiple) {
	var ElementSize = require("./element_size.js");
	ensure.signature(arguments, [ Descriptor, Number ]);

	this._relativeTo = relativeTo;
	this._multiple = multiple;
};
Descriptor.extend(Me);

Me.create = function create(relativeTo, multiple) {
	return new Me(relativeTo, multiple);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	return this._relativeTo.value().multiply(this._multiple);
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "number") return new Size(arg);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	var multiple = this._multiple;
	var base = this._relativeTo.toString();
	if (multiple === 1) return base;

	var desc;
	switch(multiple) {
		case 1/2: desc = "half of "; break;
		case 1/3: desc = "one third of "; break;
		case 2/3: desc = "two thirds of "; break;
		case 1/4: desc = "one quarter of "; break;
		case 3/4: desc = "three quarters of "; break;
		case 1/5: desc = "one fifth of "; break;
		case 2/5: desc = "two fifths of "; break;
		case 3/5: desc = "three fifths of "; break;
		case 4/5: desc = "four fifths of "; break;
		case 1/6: desc = "one sixth of "; break;
		case 5/6: desc = "five sixths of "; break;
		case 1/8: desc = "one eighth of "; break;
		case 3/8: desc = "three eighths of "; break;
		case 5/8: desc = "five eighths of "; break;
		case 7/8: desc = "seven eighths of "; break;
		default:
			if (multiple > 1) desc = multiple + " times ";
			else desc = (multiple * 100) + "% of ";
	}

	return desc + base;
};
},{"../util/ensure.js":11,"../values/size.js":16,"./descriptor.js":1,"./element_size.js":4}],8:[function(require,module,exports){
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

},{"./q_element.js":9,"./util/ensure.js":11}],9:[function(require,module,exports){
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

},{"../vendor/camelcase-1.0.1-modified.js":18,"./descriptors/element_center.js":2,"./descriptors/element_edge.js":3,"./descriptors/element_size.js":4,"./util/ensure.js":11,"./util/shim.js":13}],10:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var Frame = require("./frame.js");

exports.createFrame = function(width, height, options, callback) {
	return Frame.create(document.body, width, height, options, callback);
};
},{"./frame.js":8,"./util/ensure.js":11}],11:[function(require,module,exports){
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

},{"./oop.js":12,"./shim.js":13}],12:[function(require,module,exports){
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
},{"./shim.js":13}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

Me.prototype.multiply = function multiply(operand) {
	ensure.signature(arguments, [ Number ]);

	return new Me(this._amount * operand);
};

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

},{"../util/ensure.js":11,"./value.js":17}],15:[function(require,module,exports){
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
	this._value = (typeof value === "number") ? new Pixels(value) : value;
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
	if (this._dimension === X_DIMENSION) direction = comparison < 0 ? "to the left" : "to the right";
	else direction = comparison < 0 ? "lower" : "higher";

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

},{"../util/ensure.js":11,"./pixels.js":14,"./size.js":16,"./value.js":17}],16:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");
var Pixels = require("./pixels.js");

var Me = module.exports = function Size(value) {
	ensure.signature(arguments, [ [Number, Pixels] ]);

	this._value = (typeof value === "number") ? new Pixels(value) : value;
};
Value.extend(Me);

Me.prototype.compatibility = function compatibility() {
	return [ Me ];
};

Me.prototype.plus = Value.safe(function plus(operand) {
	return new Me(this._value.plus(operand._value));
});

Me.prototype.minus = Value.safe(function minus(operand) {
	return new Me(this._value.minus(operand._value));
});

Me.prototype.multiply = function multiply(operand) {
	return new Me(this._value.multiply(operand));
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

},{"../util/ensure.js":11,"./pixels.js":14,"./value.js":17}],17:[function(require,module,exports){
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
},{"../util/ensure.js":11,"../util/oop.js":12,"../util/shim.js":13}],18:[function(require,module,exports){
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

},{}]},{},[10])(10)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9kZXNjcmlwdG9yLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvZGVzY3JpcHRvcnMvZWxlbWVudF9jZW50ZXIuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9lbGVtZW50X2VkZ2UuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9lbGVtZW50X3NpemUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9yZWxhdGl2ZV9wb3NpdGlvbi5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL2Rlc2NyaXB0b3JzL3JlbGF0aXZlX3NpemUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9zaXplX211bHRpcGxlLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvZnJhbWUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9xX2VsZW1lbnQuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9xdWl4b3RlLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvdXRpbC9lbnN1cmUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy91dGlsL29vcC5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3V0aWwvc2hpbS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3ZhbHVlcy9waXhlbHMuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy92YWx1ZXMvcG9zaXRpb24uanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy92YWx1ZXMvc2l6ZS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3ZhbHVlcy92YWx1ZS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvdmVuZG9yL2NhbWVsY2FzZS0xLjAuMS1tb2RpZmllZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4uL3ZhbHVlcy92YWx1ZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBEZXNjcmlwdG9yKCkge307XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xub29wLm1ha2VBYnN0cmFjdChNZSwgW1xuXHRcInZhbHVlXCIsXG5cdFwidG9TdHJpbmdcIlxuXSk7XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHRleHBlY3RlZCA9IG5vcm1hbGl6ZVR5cGUodGhpcywgZXhwZWN0ZWQpO1xuXHR0cnkge1xuXHRcdHZhciBhY3R1YWxWYWx1ZSA9IHRoaXMudmFsdWUoKTtcblx0XHR2YXIgZXhwZWN0ZWRWYWx1ZSA9IGV4cGVjdGVkLnZhbHVlKCk7XG5cblx0XHRpZiAoYWN0dWFsVmFsdWUuZXF1YWxzKGV4cGVjdGVkVmFsdWUpKSByZXR1cm4gXCJcIjtcblxuXHRcdHZhciBkaWZmZXJlbmNlID0gYWN0dWFsVmFsdWUuZGlmZihleHBlY3RlZFZhbHVlKTtcblx0XHR2YXIgZXhwZWN0ZWREZXNjID0gZXhwZWN0ZWRWYWx1ZS50b1N0cmluZygpO1xuXHRcdGlmIChleHBlY3RlZCBpbnN0YW5jZW9mIE1lKSBleHBlY3RlZERlc2MgKz0gXCIgKFwiICsgZXhwZWN0ZWQgKyBcIilcIjtcblxuXHRcdHJldHVybiB0aGlzICsgXCIgd2FzIFwiICsgZGlmZmVyZW5jZSArIFwiIHRoYW4gZXhwZWN0ZWQuXFxuXCIgK1xuXHRcdFx0XCIgIEV4cGVjdGVkOiBcIiArIGV4cGVjdGVkRGVzYyArIFwiXFxuXCIgK1xuXHRcdFx0XCIgIEJ1dCB3YXM6ICBcIiArIGFjdHVhbFZhbHVlO1xuXHR9XG5cdGNhdGNoIChlcnIpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb21wYXJlIFwiICsgdGhpcyArIFwiIHRvIFwiICsgZXhwZWN0ZWQgKyBcIjogXCIgKyBlcnIubWVzc2FnZSk7XG5cdH1cbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0Ly8gVGhpcyBtZXRob2QgaXMgbWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBieSBzdWJjbGFzc2VzLiBJdCBzaG91bGQgcmV0dXJuICd1bmRlZmluZWQnIHdoZW4gYW4gYXJndW1lbnRcblx0Ly8gY2FuJ3QgYmUgY29udmVydGVkLiBJbiB0aGlzIGRlZmF1bHQgaW1wbGVtZW50YXRpb24sIG5vIGFyZ3VtZW50cyBjYW4gYmUgY29udmVydGVkLCBzbyB3ZSBhbHdheXNcblx0Ly8gcmV0dXJuICd1bmRlZmluZWQnLlxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdC8vIERlc2NyaXB0b3JzIGFyZW4ndCB2YWx1ZSBvYmplY3RzLiBUaGV5J3JlIG5ldmVyIGVxdWFsIHRvIGFueXRoaW5nLiBCdXQgc29tZXRpbWVzXG5cdC8vIHRoZXkncmUgdXNlZCBpbiB0aGUgc2FtZSBwbGFjZXMgdmFsdWUgb2JqZWN0cyBhcmUgdXNlZCwgYW5kIHRoaXMgbWV0aG9kIGdldHMgY2FsbGVkLlxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiBub3JtYWxpemVUeXBlKHNlbGYsIGV4cGVjdGVkKSB7XG5cdHZhciBleHBlY3RlZFR5cGUgPSB0eXBlb2YgZXhwZWN0ZWQ7XG5cdGlmIChleHBlY3RlZCA9PT0gbnVsbCkgZXhwZWN0ZWRUeXBlID0gXCJudWxsXCI7XG5cblx0aWYgKGV4cGVjdGVkVHlwZSA9PT0gXCJvYmplY3RcIiAmJiAoZXhwZWN0ZWQgaW5zdGFuY2VvZiBNZSB8fCBleHBlY3RlZCBpbnN0YW5jZW9mIFZhbHVlKSkgcmV0dXJuIGV4cGVjdGVkO1xuXG5cdGlmIChleHBlY3RlZCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY29tcGFyZSBcIiArIHNlbGYgKyBcIiB0byBcIiArIGV4cGVjdGVkICsgXCIuIERpZCB5b3UgbWlzc3BlbGwgYSBwcm9wZXJ0eSBuYW1lP1wiKTtcblx0fVxuXHRlbHNlIGlmIChleHBlY3RlZFR5cGUgPT09IFwib2JqZWN0XCIpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb21wYXJlIFwiICsgc2VsZiArIFwiIHRvIFwiICsgb29wLmluc3RhbmNlTmFtZShleHBlY3RlZCkgKyBcIiBpbnN0YW5jZXMuXCIpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdGV4cGVjdGVkID0gc2VsZi5jb252ZXJ0KGV4cGVjdGVkLCBleHBlY3RlZFR5cGUpO1xuXHRcdGlmIChleHBlY3RlZCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb21wYXJlIFwiICsgc2VsZiArIFwiIHRvIFwiICsgZXhwZWN0ZWRUeXBlICsgXCIuXCIpO1xuXHR9XG5cblx0cmV0dXJuIGV4cGVjdGVkO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcbnZhciBSZWxhdGl2ZVBvc2l0aW9uID0gcmVxdWlyZShcIi4vcmVsYXRpdmVfcG9zaXRpb24uanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudENlbnRlcihkaW1lbnNpb24sIGVsZW1lbnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCByZXF1aXJlKFwiLi4vcV9lbGVtZW50LmpzXCIpIF0pO1xuXHRlbnN1cmUudGhhdChkaW1lbnNpb24gPT09IFhfRElNRU5TSU9OIHx8IGRpbWVuc2lvbiA9PT0gWV9ESU1FTlNJT04sIFwiVW5yZWNvZ25pemVkIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS54ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuXHRyZXR1cm4gbmV3IE1lKFhfRElNRU5TSU9OLCBlbGVtZW50KTtcbn07XG5cbk1lLnkgPSBmdW5jdGlvbihlbGVtZW50KSB7XG5cdHJldHVybiBuZXcgTWUoWV9ESU1FTlNJT04sIGVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBmdW5jdGlvbiBwbHVzKGFtb3VudCkge1xuXHRpZiAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgcmV0dXJuIFJlbGF0aXZlUG9zaXRpb24ucmlnaHQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbi5kb3duKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBmdW5jdGlvbiBtaW51cyhhbW91bnQpIHtcblx0aWYgKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uLmxlZnQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbi51cCh0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIHBvc2l0aW9uID0gdGhpcy5fZWxlbWVudC5nZXRSYXdQb3NpdGlvbigpO1xuXG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZXR1cm4gUG9zaXRpb24ueChwb3NpdGlvbi5sZWZ0ICsgKChwb3NpdGlvbi5yaWdodCAtIHBvc2l0aW9uLmxlZnQpIC8gMikpO1xuXHRlbHNlIHJldHVybiBQb3NpdGlvbi55KHBvc2l0aW9uLnRvcCArICgocG9zaXRpb24uYm90dG9tIC0gcG9zaXRpb24udG9wKSAvIDIpKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHJldHVybiAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgPyBQb3NpdGlvbi54KGFyZykgOiBQb3NpdGlvbi55KGFyZyk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgZGVzY3JpcHRpb24gPSAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgPyBcImNlbnRlclwiIDogXCJtaWRkbGVcIjtcblx0cmV0dXJuIGRlc2NyaXB0aW9uICsgXCIgb2YgXCIgKyB0aGlzLl9lbGVtZW50O1xufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xudmFyIFJlbGF0aXZlUG9zaXRpb24gPSByZXF1aXJlKFwiLi9yZWxhdGl2ZV9wb3NpdGlvbi5qc1wiKTtcbnZhciBEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvci5qc1wiKTtcbnZhciBFbGVtZW50U2l6ZSA9IHJlcXVpcmUoXCIuL2VsZW1lbnRfc2l6ZS5qc1wiKTtcblxudmFyIFRPUCA9IFwidG9wXCI7XG52YXIgUklHSFQgPSBcInJpZ2h0XCI7XG52YXIgQk9UVE9NID0gXCJib3R0b21cIjtcbnZhciBMRUZUID0gXCJsZWZ0XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudEVkZ2UoZWxlbWVudCwgcG9zaXRpb24pIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgcmVxdWlyZShcIi4uL3FfZWxlbWVudC5qc1wiKSwgU3RyaW5nIF0pO1xuXHRlbnN1cmUudGhhdChcblx0XHRwb3NpdGlvbiA9PT0gVE9QIHx8IHBvc2l0aW9uID09PSBSSUdIVCB8fCBwb3NpdGlvbiA9PT0gQk9UVE9NIHx8IHBvc2l0aW9uID09PSBMRUZULFxuXHRcdFwiVW5rbm93biBwb3NpdGlvbjogXCIgKyBwb3NpdGlvblxuXHQpO1xuXG5cdHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuXHR0aGlzLl92YWx1ZSA9IHBvc2l0aW9uO1xufTtcbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUudG9wID0gZmFjdG9yeUZuKFRPUCk7XG5NZS5yaWdodCA9IGZhY3RvcnlGbihSSUdIVCk7XG5NZS5ib3R0b20gPSBmYWN0b3J5Rm4oQk9UVE9NKTtcbk1lLmxlZnQgPSBmYWN0b3J5Rm4oTEVGVCk7XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gZnVuY3Rpb24gcGx1cyhhbW91bnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgW051bWJlciwgRWxlbWVudFNpemVdIF0pO1xuXG5cdGlmICh0aGlzLl92YWx1ZSA9PT0gUklHSFQgfHwgdGhpcy5fdmFsdWUgPT09IExFRlQpIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uLnJpZ2h0KHRoaXMsIGFtb3VudCk7XG5cdGlmICh0aGlzLl92YWx1ZSA9PT0gVE9QIHx8IHRoaXMuX3ZhbHVlID09PSBCT1RUT00pIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uLmRvd24odGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5taW51cyA9IGZ1bmN0aW9uIG1pbnVzKGFtb3VudCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBbTnVtYmVyLCBFbGVtZW50U2l6ZV0gXSk7XG5cblx0aWYgKHRoaXMuX3ZhbHVlID09PSBSSUdIVCB8fCB0aGlzLl92YWx1ZSA9PT0gTEVGVCkgcmV0dXJuIFJlbGF0aXZlUG9zaXRpb24ubGVmdCh0aGlzLCBhbW91bnQpO1xuXHRpZiAodGhpcy5fdmFsdWUgPT09IFRPUCB8fCB0aGlzLl92YWx1ZSA9PT0gQk9UVE9NKSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbi51cCh0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIHJlc3VsdCA9IHRoaXMuX2VsZW1lbnQuZ2V0UmF3UG9zaXRpb24oKVt0aGlzLl92YWx1ZV07XG5cdHJldHVybiBjcmVhdGVQb3NpdGlvbih0aGlzLCByZXN1bHQpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGFyZywgdHlwZSkge1xuXHRpZiAodHlwZSA9PT0gXCJudW1iZXJcIikgcmV0dXJuIGNyZWF0ZVBvc2l0aW9uKHRoaXMsIGFyZyk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX3ZhbHVlICsgXCIgZWRnZSBvZiBcIiArIHRoaXMuX2VsZW1lbnQ7XG59O1xuXG5mdW5jdGlvbiBmYWN0b3J5Rm4ocG9zaXRpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkoZWxlbWVudCkge1xuXHRcdHJldHVybiBuZXcgTWUoZWxlbWVudCwgcG9zaXRpb24pO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQb3NpdGlvbihzZWxmLCB2YWx1ZSkge1xuXHRpZiAoc2VsZi5fdmFsdWUgPT09IFRPUCB8fCBzZWxmLl92YWx1ZSA9PT0gQk9UVE9NKSByZXR1cm4gUG9zaXRpb24ueSh2YWx1ZSk7XG5cdGlmIChzZWxmLl92YWx1ZSA9PT0gUklHSFQgfHwgc2VsZi5fdmFsdWUgPT09IExFRlQpIHJldHVybiBQb3NpdGlvbi54KHZhbHVlKTtcbn0iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvc2l6ZS5qc1wiKTtcbnZhciBSZWxhdGl2ZVNpemUgPSByZXF1aXJlKFwiLi9yZWxhdGl2ZV9zaXplLmpzXCIpO1xudmFyIFNpemVNdWx0aXBsZSA9IHJlcXVpcmUoXCIuL3NpemVfbXVsdGlwbGUuanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudFNpemUoZGltZW5zaW9uLCBlbGVtZW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZywgcmVxdWlyZShcIi4uL3FfZWxlbWVudC5qc1wiKSBdKTtcblx0ZW5zdXJlLnRoYXQoZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTiB8fCBkaW1lbnNpb24gPT09IFlfRElNRU5TSU9OLCBcIlVucmVjb2duaXplZCBkaW1lbnNpb246IFwiICsgZGltZW5zaW9uKTtcblxuXHR0aGlzLl9kaW1lbnNpb24gPSBkaW1lbnNpb247XG5cdHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xufTtcbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUueCA9IGZ1bmN0aW9uIHgoZWxlbWVudCkge1xuXHRyZXR1cm4gbmV3IE1lKFhfRElNRU5TSU9OLCBlbGVtZW50KTtcbn07XG5cbk1lLnkgPSBmdW5jdGlvbiB5KGVsZW1lbnQpIHtcblx0cmV0dXJuIG5ldyBNZShZX0RJTUVOU0lPTiwgZWxlbWVudCk7XG59O1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IGZ1bmN0aW9uIHBsdXMoYW1vdW50KSB7XG5cdHJldHVybiBSZWxhdGl2ZVNpemUubGFyZ2VyKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBmdW5jdGlvbiBtaW51cyhhbW91bnQpIHtcblx0cmV0dXJuIFJlbGF0aXZlU2l6ZS5zbWFsbGVyKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUudGltZXMgPSBmdW5jdGlvbiB0aW1lcyhhbW91bnQpIHtcblx0cmV0dXJuIFNpemVNdWx0aXBsZS5jcmVhdGUodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBwb3NpdGlvbiA9IHRoaXMuX2VsZW1lbnQuZ2V0UmF3UG9zaXRpb24oKTtcblx0dmFyIHJlc3VsdCA9ICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSA/IHBvc2l0aW9uLndpZHRoIDogcG9zaXRpb24uaGVpZ2h0O1xuXG5cdHJldHVybiBuZXcgU2l6ZShyZXN1bHQpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGFyZywgdHlwZSkge1xuXHRpZiAodHlwZSA9PT0gXCJudW1iZXJcIikgcmV0dXJuIG5ldyBTaXplKGFyZyk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgZGVzYyA9ICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSA/IFwid2lkdGhcIiA6IFwiaGVpZ2h0XCI7XG5cdHJldHVybiBkZXNjICsgXCIgb2YgXCIgKyB0aGlzLl9lbGVtZW50O1xufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG52YXIgUGl4ZWxzID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9waXhlbHMuanNcIik7XG52YXIgRWxlbWVudFNpemUgPSByZXF1aXJlKFwiLi9lbGVtZW50X3NpemUuanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG52YXIgUExVUyA9IDE7XG52YXIgTUlOVVMgPSAtMTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBSZWxhdGl2ZVBvc2l0aW9uKGRpbWVuc2lvbiwgZGlyZWN0aW9uLCByZWxhdGl2ZVRvLCByZWxhdGl2ZUFtb3VudCkge1xuXHR2YXIgRWxlbWVudEVkZ2UgPSByZXF1aXJlKFwiLi9lbGVtZW50X2VkZ2UuanNcIik7ICAgICAgIC8vIHJlcXVpcmUoKSBpcyBoZXJlIGR1ZSB0byBjaXJjdWxhciBkZXBlbmRlbmN5XG5cdHZhciBFbGVtZW50Q2VudGVyID0gcmVxdWlyZShcIi4vZWxlbWVudF9jZW50ZXIuanNcIik7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZywgTnVtYmVyLCBEZXNjcmlwdG9yLCBbTnVtYmVyLCBEZXNjcmlwdG9yXSBdKTtcblx0ZW5zdXJlLnRoYXQoZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTiB8fCBkaW1lbnNpb24gPT09IFlfRElNRU5TSU9OLCBcIlVucmVjb2duaXplZCBkaW1lbnNpb246IFwiICsgZGltZW5zaW9uKTtcblxuXHR0aGlzLl9kaW1lbnNpb24gPSBkaW1lbnNpb247XG5cdHRoaXMuX2RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcblx0dGhpcy5fcmVsYXRpdmVUbyA9IHJlbGF0aXZlVG87XG5cblx0aWYgKHR5cGVvZiByZWxhdGl2ZUFtb3VudCA9PT0gXCJudW1iZXJcIikge1xuXHRcdGlmIChyZWxhdGl2ZUFtb3VudCA8IDApIHRoaXMuX2RpcmVjdGlvbiAqPSAtMTtcblx0XHR0aGlzLl9hbW91bnQgPSBuZXcgU2l6ZShNYXRoLmFicyhyZWxhdGl2ZUFtb3VudCkpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHRoaXMuX2Ftb3VudCA9IHJlbGF0aXZlQW1vdW50O1xuXHR9XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS5yaWdodCA9IGNyZWF0ZUZuKFhfRElNRU5TSU9OLCBQTFVTKTtcbk1lLmRvd24gPSBjcmVhdGVGbihZX0RJTUVOU0lPTiwgUExVUyk7XG5NZS5sZWZ0ID0gY3JlYXRlRm4oWF9ESU1FTlNJT04sIE1JTlVTKTtcbk1lLnVwID0gY3JlYXRlRm4oWV9ESU1FTlNJT04sIE1JTlVTKTtcblxuZnVuY3Rpb24gY3JlYXRlRm4oZGltZW5zaW9uLCBkaXJlY3Rpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGNyZWF0ZShyZWxhdGl2ZVRvLCByZWxhdGl2ZUFtb3VudCkge1xuXHRcdHJldHVybiBuZXcgTWUoZGltZW5zaW9uLCBkaXJlY3Rpb24sIHJlbGF0aXZlVG8sIHJlbGF0aXZlQW1vdW50KTtcblx0fTtcbn1cblxuTWUucHJvdG90eXBlLnBsdXMgPSBmdW5jdGlvbiBwbHVzKGFtb3VudCkge1xuXHRpZiAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgcmV0dXJuIE1lLnJpZ2h0KHRoaXMsIGFtb3VudCk7XG5cdGVsc2UgcmV0dXJuIE1lLmRvd24odGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5taW51cyA9IGZ1bmN0aW9uIG1pbnVzKGFtb3VudCkge1xuXHRpZiAodGhpcy5fZGltZW5zaW9uID09PSBZX0RJTUVOU0lPTikgcmV0dXJuIE1lLmxlZnQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gTWUudXAodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBiYXNlVmFsdWUgPSB0aGlzLl9yZWxhdGl2ZVRvLnZhbHVlKCk7XG5cdHZhciByZWxhdGl2ZVZhbHVlID0gdGhpcy5fYW1vdW50LnZhbHVlKCk7XG5cblx0aWYgKHRoaXMuX2RpcmVjdGlvbiA9PT0gUExVUykgcmV0dXJuIGJhc2VWYWx1ZS5wbHVzKHJlbGF0aXZlVmFsdWUpO1xuXHRlbHNlIHJldHVybiBiYXNlVmFsdWUubWludXMocmVsYXRpdmVWYWx1ZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoYXJnLCB0eXBlKSB7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiKSByZXR1cm4gY3JlYXRlUG9zaXRpb24odGhpcywgYXJnKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBiYXNlID0gdGhpcy5fcmVsYXRpdmVUby50b1N0cmluZygpO1xuXHRpZiAodGhpcy5fYW1vdW50LmVxdWFscyhuZXcgU2l6ZSgwKSkpIHJldHVybiBiYXNlO1xuXG5cdHZhciByZWxhdGlvbiA9IHRoaXMuX2Ftb3VudC50b1N0cmluZygpO1xuXHRpZiAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgcmVsYXRpb24gKz0gKHRoaXMuX2RpcmVjdGlvbiA9PT0gUExVUykgPyBcIiB0byByaWdodCBvZiBcIiA6IFwiIHRvIGxlZnQgb2YgXCI7XG5cdGVsc2UgcmVsYXRpb24gKz0gKHRoaXMuX2RpcmVjdGlvbiA9PT0gUExVUykgPyBcIiBiZWxvdyBcIiA6IFwiIGFib3ZlIFwiO1xuXG5cdHJldHVybiByZWxhdGlvbiArIGJhc2U7XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVQb3NpdGlvbihzZWxmLCB2YWx1ZSkge1xuXHRpZiAoc2VsZi5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgcmV0dXJuIFBvc2l0aW9uLngodmFsdWUpO1xuXHRlbHNlIHJldHVybiBQb3NpdGlvbi55KHZhbHVlKTtcbn1cbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBTaXplID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9zaXplLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemVNdWx0aXBsZSA9IHJlcXVpcmUoXCIuL3NpemVfbXVsdGlwbGUuanNcIik7XG5cbnZhciBQTFVTID0gMTtcbnZhciBNSU5VUyA9IC0xO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFJlbGF0aXZlU2l6ZShkaXJlY3Rpb24sIHJlbGF0aXZlVG8sIGFtb3VudCkge1xuXHR2YXIgRWxlbWVudFNpemUgPSByZXF1aXJlKFwiLi9lbGVtZW50X3NpemUuanNcIik7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE51bWJlciwgRGVzY3JpcHRvciwgW051bWJlciwgRGVzY3JpcHRvcl0gXSk7XG5cblx0dGhpcy5fZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuXHR0aGlzLl9yZWxhdGl2ZVRvID0gcmVsYXRpdmVUbztcblxuXHRpZiAodHlwZW9mIGFtb3VudCA9PT0gXCJudW1iZXJcIikge1xuXHRcdHRoaXMuX2Ftb3VudCA9IG5ldyBTaXplKE1hdGguYWJzKGFtb3VudCkpO1xuXHRcdGlmIChhbW91bnQgPCAwKSB0aGlzLl9kaXJlY3Rpb24gKj0gLTE7XG5cdH1cblx0ZWxzZSB7XG5cdFx0dGhpcy5fYW1vdW50ID0gYW1vdW50O1xuXHR9XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS5sYXJnZXIgPSBmdW5jdGlvbiBsYXJnZXIocmVsYXRpdmVUbywgYW1vdW50KSB7XG5cdHJldHVybiBuZXcgTWUoUExVUywgcmVsYXRpdmVUbywgYW1vdW50KTtcbn07XG5cbk1lLnNtYWxsZXIgPSBmdW5jdGlvbiBzbWFsbGVyKHJlbGF0aXZlVG8sIGFtb3VudCkge1xuXHRyZXR1cm4gbmV3IE1lKE1JTlVTLCByZWxhdGl2ZVRvLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBmdW5jdGlvbiBwbHVzKGFtb3VudCkge1xuXHRyZXR1cm4gTWUubGFyZ2VyKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBmdW5jdGlvbiBtaW51cyhhbW91bnQpIHtcblx0cmV0dXJuIE1lLnNtYWxsZXIodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS50aW1lcyA9IGZ1bmN0aW9uIHRpbWVzKGFtb3VudCkge1xuXHRyZXR1cm4gU2l6ZU11bHRpcGxlLmNyZWF0ZSh0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2VWYWx1ZSA9IHRoaXMuX3JlbGF0aXZlVG8udmFsdWUoKTtcblx0dmFyIHJlbGF0aXZlVmFsdWUgPSB0aGlzLl9hbW91bnQudmFsdWUoKTtcblxuXHRpZiAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSByZXR1cm4gYmFzZVZhbHVlLnBsdXMocmVsYXRpdmVWYWx1ZSk7XG5cdGVsc2UgcmV0dXJuIGJhc2VWYWx1ZS5taW51cyhyZWxhdGl2ZVZhbHVlKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHJldHVybiBuZXcgU2l6ZShhcmcpO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2UgPSB0aGlzLl9yZWxhdGl2ZVRvLnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9hbW91bnQuZXF1YWxzKG5ldyBTaXplKDApKSkgcmV0dXJuIGJhc2U7XG5cblx0dmFyIHJlbGF0aW9uID0gdGhpcy5fYW1vdW50LnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9kaXJlY3Rpb24gPT09IFBMVVMpIHJlbGF0aW9uICs9IFwiIGxhcmdlciB0aGFuIFwiO1xuXHRlbHNlIHJlbGF0aW9uICs9IFwiIHNtYWxsZXIgdGhhbiBcIjtcblxuXHRyZXR1cm4gcmVsYXRpb24gKyBiYXNlO1xufTtcblxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU2l6ZU11bHRpcGxlKHJlbGF0aXZlVG8sIG11bHRpcGxlKSB7XG5cdHZhciBFbGVtZW50U2l6ZSA9IHJlcXVpcmUoXCIuL2VsZW1lbnRfc2l6ZS5qc1wiKTtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgRGVzY3JpcHRvciwgTnVtYmVyIF0pO1xuXG5cdHRoaXMuX3JlbGF0aXZlVG8gPSByZWxhdGl2ZVRvO1xuXHR0aGlzLl9tdWx0aXBsZSA9IG11bHRpcGxlO1xufTtcbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKHJlbGF0aXZlVG8sIG11bHRpcGxlKSB7XG5cdHJldHVybiBuZXcgTWUocmVsYXRpdmVUbywgbXVsdGlwbGUpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX3JlbGF0aXZlVG8udmFsdWUoKS5tdWx0aXBseSh0aGlzLl9tdWx0aXBsZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoYXJnLCB0eXBlKSB7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiKSByZXR1cm4gbmV3IFNpemUoYXJnKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBtdWx0aXBsZSA9IHRoaXMuX211bHRpcGxlO1xuXHR2YXIgYmFzZSA9IHRoaXMuX3JlbGF0aXZlVG8udG9TdHJpbmcoKTtcblx0aWYgKG11bHRpcGxlID09PSAxKSByZXR1cm4gYmFzZTtcblxuXHR2YXIgZGVzYztcblx0c3dpdGNoKG11bHRpcGxlKSB7XG5cdFx0Y2FzZSAxLzI6IGRlc2MgPSBcImhhbGYgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMS8zOiBkZXNjID0gXCJvbmUgdGhpcmQgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMi8zOiBkZXNjID0gXCJ0d28gdGhpcmRzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDEvNDogZGVzYyA9IFwib25lIHF1YXJ0ZXIgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMy80OiBkZXNjID0gXCJ0aHJlZSBxdWFydGVycyBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAxLzU6IGRlc2MgPSBcIm9uZSBmaWZ0aCBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAyLzU6IGRlc2MgPSBcInR3byBmaWZ0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMy81OiBkZXNjID0gXCJ0aHJlZSBmaWZ0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgNC81OiBkZXNjID0gXCJmb3VyIGZpZnRocyBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAxLzY6IGRlc2MgPSBcIm9uZSBzaXh0aCBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSA1LzY6IGRlc2MgPSBcImZpdmUgc2l4dGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDEvODogZGVzYyA9IFwib25lIGVpZ2h0aCBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAzLzg6IGRlc2MgPSBcInRocmVlIGVpZ2h0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgNS84OiBkZXNjID0gXCJmaXZlIGVpZ2h0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgNy84OiBkZXNjID0gXCJzZXZlbiBlaWdodGhzIG9mIFwiOyBicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0aWYgKG11bHRpcGxlID4gMSkgZGVzYyA9IG11bHRpcGxlICsgXCIgdGltZXMgXCI7XG5cdFx0XHRlbHNlIGRlc2MgPSAobXVsdGlwbGUgKiAxMDApICsgXCIlIG9mIFwiO1xuXHR9XG5cblx0cmV0dXJuIGRlc2MgKyBiYXNlO1xufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBRRWxlbWVudCA9IHJlcXVpcmUoXCIuL3FfZWxlbWVudC5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBGcmFtZShkb21FbGVtZW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCBdKTtcblx0ZW5zdXJlLnRoYXQoZG9tRWxlbWVudC50YWdOYW1lID09PSBcIklGUkFNRVwiLCBcIkRPTSBlbGVtZW50IG11c3QgYmUgYW4gaWZyYW1lXCIpO1xuXG5cdHRoaXMuX2RvbUVsZW1lbnQgPSBkb21FbGVtZW50O1xuXHR0aGlzLl9sb2FkZWQgPSBmYWxzZTtcblx0dGhpcy5fcmVtb3ZlZCA9IGZhbHNlO1xufTtcblxuZnVuY3Rpb24gbG9hZGVkKHNlbGYpIHtcblx0c2VsZi5fbG9hZGVkID0gdHJ1ZTtcblx0c2VsZi5fZG9jdW1lbnQgPSBzZWxmLl9kb21FbGVtZW50LmNvbnRlbnREb2N1bWVudDtcblx0c2VsZi5fb3JpZ2luYWxCb2R5ID0gc2VsZi5fZG9jdW1lbnQuYm9keS5pbm5lckhUTUw7XG59XG5cbk1lLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShwYXJlbnRFbGVtZW50LCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zLCBjYWxsYmFjaykge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBPYmplY3QsIE51bWJlciwgTnVtYmVyLCBbIE9iamVjdCwgRnVuY3Rpb24gXSwgWyB1bmRlZmluZWQsIEZ1bmN0aW9uIF0gXSk7XG5cblx0aWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQpIHtcblx0XHRjYWxsYmFjayA9IG9wdGlvbnM7XG5cdFx0b3B0aW9ucyA9IHt9O1xuXHR9XG5cblx0Ly8gV09SS0FST1VORCBNb2JpbGUgU2FmYXJpIDcuMC4wOiB3ZWlyZCBzdHlsZSByZXN1bHRzIG9jY3VyIHdoZW4gYm90aCBzcmMgYW5kIHN0eWxlc2hlZXQgYXJlIGxvYWRlZCAoc2VlIHRlc3QpXG5cdGVuc3VyZS50aGF0KFxuXHRcdCEob3B0aW9ucy5zcmMgJiYgb3B0aW9ucy5zdHlsZXNoZWV0KSxcblx0XHRcIkNhbm5vdCBzcGVjaWZ5IEhUTUwgVVJMIGFuZCBzdHlsZXNoZWV0IFVSTCBzaW11bHRhbmVvdXNseSBkdWUgdG8gTW9iaWxlIFNhZmFyaSBpc3N1ZVwiXG5cdCk7XG5cblx0dmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCB3aWR0aCk7XG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblx0aWZyYW1lLnNldEF0dHJpYnV0ZShcImZyYW1lYm9yZGVyXCIsIFwiMFwiKTsgICAgLy8gV09SS0FST1VORCBJRSA4OiBkb24ndCBpbmNsdWRlIGZyYW1lIGJvcmRlciBpbiBwb3NpdGlvbiBjYWxjc1xuXHRpZiAob3B0aW9ucy5zcmMpIGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgb3B0aW9ucy5zcmMpO1xuXG5cdHZhciBmcmFtZSA9IG5ldyBNZShpZnJhbWUpO1xuXHRhZGRMb2FkTGlzdGVuZXIoaWZyYW1lLCBvbkZyYW1lTG9hZCk7XG5cdHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcblx0cmV0dXJuIGZyYW1lO1xuXG5cdGZ1bmN0aW9uIG9uRnJhbWVMb2FkKCkge1xuXHRcdC8vIFdPUktBUk9VTkQgTW9iaWxlIFNhZmFyaSA3LjAuMCwgU2FmYXJpIDYuMi4wLCBDaHJvbWUgMzguMC4yMTI1OiBmcmFtZSBpcyBsb2FkZWQgc3luY2hyb25vdXNseVxuXHRcdC8vIFdlIGZvcmNlIGl0IHRvIGJlIGFzeW5jaHJvbm91cyBoZXJlXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdGxvYWRlZChmcmFtZSk7XG5cdFx0XHRsb2FkU3R5bGVzaGVldChmcmFtZSwgb3B0aW9ucy5zdHlsZXNoZWV0LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgZnJhbWUpO1xuXHRcdFx0fSk7XG5cdFx0fSwgMCk7XG5cdH1cbn07XG5cbmZ1bmN0aW9uIGxvYWRTdHlsZXNoZWV0KHNlbGYsIHVybCwgY2FsbGJhY2spIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUsIFsgdW5kZWZpbmVkLCBTdHJpbmcgXSwgRnVuY3Rpb24gXSk7XG5cdGlmICh1cmwgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGNhbGxiYWNrKCk7XG5cblx0dmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcblx0YWRkTG9hZExpc3RlbmVyKGxpbmssIG9uTGlua0xvYWQpO1xuXHRsaW5rLnNldEF0dHJpYnV0ZShcInJlbFwiLCBcInN0eWxlc2hlZXRcIik7XG5cdGxpbmsuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcInRleHQvY3NzXCIpO1xuXHRsaW5rLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgdXJsKTtcblxuXHRkb2N1bWVudEhlYWQoc2VsZikuYXBwZW5kQ2hpbGQobGluayk7XG5cblx0ZnVuY3Rpb24gb25MaW5rTG9hZCgpIHtcblx0XHRjYWxsYmFjaygpO1xuXHR9XG59XG5cbk1lLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dGhpcy5fZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSB0aGlzLl9vcmlnaW5hbEJvZHk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9Eb21FbGVtZW50ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdGVuc3VyZU5vdFJlbW92ZWQodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2RvbUVsZW1lbnQ7XG59O1xuXG5NZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdGVuc3VyZUxvYWRlZCh0aGlzKTtcblx0aWYgKHRoaXMuX3JlbW92ZWQpIHJldHVybjtcblxuXHR0aGlzLl9yZW1vdmVkID0gdHJ1ZTtcblx0dGhpcy5fZG9tRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX2RvbUVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLmFkZEVsZW1lbnQgPSBmdW5jdGlvbihodG1sKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZyBdKTtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHZhciB0ZW1wRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdHRlbXBFbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG5cdGVuc3VyZS50aGF0KFxuXHRcdHRlbXBFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoID09PSAxLFxuXHRcdFwiRXhwZWN0ZWQgb25lIGVsZW1lbnQsIGJ1dCBnb3QgXCIgKyB0ZW1wRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCArIFwiIChcIiArIGh0bWwgKyBcIilcIlxuXHQpO1xuXG5cdHZhciBpbnNlcnRlZEVsZW1lbnQgPSB0ZW1wRWxlbWVudC5jaGlsZE5vZGVzWzBdO1xuXHR0aGlzLl9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGluc2VydGVkRWxlbWVudCk7XG5cdHJldHVybiBuZXcgUUVsZW1lbnQoaW5zZXJ0ZWRFbGVtZW50LCBodG1sKTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRFbGVtZW50ID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nIF0pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dmFyIG5vZGVzID0gdGhpcy5fZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG5cdGVuc3VyZS50aGF0KG5vZGVzLmxlbmd0aCA9PT0gMSwgXCJFeHBlY3RlZCBvbmUgZWxlbWVudCB0byBtYXRjaCAnXCIgKyBzZWxlY3RvciArIFwiJywgYnV0IGZvdW5kIFwiICsgbm9kZXMubGVuZ3RoKTtcblx0cmV0dXJuIG5ldyBRRWxlbWVudChub2Rlc1swXSwgc2VsZWN0b3IpO1xufTtcblxuLy8gV09SS0FST1VORCBJRTg6IG5vIGFkZEV2ZW50TGlzdGVuZXIoKVxuZnVuY3Rpb24gYWRkTG9hZExpc3RlbmVyKGlmcmFtZURvbSwgY2FsbGJhY2spIHtcblx0aWYgKGlmcmFtZURvbS5hZGRFdmVudExpc3RlbmVyKSBpZnJhbWVEb20uYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgY2FsbGJhY2spO1xuXHRlbHNlIGlmcmFtZURvbS5hdHRhY2hFdmVudChcIm9ubG9hZFwiLCBjYWxsYmFjayk7XG59XG5cbi8vIFdPUktBUk9VTkQgSUU4OiBubyBkb2N1bWVudC5oZWFkXG5mdW5jdGlvbiBkb2N1bWVudEhlYWQoc2VsZikge1xuXHRpZiAoc2VsZi5fZG9jdW1lbnQuaGVhZCkgcmV0dXJuIHNlbGYuX2RvY3VtZW50LmhlYWQ7XG5cdGVsc2UgcmV0dXJuIHNlbGYuX2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJoZWFkXCIpO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVVc2FibGUoc2VsZikge1xuXHRlbnN1cmVMb2FkZWQoc2VsZik7XG5cdGVuc3VyZU5vdFJlbW92ZWQoc2VsZik7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZUxvYWRlZChzZWxmKSB7XG5cdGVuc3VyZS50aGF0KHNlbGYuX2xvYWRlZCwgXCJGcmFtZSBub3QgbG9hZGVkOiBXYWl0IGZvciBmcmFtZSBjcmVhdGlvbiBjYWxsYmFjayB0byBleGVjdXRlIGJlZm9yZSB1c2luZyBmcmFtZVwiKTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlTm90UmVtb3ZlZChzZWxmKSB7XG5cdGVuc3VyZS50aGF0KCFzZWxmLl9yZW1vdmVkLCBcIkF0dGVtcHRlZCB0byB1c2UgZnJhbWUgYWZ0ZXIgaXQgd2FzIHJlbW92ZWRcIik7XG59XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBjYW1lbGNhc2UgPSByZXF1aXJlKFwiLi4vdmVuZG9yL2NhbWVsY2FzZS0xLjAuMS1tb2RpZmllZC5qc1wiKTtcbnZhciBzaGltID0gcmVxdWlyZShcIi4vdXRpbC9zaGltLmpzXCIpO1xudmFyIEVsZW1lbnRFZGdlID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvZWxlbWVudF9lZGdlLmpzXCIpO1xudmFyIEVsZW1lbnRDZW50ZXIgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9lbGVtZW50X2NlbnRlci5qc1wiKTtcbnZhciBFbGVtZW50U2l6ZSA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL2VsZW1lbnRfc2l6ZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBRRWxlbWVudChkb21FbGVtZW50LCBuaWNrbmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBPYmplY3QsIFsgU3RyaW5nIF0gXSk7XG5cblx0dGhpcy5fZG9tRWxlbWVudCA9IGRvbUVsZW1lbnQ7XG5cdHRoaXMuX25pY2tuYW1lID0gbmlja25hbWU7XG5cblx0dGhpcy50b3AgPSBFbGVtZW50RWRnZS50b3AodGhpcyk7XG5cdHRoaXMucmlnaHQgPSBFbGVtZW50RWRnZS5yaWdodCh0aGlzKTtcblx0dGhpcy5ib3R0b20gPSBFbGVtZW50RWRnZS5ib3R0b20odGhpcyk7XG5cdHRoaXMubGVmdCA9IEVsZW1lbnRFZGdlLmxlZnQodGhpcyk7XG5cblx0dGhpcy5jZW50ZXIgPSBFbGVtZW50Q2VudGVyLngodGhpcyk7XG5cdHRoaXMubWlkZGxlID0gRWxlbWVudENlbnRlci55KHRoaXMpO1xuXG5cdHRoaXMud2lkdGggPSBFbGVtZW50U2l6ZS54KHRoaXMpO1xuXHR0aGlzLmhlaWdodCA9IEVsZW1lbnRTaXplLnkodGhpcyk7XG59O1xuXG5NZS5wcm90b3R5cGUuYXNzZXJ0ID0gZnVuY3Rpb24gYXNzZXJ0KGV4cGVjdGVkLCBtZXNzYWdlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgW3VuZGVmaW5lZCwgU3RyaW5nXSBdKTtcblx0aWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCkgbWVzc2FnZSA9IFwiRGlmZmVyZW5jZXMgZm91bmRcIjtcblxuXHR2YXIgZGlmZiA9IHRoaXMuZGlmZihleHBlY3RlZCk7XG5cdGlmIChkaWZmICE9PSBcIlwiKSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSArIFwiOlxcblwiICsgZGlmZik7XG59O1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uIGRpZmYoZXhwZWN0ZWQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0IF0pO1xuXG5cdHZhciByZXN1bHQgPSBbXTtcblx0dmFyIGtleXMgPSBzaGltLk9iamVjdC5rZXlzKGV4cGVjdGVkKTtcblx0dmFyIGtleSwgb25lRGlmZiwgZGVzY3JpcHRvcjtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0a2V5ID0ga2V5c1tpXTtcblx0XHRkZXNjcmlwdG9yID0gdGhpc1trZXldO1xuXHRcdGVuc3VyZS50aGF0KFxuXHRcdFx0XHRkZXNjcmlwdG9yICE9PSB1bmRlZmluZWQsXG5cdFx0XHRcdHRoaXMgKyBcIiBkb2Vzbid0IGhhdmUgYSBwcm9wZXJ0eSBuYW1lZCAnXCIgKyBrZXkgKyBcIicuIERpZCB5b3UgbWlzc3BlbGwgaXQ/XCJcblx0XHQpO1xuXHRcdG9uZURpZmYgPSBkZXNjcmlwdG9yLmRpZmYoZXhwZWN0ZWRba2V5XSk7XG5cdFx0aWYgKG9uZURpZmYgIT09IFwiXCIpIHJlc3VsdC5wdXNoKG9uZURpZmYpO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdC5qb2luKFwiXFxuXCIpO1xufTtcblxuTWUucHJvdG90eXBlLmdldFJhd1N0eWxlID0gZnVuY3Rpb24gZ2V0UmF3U3R5bGUoc3R5bGVOYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZyBdKTtcblxuXHR2YXIgc3R5bGVzO1xuXHR2YXIgcmVzdWx0O1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbm8gZ2V0Q29tcHV0ZWRTdHlsZSgpXG5cdGlmICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSkge1xuXHRcdHN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuX2RvbUVsZW1lbnQpO1xuXHRcdHJlc3VsdCA9IHN0eWxlcy5nZXRQcm9wZXJ0eVZhbHVlKHN0eWxlTmFtZSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0c3R5bGVzID0gdGhpcy5fZG9tRWxlbWVudC5jdXJyZW50U3R5bGU7XG5cdFx0cmVzdWx0ID0gc3R5bGVzW2NhbWVsY2FzZShzdHlsZU5hbWUpXTtcblx0fVxuXHRpZiAocmVzdWx0ID09PSBudWxsIHx8IHJlc3VsdCA9PT0gdW5kZWZpbmVkKSByZXN1bHQgPSBcIlwiO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuTWUucHJvdG90eXBlLmdldFJhd1Bvc2l0aW9uID0gZnVuY3Rpb24gZ2V0UmF3UG9zaXRpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBObyBUZXh0UmVjdGFuZ2xlLmhlaWdodCBvciAud2lkdGhcblx0dmFyIHJlY3QgPSB0aGlzLl9kb21FbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRyZXR1cm4ge1xuXHRcdGxlZnQ6IHJlY3QubGVmdCxcblx0XHRyaWdodDogcmVjdC5yaWdodCxcblx0XHR3aWR0aDogcmVjdC53aWR0aCAhPT0gdW5kZWZpbmVkID8gcmVjdC53aWR0aCA6IHJlY3QucmlnaHQgLSByZWN0LmxlZnQsXG5cblx0XHR0b3A6IHJlY3QudG9wLFxuXHRcdGJvdHRvbTogcmVjdC5ib3R0b20sXG5cdFx0aGVpZ2h0OiByZWN0LmhlaWdodCAhPT0gdW5kZWZpbmVkID8gcmVjdC5oZWlnaHQgOiByZWN0LmJvdHRvbSAtIHJlY3QudG9wXG5cdH07XG59O1xuXG5NZS5wcm90b3R5cGUudG9Eb21FbGVtZW50ID0gZnVuY3Rpb24gdG9Eb21FbGVtZW50KCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fZG9tRWxlbWVudDtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gXCInXCIgKyB0aGlzLl9uaWNrbmFtZSArIFwiJ1wiO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE1lIF0pO1xuXHRyZXR1cm4gdGhpcy5fZG9tRWxlbWVudCA9PT0gdGhhdC5fZG9tRWxlbWVudDtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBGcmFtZSA9IHJlcXVpcmUoXCIuL2ZyYW1lLmpzXCIpO1xuXG5leHBvcnRzLmNyZWF0ZUZyYW1lID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgb3B0aW9ucywgY2FsbGJhY2spIHtcblx0cmV0dXJuIEZyYW1lLmNyZWF0ZShkb2N1bWVudC5ib2R5LCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zLCBjYWxsYmFjayk7XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gU2VlIExJQ0VOU0UuVFhUIGZvciBkZXRhaWxzLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIFJ1bnRpbWUgYXNzZXJ0aW9ucyBmb3IgcHJvZHVjdGlvbiBjb2RlLiAoQ29udHJhc3QgdG8gYXNzZXJ0LmpzLCB3aGljaCBpcyBmb3IgdGVzdCBjb2RlLilcblxudmFyIHNoaW0gPSByZXF1aXJlKFwiLi9zaGltLmpzXCIpO1xudmFyIG9vcCA9IHJlcXVpcmUoXCIuL29vcC5qc1wiKTtcblxuZXhwb3J0cy50aGF0ID0gZnVuY3Rpb24odmFyaWFibGUsIG1lc3NhZ2UpIHtcblx0aWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCkgbWVzc2FnZSA9IFwiRXhwZWN0ZWQgY29uZGl0aW9uIHRvIGJlIHRydWVcIjtcblxuXHRpZiAodmFyaWFibGUgPT09IGZhbHNlKSB0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudGhhdCwgbWVzc2FnZSk7XG5cdGlmICh2YXJpYWJsZSAhPT0gdHJ1ZSkgdGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihleHBvcnRzLnRoYXQsIFwiRXhwZWN0ZWQgY29uZGl0aW9uIHRvIGJlIHRydWUgb3IgZmFsc2VcIik7XG59O1xuXG5leHBvcnRzLnVucmVhY2hhYmxlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRpZiAoIW1lc3NhZ2UpIG1lc3NhZ2UgPSBcIlVucmVhY2hhYmxlIGNvZGUgZXhlY3V0ZWRcIjtcblxuXHR0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudW5yZWFjaGFibGUsIG1lc3NhZ2UpO1xufTtcblxuZXhwb3J0cy5zaWduYXR1cmUgPSBmdW5jdGlvbihhcmdzLCBzaWduYXR1cmUsIG1lc3NhZ2VzKSB7XG5cdHNpZ25hdHVyZSA9IHNpZ25hdHVyZSB8fCBbXTtcblx0bWVzc2FnZXMgPSBtZXNzYWdlcyB8fCBbXTtcblx0dmFyIGV4cGVjdGVkQXJnQ291bnQgPSBzaWduYXR1cmUubGVuZ3RoO1xuXHR2YXIgYWN0dWFsQXJnQ291bnQgPSBhcmdzLmxlbmd0aDtcblxuXHRpZiAoYWN0dWFsQXJnQ291bnQgPiBleHBlY3RlZEFyZ0NvdW50KSB7XG5cdFx0dGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihcblx0XHRcdGV4cG9ydHMuc2lnbmF0dXJlLFxuXHRcdFx0XCJGdW5jdGlvbiBjYWxsZWQgd2l0aCB0b28gbWFueSBhcmd1bWVudHM6IGV4cGVjdGVkIFwiICsgZXhwZWN0ZWRBcmdDb3VudCArIFwiIGJ1dCBnb3QgXCIgKyBhY3R1YWxBcmdDb3VudFxuXHRcdCk7XG5cdH1cblxuXHR2YXIgdHlwZSwgYXJnLCBuYW1lO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNpZ25hdHVyZS5sZW5ndGg7IGkrKykge1xuXHRcdHR5cGUgPSBzaWduYXR1cmVbaV07XG5cdFx0YXJnID0gYXJnc1tpXTtcblx0XHRuYW1lID0gXCJBcmd1bWVudCBcIiArIGk7XG5cblx0XHRpZiAoIXNoaW0uQXJyYXkuaXNBcnJheSh0eXBlKSkgdHlwZSA9IFsgdHlwZSBdO1xuXHRcdGlmICghdHlwZU1hdGNoZXModHlwZSwgYXJnLCBuYW1lKSkge1xuXHRcdFx0dmFyIG1lc3NhZ2UgPSBuYW1lICsgXCIgZXhwZWN0ZWQgXCIgKyBleHBsYWluVHlwZSh0eXBlKSArIFwiLCBidXQgd2FzIFwiO1xuXHRcdFx0dGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihleHBvcnRzLnNpZ25hdHVyZSwgbWVzc2FnZSArIGV4cGxhaW5BcmcoYXJnKSk7XG5cdFx0fVxuXHR9XG59O1xuXG5mdW5jdGlvbiB0eXBlTWF0Y2hlcyh0eXBlLCBhcmcpIHtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKG9uZVR5cGVNYXRjaGVzKHR5cGVbaV0sIGFyZykpIHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcblxuXHRmdW5jdGlvbiBvbmVUeXBlTWF0Y2hlcyh0eXBlLCBhcmcpIHtcblx0XHRzd2l0Y2ggKGdldFR5cGUoYXJnKSkge1xuXHRcdFx0Y2FzZSBcImJvb2xlYW5cIjogcmV0dXJuIHR5cGUgPT09IEJvb2xlYW47XG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHJldHVybiB0eXBlID09PSBTdHJpbmc7XG5cdFx0XHRjYXNlIFwibnVtYmVyXCI6IHJldHVybiB0eXBlID09PSBOdW1iZXI7XG5cdFx0XHRjYXNlIFwiYXJyYXlcIjogcmV0dXJuIHR5cGUgPT09IEFycmF5O1xuXHRcdFx0Y2FzZSBcImZ1bmN0aW9uXCI6IHJldHVybiB0eXBlID09PSBGdW5jdGlvbjtcblx0XHRcdGNhc2UgXCJvYmplY3RcIjogcmV0dXJuIHR5cGUgPT09IE9iamVjdCB8fCBhcmcgaW5zdGFuY2VvZiB0eXBlO1xuXHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOiByZXR1cm4gdHlwZSA9PT0gdW5kZWZpbmVkO1xuXHRcdFx0Y2FzZSBcIm51bGxcIjogcmV0dXJuIHR5cGUgPT09IG51bGw7XG5cdFx0XHRjYXNlIFwiTmFOXCI6IHJldHVybiBpc05hTih0eXBlKTtcblxuXHRcdFx0ZGVmYXVsdDogZXhwb3J0cy51bnJlYWNoYWJsZSgpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBleHBsYWluVHlwZSh0eXBlKSB7XG5cdHZhciBqb2luZXIgPSBcIlwiO1xuXHR2YXIgcmVzdWx0ID0gXCJcIjtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG5cdFx0cmVzdWx0ICs9IGpvaW5lciArIGV4cGxhaW5PbmVUeXBlKHR5cGVbaV0pO1xuXHRcdGpvaW5lciA9IChpID09PSB0eXBlLmxlbmd0aCAtIDIpID8gXCIsIG9yIFwiIDogXCIsIFwiO1xuXHR9XG5cdHJldHVybiByZXN1bHQ7XG5cblx0ZnVuY3Rpb24gZXhwbGFpbk9uZVR5cGUodHlwZSkge1xuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSBCb29sZWFuOiByZXR1cm4gXCJib29sZWFuXCI7XG5cdFx0XHRjYXNlIFN0cmluZzogcmV0dXJuIFwic3RyaW5nXCI7XG5cdFx0XHRjYXNlIE51bWJlcjogcmV0dXJuIFwibnVtYmVyXCI7XG5cdFx0XHRjYXNlIEFycmF5OiByZXR1cm4gXCJhcnJheVwiO1xuXHRcdFx0Y2FzZSBGdW5jdGlvbjogcmV0dXJuIFwiZnVuY3Rpb25cIjtcblx0XHRcdGNhc2UgbnVsbDogcmV0dXJuIFwibnVsbFwiO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcIm51bWJlclwiICYmIGlzTmFOKHR5cGUpKSByZXR1cm4gXCJOYU5cIjtcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9vcC5jbGFzc05hbWUodHlwZSkgKyBcIiBpbnN0YW5jZVwiO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGV4cGxhaW5BcmcoYXJnKSB7XG5cdHZhciB0eXBlID0gZ2V0VHlwZShhcmcpO1xuXHRpZiAodHlwZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIHR5cGU7XG5cblx0cmV0dXJuIG9vcC5pbnN0YW5jZU5hbWUoYXJnKSArIFwiIGluc3RhbmNlXCI7XG59XG5cbmZ1bmN0aW9uIGdldFR5cGUodmFyaWFibGUpIHtcblx0dmFyIHR5cGUgPSB0eXBlb2YgdmFyaWFibGU7XG5cdGlmICh2YXJpYWJsZSA9PT0gbnVsbCkgdHlwZSA9IFwibnVsbFwiO1xuXHRpZiAoc2hpbS5BcnJheS5pc0FycmF5KHZhcmlhYmxlKSkgdHlwZSA9IFwiYXJyYXlcIjtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIgJiYgaXNOYU4odmFyaWFibGUpKSB0eXBlID0gXCJOYU5cIjtcblx0cmV0dXJuIHR5cGU7XG59XG5cblxuLyoqKioqL1xuXG52YXIgRW5zdXJlRXhjZXB0aW9uID0gZXhwb3J0cy5FbnN1cmVFeGNlcHRpb24gPSBmdW5jdGlvbihmblRvUmVtb3ZlRnJvbVN0YWNrVHJhY2UsIG1lc3NhZ2UpIHtcblx0aWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBmblRvUmVtb3ZlRnJvbVN0YWNrVHJhY2UpO1xuXHRlbHNlIHRoaXMuc3RhY2sgPSAobmV3IEVycm9yKCkpLnN0YWNrO1xuXHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufTtcbkVuc3VyZUV4Y2VwdGlvbi5wcm90b3R5cGUgPSBzaGltLk9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcbkVuc3VyZUV4Y2VwdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbnN1cmVFeGNlcHRpb247XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlLm5hbWUgPSBcIkVuc3VyZUV4Y2VwdGlvblwiO1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG4vLyBjYW4ndCB1c2UgZW5zdXJlLmpzIGR1ZSB0byBjaXJjdWxhciBkZXBlbmRlbmN5XG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3NoaW0uanNcIik7XG5cbmV4cG9ydHMuY2xhc3NOYW1lID0gZnVuY3Rpb24oY29uc3RydWN0b3IpIHtcblx0aWYgKHR5cGVvZiBjb25zdHJ1Y3RvciAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYSBjb25zdHJ1Y3RvclwiKTtcblx0cmV0dXJuIHNoaW0uRnVuY3Rpb24ubmFtZShjb25zdHJ1Y3Rvcik7XG59O1xuXG5leHBvcnRzLmluc3RhbmNlTmFtZSA9IGZ1bmN0aW9uKG9iaikge1xuXHR2YXIgcHJvdG90eXBlID0gc2hpbS5PYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcblx0aWYgKHByb3RvdHlwZSA9PT0gbnVsbCkgcmV0dXJuIFwiPG5vIHByb3RvdHlwZT5cIjtcblxuXHR2YXIgY29uc3RydWN0b3IgPSBwcm90b3R5cGUuY29uc3RydWN0b3I7XG5cdGlmIChjb25zdHJ1Y3RvciA9PT0gdW5kZWZpbmVkIHx8IGNvbnN0cnVjdG9yID09PSBudWxsKSByZXR1cm4gXCI8YW5vbj5cIjtcblxuXHRyZXR1cm4gc2hpbS5GdW5jdGlvbi5uYW1lKGNvbnN0cnVjdG9yKTtcbn07XG5cbmV4cG9ydHMuZXh0ZW5kRm4gPSBmdW5jdGlvbiBleHRlbmRGbihwYXJlbnRDb25zdHJ1Y3Rvcikge1xuXHRyZXR1cm4gZnVuY3Rpb24oY2hpbGRDb25zdHJ1Y3Rvcikge1xuXHRcdGNoaWxkQ29uc3RydWN0b3IucHJvdG90eXBlID0gc2hpbS5PYmplY3QuY3JlYXRlKHBhcmVudENvbnN0cnVjdG9yLnByb3RvdHlwZSk7XG5cdFx0Y2hpbGRDb25zdHJ1Y3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjaGlsZENvbnN0cnVjdG9yO1xuXHR9O1xufTtcblxuZXhwb3J0cy5tYWtlQWJzdHJhY3QgPSBmdW5jdGlvbiBtYWtlQWJzdHJhY3QoY29uc3RydWN0b3IsIG1ldGhvZHMpIHtcblx0dmFyIG5hbWUgPSBzaGltLkZ1bmN0aW9uLm5hbWUoY29uc3RydWN0b3IpO1xuXHRzaGltLkFycmF5LmZvckVhY2gobWV0aG9kcywgZnVuY3Rpb24obWV0aG9kKSB7XG5cdFx0Y29uc3RydWN0b3IucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihuYW1lICsgXCIgc3ViY2xhc3NlcyBtdXN0IGltcGxlbWVudCBcIiArIG1ldGhvZCArIFwiKCkgbWV0aG9kXCIpO1xuXHRcdH07XG5cdH0pO1xuXG5cdGNvbnN0cnVjdG9yLnByb3RvdHlwZS5jaGVja0Fic3RyYWN0TWV0aG9kcyA9IGZ1bmN0aW9uIGNoZWNrQWJzdHJhY3RNZXRob2RzKCkge1xuXHRcdHZhciB1bmltcGxlbWVudGVkID0gW107XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHNoaW0uQXJyYXkuZm9yRWFjaChtZXRob2RzLCBmdW5jdGlvbihuYW1lKSB7XG5cdFx0XHRpZiAoc2VsZltuYW1lXSA9PT0gY29uc3RydWN0b3IucHJvdG90eXBlW25hbWVdKSB1bmltcGxlbWVudGVkLnB1c2gobmFtZSArIFwiKClcIik7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHVuaW1wbGVtZW50ZWQ7XG5cdH07XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5PYmplY3QgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBPYmplY3QuY3JlYXRlKClcblx0Y3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUocHJvdG90eXBlKSB7XG5cdFx0aWYgKE9iamVjdC5jcmVhdGUpIHJldHVybiBPYmplY3QuY3JlYXRlKHByb3RvdHlwZSk7XG5cblx0XHR2YXIgVGVtcCA9IGZ1bmN0aW9uIFRlbXAoKSB7fTtcblx0XHRUZW1wLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcblx0XHRyZXR1cm4gbmV3IFRlbXAoKTtcblx0fSxcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIE9iamVjdC5nZXRQcm90b3R5cGVPZlxuXHQvLyBDYXV0aW9uOiBEb2Vzbid0IHdvcmsgb24gSUUgOCBpZiBjb25zdHJ1Y3RvciBoYXMgYmVlbiBjaGFuZ2VkLCBhcyBpcyB0aGUgY2FzZSB3aXRoIGEgc3ViY2xhc3MuXG5cdGdldFByb3RvdHlwZU9mOiBmdW5jdGlvbiBnZXRQcm90b3R5cGVPZihvYmopIHtcblx0XHRpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKSByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik7XG5cblx0XHR2YXIgcmVzdWx0ID0gb2JqLmNvbnN0cnVjdG9yID8gb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA6IG51bGw7XG5cdFx0cmV0dXJuIHJlc3VsdCB8fCBudWxsO1xuXHR9LFxuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogTm8gT2JqZWN0LmtleXNcblx0a2V5czogZnVuY3Rpb24ga2V5cyhvYmopIHtcblx0XHRpZiAoT2JqZWN0LmtleXMpIHJldHVybiBPYmplY3Qua2V5cyhvYmopO1xuXG5cdFx0Ly8gRnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3Qva2V5c1xuXHQgIHZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXG5cdCAgICAgIGhhc0RvbnRFbnVtQnVnID0gISh7IHRvU3RyaW5nOiBudWxsIH0pLnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpLFxuXHQgICAgICBkb250RW51bXMgPSBbXG5cdCAgICAgICAgJ3RvU3RyaW5nJyxcblx0ICAgICAgICAndG9Mb2NhbGVTdHJpbmcnLFxuXHQgICAgICAgICd2YWx1ZU9mJyxcblx0ICAgICAgICAnaGFzT3duUHJvcGVydHknLFxuXHQgICAgICAgICdpc1Byb3RvdHlwZU9mJyxcblx0ICAgICAgICAncHJvcGVydHlJc0VudW1lcmFibGUnLFxuXHQgICAgICAgICdjb25zdHJ1Y3Rvcidcblx0ICAgICAgXSxcblx0ICAgICAgZG9udEVudW1zTGVuZ3RoID0gZG9udEVudW1zLmxlbmd0aDtcblxuXHQgIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyAmJiAodHlwZW9mIG9iaiAhPT0gJ2Z1bmN0aW9uJyB8fCBvYmogPT09IG51bGwpKSB7XG5cdCAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3Qua2V5cyBjYWxsZWQgb24gbm9uLW9iamVjdCcpO1xuXHQgIH1cblxuXHQgIHZhciByZXN1bHQgPSBbXSwgcHJvcCwgaTtcblxuXHQgIGZvciAocHJvcCBpbiBvYmopIHtcblx0ICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIHtcblx0ICAgICAgcmVzdWx0LnB1c2gocHJvcCk7XG5cdCAgICB9XG5cdCAgfVxuXG5cdCAgaWYgKGhhc0RvbnRFbnVtQnVnKSB7XG5cdCAgICBmb3IgKGkgPSAwOyBpIDwgZG9udEVudW1zTGVuZ3RoOyBpKyspIHtcblx0ICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBkb250RW51bXNbaV0pKSB7XG5cdCAgICAgICAgcmVzdWx0LnB1c2goZG9udEVudW1zW2ldKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gcmVzdWx0O1xuXHR9XG5cbn07XG5cblxuZXhwb3J0cy5GdW5jdGlvbiA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDgsIElFIDksIElFIDEwLCBJRSAxMTogbm8gZnVuY3Rpb24ubmFtZVxuXHRuYW1lOiBmdW5jdGlvbiBuYW1lKGZuKSB7XG5cdFx0aWYgKGZuLm5hbWUpIHJldHVybiBmbi5uYW1lO1xuXG5cdFx0Ly8gQmFzZWQgb24gY29kZSBieSBKYXNvbiBCdW50aW5nIGV0IGFsLCBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zMzI0Mjlcblx0XHR2YXIgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvblxccysoLnsxLH0pXFxzKlxcKC87XG5cdFx0dmFyIHJlc3VsdHMgPSAoZnVuY05hbWVSZWdleCkuZXhlYygoZm4pLnRvU3RyaW5nKCkpO1xuXHRcdHJldHVybiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpID8gcmVzdWx0c1sxXSA6IFwiPGFub24+XCI7XG5cdH0sXG5cbn07XG5cblxuZXhwb3J0cy5BcnJheSA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIEFycmF5LmlzQXJyYXlcblx0aXNBcnJheTogZnVuY3Rpb24gaXNBcnJheSh0aGluZykge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KSByZXR1cm4gQXJyYXkuaXNBcnJheSh0aGluZyk7XG5cblx0XHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRoaW5nKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcblx0fSxcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIEFycmF5LmZvckVhY2hcblx0Zm9yRWFjaDogZnVuY3Rpb24gZm9yRWFjaChvYmosIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG5cdFx0Lypqc2hpbnQgYml0d2lzZTpmYWxzZSwgZXFlcWVxOmZhbHNlLCAtVzA0MTpmYWxzZSAqL1xuXG5cdFx0aWYgKEFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSByZXR1cm4gb2JqLmZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpO1xuXG5cdFx0Ly8gVGhpcyB3b3JrYXJvdW5kIGJhc2VkIG9uIHBvbHlmaWxsIGNvZGUgZnJvbSBNRE46XG5cdFx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZm9yRWFjaFxuXG5cdFx0Ly8gUHJvZHVjdGlvbiBzdGVwcyBvZiBFQ01BLTI2MiwgRWRpdGlvbiA1LCAxNS40LjQuMThcblx0XHQvLyBSZWZlcmVuY2U6IGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuNC40LjE4XG5cbiAgICB2YXIgVCwgaztcblxuICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignIHRoaXMgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xuICAgIH1cblxuICAgIC8vIDEuIExldCBPIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyBUb09iamVjdCBwYXNzaW5nIHRoZSB8dGhpc3wgdmFsdWUgYXMgdGhlIGFyZ3VtZW50LlxuICAgIHZhciBPID0gT2JqZWN0KG9iaik7XG5cbiAgICAvLyAyLiBMZXQgbGVuVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXQgaW50ZXJuYWwgbWV0aG9kIG9mIE8gd2l0aCB0aGUgYXJndW1lbnQgXCJsZW5ndGhcIi5cbiAgICAvLyAzLiBMZXQgbGVuIGJlIFRvVWludDMyKGxlblZhbHVlKS5cbiAgICB2YXIgbGVuID0gTy5sZW5ndGggPj4+IDA7XG5cbiAgICAvLyA0LiBJZiBJc0NhbGxhYmxlKGNhbGxiYWNrKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgIC8vIFNlZTogaHR0cDovL2VzNS5naXRodWIuY29tLyN4OS4xMVxuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihjYWxsYmFjayArICcgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICAvLyA1LiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVCBiZSB1bmRlZmluZWQuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICBUID0gdGhpc0FyZztcbiAgICB9XG5cbiAgICAvLyA2LiBMZXQgayBiZSAwXG4gICAgayA9IDA7XG5cbiAgICAvLyA3LiBSZXBlYXQsIHdoaWxlIGsgPCBsZW5cbiAgICB3aGlsZSAoayA8IGxlbikge1xuXG4gICAgICB2YXIga1ZhbHVlO1xuXG4gICAgICAvLyBhLiBMZXQgUGsgYmUgVG9TdHJpbmcoaykuXG4gICAgICAvLyAgIFRoaXMgaXMgaW1wbGljaXQgZm9yIExIUyBvcGVyYW5kcyBvZiB0aGUgaW4gb3BlcmF0b3JcbiAgICAgIC8vIGIuIExldCBrUHJlc2VudCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEhhc1Byb3BlcnR5IGludGVybmFsIG1ldGhvZCBvZiBPIHdpdGggYXJndW1lbnQgUGsuXG4gICAgICAvLyAgIFRoaXMgc3RlcCBjYW4gYmUgY29tYmluZWQgd2l0aCBjXG4gICAgICAvLyBjLiBJZiBrUHJlc2VudCBpcyB0cnVlLCB0aGVuXG4gICAgICBpZiAoayBpbiBPKSB7XG5cbiAgICAgICAgLy8gaS4gTGV0IGtWYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldCBpbnRlcm5hbCBtZXRob2Qgb2YgTyB3aXRoIGFyZ3VtZW50IFBrLlxuICAgICAgICBrVmFsdWUgPSBPW2tdO1xuXG4gICAgICAgIC8vIGlpLiBDYWxsIHRoZSBDYWxsIGludGVybmFsIG1ldGhvZCBvZiBjYWxsYmFjayB3aXRoIFQgYXMgdGhlIHRoaXMgdmFsdWUgYW5kXG4gICAgICAgIC8vIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZyBrVmFsdWUsIGssIGFuZCBPLlxuICAgICAgICBjYWxsYmFjay5jYWxsKFQsIGtWYWx1ZSwgaywgTyk7XG4gICAgICB9XG4gICAgICAvLyBkLiBJbmNyZWFzZSBrIGJ5IDEuXG4gICAgICBrKys7XG4gICAgfVxuICAgIC8vIDguIHJldHVybiB1bmRlZmluZWRcblx0fVxuXG59O1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4vdmFsdWUuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUGl4ZWxzKGFtb3VudCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBOdW1iZXIgXSk7XG5cdHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcbn07XG5WYWx1ZS5leHRlbmQoTWUpO1xuXG5NZS5wcm90b3R5cGUuY29tcGF0aWJpbGl0eSA9IGZ1bmN0aW9uIGNvbXBhdGliaWxpdHkoKSB7XG5cdHJldHVybiBbIE1lIF07XG59O1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gcGx1cyhvcGVyYW5kKSB7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fYW1vdW50ICsgb3BlcmFuZC5fYW1vdW50KTtcbn0pO1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIG1pbnVzKG9wZXJhbmQpIHtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9hbW91bnQgLSBvcGVyYW5kLl9hbW91bnQpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uIG11bHRpcGx5KG9wZXJhbmQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyIF0pO1xuXG5cdHJldHVybiBuZXcgTWUodGhpcy5fYW1vdW50ICogb3BlcmFuZCk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29tcGFyZSA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gY29tcGFyZShvcGVyYW5kKSB7XG5cdHJldHVybiB0aGlzLl9hbW91bnQgLSBvcGVyYW5kLl9hbW91bnQ7XG59KTtcblxuTWUucHJvdG90eXBlLmRpZmYgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIGRpZmYoZXhwZWN0ZWQpIHtcblx0aWYgKHRoaXMuX2Ftb3VudCA9PT0gZXhwZWN0ZWQuX2Ftb3VudCkgcmV0dXJuIFwiXCI7XG5cdHJldHVybiBNYXRoLmFicyh0aGlzLl9hbW91bnQgLSBleHBlY3RlZC5fYW1vdW50KSArIFwicHhcIjtcbn0pO1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX2Ftb3VudCArIFwicHhcIjtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgVmFsdWUgPSByZXF1aXJlKFwiLi92YWx1ZS5qc1wiKTtcbnZhciBQaXhlbHMgPSByZXF1aXJlKFwiLi9waXhlbHMuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuL3NpemUuanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUG9zaXRpb24oZGltZW5zaW9uLCB2YWx1ZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIFtOdW1iZXIsIFBpeGVsc10gXSk7XG5cblx0dGhpcy5fZGltZW5zaW9uID0gZGltZW5zaW9uO1xuXHR0aGlzLl92YWx1ZSA9ICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpID8gbmV3IFBpeGVscyh2YWx1ZSkgOiB2YWx1ZTtcbn07XG5WYWx1ZS5leHRlbmQoTWUpO1xuXG5NZS54ID0gZnVuY3Rpb24geCh2YWx1ZSkge1xuXHRyZXR1cm4gbmV3IE1lKFhfRElNRU5TSU9OLCB2YWx1ZSk7XG59O1xuXG5NZS55ID0gZnVuY3Rpb24geSh2YWx1ZSkge1xuXHRyZXR1cm4gbmV3IE1lKFlfRElNRU5TSU9OLCB2YWx1ZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29tcGF0aWJpbGl0eSA9IGZ1bmN0aW9uIGNvbXBhdGliaWxpdHkoKSB7XG5cdHJldHVybiBbIE1lLCBTaXplIF07XG59O1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gcGx1cyhvcGVyYW5kKSB7XG5cdGVuc3VyZUNvbXBhcmFibGUodGhpcywgb3BlcmFuZCk7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fZGltZW5zaW9uLCB0aGlzLl92YWx1ZS5wbHVzKG9wZXJhbmQudG9QaXhlbHMoKSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5taW51cyA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gbWludXMob3BlcmFuZCkge1xuXHRpZiAob3BlcmFuZCBpbnN0YW5jZW9mIE1lKSBlbnN1cmVDb21wYXJhYmxlKHRoaXMsIG9wZXJhbmQpO1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX2RpbWVuc2lvbiwgdGhpcy5fdmFsdWUubWludXMob3BlcmFuZC50b1BpeGVscygpKSk7XG59KTtcblxuTWUucHJvdG90eXBlLmRpZmYgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIGRpZmYoZXhwZWN0ZWQpIHtcblx0ZW5zdXJlQ29tcGFyYWJsZSh0aGlzLCBleHBlY3RlZCk7XG5cblx0dmFyIGFjdHVhbFZhbHVlID0gdGhpcy5fdmFsdWU7XG5cdHZhciBleHBlY3RlZFZhbHVlID0gZXhwZWN0ZWQuX3ZhbHVlO1xuXHRpZiAoYWN0dWFsVmFsdWUuZXF1YWxzKGV4cGVjdGVkVmFsdWUpKSByZXR1cm4gXCJcIjtcblxuXHR2YXIgZGlyZWN0aW9uO1xuXHR2YXIgY29tcGFyaXNvbiA9IGFjdHVhbFZhbHVlLmNvbXBhcmUoZXhwZWN0ZWRWYWx1ZSk7XG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSBkaXJlY3Rpb24gPSBjb21wYXJpc29uIDwgMCA/IFwidG8gdGhlIGxlZnRcIiA6IFwidG8gdGhlIHJpZ2h0XCI7XG5cdGVsc2UgZGlyZWN0aW9uID0gY29tcGFyaXNvbiA8IDAgPyBcImxvd2VyXCIgOiBcImhpZ2hlclwiO1xuXG5cdHJldHVybiBhY3R1YWxWYWx1ZS5kaWZmKGV4cGVjdGVkVmFsdWUpICsgXCIgXCIgKyBkaXJlY3Rpb247XG59KTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX3ZhbHVlLnRvU3RyaW5nKCk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9QaXhlbHMgPSBmdW5jdGlvbiB0b1BpeGVscygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gdGhpcy5fdmFsdWU7XG59O1xuXG5mdW5jdGlvbiBlbnN1cmVDb21wYXJhYmxlKHNlbGYsIG90aGVyKSB7XG5cdGlmIChvdGhlciBpbnN0YW5jZW9mIE1lKSB7XG5cdFx0ZW5zdXJlLnRoYXQoc2VsZi5fZGltZW5zaW9uID09PSBvdGhlci5fZGltZW5zaW9uLCBcIkNhbid0IGNvbXBhcmUgWCBkaW1lbnNpb24gdG8gWSBkaW1lbnNpb25cIik7XG5cdH1cbn1cbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuL3ZhbHVlLmpzXCIpO1xudmFyIFBpeGVscyA9IHJlcXVpcmUoXCIuL3BpeGVscy5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBTaXplKHZhbHVlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFtOdW1iZXIsIFBpeGVsc10gXSk7XG5cblx0dGhpcy5fdmFsdWUgPSAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSA/IG5ldyBQaXhlbHModmFsdWUpIDogdmFsdWU7XG59O1xuVmFsdWUuZXh0ZW5kKE1lKTtcblxuTWUucHJvdG90eXBlLmNvbXBhdGliaWxpdHkgPSBmdW5jdGlvbiBjb21wYXRpYmlsaXR5KCkge1xuXHRyZXR1cm4gWyBNZSBdO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIHBsdXMob3BlcmFuZCkge1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX3ZhbHVlLnBsdXMob3BlcmFuZC5fdmFsdWUpKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIG1pbnVzKG9wZXJhbmQpIHtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl92YWx1ZS5taW51cyhvcGVyYW5kLl92YWx1ZSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uIG11bHRpcGx5KG9wZXJhbmQpIHtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl92YWx1ZS5tdWx0aXBseShvcGVyYW5kKSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29tcGFyZSA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gY29tcGFyZSh0aGF0KSB7XG5cdHJldHVybiB0aGlzLl92YWx1ZS5jb21wYXJlKHRoYXQuX3ZhbHVlKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHR2YXIgYWN0dWFsVmFsdWUgPSB0aGlzLl92YWx1ZTtcblx0dmFyIGV4cGVjdGVkVmFsdWUgPSBleHBlY3RlZC5fdmFsdWU7XG5cblx0aWYgKGFjdHVhbFZhbHVlLmVxdWFscyhleHBlY3RlZFZhbHVlKSkgcmV0dXJuIFwiXCI7XG5cblx0dmFyIGRlc2MgPSBhY3R1YWxWYWx1ZS5jb21wYXJlKGV4cGVjdGVkVmFsdWUpID4gMCA/IFwiIGxhcmdlclwiIDogXCIgc21hbGxlclwiO1xuXHRyZXR1cm4gYWN0dWFsVmFsdWUuZGlmZihleHBlY3RlZFZhbHVlKSArIGRlc2M7XG59KTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl92YWx1ZS50b1N0cmluZygpO1xufTtcblxuTWUucHJvdG90eXBlLnRvUGl4ZWxzID0gZnVuY3Rpb24gdG9QaXhlbHMoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl92YWx1ZTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIHNoaW0gPSByZXF1aXJlKFwiLi4vdXRpbC9zaGltLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFZhbHVlKCkge307XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xub29wLm1ha2VBYnN0cmFjdChNZSwgW1xuXHRcImRpZmZcIixcblx0XCJ0b1N0cmluZ1wiLFxuXHRcImNvbXBhdGliaWxpdHlcIlxuXSk7XG5cbk1lLnNhZmUgPSBmdW5jdGlvbiBzYWZlKGZuKSB7XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRlbnN1cmVDb21wYXRpYmlsaXR5KHRoaXMsIHRoaXMuY29tcGF0aWJpbGl0eSgpLCBhcmd1bWVudHMpO1xuXHRcdHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHR9O1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdHJldHVybiB0aGlzLmRpZmYodGhhdCkgPT09IFwiXCI7XG59O1xuXG5mdW5jdGlvbiBlbnN1cmVDb21wYXRpYmlsaXR5KHNlbGYsIGNvbXBhdGlibGUsIGFyZ3MpIHtcblx0dmFyIGFyZztcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7ICAgLy8gYXJncyBpcyBub3QgYW4gQXJyYXksIGNhbid0IHVzZSBmb3JFYWNoXG5cdFx0YXJnID0gYXJnc1tpXTtcblx0XHRjaGVja09uZUFyZyhzZWxmLCBjb21wYXRpYmxlLCBhcmcpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNoZWNrT25lQXJnKHNlbGYsIGNvbXBhdGlibGUsIGFyZykge1xuXHR2YXIgdHlwZSA9IHR5cGVvZiBhcmc7XG5cdGlmIChhcmcgPT09IG51bGwpIHR5cGUgPSBcIm51bGxcIjtcblx0aWYgKHR5cGUgIT09IFwib2JqZWN0XCIpIHRocm93RXJyb3IodHlwZSk7XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb21wYXRpYmxlLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKGFyZyBpbnN0YW5jZW9mIGNvbXBhdGlibGVbaV0pIHJldHVybjtcblx0fVxuXHR0aHJvd0Vycm9yKG9vcC5pbnN0YW5jZU5hbWUoYXJnKSk7XG5cblx0ZnVuY3Rpb24gdGhyb3dFcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKG9vcC5pbnN0YW5jZU5hbWUoc2VsZikgKyBcIiBpc24ndCBjb21wYXRpYmxlIHdpdGggXCIgKyB0eXBlKTtcblx0fVxufSIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuXHRpZiAoc3RyLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBzdHI7XG5cdH1cblxuXHRyZXR1cm4gc3RyXG5cdC5yZXBsYWNlKC9eW18uXFwtIF0rLywgJycpXG5cdC50b0xvd2VyQ2FzZSgpXG5cdC5yZXBsYWNlKC9bXy5cXC0gXSsoXFx3fCQpL2csIGZ1bmN0aW9uIChtLCBwMSkge1xuXHRcdHJldHVybiBwMS50b1VwcGVyQ2FzZSgpO1xuXHR9KTtcbn07XG4iXX0=

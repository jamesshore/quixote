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
	if (this._value === RIGHT || this._value === LEFT) return RelativePosition.right(this, amount);
	if (this._value === TOP || this._value === BOTTOM) return RelativePosition.down(this, amount);
};

Me.prototype.minus = function minus(amount) {
	if (this._value === RIGHT || this._value === LEFT) return RelativePosition.left(this, amount);
	if (this._value === TOP || this._value === BOTTOM) return RelativePosition.up(this, amount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var edge = this._element.getRawPosition()[this._value];
	var scroll = this._element.frame.getRawScrollPosition();
	return createPosition(this, edge, scroll);
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "number") return createPosition(this, arg, { x: 0, y: 0 });
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

function createPosition(self, value, scrollPos) {
	if (self._value === RIGHT || self._value === LEFT) return Position.x(value + scrollPos.x);
	else return Position.y(value + scrollPos.y);
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

	return Size.create(result);
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "number") return Size.create(arg);
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
		this._amount = Size.create(Math.abs(amount));
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
	if (type === "number") return Size.create(arg);
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

function relativeSize() {
	// break circular dependency
	return require("./relative_size.js");
}

Me.prototype.plus = function plus(amount) {
	return relativeSize().larger(this, amount);
};

Me.prototype.minus = function minus(amount) {
	return relativeSize().smaller(this, amount);
};

Me.prototype.times = function times(amount) {
	return Me.create(this, amount);
};

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	return this._relativeTo.value().times(this._multiple);
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "number") return Size.create(arg);
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
},{"../util/ensure.js":11,"../values/size.js":16,"./descriptor.js":1,"./element_size.js":4,"./relative_size.js":6}],8:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var shim = require("./util/shim.js");
var QElement = require("./q_element.js");

var Me = module.exports = function Frame(frameDom, scrollContainerDom) {
	ensure.signature(arguments, [ Object, Object ]);
	ensure.that(frameDom.tagName === "IFRAME", "Frame DOM element must be an iframe");
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

	// WORKAROUND Mobile Safari 7.0.0: Does not respect iframe width and height attributes
	// See also http://davidwalsh.name/scroll-iframes-ios
	var scrollContainer = document.createElement("div");
	scrollContainer.setAttribute("style",
		"-webkit-overflow-scrolling: touch; " +
		"overflow-y: scroll; " +
		"width: " + width + "px; " +
		"height: " + height + "px;"
	);

	var iframe = document.createElement("iframe");
	iframe.setAttribute("width", width);
	iframe.setAttribute("height", height);
	iframe.setAttribute("frameborder", "0");    // WORKAROUND IE 8: don't include frame border in position calcs
	if (options.src) iframe.setAttribute("src", options.src);

	var frame = new Me(iframe, scrollContainer);
	shim.EventTarget.addEventListener(iframe, "load", onFrameLoad);
	scrollContainer.appendChild(iframe);
	parentElement.appendChild(scrollContainer);
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
	this.scroll(0, 0);
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
	return new QElement(insertedElement, this, html);
};

Me.prototype.getElement = function(selector) {
	ensure.signature(arguments, [ String ]);
	ensureUsable(this);

	var nodes = this._document.querySelectorAll(selector);
	ensure.that(nodes.length === 1, "Expected one element to match '" + selector + "', but found " + nodes.length);
	return new QElement(nodes[0], this, selector);
};

Me.prototype.scroll = function scroll(x, y) {
	ensure.signature(arguments, [ Number, Number ]);

	this._domElement.contentWindow.scroll(x, y);

	// WORKAROUND Mobile Safari 7.0.0: frame is not scrollable, but we can scroll the container.
	// There's probably some cases where this isn't real enough.
	if (navigator.userAgent.match(/(iPad|iPhone|iPod touch);/i)) {
		// It would be nice if this used feature detection rather than user agent inspection.
		this._scrollContainer.scrollLeft = x;
		this._scrollContainer.scrollTop = y;
	}
};

Me.prototype.getRawScrollPosition = function getRawScrollPosition() {
	ensure.signature(arguments, []);

	return {
		x: shim.Window.pageXOffset(this._domElement.contentWindow, this._document) + this._scrollContainer.scrollLeft,
		y: shim.Window.pageYOffset(this._domElement.contentWindow, this._document) + this._scrollContainer.scrollTop
	};
};

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

},{"./q_element.js":9,"./util/ensure.js":11,"./util/shim.js":13}],9:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var camelcase = require("../vendor/camelcase-1.0.1-modified.js");
var shim = require("./util/shim.js");
var ElementEdge = require("./descriptors/element_edge.js");
var ElementCenter = require("./descriptors/element_center.js");
var ElementSize = require("./descriptors/element_size.js");

var Me = module.exports = function QElement(domElement, qframe, nickname) {
	var Frame = require("./frame.js");    // break circular dependency
	ensure.signature(arguments, [ Object, Frame, [ String ] ]);

	this._domElement = domElement;
	this._nickname = nickname;

	this.frame = qframe;

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

},{"../vendor/camelcase-1.0.1-modified.js":18,"./descriptors/element_center.js":2,"./descriptors/element_edge.js":3,"./descriptors/element_size.js":4,"./frame.js":8,"./util/ensure.js":11,"./util/shim.js":13}],10:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var Frame = require("./frame.js");

exports.createFrame = function(width, height, options, callback) {
	return Frame.create(document.body, width, height, options, callback);
};

exports.browser = {};

exports.browser.canScroll = function canScroll() {
	// It would be nice if this used feature detection rather than browser detection
	return (!isMobileSafari());
};

function isMobileSafari() {
	return navigator.userAgent.match(/(iPad|iPhone|iPod touch);/i);
}

},{"./frame.js":8,"./util/ensure.js":11}],11:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9kZXNjcmlwdG9yLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvZGVzY3JpcHRvcnMvZWxlbWVudF9jZW50ZXIuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9lbGVtZW50X2VkZ2UuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9lbGVtZW50X3NpemUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9yZWxhdGl2ZV9wb3NpdGlvbi5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL2Rlc2NyaXB0b3JzL3JlbGF0aXZlX3NpemUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9kZXNjcmlwdG9ycy9zaXplX211bHRpcGxlLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvZnJhbWUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9xX2VsZW1lbnQuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9xdWl4b3RlLmpzIiwiL1VzZXJzL2pzaG9yZS9Eb2N1bWVudHMvUHJvamVjdHMvcXVpeG90ZS9zcmMvdXRpbC9lbnN1cmUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy91dGlsL29vcC5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3V0aWwvc2hpbS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3ZhbHVlcy9waXhlbHMuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy92YWx1ZXMvcG9zaXRpb24uanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy92YWx1ZXMvc2l6ZS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3ZhbHVlcy92YWx1ZS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvdmVuZG9yL2NhbWVsY2FzZS0xLjAuMS1tb2RpZmllZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4uL3ZhbHVlcy92YWx1ZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBEZXNjcmlwdG9yKCkge307XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xub29wLm1ha2VBYnN0cmFjdChNZSwgW1xuXHRcInZhbHVlXCIsXG5cdFwidG9TdHJpbmdcIlxuXSk7XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHRleHBlY3RlZCA9IG5vcm1hbGl6ZVR5cGUodGhpcywgZXhwZWN0ZWQpO1xuXHR0cnkge1xuXHRcdHZhciBhY3R1YWxWYWx1ZSA9IHRoaXMudmFsdWUoKTtcblx0XHR2YXIgZXhwZWN0ZWRWYWx1ZSA9IGV4cGVjdGVkLnZhbHVlKCk7XG5cblx0XHRpZiAoYWN0dWFsVmFsdWUuZXF1YWxzKGV4cGVjdGVkVmFsdWUpKSByZXR1cm4gXCJcIjtcblxuXHRcdHZhciBkaWZmZXJlbmNlID0gYWN0dWFsVmFsdWUuZGlmZihleHBlY3RlZFZhbHVlKTtcblx0XHR2YXIgZXhwZWN0ZWREZXNjID0gZXhwZWN0ZWRWYWx1ZS50b1N0cmluZygpO1xuXHRcdGlmIChleHBlY3RlZCBpbnN0YW5jZW9mIE1lKSBleHBlY3RlZERlc2MgKz0gXCIgKFwiICsgZXhwZWN0ZWQgKyBcIilcIjtcblxuXHRcdHJldHVybiB0aGlzICsgXCIgd2FzIFwiICsgZGlmZmVyZW5jZSArIFwiIHRoYW4gZXhwZWN0ZWQuXFxuXCIgK1xuXHRcdFx0XCIgIEV4cGVjdGVkOiBcIiArIGV4cGVjdGVkRGVzYyArIFwiXFxuXCIgK1xuXHRcdFx0XCIgIEJ1dCB3YXM6ICBcIiArIGFjdHVhbFZhbHVlO1xuXHR9XG5cdGNhdGNoIChlcnIpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb21wYXJlIFwiICsgdGhpcyArIFwiIHRvIFwiICsgZXhwZWN0ZWQgKyBcIjogXCIgKyBlcnIubWVzc2FnZSk7XG5cdH1cbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0Ly8gVGhpcyBtZXRob2QgaXMgbWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBieSBzdWJjbGFzc2VzLiBJdCBzaG91bGQgcmV0dXJuICd1bmRlZmluZWQnIHdoZW4gYW4gYXJndW1lbnRcblx0Ly8gY2FuJ3QgYmUgY29udmVydGVkLiBJbiB0aGlzIGRlZmF1bHQgaW1wbGVtZW50YXRpb24sIG5vIGFyZ3VtZW50cyBjYW4gYmUgY29udmVydGVkLCBzbyB3ZSBhbHdheXNcblx0Ly8gcmV0dXJuICd1bmRlZmluZWQnLlxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdC8vIERlc2NyaXB0b3JzIGFyZW4ndCB2YWx1ZSBvYmplY3RzLiBUaGV5J3JlIG5ldmVyIGVxdWFsIHRvIGFueXRoaW5nLiBCdXQgc29tZXRpbWVzXG5cdC8vIHRoZXkncmUgdXNlZCBpbiB0aGUgc2FtZSBwbGFjZXMgdmFsdWUgb2JqZWN0cyBhcmUgdXNlZCwgYW5kIHRoaXMgbWV0aG9kIGdldHMgY2FsbGVkLlxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiBub3JtYWxpemVUeXBlKHNlbGYsIGV4cGVjdGVkKSB7XG5cdHZhciBleHBlY3RlZFR5cGUgPSB0eXBlb2YgZXhwZWN0ZWQ7XG5cdGlmIChleHBlY3RlZCA9PT0gbnVsbCkgZXhwZWN0ZWRUeXBlID0gXCJudWxsXCI7XG5cblx0aWYgKGV4cGVjdGVkVHlwZSA9PT0gXCJvYmplY3RcIiAmJiAoZXhwZWN0ZWQgaW5zdGFuY2VvZiBNZSB8fCBleHBlY3RlZCBpbnN0YW5jZW9mIFZhbHVlKSkgcmV0dXJuIGV4cGVjdGVkO1xuXG5cdGlmIChleHBlY3RlZCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY29tcGFyZSBcIiArIHNlbGYgKyBcIiB0byBcIiArIGV4cGVjdGVkICsgXCIuIERpZCB5b3UgbWlzc3BlbGwgYSBwcm9wZXJ0eSBuYW1lP1wiKTtcblx0fVxuXHRlbHNlIGlmIChleHBlY3RlZFR5cGUgPT09IFwib2JqZWN0XCIpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb21wYXJlIFwiICsgc2VsZiArIFwiIHRvIFwiICsgb29wLmluc3RhbmNlTmFtZShleHBlY3RlZCkgKyBcIiBpbnN0YW5jZXMuXCIpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdGV4cGVjdGVkID0gc2VsZi5jb252ZXJ0KGV4cGVjdGVkLCBleHBlY3RlZFR5cGUpO1xuXHRcdGlmIChleHBlY3RlZCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjb21wYXJlIFwiICsgc2VsZiArIFwiIHRvIFwiICsgZXhwZWN0ZWRUeXBlICsgXCIuXCIpO1xuXHR9XG5cblx0cmV0dXJuIGV4cGVjdGVkO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFBvc2l0aW9uID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9wb3NpdGlvbi5qc1wiKTtcbnZhciBSZWxhdGl2ZVBvc2l0aW9uID0gcmVxdWlyZShcIi4vcmVsYXRpdmVfcG9zaXRpb24uanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudENlbnRlcihkaW1lbnNpb24sIGVsZW1lbnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCByZXF1aXJlKFwiLi4vcV9lbGVtZW50LmpzXCIpIF0pO1xuXHRlbnN1cmUudGhhdChkaW1lbnNpb24gPT09IFhfRElNRU5TSU9OIHx8IGRpbWVuc2lvbiA9PT0gWV9ESU1FTlNJT04sIFwiVW5yZWNvZ25pemVkIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS54ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuXHRyZXR1cm4gbmV3IE1lKFhfRElNRU5TSU9OLCBlbGVtZW50KTtcbn07XG5cbk1lLnkgPSBmdW5jdGlvbihlbGVtZW50KSB7XG5cdHJldHVybiBuZXcgTWUoWV9ESU1FTlNJT04sIGVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBmdW5jdGlvbiBwbHVzKGFtb3VudCkge1xuXHRpZiAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgcmV0dXJuIFJlbGF0aXZlUG9zaXRpb24ucmlnaHQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbi5kb3duKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBmdW5jdGlvbiBtaW51cyhhbW91bnQpIHtcblx0aWYgKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uLmxlZnQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gUmVsYXRpdmVQb3NpdGlvbi51cCh0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIHBvc2l0aW9uID0gdGhpcy5fZWxlbWVudC5nZXRSYXdQb3NpdGlvbigpO1xuXG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZXR1cm4gUG9zaXRpb24ueChwb3NpdGlvbi5sZWZ0ICsgKChwb3NpdGlvbi5yaWdodCAtIHBvc2l0aW9uLmxlZnQpIC8gMikpO1xuXHRlbHNlIHJldHVybiBQb3NpdGlvbi55KHBvc2l0aW9uLnRvcCArICgocG9zaXRpb24uYm90dG9tIC0gcG9zaXRpb24udG9wKSAvIDIpKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHJldHVybiAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgPyBQb3NpdGlvbi54KGFyZykgOiBQb3NpdGlvbi55KGFyZyk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgZGVzY3JpcHRpb24gPSAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgPyBcImNlbnRlclwiIDogXCJtaWRkbGVcIjtcblx0cmV0dXJuIGRlc2NyaXB0aW9uICsgXCIgb2YgXCIgKyB0aGlzLl9lbGVtZW50O1xufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xudmFyIFJlbGF0aXZlUG9zaXRpb24gPSByZXF1aXJlKFwiLi9yZWxhdGl2ZV9wb3NpdGlvbi5qc1wiKTtcbnZhciBEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvci5qc1wiKTtcbnZhciBFbGVtZW50U2l6ZSA9IHJlcXVpcmUoXCIuL2VsZW1lbnRfc2l6ZS5qc1wiKTtcblxudmFyIFRPUCA9IFwidG9wXCI7XG52YXIgUklHSFQgPSBcInJpZ2h0XCI7XG52YXIgQk9UVE9NID0gXCJib3R0b21cIjtcbnZhciBMRUZUID0gXCJsZWZ0XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudEVkZ2UoZWxlbWVudCwgcG9zaXRpb24pIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgcmVxdWlyZShcIi4uL3FfZWxlbWVudC5qc1wiKSwgU3RyaW5nIF0pO1xuXHRlbnN1cmUudGhhdChcblx0XHRwb3NpdGlvbiA9PT0gVE9QIHx8IHBvc2l0aW9uID09PSBSSUdIVCB8fCBwb3NpdGlvbiA9PT0gQk9UVE9NIHx8IHBvc2l0aW9uID09PSBMRUZULFxuXHRcdFwiVW5rbm93biBwb3NpdGlvbjogXCIgKyBwb3NpdGlvblxuXHQpO1xuXG5cdHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuXHR0aGlzLl92YWx1ZSA9IHBvc2l0aW9uO1xufTtcbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUudG9wID0gZmFjdG9yeUZuKFRPUCk7XG5NZS5yaWdodCA9IGZhY3RvcnlGbihSSUdIVCk7XG5NZS5ib3R0b20gPSBmYWN0b3J5Rm4oQk9UVE9NKTtcbk1lLmxlZnQgPSBmYWN0b3J5Rm4oTEVGVCk7XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gZnVuY3Rpb24gcGx1cyhhbW91bnQpIHtcblx0aWYgKHRoaXMuX3ZhbHVlID09PSBSSUdIVCB8fCB0aGlzLl92YWx1ZSA9PT0gTEVGVCkgcmV0dXJuIFJlbGF0aXZlUG9zaXRpb24ucmlnaHQodGhpcywgYW1vdW50KTtcblx0aWYgKHRoaXMuX3ZhbHVlID09PSBUT1AgfHwgdGhpcy5fdmFsdWUgPT09IEJPVFRPTSkgcmV0dXJuIFJlbGF0aXZlUG9zaXRpb24uZG93bih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gZnVuY3Rpb24gbWludXMoYW1vdW50KSB7XG5cdGlmICh0aGlzLl92YWx1ZSA9PT0gUklHSFQgfHwgdGhpcy5fdmFsdWUgPT09IExFRlQpIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uLmxlZnQodGhpcywgYW1vdW50KTtcblx0aWYgKHRoaXMuX3ZhbHVlID09PSBUT1AgfHwgdGhpcy5fdmFsdWUgPT09IEJPVFRPTSkgcmV0dXJuIFJlbGF0aXZlUG9zaXRpb24udXAodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBlZGdlID0gdGhpcy5fZWxlbWVudC5nZXRSYXdQb3NpdGlvbigpW3RoaXMuX3ZhbHVlXTtcblx0dmFyIHNjcm9sbCA9IHRoaXMuX2VsZW1lbnQuZnJhbWUuZ2V0UmF3U2Nyb2xsUG9zaXRpb24oKTtcblx0cmV0dXJuIGNyZWF0ZVBvc2l0aW9uKHRoaXMsIGVkZ2UsIHNjcm9sbCk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoYXJnLCB0eXBlKSB7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiKSByZXR1cm4gY3JlYXRlUG9zaXRpb24odGhpcywgYXJnLCB7IHg6IDAsIHk6IDAgfSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX3ZhbHVlICsgXCIgZWRnZSBvZiBcIiArIHRoaXMuX2VsZW1lbnQ7XG59O1xuXG5mdW5jdGlvbiBmYWN0b3J5Rm4ocG9zaXRpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkoZWxlbWVudCkge1xuXHRcdHJldHVybiBuZXcgTWUoZWxlbWVudCwgcG9zaXRpb24pO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQb3NpdGlvbihzZWxmLCB2YWx1ZSwgc2Nyb2xsUG9zKSB7XG5cdGlmIChzZWxmLl92YWx1ZSA9PT0gUklHSFQgfHwgc2VsZi5fdmFsdWUgPT09IExFRlQpIHJldHVybiBQb3NpdGlvbi54KHZhbHVlICsgc2Nyb2xsUG9zLngpO1xuXHRlbHNlIHJldHVybiBQb3NpdGlvbi55KHZhbHVlICsgc2Nyb2xsUG9zLnkpO1xufSIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvci5qc1wiKTtcbnZhciBTaXplID0gcmVxdWlyZShcIi4uL3ZhbHVlcy9zaXplLmpzXCIpO1xudmFyIFJlbGF0aXZlU2l6ZSA9IHJlcXVpcmUoXCIuL3JlbGF0aXZlX3NpemUuanNcIik7XG52YXIgU2l6ZU11bHRpcGxlID0gcmVxdWlyZShcIi4vc2l6ZV9tdWx0aXBsZS5qc1wiKTtcblxudmFyIFhfRElNRU5TSU9OID0gXCJ4XCI7XG52YXIgWV9ESU1FTlNJT04gPSBcInlcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBFbGVtZW50U2l6ZShkaW1lbnNpb24sIGVsZW1lbnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCByZXF1aXJlKFwiLi4vcV9lbGVtZW50LmpzXCIpIF0pO1xuXHRlbnN1cmUudGhhdChkaW1lbnNpb24gPT09IFhfRElNRU5TSU9OIHx8IGRpbWVuc2lvbiA9PT0gWV9ESU1FTlNJT04sIFwiVW5yZWNvZ25pemVkIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS54ID0gZnVuY3Rpb24geChlbGVtZW50KSB7XG5cdHJldHVybiBuZXcgTWUoWF9ESU1FTlNJT04sIGVsZW1lbnQpO1xufTtcblxuTWUueSA9IGZ1bmN0aW9uIHkoZWxlbWVudCkge1xuXHRyZXR1cm4gbmV3IE1lKFlfRElNRU5TSU9OLCBlbGVtZW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gZnVuY3Rpb24gcGx1cyhhbW91bnQpIHtcblx0cmV0dXJuIFJlbGF0aXZlU2l6ZS5sYXJnZXIodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5taW51cyA9IGZ1bmN0aW9uIG1pbnVzKGFtb3VudCkge1xuXHRyZXR1cm4gUmVsYXRpdmVTaXplLnNtYWxsZXIodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS50aW1lcyA9IGZ1bmN0aW9uIHRpbWVzKGFtb3VudCkge1xuXHRyZXR1cm4gU2l6ZU11bHRpcGxlLmNyZWF0ZSh0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIHBvc2l0aW9uID0gdGhpcy5fZWxlbWVudC5nZXRSYXdQb3NpdGlvbigpO1xuXHR2YXIgcmVzdWx0ID0gKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pID8gcG9zaXRpb24ud2lkdGggOiBwb3NpdGlvbi5oZWlnaHQ7XG5cblx0cmV0dXJuIFNpemUuY3JlYXRlKHJlc3VsdCk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoYXJnLCB0eXBlKSB7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiKSByZXR1cm4gU2l6ZS5jcmVhdGUoYXJnKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBkZXNjID0gKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pID8gXCJ3aWR0aFwiIDogXCJoZWlnaHRcIjtcblx0cmV0dXJuIGRlc2MgKyBcIiBvZiBcIiArIHRoaXMuX2VsZW1lbnQ7XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvc2l6ZS5qc1wiKTtcbnZhciBQaXhlbHMgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3BpeGVscy5qc1wiKTtcbnZhciBFbGVtZW50U2l6ZSA9IHJlcXVpcmUoXCIuL2VsZW1lbnRfc2l6ZS5qc1wiKTtcblxudmFyIFhfRElNRU5TSU9OID0gXCJ4XCI7XG52YXIgWV9ESU1FTlNJT04gPSBcInlcIjtcbnZhciBQTFVTID0gMTtcbnZhciBNSU5VUyA9IC0xO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFJlbGF0aXZlUG9zaXRpb24oZGltZW5zaW9uLCBkaXJlY3Rpb24sIHJlbGF0aXZlVG8sIHJlbGF0aXZlQW1vdW50KSB7XG5cdHZhciBFbGVtZW50RWRnZSA9IHJlcXVpcmUoXCIuL2VsZW1lbnRfZWRnZS5qc1wiKTsgICAgICAgLy8gcmVxdWlyZSgpIGlzIGhlcmUgZHVlIHRvIGNpcmN1bGFyIGRlcGVuZGVuY3lcblx0dmFyIEVsZW1lbnRDZW50ZXIgPSByZXF1aXJlKFwiLi9lbGVtZW50X2NlbnRlci5qc1wiKTtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBOdW1iZXIsIERlc2NyaXB0b3IsIFtOdW1iZXIsIERlc2NyaXB0b3JdIF0pO1xuXHRlbnN1cmUudGhhdChkaW1lbnNpb24gPT09IFhfRElNRU5TSU9OIHx8IGRpbWVuc2lvbiA9PT0gWV9ESU1FTlNJT04sIFwiVW5yZWNvZ25pemVkIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuXHR0aGlzLl9yZWxhdGl2ZVRvID0gcmVsYXRpdmVUbztcblxuXHRpZiAodHlwZW9mIHJlbGF0aXZlQW1vdW50ID09PSBcIm51bWJlclwiKSB7XG5cdFx0aWYgKHJlbGF0aXZlQW1vdW50IDwgMCkgdGhpcy5fZGlyZWN0aW9uICo9IC0xO1xuXHRcdHRoaXMuX2Ftb3VudCA9IFNpemUuY3JlYXRlKE1hdGguYWJzKHJlbGF0aXZlQW1vdW50KSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0dGhpcy5fYW1vdW50ID0gcmVsYXRpdmVBbW91bnQ7XG5cdH1cbn07XG5EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnJpZ2h0ID0gY3JlYXRlRm4oWF9ESU1FTlNJT04sIFBMVVMpO1xuTWUuZG93biA9IGNyZWF0ZUZuKFlfRElNRU5TSU9OLCBQTFVTKTtcbk1lLmxlZnQgPSBjcmVhdGVGbihYX0RJTUVOU0lPTiwgTUlOVVMpO1xuTWUudXAgPSBjcmVhdGVGbihZX0RJTUVOU0lPTiwgTUlOVVMpO1xuXG5mdW5jdGlvbiBjcmVhdGVGbihkaW1lbnNpb24sIGRpcmVjdGlvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gY3JlYXRlKHJlbGF0aXZlVG8sIHJlbGF0aXZlQW1vdW50KSB7XG5cdFx0cmV0dXJuIG5ldyBNZShkaW1lbnNpb24sIGRpcmVjdGlvbiwgcmVsYXRpdmVUbywgcmVsYXRpdmVBbW91bnQpO1xuXHR9O1xufVxuXG5NZS5wcm90b3R5cGUucGx1cyA9IGZ1bmN0aW9uIHBsdXMoYW1vdW50KSB7XG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZXR1cm4gTWUucmlnaHQodGhpcywgYW1vdW50KTtcblx0ZWxzZSByZXR1cm4gTWUuZG93bih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gZnVuY3Rpb24gbWludXMoYW1vdW50KSB7XG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFlfRElNRU5TSU9OKSByZXR1cm4gTWUubGVmdCh0aGlzLCBhbW91bnQpO1xuXHRlbHNlIHJldHVybiBNZS51cCh0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2VWYWx1ZSA9IHRoaXMuX3JlbGF0aXZlVG8udmFsdWUoKTtcblx0dmFyIHJlbGF0aXZlVmFsdWUgPSB0aGlzLl9hbW91bnQudmFsdWUoKTtcblxuXHRpZiAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSByZXR1cm4gYmFzZVZhbHVlLnBsdXMocmVsYXRpdmVWYWx1ZSk7XG5cdGVsc2UgcmV0dXJuIGJhc2VWYWx1ZS5taW51cyhyZWxhdGl2ZVZhbHVlKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHJldHVybiBjcmVhdGVQb3NpdGlvbih0aGlzLCBhcmcpO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2UgPSB0aGlzLl9yZWxhdGl2ZVRvLnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9hbW91bnQuZXF1YWxzKFNpemUuY3JlYXRlKDApKSkgcmV0dXJuIGJhc2U7XG5cblx0dmFyIHJlbGF0aW9uID0gdGhpcy5fYW1vdW50LnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZWxhdGlvbiArPSAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSA/IFwiIHRvIHJpZ2h0IG9mIFwiIDogXCIgdG8gbGVmdCBvZiBcIjtcblx0ZWxzZSByZWxhdGlvbiArPSAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSA/IFwiIGJlbG93IFwiIDogXCIgYWJvdmUgXCI7XG5cblx0cmV0dXJuIHJlbGF0aW9uICsgYmFzZTtcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZVBvc2l0aW9uKHNlbGYsIHZhbHVlKSB7XG5cdGlmIChzZWxmLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZXR1cm4gUG9zaXRpb24ueCh2YWx1ZSk7XG5cdGVsc2UgcmV0dXJuIFBvc2l0aW9uLnkodmFsdWUpO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgU2l6ZU11bHRpcGxlID0gcmVxdWlyZShcIi4vc2l6ZV9tdWx0aXBsZS5qc1wiKTtcblxudmFyIFBMVVMgPSAxO1xudmFyIE1JTlVTID0gLTE7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUmVsYXRpdmVTaXplKGRpcmVjdGlvbiwgcmVsYXRpdmVUbywgYW1vdW50KSB7XG5cdHZhciBFbGVtZW50U2l6ZSA9IHJlcXVpcmUoXCIuL2VsZW1lbnRfc2l6ZS5qc1wiKTtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTnVtYmVyLCBEZXNjcmlwdG9yLCBbTnVtYmVyLCBEZXNjcmlwdG9yXSBdKTtcblxuXHR0aGlzLl9kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG5cdHRoaXMuX3JlbGF0aXZlVG8gPSByZWxhdGl2ZVRvO1xuXG5cdGlmICh0eXBlb2YgYW1vdW50ID09PSBcIm51bWJlclwiKSB7XG5cdFx0dGhpcy5fYW1vdW50ID0gU2l6ZS5jcmVhdGUoTWF0aC5hYnMoYW1vdW50KSk7XG5cdFx0aWYgKGFtb3VudCA8IDApIHRoaXMuX2RpcmVjdGlvbiAqPSAtMTtcblx0fVxuXHRlbHNlIHtcblx0XHR0aGlzLl9hbW91bnQgPSBhbW91bnQ7XG5cdH1cbn07XG5EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLmxhcmdlciA9IGZ1bmN0aW9uIGxhcmdlcihyZWxhdGl2ZVRvLCBhbW91bnQpIHtcblx0cmV0dXJuIG5ldyBNZShQTFVTLCByZWxhdGl2ZVRvLCBhbW91bnQpO1xufTtcblxuTWUuc21hbGxlciA9IGZ1bmN0aW9uIHNtYWxsZXIocmVsYXRpdmVUbywgYW1vdW50KSB7XG5cdHJldHVybiBuZXcgTWUoTUlOVVMsIHJlbGF0aXZlVG8sIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IGZ1bmN0aW9uIHBsdXMoYW1vdW50KSB7XG5cdHJldHVybiBNZS5sYXJnZXIodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5taW51cyA9IGZ1bmN0aW9uIG1pbnVzKGFtb3VudCkge1xuXHRyZXR1cm4gTWUuc21hbGxlcih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnRpbWVzID0gZnVuY3Rpb24gdGltZXMoYW1vdW50KSB7XG5cdHJldHVybiBTaXplTXVsdGlwbGUuY3JlYXRlKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgYmFzZVZhbHVlID0gdGhpcy5fcmVsYXRpdmVUby52YWx1ZSgpO1xuXHR2YXIgcmVsYXRpdmVWYWx1ZSA9IHRoaXMuX2Ftb3VudC52YWx1ZSgpO1xuXG5cdGlmICh0aGlzLl9kaXJlY3Rpb24gPT09IFBMVVMpIHJldHVybiBiYXNlVmFsdWUucGx1cyhyZWxhdGl2ZVZhbHVlKTtcblx0ZWxzZSByZXR1cm4gYmFzZVZhbHVlLm1pbnVzKHJlbGF0aXZlVmFsdWUpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGFyZywgdHlwZSkge1xuXHRpZiAodHlwZSA9PT0gXCJudW1iZXJcIikgcmV0dXJuIFNpemUuY3JlYXRlKGFyZyk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgYmFzZSA9IHRoaXMuX3JlbGF0aXZlVG8udG9TdHJpbmcoKTtcblx0aWYgKHRoaXMuX2Ftb3VudC5lcXVhbHMoU2l6ZS5jcmVhdGUoMCkpKSByZXR1cm4gYmFzZTtcblxuXHR2YXIgcmVsYXRpb24gPSB0aGlzLl9hbW91bnQudG9TdHJpbmcoKTtcblx0aWYgKHRoaXMuX2RpcmVjdGlvbiA9PT0gUExVUykgcmVsYXRpb24gKz0gXCIgbGFyZ2VyIHRoYW4gXCI7XG5cdGVsc2UgcmVsYXRpb24gKz0gXCIgc21hbGxlciB0aGFuIFwiO1xuXG5cdHJldHVybiByZWxhdGlvbiArIGJhc2U7XG59O1xuXG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvc2l6ZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBTaXplTXVsdGlwbGUocmVsYXRpdmVUbywgbXVsdGlwbGUpIHtcblx0dmFyIEVsZW1lbnRTaXplID0gcmVxdWlyZShcIi4vZWxlbWVudF9zaXplLmpzXCIpO1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBEZXNjcmlwdG9yLCBOdW1iZXIgXSk7XG5cblx0dGhpcy5fcmVsYXRpdmVUbyA9IHJlbGF0aXZlVG87XG5cdHRoaXMuX211bHRpcGxlID0gbXVsdGlwbGU7XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUocmVsYXRpdmVUbywgbXVsdGlwbGUpIHtcblx0cmV0dXJuIG5ldyBNZShyZWxhdGl2ZVRvLCBtdWx0aXBsZSk7XG59O1xuXG5mdW5jdGlvbiByZWxhdGl2ZVNpemUoKSB7XG5cdC8vIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY3lcblx0cmV0dXJuIHJlcXVpcmUoXCIuL3JlbGF0aXZlX3NpemUuanNcIik7XG59XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gZnVuY3Rpb24gcGx1cyhhbW91bnQpIHtcblx0cmV0dXJuIHJlbGF0aXZlU2l6ZSgpLmxhcmdlcih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gZnVuY3Rpb24gbWludXMoYW1vdW50KSB7XG5cdHJldHVybiByZWxhdGl2ZVNpemUoKS5zbWFsbGVyKHRoaXMsIGFtb3VudCk7XG59O1xuXG5NZS5wcm90b3R5cGUudGltZXMgPSBmdW5jdGlvbiB0aW1lcyhhbW91bnQpIHtcblx0cmV0dXJuIE1lLmNyZWF0ZSh0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX3JlbGF0aXZlVG8udmFsdWUoKS50aW1lcyh0aGlzLl9tdWx0aXBsZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoYXJnLCB0eXBlKSB7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiKSByZXR1cm4gU2l6ZS5jcmVhdGUoYXJnKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBtdWx0aXBsZSA9IHRoaXMuX211bHRpcGxlO1xuXHR2YXIgYmFzZSA9IHRoaXMuX3JlbGF0aXZlVG8udG9TdHJpbmcoKTtcblx0aWYgKG11bHRpcGxlID09PSAxKSByZXR1cm4gYmFzZTtcblxuXHR2YXIgZGVzYztcblx0c3dpdGNoKG11bHRpcGxlKSB7XG5cdFx0Y2FzZSAxLzI6IGRlc2MgPSBcImhhbGYgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMS8zOiBkZXNjID0gXCJvbmUgdGhpcmQgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMi8zOiBkZXNjID0gXCJ0d28gdGhpcmRzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDEvNDogZGVzYyA9IFwib25lIHF1YXJ0ZXIgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMy80OiBkZXNjID0gXCJ0aHJlZSBxdWFydGVycyBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAxLzU6IGRlc2MgPSBcIm9uZSBmaWZ0aCBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAyLzU6IGRlc2MgPSBcInR3byBmaWZ0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMy81OiBkZXNjID0gXCJ0aHJlZSBmaWZ0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgNC81OiBkZXNjID0gXCJmb3VyIGZpZnRocyBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAxLzY6IGRlc2MgPSBcIm9uZSBzaXh0aCBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSA1LzY6IGRlc2MgPSBcImZpdmUgc2l4dGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDEvODogZGVzYyA9IFwib25lIGVpZ2h0aCBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAzLzg6IGRlc2MgPSBcInRocmVlIGVpZ2h0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgNS84OiBkZXNjID0gXCJmaXZlIGVpZ2h0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgNy84OiBkZXNjID0gXCJzZXZlbiBlaWdodGhzIG9mIFwiOyBicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0aWYgKG11bHRpcGxlID4gMSkgZGVzYyA9IG11bHRpcGxlICsgXCIgdGltZXMgXCI7XG5cdFx0XHRlbHNlIGRlc2MgPSAobXVsdGlwbGUgKiAxMDApICsgXCIlIG9mIFwiO1xuXHR9XG5cblx0cmV0dXJuIGRlc2MgKyBiYXNlO1xufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBzaGltID0gcmVxdWlyZShcIi4vdXRpbC9zaGltLmpzXCIpO1xudmFyIFFFbGVtZW50ID0gcmVxdWlyZShcIi4vcV9lbGVtZW50LmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEZyYW1lKGZyYW1lRG9tLCBzY3JvbGxDb250YWluZXJEb20pIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0LCBPYmplY3QgXSk7XG5cdGVuc3VyZS50aGF0KGZyYW1lRG9tLnRhZ05hbWUgPT09IFwiSUZSQU1FXCIsIFwiRnJhbWUgRE9NIGVsZW1lbnQgbXVzdCBiZSBhbiBpZnJhbWVcIik7XG5cdGVuc3VyZS50aGF0KHNjcm9sbENvbnRhaW5lckRvbS50YWdOYW1lID09PSBcIkRJVlwiLCBcIlNjcm9sbCBjb250YWluZXIgRE9NIGVsZW1lbnQgbXVzdCBiZSBhIGRpdlwiKTtcblxuXHR0aGlzLl9kb21FbGVtZW50ID0gZnJhbWVEb207XG5cdHRoaXMuX3Njcm9sbENvbnRhaW5lciA9IHNjcm9sbENvbnRhaW5lckRvbTtcblx0dGhpcy5fbG9hZGVkID0gZmFsc2U7XG5cdHRoaXMuX3JlbW92ZWQgPSBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIGxvYWRlZChzZWxmKSB7XG5cdGVuc3VyZS50aGF0KHNlbGYuX3Njcm9sbENvbnRhaW5lci5jaGlsZE5vZGVzWzBdID09PSBzZWxmLl9kb21FbGVtZW50LCBcImlmcmFtZSBtdXN0IGJlIGVtYmVkZGVkIGluIHRoZSBzY3JvbGwgY29udGFpbmVyXCIpO1xuXHRzZWxmLl9sb2FkZWQgPSB0cnVlO1xuXHRzZWxmLl9kb2N1bWVudCA9IHNlbGYuX2RvbUVsZW1lbnQuY29udGVudERvY3VtZW50O1xuXHRzZWxmLl9vcmlnaW5hbEJvZHkgPSBzZWxmLl9kb2N1bWVudC5ib2R5LmlubmVySFRNTDtcbn1cblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKHBhcmVudEVsZW1lbnQsIHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgTnVtYmVyLCBOdW1iZXIsIFsgT2JqZWN0LCBGdW5jdGlvbiBdLCBbIHVuZGVmaW5lZCwgRnVuY3Rpb24gXSBdKTtcblxuXHRpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCkge1xuXHRcdGNhbGxiYWNrID0gb3B0aW9ucztcblx0XHRvcHRpb25zID0ge307XG5cdH1cblxuXHQvLyBXT1JLQVJPVU5EIE1vYmlsZSBTYWZhcmkgNy4wLjA6IHdlaXJkIHN0eWxlIHJlc3VsdHMgb2NjdXIgd2hlbiBib3RoIHNyYyBhbmQgc3R5bGVzaGVldCBhcmUgbG9hZGVkIChzZWUgdGVzdClcblx0ZW5zdXJlLnRoYXQoXG5cdFx0IShvcHRpb25zLnNyYyAmJiBvcHRpb25zLnN0eWxlc2hlZXQpLFxuXHRcdFwiQ2Fubm90IHNwZWNpZnkgSFRNTCBVUkwgYW5kIHN0eWxlc2hlZXQgVVJMIHNpbXVsdGFuZW91c2x5IGR1ZSB0byBNb2JpbGUgU2FmYXJpIGlzc3VlXCJcblx0KTtcblxuXHQvLyBXT1JLQVJPVU5EIE1vYmlsZSBTYWZhcmkgNy4wLjA6IERvZXMgbm90IHJlc3BlY3QgaWZyYW1lIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlc1xuXHQvLyBTZWUgYWxzbyBodHRwOi8vZGF2aWR3YWxzaC5uYW1lL3Njcm9sbC1pZnJhbWVzLWlvc1xuXHR2YXIgc2Nyb2xsQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0c2Nyb2xsQ29udGFpbmVyLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsXG5cdFx0XCItd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzogdG91Y2g7IFwiICtcblx0XHRcIm92ZXJmbG93LXk6IHNjcm9sbDsgXCIgK1xuXHRcdFwid2lkdGg6IFwiICsgd2lkdGggKyBcInB4OyBcIiArXG5cdFx0XCJoZWlnaHQ6IFwiICsgaGVpZ2h0ICsgXCJweDtcIlxuXHQpO1xuXG5cdHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xuXHRpZnJhbWUuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgd2lkdGgpO1xuXHRpZnJhbWUuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJmcmFtZWJvcmRlclwiLCBcIjBcIik7ICAgIC8vIFdPUktBUk9VTkQgSUUgODogZG9uJ3QgaW5jbHVkZSBmcmFtZSBib3JkZXIgaW4gcG9zaXRpb24gY2FsY3Ncblx0aWYgKG9wdGlvbnMuc3JjKSBpZnJhbWUuc2V0QXR0cmlidXRlKFwic3JjXCIsIG9wdGlvbnMuc3JjKTtcblxuXHR2YXIgZnJhbWUgPSBuZXcgTWUoaWZyYW1lLCBzY3JvbGxDb250YWluZXIpO1xuXHRzaGltLkV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoaWZyYW1lLCBcImxvYWRcIiwgb25GcmFtZUxvYWQpO1xuXHRzY3JvbGxDb250YWluZXIuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcblx0cGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZChzY3JvbGxDb250YWluZXIpO1xuXHRyZXR1cm4gZnJhbWU7XG5cblx0ZnVuY3Rpb24gb25GcmFtZUxvYWQoKSB7XG5cdFx0Ly8gV09SS0FST1VORCBNb2JpbGUgU2FmYXJpIDcuMC4wLCBTYWZhcmkgNi4yLjAsIENocm9tZSAzOC4wLjIxMjU6IGZyYW1lIGlzIGxvYWRlZCBzeW5jaHJvbm91c2x5XG5cdFx0Ly8gV2UgZm9yY2UgaXQgdG8gYmUgYXN5bmNocm9ub3VzIGhlcmVcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9hZGVkKGZyYW1lKTtcblx0XHRcdGxvYWRTdHlsZXNoZWV0KGZyYW1lLCBvcHRpb25zLnN0eWxlc2hlZXQsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjYWxsYmFjayhudWxsLCBmcmFtZSk7XG5cdFx0XHR9KTtcblx0XHR9LCAwKTtcblx0fVxufTtcblxuZnVuY3Rpb24gbG9hZFN0eWxlc2hlZXQoc2VsZiwgdXJsLCBjYWxsYmFjaykge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBNZSwgWyB1bmRlZmluZWQsIFN0cmluZyBdLCBGdW5jdGlvbiBdKTtcblx0aWYgKHVybCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gY2FsbGJhY2soKTtcblxuXHR2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuXHRzaGltLkV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIobGluaywgXCJsb2FkXCIsIG9uTGlua0xvYWQpO1xuXHRsaW5rLnNldEF0dHJpYnV0ZShcInJlbFwiLCBcInN0eWxlc2hlZXRcIik7XG5cdGxpbmsuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcInRleHQvY3NzXCIpO1xuXHRsaW5rLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgdXJsKTtcblxuXHRzaGltLkRvY3VtZW50LmhlYWQoc2VsZi5fZG9jdW1lbnQpLmFwcGVuZENoaWxkKGxpbmspO1xuXHRmdW5jdGlvbiBvbkxpbmtMb2FkKCkge1xuXHRcdGNhbGxiYWNrKCk7XG5cdH1cbn1cblxuTWUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHR0aGlzLl9kb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IHRoaXMuX29yaWdpbmFsQm9keTtcblx0dGhpcy5zY3JvbGwoMCwgMCk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9Eb21FbGVtZW50ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdGVuc3VyZU5vdFJlbW92ZWQodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2RvbUVsZW1lbnQ7XG59O1xuXG5NZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdGVuc3VyZUxvYWRlZCh0aGlzKTtcblx0aWYgKHRoaXMuX3JlbW92ZWQpIHJldHVybjtcblxuXHR0aGlzLl9yZW1vdmVkID0gdHJ1ZTtcblxuXHR2YXIgc2Nyb2xsQ29udGFpbmVyID0gdGhpcy5fZG9tRWxlbWVudC5wYXJlbnROb2RlO1xuXHRzY3JvbGxDb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JvbGxDb250YWluZXIpO1xufTtcblxuTWUucHJvdG90eXBlLmFkZEVsZW1lbnQgPSBmdW5jdGlvbihodG1sKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZyBdKTtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHZhciB0ZW1wRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdHRlbXBFbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG5cdGVuc3VyZS50aGF0KFxuXHRcdHRlbXBFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoID09PSAxLFxuXHRcdFwiRXhwZWN0ZWQgb25lIGVsZW1lbnQsIGJ1dCBnb3QgXCIgKyB0ZW1wRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCArIFwiIChcIiArIGh0bWwgKyBcIilcIlxuXHQpO1xuXG5cdHZhciBpbnNlcnRlZEVsZW1lbnQgPSB0ZW1wRWxlbWVudC5jaGlsZE5vZGVzWzBdO1xuXHR0aGlzLl9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGluc2VydGVkRWxlbWVudCk7XG5cdHJldHVybiBuZXcgUUVsZW1lbnQoaW5zZXJ0ZWRFbGVtZW50LCB0aGlzLCBodG1sKTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRFbGVtZW50ID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nIF0pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dmFyIG5vZGVzID0gdGhpcy5fZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG5cdGVuc3VyZS50aGF0KG5vZGVzLmxlbmd0aCA9PT0gMSwgXCJFeHBlY3RlZCBvbmUgZWxlbWVudCB0byBtYXRjaCAnXCIgKyBzZWxlY3RvciArIFwiJywgYnV0IGZvdW5kIFwiICsgbm9kZXMubGVuZ3RoKTtcblx0cmV0dXJuIG5ldyBRRWxlbWVudChub2Rlc1swXSwgdGhpcywgc2VsZWN0b3IpO1xufTtcblxuTWUucHJvdG90eXBlLnNjcm9sbCA9IGZ1bmN0aW9uIHNjcm9sbCh4LCB5KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE51bWJlciwgTnVtYmVyIF0pO1xuXG5cdHRoaXMuX2RvbUVsZW1lbnQuY29udGVudFdpbmRvdy5zY3JvbGwoeCwgeSk7XG5cblx0Ly8gV09SS0FST1VORCBNb2JpbGUgU2FmYXJpIDcuMC4wOiBmcmFtZSBpcyBub3Qgc2Nyb2xsYWJsZSwgYnV0IHdlIGNhbiBzY3JvbGwgdGhlIGNvbnRhaW5lci5cblx0Ly8gVGhlcmUncyBwcm9iYWJseSBzb21lIGNhc2VzIHdoZXJlIHRoaXMgaXNuJ3QgcmVhbCBlbm91Z2guXG5cdGlmIChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oaVBhZHxpUGhvbmV8aVBvZCB0b3VjaCk7L2kpKSB7XG5cdFx0Ly8gSXQgd291bGQgYmUgbmljZSBpZiB0aGlzIHVzZWQgZmVhdHVyZSBkZXRlY3Rpb24gcmF0aGVyIHRoYW4gdXNlciBhZ2VudCBpbnNwZWN0aW9uLlxuXHRcdHRoaXMuX3Njcm9sbENvbnRhaW5lci5zY3JvbGxMZWZ0ID0geDtcblx0XHR0aGlzLl9zY3JvbGxDb250YWluZXIuc2Nyb2xsVG9wID0geTtcblx0fVxufTtcblxuTWUucHJvdG90eXBlLmdldFJhd1Njcm9sbFBvc2l0aW9uID0gZnVuY3Rpb24gZ2V0UmF3U2Nyb2xsUG9zaXRpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHtcblx0XHR4OiBzaGltLldpbmRvdy5wYWdlWE9mZnNldCh0aGlzLl9kb21FbGVtZW50LmNvbnRlbnRXaW5kb3csIHRoaXMuX2RvY3VtZW50KSArIHRoaXMuX3Njcm9sbENvbnRhaW5lci5zY3JvbGxMZWZ0LFxuXHRcdHk6IHNoaW0uV2luZG93LnBhZ2VZT2Zmc2V0KHRoaXMuX2RvbUVsZW1lbnQuY29udGVudFdpbmRvdywgdGhpcy5fZG9jdW1lbnQpICsgdGhpcy5fc2Nyb2xsQ29udGFpbmVyLnNjcm9sbFRvcFxuXHR9O1xufTtcblxuZnVuY3Rpb24gZW5zdXJlVXNhYmxlKHNlbGYpIHtcblx0ZW5zdXJlTG9hZGVkKHNlbGYpO1xuXHRlbnN1cmVOb3RSZW1vdmVkKHNlbGYpO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVMb2FkZWQoc2VsZikge1xuXHRlbnN1cmUudGhhdChzZWxmLl9sb2FkZWQsIFwiRnJhbWUgbm90IGxvYWRlZDogV2FpdCBmb3IgZnJhbWUgY3JlYXRpb24gY2FsbGJhY2sgdG8gZXhlY3V0ZSBiZWZvcmUgdXNpbmcgZnJhbWVcIik7XG59XG5cbmZ1bmN0aW9uIGVuc3VyZU5vdFJlbW92ZWQoc2VsZikge1xuXHRlbnN1cmUudGhhdCghc2VsZi5fcmVtb3ZlZCwgXCJBdHRlbXB0ZWQgdG8gdXNlIGZyYW1lIGFmdGVyIGl0IHdhcyByZW1vdmVkXCIpO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgY2FtZWxjYXNlID0gcmVxdWlyZShcIi4uL3ZlbmRvci9jYW1lbGNhc2UtMS4wLjEtbW9kaWZpZWQuanNcIik7XG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3V0aWwvc2hpbS5qc1wiKTtcbnZhciBFbGVtZW50RWRnZSA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL2VsZW1lbnRfZWRnZS5qc1wiKTtcbnZhciBFbGVtZW50Q2VudGVyID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvZWxlbWVudF9jZW50ZXIuanNcIik7XG52YXIgRWxlbWVudFNpemUgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9lbGVtZW50X3NpemUuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUUVsZW1lbnQoZG9tRWxlbWVudCwgcWZyYW1lLCBuaWNrbmFtZSkge1xuXHR2YXIgRnJhbWUgPSByZXF1aXJlKFwiLi9mcmFtZS5qc1wiKTsgICAgLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBPYmplY3QsIEZyYW1lLCBbIFN0cmluZyBdIF0pO1xuXG5cdHRoaXMuX2RvbUVsZW1lbnQgPSBkb21FbGVtZW50O1xuXHR0aGlzLl9uaWNrbmFtZSA9IG5pY2tuYW1lO1xuXG5cdHRoaXMuZnJhbWUgPSBxZnJhbWU7XG5cblx0dGhpcy50b3AgPSBFbGVtZW50RWRnZS50b3AodGhpcyk7XG5cdHRoaXMucmlnaHQgPSBFbGVtZW50RWRnZS5yaWdodCh0aGlzKTtcblx0dGhpcy5ib3R0b20gPSBFbGVtZW50RWRnZS5ib3R0b20odGhpcyk7XG5cdHRoaXMubGVmdCA9IEVsZW1lbnRFZGdlLmxlZnQodGhpcyk7XG5cblx0dGhpcy5jZW50ZXIgPSBFbGVtZW50Q2VudGVyLngodGhpcyk7XG5cdHRoaXMubWlkZGxlID0gRWxlbWVudENlbnRlci55KHRoaXMpO1xuXG5cdHRoaXMud2lkdGggPSBFbGVtZW50U2l6ZS54KHRoaXMpO1xuXHR0aGlzLmhlaWdodCA9IEVsZW1lbnRTaXplLnkodGhpcyk7XG59O1xuXG5NZS5wcm90b3R5cGUuYXNzZXJ0ID0gZnVuY3Rpb24gYXNzZXJ0KGV4cGVjdGVkLCBtZXNzYWdlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE9iamVjdCwgW3VuZGVmaW5lZCwgU3RyaW5nXSBdKTtcblx0aWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCkgbWVzc2FnZSA9IFwiRGlmZmVyZW5jZXMgZm91bmRcIjtcblxuXHR2YXIgZGlmZiA9IHRoaXMuZGlmZihleHBlY3RlZCk7XG5cdGlmIChkaWZmICE9PSBcIlwiKSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSArIFwiOlxcblwiICsgZGlmZik7XG59O1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uIGRpZmYoZXhwZWN0ZWQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0IF0pO1xuXG5cdHZhciByZXN1bHQgPSBbXTtcblx0dmFyIGtleXMgPSBzaGltLk9iamVjdC5rZXlzKGV4cGVjdGVkKTtcblx0dmFyIGtleSwgb25lRGlmZiwgZGVzY3JpcHRvcjtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0a2V5ID0ga2V5c1tpXTtcblx0XHRkZXNjcmlwdG9yID0gdGhpc1trZXldO1xuXHRcdGVuc3VyZS50aGF0KFxuXHRcdFx0XHRkZXNjcmlwdG9yICE9PSB1bmRlZmluZWQsXG5cdFx0XHRcdHRoaXMgKyBcIiBkb2Vzbid0IGhhdmUgYSBwcm9wZXJ0eSBuYW1lZCAnXCIgKyBrZXkgKyBcIicuIERpZCB5b3UgbWlzc3BlbGwgaXQ/XCJcblx0XHQpO1xuXHRcdG9uZURpZmYgPSBkZXNjcmlwdG9yLmRpZmYoZXhwZWN0ZWRba2V5XSk7XG5cdFx0aWYgKG9uZURpZmYgIT09IFwiXCIpIHJlc3VsdC5wdXNoKG9uZURpZmYpO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdC5qb2luKFwiXFxuXCIpO1xufTtcblxuTWUucHJvdG90eXBlLmdldFJhd1N0eWxlID0gZnVuY3Rpb24gZ2V0UmF3U3R5bGUoc3R5bGVOYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZyBdKTtcblxuXHR2YXIgc3R5bGVzO1xuXHR2YXIgcmVzdWx0O1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbm8gZ2V0Q29tcHV0ZWRTdHlsZSgpXG5cdGlmICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSkge1xuXHRcdHN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuX2RvbUVsZW1lbnQpO1xuXHRcdHJlc3VsdCA9IHN0eWxlcy5nZXRQcm9wZXJ0eVZhbHVlKHN0eWxlTmFtZSk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0c3R5bGVzID0gdGhpcy5fZG9tRWxlbWVudC5jdXJyZW50U3R5bGU7XG5cdFx0cmVzdWx0ID0gc3R5bGVzW2NhbWVsY2FzZShzdHlsZU5hbWUpXTtcblx0fVxuXHRpZiAocmVzdWx0ID09PSBudWxsIHx8IHJlc3VsdCA9PT0gdW5kZWZpbmVkKSByZXN1bHQgPSBcIlwiO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuTWUucHJvdG90eXBlLmdldFJhd1Bvc2l0aW9uID0gZnVuY3Rpb24gZ2V0UmF3UG9zaXRpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBObyBUZXh0UmVjdGFuZ2xlLmhlaWdodCBvciAud2lkdGhcblx0dmFyIHJlY3QgPSB0aGlzLl9kb21FbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRyZXR1cm4ge1xuXHRcdGxlZnQ6IHJlY3QubGVmdCxcblx0XHRyaWdodDogcmVjdC5yaWdodCxcblx0XHR3aWR0aDogcmVjdC53aWR0aCAhPT0gdW5kZWZpbmVkID8gcmVjdC53aWR0aCA6IHJlY3QucmlnaHQgLSByZWN0LmxlZnQsXG5cblx0XHR0b3A6IHJlY3QudG9wLFxuXHRcdGJvdHRvbTogcmVjdC5ib3R0b20sXG5cdFx0aGVpZ2h0OiByZWN0LmhlaWdodCAhPT0gdW5kZWZpbmVkID8gcmVjdC5oZWlnaHQgOiByZWN0LmJvdHRvbSAtIHJlY3QudG9wXG5cdH07XG59O1xuXG5NZS5wcm90b3R5cGUudG9Eb21FbGVtZW50ID0gZnVuY3Rpb24gdG9Eb21FbGVtZW50KCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fZG9tRWxlbWVudDtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gXCInXCIgKyB0aGlzLl9uaWNrbmFtZSArIFwiJ1wiO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE1lIF0pO1xuXHRyZXR1cm4gdGhpcy5fZG9tRWxlbWVudCA9PT0gdGhhdC5fZG9tRWxlbWVudDtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBGcmFtZSA9IHJlcXVpcmUoXCIuL2ZyYW1lLmpzXCIpO1xuXG5leHBvcnRzLmNyZWF0ZUZyYW1lID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCwgb3B0aW9ucywgY2FsbGJhY2spIHtcblx0cmV0dXJuIEZyYW1lLmNyZWF0ZShkb2N1bWVudC5ib2R5LCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zLCBjYWxsYmFjayk7XG59O1xuXG5leHBvcnRzLmJyb3dzZXIgPSB7fTtcblxuZXhwb3J0cy5icm93c2VyLmNhblNjcm9sbCA9IGZ1bmN0aW9uIGNhblNjcm9sbCgpIHtcblx0Ly8gSXQgd291bGQgYmUgbmljZSBpZiB0aGlzIHVzZWQgZmVhdHVyZSBkZXRlY3Rpb24gcmF0aGVyIHRoYW4gYnJvd3NlciBkZXRlY3Rpb25cblx0cmV0dXJuICghaXNNb2JpbGVTYWZhcmkoKSk7XG59O1xuXG5mdW5jdGlvbiBpc01vYmlsZVNhZmFyaSgpIHtcblx0cmV0dXJuIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goLyhpUGFkfGlQaG9uZXxpUG9kIHRvdWNoKTsvaSk7XG59XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMtMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gU2VlIExJQ0VOU0UuVFhUIGZvciBkZXRhaWxzLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIFJ1bnRpbWUgYXNzZXJ0aW9ucyBmb3IgcHJvZHVjdGlvbiBjb2RlLiAoQ29udHJhc3QgdG8gYXNzZXJ0LmpzLCB3aGljaCBpcyBmb3IgdGVzdCBjb2RlLilcblxudmFyIHNoaW0gPSByZXF1aXJlKFwiLi9zaGltLmpzXCIpO1xudmFyIG9vcCA9IHJlcXVpcmUoXCIuL29vcC5qc1wiKTtcblxuZXhwb3J0cy50aGF0ID0gZnVuY3Rpb24odmFyaWFibGUsIG1lc3NhZ2UpIHtcblx0aWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCkgbWVzc2FnZSA9IFwiRXhwZWN0ZWQgY29uZGl0aW9uIHRvIGJlIHRydWVcIjtcblxuXHRpZiAodmFyaWFibGUgPT09IGZhbHNlKSB0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudGhhdCwgbWVzc2FnZSk7XG5cdGlmICh2YXJpYWJsZSAhPT0gdHJ1ZSkgdGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihleHBvcnRzLnRoYXQsIFwiRXhwZWN0ZWQgY29uZGl0aW9uIHRvIGJlIHRydWUgb3IgZmFsc2VcIik7XG59O1xuXG5leHBvcnRzLnVucmVhY2hhYmxlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRpZiAoIW1lc3NhZ2UpIG1lc3NhZ2UgPSBcIlVucmVhY2hhYmxlIGNvZGUgZXhlY3V0ZWRcIjtcblxuXHR0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudW5yZWFjaGFibGUsIG1lc3NhZ2UpO1xufTtcblxuZXhwb3J0cy5zaWduYXR1cmUgPSBmdW5jdGlvbihhcmdzLCBzaWduYXR1cmUsIG1lc3NhZ2VzKSB7XG5cdHNpZ25hdHVyZSA9IHNpZ25hdHVyZSB8fCBbXTtcblx0bWVzc2FnZXMgPSBtZXNzYWdlcyB8fCBbXTtcblx0dmFyIGV4cGVjdGVkQXJnQ291bnQgPSBzaWduYXR1cmUubGVuZ3RoO1xuXHR2YXIgYWN0dWFsQXJnQ291bnQgPSBhcmdzLmxlbmd0aDtcblxuXHRpZiAoYWN0dWFsQXJnQ291bnQgPiBleHBlY3RlZEFyZ0NvdW50KSB7XG5cdFx0dGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihcblx0XHRcdGV4cG9ydHMuc2lnbmF0dXJlLFxuXHRcdFx0XCJGdW5jdGlvbiBjYWxsZWQgd2l0aCB0b28gbWFueSBhcmd1bWVudHM6IGV4cGVjdGVkIFwiICsgZXhwZWN0ZWRBcmdDb3VudCArIFwiIGJ1dCBnb3QgXCIgKyBhY3R1YWxBcmdDb3VudFxuXHRcdCk7XG5cdH1cblxuXHR2YXIgdHlwZSwgYXJnLCBuYW1lO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNpZ25hdHVyZS5sZW5ndGg7IGkrKykge1xuXHRcdHR5cGUgPSBzaWduYXR1cmVbaV07XG5cdFx0YXJnID0gYXJnc1tpXTtcblx0XHRuYW1lID0gXCJBcmd1bWVudCBcIiArIGk7XG5cblx0XHRpZiAoIXNoaW0uQXJyYXkuaXNBcnJheSh0eXBlKSkgdHlwZSA9IFsgdHlwZSBdO1xuXHRcdGlmICghdHlwZU1hdGNoZXModHlwZSwgYXJnLCBuYW1lKSkge1xuXHRcdFx0dmFyIG1lc3NhZ2UgPSBuYW1lICsgXCIgZXhwZWN0ZWQgXCIgKyBleHBsYWluVHlwZSh0eXBlKSArIFwiLCBidXQgd2FzIFwiO1xuXHRcdFx0dGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihleHBvcnRzLnNpZ25hdHVyZSwgbWVzc2FnZSArIGV4cGxhaW5BcmcoYXJnKSk7XG5cdFx0fVxuXHR9XG59O1xuXG5mdW5jdGlvbiB0eXBlTWF0Y2hlcyh0eXBlLCBhcmcpIHtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKG9uZVR5cGVNYXRjaGVzKHR5cGVbaV0sIGFyZykpIHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcblxuXHRmdW5jdGlvbiBvbmVUeXBlTWF0Y2hlcyh0eXBlLCBhcmcpIHtcblx0XHRzd2l0Y2ggKGdldFR5cGUoYXJnKSkge1xuXHRcdFx0Y2FzZSBcImJvb2xlYW5cIjogcmV0dXJuIHR5cGUgPT09IEJvb2xlYW47XG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHJldHVybiB0eXBlID09PSBTdHJpbmc7XG5cdFx0XHRjYXNlIFwibnVtYmVyXCI6IHJldHVybiB0eXBlID09PSBOdW1iZXI7XG5cdFx0XHRjYXNlIFwiYXJyYXlcIjogcmV0dXJuIHR5cGUgPT09IEFycmF5O1xuXHRcdFx0Y2FzZSBcImZ1bmN0aW9uXCI6IHJldHVybiB0eXBlID09PSBGdW5jdGlvbjtcblx0XHRcdGNhc2UgXCJvYmplY3RcIjogcmV0dXJuIHR5cGUgPT09IE9iamVjdCB8fCBhcmcgaW5zdGFuY2VvZiB0eXBlO1xuXHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOiByZXR1cm4gdHlwZSA9PT0gdW5kZWZpbmVkO1xuXHRcdFx0Y2FzZSBcIm51bGxcIjogcmV0dXJuIHR5cGUgPT09IG51bGw7XG5cdFx0XHRjYXNlIFwiTmFOXCI6IHJldHVybiBpc05hTih0eXBlKTtcblxuXHRcdFx0ZGVmYXVsdDogZXhwb3J0cy51bnJlYWNoYWJsZSgpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBleHBsYWluVHlwZSh0eXBlKSB7XG5cdHZhciBqb2luZXIgPSBcIlwiO1xuXHR2YXIgcmVzdWx0ID0gXCJcIjtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG5cdFx0cmVzdWx0ICs9IGpvaW5lciArIGV4cGxhaW5PbmVUeXBlKHR5cGVbaV0pO1xuXHRcdGpvaW5lciA9IChpID09PSB0eXBlLmxlbmd0aCAtIDIpID8gXCIsIG9yIFwiIDogXCIsIFwiO1xuXHR9XG5cdHJldHVybiByZXN1bHQ7XG5cblx0ZnVuY3Rpb24gZXhwbGFpbk9uZVR5cGUodHlwZSkge1xuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSBCb29sZWFuOiByZXR1cm4gXCJib29sZWFuXCI7XG5cdFx0XHRjYXNlIFN0cmluZzogcmV0dXJuIFwic3RyaW5nXCI7XG5cdFx0XHRjYXNlIE51bWJlcjogcmV0dXJuIFwibnVtYmVyXCI7XG5cdFx0XHRjYXNlIEFycmF5OiByZXR1cm4gXCJhcnJheVwiO1xuXHRcdFx0Y2FzZSBGdW5jdGlvbjogcmV0dXJuIFwiZnVuY3Rpb25cIjtcblx0XHRcdGNhc2UgbnVsbDogcmV0dXJuIFwibnVsbFwiO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcIm51bWJlclwiICYmIGlzTmFOKHR5cGUpKSByZXR1cm4gXCJOYU5cIjtcblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9vcC5jbGFzc05hbWUodHlwZSkgKyBcIiBpbnN0YW5jZVwiO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGV4cGxhaW5BcmcoYXJnKSB7XG5cdHZhciB0eXBlID0gZ2V0VHlwZShhcmcpO1xuXHRpZiAodHlwZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIHR5cGU7XG5cblx0cmV0dXJuIG9vcC5pbnN0YW5jZU5hbWUoYXJnKSArIFwiIGluc3RhbmNlXCI7XG59XG5cbmZ1bmN0aW9uIGdldFR5cGUodmFyaWFibGUpIHtcblx0dmFyIHR5cGUgPSB0eXBlb2YgdmFyaWFibGU7XG5cdGlmICh2YXJpYWJsZSA9PT0gbnVsbCkgdHlwZSA9IFwibnVsbFwiO1xuXHRpZiAoc2hpbS5BcnJheS5pc0FycmF5KHZhcmlhYmxlKSkgdHlwZSA9IFwiYXJyYXlcIjtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIgJiYgaXNOYU4odmFyaWFibGUpKSB0eXBlID0gXCJOYU5cIjtcblx0cmV0dXJuIHR5cGU7XG59XG5cblxuLyoqKioqL1xuXG52YXIgRW5zdXJlRXhjZXB0aW9uID0gZXhwb3J0cy5FbnN1cmVFeGNlcHRpb24gPSBmdW5jdGlvbihmblRvUmVtb3ZlRnJvbVN0YWNrVHJhY2UsIG1lc3NhZ2UpIHtcblx0aWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBmblRvUmVtb3ZlRnJvbVN0YWNrVHJhY2UpO1xuXHRlbHNlIHRoaXMuc3RhY2sgPSAobmV3IEVycm9yKCkpLnN0YWNrO1xuXHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufTtcbkVuc3VyZUV4Y2VwdGlvbi5wcm90b3R5cGUgPSBzaGltLk9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcbkVuc3VyZUV4Y2VwdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbnN1cmVFeGNlcHRpb247XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlLm5hbWUgPSBcIkVuc3VyZUV4Y2VwdGlvblwiO1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG4vLyBjYW4ndCB1c2UgZW5zdXJlLmpzIGR1ZSB0byBjaXJjdWxhciBkZXBlbmRlbmN5XG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3NoaW0uanNcIik7XG5cbmV4cG9ydHMuY2xhc3NOYW1lID0gZnVuY3Rpb24oY29uc3RydWN0b3IpIHtcblx0aWYgKHR5cGVvZiBjb25zdHJ1Y3RvciAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYSBjb25zdHJ1Y3RvclwiKTtcblx0cmV0dXJuIHNoaW0uRnVuY3Rpb24ubmFtZShjb25zdHJ1Y3Rvcik7XG59O1xuXG5leHBvcnRzLmluc3RhbmNlTmFtZSA9IGZ1bmN0aW9uKG9iaikge1xuXHR2YXIgcHJvdG90eXBlID0gc2hpbS5PYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcblx0aWYgKHByb3RvdHlwZSA9PT0gbnVsbCkgcmV0dXJuIFwiPG5vIHByb3RvdHlwZT5cIjtcblxuXHR2YXIgY29uc3RydWN0b3IgPSBwcm90b3R5cGUuY29uc3RydWN0b3I7XG5cdGlmIChjb25zdHJ1Y3RvciA9PT0gdW5kZWZpbmVkIHx8IGNvbnN0cnVjdG9yID09PSBudWxsKSByZXR1cm4gXCI8YW5vbj5cIjtcblxuXHRyZXR1cm4gc2hpbS5GdW5jdGlvbi5uYW1lKGNvbnN0cnVjdG9yKTtcbn07XG5cbmV4cG9ydHMuZXh0ZW5kRm4gPSBmdW5jdGlvbiBleHRlbmRGbihwYXJlbnRDb25zdHJ1Y3Rvcikge1xuXHRyZXR1cm4gZnVuY3Rpb24oY2hpbGRDb25zdHJ1Y3Rvcikge1xuXHRcdGNoaWxkQ29uc3RydWN0b3IucHJvdG90eXBlID0gc2hpbS5PYmplY3QuY3JlYXRlKHBhcmVudENvbnN0cnVjdG9yLnByb3RvdHlwZSk7XG5cdFx0Y2hpbGRDb25zdHJ1Y3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjaGlsZENvbnN0cnVjdG9yO1xuXHR9O1xufTtcblxuZXhwb3J0cy5tYWtlQWJzdHJhY3QgPSBmdW5jdGlvbiBtYWtlQWJzdHJhY3QoY29uc3RydWN0b3IsIG1ldGhvZHMpIHtcblx0dmFyIG5hbWUgPSBzaGltLkZ1bmN0aW9uLm5hbWUoY29uc3RydWN0b3IpO1xuXHRzaGltLkFycmF5LmZvckVhY2gobWV0aG9kcywgZnVuY3Rpb24obWV0aG9kKSB7XG5cdFx0Y29uc3RydWN0b3IucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihuYW1lICsgXCIgc3ViY2xhc3NlcyBtdXN0IGltcGxlbWVudCBcIiArIG1ldGhvZCArIFwiKCkgbWV0aG9kXCIpO1xuXHRcdH07XG5cdH0pO1xuXG5cdGNvbnN0cnVjdG9yLnByb3RvdHlwZS5jaGVja0Fic3RyYWN0TWV0aG9kcyA9IGZ1bmN0aW9uIGNoZWNrQWJzdHJhY3RNZXRob2RzKCkge1xuXHRcdHZhciB1bmltcGxlbWVudGVkID0gW107XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHNoaW0uQXJyYXkuZm9yRWFjaChtZXRob2RzLCBmdW5jdGlvbihuYW1lKSB7XG5cdFx0XHRpZiAoc2VsZltuYW1lXSA9PT0gY29uc3RydWN0b3IucHJvdG90eXBlW25hbWVdKSB1bmltcGxlbWVudGVkLnB1c2gobmFtZSArIFwiKClcIik7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHVuaW1wbGVtZW50ZWQ7XG5cdH07XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5BcnJheSA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIEFycmF5LmlzQXJyYXlcblx0aXNBcnJheTogZnVuY3Rpb24gaXNBcnJheSh0aGluZykge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KSByZXR1cm4gQXJyYXkuaXNBcnJheSh0aGluZyk7XG5cblx0XHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRoaW5nKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcblx0fSxcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIEFycmF5LmZvckVhY2hcblx0Zm9yRWFjaDogZnVuY3Rpb24gZm9yRWFjaChvYmosIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG5cdFx0Lypqc2hpbnQgYml0d2lzZTpmYWxzZSwgZXFlcWVxOmZhbHNlLCAtVzA0MTpmYWxzZSAqL1xuXG5cdFx0aWYgKEFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSByZXR1cm4gb2JqLmZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpO1xuXG5cdFx0Ly8gVGhpcyB3b3JrYXJvdW5kIGJhc2VkIG9uIHBvbHlmaWxsIGNvZGUgZnJvbSBNRE46XG5cdFx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZm9yRWFjaFxuXG5cdFx0Ly8gUHJvZHVjdGlvbiBzdGVwcyBvZiBFQ01BLTI2MiwgRWRpdGlvbiA1LCAxNS40LjQuMThcblx0XHQvLyBSZWZlcmVuY2U6IGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuNC40LjE4XG5cbiAgICB2YXIgVCwgaztcblxuICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignIHRoaXMgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xuICAgIH1cblxuICAgIC8vIDEuIExldCBPIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyBUb09iamVjdCBwYXNzaW5nIHRoZSB8dGhpc3wgdmFsdWUgYXMgdGhlIGFyZ3VtZW50LlxuICAgIHZhciBPID0gT2JqZWN0KG9iaik7XG5cbiAgICAvLyAyLiBMZXQgbGVuVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXQgaW50ZXJuYWwgbWV0aG9kIG9mIE8gd2l0aCB0aGUgYXJndW1lbnQgXCJsZW5ndGhcIi5cbiAgICAvLyAzLiBMZXQgbGVuIGJlIFRvVWludDMyKGxlblZhbHVlKS5cbiAgICB2YXIgbGVuID0gTy5sZW5ndGggPj4+IDA7XG5cbiAgICAvLyA0LiBJZiBJc0NhbGxhYmxlKGNhbGxiYWNrKSBpcyBmYWxzZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgIC8vIFNlZTogaHR0cDovL2VzNS5naXRodWIuY29tLyN4OS4xMVxuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihjYWxsYmFjayArICcgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgICB9XG5cbiAgICAvLyA1LiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVCBiZSB1bmRlZmluZWQuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICBUID0gdGhpc0FyZztcbiAgICB9XG5cbiAgICAvLyA2LiBMZXQgayBiZSAwXG4gICAgayA9IDA7XG5cbiAgICAvLyA3LiBSZXBlYXQsIHdoaWxlIGsgPCBsZW5cbiAgICB3aGlsZSAoayA8IGxlbikge1xuXG4gICAgICB2YXIga1ZhbHVlO1xuXG4gICAgICAvLyBhLiBMZXQgUGsgYmUgVG9TdHJpbmcoaykuXG4gICAgICAvLyAgIFRoaXMgaXMgaW1wbGljaXQgZm9yIExIUyBvcGVyYW5kcyBvZiB0aGUgaW4gb3BlcmF0b3JcbiAgICAgIC8vIGIuIExldCBrUHJlc2VudCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEhhc1Byb3BlcnR5IGludGVybmFsIG1ldGhvZCBvZiBPIHdpdGggYXJndW1lbnQgUGsuXG4gICAgICAvLyAgIFRoaXMgc3RlcCBjYW4gYmUgY29tYmluZWQgd2l0aCBjXG4gICAgICAvLyBjLiBJZiBrUHJlc2VudCBpcyB0cnVlLCB0aGVuXG4gICAgICBpZiAoayBpbiBPKSB7XG5cbiAgICAgICAgLy8gaS4gTGV0IGtWYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldCBpbnRlcm5hbCBtZXRob2Qgb2YgTyB3aXRoIGFyZ3VtZW50IFBrLlxuICAgICAgICBrVmFsdWUgPSBPW2tdO1xuXG4gICAgICAgIC8vIGlpLiBDYWxsIHRoZSBDYWxsIGludGVybmFsIG1ldGhvZCBvZiBjYWxsYmFjayB3aXRoIFQgYXMgdGhlIHRoaXMgdmFsdWUgYW5kXG4gICAgICAgIC8vIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZyBrVmFsdWUsIGssIGFuZCBPLlxuICAgICAgICBjYWxsYmFjay5jYWxsKFQsIGtWYWx1ZSwgaywgTyk7XG4gICAgICB9XG4gICAgICAvLyBkLiBJbmNyZWFzZSBrIGJ5IDEuXG4gICAgICBrKys7XG4gICAgfVxuICAgIC8vIDguIHJldHVybiB1bmRlZmluZWRcblx0fVxuXG59O1xuXG5cbmV4cG9ydHMuRXZlbnRUYXJnZXQgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRTg6IG5vIEV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoKVxuXHRhZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQsIGV2ZW50LCBjYWxsYmFjaykge1xuXHRcdGlmIChlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHJldHVybiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrKTtcblxuXHRcdGVsZW1lbnQuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnQsIGNhbGxiYWNrKTtcblx0fVxuXG59O1xuXG5cbmV4cG9ydHMuRG9jdW1lbnQgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRTg6IG5vIGRvY3VtZW50LmhlYWRcblx0aGVhZDogZnVuY3Rpb24gaGVhZChkb2MpIHtcblx0XHRpZiAoZG9jLmhlYWQpIHJldHVybiBkb2MuaGVhZDtcblxuXHRcdHJldHVybiBkb2MucXVlcnlTZWxlY3RvcihcImhlYWRcIik7XG5cdH1cblxufTtcblxuXG5leHBvcnRzLkZ1bmN0aW9uID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgOCwgSUUgOSwgSUUgMTAsIElFIDExOiBubyBmdW5jdGlvbi5uYW1lXG5cdG5hbWU6IGZ1bmN0aW9uIG5hbWUoZm4pIHtcblx0XHRpZiAoZm4ubmFtZSkgcmV0dXJuIGZuLm5hbWU7XG5cblx0XHQvLyBCYXNlZCBvbiBjb2RlIGJ5IEphc29uIEJ1bnRpbmcgZXQgYWwsIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMzMjQyOVxuXHRcdHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKyguezEsfSlcXHMqXFwoLztcblx0XHR2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XG5cdFx0cmV0dXJuIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMSkgPyByZXN1bHRzWzFdIDogXCI8YW5vbj5cIjtcblx0fSxcblxufTtcblxuXG5leHBvcnRzLk9iamVjdCA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIE9iamVjdC5jcmVhdGUoKVxuXHRjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZShwcm90b3R5cGUpIHtcblx0XHRpZiAoT2JqZWN0LmNyZWF0ZSkgcmV0dXJuIE9iamVjdC5jcmVhdGUocHJvdG90eXBlKTtcblxuXHRcdHZhciBUZW1wID0gZnVuY3Rpb24gVGVtcCgpIHt9O1xuXHRcdFRlbXAucHJvdG90eXBlID0gcHJvdG90eXBlO1xuXHRcdHJldHVybiBuZXcgVGVtcCgpO1xuXHR9LFxuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbm8gT2JqZWN0LmdldFByb3RvdHlwZU9mXG5cdC8vIENhdXRpb246IERvZXNuJ3Qgd29yayBvbiBJRSA4IGlmIGNvbnN0cnVjdG9yIGhhcyBiZWVuIGNoYW5nZWQsIGFzIGlzIHRoZSBjYXNlIHdpdGggYSBzdWJjbGFzcy5cblx0Z2V0UHJvdG90eXBlT2Y6IGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKG9iaikge1xuXHRcdGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcblxuXHRcdHZhciByZXN1bHQgPSBvYmouY29uc3RydWN0b3IgPyBvYmouY29uc3RydWN0b3IucHJvdG90eXBlIDogbnVsbDtcblx0XHRyZXR1cm4gcmVzdWx0IHx8IG51bGw7XG5cdH0sXG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBObyBPYmplY3Qua2V5c1xuXHRrZXlzOiBmdW5jdGlvbiBrZXlzKG9iaikge1xuXHRcdGlmIChPYmplY3Qua2V5cykgcmV0dXJuIE9iamVjdC5rZXlzKG9iaik7XG5cblx0XHQvLyBGcm9tIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9rZXlzXG5cdCAgdmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcblx0ICAgICAgaGFzRG9udEVudW1CdWcgPSAhKHsgdG9TdHJpbmc6IG51bGwgfSkucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyksXG5cdCAgICAgIGRvbnRFbnVtcyA9IFtcblx0ICAgICAgICAndG9TdHJpbmcnLFxuXHQgICAgICAgICd0b0xvY2FsZVN0cmluZycsXG5cdCAgICAgICAgJ3ZhbHVlT2YnLFxuXHQgICAgICAgICdoYXNPd25Qcm9wZXJ0eScsXG5cdCAgICAgICAgJ2lzUHJvdG90eXBlT2YnLFxuXHQgICAgICAgICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsXG5cdCAgICAgICAgJ2NvbnN0cnVjdG9yJ1xuXHQgICAgICBdLFxuXHQgICAgICBkb250RW51bXNMZW5ndGggPSBkb250RW51bXMubGVuZ3RoO1xuXG5cdCAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnICYmICh0eXBlb2Ygb2JqICE9PSAnZnVuY3Rpb24nIHx8IG9iaiA9PT0gbnVsbCkpIHtcblx0ICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5rZXlzIGNhbGxlZCBvbiBub24tb2JqZWN0Jyk7XG5cdCAgfVxuXG5cdCAgdmFyIHJlc3VsdCA9IFtdLCBwcm9wLCBpO1xuXG5cdCAgZm9yIChwcm9wIGluIG9iaikge1xuXHQgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkge1xuXHQgICAgICByZXN1bHQucHVzaChwcm9wKTtcblx0ICAgIH1cblx0ICB9XG5cblx0ICBpZiAoaGFzRG9udEVudW1CdWcpIHtcblx0ICAgIGZvciAoaSA9IDA7IGkgPCBkb250RW51bXNMZW5ndGg7IGkrKykge1xuXHQgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGRvbnRFbnVtc1tpXSkpIHtcblx0ICAgICAgICByZXN1bHQucHVzaChkb250RW51bXNbaV0pO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfVxuXHQgIHJldHVybiByZXN1bHQ7XG5cdH1cblxufTtcblxuXG5leHBvcnRzLldpbmRvdyA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IE5vIFdpbmRvdy5wYWdlWE9mZnNldFxuXHRwYWdlWE9mZnNldDogZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCkge1xuXHRcdGlmICh3aW5kb3cucGFnZVhPZmZzZXQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHdpbmRvdy5wYWdlWE9mZnNldDtcblxuXHRcdC8vIEJhc2VkIG9uIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XaW5kb3cuc2Nyb2xsWVxuXHRcdHZhciBpc0NTUzFDb21wYXQgPSAoKGRvY3VtZW50LmNvbXBhdE1vZGUgfHwgXCJcIikgPT09IFwiQ1NTMUNvbXBhdFwiKTtcblx0XHRyZXR1cm4gaXNDU1MxQ29tcGF0ID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgOiBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQ7XG5cdH0sXG5cblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IE5vIFdpbmRvdy5wYWdlWU9mZnNldFxuXHRwYWdlWU9mZnNldDogZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCkge1xuXHRcdGlmICh3aW5kb3cucGFnZVlPZmZzZXQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHdpbmRvdy5wYWdlWU9mZnNldDtcblxuXHRcdC8vIEJhc2VkIG9uIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XaW5kb3cuc2Nyb2xsWVxuXHRcdHZhciBpc0NTUzFDb21wYXQgPSAoKGRvY3VtZW50LmNvbXBhdE1vZGUgfHwgXCJcIikgPT09IFwiQ1NTMUNvbXBhdFwiKTtcblx0XHRyZXR1cm4gaXNDU1MxQ29tcGF0ID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA6IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuXHR9XG5cbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4vdmFsdWUuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUGl4ZWxzKGFtb3VudCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBOdW1iZXIgXSk7XG5cdHRoaXMuX2Ftb3VudCA9IGFtb3VudDtcbn07XG5WYWx1ZS5leHRlbmQoTWUpO1xuXG5NZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoYW1vdW50KSB7XG5cdHJldHVybiBuZXcgTWUoYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb21wYXRpYmlsaXR5ID0gZnVuY3Rpb24gY29tcGF0aWJpbGl0eSgpIHtcblx0cmV0dXJuIFsgTWUgXTtcbn07XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBwbHVzKG9wZXJhbmQpIHtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9hbW91bnQgKyBvcGVyYW5kLl9hbW91bnQpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5taW51cyA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gbWludXMob3BlcmFuZCkge1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX2Ftb3VudCAtIG9wZXJhbmQuX2Ftb3VudCk7XG59KTtcblxuTWUucHJvdG90eXBlLnRpbWVzID0gZnVuY3Rpb24gdGltZXMob3BlcmFuZCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBOdW1iZXIgXSk7XG5cblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9hbW91bnQgKiBvcGVyYW5kKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb21wYXJlID0gVmFsdWUuc2FmZShmdW5jdGlvbiBjb21wYXJlKG9wZXJhbmQpIHtcblx0cmV0dXJuIHRoaXMuX2Ftb3VudCAtIG9wZXJhbmQuX2Ftb3VudDtcbn0pO1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHRpZiAodGhpcy5fYW1vdW50ID09PSBleHBlY3RlZC5fYW1vdW50KSByZXR1cm4gXCJcIjtcblx0cmV0dXJuIE1hdGguYWJzKHRoaXMuX2Ftb3VudCAtIGV4cGVjdGVkLl9hbW91bnQpICsgXCJweFwiO1xufSk7XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fYW1vdW50ICsgXCJweFwiO1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuL3ZhbHVlLmpzXCIpO1xudmFyIFBpeGVscyA9IHJlcXVpcmUoXCIuL3BpeGVscy5qc1wiKTtcbnZhciBTaXplID0gcmVxdWlyZShcIi4vc2l6ZS5qc1wiKTtcblxudmFyIFhfRElNRU5TSU9OID0gXCJ4XCI7XG52YXIgWV9ESU1FTlNJT04gPSBcInlcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBQb3NpdGlvbihkaW1lbnNpb24sIHZhbHVlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZywgW051bWJlciwgUGl4ZWxzXSBdKTtcblxuXHR0aGlzLl9kaW1lbnNpb24gPSBkaW1lbnNpb247XG5cdHRoaXMuX3ZhbHVlID0gKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikgPyBQaXhlbHMuY3JlYXRlKHZhbHVlKSA6IHZhbHVlO1xufTtcblZhbHVlLmV4dGVuZChNZSk7XG5cbk1lLnggPSBmdW5jdGlvbiB4KHZhbHVlKSB7XG5cdHJldHVybiBuZXcgTWUoWF9ESU1FTlNJT04sIHZhbHVlKTtcbn07XG5cbk1lLnkgPSBmdW5jdGlvbiB5KHZhbHVlKSB7XG5cdHJldHVybiBuZXcgTWUoWV9ESU1FTlNJT04sIHZhbHVlKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb21wYXRpYmlsaXR5ID0gZnVuY3Rpb24gY29tcGF0aWJpbGl0eSgpIHtcblx0cmV0dXJuIFsgTWUsIFNpemUgXTtcbn07XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBwbHVzKG9wZXJhbmQpIHtcblx0ZW5zdXJlQ29tcGFyYWJsZSh0aGlzLCBvcGVyYW5kKTtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9kaW1lbnNpb24sIHRoaXMuX3ZhbHVlLnBsdXMob3BlcmFuZC50b1BpeGVscygpKSk7XG59KTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBtaW51cyhvcGVyYW5kKSB7XG5cdGlmIChvcGVyYW5kIGluc3RhbmNlb2YgTWUpIGVuc3VyZUNvbXBhcmFibGUodGhpcywgb3BlcmFuZCk7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fZGltZW5zaW9uLCB0aGlzLl92YWx1ZS5taW51cyhvcGVyYW5kLnRvUGl4ZWxzKCkpKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHRlbnN1cmVDb21wYXJhYmxlKHRoaXMsIGV4cGVjdGVkKTtcblxuXHR2YXIgYWN0dWFsVmFsdWUgPSB0aGlzLl92YWx1ZTtcblx0dmFyIGV4cGVjdGVkVmFsdWUgPSBleHBlY3RlZC5fdmFsdWU7XG5cdGlmIChhY3R1YWxWYWx1ZS5lcXVhbHMoZXhwZWN0ZWRWYWx1ZSkpIHJldHVybiBcIlwiO1xuXG5cdHZhciBkaXJlY3Rpb247XG5cdHZhciBjb21wYXJpc29uID0gYWN0dWFsVmFsdWUuY29tcGFyZShleHBlY3RlZFZhbHVlKTtcblx0aWYgKHRoaXMuX2RpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIGRpcmVjdGlvbiA9IGNvbXBhcmlzb24gPCAwID8gXCJ0byB0aGUgbGVmdFwiIDogXCJ0byB0aGUgcmlnaHRcIjtcblx0ZWxzZSBkaXJlY3Rpb24gPSBjb21wYXJpc29uIDwgMCA/IFwibG93ZXJcIiA6IFwiaGlnaGVyXCI7XG5cblx0cmV0dXJuIGFjdHVhbFZhbHVlLmRpZmYoZXhwZWN0ZWRWYWx1ZSkgKyBcIiBcIiArIGRpcmVjdGlvbjtcbn0pO1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gdGhpcy5fdmFsdWUudG9TdHJpbmcoKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1BpeGVscyA9IGZ1bmN0aW9uIHRvUGl4ZWxzKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiB0aGlzLl92YWx1ZTtcbn07XG5cbmZ1bmN0aW9uIGVuc3VyZUNvbXBhcmFibGUoc2VsZiwgb3RoZXIpIHtcblx0aWYgKG90aGVyIGluc3RhbmNlb2YgTWUpIHtcblx0XHRlbnN1cmUudGhhdChzZWxmLl9kaW1lbnNpb24gPT09IG90aGVyLl9kaW1lbnNpb24sIFwiQ2FuJ3QgY29tcGFyZSBYIGRpbWVuc2lvbiB0byBZIGRpbWVuc2lvblwiKTtcblx0fVxufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFZhbHVlID0gcmVxdWlyZShcIi4vdmFsdWUuanNcIik7XG52YXIgUGl4ZWxzID0gcmVxdWlyZShcIi4vcGl4ZWxzLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFNpemUodmFsdWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgW051bWJlciwgUGl4ZWxzXSBdKTtcblxuXHR0aGlzLl92YWx1ZSA9ICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpID8gUGl4ZWxzLmNyZWF0ZSh2YWx1ZSkgOiB2YWx1ZTtcbn07XG5WYWx1ZS5leHRlbmQoTWUpO1xuXG5NZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUodmFsdWUpIHtcblx0cmV0dXJuIG5ldyBNZSh2YWx1ZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29tcGF0aWJpbGl0eSA9IGZ1bmN0aW9uIGNvbXBhdGliaWxpdHkoKSB7XG5cdHJldHVybiBbIE1lIF07XG59O1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gcGx1cyhvcGVyYW5kKSB7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fdmFsdWUucGx1cyhvcGVyYW5kLl92YWx1ZSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5taW51cyA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gbWludXMob3BlcmFuZCkge1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX3ZhbHVlLm1pbnVzKG9wZXJhbmQuX3ZhbHVlKSk7XG59KTtcblxuTWUucHJvdG90eXBlLnRpbWVzID0gZnVuY3Rpb24gdGltZXMob3BlcmFuZCkge1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX3ZhbHVlLnRpbWVzKG9wZXJhbmQpKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb21wYXJlID0gVmFsdWUuc2FmZShmdW5jdGlvbiBjb21wYXJlKHRoYXQpIHtcblx0cmV0dXJuIHRoaXMuX3ZhbHVlLmNvbXBhcmUodGhhdC5fdmFsdWUpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gVmFsdWUuc2FmZShmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdHZhciBhY3R1YWxWYWx1ZSA9IHRoaXMuX3ZhbHVlO1xuXHR2YXIgZXhwZWN0ZWRWYWx1ZSA9IGV4cGVjdGVkLl92YWx1ZTtcblxuXHRpZiAoYWN0dWFsVmFsdWUuZXF1YWxzKGV4cGVjdGVkVmFsdWUpKSByZXR1cm4gXCJcIjtcblxuXHR2YXIgZGVzYyA9IGFjdHVhbFZhbHVlLmNvbXBhcmUoZXhwZWN0ZWRWYWx1ZSkgPiAwID8gXCIgbGFyZ2VyXCIgOiBcIiBzbWFsbGVyXCI7XG5cdHJldHVybiBhY3R1YWxWYWx1ZS5kaWZmKGV4cGVjdGVkVmFsdWUpICsgZGVzYztcbn0pO1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX3ZhbHVlLnRvU3RyaW5nKCk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9QaXhlbHMgPSBmdW5jdGlvbiB0b1BpeGVscygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX3ZhbHVlO1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBvb3AgPSByZXF1aXJlKFwiLi4vdXRpbC9vb3AuanNcIik7XG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuLi91dGlsL3NoaW0uanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gVmFsdWUoKSB7fTtcbk1lLmV4dGVuZCA9IG9vcC5leHRlbmRGbihNZSk7XG5vb3AubWFrZUFic3RyYWN0KE1lLCBbXG5cdFwiZGlmZlwiLFxuXHRcInRvU3RyaW5nXCIsXG5cdFwiY29tcGF0aWJpbGl0eVwiXG5dKTtcblxuTWUuc2FmZSA9IGZ1bmN0aW9uIHNhZmUoZm4pIHtcblx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdGVuc3VyZUNvbXBhdGliaWxpdHkodGhpcywgdGhpcy5jb21wYXRpYmlsaXR5KCksIGFyZ3VtZW50cyk7XG5cdFx0cmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdH07XG59O1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5NZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKHRoYXQpIHtcblx0cmV0dXJuIHRoaXMuZGlmZih0aGF0KSA9PT0gXCJcIjtcbn07XG5cbmZ1bmN0aW9uIGVuc3VyZUNvbXBhdGliaWxpdHkoc2VsZiwgY29tcGF0aWJsZSwgYXJncykge1xuXHR2YXIgYXJnO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHsgICAvLyBhcmdzIGlzIG5vdCBhbiBBcnJheSwgY2FuJ3QgdXNlIGZvckVhY2hcblx0XHRhcmcgPSBhcmdzW2ldO1xuXHRcdGNoZWNrT25lQXJnKHNlbGYsIGNvbXBhdGlibGUsIGFyZyk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY2hlY2tPbmVBcmcoc2VsZiwgY29tcGF0aWJsZSwgYXJnKSB7XG5cdHZhciB0eXBlID0gdHlwZW9mIGFyZztcblx0aWYgKGFyZyA9PT0gbnVsbCkgdHlwZSA9IFwibnVsbFwiO1xuXHRpZiAodHlwZSAhPT0gXCJvYmplY3RcIikgdGhyb3dFcnJvcih0eXBlKTtcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBhdGlibGUubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoYXJnIGluc3RhbmNlb2YgY29tcGF0aWJsZVtpXSkgcmV0dXJuO1xuXHR9XG5cdHRocm93RXJyb3Iob29wLmluc3RhbmNlTmFtZShhcmcpKTtcblxuXHRmdW5jdGlvbiB0aHJvd0Vycm9yKHR5cGUpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3Iob29wLmluc3RhbmNlTmFtZShzZWxmKSArIFwiIGlzbid0IGNvbXBhdGlibGUgd2l0aCBcIiArIHR5cGUpO1xuXHR9XG59IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdGlmIChzdHIubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIHN0cjtcblx0fVxuXG5cdHJldHVybiBzdHJcblx0LnJlcGxhY2UoL15bXy5cXC0gXSsvLCAnJylcblx0LnRvTG93ZXJDYXNlKClcblx0LnJlcGxhY2UoL1tfLlxcLSBdKyhcXHd8JCkvZywgZnVuY3Rpb24gKG0sIHAxKSB7XG5cdFx0cmV0dXJuIHAxLnRvVXBwZXJDYXNlKCk7XG5cdH0pO1xufTtcbiJdfQ==

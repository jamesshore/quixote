(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.quixote = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var oop = require("./util/oop.js");
var shim = require("./util/shim.js");

var Me = module.exports = function Assertable() {
	ensure.unreachable("Assertable is abstract and should not be constructed directly.");
};
Me.extend = oop.extendFn(Me);
oop.makeAbstract(Me, []);

Me.prototype.assert = function assert(expected, message) {
	ensure.signature(arguments, [ Object, [undefined, String] ]);
	if (message === undefined) message = "Differences found";

	var diff = this.diff(expected);
	if (diff !== "") throw new Error(message + ":\n" + diff + "\n");
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

},{"./util/ensure.js":26,"./util/oop.js":27,"./util/shim.js":28}],4:[function(require,module,exports){
// Copyright Titanium I.T. LLC.
"use strict";

var ensure = require("./util/ensure.js");
var QFrame = require("./q_frame.js");
var Size = require("./values/size.js");

var FRAME_WIDTH = 1500;
var FRAME_HEIGHT = 200;

var features = null;

exports.enlargesFrameToPageSize = createDetectionMethod("enlargesFrame");
exports.enlargesFonts = createDetectionMethod("enlargesFonts");
exports.misreportsClipAutoProperty = createDetectionMethod("misreportsClipAuto");
exports.misreportsAutoValuesInClipProperty = createDetectionMethod("misreportsClipValues");
exports.roundsOffPixelCalculations = createDetectionMethod("roundsOffPixelCalculations");

exports.detectBrowserFeatures = function(callback) {
	var frame = QFrame.create(document.body, { width: FRAME_WIDTH, height: FRAME_HEIGHT }, function(err) {
		if (err) {
			return callback(new Error("Error while creating Quixote browser feature detection frame: " + err));
		}
		return detectFeatures(frame, function(err) {
			frame.remove();
			return callback(err);
		});
	});
};

function detectFeatures(frame, callback) {
	try {
		features = {};
		features.enlargesFrame = detectFrameEnlargement(frame, FRAME_WIDTH);
		features.misreportsClipAuto = detectReportedClipAuto(frame);
		features.misreportsClipValues = detectReportedClipPropertyValues(frame);
		features.roundsOffPixelCalculations = detectRoundsOffPixelCalculations(frame);

		detectFontEnlargement(frame, FRAME_WIDTH, function(result) {
			features.enlargesFonts = result;
			frame.remove();
			return callback(null);
		});

	}
	catch(err) {
		features = null;
		return callback(new Error("Error during Quixote browser feature detection: " + err));
	}
}

function createDetectionMethod(propertyName) {
	return function() {
		ensure.signature(arguments, []);
		ensure.that(
			features !== null,
			"Must call quixote.createFrame() before using Quixote browser feature detection."
		);

		return features[propertyName];
	};
}

function detectFrameEnlargement(frame, frameWidth) {
	frame.reset();

	frame.add("<div style='width: " + (frameWidth + 200) + "px'>force scrolling</div>");
	return !frame.viewport().width.value().equals(Size.create(frameWidth));
}

function detectReportedClipAuto(frame) {
	frame.reset();

	var element = frame.add("<div style='clip: auto;'></div>");
	var clip = element.getRawStyle("clip");

	return clip !== "auto";
}

function detectReportedClipPropertyValues(frame) {
	frame.reset();

	var element = frame.add("<div style='clip: rect(auto, auto, auto, auto);'></div>");
	var clip = element.getRawStyle("clip");

	// WORKAROUND IE 8: Provides 'clipTop' etc. instead of 'clip' property
	if (clip === "" && element.getRawStyle("clip-top") === "auto") return false;

	return clip !== "rect(auto, auto, auto, auto)" && clip !== "rect(auto auto auto auto)";
}

function detectRoundsOffPixelCalculations(frame) {
	var element = frame.add("<div style='font-size: 15px;'></div>");
	var size = element.calculatePixelValue("0.5em");

	if (size === 7.5) return false;
	if (size === 8) return true;
	ensure.unreachable("Failure in roundsOffPixelValues() detection: expected 7.5 or 8, but got " + size);
}

function detectFontEnlargement(frame, frameWidth, callback) {
	ensure.that(frameWidth >= 1500, "Detector frame width must be larger than screen to detect font enlargement");
	frame.reset();

	// WORKAROUND IE 8: we use a <div> because the <style> tag can't be added by frame.add(). At the time of this
	// writing, I'm not sure if the issue is with frame.add() or if IE just can't programmatically add <style> tags.
	frame.add("<div><style>p { font-size: 15px; }</style></div>");

	var text = frame.add("<p>arbitrary text</p>");
	frame.add("<p>must have two p tags to work</p>");

	// WORKAROUND IE 8: need to force reflow or getting font-size may fail below
	// This seems to occur when IE is running in a slow VirtualBox VM. There is no test for this line.
	frame.forceReflow();

	// WORKAROUND Safari 8.0.0: timeout required because font is enlarged asynchronously
	setTimeout(function() {
		var fontSize = text.getRawStyle("font-size");
		ensure.that(fontSize !== "", "Expected font-size to be a value");

		// WORKAROUND IE 8: ignores <style> tag we added above
		if (fontSize === "12pt") return callback(false);

		return callback(fontSize !== "15px");
	}, 0);
}

},{"./q_frame.js":22,"./util/ensure.js":26,"./values/size.js":32}],5:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var shim = require("./util/shim.js");
var QElement = require("./q_element.js");
var QElementList = require("./q_element_list.js");
var QViewport = require("./q_viewport.js");
var QPage = require("./q_page.js");

var Me = module.exports = function BrowsingContext(contentDocument) {
	ensure.signature(arguments, [Object]);

	this.contentWindow = contentDocument.defaultView || contentDocument.parentWindow;
	this.contentDocument = contentDocument;
};

Me.prototype.body = function body() {
	ensure.signature(arguments, []);

	return new QElement(this.contentDocument.body, "body");
};

Me.prototype.viewport = function viewport() {
	ensure.signature(arguments, []);

	return new QViewport(this);
};

Me.prototype.page = function page() {
	ensure.signature(arguments, []);

	return new QPage(this);
};

Me.prototype.add = function add(html, nickname) {
	ensure.signature(arguments, [String, [undefined, String]]);
	if (nickname === undefined) nickname = html;

	return this.body().add(html, nickname);
};

Me.prototype.get = function get(selector, nickname) {
	ensure.signature(arguments, [String, [undefined, String]]);
	if (nickname === undefined) nickname = selector;

	var nodes = this.contentDocument.querySelectorAll(selector);
	ensure.that(nodes.length === 1, "Expected one element to match '" + selector + "', but found " + nodes.length);
	return new QElement(nodes[0], nickname);
};

Me.prototype.getAll = function getAll(selector, nickname) {
	ensure.signature(arguments, [String, [undefined, String]]);
	if (nickname === undefined) nickname = selector;

	return new QElementList(this.contentDocument.querySelectorAll(selector), nickname);
};

Me.prototype.scroll = function scroll(x, y) {
	ensure.signature(arguments, [Number, Number]);

	this.contentWindow.scroll(x, y);
};

Me.prototype.getRawScrollPosition = function getRawScrollPosition() {
	ensure.signature(arguments, []);

	return {
		x: shim.Window.pageXOffset(this.contentWindow, this.contentDocument),
		y: shim.Window.pageYOffset(this.contentWindow, this.contentDocument)
	};
};

// This method is not tested--don't know how.
Me.prototype.forceReflow = function forceReflow() {
	this.body().toDomElement().offsetTop;
};

Me.prototype.equals = function equals(that) {
	ensure.signature(arguments, [Me]);
	return this.contentWindow === that.contentWindow;
};

},{"./q_element.js":20,"./q_element_list.js":21,"./q_page.js":23,"./q_viewport.js":24,"./util/ensure.js":26,"./util/shim.js":28}],6:[function(require,module,exports){
// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function AbsolutePosition(dimension, value) {
  ensure.signature(arguments, [ String, Number ]);

  this.should = this.createShould();

  switch(dimension) {
		case X_DIMENSION:
			PositionDescriptor.x(this);
			this._value = Position.x(value);
			break;
		case Y_DIMENSION:
			PositionDescriptor.y(this);
			this._value = Position.y(value);
			break;
		default: ensure.unreachable("Unknown dimension: " + dimension);
  }
  this._dimension = dimension;
};
PositionDescriptor.extend(Me);

Me.x = function(value) {
	ensure.signature(arguments, [ Number ]);
  return new Me(X_DIMENSION, value);
};

Me.y = function(value) {
	ensure.signature(arguments, [ Number ]);
	return new Me(Y_DIMENSION, value);
};

Me.prototype.value = function() {
  return this._value;
};

Me.prototype.toString = function() {
  return this._value + " " + this._dimension + "-coordinate";
};

},{"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":14}],7:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");
var RelativePosition = require("./relative_position.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function Center(dimension, position1, position2, description) {
	ensure.signature(arguments, [ String, PositionDescriptor, PositionDescriptor, String ]);

	this.should = this.createShould();
	
	if (dimension === X_DIMENSION) PositionDescriptor.x(this);
	else if (dimension === Y_DIMENSION) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown dimension: " + dimension);

	this._dimension = dimension;
	this._position1 = position1;
	this._position2 = position2;
	this._description = description;
};
PositionDescriptor.extend(Me);

Me.x = factoryFn(X_DIMENSION);
Me.y = factoryFn(Y_DIMENSION);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);
	return this._position1.value().midpoint(this._position2.value());
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._description;
};

function factoryFn(dimension) {
	return function(position1, position2, description) {
		return new Me(dimension, position1, position2, description);
	};
}

},{"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":14,"./relative_position.js":15}],8:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var Value = require("../values/value.js");

var Me = module.exports = function Descriptor() {
	ensure.unreachable("Descriptor is abstract and should not be constructed directly.");
};
Me.extend = oop.extendFn(Me);
oop.makeAbstract(Me, [
	"value",
	"toString"
]);

// WORKAROUND IE 8: Doesn't support Object.defineProperty(), which would allow us to create Me.prototype.should
// directly on this class as an accessor method.
// WORKAROUND IE 11: Doesn't support ES6 'class' syntax, which would allow us to use getter methods and inheritance.
Me.prototype.createShould = function createAssert() {
	var self = this;
	return {

		equal: function(expected, message) {
			self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
				var equals = actualValue.equals(expectedValue);
				if (!equals) {
					throw new Error(
						message + self + " should be " + expectedValue.diff(actualValue) + ".\n" +
						"  Expected: " + expectedDesc + "\n" +
						"  But was:  " + actualValue
					);
				}
			});
		},

		notEqual: function(expected, message) {
			self.doAssertion(expected, message, function(actualValue, expectedValue, expectedDesc, message) {
				if (actualValue.equals(expectedValue)) {
					throw new Error(
						message + self + " shouldn't be " + expectedValue + ".\n" +
						"  Expected: anything but " + expectedDesc + "\n" +
						"  But was:  " + actualValue
					);
				}
			});
		},

	};
};

Me.prototype.doAssertion = function doAssertion(expected, message, assertFn) {
	message = message === undefined ? "" : message + ": ";
	expected = convertExpectationFromPrimitiveIfNeeded(this, expected, message);

	var actualValue;
	var expectedValue;
	try {
		actualValue = this.value();
		expectedValue = expected.value();
	}
	catch (err) {
		throw new Error("Can't compare " + this + " to " + expected + ": " + err.message);
	}

	if (!actualValue.isCompatibleWith(expectedValue)) {
		throwBadExpectation(
			this, oop.instanceName(expected) + " (" + expected + ")", message,
			"Attempted to compare two incompatible types:"
		);
	}

	var expectedDesc = expectedValue.toString();
	if (expected instanceof Me) expectedDesc += " (" + expected + ")";

	assertFn(actualValue, expectedValue, expectedDesc, message);
};


Me.prototype.diff = function diff(expected) {
	// Legacy code, strictly for compatibility with deprecated Assertable.equals() and Assertable.diff() methods.
	// It's weird because we moved to should.equals(), which always throws an exception, but diff returns a string.
	// To avoid duplicating complex logic, we call should.equals() and then unwrap the exception, but only if it's
	// the right kind of exception.
	try {
		this.should.equal(expected);
		return "";
	}
	catch (err) {
		var message = err.message;
		if (message.indexOf("But was:") === -1) throw err;    // it's not an assertion error, it's some other exception
		return message;
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
	// they're used in the same places value objects are used, and then this method gets called.
	return false;
};

function convertExpectationFromPrimitiveIfNeeded(self, expected, message) {
	var expectedType = typeof expected;
	if (expected === null) expectedType = "null";

	if (expectedType === "object" && (expected instanceof Me)) return expected;

	if (expected === undefined) {
		throwBadExpectation(
			self, "undefined", message,
			"The 'expected' parameter is undefined. Did you misspell a property name?"
		);
	}
	else if (expectedType === "object") {
		throwBadExpectation(
			self, oop.instanceName(expected), message,
			"The 'expected' parameter should be a descriptor, but it wasn't recognized."
		);
	}
	else {
		var converted = self.convert(expected, expectedType);
		if (converted !== undefined) return converted;

		throwBadExpectation(
			self, expectedType, message,
			"The 'expected' primitive isn't equivalent to the 'actual' descriptor."
		);
	}

}

function throwBadExpectation(self, expectedType, message, headline) {
	throw new Error(
		message + "Error in test. Use a different 'expected' parameter.\n" +
		headline + "\n" +
		"  'actual' type:   " + oop.instanceName(self) + " (" + self + ")\n" +
		"  'expected' type: " + expectedType
	);
}
},{"../util/ensure.js":26,"../util/oop.js":27,"../values/value.js":33}],9:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Position = require("../values/position.js");
var PositionDescriptor = require("./position_descriptor.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ElementEdge(element, position) {
	var QElement = require("../q_element.js");      // break circular dependency
	ensure.signature(arguments, [QElement, String]);

	this.should = this.createShould();

	if (position === LEFT || position === RIGHT) PositionDescriptor.x(this);
	else if (position === TOP || position === BOTTOM) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown position: " + position);

	this._element = element;
	this._position = position;
};
PositionDescriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var rawPosition = this._element.getRawPosition();
	var edge = rawPosition[this._position];

	var scroll = this._element.context().getRawScrollPosition();
	var rendered = elementRendered(this._element);

	if (this._position === RIGHT || this._position === LEFT) {
		if (!rendered) return Position.noX();
		return Position.x(edge + scroll.x);
	}
	else {
		if (!rendered) return Position.noY();
		return Position.y(edge + scroll.y);
	}
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

function elementRendered(element) {
	var inDom = element.context().body().contains(element);
	var displayNone = element.getRawStyle("display") === "none";

	return inDom && !displayNone;
}

},{"../q_element.js":20,"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":14}],10:[function(require,module,exports){
// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var RenderState = require("../values/render_state.js");
var Position = require("../values/position.js");
var Descriptor = require("./descriptor.js");
var ElementRenderedEdge = require("./element_rendered_edge.js");
var GenericSize = require("./generic_size.js");
var Center = require("./center.js");

var Me = module.exports = function ElementRendered(element) {
	var QElement = require("../q_element.js");      // break circular dependency
	ensure.signature(arguments, [ QElement ]);

	this.should = this.createShould();
	this._element = element;

	// properties
	this.top = ElementRenderedEdge.top(element);
	this.right = ElementRenderedEdge.right(element);
	this.bottom = ElementRenderedEdge.bottom(element);
	this.left = ElementRenderedEdge.left(element);

	this.width = GenericSize.create(this.left, this.right, "rendered width of " + element);
	this.height = GenericSize.create(this.top, this.bottom, "rendered height of " + element);

	this.center = Center.x(this.left, this.right, "rendered center of " + element);
	this.middle = Center.y(this.top, this.bottom, "rendered middle of " + element);
};
Descriptor.extend(Me);

Me.create = function create(element) {
	return new Me(element);
};

Me.prototype.value = function value() {
	if (this.top.value().equals(Position.noY())) return RenderState.notRendered();
	else return RenderState.rendered();
};

Me.prototype.toString = function toString() {
	return this._element.toString();
};

Me.prototype.convert = function convert(arg, type) {
	if (type === "boolean") {
		return arg ? RenderState.rendered() : RenderState.notRendered();
	}
};

},{"../q_element.js":20,"../util/ensure.js":26,"../values/position.js":30,"../values/render_state.js":31,"./center.js":7,"./descriptor.js":8,"./element_rendered_edge.js":11,"./generic_size.js":12}],11:[function(require,module,exports){
// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var quixote = require("../quixote.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");
var QPage = require("../q_page.js");
var Size = require("../values/size.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ElementVisibleEdge(element, position) {
	var QElement = require("../q_element.js");      // break circular dependency
	ensure.signature(arguments, [ QElement, String ]);

	this.should = this.createShould();

	if (position === LEFT || position === RIGHT) PositionDescriptor.x(this);
	else if (position === TOP || position === BOTTOM) PositionDescriptor.y(this);
	else unknownPosition(position);

	this._element = element;
	this._position = position;
};
PositionDescriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

function factoryFn(position) {
	return function factory(element) {
		return new Me(element, position);
	};
}

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._position + " rendered edge of " + this._element;
};

Me.prototype.value = function() {
	var position = this._position;
	var element = this._element;
	var page = element.context().page();

	if (element.top.value().equals(Position.noY())) return notRendered(position);
	if (element.width.value().equals(Size.create(0))) return notRendered(position);
	if (element.height.value().equals(Size.create(0))) return notRendered(position);

	ensure.that(
		!hasClipPathProperty(element),
		"Can't detect element clipping boundaries when 'clip-path' property is used."
	);

	var bounds = {
		top: page.top.value(),
		right: null,
		bottom: null,
		left: page.left.value()
	};

	bounds = intersectionWithOverflow(element, bounds);
	bounds = intersectionWithClip(element, bounds);

	var edges = intersection(
		bounds,
		element.top.value(),
		element.right.value(),
		element.bottom.value(),
		element.left.value()
	);

	if (isClippedOutOfExistence(bounds, edges)) return notRendered(position);
	else return edge(edges, position);
};

function hasClipPathProperty(element) {
	var clipPath = element.getRawStyle("clip-path");
	return clipPath !== "none" && clipPath !== "";
}

function intersectionWithOverflow(element, bounds) {
	for (var container = element.parent(); container !== null; container = container.parent()) {
		if (isClippedByAncestorOverflow(element, container)) {
			bounds = intersection(
				bounds,
				container.top.value(),
				container.right.value(),
				container.bottom.value(),
				container.left.value()
			);
		}
	}

	return bounds;
}

function intersectionWithClip(element, bounds) {
	// WORKAROUND IE 8: Doesn't have any way to detect 'clip: auto' value.
	ensure.that(!quixote.browser.misreportsClipAutoProperty(),
		"Can't determine element clipping values on this browser because it misreports the value of the" +
		" `clip: auto` property. You can use `quixote.browser.misreportsClipAutoProperty()` to skip this browser."
	);

	for ( ; element !== null; element = element.parent()) {
		var clip = element.getRawStyle("clip");
		if (clip === "auto" || !canBeClippedByClipProperty(element)) continue;

		var clipEdges = normalizeClipProperty(element, clip);
		bounds = intersection(
			bounds,
			clipEdges.top,
			clipEdges.right,
			clipEdges.bottom,
			clipEdges.left
		);
	}

	return bounds;
}

function normalizeClipProperty(element, clip) {
	var clipValues = parseClipProperty(element, clip);

	return {
		top: clipValues[0] === "auto" ?
			element.top.value() :
			element.top.value().plus(Position.y(Number(clipValues[0]))),
		right: clipValues[1] === "auto" ?
			element.right.value() :
			element.left.value().plus(Position.x(Number(clipValues[1]))),
		bottom: clipValues[2] === "auto" ?
			element.bottom.value() :
			element.top.value().plus(Position.y(Number(clipValues[2]))),
		left: clipValues[3] === "auto" ?
			element.left.value() :
			element.left.value().plus(Position.x(Number(clipValues[3])))
	};

	function parseClipProperty(element, clip) {
		// WORKAROUND IE 11, Chrome Mobile 44: Reports 0px instead of 'auto' when computing rect() in clip property.
		ensure.that(!quixote.browser.misreportsAutoValuesInClipProperty(),
			"Can't determine element clipping values on this browser because it misreports the value of the `clip`" +
			" property. You can use `quixote.browser.misreportsAutoValuesInClipProperty()` to skip this browser."
		);

		var clipRegex = /rect\((.*?),? (.*?),? (.*?),? (.*?)\)/;
		var matches = clipRegex.exec(clip);
		ensure.that(matches !== null, "Unable to parse clip property: " + clip);

		return [
			parseLength(matches[1], clip),
			parseLength(matches[2], clip),
			parseLength(matches[3], clip),
			parseLength(matches[4], clip)
		];
	}

	function parseLength(pxString, clip) {
		if (pxString === "auto") return pxString;

		var pxRegex = /^(.*?)px$/;
		var matches = pxRegex.exec(pxString);
		ensure.that(matches !== null, "Unable to parse '" + pxString + "' in clip property: " + clip);

		return matches[1];
	}
}

function isClippedByAncestorOverflow(element, ancestor) {
	return canBeClippedByOverflowProperty(element) && hasClippingOverflow(ancestor);
}

function canBeClippedByOverflowProperty(element) {
	var position = element.getRawStyle("position");
	switch (position) {
		case "static":
		case "relative":
		case "absolute":
		case "sticky":
			return true;
		case "fixed":
			return false;
		default:
			ensure.unreachable("Unknown position property: " + position);
	}
}

function hasClippingOverflow(element) {
	return clips("overflow-x") || clips("overflow-y");

	function clips(style) {
		var overflow = element.getRawStyle(style);
		switch (overflow) {
			case "hidden":
			case "scroll":
			case "auto":
				return true;
			case "visible":
				return false;
			default:
				ensure.unreachable("Unknown " + style + " property: " + overflow);
		}
	}
}

function canBeClippedByClipProperty(element) {
	var position = element.getRawStyle("position");
	switch (position) {
		case "absolute":
		case "fixed":
			return true;
		case "static":
		case "relative":
		case "sticky":
			return false;
		default:
			ensure.unreachable("Unknown position property: " + position);
	}
}

function intersection(bounds, top, right, bottom, left) {
	bounds.top = bounds.top.max(top);
	bounds.right = (bounds.right === null) ? right : bounds.right.min(right);
	bounds.bottom = (bounds.bottom === null) ? bottom : bounds.bottom.min(bottom);
	bounds.left = bounds.left.max(left);

	return bounds;
}

function isClippedOutOfExistence(bounds, edges) {
	return (bounds.top.compare(edges.bottom) >= 0) ||
		(bounds.right !== null && bounds.right.compare(edges.left) <= 0) ||
		(bounds.bottom !== null && bounds.bottom.compare(edges.top) <= 0) ||
		(bounds.left.compare(edges.right) >= 0);
}

function notRendered(position) {
	switch(position) {
		case TOP:
		case BOTTOM:
			return Position.noY();
		case LEFT:
		case RIGHT:
			return Position.noX();
		default: unknownPosition(position);
	}
}

function edge(edges, position) {
	switch(position) {
		case TOP: return edges.top;
		case RIGHT: return edges.right;
		case BOTTOM: return edges.bottom;
		case LEFT: return edges.left;
		default: unknownPosition(position);
	}
}

function unknownPosition(position) {
	ensure.unreachable("Unknown position: " + position);
}
},{"../q_element.js":20,"../q_page.js":23,"../quixote.js":25,"../util/ensure.js":26,"../values/position.js":30,"../values/size.js":32,"./position_descriptor.js":14}],12:[function(require,module,exports){
// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var SizeDescriptor = require("./size_descriptor.js");

var Me = module.exports = function GenericSize(from, to, description) {
  ensure.signature(arguments, [ PositionDescriptor, PositionDescriptor, String ]);

  this.should = this.createShould();

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

},{"../util/ensure.js":26,"./position_descriptor.js":14,"./size_descriptor.js":17}],13:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function PageEdge(edge, browsingContext) {
	var BrowsingContext = require("../browsing_context.js");   // break circular dependency
	ensure.signature(arguments, [ String, BrowsingContext ]);

	this.should = this.createShould();

	if (edge === LEFT || edge === RIGHT) PositionDescriptor.x(this);
	else if (edge === TOP || edge === BOTTOM) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown edge: " + edge);

	this._edge = edge;
	this._browsingContext = browsingContext;
};
PositionDescriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.value = function value() {
	ensure.signature(arguments, []);

	var size = pageSize(this._browsingContext.contentDocument);
	switch(this._edge) {
		case TOP: return Position.y(0);
		case RIGHT: return Position.x(size.width);
		case BOTTOM: return Position.y(size.height);
		case LEFT: return Position.x(0);

		default: ensure.unreachable();
	}
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	switch(this._edge) {
		case TOP: return "top of page";
		case RIGHT: return "right side of page";
		case BOTTOM: return "bottom of page";
		case LEFT: return "left side of page";

		default: ensure.unreachable();
	}
};

function factoryFn(edge) {
	return function factory(browsingContext) {
		return new Me(edge, browsingContext);
	};
}


// USEFUL READING: http://www.quirksmode.org/mobile/viewports.html
// and http://www.quirksmode.org/mobile/viewports2.html

// API SEMANTICS.
// Ref https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
//    getBoundingClientRect().width: sum of bounding boxes of element (the displayed width of the element,
//      including padding and border). Fractional. Applies transformations.
//    clientWidth: visible width of element including padding (but not border). EXCEPT on root element (html), where
//      it is the width of the viewport. Rounds to an integer. Doesn't apply transformations.
//    offsetWidth: visible width of element including padding, border, and scrollbars (if any). Rounds to an integer.
//      Doesn't apply transformations.
//    scrollWidth: entire width of element, including any part that's not visible due to scrollbars. Rounds to
//      an integer. Doesn't apply transformations. Not clear if it includes scrollbars, but I think not. Also
//      not clear if it includes borders or padding. (But from tests, apparently not borders. Except on root
//      element and body element, which have special results that vary by browser.)

// TEST RESULTS: WIDTH
//   ✔ = correct answer
//   ✘ = incorrect answer and diverges from spec
//   ~ = incorrect answer, but matches spec
// BROWSERS TESTED: Safari 6.2.0 (Mac OS X 10.8.5); Mobile Safari 7.0.0 (iOS 7.1); Firefox 32.0.0 (Mac OS X 10.8);
//    Firefox 33.0.0 (Windows 7); Chrome 38.0.2125 (Mac OS X 10.8.5); Chrome 38.0.2125 (Windows 7); IE 8, 9, 10, 11

// html width style smaller than viewport width; body width style smaller than html width style
//  NOTE: These tests were conducted when correct result was width of border. That has been changed
//  to "width of viewport."
//    html.getBoundingClientRect().width
//      ✘ IE 8, 9, 10: width of viewport
//      ✔ Safari, Mobile Safari, Chrome, Firefox, IE 11: width of html, including border
//    html.clientWidth
//      ~ Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11: width of viewport
//    html.offsetWidth
//      ✘ IE 8, 9, 10: width of viewport
//      ✔ Safari, Mobile Safari, Chrome, Firefox, IE 11: width of html, including border
//    html.scrollWidth
//      ✘ IE 8, 9, 10, 11, Firefox: width of viewport
//      ~ Safari, Mobile Safari, Chrome: width of html, excluding border
//    body.getBoundingClientRect().width
//      ~ Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11: width of body, including border
//    body.clientWidth
//      ~ Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11: width of body, excluding border
//    body.offsetWidth
//      ~ Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11: width of body, including border
//    body.scrollWidth
//      ✘ Safari, Mobile Safari, Chrome: width of viewport
//      ~ Firefox, IE 8, 9, 10, 11: width of body, excluding border

// element width style wider than viewport; body and html width styles at default
// BROWSER BEHAVIOR: html and body border extend to width of viewport and not beyond (except on Mobile Safari)
// Correct result is element width + body border-left + html border-left (except on Mobile Safari)
// Mobile Safari uses a layout viewport, so it's expected to include body border-right and html border-right.
//    html.getBoundingClientRect().width
//      ✔ Mobile Safari: element width + body border + html border
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: viewport width
//    html.clientWidth
//      ✔ Mobile Safari: element width + body border + html border
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: viewport width
//    html.offsetWidth
//      ✔ Mobile Safari: element width + body border + html border
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: viewport width
//    html.scrollWidth
//      ✔ Mobile Safari: element width + body border + html border
//      ✘ Safari, Chrome: element width + body border-left (BUT NOT html border-left)
//      ✔ Firefox, IE 8, 9, 10, 11: element width + body border-left + html border-left
//    body.getBoundingClientRect().width
//      ~ Mobile Safari: element width + body border
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: viewport width - html border
//    body.clientWidth
//      ~ Mobile Safari: element width
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: viewport width - html border - body border
//    body.offsetWidth
//      ~ Mobile Safari: element width + body border
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: viewport width - html border
//    body.scrollWidth
//      ✔ Mobile Safari: element width + body border + html border
//      ✔ Safari, Chrome: element width + body border-left + html border-left (matches actual browser)
//      ~ Firefox, IE 8, 9, 10, 11: element width

// TEST RESULTS: HEIGHT
//   ✔ = correct answer
//   ✘ = incorrect answer and diverges from spec
//   ~ = incorrect answer, but matches spec

// html height style smaller than viewport height; body height style smaller than html height style
//  NOTE: These tests were conducted when correct result was height of viewport.
//    html.clientHeight
//      ✔ Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11: height of viewport

// element height style taller than viewport; body and html width styles at default
// BROWSER BEHAVIOR: html and body border enclose entire element
// Correct result is element width + body border-top + html border-top + body border-bottom + html border-bottom
//    html.clientHeight
//      ✔ Mobile Safari: element height + all borders
//      ~ Safari, Chrome, Firefox, IE 8, 9, 10, 11: height of viewport
//    html.scrollHeight
//      ✔ Firefox, IE 8, 9, 10, 11: element height + all borders
//      ✘ Safari, Mobile Safari, Chrome: element height + html border-bottom
//    body.scrollHeight
//      ✔ Safari, Mobile Safari, Chrome: element height + all borders
//      ~ Firefox, IE 8, 9, 10, 11: element height (body height - body border)
function pageSize(document) {
	var html = document.documentElement;
	var body = document.body;

// BEST WIDTH ANSWER SO FAR (ASSUMING VIEWPORT IS MINIMUM ANSWER):
	var width = Math.max(body.scrollWidth, html.scrollWidth);

// BEST HEIGHT ANSWER SO FAR (ASSUMING VIEWPORT IS MINIMUM ANSWER):
	var height = Math.max(body.scrollHeight, html.scrollHeight);

	return {
		width: width,
		height: height
	};
}

},{"../browsing_context.js":5,"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":14}],14:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/*eslint new-cap: "off" */
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var Descriptor = require("./descriptor.js");
var Position = require("../values/position.js");

// break circular dependencies
function RelativePosition() {
	return require("./relative_position.js");
}
function AbsolutePosition() {
	return require("./absolute_position.js");
}
function GenericSize() {
	return require("./generic_size.js");
}

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function PositionDescriptor(dimension) {
	ensure.signature(arguments, [ String ]);
	ensure.unreachable("PositionDescriptor is abstract and should not be constructed directly.");
};
Descriptor.extend(Me);
Me.extend = oop.extendFn(Me);

Me.x = factoryFn(X_DIMENSION);
Me.y = factoryFn(Y_DIMENSION);

Me.prototype.plus = function plus(amount) {
	if (this._pdbc.dimension === X_DIMENSION) return RelativePosition().right(this, amount);
	else return RelativePosition().down(this, amount);
};

Me.prototype.minus = function minus(amount) {
	if (this._pdbc.dimension === X_DIMENSION) return RelativePosition().left(this, amount);
	else return RelativePosition().up(this, amount);
};

Me.prototype.to = function to(position) {
	ensure.signature(arguments, [[ Me, Number ]]);
	if (typeof position === "number") {
		if (this._pdbc.dimension === X_DIMENSION) position = AbsolutePosition().x(position);
		else position = AbsolutePosition().y(position);
	}
	if (this._pdbc.dimension !== position._pdbc.dimension) {
		throw new Error("Can only calculate distance between two X coordinates or two Y coordinates");
	}

	return GenericSize().create(this, position, "distance from " + this + " to " + position);
};

Me.prototype.convert = function convert(arg, type) {
	switch (type) {
		case "number": return this._pdbc.dimension === X_DIMENSION ? Position.x(arg) : Position.y(arg);
		case "string":
			if (arg === "none") return this._pdbc.dimension === X_DIMENSION ? Position.noX() : Position.noY();
			else return undefined;
			break;
		default: return undefined;
	}
};

function factoryFn(dimension) {
	return function factory(self) {
		// _pdbc: "PositionDescriptor base class." An attempt to prevent name conflicts.
		self._pdbc = { dimension: dimension };
	};
}

},{"../util/ensure.js":26,"../util/oop.js":27,"../values/position.js":30,"./absolute_position.js":6,"./descriptor.js":8,"./generic_size.js":12,"./relative_position.js":15}],15:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var PositionDescriptor = require("./position_descriptor.js");
var Value = require("../values/value.js");
var Size = require("../values/size.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";
var PLUS = 1;
var MINUS = -1;

var Me = module.exports = function RelativePosition(dimension, direction, relativeTo, relativeAmount) {
	ensure.signature(arguments, [ String, Number, Descriptor, [Number, Descriptor, Value] ]);

	this.should = this.createShould();

	if (dimension === X_DIMENSION) PositionDescriptor.x(this);
	else if (dimension === Y_DIMENSION) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown dimension: " + dimension);

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
PositionDescriptor.extend(Me);

Me.right = createFn(X_DIMENSION, PLUS);
Me.down = createFn(Y_DIMENSION, PLUS);
Me.left = createFn(X_DIMENSION, MINUS);
Me.up = createFn(Y_DIMENSION, MINUS);

function createFn(dimension, direction) {
	return function create(relativeTo, relativeAmount) {
		return new Me(dimension, direction, relativeTo, relativeAmount);
	};
}

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
	if (this._dimension === X_DIMENSION) relation += (this._direction === PLUS) ? " to right of " : " to left of ";
	else relation += (this._direction === PLUS) ? " below " : " above ";

	return relation + base;
};

},{"../util/ensure.js":26,"../values/size.js":32,"../values/value.js":33,"./descriptor.js":8,"./position_descriptor.js":14}],16:[function(require,module,exports){
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

	this.should = this.createShould();

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
},{"../util/ensure.js":26,"../values/size.js":32,"../values/value.js":33,"./descriptor.js":8,"./size_descriptor.js":17,"./size_multiple.js":18}],17:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/*eslint new-cap: "off" */
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
	switch(type) {
		case "number": return Size.create(arg);
		case "string": return arg === "none" ? Size.createNone() : undefined;
		default: return undefined;
	}
};

},{"../util/ensure.js":26,"../util/oop.js":27,"../values/size.js":32,"./descriptor.js":8,"./relative_size.js":16,"./size_multiple.js":18}],18:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Descriptor = require("./descriptor.js");
var SizeDescriptor = require("./size_descriptor.js");
var Size = require("../values/size.js");

var Me = module.exports = function SizeMultiple(relativeTo, multiple) {
	ensure.signature(arguments, [ Descriptor, Number ]);

	this.should = this.createShould();

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
},{"../util/ensure.js":26,"../values/size.js":32,"./descriptor.js":8,"./size_descriptor.js":17}],19:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var PositionDescriptor = require("./position_descriptor.js");
var Position = require("../values/position.js");

var TOP = "top";
var RIGHT = "right";
var BOTTOM = "bottom";
var LEFT = "left";

var Me = module.exports = function ViewportEdge(position, browsingContext) {
	var BrowsingContext = require("../browsing_context.js");   // break circular dependency
	ensure.signature(arguments, [ String, BrowsingContext ]);

	this.should = this.createShould();

	if (position === LEFT || position === RIGHT) PositionDescriptor.x(this);
	else if (position === TOP || position === BOTTOM) PositionDescriptor.y(this);
	else ensure.unreachable("Unknown position: " + position);

	this._position = position;
	this._browsingContext = browsingContext;
};
PositionDescriptor.extend(Me);

Me.top = factoryFn(TOP);
Me.right = factoryFn(RIGHT);
Me.bottom = factoryFn(BOTTOM);
Me.left = factoryFn(LEFT);

Me.prototype.value = function() {
	ensure.signature(arguments, []);

	var scroll = this._browsingContext.getRawScrollPosition();
	var x = Position.x(scroll.x);
	var y = Position.y(scroll.y);

	var size = viewportSize(this._browsingContext.contentDocument.documentElement);

	switch(this._position) {
		case TOP: return y;
		case RIGHT: return x.plus(Position.x(size.width));
		case BOTTOM: return y.plus(Position.y(size.height));
		case LEFT: return x;

		default: ensure.unreachable();
	}
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);
	return this._position + " edge of viewport";
};

function factoryFn(position) {
	return function factory(content) {
		return new Me(position, content);
	};
}



// USEFUL READING: http://www.quirksmode.org/mobile/viewports.html
// and http://www.quirksmode.org/mobile/viewports2.html

// BROWSERS TESTED: Safari 6.2.0 (Mac OS X 10.8.5); Mobile Safari 7.0.0 (iOS 7.1); Firefox 32.0.0 (Mac OS X 10.8);
//    Firefox 33.0.0 (Windows 7); Chrome 38.0.2125 (Mac OS X 10.8.5); Chrome 38.0.2125 (Windows 7); IE 8, 9, 10, 11

// Width techniques I've tried: (Note: results are different in quirks mode)
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
// html.scrollWidth
// html.clientWidth
//    WORKS! Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11

// Height techniques I've tried: (Note that results are different in quirks mode)
// body.clientHeight
// body.offsetHeight
// body.getBoundingClientRect().height
//    fails on all browsers: only includes height of content
// body getComputedStyle("height")
//    fails on all browsers: IE8 returns "auto"; others only include height of content
// body.scrollHeight
//    works on Safari, Mobile Safari, Chrome;
//    fails on Firefox, IE 8, 9, 10, 11: only includes height of content
// html.getBoundingClientRect().height
// html.offsetHeight
//    works on IE 8, 9, 10
//    fails on IE 11, Safari, Mobile Safari, Chrome: only includes height of content
// html.scrollHeight
//    works on Firefox, IE 8, 9, 10, 11
//    fails on Safari, Mobile Safari, Chrome: only includes height of content
// html.clientHeight
//    WORKS! Safari, Mobile Safari, Chrome, Firefox, IE 8, 9, 10, 11
function viewportSize(htmlElement) {
	return {
		width: htmlElement.clientWidth,
		height: htmlElement.clientHeight
	};
}

},{"../browsing_context.js":5,"../util/ensure.js":26,"../values/position.js":30,"./position_descriptor.js":14}],20:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var shim = require("./util/shim.js");
var camelcase = require("../vendor/camelcase-1.0.1-modified.js");
var ElementRendered = require("./descriptors/element_rendered.js");
var ElementEdge = require("./descriptors/element_edge.js");
var Center = require("./descriptors/center.js");
var GenericSize = require("./descriptors/generic_size.js");
var Assertable = require("./assertable.js");

var Me = module.exports = function QElement(domElement, nickname) {
	ensure.signature(arguments, [Object, [String, undefined]]);
	if (nickname === undefined) {
		nickname = domElement.id || domElement.tagName;
	}

	this._domElement = domElement;
	this._nickname = nickname;

	// properties
	this.top = ElementEdge.top(this);
	this.right = ElementEdge.right(this);
	this.bottom = ElementEdge.bottom(this);
	this.left = ElementEdge.left(this);

	this.center = Center.x(this.left, this.right, "center of " + this);
	this.middle = Center.y(this.top, this.bottom, "middle of " + this);

	this.width = GenericSize.create(this.left, this.right, "width of " + this);
	this.height = GenericSize.create(this.top, this.bottom, "height of " + this);

	this.rendered = ElementRendered.create(this);
};
Assertable.extend(Me);

Me.prototype.getRawStyle = function(styleName) {
	ensure.signature(arguments, [String]);

	var styles;
	var result;

	// WORKAROUND IE 8: no getComputedStyle()
	if (window.getComputedStyle) {
		// WORKAROUND Firefox 40.0.3: must use frame's contentWindow (ref https://bugzilla.mozilla.org/show_bug.cgi?id=1204062)
		styles = this.context().contentWindow.getComputedStyle(this._domElement);
		result = styles.getPropertyValue(styleName);
	}
	else {
		styles = this._domElement.currentStyle;
		result = styles[camelcase(styleName)];
	}
	if (result === null || result === undefined) result = "";
	return result;
};

Me.prototype.getRawPosition = function() {
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

Me.prototype.calculatePixelValue = function(sizeString) {
	var dom = this._domElement;
	if (dom.runtimeStyle !== undefined) return ie8Workaround();

	var result;
	var style = dom.style;
	var oldPosition = style.position;
	var oldLeft = style.left;

	style.position = "absolute";
	style.left = sizeString;
	result = parseFloat(this.getRawStyle("left"));    // parseInt strips off 'px' value

	style.position = oldPosition;
	style.left = oldLeft;
	return result;

	// WORKAROUND IE 8: getRawStyle() doesn't normalize values to px
	// Based on code by Dean Edwards: http://disq.us/p/myl99x
	function ie8Workaround() {
		var runtimeStyleLeft = dom.runtimeStyle.left;
		var styleLeft = dom.style.left;

		dom.runtimeStyle.left = dom.currentStyle.left;
		dom.style.left = sizeString;
		result = dom.style.pixelLeft;

		dom.runtimeStyle.left = runtimeStyleLeft;
		dom.style.left = styleLeft;
		return result;
	}
};

Me.prototype.parent = function(nickname) {
	ensure.signature(arguments, [[ undefined, String ]]);
	if (nickname === undefined) nickname = "parent of " + this._nickname;

	var parentBody = this.context().body();
	if (this.equals(parentBody)) return null;

	var parent = this._domElement.parentElement;
	if (parent === null) return null;

	return new Me(parent, nickname);
};

Me.prototype.add = function(html, nickname) {
	ensure.signature(arguments, [ String, [ undefined, String ] ]);
	if (nickname === undefined) nickname = html + " in " + this._nickname;

	var tempElement = document.createElement("div");
	tempElement.innerHTML = shim.String.trim(html);
	ensure.that(
		tempElement.childNodes.length === 1,
		"Expected one element, but got " + tempElement.childNodes.length + " (" + html + ")"
	);

	var insertedElement = tempElement.childNodes[0];
	this._domElement.appendChild(insertedElement);
	return new Me(insertedElement, nickname);
};

Me.prototype.remove = function() {
	ensure.signature(arguments, []);
	shim.Element.remove(this._domElement);
};

Me.prototype.contains = function(element) {
	ensure.signature(arguments, [ Me ]);
	return this.toDomElement().contains(element.toDomElement());
};

Me.prototype.toDomElement = function() {
	ensure.signature(arguments, []);
	return this._domElement;
};

Me.prototype.context = function() {
	ensure.signature(arguments, []);

	var BrowsingContext = require("./browsing_context.js");   // break circular dependency
	return new BrowsingContext(this._domElement.ownerDocument);
};

Me.prototype.toString = function() {
	ensure.signature(arguments, []);
	return "'" + this._nickname + "'";
};

Me.prototype.equals = function(that) {
	ensure.signature(arguments, [ Me ]);
	return this._domElement === that._domElement;
};

},{"../vendor/camelcase-1.0.1-modified.js":35,"./assertable.js":3,"./browsing_context.js":5,"./descriptors/center.js":7,"./descriptors/element_edge.js":9,"./descriptors/element_rendered.js":10,"./descriptors/generic_size.js":12,"./util/ensure.js":26,"./util/shim.js":28}],21:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var QElement = require("./q_element.js");

var Me = module.exports = function QElementList(nodeList, nickname) {
	ensure.signature(arguments, [ Object, String ]);

	this._nodeList = nodeList;
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
	return new QElement(element, nickname);
};

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	return "'" + this._nickname + "' list";
};
},{"./q_element.js":20,"./util/ensure.js":26}],22:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var shim = require("./util/shim.js");
var BrowsingContext = require("./browsing_context.js");
var async = require("../vendor/async-1.4.2.js");

var Me = module.exports = function QFrame() {
	ensure.signature(arguments, []);

	this._domElement = null;
	this._loaded = false;
	this._removed = false;
};

function loaded(self, width, height, src, stylesheets) {

	self._loaded = true;
	self._document = self._domElement.contentDocument;
	self._browsingContext = new BrowsingContext(self._document);
	self._originalBody = self._document.body.innerHTML;
	self._originalWidth = width;
	self._originalHeight = height;
	self._originalSrc = src;
	self._originalStylesheets = stylesheets;
}

Me.create = function create(parentElement, options, callback) {
	ensure.signature(arguments, [Object, [Object, Function], [undefined, Function]]);
	if (callback === undefined) {
		callback = options;
		options = {};
	}
	var width = options.width || 2000;
	var height = options.height || 2000;
	var src = options.src;
	var stylesheets = options.stylesheet || [];
	var css = options.css;
	if (!shim.Array.isArray(stylesheets)) stylesheets = [ stylesheets ];

	var frame = new Me();
	checkUrls(src, stylesheets, function(err) {
		if (err) return callback(err);

		var iframe = insertIframe(parentElement, width, height);
		shim.EventTarget.addEventListener(iframe, "load", onFrameLoad);
		setIframeContent(iframe, src);

		frame._domElement = iframe;
		setFrameLoadCallback(frame, callback);
	});
	return frame;

	function onFrameLoad() {
		// WORKAROUND Mobile Safari 7.0.0, Safari 6.2.0, Chrome 38.0.2125: frame is loaded synchronously
		// We force it to be asynchronous here
		setTimeout(function() {
			loaded(frame, width, height, src, stylesheets);
			addStylesheetLinkTags(frame, stylesheets, function() {
				if (css) addStyleTag(frame, options.css);
				frame._frameLoadCallback(null, frame);
			});
		}, 0);
	}
};

function setFrameLoadCallback(frame, callback) {
	frame._frameLoadCallback = callback;
}

function checkUrls(src, stylesheets, callback) {
	urlExists(src, function(err, srcExists) {
		if (err) return callback(err);
		if (!srcExists) return callback(error("src", src));

		async.each(stylesheets, checkStylesheet, callback);
	});

	function checkStylesheet(url, callback2) {
		urlExists(url, function(err, stylesheetExists) {
			if (err) return callback2(err);

			if (!stylesheetExists) return callback2(error("stylesheet", url));
			else return callback2(null);
		});
	}

	function error(name, url) {
		return new Error("404 error while loading " + name + " (" + url + ")");
	}
}

function urlExists(url, callback) {
	var STATUS_AVAILABLE = 2;   // WORKAROUND IE 8: non-standard XMLHttpRequest constant names

	if (url === undefined) {
		return callback(null, true);
	}

	var http = new XMLHttpRequest();
	http.open("HEAD", url);
	http.onreadystatechange = function() {  // WORKAROUND IE 8: doesn't support .addEventListener() or .onload
		if (http.readyState === STATUS_AVAILABLE) {
			return callback(null, http.status !== 404);
		}
	};
	http.onerror = function() {     // onerror handler is not tested
		return callback("XMLHttpRequest error while using HTTP HEAD on URL '" + url + "': " + http.statusText);
	};
	http.send();
}

function insertIframe(parentElement, width, height) {
	var iframe = document.createElement("iframe");
	iframe.setAttribute("width", width);
	iframe.setAttribute("height", height);
	iframe.setAttribute("frameborder", "0");    // WORKAROUND IE 8: don't include frame border in position calcs
	parentElement.appendChild(iframe);
	return iframe;
}

function setIframeContent(iframe, src) {
	if (src === undefined) {
		writeStandardsModeHtml(iframe);
	}	else {
		setIframeSrc(iframe, src);
	}
}

function setIframeSrc(iframe, src) {
	iframe.setAttribute("src", src);
}

function writeStandardsModeHtml(iframe) {
	var standardsMode = "<!DOCTYPE html>\n<html><head></head><body></body></html>";
	iframe.contentWindow.document.open();
	iframe.contentWindow.document.write(standardsMode);
	iframe.contentWindow.document.close();
}

function addStylesheetLinkTags(self, urls, callback) {
	async.each(urls, addLinkTag, callback);

	function addLinkTag(url, onLinkLoad) {
		var link = self._document.createElement("link");
		shim.EventTarget.addEventListener(link, "load", function(event) { onLinkLoad(null); });
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("type", "text/css");
		link.setAttribute("href", url);
		shim.Document.head(self._document).appendChild(link);
	}
}

function addStyleTag(self, css) {
	var style = document.createElement("style");
	style.setAttribute("type", "text/css");
	if (style.styleSheet) {
		// WORKAROUND IE 8: Throws 'unknown runtime error' if you set innerHTML on a <style> tag
		style.styleSheet.cssText = css;
	}
	else {
		style.innerHTML = css;
	}
	shim.Document.head(self._document).appendChild(style);
}

Me.prototype.reset = function() {
	ensure.signature(arguments, []);
	ensureUsable(this);

	this._document.body.innerHTML = this._originalBody;
	this.scroll(0, 0);
	this.resize(this._originalWidth, this._originalHeight);
};

Me.prototype.reload = function(callback) {
	ensure.signature(arguments, [Function]);
	ensureUsable(this);

	var frame = this;
	var iframe = this._domElement;
	var src = this._originalSrc;

	this.resize(this._originalWidth, this._originalHeight);
	setFrameLoadCallback(frame, callback);
	setIframeContent(iframe, src);
};

Me.prototype.toDomElement = function() {
	ensure.signature(arguments, []);
	ensureUsable(this);

	return this._domElement;
};

Me.prototype.toBrowsingContext = function() {
	ensure.signature(arguments, []);
	ensureUsable(this);

	return this._browsingContext;
};

Me.prototype.remove = function() {
	ensure.signature(arguments, []);
	ensureLoaded(this);
	if (this._removed) return;

	this._domElement.parentNode.removeChild(this._domElement);
	this._removed = true;
};

Me.prototype.viewport = function() {
	ensureUsable(this);

	return this._browsingContext.viewport();
};

Me.prototype.page = function() {
	ensureUsable(this);

	return this._browsingContext.page();
};

Me.prototype.body = function() {
	ensureUsable(this);

	return this._browsingContext.body();
};

Me.prototype.add = function(html, nickname) {
	ensureUsable(this);

	return this._browsingContext.add(html, nickname);
};

Me.prototype.get = function(selector, nickname) {
	ensureUsable(this);

	return this._browsingContext.get(selector, nickname);
};

Me.prototype.getAll = function(selector, nickname) {
	ensureUsable(this);

	return this._browsingContext.getAll(selector, nickname);
};

Me.prototype.scroll = function scroll(x, y) {
	ensureUsable(this);

	return this._browsingContext.scroll(x, y);
};

Me.prototype.getRawScrollPosition = function getRawScrollPosition() {
	ensureUsable(this);

	return this._browsingContext.getRawScrollPosition();
};

Me.prototype.resize = function resize(width, height) {
	ensure.signature(arguments, [Number, Number]);
	ensureUsable(this);

	this._domElement.setAttribute("width", "" + width);
	this._domElement.setAttribute("height", "" + height);
	this.forceReflow();
};

Me.prototype.forceReflow = function forceReflow() {
	this._browsingContext.forceReflow();
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

},{"../vendor/async-1.4.2.js":34,"./browsing_context.js":5,"./util/ensure.js":26,"./util/shim.js":28}],23:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var PageEdge = require("./descriptors/page_edge.js");
var Center = require("./descriptors/center.js");
var Assertable = require("./assertable.js");
var GenericSize = require("./descriptors/generic_size.js");

var Me = module.exports = function QPage(browsingContext) {
	var BrowsingContext = require("./browsing_context.js");   // break circular dependency
	ensure.signature(arguments, [ BrowsingContext ]);

	// properties
	this.top = PageEdge.top(browsingContext);
	this.right = PageEdge.right(browsingContext);
	this.bottom = PageEdge.bottom(browsingContext);
	this.left = PageEdge.left(browsingContext);

	this.width = GenericSize.create(this.left, this.right, "width of page");
	this.height = GenericSize.create(this.top, this.bottom, "height of page");

	this.center = Center.x(this.left, this.right, "center of page");
	this.middle = Center.y(this.top, this.bottom, "middle of page");
};
Assertable.extend(Me);

},{"./assertable.js":3,"./browsing_context.js":5,"./descriptors/center.js":7,"./descriptors/generic_size.js":12,"./descriptors/page_edge.js":13,"./util/ensure.js":26}],24:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var ViewportEdge = require("./descriptors/viewport_edge.js");
var Center = require("./descriptors/center.js");
var Assertable = require("./assertable.js");
var GenericSize = require("./descriptors/generic_size.js");

var Me = module.exports = function QViewport(browsingContext) {
	var BrowsingContext = require("./browsing_context");   // break circular dependency
	ensure.signature(arguments, [ BrowsingContext ]);

	// properties
	this.top = ViewportEdge.top(browsingContext);
	this.right = ViewportEdge.right(browsingContext);
	this.bottom = ViewportEdge.bottom(browsingContext);
	this.left = ViewportEdge.left(browsingContext);

	this.width = GenericSize.create(this.left, this.right, "width of viewport");
	this.height = GenericSize.create(this.top, this.bottom, "height of viewport");

	this.center = Center.x(this.left, this.right, "center of viewport");
	this.middle = Center.y(this.top, this.bottom, "middle of viewport");
};
Assertable.extend(Me);

},{"./assertable.js":3,"./browsing_context":5,"./descriptors/center.js":7,"./descriptors/generic_size.js":12,"./descriptors/viewport_edge.js":19,"./util/ensure.js":26}],25:[function(require,module,exports){
// Copyright Titanium I.T. LLC.
"use strict";

var QElement = require('./q_element.js');
var QFrame = require("./q_frame.js");
var browser = require("./browser.js");

exports.browser = browser;

exports.createFrame = function(options, callback) {
	return QFrame.create(document.body, options, function(err, callbackFrame) {
		if (err) return callback(err);
		browser.detectBrowserFeatures(function(err) {
			callback(err, callbackFrame);
		});
	});
};

exports.elementFromDom = function(domElement, nickname) {
	return new QElement(domElement, nickname);
};

},{"./browser.js":4,"./q_element.js":20,"./q_frame.js":22}],26:[function(require,module,exports){
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

exports.signature = function(args, signature) {
	signature = signature || [];
	var expectedArgCount = signature.length;
	var actualArgCount = args.length;

	if (actualArgCount > expectedArgCount) {
		throw new EnsureException(
			exports.signature,
			"Function called with too many arguments: expected " + expectedArgCount + " but got " + actualArgCount
		);
	}

	var arg, types, name;
	for (var i = 0; i < signature.length; i++) {
		arg = args[i];
		types = signature[i];
		name = "Argument #" + (i + 1);

		if (!shim.Array.isArray(types)) types = [ types ];
		if (!argMatchesAnyPossibleType(arg, types)) {
			var message = name + " expected " + explainPossibleTypes(types) + ", but was " + explainArg(arg);
			throw new EnsureException(exports.signature, message);
		}
	}
};

function argMatchesAnyPossibleType(arg, type) {
	for (var i = 0; i < type.length; i++) {
		if (argMatchesType(arg, type[i])) return true;
	}
	return false;

	function argMatchesType(arg, type) {
		switch (getArgType(arg)) {
			case "boolean": return type === Boolean;
			case "string": return type === String;
			case "number": return type === Number;
			case "array": return type === Array;
			case "function": return type === Function;
			case "object": return type === Object || arg instanceof type;
			case "undefined": return type === undefined;
			case "null": return type === null;
			case "NaN": return typeof(type) === "number" && isNaN(type);

			default: exports.unreachable();
		}
	}
}

function explainPossibleTypes(type) {
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
			case undefined: return "undefined";
			default:
				if (typeof type === "number" && isNaN(type)) return "NaN";
				else {
					return oop.className(type) + " instance";
				}
		}
	}
}

function explainArg(arg) {
	var type = getArgType(arg);
	if (type !== "object") return type;

	return oop.instanceName(arg) + " instance";
}

function getArgType(variable) {
	var type = typeof variable;
	if (variable === null) type = "null";
	if (shim.Array.isArray(variable)) type = "array";
	if (type === "number" && isNaN(variable)) type = "NaN";
	return type;
}


/*****/

var EnsureException = exports.EnsureException = function EnsureException(fnToRemoveFromStackTrace, message) {
	if (Error.captureStackTrace) Error.captureStackTrace(this, fnToRemoveFromStackTrace);
	else this.stack = (new Error()).stack;
	this.message = message;
};
EnsureException.prototype = shim.Object.create(Error.prototype);
EnsureException.prototype.constructor = EnsureException;
EnsureException.prototype.name = "EnsureException";

},{"./oop.js":27,"./shim.js":28}],27:[function(require,module,exports){
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
},{"./shim.js":28}],28:[function(require,module,exports){
// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/*eslint eqeqeq: "off", no-eq-null: "off", no-bitwise: "off" */
"use strict";

exports.Array = {

	// WORKAROUND IE 8: no Array.isArray
	isArray: function isArray(thing) {
		if (Array.isArray) return Array.isArray(thing);

		return Object.prototype.toString.call(thing) === '[object Array]';
	},

	// WORKAROUND IE 8: no Array.every
	every: function every(obj, callbackfn, thisArg) {
		/*jshint bitwise:false, eqeqeq:false, -W041:false */
		if (Array.prototype.every) return obj.every(callbackfn, thisArg);

		// This workaround based on polyfill code from MDN:
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
		var T, k;

		if (this == null) {
			throw new TypeError('this is null or not defined');
		}

		// 1. Let O be the result of calling ToObject passing the this
		//    value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get internal method
		//    of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
		if (typeof callbackfn !== 'function') {
			throw new TypeError();
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (arguments.length > 1) {
			T = thisArg;
		}

		// 6. Let k be 0.
		k = 0;

		// 7. Repeat, while k < len
		while (k < len) {

			var kValue;

			// a. Let Pk be ToString(k).
			//   This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal
			//    method of O with argument Pk.
			//   This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal method
				//    of O with argument Pk.
				kValue = O[k];

				// ii. Let testResult be the result of calling the Call internal method
				//     of callbackfn with T as the this value and argument list
				//     containing kValue, k, and O.
				var testResult = callbackfn.call(T, kValue, k, O);

				// iii. If ToBoolean(testResult) is false, return false.
				if (!testResult) {
					return false;
				}
			}
			k++;
		}
		return true;
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


exports.Document = {

	// WORKAROUND IE 8: no document.head
	head: function head(doc) {
		if (doc.head) return doc.head;

		return doc.querySelector("head");
	}

};


exports.Element = {

	// WORKAROUND IE 8, IE 9, IE 10, IE 11: no Element.remove()
	remove: function remove(element) {
		element.parentNode.removeChild(element);
	}

};


exports.EventTarget = {

	// WORKAROUND IE 8: no EventTarget.addEventListener()
	addEventListener: function addEventListener(element, event, callback) {
		if (element.addEventListener) return element.addEventListener(event, callback);

		element.attachEvent("on" + event, callback);
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


exports.String = {

	// WORKAROUND IE 8: No String.trim()
	trim: function(str) {
		if (str.trim !== undefined) return str.trim();

		// Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
		return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
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
},{}],29:[function(require,module,exports){
// Copyright (c) 2014-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");

var Me = module.exports = function Pixels(amount) {
	ensure.signature(arguments, [ [ Number, null ] ]);
	this._none = (amount === null);
	this._amount = amount;
};
Value.extend(Me);

Me.create = function create(amount) {
	return new Me(amount);
};

Me.createNone = function createNone() {
	return new Me(null);
};

Me.ZERO = Me.create(0);
Me.NONE = Me.createNone();

Me.prototype.compatibility = function compatibility() {
	return [ Me ];
};

Me.prototype.plus = Value.safe(function plus(operand) {
	if (this._none || operand._none) return Me.createNone();
	return new Me(this._amount + operand._amount);
});

Me.prototype.minus = Value.safe(function minus(operand) {
	if (this._none || operand._none) return Me.createNone();
	return new Me(this._amount - operand._amount);
});

Me.prototype.difference = Value.safe(function difference(operand) {
	if (this._none || operand._none) return Me.createNone();
	return new Me(Math.abs(this._amount - operand._amount));
});

Me.prototype.times = function times(operand) {
	ensure.signature(arguments, [ Number ]);

	if (this._none) return Me.createNone();
	return new Me(this._amount * operand);
};

Me.prototype.average = Value.safe(function average(operand) {
	if (this._none || operand._none) return Me.createNone();
	return new Me((this._amount + operand._amount) / 2);
});

Me.prototype.compare = Value.safe(function compare(operand) {
	var bothHavePixels = !this._none && !operand._none;
	var neitherHavePixels = this._none && operand._none;
	var onlyLeftHasPixels = !this._none && operand._none;

	if (bothHavePixels) {
		var difference = this._amount - operand._amount;
		if (Math.abs(difference) <= 0.5) return 0;
		else return difference;
	}
	else if (neitherHavePixels) {
				return 0;
	}
	else if (onlyLeftHasPixels) {
		return 1;
	}
	else {
		return -1;
	}
});

Me.min = function(l, r) {
	ensure.signature(arguments, [ Me, Me ]);

	if (l._none || r._none) return Me.createNone();
	return l.compare(r) <= 0 ? l : r;
};

Me.max = function(l, r) {
	ensure.signature(arguments, [ Me, Me ]);

	if (l._none || r._none) return Me.createNone();
	return l.compare(r) >= 0 ? l : r;
};

Me.prototype.diff = Value.safe(function diff(expected) {
	if (this.compare(expected) === 0) return "";
	if (this._none || expected._none) return "non-measurable";

	var difference = Math.abs(this._amount - expected._amount);

	var desc = difference;
	if (difference * 100 !== Math.floor(difference * 100)) desc = "about " + difference.toFixed(2);
	return desc + "px";
});

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);
	return this._none ? "no pixels" : this._amount + "px";
};

},{"../util/ensure.js":26,"./value.js":33}],30:[function(require,module,exports){
// Copyright (c) 2014-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");
var Pixels = require("./pixels.js");
var Size = require("./size.js");

var X_DIMENSION = "x";
var Y_DIMENSION = "y";

var Me = module.exports = function Position(dimension, value) {
	ensure.signature(arguments, [ String, [ Number, Pixels ] ]);

	this._dimension = dimension;
	this._value = (typeof value === "number") ? Pixels.create(value) : value;
};
Value.extend(Me);

Me.x = function x(value) {
	ensure.signature(arguments, [ [ Number, Pixels ] ]);

	return new Me(X_DIMENSION, value);
};

Me.y = function y(value) {
	ensure.signature(arguments, [ [ Number, Pixels ] ]);

	return new Me(Y_DIMENSION, value);
};

Me.noX = function noX() {
	ensure.signature(arguments, []);

	return new Me(X_DIMENSION, Pixels.NONE);
};

Me.noY = function noY() {
	ensure.signature(arguments, []);

	return new Me(Y_DIMENSION, Pixels.NONE);
};

Me.prototype.compatibility = function compatibility() {
	return [ Me, Size ];
};

Me.prototype.distanceTo = function(operand) {
	ensure.signature(arguments, [ Me ]);
	checkAxis(this, operand);
	return Size.create(this._value.difference(operand.toPixels()));
};

Me.prototype.plus = Value.safe(function plus(operand) {
	checkAxis(this, operand);
	return new Me(this._dimension, this._value.plus(operand.toPixels()));
});

Me.prototype.minus = Value.safe(function minus(operand) {
	checkAxis(this, operand);
	return new Me(this._dimension, this._value.minus(operand.toPixels()));
});

Me.prototype.midpoint = Value.safe(function midpoint(operand) {
	checkAxis(this, operand);
	return new Me(this._dimension, this._value.average(operand.toPixels()));
});

Me.prototype.compare = Value.safe(function compare(operand) {
	checkAxis(this, operand);
	return this._value.compare(operand.toPixels());
});

Me.prototype.min = Value.safe(function min(operand) {
	checkAxis(this, operand);
	return new Me(this._dimension, Pixels.min(this._value, operand.toPixels()));
});

Me.prototype.max = Value.safe(function max(operand) {
	checkAxis(this, operand);
	return new Me(this._dimension, Pixels.max(this._value, operand.toPixels()));
});

Me.prototype.diff = Value.safe(function diff(expected) {
	ensure.signature(arguments, [ Me ]);
	checkAxis(this, expected);

	var actualValue = this._value;
	var expectedValue = expected._value;

	if (actualValue.equals(expectedValue)) return "";
	else if (isNone(expected) && !isNone(this)) return "rendered";
	else if (!isNone(expected) && isNone(this)) return "not rendered";

	var direction;
	var comparison = actualValue.compare(expectedValue);
	if (this._dimension === X_DIMENSION) direction = comparison < 0 ? "to left" : "to right";
	else direction = comparison < 0 ? "higher" : "lower";

	return actualValue.diff(expectedValue) + " " + direction;
});

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	if (isNone(this)) return "not rendered";
	else return this._value.toString();
};

Me.prototype.toPixels = function toPixels() {
	ensure.signature(arguments, []);
	return this._value;
};

function checkAxis(self, other) {
	if (other instanceof Me) {
		ensure.that(self._dimension === other._dimension, "Can't compare X coordinate to Y coordinate");
	}
}

function isNone(position) {
	return position._value.equals(Pixels.NONE);
}
},{"../util/ensure.js":26,"./pixels.js":29,"./size.js":32,"./value.js":33}],31:[function(require,module,exports){
// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var Value = require("./value.js");

var RENDERED = "rendered";
var NOT_RENDERED = "not rendered";

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

Me.prototype.compatibility = function compatibility() {
	return [ Me ];
};

Me.prototype.diff = Value.safe(function diff(expected) {
	var thisState = this._state;
	var expectedState = expected._state;

	if (thisState === expectedState) return "";
	else return this.toString();
});

Me.prototype.toString = function toString() {
	return this._state;
};

},{"../util/ensure.js":26,"./value.js":33}],32:[function(require,module,exports){
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

Me.createNone = function createNone() {
	ensure.signature(arguments, []);

	return new Me(Pixels.NONE);
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
	if (isNone(expected) && !isNone(this)) return "rendered";
	if (!isNone(expected) && isNone(this)) return "not rendered";

	var desc = actualValue.compare(expectedValue) > 0 ? " larger" : " smaller";
	return actualValue.diff(expectedValue) + desc;
});

Me.prototype.toString = function toString() {
	ensure.signature(arguments, []);

	if (isNone(this)) return "not rendered";
	else return this._value.toString();
};

Me.prototype.toPixels = function toPixels() {
	ensure.signature(arguments, []);
	return this._value;
};

function isNone(size) {
	return size._value.equals(Pixels.NONE);
}
},{"../util/ensure.js":26,"./pixels.js":29,"./value.js":33}],33:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("../util/ensure.js");
var oop = require("../util/oop.js");
var shim = require("../util/shim.js");

var Me = module.exports = function Value() {};
Me.extend = oop.extendFn(Me);
oop.makeAbstract(Me, [
	"compatibility",
	"diff",
	"toString"
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

Me.prototype.isCompatibleWith = function isCompatibleWith(that) {
	if (that === null || typeof that !== "object") return false;

	var compatibleTypes = this.compatibility();
	for (var i = 0; i < compatibleTypes.length; i++) {
		if (that instanceof compatibleTypes[i]) return true;
	}
	return false;
};

function ensureCompatibility(self, compatible, args) {
	var arg;
	for (var i = 0; i < args.length; i++) {   // args is not an Array, can't use forEach
		arg = args[i];
		if (!self.isCompatibleWith(arg)) {
			var type = typeof arg;
			if (arg === null) type = "null";
			if (type === "object") type = oop.instanceName(arg);

			throw new Error(oop.instanceName(self) + " isn't compatible with " + type);
		}
	}
}


},{"../util/ensure.js":26,"../util/oop.js":27,"../util/shim.js":28}],34:[function(require,module,exports){
(function (process,global,setImmediate){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _each(coll, iterator) {
        return _isArrayLike(coll) ?
            _arrayEach(coll, iterator) :
            _forEachOf(coll, iterator);
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];
        var size = _isArrayLike(object) ? object.length : _keys(object).length;
        var completed = 0;
        if (!size) {
            return callback(null);
        }
        _each(object, function (value, key) {
            iterator(object[key], key, only_once(done));
        });
        function done(err) {
            if (err) {
                callback(err);
            }
            else {
                completed += 1;
                if (completed >= size) {
                    callback(null);
                }
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        var results = [];
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err || null, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, callback) {
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has inexistant dependency');
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback(null);
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    while(workers < q.concurrency && q.tasks.length){
                        var tasks = q.payload ?
                            q.tasks.splice(0, q.payload) :
                            q.tasks.splice(0, q.tasks.length);

                        var data = _map(tasks, function (task) {
                            return task.data;
                        });

                        if (q.tasks.length === 0) {
                            q.empty();
                        }
                        workers += 1;
                        var cb = only_once(_next(q, tasks));
                        worker(data, cb);
                    }
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)

},{"_process":1,"timers":2}],35:[function(require,module,exports){
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

},{}]},{},[25])(25)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJzcmMvYXNzZXJ0YWJsZS5qcyIsInNyYy9icm93c2VyLmpzIiwic3JjL2Jyb3dzaW5nX2NvbnRleHQuanMiLCJzcmMvZGVzY3JpcHRvcnMvYWJzb2x1dGVfcG9zaXRpb24uanMiLCJzcmMvZGVzY3JpcHRvcnMvY2VudGVyLmpzIiwic3JjL2Rlc2NyaXB0b3JzL2Rlc2NyaXB0b3IuanMiLCJzcmMvZGVzY3JpcHRvcnMvZWxlbWVudF9lZGdlLmpzIiwic3JjL2Rlc2NyaXB0b3JzL2VsZW1lbnRfcmVuZGVyZWQuanMiLCJzcmMvZGVzY3JpcHRvcnMvZWxlbWVudF9yZW5kZXJlZF9lZGdlLmpzIiwic3JjL2Rlc2NyaXB0b3JzL2dlbmVyaWNfc2l6ZS5qcyIsInNyYy9kZXNjcmlwdG9ycy9wYWdlX2VkZ2UuanMiLCJzcmMvZGVzY3JpcHRvcnMvcG9zaXRpb25fZGVzY3JpcHRvci5qcyIsInNyYy9kZXNjcmlwdG9ycy9yZWxhdGl2ZV9wb3NpdGlvbi5qcyIsInNyYy9kZXNjcmlwdG9ycy9yZWxhdGl2ZV9zaXplLmpzIiwic3JjL2Rlc2NyaXB0b3JzL3NpemVfZGVzY3JpcHRvci5qcyIsInNyYy9kZXNjcmlwdG9ycy9zaXplX211bHRpcGxlLmpzIiwic3JjL2Rlc2NyaXB0b3JzL3ZpZXdwb3J0X2VkZ2UuanMiLCJzcmMvcV9lbGVtZW50LmpzIiwic3JjL3FfZWxlbWVudF9saXN0LmpzIiwic3JjL3FfZnJhbWUuanMiLCJzcmMvcV9wYWdlLmpzIiwic3JjL3Ffdmlld3BvcnQuanMiLCJzcmMvcXVpeG90ZS5qcyIsInNyYy91dGlsL2Vuc3VyZS5qcyIsInNyYy91dGlsL29vcC5qcyIsInNyYy91dGlsL3NoaW0uanMiLCJzcmMvdmFsdWVzL3BpeGVscy5qcyIsInNyYy92YWx1ZXMvcG9zaXRpb24uanMiLCJzcmMvdmFsdWVzL3JlbmRlcl9zdGF0ZS5qcyIsInNyYy92YWx1ZXMvc2l6ZS5qcyIsInNyYy92YWx1ZXMvdmFsdWUuanMiLCJ2ZW5kb3IvYXN5bmMtMS40LjIuanMiLCJ2ZW5kb3IvY2FtZWxjYXNlLTEuMC4xLW1vZGlmaWVkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdHNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsInZhciBuZXh0VGljayA9IHJlcXVpcmUoJ3Byb2Nlc3MvYnJvd3Nlci5qcycpLm5leHRUaWNrO1xudmFyIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5O1xudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGltbWVkaWF0ZUlkcyA9IHt9O1xudmFyIG5leHRJbW1lZGlhdGVJZCA9IDA7XG5cbi8vIERPTSBBUElzLCBmb3IgY29tcGxldGVuZXNzXG5cbmV4cG9ydHMuc2V0VGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRUaW1lb3V0LCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFyVGltZW91dCk7XG59O1xuZXhwb3J0cy5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRJbnRlcnZhbCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhckludGVydmFsKTtcbn07XG5leHBvcnRzLmNsZWFyVGltZW91dCA9XG5leHBvcnRzLmNsZWFySW50ZXJ2YWwgPSBmdW5jdGlvbih0aW1lb3V0KSB7IHRpbWVvdXQuY2xvc2UoKTsgfTtcblxuZnVuY3Rpb24gVGltZW91dChpZCwgY2xlYXJGbikge1xuICB0aGlzLl9pZCA9IGlkO1xuICB0aGlzLl9jbGVhckZuID0gY2xlYXJGbjtcbn1cblRpbWVvdXQucHJvdG90eXBlLnVucmVmID0gVGltZW91dC5wcm90b3R5cGUucmVmID0gZnVuY3Rpb24oKSB7fTtcblRpbWVvdXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2NsZWFyRm4uY2FsbCh3aW5kb3csIHRoaXMuX2lkKTtcbn07XG5cbi8vIERvZXMgbm90IHN0YXJ0IHRoZSB0aW1lLCBqdXN0IHNldHMgdXAgdGhlIG1lbWJlcnMgbmVlZGVkLlxuZXhwb3J0cy5lbnJvbGwgPSBmdW5jdGlvbihpdGVtLCBtc2Vjcykge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gbXNlY3M7XG59O1xuXG5leHBvcnRzLnVuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gLTE7XG59O1xuXG5leHBvcnRzLl91bnJlZkFjdGl2ZSA9IGV4cG9ydHMuYWN0aXZlID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG5cbiAgdmFyIG1zZWNzID0gaXRlbS5faWRsZVRpbWVvdXQ7XG4gIGlmIChtc2VjcyA+PSAwKSB7XG4gICAgaXRlbS5faWRsZVRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gb25UaW1lb3V0KCkge1xuICAgICAgaWYgKGl0ZW0uX29uVGltZW91dClcbiAgICAgICAgaXRlbS5fb25UaW1lb3V0KCk7XG4gICAgfSwgbXNlY3MpO1xuICB9XG59O1xuXG4vLyBUaGF0J3Mgbm90IGhvdyBub2RlLmpzIGltcGxlbWVudHMgaXQgYnV0IHRoZSBleHBvc2VkIGFwaSBpcyB0aGUgc2FtZS5cbmV4cG9ydHMuc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gc2V0SW1tZWRpYXRlIDogZnVuY3Rpb24oZm4pIHtcbiAgdmFyIGlkID0gbmV4dEltbWVkaWF0ZUlkKys7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aCA8IDIgPyBmYWxzZSA6IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICBpbW1lZGlhdGVJZHNbaWRdID0gdHJ1ZTtcblxuICBuZXh0VGljayhmdW5jdGlvbiBvbk5leHRUaWNrKCkge1xuICAgIGlmIChpbW1lZGlhdGVJZHNbaWRdKSB7XG4gICAgICAvLyBmbi5jYWxsKCkgaXMgZmFzdGVyIHNvIHdlIG9wdGltaXplIGZvciB0aGUgY29tbW9uIHVzZS1jYXNlXG4gICAgICAvLyBAc2VlIGh0dHA6Ly9qc3BlcmYuY29tL2NhbGwtYXBwbHktc2VndVxuICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbi5jYWxsKG51bGwpO1xuICAgICAgfVxuICAgICAgLy8gUHJldmVudCBpZHMgZnJvbSBsZWFraW5nXG4gICAgICBleHBvcnRzLmNsZWFySW1tZWRpYXRlKGlkKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBpZDtcbn07XG5cbmV4cG9ydHMuY2xlYXJJbW1lZGlhdGUgPSB0eXBlb2YgY2xlYXJJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IGNsZWFySW1tZWRpYXRlIDogZnVuY3Rpb24oaWQpIHtcbiAgZGVsZXRlIGltbWVkaWF0ZUlkc1tpZF07XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxNSBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIG9vcCA9IHJlcXVpcmUoXCIuL3V0aWwvb29wLmpzXCIpO1xudmFyIHNoaW0gPSByZXF1aXJlKFwiLi91dGlsL3NoaW0uanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQXNzZXJ0YWJsZSgpIHtcblx0ZW5zdXJlLnVucmVhY2hhYmxlKFwiQXNzZXJ0YWJsZSBpcyBhYnN0cmFjdCBhbmQgc2hvdWxkIG5vdCBiZSBjb25zdHJ1Y3RlZCBkaXJlY3RseS5cIik7XG59O1xuTWUuZXh0ZW5kID0gb29wLmV4dGVuZEZuKE1lKTtcbm9vcC5tYWtlQWJzdHJhY3QoTWUsIFtdKTtcblxuTWUucHJvdG90eXBlLmFzc2VydCA9IGZ1bmN0aW9uIGFzc2VydChleHBlY3RlZCwgbWVzc2FnZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBPYmplY3QsIFt1bmRlZmluZWQsIFN0cmluZ10gXSk7XG5cdGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQpIG1lc3NhZ2UgPSBcIkRpZmZlcmVuY2VzIGZvdW5kXCI7XG5cblx0dmFyIGRpZmYgPSB0aGlzLmRpZmYoZXhwZWN0ZWQpO1xuXHRpZiAoZGlmZiAhPT0gXCJcIikgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgKyBcIjpcXG5cIiArIGRpZmYgKyBcIlxcblwiKTtcbn07XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBPYmplY3QgXSk7XG5cblx0dmFyIHJlc3VsdCA9IFtdO1xuXHR2YXIga2V5cyA9IHNoaW0uT2JqZWN0LmtleXMoZXhwZWN0ZWQpO1xuXHR2YXIga2V5LCBvbmVEaWZmLCBkZXNjcmlwdG9yO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRrZXkgPSBrZXlzW2ldO1xuXHRcdGRlc2NyaXB0b3IgPSB0aGlzW2tleV07XG5cdFx0ZW5zdXJlLnRoYXQoXG5cdFx0XHRcdGRlc2NyaXB0b3IgIT09IHVuZGVmaW5lZCxcblx0XHRcdFx0dGhpcyArIFwiIGRvZXNuJ3QgaGF2ZSBhIHByb3BlcnR5IG5hbWVkICdcIiArIGtleSArIFwiJy4gRGlkIHlvdSBtaXNzcGVsbCBpdD9cIlxuXHRcdCk7XG5cdFx0b25lRGlmZiA9IGRlc2NyaXB0b3IuZGlmZihleHBlY3RlZFtrZXldKTtcblx0XHRpZiAob25lRGlmZiAhPT0gXCJcIikgcmVzdWx0LnB1c2gob25lRGlmZik7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0LmpvaW4oXCJcXG5cIik7XG59O1xuIiwiLy8gQ29weXJpZ2h0IFRpdGFuaXVtIEkuVC4gTExDLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBRRnJhbWUgPSByZXF1aXJlKFwiLi9xX2ZyYW1lLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi92YWx1ZXMvc2l6ZS5qc1wiKTtcblxudmFyIEZSQU1FX1dJRFRIID0gMTUwMDtcbnZhciBGUkFNRV9IRUlHSFQgPSAyMDA7XG5cbnZhciBmZWF0dXJlcyA9IG51bGw7XG5cbmV4cG9ydHMuZW5sYXJnZXNGcmFtZVRvUGFnZVNpemUgPSBjcmVhdGVEZXRlY3Rpb25NZXRob2QoXCJlbmxhcmdlc0ZyYW1lXCIpO1xuZXhwb3J0cy5lbmxhcmdlc0ZvbnRzID0gY3JlYXRlRGV0ZWN0aW9uTWV0aG9kKFwiZW5sYXJnZXNGb250c1wiKTtcbmV4cG9ydHMubWlzcmVwb3J0c0NsaXBBdXRvUHJvcGVydHkgPSBjcmVhdGVEZXRlY3Rpb25NZXRob2QoXCJtaXNyZXBvcnRzQ2xpcEF1dG9cIik7XG5leHBvcnRzLm1pc3JlcG9ydHNBdXRvVmFsdWVzSW5DbGlwUHJvcGVydHkgPSBjcmVhdGVEZXRlY3Rpb25NZXRob2QoXCJtaXNyZXBvcnRzQ2xpcFZhbHVlc1wiKTtcbmV4cG9ydHMucm91bmRzT2ZmUGl4ZWxDYWxjdWxhdGlvbnMgPSBjcmVhdGVEZXRlY3Rpb25NZXRob2QoXCJyb3VuZHNPZmZQaXhlbENhbGN1bGF0aW9uc1wiKTtcblxuZXhwb3J0cy5kZXRlY3RCcm93c2VyRmVhdHVyZXMgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHR2YXIgZnJhbWUgPSBRRnJhbWUuY3JlYXRlKGRvY3VtZW50LmJvZHksIHsgd2lkdGg6IEZSQU1FX1dJRFRILCBoZWlnaHQ6IEZSQU1FX0hFSUdIVCB9LCBmdW5jdGlvbihlcnIpIHtcblx0XHRpZiAoZXJyKSB7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKFwiRXJyb3Igd2hpbGUgY3JlYXRpbmcgUXVpeG90ZSBicm93c2VyIGZlYXR1cmUgZGV0ZWN0aW9uIGZyYW1lOiBcIiArIGVycikpO1xuXHRcdH1cblx0XHRyZXR1cm4gZGV0ZWN0RmVhdHVyZXMoZnJhbWUsIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ZnJhbWUucmVtb3ZlKCk7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHR9KTtcblx0fSk7XG59O1xuXG5mdW5jdGlvbiBkZXRlY3RGZWF0dXJlcyhmcmFtZSwgY2FsbGJhY2spIHtcblx0dHJ5IHtcblx0XHRmZWF0dXJlcyA9IHt9O1xuXHRcdGZlYXR1cmVzLmVubGFyZ2VzRnJhbWUgPSBkZXRlY3RGcmFtZUVubGFyZ2VtZW50KGZyYW1lLCBGUkFNRV9XSURUSCk7XG5cdFx0ZmVhdHVyZXMubWlzcmVwb3J0c0NsaXBBdXRvID0gZGV0ZWN0UmVwb3J0ZWRDbGlwQXV0byhmcmFtZSk7XG5cdFx0ZmVhdHVyZXMubWlzcmVwb3J0c0NsaXBWYWx1ZXMgPSBkZXRlY3RSZXBvcnRlZENsaXBQcm9wZXJ0eVZhbHVlcyhmcmFtZSk7XG5cdFx0ZmVhdHVyZXMucm91bmRzT2ZmUGl4ZWxDYWxjdWxhdGlvbnMgPSBkZXRlY3RSb3VuZHNPZmZQaXhlbENhbGN1bGF0aW9ucyhmcmFtZSk7XG5cblx0XHRkZXRlY3RGb250RW5sYXJnZW1lbnQoZnJhbWUsIEZSQU1FX1dJRFRILCBmdW5jdGlvbihyZXN1bHQpIHtcblx0XHRcdGZlYXR1cmVzLmVubGFyZ2VzRm9udHMgPSByZXN1bHQ7XG5cdFx0XHRmcmFtZS5yZW1vdmUoKTtcblx0XHRcdHJldHVybiBjYWxsYmFjayhudWxsKTtcblx0XHR9KTtcblxuXHR9XG5cdGNhdGNoKGVycikge1xuXHRcdGZlYXR1cmVzID0gbnVsbDtcblx0XHRyZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKFwiRXJyb3IgZHVyaW5nIFF1aXhvdGUgYnJvd3NlciBmZWF0dXJlIGRldGVjdGlvbjogXCIgKyBlcnIpKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVEZXRlY3Rpb25NZXRob2QocHJvcGVydHlOYW1lKSB7XG5cdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRcdGVuc3VyZS50aGF0KFxuXHRcdFx0ZmVhdHVyZXMgIT09IG51bGwsXG5cdFx0XHRcIk11c3QgY2FsbCBxdWl4b3RlLmNyZWF0ZUZyYW1lKCkgYmVmb3JlIHVzaW5nIFF1aXhvdGUgYnJvd3NlciBmZWF0dXJlIGRldGVjdGlvbi5cIlxuXHRcdCk7XG5cblx0XHRyZXR1cm4gZmVhdHVyZXNbcHJvcGVydHlOYW1lXTtcblx0fTtcbn1cblxuZnVuY3Rpb24gZGV0ZWN0RnJhbWVFbmxhcmdlbWVudChmcmFtZSwgZnJhbWVXaWR0aCkge1xuXHRmcmFtZS5yZXNldCgpO1xuXG5cdGZyYW1lLmFkZChcIjxkaXYgc3R5bGU9J3dpZHRoOiBcIiArIChmcmFtZVdpZHRoICsgMjAwKSArIFwicHgnPmZvcmNlIHNjcm9sbGluZzwvZGl2PlwiKTtcblx0cmV0dXJuICFmcmFtZS52aWV3cG9ydCgpLndpZHRoLnZhbHVlKCkuZXF1YWxzKFNpemUuY3JlYXRlKGZyYW1lV2lkdGgpKTtcbn1cblxuZnVuY3Rpb24gZGV0ZWN0UmVwb3J0ZWRDbGlwQXV0byhmcmFtZSkge1xuXHRmcmFtZS5yZXNldCgpO1xuXG5cdHZhciBlbGVtZW50ID0gZnJhbWUuYWRkKFwiPGRpdiBzdHlsZT0nY2xpcDogYXV0bzsnPjwvZGl2PlwiKTtcblx0dmFyIGNsaXAgPSBlbGVtZW50LmdldFJhd1N0eWxlKFwiY2xpcFwiKTtcblxuXHRyZXR1cm4gY2xpcCAhPT0gXCJhdXRvXCI7XG59XG5cbmZ1bmN0aW9uIGRldGVjdFJlcG9ydGVkQ2xpcFByb3BlcnR5VmFsdWVzKGZyYW1lKSB7XG5cdGZyYW1lLnJlc2V0KCk7XG5cblx0dmFyIGVsZW1lbnQgPSBmcmFtZS5hZGQoXCI8ZGl2IHN0eWxlPSdjbGlwOiByZWN0KGF1dG8sIGF1dG8sIGF1dG8sIGF1dG8pOyc+PC9kaXY+XCIpO1xuXHR2YXIgY2xpcCA9IGVsZW1lbnQuZ2V0UmF3U3R5bGUoXCJjbGlwXCIpO1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogUHJvdmlkZXMgJ2NsaXBUb3AnIGV0Yy4gaW5zdGVhZCBvZiAnY2xpcCcgcHJvcGVydHlcblx0aWYgKGNsaXAgPT09IFwiXCIgJiYgZWxlbWVudC5nZXRSYXdTdHlsZShcImNsaXAtdG9wXCIpID09PSBcImF1dG9cIikgcmV0dXJuIGZhbHNlO1xuXG5cdHJldHVybiBjbGlwICE9PSBcInJlY3QoYXV0bywgYXV0bywgYXV0bywgYXV0bylcIiAmJiBjbGlwICE9PSBcInJlY3QoYXV0byBhdXRvIGF1dG8gYXV0bylcIjtcbn1cblxuZnVuY3Rpb24gZGV0ZWN0Um91bmRzT2ZmUGl4ZWxDYWxjdWxhdGlvbnMoZnJhbWUpIHtcblx0dmFyIGVsZW1lbnQgPSBmcmFtZS5hZGQoXCI8ZGl2IHN0eWxlPSdmb250LXNpemU6IDE1cHg7Jz48L2Rpdj5cIik7XG5cdHZhciBzaXplID0gZWxlbWVudC5jYWxjdWxhdGVQaXhlbFZhbHVlKFwiMC41ZW1cIik7XG5cblx0aWYgKHNpemUgPT09IDcuNSkgcmV0dXJuIGZhbHNlO1xuXHRpZiAoc2l6ZSA9PT0gOCkgcmV0dXJuIHRydWU7XG5cdGVuc3VyZS51bnJlYWNoYWJsZShcIkZhaWx1cmUgaW4gcm91bmRzT2ZmUGl4ZWxWYWx1ZXMoKSBkZXRlY3Rpb246IGV4cGVjdGVkIDcuNSBvciA4LCBidXQgZ290IFwiICsgc2l6ZSk7XG59XG5cbmZ1bmN0aW9uIGRldGVjdEZvbnRFbmxhcmdlbWVudChmcmFtZSwgZnJhbWVXaWR0aCwgY2FsbGJhY2spIHtcblx0ZW5zdXJlLnRoYXQoZnJhbWVXaWR0aCA+PSAxNTAwLCBcIkRldGVjdG9yIGZyYW1lIHdpZHRoIG11c3QgYmUgbGFyZ2VyIHRoYW4gc2NyZWVuIHRvIGRldGVjdCBmb250IGVubGFyZ2VtZW50XCIpO1xuXHRmcmFtZS5yZXNldCgpO1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogd2UgdXNlIGEgPGRpdj4gYmVjYXVzZSB0aGUgPHN0eWxlPiB0YWcgY2FuJ3QgYmUgYWRkZWQgYnkgZnJhbWUuYWRkKCkuIEF0IHRoZSB0aW1lIG9mIHRoaXNcblx0Ly8gd3JpdGluZywgSSdtIG5vdCBzdXJlIGlmIHRoZSBpc3N1ZSBpcyB3aXRoIGZyYW1lLmFkZCgpIG9yIGlmIElFIGp1c3QgY2FuJ3QgcHJvZ3JhbW1hdGljYWxseSBhZGQgPHN0eWxlPiB0YWdzLlxuXHRmcmFtZS5hZGQoXCI8ZGl2PjxzdHlsZT5wIHsgZm9udC1zaXplOiAxNXB4OyB9PC9zdHlsZT48L2Rpdj5cIik7XG5cblx0dmFyIHRleHQgPSBmcmFtZS5hZGQoXCI8cD5hcmJpdHJhcnkgdGV4dDwvcD5cIik7XG5cdGZyYW1lLmFkZChcIjxwPm11c3QgaGF2ZSB0d28gcCB0YWdzIHRvIHdvcms8L3A+XCIpO1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbmVlZCB0byBmb3JjZSByZWZsb3cgb3IgZ2V0dGluZyBmb250LXNpemUgbWF5IGZhaWwgYmVsb3dcblx0Ly8gVGhpcyBzZWVtcyB0byBvY2N1ciB3aGVuIElFIGlzIHJ1bm5pbmcgaW4gYSBzbG93IFZpcnR1YWxCb3ggVk0uIFRoZXJlIGlzIG5vIHRlc3QgZm9yIHRoaXMgbGluZS5cblx0ZnJhbWUuZm9yY2VSZWZsb3coKTtcblxuXHQvLyBXT1JLQVJPVU5EIFNhZmFyaSA4LjAuMDogdGltZW91dCByZXF1aXJlZCBiZWNhdXNlIGZvbnQgaXMgZW5sYXJnZWQgYXN5bmNocm9ub3VzbHlcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHR2YXIgZm9udFNpemUgPSB0ZXh0LmdldFJhd1N0eWxlKFwiZm9udC1zaXplXCIpO1xuXHRcdGVuc3VyZS50aGF0KGZvbnRTaXplICE9PSBcIlwiLCBcIkV4cGVjdGVkIGZvbnQtc2l6ZSB0byBiZSBhIHZhbHVlXCIpO1xuXG5cdFx0Ly8gV09SS0FST1VORCBJRSA4OiBpZ25vcmVzIDxzdHlsZT4gdGFnIHdlIGFkZGVkIGFib3ZlXG5cdFx0aWYgKGZvbnRTaXplID09PSBcIjEycHRcIikgcmV0dXJuIGNhbGxiYWNrKGZhbHNlKTtcblxuXHRcdHJldHVybiBjYWxsYmFjayhmb250U2l6ZSAhPT0gXCIxNXB4XCIpO1xuXHR9LCAwKTtcbn1cbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNC0yMDE3IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3V0aWwvc2hpbS5qc1wiKTtcbnZhciBRRWxlbWVudCA9IHJlcXVpcmUoXCIuL3FfZWxlbWVudC5qc1wiKTtcbnZhciBRRWxlbWVudExpc3QgPSByZXF1aXJlKFwiLi9xX2VsZW1lbnRfbGlzdC5qc1wiKTtcbnZhciBRVmlld3BvcnQgPSByZXF1aXJlKFwiLi9xX3ZpZXdwb3J0LmpzXCIpO1xudmFyIFFQYWdlID0gcmVxdWlyZShcIi4vcV9wYWdlLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEJyb3dzaW5nQ29udGV4dChjb250ZW50RG9jdW1lbnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtPYmplY3RdKTtcblxuXHR0aGlzLmNvbnRlbnRXaW5kb3cgPSBjb250ZW50RG9jdW1lbnQuZGVmYXVsdFZpZXcgfHwgY29udGVudERvY3VtZW50LnBhcmVudFdpbmRvdztcblx0dGhpcy5jb250ZW50RG9jdW1lbnQgPSBjb250ZW50RG9jdW1lbnQ7XG59O1xuXG5NZS5wcm90b3R5cGUuYm9keSA9IGZ1bmN0aW9uIGJvZHkoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIG5ldyBRRWxlbWVudCh0aGlzLmNvbnRlbnREb2N1bWVudC5ib2R5LCBcImJvZHlcIik7XG59O1xuXG5NZS5wcm90b3R5cGUudmlld3BvcnQgPSBmdW5jdGlvbiB2aWV3cG9ydCgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gbmV3IFFWaWV3cG9ydCh0aGlzKTtcbn07XG5cbk1lLnByb3RvdHlwZS5wYWdlID0gZnVuY3Rpb24gcGFnZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRyZXR1cm4gbmV3IFFQYWdlKHRoaXMpO1xufTtcblxuTWUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChodG1sLCBuaWNrbmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW1N0cmluZywgW3VuZGVmaW5lZCwgU3RyaW5nXV0pO1xuXHRpZiAobmlja25hbWUgPT09IHVuZGVmaW5lZCkgbmlja25hbWUgPSBodG1sO1xuXG5cdHJldHVybiB0aGlzLmJvZHkoKS5hZGQoaHRtbCwgbmlja25hbWUpO1xufTtcblxuTWUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldChzZWxlY3Rvciwgbmlja25hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtTdHJpbmcsIFt1bmRlZmluZWQsIFN0cmluZ11dKTtcblx0aWYgKG5pY2tuYW1lID09PSB1bmRlZmluZWQpIG5pY2tuYW1lID0gc2VsZWN0b3I7XG5cblx0dmFyIG5vZGVzID0gdGhpcy5jb250ZW50RG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG5cdGVuc3VyZS50aGF0KG5vZGVzLmxlbmd0aCA9PT0gMSwgXCJFeHBlY3RlZCBvbmUgZWxlbWVudCB0byBtYXRjaCAnXCIgKyBzZWxlY3RvciArIFwiJywgYnV0IGZvdW5kIFwiICsgbm9kZXMubGVuZ3RoKTtcblx0cmV0dXJuIG5ldyBRRWxlbWVudChub2Rlc1swXSwgbmlja25hbWUpO1xufTtcblxuTWUucHJvdG90eXBlLmdldEFsbCA9IGZ1bmN0aW9uIGdldEFsbChzZWxlY3Rvciwgbmlja25hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtTdHJpbmcsIFt1bmRlZmluZWQsIFN0cmluZ11dKTtcblx0aWYgKG5pY2tuYW1lID09PSB1bmRlZmluZWQpIG5pY2tuYW1lID0gc2VsZWN0b3I7XG5cblx0cmV0dXJuIG5ldyBRRWxlbWVudExpc3QodGhpcy5jb250ZW50RG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvciksIG5pY2tuYW1lKTtcbn07XG5cbk1lLnByb3RvdHlwZS5zY3JvbGwgPSBmdW5jdGlvbiBzY3JvbGwoeCwgeSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW051bWJlciwgTnVtYmVyXSk7XG5cblx0dGhpcy5jb250ZW50V2luZG93LnNjcm9sbCh4LCB5KTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRSYXdTY3JvbGxQb3NpdGlvbiA9IGZ1bmN0aW9uIGdldFJhd1Njcm9sbFBvc2l0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiB7XG5cdFx0eDogc2hpbS5XaW5kb3cucGFnZVhPZmZzZXQodGhpcy5jb250ZW50V2luZG93LCB0aGlzLmNvbnRlbnREb2N1bWVudCksXG5cdFx0eTogc2hpbS5XaW5kb3cucGFnZVlPZmZzZXQodGhpcy5jb250ZW50V2luZG93LCB0aGlzLmNvbnRlbnREb2N1bWVudClcblx0fTtcbn07XG5cbi8vIFRoaXMgbWV0aG9kIGlzIG5vdCB0ZXN0ZWQtLWRvbid0IGtub3cgaG93LlxuTWUucHJvdG90eXBlLmZvcmNlUmVmbG93ID0gZnVuY3Rpb24gZm9yY2VSZWZsb3coKSB7XG5cdHRoaXMuYm9keSgpLnRvRG9tRWxlbWVudCgpLm9mZnNldFRvcDtcbn07XG5cbk1lLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiBlcXVhbHModGhhdCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW01lXSk7XG5cdHJldHVybiB0aGlzLmNvbnRlbnRXaW5kb3cgPT09IHRoYXQuY29udGVudFdpbmRvdztcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb25EZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vcG9zaXRpb25fZGVzY3JpcHRvci5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG5cbnZhciBYX0RJTUVOU0lPTiA9IFwieFwiO1xudmFyIFlfRElNRU5TSU9OID0gXCJ5XCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQWJzb2x1dGVQb3NpdGlvbihkaW1lbnNpb24sIHZhbHVlKSB7XG4gIGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZywgTnVtYmVyIF0pO1xuXG4gIHRoaXMuc2hvdWxkID0gdGhpcy5jcmVhdGVTaG91bGQoKTtcblxuICBzd2l0Y2goZGltZW5zaW9uKSB7XG5cdFx0Y2FzZSBYX0RJTUVOU0lPTjpcblx0XHRcdFBvc2l0aW9uRGVzY3JpcHRvci54KHRoaXMpO1xuXHRcdFx0dGhpcy5fdmFsdWUgPSBQb3NpdGlvbi54KHZhbHVlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgWV9ESU1FTlNJT046XG5cdFx0XHRQb3NpdGlvbkRlc2NyaXB0b3IueSh0aGlzKTtcblx0XHRcdHRoaXMuX3ZhbHVlID0gUG9zaXRpb24ueSh2YWx1ZSk7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OiBlbnN1cmUudW5yZWFjaGFibGUoXCJVbmtub3duIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuICB9XG4gIHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcbn07XG5Qb3NpdGlvbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUueCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE51bWJlciBdKTtcbiAgcmV0dXJuIG5ldyBNZShYX0RJTUVOU0lPTiwgdmFsdWUpO1xufTtcblxuTWUueSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE51bWJlciBdKTtcblx0cmV0dXJuIG5ldyBNZShZX0RJTUVOU0lPTiwgdmFsdWUpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl92YWx1ZTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fdmFsdWUgKyBcIiBcIiArIHRoaXMuX2RpbWVuc2lvbiArIFwiLWNvb3JkaW5hdGVcIjtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb25EZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vcG9zaXRpb25fZGVzY3JpcHRvci5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG52YXIgUmVsYXRpdmVQb3NpdGlvbiA9IHJlcXVpcmUoXCIuL3JlbGF0aXZlX3Bvc2l0aW9uLmpzXCIpO1xuXG52YXIgWF9ESU1FTlNJT04gPSBcInhcIjtcbnZhciBZX0RJTUVOU0lPTiA9IFwieVwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIENlbnRlcihkaW1lbnNpb24sIHBvc2l0aW9uMSwgcG9zaXRpb24yLCBkZXNjcmlwdGlvbikge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIFBvc2l0aW9uRGVzY3JpcHRvciwgUG9zaXRpb25EZXNjcmlwdG9yLCBTdHJpbmcgXSk7XG5cblx0dGhpcy5zaG91bGQgPSB0aGlzLmNyZWF0ZVNob3VsZCgpO1xuXHRcblx0aWYgKGRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIFBvc2l0aW9uRGVzY3JpcHRvci54KHRoaXMpO1xuXHRlbHNlIGlmIChkaW1lbnNpb24gPT09IFlfRElNRU5TSU9OKSBQb3NpdGlvbkRlc2NyaXB0b3IueSh0aGlzKTtcblx0ZWxzZSBlbnN1cmUudW5yZWFjaGFibGUoXCJVbmtub3duIGRpbWVuc2lvbjogXCIgKyBkaW1lbnNpb24pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fcG9zaXRpb24xID0gcG9zaXRpb24xO1xuXHR0aGlzLl9wb3NpdGlvbjIgPSBwb3NpdGlvbjI7XG5cdHRoaXMuX2Rlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XG59O1xuUG9zaXRpb25EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnggPSBmYWN0b3J5Rm4oWF9ESU1FTlNJT04pO1xuTWUueSA9IGZhY3RvcnlGbihZX0RJTUVOU0lPTik7XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fcG9zaXRpb24xLnZhbHVlKCkubWlkcG9pbnQodGhpcy5fcG9zaXRpb24yLnZhbHVlKCkpO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl9kZXNjcmlwdGlvbjtcbn07XG5cbmZ1bmN0aW9uIGZhY3RvcnlGbihkaW1lbnNpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHBvc2l0aW9uMSwgcG9zaXRpb24yLCBkZXNjcmlwdGlvbikge1xuXHRcdHJldHVybiBuZXcgTWUoZGltZW5zaW9uLCBwb3NpdGlvbjEsIHBvc2l0aW9uMiwgZGVzY3JpcHRpb24pO1xuXHR9O1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIG9vcCA9IHJlcXVpcmUoXCIuLi91dGlsL29vcC5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvdmFsdWUuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRGVzY3JpcHRvcigpIHtcblx0ZW5zdXJlLnVucmVhY2hhYmxlKFwiRGVzY3JpcHRvciBpcyBhYnN0cmFjdCBhbmQgc2hvdWxkIG5vdCBiZSBjb25zdHJ1Y3RlZCBkaXJlY3RseS5cIik7XG59O1xuTWUuZXh0ZW5kID0gb29wLmV4dGVuZEZuKE1lKTtcbm9vcC5tYWtlQWJzdHJhY3QoTWUsIFtcblx0XCJ2YWx1ZVwiLFxuXHRcInRvU3RyaW5nXCJcbl0pO1xuXG4vLyBXT1JLQVJPVU5EIElFIDg6IERvZXNuJ3Qgc3VwcG9ydCBPYmplY3QuZGVmaW5lUHJvcGVydHkoKSwgd2hpY2ggd291bGQgYWxsb3cgdXMgdG8gY3JlYXRlIE1lLnByb3RvdHlwZS5zaG91bGRcbi8vIGRpcmVjdGx5IG9uIHRoaXMgY2xhc3MgYXMgYW4gYWNjZXNzb3IgbWV0aG9kLlxuLy8gV09SS0FST1VORCBJRSAxMTogRG9lc24ndCBzdXBwb3J0IEVTNiAnY2xhc3MnIHN5bnRheCwgd2hpY2ggd291bGQgYWxsb3cgdXMgdG8gdXNlIGdldHRlciBtZXRob2RzIGFuZCBpbmhlcml0YW5jZS5cbk1lLnByb3RvdHlwZS5jcmVhdGVTaG91bGQgPSBmdW5jdGlvbiBjcmVhdGVBc3NlcnQoKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblx0cmV0dXJuIHtcblxuXHRcdGVxdWFsOiBmdW5jdGlvbihleHBlY3RlZCwgbWVzc2FnZSkge1xuXHRcdFx0c2VsZi5kb0Fzc2VydGlvbihleHBlY3RlZCwgbWVzc2FnZSwgZnVuY3Rpb24oYWN0dWFsVmFsdWUsIGV4cGVjdGVkVmFsdWUsIGV4cGVjdGVkRGVzYywgbWVzc2FnZSkge1xuXHRcdFx0XHR2YXIgZXF1YWxzID0gYWN0dWFsVmFsdWUuZXF1YWxzKGV4cGVjdGVkVmFsdWUpO1xuXHRcdFx0XHRpZiAoIWVxdWFscykge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHRcdG1lc3NhZ2UgKyBzZWxmICsgXCIgc2hvdWxkIGJlIFwiICsgZXhwZWN0ZWRWYWx1ZS5kaWZmKGFjdHVhbFZhbHVlKSArIFwiLlxcblwiICtcblx0XHRcdFx0XHRcdFwiICBFeHBlY3RlZDogXCIgKyBleHBlY3RlZERlc2MgKyBcIlxcblwiICtcblx0XHRcdFx0XHRcdFwiICBCdXQgd2FzOiAgXCIgKyBhY3R1YWxWYWx1ZVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHRub3RFcXVhbDogZnVuY3Rpb24oZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcblx0XHRcdHNlbGYuZG9Bc3NlcnRpb24oZXhwZWN0ZWQsIG1lc3NhZ2UsIGZ1bmN0aW9uKGFjdHVhbFZhbHVlLCBleHBlY3RlZFZhbHVlLCBleHBlY3RlZERlc2MsIG1lc3NhZ2UpIHtcblx0XHRcdFx0aWYgKGFjdHVhbFZhbHVlLmVxdWFscyhleHBlY3RlZFZhbHVlKSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHRcdG1lc3NhZ2UgKyBzZWxmICsgXCIgc2hvdWxkbid0IGJlIFwiICsgZXhwZWN0ZWRWYWx1ZSArIFwiLlxcblwiICtcblx0XHRcdFx0XHRcdFwiICBFeHBlY3RlZDogYW55dGhpbmcgYnV0IFwiICsgZXhwZWN0ZWREZXNjICsgXCJcXG5cIiArXG5cdFx0XHRcdFx0XHRcIiAgQnV0IHdhczogIFwiICsgYWN0dWFsVmFsdWVcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdH07XG59O1xuXG5NZS5wcm90b3R5cGUuZG9Bc3NlcnRpb24gPSBmdW5jdGlvbiBkb0Fzc2VydGlvbihleHBlY3RlZCwgbWVzc2FnZSwgYXNzZXJ0Rm4pIHtcblx0bWVzc2FnZSA9IG1lc3NhZ2UgPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBtZXNzYWdlICsgXCI6IFwiO1xuXHRleHBlY3RlZCA9IGNvbnZlcnRFeHBlY3RhdGlvbkZyb21QcmltaXRpdmVJZk5lZWRlZCh0aGlzLCBleHBlY3RlZCwgbWVzc2FnZSk7XG5cblx0dmFyIGFjdHVhbFZhbHVlO1xuXHR2YXIgZXhwZWN0ZWRWYWx1ZTtcblx0dHJ5IHtcblx0XHRhY3R1YWxWYWx1ZSA9IHRoaXMudmFsdWUoKTtcblx0XHRleHBlY3RlZFZhbHVlID0gZXhwZWN0ZWQudmFsdWUoKTtcblx0fVxuXHRjYXRjaCAoZXJyKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgY29tcGFyZSBcIiArIHRoaXMgKyBcIiB0byBcIiArIGV4cGVjdGVkICsgXCI6IFwiICsgZXJyLm1lc3NhZ2UpO1xuXHR9XG5cblx0aWYgKCFhY3R1YWxWYWx1ZS5pc0NvbXBhdGlibGVXaXRoKGV4cGVjdGVkVmFsdWUpKSB7XG5cdFx0dGhyb3dCYWRFeHBlY3RhdGlvbihcblx0XHRcdHRoaXMsIG9vcC5pbnN0YW5jZU5hbWUoZXhwZWN0ZWQpICsgXCIgKFwiICsgZXhwZWN0ZWQgKyBcIilcIiwgbWVzc2FnZSxcblx0XHRcdFwiQXR0ZW1wdGVkIHRvIGNvbXBhcmUgdHdvIGluY29tcGF0aWJsZSB0eXBlczpcIlxuXHRcdCk7XG5cdH1cblxuXHR2YXIgZXhwZWN0ZWREZXNjID0gZXhwZWN0ZWRWYWx1ZS50b1N0cmluZygpO1xuXHRpZiAoZXhwZWN0ZWQgaW5zdGFuY2VvZiBNZSkgZXhwZWN0ZWREZXNjICs9IFwiIChcIiArIGV4cGVjdGVkICsgXCIpXCI7XG5cblx0YXNzZXJ0Rm4oYWN0dWFsVmFsdWUsIGV4cGVjdGVkVmFsdWUsIGV4cGVjdGVkRGVzYywgbWVzc2FnZSk7XG59O1xuXG5cbk1lLnByb3RvdHlwZS5kaWZmID0gZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHQvLyBMZWdhY3kgY29kZSwgc3RyaWN0bHkgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBkZXByZWNhdGVkIEFzc2VydGFibGUuZXF1YWxzKCkgYW5kIEFzc2VydGFibGUuZGlmZigpIG1ldGhvZHMuXG5cdC8vIEl0J3Mgd2VpcmQgYmVjYXVzZSB3ZSBtb3ZlZCB0byBzaG91bGQuZXF1YWxzKCksIHdoaWNoIGFsd2F5cyB0aHJvd3MgYW4gZXhjZXB0aW9uLCBidXQgZGlmZiByZXR1cm5zIGEgc3RyaW5nLlxuXHQvLyBUbyBhdm9pZCBkdXBsaWNhdGluZyBjb21wbGV4IGxvZ2ljLCB3ZSBjYWxsIHNob3VsZC5lcXVhbHMoKSBhbmQgdGhlbiB1bndyYXAgdGhlIGV4Y2VwdGlvbiwgYnV0IG9ubHkgaWYgaXQnc1xuXHQvLyB0aGUgcmlnaHQga2luZCBvZiBleGNlcHRpb24uXG5cdHRyeSB7XG5cdFx0dGhpcy5zaG91bGQuZXF1YWwoZXhwZWN0ZWQpO1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cdGNhdGNoIChlcnIpIHtcblx0XHR2YXIgbWVzc2FnZSA9IGVyci5tZXNzYWdlO1xuXHRcdGlmIChtZXNzYWdlLmluZGV4T2YoXCJCdXQgd2FzOlwiKSA9PT0gLTEpIHRocm93IGVycjsgICAgLy8gaXQncyBub3QgYW4gYXNzZXJ0aW9uIGVycm9yLCBpdCdzIHNvbWUgb3RoZXIgZXhjZXB0aW9uXG5cdFx0cmV0dXJuIG1lc3NhZ2U7XG5cdH1cbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0Ly8gVGhpcyBtZXRob2QgaXMgbWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBieSBzdWJjbGFzc2VzLiBJdCBzaG91bGQgcmV0dXJuICd1bmRlZmluZWQnIHdoZW4gYW4gYXJndW1lbnRcblx0Ly8gY2FuJ3QgYmUgY29udmVydGVkLiBJbiB0aGlzIGRlZmF1bHQgaW1wbGVtZW50YXRpb24sIG5vIGFyZ3VtZW50cyBjYW4gYmUgY29udmVydGVkLCBzbyB3ZSBhbHdheXNcblx0Ly8gcmV0dXJuICd1bmRlZmluZWQnLlxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyh0aGF0KSB7XG5cdC8vIERlc2NyaXB0b3JzIGFyZW4ndCB2YWx1ZSBvYmplY3RzLiBUaGV5J3JlIG5ldmVyIGVxdWFsIHRvIGFueXRoaW5nLiBCdXQgc29tZXRpbWVzXG5cdC8vIHRoZXkncmUgdXNlZCBpbiB0aGUgc2FtZSBwbGFjZXMgdmFsdWUgb2JqZWN0cyBhcmUgdXNlZCwgYW5kIHRoZW4gdGhpcyBtZXRob2QgZ2V0cyBjYWxsZWQuXG5cdHJldHVybiBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIGNvbnZlcnRFeHBlY3RhdGlvbkZyb21QcmltaXRpdmVJZk5lZWRlZChzZWxmLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuXHR2YXIgZXhwZWN0ZWRUeXBlID0gdHlwZW9mIGV4cGVjdGVkO1xuXHRpZiAoZXhwZWN0ZWQgPT09IG51bGwpIGV4cGVjdGVkVHlwZSA9IFwibnVsbFwiO1xuXG5cdGlmIChleHBlY3RlZFR5cGUgPT09IFwib2JqZWN0XCIgJiYgKGV4cGVjdGVkIGluc3RhbmNlb2YgTWUpKSByZXR1cm4gZXhwZWN0ZWQ7XG5cblx0aWYgKGV4cGVjdGVkID09PSB1bmRlZmluZWQpIHtcblx0XHR0aHJvd0JhZEV4cGVjdGF0aW9uKFxuXHRcdFx0c2VsZiwgXCJ1bmRlZmluZWRcIiwgbWVzc2FnZSxcblx0XHRcdFwiVGhlICdleHBlY3RlZCcgcGFyYW1ldGVyIGlzIHVuZGVmaW5lZC4gRGlkIHlvdSBtaXNzcGVsbCBhIHByb3BlcnR5IG5hbWU/XCJcblx0XHQpO1xuXHR9XG5cdGVsc2UgaWYgKGV4cGVjdGVkVHlwZSA9PT0gXCJvYmplY3RcIikge1xuXHRcdHRocm93QmFkRXhwZWN0YXRpb24oXG5cdFx0XHRzZWxmLCBvb3AuaW5zdGFuY2VOYW1lKGV4cGVjdGVkKSwgbWVzc2FnZSxcblx0XHRcdFwiVGhlICdleHBlY3RlZCcgcGFyYW1ldGVyIHNob3VsZCBiZSBhIGRlc2NyaXB0b3IsIGJ1dCBpdCB3YXNuJ3QgcmVjb2duaXplZC5cIlxuXHRcdCk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0dmFyIGNvbnZlcnRlZCA9IHNlbGYuY29udmVydChleHBlY3RlZCwgZXhwZWN0ZWRUeXBlKTtcblx0XHRpZiAoY29udmVydGVkICE9PSB1bmRlZmluZWQpIHJldHVybiBjb252ZXJ0ZWQ7XG5cblx0XHR0aHJvd0JhZEV4cGVjdGF0aW9uKFxuXHRcdFx0c2VsZiwgZXhwZWN0ZWRUeXBlLCBtZXNzYWdlLFxuXHRcdFx0XCJUaGUgJ2V4cGVjdGVkJyBwcmltaXRpdmUgaXNuJ3QgZXF1aXZhbGVudCB0byB0aGUgJ2FjdHVhbCcgZGVzY3JpcHRvci5cIlxuXHRcdCk7XG5cdH1cblxufVxuXG5mdW5jdGlvbiB0aHJvd0JhZEV4cGVjdGF0aW9uKHNlbGYsIGV4cGVjdGVkVHlwZSwgbWVzc2FnZSwgaGVhZGxpbmUpIHtcblx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdG1lc3NhZ2UgKyBcIkVycm9yIGluIHRlc3QuIFVzZSBhIGRpZmZlcmVudCAnZXhwZWN0ZWQnIHBhcmFtZXRlci5cXG5cIiArXG5cdFx0aGVhZGxpbmUgKyBcIlxcblwiICtcblx0XHRcIiAgJ2FjdHVhbCcgdHlwZTogICBcIiArIG9vcC5pbnN0YW5jZU5hbWUoc2VsZikgKyBcIiAoXCIgKyBzZWxmICsgXCIpXFxuXCIgK1xuXHRcdFwiICAnZXhwZWN0ZWQnIHR5cGU6IFwiICsgZXhwZWN0ZWRUeXBlXG5cdCk7XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xudmFyIFBvc2l0aW9uRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL3Bvc2l0aW9uX2Rlc2NyaXB0b3IuanNcIik7XG5cbnZhciBUT1AgPSBcInRvcFwiO1xudmFyIFJJR0hUID0gXCJyaWdodFwiO1xudmFyIEJPVFRPTSA9IFwiYm90dG9tXCI7XG52YXIgTEVGVCA9IFwibGVmdFwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEVsZW1lbnRFZGdlKGVsZW1lbnQsIHBvc2l0aW9uKSB7XG5cdHZhciBRRWxlbWVudCA9IHJlcXVpcmUoXCIuLi9xX2VsZW1lbnQuanNcIik7ICAgICAgLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW1FFbGVtZW50LCBTdHJpbmddKTtcblxuXHR0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cblx0aWYgKHBvc2l0aW9uID09PSBMRUZUIHx8IHBvc2l0aW9uID09PSBSSUdIVCkgUG9zaXRpb25EZXNjcmlwdG9yLngodGhpcyk7XG5cdGVsc2UgaWYgKHBvc2l0aW9uID09PSBUT1AgfHwgcG9zaXRpb24gPT09IEJPVFRPTSkgUG9zaXRpb25EZXNjcmlwdG9yLnkodGhpcyk7XG5cdGVsc2UgZW5zdXJlLnVucmVhY2hhYmxlKFwiVW5rbm93biBwb3NpdGlvbjogXCIgKyBwb3NpdGlvbik7XG5cblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG5cdHRoaXMuX3Bvc2l0aW9uID0gcG9zaXRpb247XG59O1xuUG9zaXRpb25EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnRvcCA9IGZhY3RvcnlGbihUT1ApO1xuTWUucmlnaHQgPSBmYWN0b3J5Rm4oUklHSFQpO1xuTWUuYm90dG9tID0gZmFjdG9yeUZuKEJPVFRPTSk7XG5NZS5sZWZ0ID0gZmFjdG9yeUZuKExFRlQpO1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgcmF3UG9zaXRpb24gPSB0aGlzLl9lbGVtZW50LmdldFJhd1Bvc2l0aW9uKCk7XG5cdHZhciBlZGdlID0gcmF3UG9zaXRpb25bdGhpcy5fcG9zaXRpb25dO1xuXG5cdHZhciBzY3JvbGwgPSB0aGlzLl9lbGVtZW50LmNvbnRleHQoKS5nZXRSYXdTY3JvbGxQb3NpdGlvbigpO1xuXHR2YXIgcmVuZGVyZWQgPSBlbGVtZW50UmVuZGVyZWQodGhpcy5fZWxlbWVudCk7XG5cblx0aWYgKHRoaXMuX3Bvc2l0aW9uID09PSBSSUdIVCB8fCB0aGlzLl9wb3NpdGlvbiA9PT0gTEVGVCkge1xuXHRcdGlmICghcmVuZGVyZWQpIHJldHVybiBQb3NpdGlvbi5ub1goKTtcblx0XHRyZXR1cm4gUG9zaXRpb24ueChlZGdlICsgc2Nyb2xsLngpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdGlmICghcmVuZGVyZWQpIHJldHVybiBQb3NpdGlvbi5ub1koKTtcblx0XHRyZXR1cm4gUG9zaXRpb24ueShlZGdlICsgc2Nyb2xsLnkpO1xuXHR9XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX3Bvc2l0aW9uICsgXCIgZWRnZSBvZiBcIiArIHRoaXMuX2VsZW1lbnQ7XG59O1xuXG5mdW5jdGlvbiBmYWN0b3J5Rm4ocG9zaXRpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkoZWxlbWVudCkge1xuXHRcdHJldHVybiBuZXcgTWUoZWxlbWVudCwgcG9zaXRpb24pO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBlbGVtZW50UmVuZGVyZWQoZWxlbWVudCkge1xuXHR2YXIgaW5Eb20gPSBlbGVtZW50LmNvbnRleHQoKS5ib2R5KCkuY29udGFpbnMoZWxlbWVudCk7XG5cdHZhciBkaXNwbGF5Tm9uZSA9IGVsZW1lbnQuZ2V0UmF3U3R5bGUoXCJkaXNwbGF5XCIpID09PSBcIm5vbmVcIjtcblxuXHRyZXR1cm4gaW5Eb20gJiYgIWRpc3BsYXlOb25lO1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE2LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUmVuZGVyU3RhdGUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3JlbmRlcl9zdGF0ZS5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgRWxlbWVudFJlbmRlcmVkRWRnZSA9IHJlcXVpcmUoXCIuL2VsZW1lbnRfcmVuZGVyZWRfZWRnZS5qc1wiKTtcbnZhciBHZW5lcmljU2l6ZSA9IHJlcXVpcmUoXCIuL2dlbmVyaWNfc2l6ZS5qc1wiKTtcbnZhciBDZW50ZXIgPSByZXF1aXJlKFwiLi9jZW50ZXIuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRWxlbWVudFJlbmRlcmVkKGVsZW1lbnQpIHtcblx0dmFyIFFFbGVtZW50ID0gcmVxdWlyZShcIi4uL3FfZWxlbWVudC5qc1wiKTsgICAgICAvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFFFbGVtZW50IF0pO1xuXG5cdHRoaXMuc2hvdWxkID0gdGhpcy5jcmVhdGVTaG91bGQoKTtcblx0dGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG5cblx0Ly8gcHJvcGVydGllc1xuXHR0aGlzLnRvcCA9IEVsZW1lbnRSZW5kZXJlZEVkZ2UudG9wKGVsZW1lbnQpO1xuXHR0aGlzLnJpZ2h0ID0gRWxlbWVudFJlbmRlcmVkRWRnZS5yaWdodChlbGVtZW50KTtcblx0dGhpcy5ib3R0b20gPSBFbGVtZW50UmVuZGVyZWRFZGdlLmJvdHRvbShlbGVtZW50KTtcblx0dGhpcy5sZWZ0ID0gRWxlbWVudFJlbmRlcmVkRWRnZS5sZWZ0KGVsZW1lbnQpO1xuXG5cdHRoaXMud2lkdGggPSBHZW5lcmljU2l6ZS5jcmVhdGUodGhpcy5sZWZ0LCB0aGlzLnJpZ2h0LCBcInJlbmRlcmVkIHdpZHRoIG9mIFwiICsgZWxlbWVudCk7XG5cdHRoaXMuaGVpZ2h0ID0gR2VuZXJpY1NpemUuY3JlYXRlKHRoaXMudG9wLCB0aGlzLmJvdHRvbSwgXCJyZW5kZXJlZCBoZWlnaHQgb2YgXCIgKyBlbGVtZW50KTtcblxuXHR0aGlzLmNlbnRlciA9IENlbnRlci54KHRoaXMubGVmdCwgdGhpcy5yaWdodCwgXCJyZW5kZXJlZCBjZW50ZXIgb2YgXCIgKyBlbGVtZW50KTtcblx0dGhpcy5taWRkbGUgPSBDZW50ZXIueSh0aGlzLnRvcCwgdGhpcy5ib3R0b20sIFwicmVuZGVyZWQgbWlkZGxlIG9mIFwiICsgZWxlbWVudCk7XG59O1xuRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoZWxlbWVudCkge1xuXHRyZXR1cm4gbmV3IE1lKGVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGlmICh0aGlzLnRvcC52YWx1ZSgpLmVxdWFscyhQb3NpdGlvbi5ub1koKSkpIHJldHVybiBSZW5kZXJTdGF0ZS5ub3RSZW5kZXJlZCgpO1xuXHRlbHNlIHJldHVybiBSZW5kZXJTdGF0ZS5yZW5kZXJlZCgpO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdHJldHVybiB0aGlzLl9lbGVtZW50LnRvU3RyaW5nKCk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoYXJnLCB0eXBlKSB7XG5cdGlmICh0eXBlID09PSBcImJvb2xlYW5cIikge1xuXHRcdHJldHVybiBhcmcgPyBSZW5kZXJTdGF0ZS5yZW5kZXJlZCgpIDogUmVuZGVyU3RhdGUubm90UmVuZGVyZWQoKTtcblx0fVxufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNyBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBxdWl4b3RlID0gcmVxdWlyZShcIi4uL3F1aXhvdGUuanNcIik7XG52YXIgUG9zaXRpb25EZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vcG9zaXRpb25fZGVzY3JpcHRvci5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG52YXIgUVBhZ2UgPSByZXF1aXJlKFwiLi4vcV9wYWdlLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG5cbnZhciBUT1AgPSBcInRvcFwiO1xudmFyIFJJR0hUID0gXCJyaWdodFwiO1xudmFyIEJPVFRPTSA9IFwiYm90dG9tXCI7XG52YXIgTEVGVCA9IFwibGVmdFwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEVsZW1lbnRWaXNpYmxlRWRnZShlbGVtZW50LCBwb3NpdGlvbikge1xuXHR2YXIgUUVsZW1lbnQgPSByZXF1aXJlKFwiLi4vcV9lbGVtZW50LmpzXCIpOyAgICAgIC8vIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY3lcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgUUVsZW1lbnQsIFN0cmluZyBdKTtcblxuXHR0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cblx0aWYgKHBvc2l0aW9uID09PSBMRUZUIHx8IHBvc2l0aW9uID09PSBSSUdIVCkgUG9zaXRpb25EZXNjcmlwdG9yLngodGhpcyk7XG5cdGVsc2UgaWYgKHBvc2l0aW9uID09PSBUT1AgfHwgcG9zaXRpb24gPT09IEJPVFRPTSkgUG9zaXRpb25EZXNjcmlwdG9yLnkodGhpcyk7XG5cdGVsc2UgdW5rbm93blBvc2l0aW9uKHBvc2l0aW9uKTtcblxuXHR0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcblx0dGhpcy5fcG9zaXRpb24gPSBwb3NpdGlvbjtcbn07XG5Qb3NpdGlvbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUudG9wID0gZmFjdG9yeUZuKFRPUCk7XG5NZS5yaWdodCA9IGZhY3RvcnlGbihSSUdIVCk7XG5NZS5ib3R0b20gPSBmYWN0b3J5Rm4oQk9UVE9NKTtcbk1lLmxlZnQgPSBmYWN0b3J5Rm4oTEVGVCk7XG5cbmZ1bmN0aW9uIGZhY3RvcnlGbihwb3NpdGlvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gZmFjdG9yeShlbGVtZW50KSB7XG5cdFx0cmV0dXJuIG5ldyBNZShlbGVtZW50LCBwb3NpdGlvbik7XG5cdH07XG59XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fcG9zaXRpb24gKyBcIiByZW5kZXJlZCBlZGdlIG9mIFwiICsgdGhpcy5fZWxlbWVudDtcbn07XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgcG9zaXRpb24gPSB0aGlzLl9wb3NpdGlvbjtcblx0dmFyIGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50O1xuXHR2YXIgcGFnZSA9IGVsZW1lbnQuY29udGV4dCgpLnBhZ2UoKTtcblxuXHRpZiAoZWxlbWVudC50b3AudmFsdWUoKS5lcXVhbHMoUG9zaXRpb24ubm9ZKCkpKSByZXR1cm4gbm90UmVuZGVyZWQocG9zaXRpb24pO1xuXHRpZiAoZWxlbWVudC53aWR0aC52YWx1ZSgpLmVxdWFscyhTaXplLmNyZWF0ZSgwKSkpIHJldHVybiBub3RSZW5kZXJlZChwb3NpdGlvbik7XG5cdGlmIChlbGVtZW50LmhlaWdodC52YWx1ZSgpLmVxdWFscyhTaXplLmNyZWF0ZSgwKSkpIHJldHVybiBub3RSZW5kZXJlZChwb3NpdGlvbik7XG5cblx0ZW5zdXJlLnRoYXQoXG5cdFx0IWhhc0NsaXBQYXRoUHJvcGVydHkoZWxlbWVudCksXG5cdFx0XCJDYW4ndCBkZXRlY3QgZWxlbWVudCBjbGlwcGluZyBib3VuZGFyaWVzIHdoZW4gJ2NsaXAtcGF0aCcgcHJvcGVydHkgaXMgdXNlZC5cIlxuXHQpO1xuXG5cdHZhciBib3VuZHMgPSB7XG5cdFx0dG9wOiBwYWdlLnRvcC52YWx1ZSgpLFxuXHRcdHJpZ2h0OiBudWxsLFxuXHRcdGJvdHRvbTogbnVsbCxcblx0XHRsZWZ0OiBwYWdlLmxlZnQudmFsdWUoKVxuXHR9O1xuXG5cdGJvdW5kcyA9IGludGVyc2VjdGlvbldpdGhPdmVyZmxvdyhlbGVtZW50LCBib3VuZHMpO1xuXHRib3VuZHMgPSBpbnRlcnNlY3Rpb25XaXRoQ2xpcChlbGVtZW50LCBib3VuZHMpO1xuXG5cdHZhciBlZGdlcyA9IGludGVyc2VjdGlvbihcblx0XHRib3VuZHMsXG5cdFx0ZWxlbWVudC50b3AudmFsdWUoKSxcblx0XHRlbGVtZW50LnJpZ2h0LnZhbHVlKCksXG5cdFx0ZWxlbWVudC5ib3R0b20udmFsdWUoKSxcblx0XHRlbGVtZW50LmxlZnQudmFsdWUoKVxuXHQpO1xuXG5cdGlmIChpc0NsaXBwZWRPdXRPZkV4aXN0ZW5jZShib3VuZHMsIGVkZ2VzKSkgcmV0dXJuIG5vdFJlbmRlcmVkKHBvc2l0aW9uKTtcblx0ZWxzZSByZXR1cm4gZWRnZShlZGdlcywgcG9zaXRpb24pO1xufTtcblxuZnVuY3Rpb24gaGFzQ2xpcFBhdGhQcm9wZXJ0eShlbGVtZW50KSB7XG5cdHZhciBjbGlwUGF0aCA9IGVsZW1lbnQuZ2V0UmF3U3R5bGUoXCJjbGlwLXBhdGhcIik7XG5cdHJldHVybiBjbGlwUGF0aCAhPT0gXCJub25lXCIgJiYgY2xpcFBhdGggIT09IFwiXCI7XG59XG5cbmZ1bmN0aW9uIGludGVyc2VjdGlvbldpdGhPdmVyZmxvdyhlbGVtZW50LCBib3VuZHMpIHtcblx0Zm9yICh2YXIgY29udGFpbmVyID0gZWxlbWVudC5wYXJlbnQoKTsgY29udGFpbmVyICE9PSBudWxsOyBjb250YWluZXIgPSBjb250YWluZXIucGFyZW50KCkpIHtcblx0XHRpZiAoaXNDbGlwcGVkQnlBbmNlc3Rvck92ZXJmbG93KGVsZW1lbnQsIGNvbnRhaW5lcikpIHtcblx0XHRcdGJvdW5kcyA9IGludGVyc2VjdGlvbihcblx0XHRcdFx0Ym91bmRzLFxuXHRcdFx0XHRjb250YWluZXIudG9wLnZhbHVlKCksXG5cdFx0XHRcdGNvbnRhaW5lci5yaWdodC52YWx1ZSgpLFxuXHRcdFx0XHRjb250YWluZXIuYm90dG9tLnZhbHVlKCksXG5cdFx0XHRcdGNvbnRhaW5lci5sZWZ0LnZhbHVlKClcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGJvdW5kcztcbn1cblxuZnVuY3Rpb24gaW50ZXJzZWN0aW9uV2l0aENsaXAoZWxlbWVudCwgYm91bmRzKSB7XG5cdC8vIFdPUktBUk9VTkQgSUUgODogRG9lc24ndCBoYXZlIGFueSB3YXkgdG8gZGV0ZWN0ICdjbGlwOiBhdXRvJyB2YWx1ZS5cblx0ZW5zdXJlLnRoYXQoIXF1aXhvdGUuYnJvd3Nlci5taXNyZXBvcnRzQ2xpcEF1dG9Qcm9wZXJ0eSgpLFxuXHRcdFwiQ2FuJ3QgZGV0ZXJtaW5lIGVsZW1lbnQgY2xpcHBpbmcgdmFsdWVzIG9uIHRoaXMgYnJvd3NlciBiZWNhdXNlIGl0IG1pc3JlcG9ydHMgdGhlIHZhbHVlIG9mIHRoZVwiICtcblx0XHRcIiBgY2xpcDogYXV0b2AgcHJvcGVydHkuIFlvdSBjYW4gdXNlIGBxdWl4b3RlLmJyb3dzZXIubWlzcmVwb3J0c0NsaXBBdXRvUHJvcGVydHkoKWAgdG8gc2tpcCB0aGlzIGJyb3dzZXIuXCJcblx0KTtcblxuXHRmb3IgKCA7IGVsZW1lbnQgIT09IG51bGw7IGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudCgpKSB7XG5cdFx0dmFyIGNsaXAgPSBlbGVtZW50LmdldFJhd1N0eWxlKFwiY2xpcFwiKTtcblx0XHRpZiAoY2xpcCA9PT0gXCJhdXRvXCIgfHwgIWNhbkJlQ2xpcHBlZEJ5Q2xpcFByb3BlcnR5KGVsZW1lbnQpKSBjb250aW51ZTtcblxuXHRcdHZhciBjbGlwRWRnZXMgPSBub3JtYWxpemVDbGlwUHJvcGVydHkoZWxlbWVudCwgY2xpcCk7XG5cdFx0Ym91bmRzID0gaW50ZXJzZWN0aW9uKFxuXHRcdFx0Ym91bmRzLFxuXHRcdFx0Y2xpcEVkZ2VzLnRvcCxcblx0XHRcdGNsaXBFZGdlcy5yaWdodCxcblx0XHRcdGNsaXBFZGdlcy5ib3R0b20sXG5cdFx0XHRjbGlwRWRnZXMubGVmdFxuXHRcdCk7XG5cdH1cblxuXHRyZXR1cm4gYm91bmRzO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVDbGlwUHJvcGVydHkoZWxlbWVudCwgY2xpcCkge1xuXHR2YXIgY2xpcFZhbHVlcyA9IHBhcnNlQ2xpcFByb3BlcnR5KGVsZW1lbnQsIGNsaXApO1xuXG5cdHJldHVybiB7XG5cdFx0dG9wOiBjbGlwVmFsdWVzWzBdID09PSBcImF1dG9cIiA/XG5cdFx0XHRlbGVtZW50LnRvcC52YWx1ZSgpIDpcblx0XHRcdGVsZW1lbnQudG9wLnZhbHVlKCkucGx1cyhQb3NpdGlvbi55KE51bWJlcihjbGlwVmFsdWVzWzBdKSkpLFxuXHRcdHJpZ2h0OiBjbGlwVmFsdWVzWzFdID09PSBcImF1dG9cIiA/XG5cdFx0XHRlbGVtZW50LnJpZ2h0LnZhbHVlKCkgOlxuXHRcdFx0ZWxlbWVudC5sZWZ0LnZhbHVlKCkucGx1cyhQb3NpdGlvbi54KE51bWJlcihjbGlwVmFsdWVzWzFdKSkpLFxuXHRcdGJvdHRvbTogY2xpcFZhbHVlc1syXSA9PT0gXCJhdXRvXCIgP1xuXHRcdFx0ZWxlbWVudC5ib3R0b20udmFsdWUoKSA6XG5cdFx0XHRlbGVtZW50LnRvcC52YWx1ZSgpLnBsdXMoUG9zaXRpb24ueShOdW1iZXIoY2xpcFZhbHVlc1syXSkpKSxcblx0XHRsZWZ0OiBjbGlwVmFsdWVzWzNdID09PSBcImF1dG9cIiA/XG5cdFx0XHRlbGVtZW50LmxlZnQudmFsdWUoKSA6XG5cdFx0XHRlbGVtZW50LmxlZnQudmFsdWUoKS5wbHVzKFBvc2l0aW9uLngoTnVtYmVyKGNsaXBWYWx1ZXNbM10pKSlcblx0fTtcblxuXHRmdW5jdGlvbiBwYXJzZUNsaXBQcm9wZXJ0eShlbGVtZW50LCBjbGlwKSB7XG5cdFx0Ly8gV09SS0FST1VORCBJRSAxMSwgQ2hyb21lIE1vYmlsZSA0NDogUmVwb3J0cyAwcHggaW5zdGVhZCBvZiAnYXV0bycgd2hlbiBjb21wdXRpbmcgcmVjdCgpIGluIGNsaXAgcHJvcGVydHkuXG5cdFx0ZW5zdXJlLnRoYXQoIXF1aXhvdGUuYnJvd3Nlci5taXNyZXBvcnRzQXV0b1ZhbHVlc0luQ2xpcFByb3BlcnR5KCksXG5cdFx0XHRcIkNhbid0IGRldGVybWluZSBlbGVtZW50IGNsaXBwaW5nIHZhbHVlcyBvbiB0aGlzIGJyb3dzZXIgYmVjYXVzZSBpdCBtaXNyZXBvcnRzIHRoZSB2YWx1ZSBvZiB0aGUgYGNsaXBgXCIgK1xuXHRcdFx0XCIgcHJvcGVydHkuIFlvdSBjYW4gdXNlIGBxdWl4b3RlLmJyb3dzZXIubWlzcmVwb3J0c0F1dG9WYWx1ZXNJbkNsaXBQcm9wZXJ0eSgpYCB0byBza2lwIHRoaXMgYnJvd3Nlci5cIlxuXHRcdCk7XG5cblx0XHR2YXIgY2xpcFJlZ2V4ID0gL3JlY3RcXCgoLio/KSw/ICguKj8pLD8gKC4qPyksPyAoLio/KVxcKS87XG5cdFx0dmFyIG1hdGNoZXMgPSBjbGlwUmVnZXguZXhlYyhjbGlwKTtcblx0XHRlbnN1cmUudGhhdChtYXRjaGVzICE9PSBudWxsLCBcIlVuYWJsZSB0byBwYXJzZSBjbGlwIHByb3BlcnR5OiBcIiArIGNsaXApO1xuXG5cdFx0cmV0dXJuIFtcblx0XHRcdHBhcnNlTGVuZ3RoKG1hdGNoZXNbMV0sIGNsaXApLFxuXHRcdFx0cGFyc2VMZW5ndGgobWF0Y2hlc1syXSwgY2xpcCksXG5cdFx0XHRwYXJzZUxlbmd0aChtYXRjaGVzWzNdLCBjbGlwKSxcblx0XHRcdHBhcnNlTGVuZ3RoKG1hdGNoZXNbNF0sIGNsaXApXG5cdFx0XTtcblx0fVxuXG5cdGZ1bmN0aW9uIHBhcnNlTGVuZ3RoKHB4U3RyaW5nLCBjbGlwKSB7XG5cdFx0aWYgKHB4U3RyaW5nID09PSBcImF1dG9cIikgcmV0dXJuIHB4U3RyaW5nO1xuXG5cdFx0dmFyIHB4UmVnZXggPSAvXiguKj8pcHgkLztcblx0XHR2YXIgbWF0Y2hlcyA9IHB4UmVnZXguZXhlYyhweFN0cmluZyk7XG5cdFx0ZW5zdXJlLnRoYXQobWF0Y2hlcyAhPT0gbnVsbCwgXCJVbmFibGUgdG8gcGFyc2UgJ1wiICsgcHhTdHJpbmcgKyBcIicgaW4gY2xpcCBwcm9wZXJ0eTogXCIgKyBjbGlwKTtcblxuXHRcdHJldHVybiBtYXRjaGVzWzFdO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGlzQ2xpcHBlZEJ5QW5jZXN0b3JPdmVyZmxvdyhlbGVtZW50LCBhbmNlc3Rvcikge1xuXHRyZXR1cm4gY2FuQmVDbGlwcGVkQnlPdmVyZmxvd1Byb3BlcnR5KGVsZW1lbnQpICYmIGhhc0NsaXBwaW5nT3ZlcmZsb3coYW5jZXN0b3IpO1xufVxuXG5mdW5jdGlvbiBjYW5CZUNsaXBwZWRCeU92ZXJmbG93UHJvcGVydHkoZWxlbWVudCkge1xuXHR2YXIgcG9zaXRpb24gPSBlbGVtZW50LmdldFJhd1N0eWxlKFwicG9zaXRpb25cIik7XG5cdHN3aXRjaCAocG9zaXRpb24pIHtcblx0XHRjYXNlIFwic3RhdGljXCI6XG5cdFx0Y2FzZSBcInJlbGF0aXZlXCI6XG5cdFx0Y2FzZSBcImFic29sdXRlXCI6XG5cdFx0Y2FzZSBcInN0aWNreVwiOlxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0Y2FzZSBcImZpeGVkXCI6XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGVuc3VyZS51bnJlYWNoYWJsZShcIlVua25vd24gcG9zaXRpb24gcHJvcGVydHk6IFwiICsgcG9zaXRpb24pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGhhc0NsaXBwaW5nT3ZlcmZsb3coZWxlbWVudCkge1xuXHRyZXR1cm4gY2xpcHMoXCJvdmVyZmxvdy14XCIpIHx8IGNsaXBzKFwib3ZlcmZsb3cteVwiKTtcblxuXHRmdW5jdGlvbiBjbGlwcyhzdHlsZSkge1xuXHRcdHZhciBvdmVyZmxvdyA9IGVsZW1lbnQuZ2V0UmF3U3R5bGUoc3R5bGUpO1xuXHRcdHN3aXRjaCAob3ZlcmZsb3cpIHtcblx0XHRcdGNhc2UgXCJoaWRkZW5cIjpcblx0XHRcdGNhc2UgXCJzY3JvbGxcIjpcblx0XHRcdGNhc2UgXCJhdXRvXCI6XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0Y2FzZSBcInZpc2libGVcIjpcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0ZW5zdXJlLnVucmVhY2hhYmxlKFwiVW5rbm93biBcIiArIHN0eWxlICsgXCIgcHJvcGVydHk6IFwiICsgb3ZlcmZsb3cpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBjYW5CZUNsaXBwZWRCeUNsaXBQcm9wZXJ0eShlbGVtZW50KSB7XG5cdHZhciBwb3NpdGlvbiA9IGVsZW1lbnQuZ2V0UmF3U3R5bGUoXCJwb3NpdGlvblwiKTtcblx0c3dpdGNoIChwb3NpdGlvbikge1xuXHRcdGNhc2UgXCJhYnNvbHV0ZVwiOlxuXHRcdGNhc2UgXCJmaXhlZFwiOlxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0Y2FzZSBcInN0YXRpY1wiOlxuXHRcdGNhc2UgXCJyZWxhdGl2ZVwiOlxuXHRcdGNhc2UgXCJzdGlja3lcIjpcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0ZW5zdXJlLnVucmVhY2hhYmxlKFwiVW5rbm93biBwb3NpdGlvbiBwcm9wZXJ0eTogXCIgKyBwb3NpdGlvbik7XG5cdH1cbn1cblxuZnVuY3Rpb24gaW50ZXJzZWN0aW9uKGJvdW5kcywgdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0KSB7XG5cdGJvdW5kcy50b3AgPSBib3VuZHMudG9wLm1heCh0b3ApO1xuXHRib3VuZHMucmlnaHQgPSAoYm91bmRzLnJpZ2h0ID09PSBudWxsKSA/IHJpZ2h0IDogYm91bmRzLnJpZ2h0Lm1pbihyaWdodCk7XG5cdGJvdW5kcy5ib3R0b20gPSAoYm91bmRzLmJvdHRvbSA9PT0gbnVsbCkgPyBib3R0b20gOiBib3VuZHMuYm90dG9tLm1pbihib3R0b20pO1xuXHRib3VuZHMubGVmdCA9IGJvdW5kcy5sZWZ0Lm1heChsZWZ0KTtcblxuXHRyZXR1cm4gYm91bmRzO1xufVxuXG5mdW5jdGlvbiBpc0NsaXBwZWRPdXRPZkV4aXN0ZW5jZShib3VuZHMsIGVkZ2VzKSB7XG5cdHJldHVybiAoYm91bmRzLnRvcC5jb21wYXJlKGVkZ2VzLmJvdHRvbSkgPj0gMCkgfHxcblx0XHQoYm91bmRzLnJpZ2h0ICE9PSBudWxsICYmIGJvdW5kcy5yaWdodC5jb21wYXJlKGVkZ2VzLmxlZnQpIDw9IDApIHx8XG5cdFx0KGJvdW5kcy5ib3R0b20gIT09IG51bGwgJiYgYm91bmRzLmJvdHRvbS5jb21wYXJlKGVkZ2VzLnRvcCkgPD0gMCkgfHxcblx0XHQoYm91bmRzLmxlZnQuY29tcGFyZShlZGdlcy5yaWdodCkgPj0gMCk7XG59XG5cbmZ1bmN0aW9uIG5vdFJlbmRlcmVkKHBvc2l0aW9uKSB7XG5cdHN3aXRjaChwb3NpdGlvbikge1xuXHRcdGNhc2UgVE9QOlxuXHRcdGNhc2UgQk9UVE9NOlxuXHRcdFx0cmV0dXJuIFBvc2l0aW9uLm5vWSgpO1xuXHRcdGNhc2UgTEVGVDpcblx0XHRjYXNlIFJJR0hUOlxuXHRcdFx0cmV0dXJuIFBvc2l0aW9uLm5vWCgpO1xuXHRcdGRlZmF1bHQ6IHVua25vd25Qb3NpdGlvbihwb3NpdGlvbik7XG5cdH1cbn1cblxuZnVuY3Rpb24gZWRnZShlZGdlcywgcG9zaXRpb24pIHtcblx0c3dpdGNoKHBvc2l0aW9uKSB7XG5cdFx0Y2FzZSBUT1A6IHJldHVybiBlZGdlcy50b3A7XG5cdFx0Y2FzZSBSSUdIVDogcmV0dXJuIGVkZ2VzLnJpZ2h0O1xuXHRcdGNhc2UgQk9UVE9NOiByZXR1cm4gZWRnZXMuYm90dG9tO1xuXHRcdGNhc2UgTEVGVDogcmV0dXJuIGVkZ2VzLmxlZnQ7XG5cdFx0ZGVmYXVsdDogdW5rbm93blBvc2l0aW9uKHBvc2l0aW9uKTtcblx0fVxufVxuXG5mdW5jdGlvbiB1bmtub3duUG9zaXRpb24ocG9zaXRpb24pIHtcblx0ZW5zdXJlLnVucmVhY2hhYmxlKFwiVW5rbm93biBwb3NpdGlvbjogXCIgKyBwb3NpdGlvbik7XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE3IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFBvc2l0aW9uRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL3Bvc2l0aW9uX2Rlc2NyaXB0b3IuanNcIik7XG52YXIgU2l6ZURlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9zaXplX2Rlc2NyaXB0b3IuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gR2VuZXJpY1NpemUoZnJvbSwgdG8sIGRlc2NyaXB0aW9uKSB7XG4gIGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFBvc2l0aW9uRGVzY3JpcHRvciwgUG9zaXRpb25EZXNjcmlwdG9yLCBTdHJpbmcgXSk7XG5cbiAgdGhpcy5zaG91bGQgPSB0aGlzLmNyZWF0ZVNob3VsZCgpO1xuXG4gIHRoaXMuX2Zyb20gPSBmcm9tO1xuICB0aGlzLl90byA9IHRvO1xuICB0aGlzLl9kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xufTtcblNpemVEZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLmNyZWF0ZSA9IGZ1bmN0aW9uKGZyb20sIHRvLCBkZXNjcmlwdGlvbikge1xuICByZXR1cm4gbmV3IE1lKGZyb20sIHRvLCBkZXNjcmlwdGlvbik7XG59O1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcbiAgcmV0dXJuIHRoaXMuX2Zyb20udmFsdWUoKS5kaXN0YW5jZVRvKHRoaXMuX3RvLnZhbHVlKCkpO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9kZXNjcmlwdGlvbjtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgUG9zaXRpb25EZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vcG9zaXRpb25fZGVzY3JpcHRvci5qc1wiKTtcbnZhciBQb3NpdGlvbiA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvcG9zaXRpb24uanNcIik7XG5cbnZhciBUT1AgPSBcInRvcFwiO1xudmFyIFJJR0hUID0gXCJyaWdodFwiO1xudmFyIEJPVFRPTSA9IFwiYm90dG9tXCI7XG52YXIgTEVGVCA9IFwibGVmdFwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFBhZ2VFZGdlKGVkZ2UsIGJyb3dzaW5nQ29udGV4dCkge1xuXHR2YXIgQnJvd3NpbmdDb250ZXh0ID0gcmVxdWlyZShcIi4uL2Jyb3dzaW5nX2NvbnRleHQuanNcIik7ICAgLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIEJyb3dzaW5nQ29udGV4dCBdKTtcblxuXHR0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cblx0aWYgKGVkZ2UgPT09IExFRlQgfHwgZWRnZSA9PT0gUklHSFQpIFBvc2l0aW9uRGVzY3JpcHRvci54KHRoaXMpO1xuXHRlbHNlIGlmIChlZGdlID09PSBUT1AgfHwgZWRnZSA9PT0gQk9UVE9NKSBQb3NpdGlvbkRlc2NyaXB0b3IueSh0aGlzKTtcblx0ZWxzZSBlbnN1cmUudW5yZWFjaGFibGUoXCJVbmtub3duIGVkZ2U6IFwiICsgZWRnZSk7XG5cblx0dGhpcy5fZWRnZSA9IGVkZ2U7XG5cdHRoaXMuX2Jyb3dzaW5nQ29udGV4dCA9IGJyb3dzaW5nQ29udGV4dDtcbn07XG5Qb3NpdGlvbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUudG9wID0gZmFjdG9yeUZuKFRPUCk7XG5NZS5yaWdodCA9IGZhY3RvcnlGbihSSUdIVCk7XG5NZS5ib3R0b20gPSBmYWN0b3J5Rm4oQk9UVE9NKTtcbk1lLmxlZnQgPSBmYWN0b3J5Rm4oTEVGVCk7XG5cbk1lLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBzaXplID0gcGFnZVNpemUodGhpcy5fYnJvd3NpbmdDb250ZXh0LmNvbnRlbnREb2N1bWVudCk7XG5cdHN3aXRjaCh0aGlzLl9lZGdlKSB7XG5cdFx0Y2FzZSBUT1A6IHJldHVybiBQb3NpdGlvbi55KDApO1xuXHRcdGNhc2UgUklHSFQ6IHJldHVybiBQb3NpdGlvbi54KHNpemUud2lkdGgpO1xuXHRcdGNhc2UgQk9UVE9NOiByZXR1cm4gUG9zaXRpb24ueShzaXplLmhlaWdodCk7XG5cdFx0Y2FzZSBMRUZUOiByZXR1cm4gUG9zaXRpb24ueCgwKTtcblxuXHRcdGRlZmF1bHQ6IGVuc3VyZS51bnJlYWNoYWJsZSgpO1xuXHR9XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRzd2l0Y2godGhpcy5fZWRnZSkge1xuXHRcdGNhc2UgVE9QOiByZXR1cm4gXCJ0b3Agb2YgcGFnZVwiO1xuXHRcdGNhc2UgUklHSFQ6IHJldHVybiBcInJpZ2h0IHNpZGUgb2YgcGFnZVwiO1xuXHRcdGNhc2UgQk9UVE9NOiByZXR1cm4gXCJib3R0b20gb2YgcGFnZVwiO1xuXHRcdGNhc2UgTEVGVDogcmV0dXJuIFwibGVmdCBzaWRlIG9mIHBhZ2VcIjtcblxuXHRcdGRlZmF1bHQ6IGVuc3VyZS51bnJlYWNoYWJsZSgpO1xuXHR9XG59O1xuXG5mdW5jdGlvbiBmYWN0b3J5Rm4oZWRnZSkge1xuXHRyZXR1cm4gZnVuY3Rpb24gZmFjdG9yeShicm93c2luZ0NvbnRleHQpIHtcblx0XHRyZXR1cm4gbmV3IE1lKGVkZ2UsIGJyb3dzaW5nQ29udGV4dCk7XG5cdH07XG59XG5cblxuLy8gVVNFRlVMIFJFQURJTkc6IGh0dHA6Ly93d3cucXVpcmtzbW9kZS5vcmcvbW9iaWxlL3ZpZXdwb3J0cy5odG1sXG4vLyBhbmQgaHR0cDovL3d3dy5xdWlya3Ntb2RlLm9yZy9tb2JpbGUvdmlld3BvcnRzMi5odG1sXG5cbi8vIEFQSSBTRU1BTlRJQ1MuXG4vLyBSZWYgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NTU19PYmplY3RfTW9kZWwvRGV0ZXJtaW5pbmdfdGhlX2RpbWVuc2lvbnNfb2ZfZWxlbWVudHNcbi8vICAgIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoOiBzdW0gb2YgYm91bmRpbmcgYm94ZXMgb2YgZWxlbWVudCAodGhlIGRpc3BsYXllZCB3aWR0aCBvZiB0aGUgZWxlbWVudCxcbi8vICAgICAgaW5jbHVkaW5nIHBhZGRpbmcgYW5kIGJvcmRlcikuIEZyYWN0aW9uYWwuIEFwcGxpZXMgdHJhbnNmb3JtYXRpb25zLlxuLy8gICAgY2xpZW50V2lkdGg6IHZpc2libGUgd2lkdGggb2YgZWxlbWVudCBpbmNsdWRpbmcgcGFkZGluZyAoYnV0IG5vdCBib3JkZXIpLiBFWENFUFQgb24gcm9vdCBlbGVtZW50IChodG1sKSwgd2hlcmVcbi8vICAgICAgaXQgaXMgdGhlIHdpZHRoIG9mIHRoZSB2aWV3cG9ydC4gUm91bmRzIHRvIGFuIGludGVnZXIuIERvZXNuJ3QgYXBwbHkgdHJhbnNmb3JtYXRpb25zLlxuLy8gICAgb2Zmc2V0V2lkdGg6IHZpc2libGUgd2lkdGggb2YgZWxlbWVudCBpbmNsdWRpbmcgcGFkZGluZywgYm9yZGVyLCBhbmQgc2Nyb2xsYmFycyAoaWYgYW55KS4gUm91bmRzIHRvIGFuIGludGVnZXIuXG4vLyAgICAgIERvZXNuJ3QgYXBwbHkgdHJhbnNmb3JtYXRpb25zLlxuLy8gICAgc2Nyb2xsV2lkdGg6IGVudGlyZSB3aWR0aCBvZiBlbGVtZW50LCBpbmNsdWRpbmcgYW55IHBhcnQgdGhhdCdzIG5vdCB2aXNpYmxlIGR1ZSB0byBzY3JvbGxiYXJzLiBSb3VuZHMgdG9cbi8vICAgICAgYW4gaW50ZWdlci4gRG9lc24ndCBhcHBseSB0cmFuc2Zvcm1hdGlvbnMuIE5vdCBjbGVhciBpZiBpdCBpbmNsdWRlcyBzY3JvbGxiYXJzLCBidXQgSSB0aGluayBub3QuIEFsc29cbi8vICAgICAgbm90IGNsZWFyIGlmIGl0IGluY2x1ZGVzIGJvcmRlcnMgb3IgcGFkZGluZy4gKEJ1dCBmcm9tIHRlc3RzLCBhcHBhcmVudGx5IG5vdCBib3JkZXJzLiBFeGNlcHQgb24gcm9vdFxuLy8gICAgICBlbGVtZW50IGFuZCBib2R5IGVsZW1lbnQsIHdoaWNoIGhhdmUgc3BlY2lhbCByZXN1bHRzIHRoYXQgdmFyeSBieSBicm93c2VyLilcblxuLy8gVEVTVCBSRVNVTFRTOiBXSURUSFxuLy8gICDinJQgPSBjb3JyZWN0IGFuc3dlclxuLy8gICDinJggPSBpbmNvcnJlY3QgYW5zd2VyIGFuZCBkaXZlcmdlcyBmcm9tIHNwZWNcbi8vICAgfiA9IGluY29ycmVjdCBhbnN3ZXIsIGJ1dCBtYXRjaGVzIHNwZWNcbi8vIEJST1dTRVJTIFRFU1RFRDogU2FmYXJpIDYuMi4wIChNYWMgT1MgWCAxMC44LjUpOyBNb2JpbGUgU2FmYXJpIDcuMC4wIChpT1MgNy4xKTsgRmlyZWZveCAzMi4wLjAgKE1hYyBPUyBYIDEwLjgpO1xuLy8gICAgRmlyZWZveCAzMy4wLjAgKFdpbmRvd3MgNyk7IENocm9tZSAzOC4wLjIxMjUgKE1hYyBPUyBYIDEwLjguNSk7IENocm9tZSAzOC4wLjIxMjUgKFdpbmRvd3MgNyk7IElFIDgsIDksIDEwLCAxMVxuXG4vLyBodG1sIHdpZHRoIHN0eWxlIHNtYWxsZXIgdGhhbiB2aWV3cG9ydCB3aWR0aDsgYm9keSB3aWR0aCBzdHlsZSBzbWFsbGVyIHRoYW4gaHRtbCB3aWR0aCBzdHlsZVxuLy8gIE5PVEU6IFRoZXNlIHRlc3RzIHdlcmUgY29uZHVjdGVkIHdoZW4gY29ycmVjdCByZXN1bHQgd2FzIHdpZHRoIG9mIGJvcmRlci4gVGhhdCBoYXMgYmVlbiBjaGFuZ2VkXG4vLyAgdG8gXCJ3aWR0aCBvZiB2aWV3cG9ydC5cIlxuLy8gICAgaHRtbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuLy8gICAgICDinJggSUUgOCwgOSwgMTA6IHdpZHRoIG9mIHZpZXdwb3J0XG4vLyAgICAgIOKclCBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgMTE6IHdpZHRoIG9mIGh0bWwsIGluY2x1ZGluZyBib3JkZXJcbi8vICAgIGh0bWwuY2xpZW50V2lkdGhcbi8vICAgICAgfiBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiB3aWR0aCBvZiB2aWV3cG9ydFxuLy8gICAgaHRtbC5vZmZzZXRXaWR0aFxuLy8gICAgICDinJggSUUgOCwgOSwgMTA6IHdpZHRoIG9mIHZpZXdwb3J0XG4vLyAgICAgIOKclCBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgMTE6IHdpZHRoIG9mIGh0bWwsIGluY2x1ZGluZyBib3JkZXJcbi8vICAgIGh0bWwuc2Nyb2xsV2lkdGhcbi8vICAgICAg4pyYIElFIDgsIDksIDEwLCAxMSwgRmlyZWZveDogd2lkdGggb2Ygdmlld3BvcnRcbi8vICAgICAgfiBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZTogd2lkdGggb2YgaHRtbCwgZXhjbHVkaW5nIGJvcmRlclxuLy8gICAgYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuLy8gICAgICB+IFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IHdpZHRoIG9mIGJvZHksIGluY2x1ZGluZyBib3JkZXJcbi8vICAgIGJvZHkuY2xpZW50V2lkdGhcbi8vICAgICAgfiBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZSwgRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiB3aWR0aCBvZiBib2R5LCBleGNsdWRpbmcgYm9yZGVyXG4vLyAgICBib2R5Lm9mZnNldFdpZHRoXG4vLyAgICAgIH4gU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogd2lkdGggb2YgYm9keSwgaW5jbHVkaW5nIGJvcmRlclxuLy8gICAgYm9keS5zY3JvbGxXaWR0aFxuLy8gICAgICDinJggU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWU6IHdpZHRoIG9mIHZpZXdwb3J0XG4vLyAgICAgIH4gRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiB3aWR0aCBvZiBib2R5LCBleGNsdWRpbmcgYm9yZGVyXG5cbi8vIGVsZW1lbnQgd2lkdGggc3R5bGUgd2lkZXIgdGhhbiB2aWV3cG9ydDsgYm9keSBhbmQgaHRtbCB3aWR0aCBzdHlsZXMgYXQgZGVmYXVsdFxuLy8gQlJPV1NFUiBCRUhBVklPUjogaHRtbCBhbmQgYm9keSBib3JkZXIgZXh0ZW5kIHRvIHdpZHRoIG9mIHZpZXdwb3J0IGFuZCBub3QgYmV5b25kIChleGNlcHQgb24gTW9iaWxlIFNhZmFyaSlcbi8vIENvcnJlY3QgcmVzdWx0IGlzIGVsZW1lbnQgd2lkdGggKyBib2R5IGJvcmRlci1sZWZ0ICsgaHRtbCBib3JkZXItbGVmdCAoZXhjZXB0IG9uIE1vYmlsZSBTYWZhcmkpXG4vLyBNb2JpbGUgU2FmYXJpIHVzZXMgYSBsYXlvdXQgdmlld3BvcnQsIHNvIGl0J3MgZXhwZWN0ZWQgdG8gaW5jbHVkZSBib2R5IGJvcmRlci1yaWdodCBhbmQgaHRtbCBib3JkZXItcmlnaHQuXG4vLyAgICBodG1sLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoXG4vLyAgICAgIOKclCBNb2JpbGUgU2FmYXJpOiBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXIgKyBodG1sIGJvcmRlclxuLy8gICAgICB+IFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IHZpZXdwb3J0IHdpZHRoXG4vLyAgICBodG1sLmNsaWVudFdpZHRoXG4vLyAgICAgIOKclCBNb2JpbGUgU2FmYXJpOiBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXIgKyBodG1sIGJvcmRlclxuLy8gICAgICB+IFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IHZpZXdwb3J0IHdpZHRoXG4vLyAgICBodG1sLm9mZnNldFdpZHRoXG4vLyAgICAgIOKclCBNb2JpbGUgU2FmYXJpOiBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXIgKyBodG1sIGJvcmRlclxuLy8gICAgICB+IFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IHZpZXdwb3J0IHdpZHRoXG4vLyAgICBodG1sLnNjcm9sbFdpZHRoXG4vLyAgICAgIOKclCBNb2JpbGUgU2FmYXJpOiBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXIgKyBodG1sIGJvcmRlclxuLy8gICAgICDinJggU2FmYXJpLCBDaHJvbWU6IGVsZW1lbnQgd2lkdGggKyBib2R5IGJvcmRlci1sZWZ0IChCVVQgTk9UIGh0bWwgYm9yZGVyLWxlZnQpXG4vLyAgICAgIOKclCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IGVsZW1lbnQgd2lkdGggKyBib2R5IGJvcmRlci1sZWZ0ICsgaHRtbCBib3JkZXItbGVmdFxuLy8gICAgYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuLy8gICAgICB+IE1vYmlsZSBTYWZhcmk6IGVsZW1lbnQgd2lkdGggKyBib2R5IGJvcmRlclxuLy8gICAgICB+IFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IHZpZXdwb3J0IHdpZHRoIC0gaHRtbCBib3JkZXJcbi8vICAgIGJvZHkuY2xpZW50V2lkdGhcbi8vICAgICAgfiBNb2JpbGUgU2FmYXJpOiBlbGVtZW50IHdpZHRoXG4vLyAgICAgIH4gU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogdmlld3BvcnQgd2lkdGggLSBodG1sIGJvcmRlciAtIGJvZHkgYm9yZGVyXG4vLyAgICBib2R5Lm9mZnNldFdpZHRoXG4vLyAgICAgIH4gTW9iaWxlIFNhZmFyaTogZWxlbWVudCB3aWR0aCArIGJvZHkgYm9yZGVyXG4vLyAgICAgIH4gU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogdmlld3BvcnQgd2lkdGggLSBodG1sIGJvcmRlclxuLy8gICAgYm9keS5zY3JvbGxXaWR0aFxuLy8gICAgICDinJQgTW9iaWxlIFNhZmFyaTogZWxlbWVudCB3aWR0aCArIGJvZHkgYm9yZGVyICsgaHRtbCBib3JkZXJcbi8vICAgICAg4pyUIFNhZmFyaSwgQ2hyb21lOiBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXItbGVmdCArIGh0bWwgYm9yZGVyLWxlZnQgKG1hdGNoZXMgYWN0dWFsIGJyb3dzZXIpXG4vLyAgICAgIH4gRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiBlbGVtZW50IHdpZHRoXG5cbi8vIFRFU1QgUkVTVUxUUzogSEVJR0hUXG4vLyAgIOKclCA9IGNvcnJlY3QgYW5zd2VyXG4vLyAgIOKcmCA9IGluY29ycmVjdCBhbnN3ZXIgYW5kIGRpdmVyZ2VzIGZyb20gc3BlY1xuLy8gICB+ID0gaW5jb3JyZWN0IGFuc3dlciwgYnV0IG1hdGNoZXMgc3BlY1xuXG4vLyBodG1sIGhlaWdodCBzdHlsZSBzbWFsbGVyIHRoYW4gdmlld3BvcnQgaGVpZ2h0OyBib2R5IGhlaWdodCBzdHlsZSBzbWFsbGVyIHRoYW4gaHRtbCBoZWlnaHQgc3R5bGVcbi8vICBOT1RFOiBUaGVzZSB0ZXN0cyB3ZXJlIGNvbmR1Y3RlZCB3aGVuIGNvcnJlY3QgcmVzdWx0IHdhcyBoZWlnaHQgb2Ygdmlld3BvcnQuXG4vLyAgICBodG1sLmNsaWVudEhlaWdodFxuLy8gICAgICDinJQgU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWUsIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogaGVpZ2h0IG9mIHZpZXdwb3J0XG5cbi8vIGVsZW1lbnQgaGVpZ2h0IHN0eWxlIHRhbGxlciB0aGFuIHZpZXdwb3J0OyBib2R5IGFuZCBodG1sIHdpZHRoIHN0eWxlcyBhdCBkZWZhdWx0XG4vLyBCUk9XU0VSIEJFSEFWSU9SOiBodG1sIGFuZCBib2R5IGJvcmRlciBlbmNsb3NlIGVudGlyZSBlbGVtZW50XG4vLyBDb3JyZWN0IHJlc3VsdCBpcyBlbGVtZW50IHdpZHRoICsgYm9keSBib3JkZXItdG9wICsgaHRtbCBib3JkZXItdG9wICsgYm9keSBib3JkZXItYm90dG9tICsgaHRtbCBib3JkZXItYm90dG9tXG4vLyAgICBodG1sLmNsaWVudEhlaWdodFxuLy8gICAgICDinJQgTW9iaWxlIFNhZmFyaTogZWxlbWVudCBoZWlnaHQgKyBhbGwgYm9yZGVyc1xuLy8gICAgICB+IFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IGhlaWdodCBvZiB2aWV3cG9ydFxuLy8gICAgaHRtbC5zY3JvbGxIZWlnaHRcbi8vICAgICAg4pyUIEZpcmVmb3gsIElFIDgsIDksIDEwLCAxMTogZWxlbWVudCBoZWlnaHQgKyBhbGwgYm9yZGVyc1xuLy8gICAgICDinJggU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWU6IGVsZW1lbnQgaGVpZ2h0ICsgaHRtbCBib3JkZXItYm90dG9tXG4vLyAgICBib2R5LnNjcm9sbEhlaWdodFxuLy8gICAgICDinJQgU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWU6IGVsZW1lbnQgaGVpZ2h0ICsgYWxsIGJvcmRlcnNcbi8vICAgICAgfiBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTE6IGVsZW1lbnQgaGVpZ2h0IChib2R5IGhlaWdodCAtIGJvZHkgYm9yZGVyKVxuZnVuY3Rpb24gcGFnZVNpemUoZG9jdW1lbnQpIHtcblx0dmFyIGh0bWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cdHZhciBib2R5ID0gZG9jdW1lbnQuYm9keTtcblxuLy8gQkVTVCBXSURUSCBBTlNXRVIgU08gRkFSIChBU1NVTUlORyBWSUVXUE9SVCBJUyBNSU5JTVVNIEFOU1dFUik6XG5cdHZhciB3aWR0aCA9IE1hdGgubWF4KGJvZHkuc2Nyb2xsV2lkdGgsIGh0bWwuc2Nyb2xsV2lkdGgpO1xuXG4vLyBCRVNUIEhFSUdIVCBBTlNXRVIgU08gRkFSIChBU1NVTUlORyBWSUVXUE9SVCBJUyBNSU5JTVVNIEFOU1dFUik6XG5cdHZhciBoZWlnaHQgPSBNYXRoLm1heChib2R5LnNjcm9sbEhlaWdodCwgaHRtbC5zY3JvbGxIZWlnaHQpO1xuXG5cdHJldHVybiB7XG5cdFx0d2lkdGg6IHdpZHRoLFxuXHRcdGhlaWdodDogaGVpZ2h0XG5cdH07XG59XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNyBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG4vKmVzbGludCBuZXctY2FwOiBcIm9mZlwiICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBvb3AgPSByZXF1aXJlKFwiLi4vdXRpbC9vb3AuanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xuXG4vLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmNpZXNcbmZ1bmN0aW9uIFJlbGF0aXZlUG9zaXRpb24oKSB7XG5cdHJldHVybiByZXF1aXJlKFwiLi9yZWxhdGl2ZV9wb3NpdGlvbi5qc1wiKTtcbn1cbmZ1bmN0aW9uIEFic29sdXRlUG9zaXRpb24oKSB7XG5cdHJldHVybiByZXF1aXJlKFwiLi9hYnNvbHV0ZV9wb3NpdGlvbi5qc1wiKTtcbn1cbmZ1bmN0aW9uIEdlbmVyaWNTaXplKCkge1xuXHRyZXR1cm4gcmVxdWlyZShcIi4vZ2VuZXJpY19zaXplLmpzXCIpO1xufVxuXG52YXIgWF9ESU1FTlNJT04gPSBcInhcIjtcbnZhciBZX0RJTUVOU0lPTiA9IFwieVwiO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFBvc2l0aW9uRGVzY3JpcHRvcihkaW1lbnNpb24pIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nIF0pO1xuXHRlbnN1cmUudW5yZWFjaGFibGUoXCJQb3NpdGlvbkRlc2NyaXB0b3IgaXMgYWJzdHJhY3QgYW5kIHNob3VsZCBub3QgYmUgY29uc3RydWN0ZWQgZGlyZWN0bHkuXCIpO1xufTtcbkRlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcbk1lLmV4dGVuZCA9IG9vcC5leHRlbmRGbihNZSk7XG5cbk1lLnggPSBmYWN0b3J5Rm4oWF9ESU1FTlNJT04pO1xuTWUueSA9IGZhY3RvcnlGbihZX0RJTUVOU0lPTik7XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gZnVuY3Rpb24gcGx1cyhhbW91bnQpIHtcblx0aWYgKHRoaXMuX3BkYmMuZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgcmV0dXJuIFJlbGF0aXZlUG9zaXRpb24oKS5yaWdodCh0aGlzLCBhbW91bnQpO1xuXHRlbHNlIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uKCkuZG93bih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLm1pbnVzID0gZnVuY3Rpb24gbWludXMoYW1vdW50KSB7XG5cdGlmICh0aGlzLl9wZGJjLmRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uKCkubGVmdCh0aGlzLCBhbW91bnQpO1xuXHRlbHNlIHJldHVybiBSZWxhdGl2ZVBvc2l0aW9uKCkudXAodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS50byA9IGZ1bmN0aW9uIHRvKHBvc2l0aW9uKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbWyBNZSwgTnVtYmVyIF1dKTtcblx0aWYgKHR5cGVvZiBwb3NpdGlvbiA9PT0gXCJudW1iZXJcIikge1xuXHRcdGlmICh0aGlzLl9wZGJjLmRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04pIHBvc2l0aW9uID0gQWJzb2x1dGVQb3NpdGlvbigpLngocG9zaXRpb24pO1xuXHRcdGVsc2UgcG9zaXRpb24gPSBBYnNvbHV0ZVBvc2l0aW9uKCkueShwb3NpdGlvbik7XG5cdH1cblx0aWYgKHRoaXMuX3BkYmMuZGltZW5zaW9uICE9PSBwb3NpdGlvbi5fcGRiYy5kaW1lbnNpb24pIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW4gb25seSBjYWxjdWxhdGUgZGlzdGFuY2UgYmV0d2VlbiB0d28gWCBjb29yZGluYXRlcyBvciB0d28gWSBjb29yZGluYXRlc1wiKTtcblx0fVxuXG5cdHJldHVybiBHZW5lcmljU2l6ZSgpLmNyZWF0ZSh0aGlzLCBwb3NpdGlvbiwgXCJkaXN0YW5jZSBmcm9tIFwiICsgdGhpcyArIFwiIHRvIFwiICsgcG9zaXRpb24pO1xufTtcblxuTWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGFyZywgdHlwZSkge1xuXHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRjYXNlIFwibnVtYmVyXCI6IHJldHVybiB0aGlzLl9wZGJjLmRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04gPyBQb3NpdGlvbi54KGFyZykgOiBQb3NpdGlvbi55KGFyZyk7XG5cdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0aWYgKGFyZyA9PT0gXCJub25lXCIpIHJldHVybiB0aGlzLl9wZGJjLmRpbWVuc2lvbiA9PT0gWF9ESU1FTlNJT04gPyBQb3NpdGlvbi5ub1goKSA6IFBvc2l0aW9uLm5vWSgpO1xuXHRcdFx0ZWxzZSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDogcmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcblxuZnVuY3Rpb24gZmFjdG9yeUZuKGRpbWVuc2lvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gZmFjdG9yeShzZWxmKSB7XG5cdFx0Ly8gX3BkYmM6IFwiUG9zaXRpb25EZXNjcmlwdG9yIGJhc2UgY2xhc3MuXCIgQW4gYXR0ZW1wdCB0byBwcmV2ZW50IG5hbWUgY29uZmxpY3RzLlxuXHRcdHNlbGYuX3BkYmMgPSB7IGRpbWVuc2lvbjogZGltZW5zaW9uIH07XG5cdH07XG59XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3IuanNcIik7XG52YXIgUG9zaXRpb25EZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vcG9zaXRpb25fZGVzY3JpcHRvci5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvdmFsdWUuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvc2l6ZS5qc1wiKTtcblxudmFyIFhfRElNRU5TSU9OID0gXCJ4XCI7XG52YXIgWV9ESU1FTlNJT04gPSBcInlcIjtcbnZhciBQTFVTID0gMTtcbnZhciBNSU5VUyA9IC0xO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFJlbGF0aXZlUG9zaXRpb24oZGltZW5zaW9uLCBkaXJlY3Rpb24sIHJlbGF0aXZlVG8sIHJlbGF0aXZlQW1vdW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZywgTnVtYmVyLCBEZXNjcmlwdG9yLCBbTnVtYmVyLCBEZXNjcmlwdG9yLCBWYWx1ZV0gXSk7XG5cblx0dGhpcy5zaG91bGQgPSB0aGlzLmNyZWF0ZVNob3VsZCgpO1xuXG5cdGlmIChkaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSBQb3NpdGlvbkRlc2NyaXB0b3IueCh0aGlzKTtcblx0ZWxzZSBpZiAoZGltZW5zaW9uID09PSBZX0RJTUVOU0lPTikgUG9zaXRpb25EZXNjcmlwdG9yLnkodGhpcyk7XG5cdGVsc2UgZW5zdXJlLnVucmVhY2hhYmxlKFwiVW5rbm93biBkaW1lbnNpb246IFwiICsgZGltZW5zaW9uKTtcblxuXHR0aGlzLl9kaW1lbnNpb24gPSBkaW1lbnNpb247XG5cdHRoaXMuX2RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcblx0dGhpcy5fcmVsYXRpdmVUbyA9IHJlbGF0aXZlVG87XG5cblx0aWYgKHR5cGVvZiByZWxhdGl2ZUFtb3VudCA9PT0gXCJudW1iZXJcIikge1xuXHRcdGlmIChyZWxhdGl2ZUFtb3VudCA8IDApIHRoaXMuX2RpcmVjdGlvbiAqPSAtMTtcblx0XHR0aGlzLl9hbW91bnQgPSBTaXplLmNyZWF0ZShNYXRoLmFicyhyZWxhdGl2ZUFtb3VudCkpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHRoaXMuX2Ftb3VudCA9IHJlbGF0aXZlQW1vdW50O1xuXHR9XG59O1xuUG9zaXRpb25EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5cbk1lLnJpZ2h0ID0gY3JlYXRlRm4oWF9ESU1FTlNJT04sIFBMVVMpO1xuTWUuZG93biA9IGNyZWF0ZUZuKFlfRElNRU5TSU9OLCBQTFVTKTtcbk1lLmxlZnQgPSBjcmVhdGVGbihYX0RJTUVOU0lPTiwgTUlOVVMpO1xuTWUudXAgPSBjcmVhdGVGbihZX0RJTUVOU0lPTiwgTUlOVVMpO1xuXG5mdW5jdGlvbiBjcmVhdGVGbihkaW1lbnNpb24sIGRpcmVjdGlvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gY3JlYXRlKHJlbGF0aXZlVG8sIHJlbGF0aXZlQW1vdW50KSB7XG5cdFx0cmV0dXJuIG5ldyBNZShkaW1lbnNpb24sIGRpcmVjdGlvbiwgcmVsYXRpdmVUbywgcmVsYXRpdmVBbW91bnQpO1xuXHR9O1xufVxuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgYmFzZVZhbHVlID0gdGhpcy5fcmVsYXRpdmVUby52YWx1ZSgpO1xuXHR2YXIgcmVsYXRpdmVWYWx1ZSA9IHRoaXMuX2Ftb3VudC52YWx1ZSgpO1xuXG5cdGlmICh0aGlzLl9kaXJlY3Rpb24gPT09IFBMVVMpIHJldHVybiBiYXNlVmFsdWUucGx1cyhyZWxhdGl2ZVZhbHVlKTtcblx0ZWxzZSByZXR1cm4gYmFzZVZhbHVlLm1pbnVzKHJlbGF0aXZlVmFsdWUpO1xufTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2UgPSB0aGlzLl9yZWxhdGl2ZVRvLnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9hbW91bnQuZXF1YWxzKFNpemUuY3JlYXRlKDApKSkgcmV0dXJuIGJhc2U7XG5cblx0dmFyIHJlbGF0aW9uID0gdGhpcy5fYW1vdW50LnRvU3RyaW5nKCk7XG5cdGlmICh0aGlzLl9kaW1lbnNpb24gPT09IFhfRElNRU5TSU9OKSByZWxhdGlvbiArPSAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSA/IFwiIHRvIHJpZ2h0IG9mIFwiIDogXCIgdG8gbGVmdCBvZiBcIjtcblx0ZWxzZSByZWxhdGlvbiArPSAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSA/IFwiIGJlbG93IFwiIDogXCIgYWJvdmUgXCI7XG5cblx0cmV0dXJuIHJlbGF0aW9uICsgYmFzZTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgU2l6ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvc2l6ZS5qc1wiKTtcbnZhciBEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvci5qc1wiKTtcbnZhciBTaXplRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL3NpemVfZGVzY3JpcHRvci5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuLi92YWx1ZXMvdmFsdWUuanNcIik7XG52YXIgU2l6ZU11bHRpcGxlID0gcmVxdWlyZShcIi4vc2l6ZV9tdWx0aXBsZS5qc1wiKTtcblxudmFyIFBMVVMgPSAxO1xudmFyIE1JTlVTID0gLTE7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUmVsYXRpdmVTaXplKGRpcmVjdGlvbiwgcmVsYXRpdmVUbywgYW1vdW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE51bWJlciwgRGVzY3JpcHRvciwgW051bWJlciwgRGVzY3JpcHRvciwgVmFsdWVdIF0pO1xuXG5cdHRoaXMuc2hvdWxkID0gdGhpcy5jcmVhdGVTaG91bGQoKTtcblxuXHR0aGlzLl9kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG5cdHRoaXMuX3JlbGF0aXZlVG8gPSByZWxhdGl2ZVRvO1xuXG5cdGlmICh0eXBlb2YgYW1vdW50ID09PSBcIm51bWJlclwiKSB7XG5cdFx0dGhpcy5fYW1vdW50ID0gU2l6ZS5jcmVhdGUoTWF0aC5hYnMoYW1vdW50KSk7XG5cdFx0aWYgKGFtb3VudCA8IDApIHRoaXMuX2RpcmVjdGlvbiAqPSAtMTtcblx0fVxuXHRlbHNlIHtcblx0XHR0aGlzLl9hbW91bnQgPSBhbW91bnQ7XG5cdH1cbn07XG5TaXplRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS5sYXJnZXIgPSBmYWN0b3J5Rm4oUExVUyk7XG5NZS5zbWFsbGVyID0gZmFjdG9yeUZuKE1JTlVTKTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIGJhc2VWYWx1ZSA9IHRoaXMuX3JlbGF0aXZlVG8udmFsdWUoKTtcblx0dmFyIHJlbGF0aXZlVmFsdWUgPSB0aGlzLl9hbW91bnQudmFsdWUoKTtcblxuXHRpZiAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSByZXR1cm4gYmFzZVZhbHVlLnBsdXMocmVsYXRpdmVWYWx1ZSk7XG5cdGVsc2UgcmV0dXJuIGJhc2VWYWx1ZS5taW51cyhyZWxhdGl2ZVZhbHVlKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBiYXNlID0gdGhpcy5fcmVsYXRpdmVUby50b1N0cmluZygpO1xuXHRpZiAodGhpcy5fYW1vdW50LmVxdWFscyhTaXplLmNyZWF0ZSgwKSkpIHJldHVybiBiYXNlO1xuXG5cdHZhciByZWxhdGlvbiA9IHRoaXMuX2Ftb3VudC50b1N0cmluZygpO1xuXHRpZiAodGhpcy5fZGlyZWN0aW9uID09PSBQTFVTKSByZWxhdGlvbiArPSBcIiBsYXJnZXIgdGhhbiBcIjtcblx0ZWxzZSByZWxhdGlvbiArPSBcIiBzbWFsbGVyIHRoYW4gXCI7XG5cblx0cmV0dXJuIHJlbGF0aW9uICsgYmFzZTtcbn07XG5cbmZ1bmN0aW9uIGZhY3RvcnlGbihkaXJlY3Rpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkocmVsYXRpdmVUbywgYW1vdW50KSB7XG5cdFx0cmV0dXJuIG5ldyBNZShkaXJlY3Rpb24sIHJlbGF0aXZlVG8sIGFtb3VudCk7XG5cdH07XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuLyplc2xpbnQgbmV3LWNhcDogXCJvZmZcIiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4uL3V0aWwvb29wLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG5cbmZ1bmN0aW9uIFJlbGF0aXZlU2l6ZSgpIHtcblx0cmV0dXJuIHJlcXVpcmUoXCIuL3JlbGF0aXZlX3NpemUuanNcIik7ICAgXHQvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG59XG5cbmZ1bmN0aW9uIFNpemVNdWx0aXBsZSgpIHtcblx0cmV0dXJuIHJlcXVpcmUoXCIuL3NpemVfbXVsdGlwbGUuanNcIik7ICAgXHQvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG59XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU2l6ZURlc2NyaXB0b3IoKSB7XG5cdGVuc3VyZS51bnJlYWNoYWJsZShcIlNpemVEZXNjcmlwdG9yIGlzIGFic3RyYWN0IGFuZCBzaG91bGQgbm90IGJlIGNvbnN0cnVjdGVkIGRpcmVjdGx5LlwiKTtcbn07XG5EZXNjcmlwdG9yLmV4dGVuZChNZSk7XG5NZS5leHRlbmQgPSBvb3AuZXh0ZW5kRm4oTWUpO1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IGZ1bmN0aW9uIHBsdXMoYW1vdW50KSB7XG5cdHJldHVybiBSZWxhdGl2ZVNpemUoKS5sYXJnZXIodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5taW51cyA9IGZ1bmN0aW9uIG1pbnVzKGFtb3VudCkge1xuXHRyZXR1cm4gUmVsYXRpdmVTaXplKCkuc21hbGxlcih0aGlzLCBhbW91bnQpO1xufTtcblxuTWUucHJvdG90eXBlLnRpbWVzID0gZnVuY3Rpb24gdGltZXMoYW1vdW50KSB7XG5cdHJldHVybiBTaXplTXVsdGlwbGUoKS5jcmVhdGUodGhpcywgYW1vdW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChhcmcsIHR5cGUpIHtcblx0c3dpdGNoKHR5cGUpIHtcblx0XHRjYXNlIFwibnVtYmVyXCI6IHJldHVybiBTaXplLmNyZWF0ZShhcmcpO1xuXHRcdGNhc2UgXCJzdHJpbmdcIjogcmV0dXJuIGFyZyA9PT0gXCJub25lXCIgPyBTaXplLmNyZWF0ZU5vbmUoKSA6IHVuZGVmaW5lZDtcblx0XHRkZWZhdWx0OiByZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG59O1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemVEZXNjcmlwdG9yID0gcmVxdWlyZShcIi4vc2l6ZV9kZXNjcmlwdG9yLmpzXCIpO1xudmFyIFNpemUgPSByZXF1aXJlKFwiLi4vdmFsdWVzL3NpemUuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU2l6ZU11bHRpcGxlKHJlbGF0aXZlVG8sIG11bHRpcGxlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIERlc2NyaXB0b3IsIE51bWJlciBdKTtcblxuXHR0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cblx0dGhpcy5fcmVsYXRpdmVUbyA9IHJlbGF0aXZlVG87XG5cdHRoaXMuX211bHRpcGxlID0gbXVsdGlwbGU7XG59O1xuU2l6ZURlc2NyaXB0b3IuZXh0ZW5kKE1lKTtcblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKHJlbGF0aXZlVG8sIG11bHRpcGxlKSB7XG5cdHJldHVybiBuZXcgTWUocmVsYXRpdmVUbywgbXVsdGlwbGUpO1xufTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24gdmFsdWUoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX3JlbGF0aXZlVG8udmFsdWUoKS50aW1lcyh0aGlzLl9tdWx0aXBsZSk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR2YXIgbXVsdGlwbGUgPSB0aGlzLl9tdWx0aXBsZTtcblx0dmFyIGJhc2UgPSB0aGlzLl9yZWxhdGl2ZVRvLnRvU3RyaW5nKCk7XG5cdGlmIChtdWx0aXBsZSA9PT0gMSkgcmV0dXJuIGJhc2U7XG5cblx0dmFyIGRlc2M7XG5cdHN3aXRjaChtdWx0aXBsZSkge1xuXHRcdGNhc2UgMS8yOiBkZXNjID0gXCJoYWxmIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDEvMzogZGVzYyA9IFwib25lLXRoaXJkIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDIvMzogZGVzYyA9IFwidHdvLXRoaXJkcyBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAxLzQ6IGRlc2MgPSBcIm9uZS1xdWFydGVyIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDMvNDogZGVzYyA9IFwidGhyZWUtcXVhcnRlcnMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMS81OiBkZXNjID0gXCJvbmUtZmlmdGggb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMi81OiBkZXNjID0gXCJ0d28tZmlmdGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDMvNTogZGVzYyA9IFwidGhyZWUtZmlmdGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDQvNTogZGVzYyA9IFwiZm91ci1maWZ0aHMgb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMS82OiBkZXNjID0gXCJvbmUtc2l4dGggb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgNS82OiBkZXNjID0gXCJmaXZlLXNpeHRocyBvZiBcIjsgYnJlYWs7XG5cdFx0Y2FzZSAxLzg6IGRlc2MgPSBcIm9uZS1laWdodGggb2YgXCI7IGJyZWFrO1xuXHRcdGNhc2UgMy84OiBkZXNjID0gXCJ0aHJlZS1laWdodGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDUvODogZGVzYyA9IFwiZml2ZS1laWdodGhzIG9mIFwiOyBicmVhaztcblx0XHRjYXNlIDcvODogZGVzYyA9IFwic2V2ZW4tZWlnaHRocyBvZiBcIjsgYnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGlmIChtdWx0aXBsZSA+IDEpIGRlc2MgPSBtdWx0aXBsZSArIFwiIHRpbWVzIFwiO1xuXHRcdFx0ZWxzZSBkZXNjID0gKG11bHRpcGxlICogMTAwKSArIFwiJSBvZiBcIjtcblx0fVxuXG5cdHJldHVybiBkZXNjICsgYmFzZTtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4uL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFBvc2l0aW9uRGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuL3Bvc2l0aW9uX2Rlc2NyaXB0b3IuanNcIik7XG52YXIgUG9zaXRpb24gPSByZXF1aXJlKFwiLi4vdmFsdWVzL3Bvc2l0aW9uLmpzXCIpO1xuXG52YXIgVE9QID0gXCJ0b3BcIjtcbnZhciBSSUdIVCA9IFwicmlnaHRcIjtcbnZhciBCT1RUT00gPSBcImJvdHRvbVwiO1xudmFyIExFRlQgPSBcImxlZnRcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBWaWV3cG9ydEVkZ2UocG9zaXRpb24sIGJyb3dzaW5nQ29udGV4dCkge1xuXHR2YXIgQnJvd3NpbmdDb250ZXh0ID0gcmVxdWlyZShcIi4uL2Jyb3dzaW5nX2NvbnRleHQuanNcIik7ICAgLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBTdHJpbmcsIEJyb3dzaW5nQ29udGV4dCBdKTtcblxuXHR0aGlzLnNob3VsZCA9IHRoaXMuY3JlYXRlU2hvdWxkKCk7XG5cblx0aWYgKHBvc2l0aW9uID09PSBMRUZUIHx8IHBvc2l0aW9uID09PSBSSUdIVCkgUG9zaXRpb25EZXNjcmlwdG9yLngodGhpcyk7XG5cdGVsc2UgaWYgKHBvc2l0aW9uID09PSBUT1AgfHwgcG9zaXRpb24gPT09IEJPVFRPTSkgUG9zaXRpb25EZXNjcmlwdG9yLnkodGhpcyk7XG5cdGVsc2UgZW5zdXJlLnVucmVhY2hhYmxlKFwiVW5rbm93biBwb3NpdGlvbjogXCIgKyBwb3NpdGlvbik7XG5cblx0dGhpcy5fcG9zaXRpb24gPSBwb3NpdGlvbjtcblx0dGhpcy5fYnJvd3NpbmdDb250ZXh0ID0gYnJvd3NpbmdDb250ZXh0O1xufTtcblBvc2l0aW9uRGVzY3JpcHRvci5leHRlbmQoTWUpO1xuXG5NZS50b3AgPSBmYWN0b3J5Rm4oVE9QKTtcbk1lLnJpZ2h0ID0gZmFjdG9yeUZuKFJJR0hUKTtcbk1lLmJvdHRvbSA9IGZhY3RvcnlGbihCT1RUT00pO1xuTWUubGVmdCA9IGZhY3RvcnlGbihMRUZUKTtcblxuTWUucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0dmFyIHNjcm9sbCA9IHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5nZXRSYXdTY3JvbGxQb3NpdGlvbigpO1xuXHR2YXIgeCA9IFBvc2l0aW9uLngoc2Nyb2xsLngpO1xuXHR2YXIgeSA9IFBvc2l0aW9uLnkoc2Nyb2xsLnkpO1xuXG5cdHZhciBzaXplID0gdmlld3BvcnRTaXplKHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5jb250ZW50RG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcblxuXHRzd2l0Y2godGhpcy5fcG9zaXRpb24pIHtcblx0XHRjYXNlIFRPUDogcmV0dXJuIHk7XG5cdFx0Y2FzZSBSSUdIVDogcmV0dXJuIHgucGx1cyhQb3NpdGlvbi54KHNpemUud2lkdGgpKTtcblx0XHRjYXNlIEJPVFRPTTogcmV0dXJuIHkucGx1cyhQb3NpdGlvbi55KHNpemUuaGVpZ2h0KSk7XG5cdFx0Y2FzZSBMRUZUOiByZXR1cm4geDtcblxuXHRcdGRlZmF1bHQ6IGVuc3VyZS51bnJlYWNoYWJsZSgpO1xuXHR9XG59O1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX3Bvc2l0aW9uICsgXCIgZWRnZSBvZiB2aWV3cG9ydFwiO1xufTtcblxuZnVuY3Rpb24gZmFjdG9yeUZuKHBvc2l0aW9uKSB7XG5cdHJldHVybiBmdW5jdGlvbiBmYWN0b3J5KGNvbnRlbnQpIHtcblx0XHRyZXR1cm4gbmV3IE1lKHBvc2l0aW9uLCBjb250ZW50KTtcblx0fTtcbn1cblxuXG5cbi8vIFVTRUZVTCBSRUFESU5HOiBodHRwOi8vd3d3LnF1aXJrc21vZGUub3JnL21vYmlsZS92aWV3cG9ydHMuaHRtbFxuLy8gYW5kIGh0dHA6Ly93d3cucXVpcmtzbW9kZS5vcmcvbW9iaWxlL3ZpZXdwb3J0czIuaHRtbFxuXG4vLyBCUk9XU0VSUyBURVNURUQ6IFNhZmFyaSA2LjIuMCAoTWFjIE9TIFggMTAuOC41KTsgTW9iaWxlIFNhZmFyaSA3LjAuMCAoaU9TIDcuMSk7IEZpcmVmb3ggMzIuMC4wIChNYWMgT1MgWCAxMC44KTtcbi8vICAgIEZpcmVmb3ggMzMuMC4wIChXaW5kb3dzIDcpOyBDaHJvbWUgMzguMC4yMTI1IChNYWMgT1MgWCAxMC44LjUpOyBDaHJvbWUgMzguMC4yMTI1IChXaW5kb3dzIDcpOyBJRSA4LCA5LCAxMCwgMTFcblxuLy8gV2lkdGggdGVjaG5pcXVlcyBJJ3ZlIHRyaWVkOiAoTm90ZTogcmVzdWx0cyBhcmUgZGlmZmVyZW50IGluIHF1aXJrcyBtb2RlKVxuLy8gYm9keS5jbGllbnRXaWR0aFxuLy8gYm9keS5vZmZzZXRXaWR0aFxuLy8gYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuLy8gICAgZmFpbHMgb24gYWxsIGJyb3dzZXJzOiBkb2Vzbid0IGluY2x1ZGUgbWFyZ2luXG4vLyBib2R5LnNjcm9sbFdpZHRoXG4vLyAgICB3b3JrcyBvbiBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZVxuLy8gICAgZmFpbHMgb24gRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiBkb2Vzbid0IGluY2x1ZGUgbWFyZ2luXG4vLyBodG1sLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoXG4vLyBodG1sLm9mZnNldFdpZHRoXG4vLyAgICB3b3JrcyBvbiBTYWZhcmksIE1vYmlsZSBTYWZhcmksIENocm9tZSwgRmlyZWZveFxuLy8gICAgZmFpbHMgb24gSUUgOCwgOSwgMTA6IGluY2x1ZGVzIHNjcm9sbGJhclxuLy8gaHRtbC5zY3JvbGxXaWR0aFxuLy8gaHRtbC5jbGllbnRXaWR0aFxuLy8gICAgV09SS1MhIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTFcblxuLy8gSGVpZ2h0IHRlY2huaXF1ZXMgSSd2ZSB0cmllZDogKE5vdGUgdGhhdCByZXN1bHRzIGFyZSBkaWZmZXJlbnQgaW4gcXVpcmtzIG1vZGUpXG4vLyBib2R5LmNsaWVudEhlaWdodFxuLy8gYm9keS5vZmZzZXRIZWlnaHRcbi8vIGJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0XG4vLyAgICBmYWlscyBvbiBhbGwgYnJvd3NlcnM6IG9ubHkgaW5jbHVkZXMgaGVpZ2h0IG9mIGNvbnRlbnRcbi8vIGJvZHkgZ2V0Q29tcHV0ZWRTdHlsZShcImhlaWdodFwiKVxuLy8gICAgZmFpbHMgb24gYWxsIGJyb3dzZXJzOiBJRTggcmV0dXJucyBcImF1dG9cIjsgb3RoZXJzIG9ubHkgaW5jbHVkZSBoZWlnaHQgb2YgY29udGVudFxuLy8gYm9keS5zY3JvbGxIZWlnaHRcbi8vICAgIHdvcmtzIG9uIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lO1xuLy8gICAgZmFpbHMgb24gRmlyZWZveCwgSUUgOCwgOSwgMTAsIDExOiBvbmx5IGluY2x1ZGVzIGhlaWdodCBvZiBjb250ZW50XG4vLyBodG1sLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodFxuLy8gaHRtbC5vZmZzZXRIZWlnaHRcbi8vICAgIHdvcmtzIG9uIElFIDgsIDksIDEwXG4vLyAgICBmYWlscyBvbiBJRSAxMSwgU2FmYXJpLCBNb2JpbGUgU2FmYXJpLCBDaHJvbWU6IG9ubHkgaW5jbHVkZXMgaGVpZ2h0IG9mIGNvbnRlbnRcbi8vIGh0bWwuc2Nyb2xsSGVpZ2h0XG4vLyAgICB3b3JrcyBvbiBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTFcbi8vICAgIGZhaWxzIG9uIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lOiBvbmx5IGluY2x1ZGVzIGhlaWdodCBvZiBjb250ZW50XG4vLyBodG1sLmNsaWVudEhlaWdodFxuLy8gICAgV09SS1MhIFNhZmFyaSwgTW9iaWxlIFNhZmFyaSwgQ2hyb21lLCBGaXJlZm94LCBJRSA4LCA5LCAxMCwgMTFcbmZ1bmN0aW9uIHZpZXdwb3J0U2l6ZShodG1sRWxlbWVudCkge1xuXHRyZXR1cm4ge1xuXHRcdHdpZHRoOiBodG1sRWxlbWVudC5jbGllbnRXaWR0aCxcblx0XHRoZWlnaHQ6IGh0bWxFbGVtZW50LmNsaWVudEhlaWdodFxuXHR9O1xufVxuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBzaGltID0gcmVxdWlyZShcIi4vdXRpbC9zaGltLmpzXCIpO1xudmFyIGNhbWVsY2FzZSA9IHJlcXVpcmUoXCIuLi92ZW5kb3IvY2FtZWxjYXNlLTEuMC4xLW1vZGlmaWVkLmpzXCIpO1xudmFyIEVsZW1lbnRSZW5kZXJlZCA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL2VsZW1lbnRfcmVuZGVyZWQuanNcIik7XG52YXIgRWxlbWVudEVkZ2UgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9lbGVtZW50X2VkZ2UuanNcIik7XG52YXIgQ2VudGVyID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvY2VudGVyLmpzXCIpO1xudmFyIEdlbmVyaWNTaXplID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvZ2VuZXJpY19zaXplLmpzXCIpO1xudmFyIEFzc2VydGFibGUgPSByZXF1aXJlKFwiLi9hc3NlcnRhYmxlLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFFFbGVtZW50KGRvbUVsZW1lbnQsIG5pY2tuYW1lKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbT2JqZWN0LCBbU3RyaW5nLCB1bmRlZmluZWRdXSk7XG5cdGlmIChuaWNrbmFtZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0bmlja25hbWUgPSBkb21FbGVtZW50LmlkIHx8IGRvbUVsZW1lbnQudGFnTmFtZTtcblx0fVxuXG5cdHRoaXMuX2RvbUVsZW1lbnQgPSBkb21FbGVtZW50O1xuXHR0aGlzLl9uaWNrbmFtZSA9IG5pY2tuYW1lO1xuXG5cdC8vIHByb3BlcnRpZXNcblx0dGhpcy50b3AgPSBFbGVtZW50RWRnZS50b3AodGhpcyk7XG5cdHRoaXMucmlnaHQgPSBFbGVtZW50RWRnZS5yaWdodCh0aGlzKTtcblx0dGhpcy5ib3R0b20gPSBFbGVtZW50RWRnZS5ib3R0b20odGhpcyk7XG5cdHRoaXMubGVmdCA9IEVsZW1lbnRFZGdlLmxlZnQodGhpcyk7XG5cblx0dGhpcy5jZW50ZXIgPSBDZW50ZXIueCh0aGlzLmxlZnQsIHRoaXMucmlnaHQsIFwiY2VudGVyIG9mIFwiICsgdGhpcyk7XG5cdHRoaXMubWlkZGxlID0gQ2VudGVyLnkodGhpcy50b3AsIHRoaXMuYm90dG9tLCBcIm1pZGRsZSBvZiBcIiArIHRoaXMpO1xuXG5cdHRoaXMud2lkdGggPSBHZW5lcmljU2l6ZS5jcmVhdGUodGhpcy5sZWZ0LCB0aGlzLnJpZ2h0LCBcIndpZHRoIG9mIFwiICsgdGhpcyk7XG5cdHRoaXMuaGVpZ2h0ID0gR2VuZXJpY1NpemUuY3JlYXRlKHRoaXMudG9wLCB0aGlzLmJvdHRvbSwgXCJoZWlnaHQgb2YgXCIgKyB0aGlzKTtcblxuXHR0aGlzLnJlbmRlcmVkID0gRWxlbWVudFJlbmRlcmVkLmNyZWF0ZSh0aGlzKTtcbn07XG5Bc3NlcnRhYmxlLmV4dGVuZChNZSk7XG5cbk1lLnByb3RvdHlwZS5nZXRSYXdTdHlsZSA9IGZ1bmN0aW9uKHN0eWxlTmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW1N0cmluZ10pO1xuXG5cdHZhciBzdHlsZXM7XG5cdHZhciByZXN1bHQ7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBnZXRDb21wdXRlZFN0eWxlKClcblx0aWYgKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKSB7XG5cdFx0Ly8gV09SS0FST1VORCBGaXJlZm94IDQwLjAuMzogbXVzdCB1c2UgZnJhbWUncyBjb250ZW50V2luZG93IChyZWYgaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTIwNDA2Milcblx0XHRzdHlsZXMgPSB0aGlzLmNvbnRleHQoKS5jb250ZW50V2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5fZG9tRWxlbWVudCk7XG5cdFx0cmVzdWx0ID0gc3R5bGVzLmdldFByb3BlcnR5VmFsdWUoc3R5bGVOYW1lKTtcblx0fVxuXHRlbHNlIHtcblx0XHRzdHlsZXMgPSB0aGlzLl9kb21FbGVtZW50LmN1cnJlbnRTdHlsZTtcblx0XHRyZXN1bHQgPSBzdHlsZXNbY2FtZWxjYXNlKHN0eWxlTmFtZSldO1xuXHR9XG5cdGlmIChyZXN1bHQgPT09IG51bGwgfHwgcmVzdWx0ID09PSB1bmRlZmluZWQpIHJlc3VsdCA9IFwiXCI7XG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG5NZS5wcm90b3R5cGUuZ2V0UmF3UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IE5vIFRleHRSZWN0YW5nbGUuaGVpZ2h0IG9yIC53aWR0aFxuXHR2YXIgcmVjdCA9IHRoaXMuX2RvbUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdHJldHVybiB7XG5cdFx0bGVmdDogcmVjdC5sZWZ0LFxuXHRcdHJpZ2h0OiByZWN0LnJpZ2h0LFxuXHRcdHdpZHRoOiByZWN0LndpZHRoICE9PSB1bmRlZmluZWQgPyByZWN0LndpZHRoIDogcmVjdC5yaWdodCAtIHJlY3QubGVmdCxcblxuXHRcdHRvcDogcmVjdC50b3AsXG5cdFx0Ym90dG9tOiByZWN0LmJvdHRvbSxcblx0XHRoZWlnaHQ6IHJlY3QuaGVpZ2h0ICE9PSB1bmRlZmluZWQgPyByZWN0LmhlaWdodCA6IHJlY3QuYm90dG9tIC0gcmVjdC50b3Bcblx0fTtcbn07XG5cbk1lLnByb3RvdHlwZS5jYWxjdWxhdGVQaXhlbFZhbHVlID0gZnVuY3Rpb24oc2l6ZVN0cmluZykge1xuXHR2YXIgZG9tID0gdGhpcy5fZG9tRWxlbWVudDtcblx0aWYgKGRvbS5ydW50aW1lU3R5bGUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGllOFdvcmthcm91bmQoKTtcblxuXHR2YXIgcmVzdWx0O1xuXHR2YXIgc3R5bGUgPSBkb20uc3R5bGU7XG5cdHZhciBvbGRQb3NpdGlvbiA9IHN0eWxlLnBvc2l0aW9uO1xuXHR2YXIgb2xkTGVmdCA9IHN0eWxlLmxlZnQ7XG5cblx0c3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG5cdHN0eWxlLmxlZnQgPSBzaXplU3RyaW5nO1xuXHRyZXN1bHQgPSBwYXJzZUZsb2F0KHRoaXMuZ2V0UmF3U3R5bGUoXCJsZWZ0XCIpKTsgICAgLy8gcGFyc2VJbnQgc3RyaXBzIG9mZiAncHgnIHZhbHVlXG5cblx0c3R5bGUucG9zaXRpb24gPSBvbGRQb3NpdGlvbjtcblx0c3R5bGUubGVmdCA9IG9sZExlZnQ7XG5cdHJldHVybiByZXN1bHQ7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBnZXRSYXdTdHlsZSgpIGRvZXNuJ3Qgbm9ybWFsaXplIHZhbHVlcyB0byBweFxuXHQvLyBCYXNlZCBvbiBjb2RlIGJ5IERlYW4gRWR3YXJkczogaHR0cDovL2Rpc3EudXMvcC9teWw5OXhcblx0ZnVuY3Rpb24gaWU4V29ya2Fyb3VuZCgpIHtcblx0XHR2YXIgcnVudGltZVN0eWxlTGVmdCA9IGRvbS5ydW50aW1lU3R5bGUubGVmdDtcblx0XHR2YXIgc3R5bGVMZWZ0ID0gZG9tLnN0eWxlLmxlZnQ7XG5cblx0XHRkb20ucnVudGltZVN0eWxlLmxlZnQgPSBkb20uY3VycmVudFN0eWxlLmxlZnQ7XG5cdFx0ZG9tLnN0eWxlLmxlZnQgPSBzaXplU3RyaW5nO1xuXHRcdHJlc3VsdCA9IGRvbS5zdHlsZS5waXhlbExlZnQ7XG5cblx0XHRkb20ucnVudGltZVN0eWxlLmxlZnQgPSBydW50aW1lU3R5bGVMZWZ0O1xuXHRcdGRvbS5zdHlsZS5sZWZ0ID0gc3R5bGVMZWZ0O1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cbn07XG5cbk1lLnByb3RvdHlwZS5wYXJlbnQgPSBmdW5jdGlvbihuaWNrbmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW1sgdW5kZWZpbmVkLCBTdHJpbmcgXV0pO1xuXHRpZiAobmlja25hbWUgPT09IHVuZGVmaW5lZCkgbmlja25hbWUgPSBcInBhcmVudCBvZiBcIiArIHRoaXMuX25pY2tuYW1lO1xuXG5cdHZhciBwYXJlbnRCb2R5ID0gdGhpcy5jb250ZXh0KCkuYm9keSgpO1xuXHRpZiAodGhpcy5lcXVhbHMocGFyZW50Qm9keSkpIHJldHVybiBudWxsO1xuXG5cdHZhciBwYXJlbnQgPSB0aGlzLl9kb21FbGVtZW50LnBhcmVudEVsZW1lbnQ7XG5cdGlmIChwYXJlbnQgPT09IG51bGwpIHJldHVybiBudWxsO1xuXG5cdHJldHVybiBuZXcgTWUocGFyZW50LCBuaWNrbmFtZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oaHRtbCwgbmlja25hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nLCBbIHVuZGVmaW5lZCwgU3RyaW5nIF0gXSk7XG5cdGlmIChuaWNrbmFtZSA9PT0gdW5kZWZpbmVkKSBuaWNrbmFtZSA9IGh0bWwgKyBcIiBpbiBcIiArIHRoaXMuX25pY2tuYW1lO1xuXG5cdHZhciB0ZW1wRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdHRlbXBFbGVtZW50LmlubmVySFRNTCA9IHNoaW0uU3RyaW5nLnRyaW0oaHRtbCk7XG5cdGVuc3VyZS50aGF0KFxuXHRcdHRlbXBFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoID09PSAxLFxuXHRcdFwiRXhwZWN0ZWQgb25lIGVsZW1lbnQsIGJ1dCBnb3QgXCIgKyB0ZW1wRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCArIFwiIChcIiArIGh0bWwgKyBcIilcIlxuXHQpO1xuXG5cdHZhciBpbnNlcnRlZEVsZW1lbnQgPSB0ZW1wRWxlbWVudC5jaGlsZE5vZGVzWzBdO1xuXHR0aGlzLl9kb21FbGVtZW50LmFwcGVuZENoaWxkKGluc2VydGVkRWxlbWVudCk7XG5cdHJldHVybiBuZXcgTWUoaW5zZXJ0ZWRFbGVtZW50LCBuaWNrbmFtZSk7XG59O1xuXG5NZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHNoaW0uRWxlbWVudC5yZW1vdmUodGhpcy5fZG9tRWxlbWVudCk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihlbGVtZW50KSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE1lIF0pO1xuXHRyZXR1cm4gdGhpcy50b0RvbUVsZW1lbnQoKS5jb250YWlucyhlbGVtZW50LnRvRG9tRWxlbWVudCgpKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b0RvbUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXMuX2RvbUVsZW1lbnQ7XG59O1xuXG5NZS5wcm90b3R5cGUuY29udGV4dCA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHZhciBCcm93c2luZ0NvbnRleHQgPSByZXF1aXJlKFwiLi9icm93c2luZ19jb250ZXh0LmpzXCIpOyAgIC8vIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY3lcblx0cmV0dXJuIG5ldyBCcm93c2luZ0NvbnRleHQodGhpcy5fZG9tRWxlbWVudC5vd25lckRvY3VtZW50KTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gXCInXCIgKyB0aGlzLl9uaWNrbmFtZSArIFwiJ1wiO1xufTtcblxuTWUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKHRoYXQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUgXSk7XG5cdHJldHVybiB0aGlzLl9kb21FbGVtZW50ID09PSB0aGF0Ll9kb21FbGVtZW50O1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFFFbGVtZW50ID0gcmVxdWlyZShcIi4vcV9lbGVtZW50LmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFFFbGVtZW50TGlzdChub2RlTGlzdCwgbmlja25hbWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgT2JqZWN0LCBTdHJpbmcgXSk7XG5cblx0dGhpcy5fbm9kZUxpc3QgPSBub2RlTGlzdDtcblx0dGhpcy5fbmlja25hbWUgPSBuaWNrbmFtZTtcbn07XG5cbk1lLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiBsZW5ndGgoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIHRoaXMuX25vZGVMaXN0Lmxlbmd0aDtcbn07XG5cbk1lLnByb3RvdHlwZS5hdCA9IGZ1bmN0aW9uIGF0KHJlcXVlc3RlZEluZGV4LCBuaWNrbmFtZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBOdW1iZXIsIFt1bmRlZmluZWQsIFN0cmluZ10gXSk7XG5cblx0dmFyIGluZGV4ID0gcmVxdWVzdGVkSW5kZXg7XG5cdHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aCgpO1xuXHRpZiAoaW5kZXggPCAwKSBpbmRleCA9IGxlbmd0aCArIGluZGV4O1xuXG5cdGVuc3VyZS50aGF0KFxuXHRcdGluZGV4ID49IDAgJiYgaW5kZXggPCBsZW5ndGgsXG5cdFx0XCInXCIgKyB0aGlzLl9uaWNrbmFtZSArIFwiJ1tcIiArIHJlcXVlc3RlZEluZGV4ICsgXCJdIGlzIG91dCBvZiBib3VuZHM7IGxpc3QgbGVuZ3RoIGlzIFwiICsgbGVuZ3RoXG5cdCk7XG5cdHZhciBlbGVtZW50ID0gdGhpcy5fbm9kZUxpc3RbaW5kZXhdO1xuXG5cdGlmIChuaWNrbmFtZSA9PT0gdW5kZWZpbmVkKSBuaWNrbmFtZSA9IHRoaXMuX25pY2tuYW1lICsgXCJbXCIgKyBpbmRleCArIFwiXVwiO1xuXHRyZXR1cm4gbmV3IFFFbGVtZW50KGVsZW1lbnQsIG5pY2tuYW1lKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiBcIidcIiArIHRoaXMuX25pY2tuYW1lICsgXCInIGxpc3RcIjtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBzaGltID0gcmVxdWlyZShcIi4vdXRpbC9zaGltLmpzXCIpO1xudmFyIEJyb3dzaW5nQ29udGV4dCA9IHJlcXVpcmUoXCIuL2Jyb3dzaW5nX2NvbnRleHQuanNcIik7XG52YXIgYXN5bmMgPSByZXF1aXJlKFwiLi4vdmVuZG9yL2FzeW5jLTEuNC4yLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFFGcmFtZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHR0aGlzLl9kb21FbGVtZW50ID0gbnVsbDtcblx0dGhpcy5fbG9hZGVkID0gZmFsc2U7XG5cdHRoaXMuX3JlbW92ZWQgPSBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIGxvYWRlZChzZWxmLCB3aWR0aCwgaGVpZ2h0LCBzcmMsIHN0eWxlc2hlZXRzKSB7XG5cblx0c2VsZi5fbG9hZGVkID0gdHJ1ZTtcblx0c2VsZi5fZG9jdW1lbnQgPSBzZWxmLl9kb21FbGVtZW50LmNvbnRlbnREb2N1bWVudDtcblx0c2VsZi5fYnJvd3NpbmdDb250ZXh0ID0gbmV3IEJyb3dzaW5nQ29udGV4dChzZWxmLl9kb2N1bWVudCk7XG5cdHNlbGYuX29yaWdpbmFsQm9keSA9IHNlbGYuX2RvY3VtZW50LmJvZHkuaW5uZXJIVE1MO1xuXHRzZWxmLl9vcmlnaW5hbFdpZHRoID0gd2lkdGg7XG5cdHNlbGYuX29yaWdpbmFsSGVpZ2h0ID0gaGVpZ2h0O1xuXHRzZWxmLl9vcmlnaW5hbFNyYyA9IHNyYztcblx0c2VsZi5fb3JpZ2luYWxTdHlsZXNoZWV0cyA9IHN0eWxlc2hlZXRzO1xufVxuXG5NZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUocGFyZW50RWxlbWVudCwgb3B0aW9ucywgY2FsbGJhY2spIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtPYmplY3QsIFtPYmplY3QsIEZ1bmN0aW9uXSwgW3VuZGVmaW5lZCwgRnVuY3Rpb25dXSk7XG5cdGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0Y2FsbGJhY2sgPSBvcHRpb25zO1xuXHRcdG9wdGlvbnMgPSB7fTtcblx0fVxuXHR2YXIgd2lkdGggPSBvcHRpb25zLndpZHRoIHx8IDIwMDA7XG5cdHZhciBoZWlnaHQgPSBvcHRpb25zLmhlaWdodCB8fCAyMDAwO1xuXHR2YXIgc3JjID0gb3B0aW9ucy5zcmM7XG5cdHZhciBzdHlsZXNoZWV0cyA9IG9wdGlvbnMuc3R5bGVzaGVldCB8fCBbXTtcblx0dmFyIGNzcyA9IG9wdGlvbnMuY3NzO1xuXHRpZiAoIXNoaW0uQXJyYXkuaXNBcnJheShzdHlsZXNoZWV0cykpIHN0eWxlc2hlZXRzID0gWyBzdHlsZXNoZWV0cyBdO1xuXG5cdHZhciBmcmFtZSA9IG5ldyBNZSgpO1xuXHRjaGVja1VybHMoc3JjLCBzdHlsZXNoZWV0cywgZnVuY3Rpb24oZXJyKSB7XG5cdFx0aWYgKGVycikgcmV0dXJuIGNhbGxiYWNrKGVycik7XG5cblx0XHR2YXIgaWZyYW1lID0gaW5zZXJ0SWZyYW1lKHBhcmVudEVsZW1lbnQsIHdpZHRoLCBoZWlnaHQpO1xuXHRcdHNoaW0uRXZlbnRUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihpZnJhbWUsIFwibG9hZFwiLCBvbkZyYW1lTG9hZCk7XG5cdFx0c2V0SWZyYW1lQ29udGVudChpZnJhbWUsIHNyYyk7XG5cblx0XHRmcmFtZS5fZG9tRWxlbWVudCA9IGlmcmFtZTtcblx0XHRzZXRGcmFtZUxvYWRDYWxsYmFjayhmcmFtZSwgY2FsbGJhY2spO1xuXHR9KTtcblx0cmV0dXJuIGZyYW1lO1xuXG5cdGZ1bmN0aW9uIG9uRnJhbWVMb2FkKCkge1xuXHRcdC8vIFdPUktBUk9VTkQgTW9iaWxlIFNhZmFyaSA3LjAuMCwgU2FmYXJpIDYuMi4wLCBDaHJvbWUgMzguMC4yMTI1OiBmcmFtZSBpcyBsb2FkZWQgc3luY2hyb25vdXNseVxuXHRcdC8vIFdlIGZvcmNlIGl0IHRvIGJlIGFzeW5jaHJvbm91cyBoZXJlXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdGxvYWRlZChmcmFtZSwgd2lkdGgsIGhlaWdodCwgc3JjLCBzdHlsZXNoZWV0cyk7XG5cdFx0XHRhZGRTdHlsZXNoZWV0TGlua1RhZ3MoZnJhbWUsIHN0eWxlc2hlZXRzLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKGNzcykgYWRkU3R5bGVUYWcoZnJhbWUsIG9wdGlvbnMuY3NzKTtcblx0XHRcdFx0ZnJhbWUuX2ZyYW1lTG9hZENhbGxiYWNrKG51bGwsIGZyYW1lKTtcblx0XHRcdH0pO1xuXHRcdH0sIDApO1xuXHR9XG59O1xuXG5mdW5jdGlvbiBzZXRGcmFtZUxvYWRDYWxsYmFjayhmcmFtZSwgY2FsbGJhY2spIHtcblx0ZnJhbWUuX2ZyYW1lTG9hZENhbGxiYWNrID0gY2FsbGJhY2s7XG59XG5cbmZ1bmN0aW9uIGNoZWNrVXJscyhzcmMsIHN0eWxlc2hlZXRzLCBjYWxsYmFjaykge1xuXHR1cmxFeGlzdHMoc3JjLCBmdW5jdGlvbihlcnIsIHNyY0V4aXN0cykge1xuXHRcdGlmIChlcnIpIHJldHVybiBjYWxsYmFjayhlcnIpO1xuXHRcdGlmICghc3JjRXhpc3RzKSByZXR1cm4gY2FsbGJhY2soZXJyb3IoXCJzcmNcIiwgc3JjKSk7XG5cblx0XHRhc3luYy5lYWNoKHN0eWxlc2hlZXRzLCBjaGVja1N0eWxlc2hlZXQsIGNhbGxiYWNrKTtcblx0fSk7XG5cblx0ZnVuY3Rpb24gY2hlY2tTdHlsZXNoZWV0KHVybCwgY2FsbGJhY2syKSB7XG5cdFx0dXJsRXhpc3RzKHVybCwgZnVuY3Rpb24oZXJyLCBzdHlsZXNoZWV0RXhpc3RzKSB7XG5cdFx0XHRpZiAoZXJyKSByZXR1cm4gY2FsbGJhY2syKGVycik7XG5cblx0XHRcdGlmICghc3R5bGVzaGVldEV4aXN0cykgcmV0dXJuIGNhbGxiYWNrMihlcnJvcihcInN0eWxlc2hlZXRcIiwgdXJsKSk7XG5cdFx0XHRlbHNlIHJldHVybiBjYWxsYmFjazIobnVsbCk7XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBlcnJvcihuYW1lLCB1cmwpIHtcblx0XHRyZXR1cm4gbmV3IEVycm9yKFwiNDA0IGVycm9yIHdoaWxlIGxvYWRpbmcgXCIgKyBuYW1lICsgXCIgKFwiICsgdXJsICsgXCIpXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHVybEV4aXN0cyh1cmwsIGNhbGxiYWNrKSB7XG5cdHZhciBTVEFUVVNfQVZBSUxBQkxFID0gMjsgICAvLyBXT1JLQVJPVU5EIElFIDg6IG5vbi1zdGFuZGFyZCBYTUxIdHRwUmVxdWVzdCBjb25zdGFudCBuYW1lc1xuXG5cdGlmICh1cmwgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWxsYmFjayhudWxsLCB0cnVlKTtcblx0fVxuXG5cdHZhciBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cdGh0dHAub3BlbihcIkhFQURcIiwgdXJsKTtcblx0aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHsgIC8vIFdPUktBUk9VTkQgSUUgODogZG9lc24ndCBzdXBwb3J0IC5hZGRFdmVudExpc3RlbmVyKCkgb3IgLm9ubG9hZFxuXHRcdGlmIChodHRwLnJlYWR5U3RhdGUgPT09IFNUQVRVU19BVkFJTEFCTEUpIHtcblx0XHRcdHJldHVybiBjYWxsYmFjayhudWxsLCBodHRwLnN0YXR1cyAhPT0gNDA0KTtcblx0XHR9XG5cdH07XG5cdGh0dHAub25lcnJvciA9IGZ1bmN0aW9uKCkgeyAgICAgLy8gb25lcnJvciBoYW5kbGVyIGlzIG5vdCB0ZXN0ZWRcblx0XHRyZXR1cm4gY2FsbGJhY2soXCJYTUxIdHRwUmVxdWVzdCBlcnJvciB3aGlsZSB1c2luZyBIVFRQIEhFQUQgb24gVVJMICdcIiArIHVybCArIFwiJzogXCIgKyBodHRwLnN0YXR1c1RleHQpO1xuXHR9O1xuXHRodHRwLnNlbmQoKTtcbn1cblxuZnVuY3Rpb24gaW5zZXJ0SWZyYW1lKHBhcmVudEVsZW1lbnQsIHdpZHRoLCBoZWlnaHQpIHtcblx0dmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCB3aWR0aCk7XG5cdGlmcmFtZS5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblx0aWZyYW1lLnNldEF0dHJpYnV0ZShcImZyYW1lYm9yZGVyXCIsIFwiMFwiKTsgICAgLy8gV09SS0FST1VORCBJRSA4OiBkb24ndCBpbmNsdWRlIGZyYW1lIGJvcmRlciBpbiBwb3NpdGlvbiBjYWxjc1xuXHRwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKGlmcmFtZSk7XG5cdHJldHVybiBpZnJhbWU7XG59XG5cbmZ1bmN0aW9uIHNldElmcmFtZUNvbnRlbnQoaWZyYW1lLCBzcmMpIHtcblx0aWYgKHNyYyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0d3JpdGVTdGFuZGFyZHNNb2RlSHRtbChpZnJhbWUpO1xuXHR9XHRlbHNlIHtcblx0XHRzZXRJZnJhbWVTcmMoaWZyYW1lLCBzcmMpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHNldElmcmFtZVNyYyhpZnJhbWUsIHNyYykge1xuXHRpZnJhbWUuc2V0QXR0cmlidXRlKFwic3JjXCIsIHNyYyk7XG59XG5cbmZ1bmN0aW9uIHdyaXRlU3RhbmRhcmRzTW9kZUh0bWwoaWZyYW1lKSB7XG5cdHZhciBzdGFuZGFyZHNNb2RlID0gXCI8IURPQ1RZUEUgaHRtbD5cXG48aHRtbD48aGVhZD48L2hlYWQ+PGJvZHk+PC9ib2R5PjwvaHRtbD5cIjtcblx0aWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQub3BlbigpO1xuXHRpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC53cml0ZShzdGFuZGFyZHNNb2RlKTtcblx0aWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuY2xvc2UoKTtcbn1cblxuZnVuY3Rpb24gYWRkU3R5bGVzaGVldExpbmtUYWdzKHNlbGYsIHVybHMsIGNhbGxiYWNrKSB7XG5cdGFzeW5jLmVhY2godXJscywgYWRkTGlua1RhZywgY2FsbGJhY2spO1xuXG5cdGZ1bmN0aW9uIGFkZExpbmtUYWcodXJsLCBvbkxpbmtMb2FkKSB7XG5cdFx0dmFyIGxpbmsgPSBzZWxmLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcblx0XHRzaGltLkV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIobGluaywgXCJsb2FkXCIsIGZ1bmN0aW9uKGV2ZW50KSB7IG9uTGlua0xvYWQobnVsbCk7IH0pO1xuXHRcdGxpbmsuc2V0QXR0cmlidXRlKFwicmVsXCIsIFwic3R5bGVzaGVldFwiKTtcblx0XHRsaW5rLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJ0ZXh0L2Nzc1wiKTtcblx0XHRsaW5rLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgdXJsKTtcblx0XHRzaGltLkRvY3VtZW50LmhlYWQoc2VsZi5fZG9jdW1lbnQpLmFwcGVuZENoaWxkKGxpbmspO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlVGFnKHNlbGYsIGNzcykge1xuXHR2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG5cdHN0eWxlLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJ0ZXh0L2Nzc1wiKTtcblx0aWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcblx0XHQvLyBXT1JLQVJPVU5EIElFIDg6IFRocm93cyAndW5rbm93biBydW50aW1lIGVycm9yJyBpZiB5b3Ugc2V0IGlubmVySFRNTCBvbiBhIDxzdHlsZT4gdGFnXG5cdFx0c3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHN0eWxlLmlubmVySFRNTCA9IGNzcztcblx0fVxuXHRzaGltLkRvY3VtZW50LmhlYWQoc2VsZi5fZG9jdW1lbnQpLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuTWUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHR0aGlzLl9kb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IHRoaXMuX29yaWdpbmFsQm9keTtcblx0dGhpcy5zY3JvbGwoMCwgMCk7XG5cdHRoaXMucmVzaXplKHRoaXMuX29yaWdpbmFsV2lkdGgsIHRoaXMuX29yaWdpbmFsSGVpZ2h0KTtcbn07XG5cbk1lLnByb3RvdHlwZS5yZWxvYWQgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW0Z1bmN0aW9uXSk7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHR2YXIgZnJhbWUgPSB0aGlzO1xuXHR2YXIgaWZyYW1lID0gdGhpcy5fZG9tRWxlbWVudDtcblx0dmFyIHNyYyA9IHRoaXMuX29yaWdpbmFsU3JjO1xuXG5cdHRoaXMucmVzaXplKHRoaXMuX29yaWdpbmFsV2lkdGgsIHRoaXMuX29yaWdpbmFsSGVpZ2h0KTtcblx0c2V0RnJhbWVMb2FkQ2FsbGJhY2soZnJhbWUsIGNhbGxiYWNrKTtcblx0c2V0SWZyYW1lQ29udGVudChpZnJhbWUsIHNyYyk7XG59O1xuXG5NZS5wcm90b3R5cGUudG9Eb21FbGVtZW50ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHRyZXR1cm4gdGhpcy5fZG9tRWxlbWVudDtcbn07XG5cbk1lLnByb3RvdHlwZS50b0Jyb3dzaW5nQ29udGV4dCA9IGZ1bmN0aW9uKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2Jyb3dzaW5nQ29udGV4dDtcbn07XG5cbk1lLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0ZW5zdXJlTG9hZGVkKHRoaXMpO1xuXHRpZiAodGhpcy5fcmVtb3ZlZCkgcmV0dXJuO1xuXG5cdHRoaXMuX2RvbUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9kb21FbGVtZW50KTtcblx0dGhpcy5fcmVtb3ZlZCA9IHRydWU7XG59O1xuXG5NZS5wcm90b3R5cGUudmlld3BvcnQgPSBmdW5jdGlvbigpIHtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHJldHVybiB0aGlzLl9icm93c2luZ0NvbnRleHQudmlld3BvcnQoKTtcbn07XG5cbk1lLnByb3RvdHlwZS5wYWdlID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHRyZXR1cm4gdGhpcy5fYnJvd3NpbmdDb250ZXh0LnBhZ2UoKTtcbn07XG5cbk1lLnByb3RvdHlwZS5ib2R5ID0gZnVuY3Rpb24oKSB7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHRyZXR1cm4gdGhpcy5fYnJvd3NpbmdDb250ZXh0LmJvZHkoKTtcbn07XG5cbk1lLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihodG1sLCBuaWNrbmFtZSkge1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5hZGQoaHRtbCwgbmlja25hbWUpO1xufTtcblxuTWUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBuaWNrbmFtZSkge1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0cmV0dXJuIHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5nZXQoc2VsZWN0b3IsIG5pY2tuYW1lKTtcbn07XG5cbk1lLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihzZWxlY3Rvciwgbmlja25hbWUpIHtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHJldHVybiB0aGlzLl9icm93c2luZ0NvbnRleHQuZ2V0QWxsKHNlbGVjdG9yLCBuaWNrbmFtZSk7XG59O1xuXG5NZS5wcm90b3R5cGUuc2Nyb2xsID0gZnVuY3Rpb24gc2Nyb2xsKHgsIHkpIHtcblx0ZW5zdXJlVXNhYmxlKHRoaXMpO1xuXG5cdHJldHVybiB0aGlzLl9icm93c2luZ0NvbnRleHQuc2Nyb2xsKHgsIHkpO1xufTtcblxuTWUucHJvdG90eXBlLmdldFJhd1Njcm9sbFBvc2l0aW9uID0gZnVuY3Rpb24gZ2V0UmF3U2Nyb2xsUG9zaXRpb24oKSB7XG5cdGVuc3VyZVVzYWJsZSh0aGlzKTtcblxuXHRyZXR1cm4gdGhpcy5fYnJvd3NpbmdDb250ZXh0LmdldFJhd1Njcm9sbFBvc2l0aW9uKCk7XG59O1xuXG5NZS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gcmVzaXplKHdpZHRoLCBoZWlnaHQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtOdW1iZXIsIE51bWJlcl0pO1xuXHRlbnN1cmVVc2FibGUodGhpcyk7XG5cblx0dGhpcy5fZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBcIlwiICsgd2lkdGgpO1xuXHR0aGlzLl9kb21FbGVtZW50LnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBcIlwiICsgaGVpZ2h0KTtcblx0dGhpcy5mb3JjZVJlZmxvdygpO1xufTtcblxuTWUucHJvdG90eXBlLmZvcmNlUmVmbG93ID0gZnVuY3Rpb24gZm9yY2VSZWZsb3coKSB7XG5cdHRoaXMuX2Jyb3dzaW5nQ29udGV4dC5mb3JjZVJlZmxvdygpO1xufTtcblxuZnVuY3Rpb24gZW5zdXJlVXNhYmxlKHNlbGYpIHtcblx0ZW5zdXJlTG9hZGVkKHNlbGYpO1xuXHRlbnN1cmVOb3RSZW1vdmVkKHNlbGYpO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVMb2FkZWQoc2VsZikge1xuXHRlbnN1cmUudGhhdChzZWxmLl9sb2FkZWQsIFwiUUZyYW1lIG5vdCBsb2FkZWQ6IFdhaXQgZm9yIGZyYW1lIGNyZWF0aW9uIGNhbGxiYWNrIHRvIGV4ZWN1dGUgYmVmb3JlIHVzaW5nIGZyYW1lXCIpO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVOb3RSZW1vdmVkKHNlbGYpIHtcblx0ZW5zdXJlLnRoYXQoIXNlbGYuX3JlbW92ZWQsIFwiQXR0ZW1wdGVkIHRvIHVzZSBmcmFtZSBhZnRlciBpdCB3YXMgcmVtb3ZlZFwiKTtcbn1cbiIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuL3V0aWwvZW5zdXJlLmpzXCIpO1xudmFyIFBhZ2VFZGdlID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvcGFnZV9lZGdlLmpzXCIpO1xudmFyIENlbnRlciA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL2NlbnRlci5qc1wiKTtcbnZhciBBc3NlcnRhYmxlID0gcmVxdWlyZShcIi4vYXNzZXJ0YWJsZS5qc1wiKTtcbnZhciBHZW5lcmljU2l6ZSA9IHJlcXVpcmUoXCIuL2Rlc2NyaXB0b3JzL2dlbmVyaWNfc2l6ZS5qc1wiKTtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBRUGFnZShicm93c2luZ0NvbnRleHQpIHtcblx0dmFyIEJyb3dzaW5nQ29udGV4dCA9IHJlcXVpcmUoXCIuL2Jyb3dzaW5nX2NvbnRleHQuanNcIik7ICAgLy8gYnJlYWsgY2lyY3VsYXIgZGVwZW5kZW5jeVxuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBCcm93c2luZ0NvbnRleHQgXSk7XG5cblx0Ly8gcHJvcGVydGllc1xuXHR0aGlzLnRvcCA9IFBhZ2VFZGdlLnRvcChicm93c2luZ0NvbnRleHQpO1xuXHR0aGlzLnJpZ2h0ID0gUGFnZUVkZ2UucmlnaHQoYnJvd3NpbmdDb250ZXh0KTtcblx0dGhpcy5ib3R0b20gPSBQYWdlRWRnZS5ib3R0b20oYnJvd3NpbmdDb250ZXh0KTtcblx0dGhpcy5sZWZ0ID0gUGFnZUVkZ2UubGVmdChicm93c2luZ0NvbnRleHQpO1xuXG5cdHRoaXMud2lkdGggPSBHZW5lcmljU2l6ZS5jcmVhdGUodGhpcy5sZWZ0LCB0aGlzLnJpZ2h0LCBcIndpZHRoIG9mIHBhZ2VcIik7XG5cdHRoaXMuaGVpZ2h0ID0gR2VuZXJpY1NpemUuY3JlYXRlKHRoaXMudG9wLCB0aGlzLmJvdHRvbSwgXCJoZWlnaHQgb2YgcGFnZVwiKTtcblxuXHR0aGlzLmNlbnRlciA9IENlbnRlci54KHRoaXMubGVmdCwgdGhpcy5yaWdodCwgXCJjZW50ZXIgb2YgcGFnZVwiKTtcblx0dGhpcy5taWRkbGUgPSBDZW50ZXIueSh0aGlzLnRvcCwgdGhpcy5ib3R0b20sIFwibWlkZGxlIG9mIHBhZ2VcIik7XG59O1xuQXNzZXJ0YWJsZS5leHRlbmQoTWUpO1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgVmlld3BvcnRFZGdlID0gcmVxdWlyZShcIi4vZGVzY3JpcHRvcnMvdmlld3BvcnRfZWRnZS5qc1wiKTtcbnZhciBDZW50ZXIgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9jZW50ZXIuanNcIik7XG52YXIgQXNzZXJ0YWJsZSA9IHJlcXVpcmUoXCIuL2Fzc2VydGFibGUuanNcIik7XG52YXIgR2VuZXJpY1NpemUgPSByZXF1aXJlKFwiLi9kZXNjcmlwdG9ycy9nZW5lcmljX3NpemUuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUVZpZXdwb3J0KGJyb3dzaW5nQ29udGV4dCkge1xuXHR2YXIgQnJvd3NpbmdDb250ZXh0ID0gcmVxdWlyZShcIi4vYnJvd3NpbmdfY29udGV4dFwiKTsgICAvLyBicmVhayBjaXJjdWxhciBkZXBlbmRlbmN5XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIEJyb3dzaW5nQ29udGV4dCBdKTtcblxuXHQvLyBwcm9wZXJ0aWVzXG5cdHRoaXMudG9wID0gVmlld3BvcnRFZGdlLnRvcChicm93c2luZ0NvbnRleHQpO1xuXHR0aGlzLnJpZ2h0ID0gVmlld3BvcnRFZGdlLnJpZ2h0KGJyb3dzaW5nQ29udGV4dCk7XG5cdHRoaXMuYm90dG9tID0gVmlld3BvcnRFZGdlLmJvdHRvbShicm93c2luZ0NvbnRleHQpO1xuXHR0aGlzLmxlZnQgPSBWaWV3cG9ydEVkZ2UubGVmdChicm93c2luZ0NvbnRleHQpO1xuXG5cdHRoaXMud2lkdGggPSBHZW5lcmljU2l6ZS5jcmVhdGUodGhpcy5sZWZ0LCB0aGlzLnJpZ2h0LCBcIndpZHRoIG9mIHZpZXdwb3J0XCIpO1xuXHR0aGlzLmhlaWdodCA9IEdlbmVyaWNTaXplLmNyZWF0ZSh0aGlzLnRvcCwgdGhpcy5ib3R0b20sIFwiaGVpZ2h0IG9mIHZpZXdwb3J0XCIpO1xuXG5cdHRoaXMuY2VudGVyID0gQ2VudGVyLngodGhpcy5sZWZ0LCB0aGlzLnJpZ2h0LCBcImNlbnRlciBvZiB2aWV3cG9ydFwiKTtcblx0dGhpcy5taWRkbGUgPSBDZW50ZXIueSh0aGlzLnRvcCwgdGhpcy5ib3R0b20sIFwibWlkZGxlIG9mIHZpZXdwb3J0XCIpO1xufTtcbkFzc2VydGFibGUuZXh0ZW5kKE1lKTtcbiIsIi8vIENvcHlyaWdodCBUaXRhbml1bSBJLlQuIExMQy5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgUUVsZW1lbnQgPSByZXF1aXJlKCcuL3FfZWxlbWVudC5qcycpO1xudmFyIFFGcmFtZSA9IHJlcXVpcmUoXCIuL3FfZnJhbWUuanNcIik7XG52YXIgYnJvd3NlciA9IHJlcXVpcmUoXCIuL2Jyb3dzZXIuanNcIik7XG5cbmV4cG9ydHMuYnJvd3NlciA9IGJyb3dzZXI7XG5cbmV4cG9ydHMuY3JlYXRlRnJhbWUgPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaykge1xuXHRyZXR1cm4gUUZyYW1lLmNyZWF0ZShkb2N1bWVudC5ib2R5LCBvcHRpb25zLCBmdW5jdGlvbihlcnIsIGNhbGxiYWNrRnJhbWUpIHtcblx0XHRpZiAoZXJyKSByZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHRicm93c2VyLmRldGVjdEJyb3dzZXJGZWF0dXJlcyhmdW5jdGlvbihlcnIpIHtcblx0XHRcdGNhbGxiYWNrKGVyciwgY2FsbGJhY2tGcmFtZSk7XG5cdFx0fSk7XG5cdH0pO1xufTtcblxuZXhwb3J0cy5lbGVtZW50RnJvbURvbSA9IGZ1bmN0aW9uKGRvbUVsZW1lbnQsIG5pY2tuYW1lKSB7XG5cdHJldHVybiBuZXcgUUVsZW1lbnQoZG9tRWxlbWVudCwgbmlja25hbWUpO1xufTtcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxMy0yMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBTZWUgTElDRU5TRS5UWFQgZm9yIGRldGFpbHMuXG5cInVzZSBzdHJpY3RcIjtcblxuLy8gUnVudGltZSBhc3NlcnRpb25zIGZvciBwcm9kdWN0aW9uIGNvZGUuIChDb250cmFzdCB0byBhc3NlcnQuanMsIHdoaWNoIGlzIGZvciB0ZXN0IGNvZGUuKVxuXG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3NoaW0uanNcIik7XG52YXIgb29wID0gcmVxdWlyZShcIi4vb29wLmpzXCIpO1xuXG5leHBvcnRzLnRoYXQgPSBmdW5jdGlvbih2YXJpYWJsZSwgbWVzc2FnZSkge1xuXHRpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkKSBtZXNzYWdlID0gXCJFeHBlY3RlZCBjb25kaXRpb24gdG8gYmUgdHJ1ZVwiO1xuXG5cdGlmICh2YXJpYWJsZSA9PT0gZmFsc2UpIHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oZXhwb3J0cy50aGF0LCBtZXNzYWdlKTtcblx0aWYgKHZhcmlhYmxlICE9PSB0cnVlKSB0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudGhhdCwgXCJFeHBlY3RlZCBjb25kaXRpb24gdG8gYmUgdHJ1ZSBvciBmYWxzZVwiKTtcbn07XG5cbmV4cG9ydHMudW5yZWFjaGFibGUgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdGlmICghbWVzc2FnZSkgbWVzc2FnZSA9IFwiVW5yZWFjaGFibGUgY29kZSBleGVjdXRlZFwiO1xuXG5cdHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oZXhwb3J0cy51bnJlYWNoYWJsZSwgbWVzc2FnZSk7XG59O1xuXG5leHBvcnRzLnNpZ25hdHVyZSA9IGZ1bmN0aW9uKGFyZ3MsIHNpZ25hdHVyZSkge1xuXHRzaWduYXR1cmUgPSBzaWduYXR1cmUgfHwgW107XG5cdHZhciBleHBlY3RlZEFyZ0NvdW50ID0gc2lnbmF0dXJlLmxlbmd0aDtcblx0dmFyIGFjdHVhbEFyZ0NvdW50ID0gYXJncy5sZW5ndGg7XG5cblx0aWYgKGFjdHVhbEFyZ0NvdW50ID4gZXhwZWN0ZWRBcmdDb3VudCkge1xuXHRcdHRocm93IG5ldyBFbnN1cmVFeGNlcHRpb24oXG5cdFx0XHRleHBvcnRzLnNpZ25hdHVyZSxcblx0XHRcdFwiRnVuY3Rpb24gY2FsbGVkIHdpdGggdG9vIG1hbnkgYXJndW1lbnRzOiBleHBlY3RlZCBcIiArIGV4cGVjdGVkQXJnQ291bnQgKyBcIiBidXQgZ290IFwiICsgYWN0dWFsQXJnQ291bnRcblx0XHQpO1xuXHR9XG5cblx0dmFyIGFyZywgdHlwZXMsIG5hbWU7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2lnbmF0dXJlLmxlbmd0aDsgaSsrKSB7XG5cdFx0YXJnID0gYXJnc1tpXTtcblx0XHR0eXBlcyA9IHNpZ25hdHVyZVtpXTtcblx0XHRuYW1lID0gXCJBcmd1bWVudCAjXCIgKyAoaSArIDEpO1xuXG5cdFx0aWYgKCFzaGltLkFycmF5LmlzQXJyYXkodHlwZXMpKSB0eXBlcyA9IFsgdHlwZXMgXTtcblx0XHRpZiAoIWFyZ01hdGNoZXNBbnlQb3NzaWJsZVR5cGUoYXJnLCB0eXBlcykpIHtcblx0XHRcdHZhciBtZXNzYWdlID0gbmFtZSArIFwiIGV4cGVjdGVkIFwiICsgZXhwbGFpblBvc3NpYmxlVHlwZXModHlwZXMpICsgXCIsIGJ1dCB3YXMgXCIgKyBleHBsYWluQXJnKGFyZyk7XG5cdFx0XHR0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMuc2lnbmF0dXJlLCBtZXNzYWdlKTtcblx0XHR9XG5cdH1cbn07XG5cbmZ1bmN0aW9uIGFyZ01hdGNoZXNBbnlQb3NzaWJsZVR5cGUoYXJnLCB0eXBlKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGg7IGkrKykge1xuXHRcdGlmIChhcmdNYXRjaGVzVHlwZShhcmcsIHR5cGVbaV0pKSByZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG5cblx0ZnVuY3Rpb24gYXJnTWF0Y2hlc1R5cGUoYXJnLCB0eXBlKSB7XG5cdFx0c3dpdGNoIChnZXRBcmdUeXBlKGFyZykpIHtcblx0XHRcdGNhc2UgXCJib29sZWFuXCI6IHJldHVybiB0eXBlID09PSBCb29sZWFuO1xuXHRcdFx0Y2FzZSBcInN0cmluZ1wiOiByZXR1cm4gdHlwZSA9PT0gU3RyaW5nO1xuXHRcdFx0Y2FzZSBcIm51bWJlclwiOiByZXR1cm4gdHlwZSA9PT0gTnVtYmVyO1xuXHRcdFx0Y2FzZSBcImFycmF5XCI6IHJldHVybiB0eXBlID09PSBBcnJheTtcblx0XHRcdGNhc2UgXCJmdW5jdGlvblwiOiByZXR1cm4gdHlwZSA9PT0gRnVuY3Rpb247XG5cdFx0XHRjYXNlIFwib2JqZWN0XCI6IHJldHVybiB0eXBlID09PSBPYmplY3QgfHwgYXJnIGluc3RhbmNlb2YgdHlwZTtcblx0XHRcdGNhc2UgXCJ1bmRlZmluZWRcIjogcmV0dXJuIHR5cGUgPT09IHVuZGVmaW5lZDtcblx0XHRcdGNhc2UgXCJudWxsXCI6IHJldHVybiB0eXBlID09PSBudWxsO1xuXHRcdFx0Y2FzZSBcIk5hTlwiOiByZXR1cm4gdHlwZW9mKHR5cGUpID09PSBcIm51bWJlclwiICYmIGlzTmFOKHR5cGUpO1xuXG5cdFx0XHRkZWZhdWx0OiBleHBvcnRzLnVucmVhY2hhYmxlKCk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGV4cGxhaW5Qb3NzaWJsZVR5cGVzKHR5cGUpIHtcblx0dmFyIGpvaW5lciA9IFwiXCI7XG5cdHZhciByZXN1bHQgPSBcIlwiO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcblx0XHRyZXN1bHQgKz0gam9pbmVyICsgZXhwbGFpbk9uZVR5cGUodHlwZVtpXSk7XG5cdFx0am9pbmVyID0gKGkgPT09IHR5cGUubGVuZ3RoIC0gMikgPyBcIiwgb3IgXCIgOiBcIiwgXCI7XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcblxuXHRmdW5jdGlvbiBleHBsYWluT25lVHlwZSh0eXBlKSB7XG5cdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRjYXNlIEJvb2xlYW46IHJldHVybiBcImJvb2xlYW5cIjtcblx0XHRcdGNhc2UgU3RyaW5nOiByZXR1cm4gXCJzdHJpbmdcIjtcblx0XHRcdGNhc2UgTnVtYmVyOiByZXR1cm4gXCJudW1iZXJcIjtcblx0XHRcdGNhc2UgQXJyYXk6IHJldHVybiBcImFycmF5XCI7XG5cdFx0XHRjYXNlIEZ1bmN0aW9uOiByZXR1cm4gXCJmdW5jdGlvblwiO1xuXHRcdFx0Y2FzZSBudWxsOiByZXR1cm4gXCJudWxsXCI7XG5cdFx0XHRjYXNlIHVuZGVmaW5lZDogcmV0dXJuIFwidW5kZWZpbmVkXCI7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwibnVtYmVyXCIgJiYgaXNOYU4odHlwZSkpIHJldHVybiBcIk5hTlwiO1xuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gb29wLmNsYXNzTmFtZSh0eXBlKSArIFwiIGluc3RhbmNlXCI7XG5cdFx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZXhwbGFpbkFyZyhhcmcpIHtcblx0dmFyIHR5cGUgPSBnZXRBcmdUeXBlKGFyZyk7XG5cdGlmICh0eXBlICE9PSBcIm9iamVjdFwiKSByZXR1cm4gdHlwZTtcblxuXHRyZXR1cm4gb29wLmluc3RhbmNlTmFtZShhcmcpICsgXCIgaW5zdGFuY2VcIjtcbn1cblxuZnVuY3Rpb24gZ2V0QXJnVHlwZSh2YXJpYWJsZSkge1xuXHR2YXIgdHlwZSA9IHR5cGVvZiB2YXJpYWJsZTtcblx0aWYgKHZhcmlhYmxlID09PSBudWxsKSB0eXBlID0gXCJudWxsXCI7XG5cdGlmIChzaGltLkFycmF5LmlzQXJyYXkodmFyaWFibGUpKSB0eXBlID0gXCJhcnJheVwiO1xuXHRpZiAodHlwZSA9PT0gXCJudW1iZXJcIiAmJiBpc05hTih2YXJpYWJsZSkpIHR5cGUgPSBcIk5hTlwiO1xuXHRyZXR1cm4gdHlwZTtcbn1cblxuXG4vKioqKiovXG5cbnZhciBFbnN1cmVFeGNlcHRpb24gPSBleHBvcnRzLkVuc3VyZUV4Y2VwdGlvbiA9IGZ1bmN0aW9uIEVuc3VyZUV4Y2VwdGlvbihmblRvUmVtb3ZlRnJvbVN0YWNrVHJhY2UsIG1lc3NhZ2UpIHtcblx0aWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBmblRvUmVtb3ZlRnJvbVN0YWNrVHJhY2UpO1xuXHRlbHNlIHRoaXMuc3RhY2sgPSAobmV3IEVycm9yKCkpLnN0YWNrO1xuXHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufTtcbkVuc3VyZUV4Y2VwdGlvbi5wcm90b3R5cGUgPSBzaGltLk9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcbkVuc3VyZUV4Y2VwdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbnN1cmVFeGNlcHRpb247XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlLm5hbWUgPSBcIkVuc3VyZUV4Y2VwdGlvblwiO1xuIiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG4vLyBjYW4ndCB1c2UgZW5zdXJlLmpzIGR1ZSB0byBjaXJjdWxhciBkZXBlbmRlbmN5XG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuL3NoaW0uanNcIik7XG5cbmV4cG9ydHMuY2xhc3NOYW1lID0gZnVuY3Rpb24oY29uc3RydWN0b3IpIHtcblx0aWYgKHR5cGVvZiBjb25zdHJ1Y3RvciAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYSBjb25zdHJ1Y3RvclwiKTtcblx0cmV0dXJuIHNoaW0uRnVuY3Rpb24ubmFtZShjb25zdHJ1Y3Rvcik7XG59O1xuXG5leHBvcnRzLmluc3RhbmNlTmFtZSA9IGZ1bmN0aW9uKG9iaikge1xuXHR2YXIgcHJvdG90eXBlID0gc2hpbS5PYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcblx0aWYgKHByb3RvdHlwZSA9PT0gbnVsbCkgcmV0dXJuIFwiPG5vIHByb3RvdHlwZT5cIjtcblxuXHR2YXIgY29uc3RydWN0b3IgPSBwcm90b3R5cGUuY29uc3RydWN0b3I7XG5cdGlmIChjb25zdHJ1Y3RvciA9PT0gdW5kZWZpbmVkIHx8IGNvbnN0cnVjdG9yID09PSBudWxsKSByZXR1cm4gXCI8YW5vbj5cIjtcblxuXHRyZXR1cm4gc2hpbS5GdW5jdGlvbi5uYW1lKGNvbnN0cnVjdG9yKTtcbn07XG5cbmV4cG9ydHMuZXh0ZW5kRm4gPSBmdW5jdGlvbiBleHRlbmRGbihwYXJlbnRDb25zdHJ1Y3Rvcikge1xuXHRyZXR1cm4gZnVuY3Rpb24oY2hpbGRDb25zdHJ1Y3Rvcikge1xuXHRcdGNoaWxkQ29uc3RydWN0b3IucHJvdG90eXBlID0gc2hpbS5PYmplY3QuY3JlYXRlKHBhcmVudENvbnN0cnVjdG9yLnByb3RvdHlwZSk7XG5cdFx0Y2hpbGRDb25zdHJ1Y3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjaGlsZENvbnN0cnVjdG9yO1xuXHR9O1xufTtcblxuZXhwb3J0cy5tYWtlQWJzdHJhY3QgPSBmdW5jdGlvbiBtYWtlQWJzdHJhY3QoY29uc3RydWN0b3IsIG1ldGhvZHMpIHtcblx0dmFyIG5hbWUgPSBzaGltLkZ1bmN0aW9uLm5hbWUoY29uc3RydWN0b3IpO1xuXHRzaGltLkFycmF5LmZvckVhY2gobWV0aG9kcywgZnVuY3Rpb24obWV0aG9kKSB7XG5cdFx0Y29uc3RydWN0b3IucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihuYW1lICsgXCIgc3ViY2xhc3NlcyBtdXN0IGltcGxlbWVudCBcIiArIG1ldGhvZCArIFwiKCkgbWV0aG9kXCIpO1xuXHRcdH07XG5cdH0pO1xuXG5cdGNvbnN0cnVjdG9yLnByb3RvdHlwZS5jaGVja0Fic3RyYWN0TWV0aG9kcyA9IGZ1bmN0aW9uIGNoZWNrQWJzdHJhY3RNZXRob2RzKCkge1xuXHRcdHZhciB1bmltcGxlbWVudGVkID0gW107XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHNoaW0uQXJyYXkuZm9yRWFjaChtZXRob2RzLCBmdW5jdGlvbihuYW1lKSB7XG5cdFx0XHRpZiAoc2VsZltuYW1lXSA9PT0gY29uc3RydWN0b3IucHJvdG90eXBlW25hbWVdKSB1bmltcGxlbWVudGVkLnB1c2gobmFtZSArIFwiKClcIik7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHVuaW1wbGVtZW50ZWQ7XG5cdH07XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxNC0yMDE3IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cbi8qZXNsaW50IGVxZXFlcTogXCJvZmZcIiwgbm8tZXEtbnVsbDogXCJvZmZcIiwgbm8tYml0d2lzZTogXCJvZmZcIiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuQXJyYXkgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBBcnJheS5pc0FycmF5XG5cdGlzQXJyYXk6IGZ1bmN0aW9uIGlzQXJyYXkodGhpbmcpIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheSkgcmV0dXJuIEFycmF5LmlzQXJyYXkodGhpbmcpO1xuXG5cdFx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0aGluZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG5cdH0sXG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBBcnJheS5ldmVyeVxuXHRldmVyeTogZnVuY3Rpb24gZXZlcnkob2JqLCBjYWxsYmFja2ZuLCB0aGlzQXJnKSB7XG5cdFx0Lypqc2hpbnQgYml0d2lzZTpmYWxzZSwgZXFlcWVxOmZhbHNlLCAtVzA0MTpmYWxzZSAqL1xuXHRcdGlmIChBcnJheS5wcm90b3R5cGUuZXZlcnkpIHJldHVybiBvYmouZXZlcnkoY2FsbGJhY2tmbiwgdGhpc0FyZyk7XG5cblx0XHQvLyBUaGlzIHdvcmthcm91bmQgYmFzZWQgb24gcG9seWZpbGwgY29kZSBmcm9tIE1ETjpcblx0XHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9ldmVyeVxuXHRcdHZhciBULCBrO1xuXG5cdFx0aWYgKHRoaXMgPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcigndGhpcyBpcyBudWxsIG9yIG5vdCBkZWZpbmVkJyk7XG5cdFx0fVxuXG5cdFx0Ly8gMS4gTGV0IE8gYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIFRvT2JqZWN0IHBhc3NpbmcgdGhlIHRoaXNcblx0XHQvLyAgICB2YWx1ZSBhcyB0aGUgYXJndW1lbnQuXG5cdFx0dmFyIE8gPSBPYmplY3QodGhpcyk7XG5cblx0XHQvLyAyLiBMZXQgbGVuVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXQgaW50ZXJuYWwgbWV0aG9kXG5cdFx0Ly8gICAgb2YgTyB3aXRoIHRoZSBhcmd1bWVudCBcImxlbmd0aFwiLlxuXHRcdC8vIDMuIExldCBsZW4gYmUgVG9VaW50MzIobGVuVmFsdWUpLlxuXHRcdHZhciBsZW4gPSBPLmxlbmd0aCA+Pj4gMDtcblxuXHRcdC8vIDQuIElmIElzQ2FsbGFibGUoY2FsbGJhY2tmbikgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cblx0XHRpZiAodHlwZW9mIGNhbGxiYWNrZm4gIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoKTtcblx0XHR9XG5cblx0XHQvLyA1LiBJZiB0aGlzQXJnIHdhcyBzdXBwbGllZCwgbGV0IFQgYmUgdGhpc0FyZzsgZWxzZSBsZXQgVCBiZSB1bmRlZmluZWQuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRUID0gdGhpc0FyZztcblx0XHR9XG5cblx0XHQvLyA2LiBMZXQgayBiZSAwLlxuXHRcdGsgPSAwO1xuXG5cdFx0Ly8gNy4gUmVwZWF0LCB3aGlsZSBrIDwgbGVuXG5cdFx0d2hpbGUgKGsgPCBsZW4pIHtcblxuXHRcdFx0dmFyIGtWYWx1ZTtcblxuXHRcdFx0Ly8gYS4gTGV0IFBrIGJlIFRvU3RyaW5nKGspLlxuXHRcdFx0Ly8gICBUaGlzIGlzIGltcGxpY2l0IGZvciBMSFMgb3BlcmFuZHMgb2YgdGhlIGluIG9wZXJhdG9yXG5cdFx0XHQvLyBiLiBMZXQga1ByZXNlbnQgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBIYXNQcm9wZXJ0eSBpbnRlcm5hbFxuXHRcdFx0Ly8gICAgbWV0aG9kIG9mIE8gd2l0aCBhcmd1bWVudCBQay5cblx0XHRcdC8vICAgVGhpcyBzdGVwIGNhbiBiZSBjb21iaW5lZCB3aXRoIGNcblx0XHRcdC8vIGMuIElmIGtQcmVzZW50IGlzIHRydWUsIHRoZW5cblx0XHRcdGlmIChrIGluIE8pIHtcblxuXHRcdFx0XHQvLyBpLiBMZXQga1ZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0IGludGVybmFsIG1ldGhvZFxuXHRcdFx0XHQvLyAgICBvZiBPIHdpdGggYXJndW1lbnQgUGsuXG5cdFx0XHRcdGtWYWx1ZSA9IE9ba107XG5cblx0XHRcdFx0Ly8gaWkuIExldCB0ZXN0UmVzdWx0IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgQ2FsbCBpbnRlcm5hbCBtZXRob2Rcblx0XHRcdFx0Ly8gICAgIG9mIGNhbGxiYWNrZm4gd2l0aCBUIGFzIHRoZSB0aGlzIHZhbHVlIGFuZCBhcmd1bWVudCBsaXN0XG5cdFx0XHRcdC8vICAgICBjb250YWluaW5nIGtWYWx1ZSwgaywgYW5kIE8uXG5cdFx0XHRcdHZhciB0ZXN0UmVzdWx0ID0gY2FsbGJhY2tmbi5jYWxsKFQsIGtWYWx1ZSwgaywgTyk7XG5cblx0XHRcdFx0Ly8gaWlpLiBJZiBUb0Jvb2xlYW4odGVzdFJlc3VsdCkgaXMgZmFsc2UsIHJldHVybiBmYWxzZS5cblx0XHRcdFx0aWYgKCF0ZXN0UmVzdWx0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRrKys7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbm8gQXJyYXkuZm9yRWFjaFxuXHRmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKG9iaiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcblx0XHQvKmpzaGludCBiaXR3aXNlOmZhbHNlLCBlcWVxZXE6ZmFsc2UsIC1XMDQxOmZhbHNlICovXG5cblx0XHRpZiAoQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHJldHVybiBvYmouZm9yRWFjaChjYWxsYmFjaywgdGhpc0FyZyk7XG5cblx0XHQvLyBUaGlzIHdvcmthcm91bmQgYmFzZWQgb24gcG9seWZpbGwgY29kZSBmcm9tIE1ETjpcblx0XHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9mb3JFYWNoXG5cblx0XHQvLyBQcm9kdWN0aW9uIHN0ZXBzIG9mIEVDTUEtMjYyLCBFZGl0aW9uIDUsIDE1LjQuNC4xOFxuXHRcdC8vIFJlZmVyZW5jZTogaHR0cDovL2VzNS5naXRodWIuaW8vI3gxNS40LjQuMThcblxuXHRcdHZhciBULCBrO1xuXG5cdFx0aWYgKG9iaiA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCcgdGhpcyBpcyBudWxsIG9yIG5vdCBkZWZpbmVkJyk7XG5cdFx0fVxuXG5cdFx0Ly8gMS4gTGV0IE8gYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIFRvT2JqZWN0IHBhc3NpbmcgdGhlIHx0aGlzfCB2YWx1ZSBhcyB0aGUgYXJndW1lbnQuXG5cdFx0dmFyIE8gPSBPYmplY3Qob2JqKTtcblxuXHRcdC8vIDIuIExldCBsZW5WYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldCBpbnRlcm5hbCBtZXRob2Qgb2YgTyB3aXRoIHRoZSBhcmd1bWVudCBcImxlbmd0aFwiLlxuXHRcdC8vIDMuIExldCBsZW4gYmUgVG9VaW50MzIobGVuVmFsdWUpLlxuXHRcdHZhciBsZW4gPSBPLmxlbmd0aCA+Pj4gMDtcblxuXHRcdC8vIDQuIElmIElzQ2FsbGFibGUoY2FsbGJhY2spIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG5cdFx0Ly8gU2VlOiBodHRwOi8vZXM1LmdpdGh1Yi5jb20vI3g5LjExXG5cdFx0aWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGNhbGxiYWNrICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuXHRcdH1cblxuXHRcdC8vIDUuIElmIHRoaXNBcmcgd2FzIHN1cHBsaWVkLCBsZXQgVCBiZSB0aGlzQXJnOyBlbHNlIGxldCBUIGJlIHVuZGVmaW5lZC5cblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFQgPSB0aGlzQXJnO1xuXHRcdH1cblxuXHRcdC8vIDYuIExldCBrIGJlIDBcblx0XHRrID0gMDtcblxuXHRcdC8vIDcuIFJlcGVhdCwgd2hpbGUgayA8IGxlblxuXHRcdHdoaWxlIChrIDwgbGVuKSB7XG5cblx0XHRcdHZhciBrVmFsdWU7XG5cblx0XHRcdC8vIGEuIExldCBQayBiZSBUb1N0cmluZyhrKS5cblx0XHRcdC8vICAgVGhpcyBpcyBpbXBsaWNpdCBmb3IgTEhTIG9wZXJhbmRzIG9mIHRoZSBpbiBvcGVyYXRvclxuXHRcdFx0Ly8gYi4gTGV0IGtQcmVzZW50IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgSGFzUHJvcGVydHkgaW50ZXJuYWwgbWV0aG9kIG9mIE8gd2l0aCBhcmd1bWVudCBQay5cblx0XHRcdC8vICAgVGhpcyBzdGVwIGNhbiBiZSBjb21iaW5lZCB3aXRoIGNcblx0XHRcdC8vIGMuIElmIGtQcmVzZW50IGlzIHRydWUsIHRoZW5cblx0XHRcdGlmIChrIGluIE8pIHtcblxuXHRcdFx0XHQvLyBpLiBMZXQga1ZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0IGludGVybmFsIG1ldGhvZCBvZiBPIHdpdGggYXJndW1lbnQgUGsuXG5cdFx0XHRcdGtWYWx1ZSA9IE9ba107XG5cblx0XHRcdFx0Ly8gaWkuIENhbGwgdGhlIENhbGwgaW50ZXJuYWwgbWV0aG9kIG9mIGNhbGxiYWNrIHdpdGggVCBhcyB0aGUgdGhpcyB2YWx1ZSBhbmRcblx0XHRcdFx0Ly8gYXJndW1lbnQgbGlzdCBjb250YWluaW5nIGtWYWx1ZSwgaywgYW5kIE8uXG5cdFx0XHRcdGNhbGxiYWNrLmNhbGwoVCwga1ZhbHVlLCBrLCBPKTtcblx0XHRcdH1cblx0XHRcdC8vIGQuIEluY3JlYXNlIGsgYnkgMS5cblx0XHRcdGsrKztcblx0XHR9XG5cdFx0Ly8gOC4gcmV0dXJuIHVuZGVmaW5lZFxuXHR9XG5cbn07XG5cblxuZXhwb3J0cy5Eb2N1bWVudCA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIGRvY3VtZW50LmhlYWRcblx0aGVhZDogZnVuY3Rpb24gaGVhZChkb2MpIHtcblx0XHRpZiAoZG9jLmhlYWQpIHJldHVybiBkb2MuaGVhZDtcblxuXHRcdHJldHVybiBkb2MucXVlcnlTZWxlY3RvcihcImhlYWRcIik7XG5cdH1cblxufTtcblxuXG5leHBvcnRzLkVsZW1lbnQgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4LCBJRSA5LCBJRSAxMCwgSUUgMTE6IG5vIEVsZW1lbnQucmVtb3ZlKClcblx0cmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoZWxlbWVudCkge1xuXHRcdGVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGVtZW50KTtcblx0fVxuXG59O1xuXG5cbmV4cG9ydHMuRXZlbnRUYXJnZXQgPSB7XG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBubyBFdmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKClcblx0YWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50LCBldmVudCwgY2FsbGJhY2spIHtcblx0XHRpZiAoZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKSByZXR1cm4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7XG5cblx0XHRlbGVtZW50LmF0dGFjaEV2ZW50KFwib25cIiArIGV2ZW50LCBjYWxsYmFjayk7XG5cdH1cblxufTtcblxuXG5leHBvcnRzLkZ1bmN0aW9uID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgOCwgSUUgOSwgSUUgMTAsIElFIDExOiBubyBmdW5jdGlvbi5uYW1lXG5cdG5hbWU6IGZ1bmN0aW9uIG5hbWUoZm4pIHtcblx0XHRpZiAoZm4ubmFtZSkgcmV0dXJuIGZuLm5hbWU7XG5cblx0XHQvLyBCYXNlZCBvbiBjb2RlIGJ5IEphc29uIEJ1bnRpbmcgZXQgYWwsIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMzMjQyOVxuXHRcdHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKyguezEsfSlcXHMqXFwoLztcblx0XHR2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XG5cdFx0cmV0dXJuIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMSkgPyByZXN1bHRzWzFdIDogXCI8YW5vbj5cIjtcblx0fSxcblxufTtcblxuXG5leHBvcnRzLk9iamVjdCA9IHtcblxuXHQvLyBXT1JLQVJPVU5EIElFIDg6IG5vIE9iamVjdC5jcmVhdGUoKVxuXHRjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZShwcm90b3R5cGUpIHtcblx0XHRpZiAoT2JqZWN0LmNyZWF0ZSkgcmV0dXJuIE9iamVjdC5jcmVhdGUocHJvdG90eXBlKTtcblxuXHRcdHZhciBUZW1wID0gZnVuY3Rpb24gVGVtcCgpIHt9O1xuXHRcdFRlbXAucHJvdG90eXBlID0gcHJvdG90eXBlO1xuXHRcdHJldHVybiBuZXcgVGVtcCgpO1xuXHR9LFxuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogbm8gT2JqZWN0LmdldFByb3RvdHlwZU9mXG5cdC8vIENhdXRpb246IERvZXNuJ3Qgd29yayBvbiBJRSA4IGlmIGNvbnN0cnVjdG9yIGhhcyBiZWVuIGNoYW5nZWQsIGFzIGlzIHRoZSBjYXNlIHdpdGggYSBzdWJjbGFzcy5cblx0Z2V0UHJvdG90eXBlT2Y6IGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKG9iaikge1xuXHRcdGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcblxuXHRcdHZhciByZXN1bHQgPSBvYmouY29uc3RydWN0b3IgPyBvYmouY29uc3RydWN0b3IucHJvdG90eXBlIDogbnVsbDtcblx0XHRyZXR1cm4gcmVzdWx0IHx8IG51bGw7XG5cdH0sXG5cblx0Ly8gV09SS0FST1VORCBJRSA4OiBObyBPYmplY3Qua2V5c1xuXHRrZXlzOiBmdW5jdGlvbiBrZXlzKG9iaikge1xuXHRcdGlmIChPYmplY3Qua2V5cykgcmV0dXJuIE9iamVjdC5rZXlzKG9iaik7XG5cblx0XHQvLyBGcm9tIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9rZXlzXG5cdFx0dmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcblx0XHRcdGhhc0RvbnRFbnVtQnVnID0gISh7IHRvU3RyaW5nOiBudWxsIH0pLnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpLFxuXHRcdFx0ZG9udEVudW1zID0gW1xuXHRcdFx0XHQndG9TdHJpbmcnLFxuXHRcdFx0XHQndG9Mb2NhbGVTdHJpbmcnLFxuXHRcdFx0XHQndmFsdWVPZicsXG5cdFx0XHRcdCdoYXNPd25Qcm9wZXJ0eScsXG5cdFx0XHRcdCdpc1Byb3RvdHlwZU9mJyxcblx0XHRcdFx0J3Byb3BlcnR5SXNFbnVtZXJhYmxlJyxcblx0XHRcdFx0J2NvbnN0cnVjdG9yJ1xuXHRcdFx0XSxcblx0XHRcdGRvbnRFbnVtc0xlbmd0aCA9IGRvbnRFbnVtcy5sZW5ndGg7XG5cblx0XHRpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgJiYgKHR5cGVvZiBvYmogIT09ICdmdW5jdGlvbicgfHwgb2JqID09PSBudWxsKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmtleXMgY2FsbGVkIG9uIG5vbi1vYmplY3QnKTtcblx0XHR9XG5cblx0XHR2YXIgcmVzdWx0ID0gW10sIHByb3AsIGk7XG5cblx0XHRmb3IgKHByb3AgaW4gb2JqKSB7XG5cdFx0XHRpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSB7XG5cdFx0XHRcdHJlc3VsdC5wdXNoKHByb3ApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChoYXNEb250RW51bUJ1Zykge1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGRvbnRFbnVtc0xlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgZG9udEVudW1zW2ldKSkge1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKGRvbnRFbnVtc1tpXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG59O1xuXG5cbmV4cG9ydHMuU3RyaW5nID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogTm8gU3RyaW5nLnRyaW0oKVxuXHR0cmltOiBmdW5jdGlvbihzdHIpIHtcblx0XHRpZiAoc3RyLnRyaW0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHN0ci50cmltKCk7XG5cblx0XHQvLyBCYXNlZCBvbiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TdHJpbmcvVHJpbVxuXHRcdHJldHVybiBzdHIucmVwbGFjZSgvXltcXHNcXHVGRUZGXFx4QTBdK3xbXFxzXFx1RkVGRlxceEEwXSskL2csICcnKTtcblx0fVxuXG59O1xuXG5cbmV4cG9ydHMuV2luZG93ID0ge1xuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogTm8gV2luZG93LnBhZ2VYT2Zmc2V0XG5cdHBhZ2VYT2Zmc2V0OiBmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50KSB7XG5cdFx0aWYgKHdpbmRvdy5wYWdlWE9mZnNldCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gd2luZG93LnBhZ2VYT2Zmc2V0O1xuXG5cdFx0Ly8gQmFzZWQgb24gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dpbmRvdy5zY3JvbGxZXG5cdFx0dmFyIGlzQ1NTMUNvbXBhdCA9ICgoZG9jdW1lbnQuY29tcGF0TW9kZSB8fCBcIlwiKSA9PT0gXCJDU1MxQ29tcGF0XCIpO1xuXHRcdHJldHVybiBpc0NTUzFDb21wYXQgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCA6IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdDtcblx0fSxcblxuXG5cdC8vIFdPUktBUk9VTkQgSUUgODogTm8gV2luZG93LnBhZ2VZT2Zmc2V0XG5cdHBhZ2VZT2Zmc2V0OiBmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50KSB7XG5cdFx0aWYgKHdpbmRvdy5wYWdlWU9mZnNldCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gd2luZG93LnBhZ2VZT2Zmc2V0O1xuXG5cdFx0Ly8gQmFzZWQgb24gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dpbmRvdy5zY3JvbGxZXG5cdFx0dmFyIGlzQ1NTMUNvbXBhdCA9ICgoZG9jdW1lbnQuY29tcGF0TW9kZSB8fCBcIlwiKSA9PT0gXCJDU1MxQ29tcGF0XCIpO1xuXHRcdHJldHVybiBpc0NTUzFDb21wYXQgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIDogZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG5cdH1cblxufTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNiBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuL3ZhbHVlLmpzXCIpO1xuXG52YXIgTWUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFBpeGVscyhhbW91bnQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgWyBOdW1iZXIsIG51bGwgXSBdKTtcblx0dGhpcy5fbm9uZSA9IChhbW91bnQgPT09IG51bGwpO1xuXHR0aGlzLl9hbW91bnQgPSBhbW91bnQ7XG59O1xuVmFsdWUuZXh0ZW5kKE1lKTtcblxuTWUuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGFtb3VudCkge1xuXHRyZXR1cm4gbmV3IE1lKGFtb3VudCk7XG59O1xuXG5NZS5jcmVhdGVOb25lID0gZnVuY3Rpb24gY3JlYXRlTm9uZSgpIHtcblx0cmV0dXJuIG5ldyBNZShudWxsKTtcbn07XG5cbk1lLlpFUk8gPSBNZS5jcmVhdGUoMCk7XG5NZS5OT05FID0gTWUuY3JlYXRlTm9uZSgpO1xuXG5NZS5wcm90b3R5cGUuY29tcGF0aWJpbGl0eSA9IGZ1bmN0aW9uIGNvbXBhdGliaWxpdHkoKSB7XG5cdHJldHVybiBbIE1lIF07XG59O1xuXG5NZS5wcm90b3R5cGUucGx1cyA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gcGx1cyhvcGVyYW5kKSB7XG5cdGlmICh0aGlzLl9ub25lIHx8IG9wZXJhbmQuX25vbmUpIHJldHVybiBNZS5jcmVhdGVOb25lKCk7XG5cdHJldHVybiBuZXcgTWUodGhpcy5fYW1vdW50ICsgb3BlcmFuZC5fYW1vdW50KTtcbn0pO1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIG1pbnVzKG9wZXJhbmQpIHtcblx0aWYgKHRoaXMuX25vbmUgfHwgb3BlcmFuZC5fbm9uZSkgcmV0dXJuIE1lLmNyZWF0ZU5vbmUoKTtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9hbW91bnQgLSBvcGVyYW5kLl9hbW91bnQpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5kaWZmZXJlbmNlID0gVmFsdWUuc2FmZShmdW5jdGlvbiBkaWZmZXJlbmNlKG9wZXJhbmQpIHtcblx0aWYgKHRoaXMuX25vbmUgfHwgb3BlcmFuZC5fbm9uZSkgcmV0dXJuIE1lLmNyZWF0ZU5vbmUoKTtcblx0cmV0dXJuIG5ldyBNZShNYXRoLmFicyh0aGlzLl9hbW91bnQgLSBvcGVyYW5kLl9hbW91bnQpKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUudGltZXMgPSBmdW5jdGlvbiB0aW1lcyhvcGVyYW5kKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE51bWJlciBdKTtcblxuXHRpZiAodGhpcy5fbm9uZSkgcmV0dXJuIE1lLmNyZWF0ZU5vbmUoKTtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9hbW91bnQgKiBvcGVyYW5kKTtcbn07XG5cbk1lLnByb3RvdHlwZS5hdmVyYWdlID0gVmFsdWUuc2FmZShmdW5jdGlvbiBhdmVyYWdlKG9wZXJhbmQpIHtcblx0aWYgKHRoaXMuX25vbmUgfHwgb3BlcmFuZC5fbm9uZSkgcmV0dXJuIE1lLmNyZWF0ZU5vbmUoKTtcblx0cmV0dXJuIG5ldyBNZSgodGhpcy5fYW1vdW50ICsgb3BlcmFuZC5fYW1vdW50KSAvIDIpO1xufSk7XG5cbk1lLnByb3RvdHlwZS5jb21wYXJlID0gVmFsdWUuc2FmZShmdW5jdGlvbiBjb21wYXJlKG9wZXJhbmQpIHtcblx0dmFyIGJvdGhIYXZlUGl4ZWxzID0gIXRoaXMuX25vbmUgJiYgIW9wZXJhbmQuX25vbmU7XG5cdHZhciBuZWl0aGVySGF2ZVBpeGVscyA9IHRoaXMuX25vbmUgJiYgb3BlcmFuZC5fbm9uZTtcblx0dmFyIG9ubHlMZWZ0SGFzUGl4ZWxzID0gIXRoaXMuX25vbmUgJiYgb3BlcmFuZC5fbm9uZTtcblxuXHRpZiAoYm90aEhhdmVQaXhlbHMpIHtcblx0XHR2YXIgZGlmZmVyZW5jZSA9IHRoaXMuX2Ftb3VudCAtIG9wZXJhbmQuX2Ftb3VudDtcblx0XHRpZiAoTWF0aC5hYnMoZGlmZmVyZW5jZSkgPD0gMC41KSByZXR1cm4gMDtcblx0XHRlbHNlIHJldHVybiBkaWZmZXJlbmNlO1xuXHR9XG5cdGVsc2UgaWYgKG5laXRoZXJIYXZlUGl4ZWxzKSB7XG5cdFx0XHRcdHJldHVybiAwO1xuXHR9XG5cdGVsc2UgaWYgKG9ubHlMZWZ0SGFzUGl4ZWxzKSB7XG5cdFx0cmV0dXJuIDE7XG5cdH1cblx0ZWxzZSB7XG5cdFx0cmV0dXJuIC0xO1xuXHR9XG59KTtcblxuTWUubWluID0gZnVuY3Rpb24obCwgcikge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBNZSwgTWUgXSk7XG5cblx0aWYgKGwuX25vbmUgfHwgci5fbm9uZSkgcmV0dXJuIE1lLmNyZWF0ZU5vbmUoKTtcblx0cmV0dXJuIGwuY29tcGFyZShyKSA8PSAwID8gbCA6IHI7XG59O1xuXG5NZS5tYXggPSBmdW5jdGlvbihsLCByKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIE1lLCBNZSBdKTtcblxuXHRpZiAobC5fbm9uZSB8fCByLl9ub25lKSByZXR1cm4gTWUuY3JlYXRlTm9uZSgpO1xuXHRyZXR1cm4gbC5jb21wYXJlKHIpID49IDAgPyBsIDogcjtcbn07XG5cbk1lLnByb3RvdHlwZS5kaWZmID0gVmFsdWUuc2FmZShmdW5jdGlvbiBkaWZmKGV4cGVjdGVkKSB7XG5cdGlmICh0aGlzLmNvbXBhcmUoZXhwZWN0ZWQpID09PSAwKSByZXR1cm4gXCJcIjtcblx0aWYgKHRoaXMuX25vbmUgfHwgZXhwZWN0ZWQuX25vbmUpIHJldHVybiBcIm5vbi1tZWFzdXJhYmxlXCI7XG5cblx0dmFyIGRpZmZlcmVuY2UgPSBNYXRoLmFicyh0aGlzLl9hbW91bnQgLSBleHBlY3RlZC5fYW1vdW50KTtcblxuXHR2YXIgZGVzYyA9IGRpZmZlcmVuY2U7XG5cdGlmIChkaWZmZXJlbmNlICogMTAwICE9PSBNYXRoLmZsb29yKGRpZmZlcmVuY2UgKiAxMDApKSBkZXNjID0gXCJhYm91dCBcIiArIGRpZmZlcmVuY2UudG9GaXhlZCgyKTtcblx0cmV0dXJuIGRlc2MgKyBcInB4XCI7XG59KTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl9ub25lID8gXCJubyBwaXhlbHNcIiA6IHRoaXMuX2Ftb3VudCArIFwicHhcIjtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNiBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBWYWx1ZSA9IHJlcXVpcmUoXCIuL3ZhbHVlLmpzXCIpO1xudmFyIFBpeGVscyA9IHJlcXVpcmUoXCIuL3BpeGVscy5qc1wiKTtcbnZhciBTaXplID0gcmVxdWlyZShcIi4vc2l6ZS5qc1wiKTtcblxudmFyIFhfRElNRU5TSU9OID0gXCJ4XCI7XG52YXIgWV9ESU1FTlNJT04gPSBcInlcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBQb3NpdGlvbihkaW1lbnNpb24sIHZhbHVlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFN0cmluZywgWyBOdW1iZXIsIFBpeGVscyBdIF0pO1xuXG5cdHRoaXMuX2RpbWVuc2lvbiA9IGRpbWVuc2lvbjtcblx0dGhpcy5fdmFsdWUgPSAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSA/IFBpeGVscy5jcmVhdGUodmFsdWUpIDogdmFsdWU7XG59O1xuVmFsdWUuZXh0ZW5kKE1lKTtcblxuTWUueCA9IGZ1bmN0aW9uIHgodmFsdWUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgWyBOdW1iZXIsIFBpeGVscyBdIF0pO1xuXG5cdHJldHVybiBuZXcgTWUoWF9ESU1FTlNJT04sIHZhbHVlKTtcbn07XG5cbk1lLnkgPSBmdW5jdGlvbiB5KHZhbHVlKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbIFsgTnVtYmVyLCBQaXhlbHMgXSBdKTtcblxuXHRyZXR1cm4gbmV3IE1lKFlfRElNRU5TSU9OLCB2YWx1ZSk7XG59O1xuXG5NZS5ub1ggPSBmdW5jdGlvbiBub1goKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cblx0cmV0dXJuIG5ldyBNZShYX0RJTUVOU0lPTiwgUGl4ZWxzLk5PTkUpO1xufTtcblxuTWUubm9ZID0gZnVuY3Rpb24gbm9ZKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiBuZXcgTWUoWV9ESU1FTlNJT04sIFBpeGVscy5OT05FKTtcbn07XG5cbk1lLnByb3RvdHlwZS5jb21wYXRpYmlsaXR5ID0gZnVuY3Rpb24gY29tcGF0aWJpbGl0eSgpIHtcblx0cmV0dXJuIFsgTWUsIFNpemUgXTtcbn07XG5cbk1lLnByb3RvdHlwZS5kaXN0YW5jZVRvID0gZnVuY3Rpb24ob3BlcmFuZCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBNZSBdKTtcblx0Y2hlY2tBeGlzKHRoaXMsIG9wZXJhbmQpO1xuXHRyZXR1cm4gU2l6ZS5jcmVhdGUodGhpcy5fdmFsdWUuZGlmZmVyZW5jZShvcGVyYW5kLnRvUGl4ZWxzKCkpKTtcbn07XG5cbk1lLnByb3RvdHlwZS5wbHVzID0gVmFsdWUuc2FmZShmdW5jdGlvbiBwbHVzKG9wZXJhbmQpIHtcblx0Y2hlY2tBeGlzKHRoaXMsIG9wZXJhbmQpO1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX2RpbWVuc2lvbiwgdGhpcy5fdmFsdWUucGx1cyhvcGVyYW5kLnRvUGl4ZWxzKCkpKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIG1pbnVzKG9wZXJhbmQpIHtcblx0Y2hlY2tBeGlzKHRoaXMsIG9wZXJhbmQpO1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX2RpbWVuc2lvbiwgdGhpcy5fdmFsdWUubWludXMob3BlcmFuZC50b1BpeGVscygpKSk7XG59KTtcblxuTWUucHJvdG90eXBlLm1pZHBvaW50ID0gVmFsdWUuc2FmZShmdW5jdGlvbiBtaWRwb2ludChvcGVyYW5kKSB7XG5cdGNoZWNrQXhpcyh0aGlzLCBvcGVyYW5kKTtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl9kaW1lbnNpb24sIHRoaXMuX3ZhbHVlLmF2ZXJhZ2Uob3BlcmFuZC50b1BpeGVscygpKSk7XG59KTtcblxuTWUucHJvdG90eXBlLmNvbXBhcmUgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIGNvbXBhcmUob3BlcmFuZCkge1xuXHRjaGVja0F4aXModGhpcywgb3BlcmFuZCk7XG5cdHJldHVybiB0aGlzLl92YWx1ZS5jb21wYXJlKG9wZXJhbmQudG9QaXhlbHMoKSk7XG59KTtcblxuTWUucHJvdG90eXBlLm1pbiA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gbWluKG9wZXJhbmQpIHtcblx0Y2hlY2tBeGlzKHRoaXMsIG9wZXJhbmQpO1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX2RpbWVuc2lvbiwgUGl4ZWxzLm1pbih0aGlzLl92YWx1ZSwgb3BlcmFuZC50b1BpeGVscygpKSk7XG59KTtcblxuTWUucHJvdG90eXBlLm1heCA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gbWF4KG9wZXJhbmQpIHtcblx0Y2hlY2tBeGlzKHRoaXMsIG9wZXJhbmQpO1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX2RpbWVuc2lvbiwgUGl4ZWxzLm1heCh0aGlzLl92YWx1ZSwgb3BlcmFuZC50b1BpeGVscygpKSk7XG59KTtcblxuTWUucHJvdG90eXBlLmRpZmYgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIGRpZmYoZXhwZWN0ZWQpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgTWUgXSk7XG5cdGNoZWNrQXhpcyh0aGlzLCBleHBlY3RlZCk7XG5cblx0dmFyIGFjdHVhbFZhbHVlID0gdGhpcy5fdmFsdWU7XG5cdHZhciBleHBlY3RlZFZhbHVlID0gZXhwZWN0ZWQuX3ZhbHVlO1xuXG5cdGlmIChhY3R1YWxWYWx1ZS5lcXVhbHMoZXhwZWN0ZWRWYWx1ZSkpIHJldHVybiBcIlwiO1xuXHRlbHNlIGlmIChpc05vbmUoZXhwZWN0ZWQpICYmICFpc05vbmUodGhpcykpIHJldHVybiBcInJlbmRlcmVkXCI7XG5cdGVsc2UgaWYgKCFpc05vbmUoZXhwZWN0ZWQpICYmIGlzTm9uZSh0aGlzKSkgcmV0dXJuIFwibm90IHJlbmRlcmVkXCI7XG5cblx0dmFyIGRpcmVjdGlvbjtcblx0dmFyIGNvbXBhcmlzb24gPSBhY3R1YWxWYWx1ZS5jb21wYXJlKGV4cGVjdGVkVmFsdWUpO1xuXHRpZiAodGhpcy5fZGltZW5zaW9uID09PSBYX0RJTUVOU0lPTikgZGlyZWN0aW9uID0gY29tcGFyaXNvbiA8IDAgPyBcInRvIGxlZnRcIiA6IFwidG8gcmlnaHRcIjtcblx0ZWxzZSBkaXJlY3Rpb24gPSBjb21wYXJpc29uIDwgMCA/IFwiaGlnaGVyXCIgOiBcImxvd2VyXCI7XG5cblx0cmV0dXJuIGFjdHVhbFZhbHVlLmRpZmYoZXhwZWN0ZWRWYWx1ZSkgKyBcIiBcIiArIGRpcmVjdGlvbjtcbn0pO1xuXG5NZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblxuXHRpZiAoaXNOb25lKHRoaXMpKSByZXR1cm4gXCJub3QgcmVuZGVyZWRcIjtcblx0ZWxzZSByZXR1cm4gdGhpcy5fdmFsdWUudG9TdHJpbmcoKTtcbn07XG5cbk1lLnByb3RvdHlwZS50b1BpeGVscyA9IGZ1bmN0aW9uIHRvUGl4ZWxzKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXHRyZXR1cm4gdGhpcy5fdmFsdWU7XG59O1xuXG5mdW5jdGlvbiBjaGVja0F4aXMoc2VsZiwgb3RoZXIpIHtcblx0aWYgKG90aGVyIGluc3RhbmNlb2YgTWUpIHtcblx0XHRlbnN1cmUudGhhdChzZWxmLl9kaW1lbnNpb24gPT09IG90aGVyLl9kaW1lbnNpb24sIFwiQ2FuJ3QgY29tcGFyZSBYIGNvb3JkaW5hdGUgdG8gWSBjb29yZGluYXRlXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGlzTm9uZShwb3NpdGlvbikge1xuXHRyZXR1cm4gcG9zaXRpb24uX3ZhbHVlLmVxdWFscyhQaXhlbHMuTk9ORSk7XG59IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE2LTIwMTcgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgVmFsdWUgPSByZXF1aXJlKFwiLi92YWx1ZS5qc1wiKTtcblxudmFyIFJFTkRFUkVEID0gXCJyZW5kZXJlZFwiO1xudmFyIE5PVF9SRU5ERVJFRCA9IFwibm90IHJlbmRlcmVkXCI7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUmVuZGVyU3RhdGUoc3RhdGUpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFsgU3RyaW5nIF0pO1xuXG5cdHRoaXMuX3N0YXRlID0gc3RhdGU7XG59O1xuVmFsdWUuZXh0ZW5kKE1lKTtcblxuTWUucmVuZGVyZWQgPSBmdW5jdGlvbiByZW5kZXJlZCgpIHtcblx0cmV0dXJuIG5ldyBNZShSRU5ERVJFRCk7XG59O1xuXG5NZS5ub3RSZW5kZXJlZCA9IGZ1bmN0aW9uIG5vdFJlbmRlcmVkKCkge1xuXHRyZXR1cm4gbmV3IE1lKE5PVF9SRU5ERVJFRCk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29tcGF0aWJpbGl0eSA9IGZ1bmN0aW9uIGNvbXBhdGliaWxpdHkoKSB7XG5cdHJldHVybiBbIE1lIF07XG59O1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHR2YXIgdGhpc1N0YXRlID0gdGhpcy5fc3RhdGU7XG5cdHZhciBleHBlY3RlZFN0YXRlID0gZXhwZWN0ZWQuX3N0YXRlO1xuXG5cdGlmICh0aGlzU3RhdGUgPT09IGV4cGVjdGVkU3RhdGUpIHJldHVybiBcIlwiO1xuXHRlbHNlIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG59KTtcblxuTWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdHJldHVybiB0aGlzLl9zdGF0ZTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTQgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIEZvciBsaWNlbnNlLCBzZWUgXCJSRUFETUVcIiBvciBcIkxJQ0VOU0VcIiBmaWxlLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlbnN1cmUgPSByZXF1aXJlKFwiLi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgVmFsdWUgPSByZXF1aXJlKFwiLi92YWx1ZS5qc1wiKTtcbnZhciBQaXhlbHMgPSByZXF1aXJlKFwiLi9waXhlbHMuanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU2l6ZSh2YWx1ZSkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgWyBbTnVtYmVyLCBQaXhlbHNdIF0pO1xuXG5cdHRoaXMuX3ZhbHVlID0gKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikgPyBQaXhlbHMuY3JlYXRlKHZhbHVlKSA6IHZhbHVlO1xufTtcblZhbHVlLmV4dGVuZChNZSk7XG5cbk1lLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZSh2YWx1ZSkge1xuXHRyZXR1cm4gbmV3IE1lKHZhbHVlKTtcbn07XG5cbk1lLmNyZWF0ZU5vbmUgPSBmdW5jdGlvbiBjcmVhdGVOb25lKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdHJldHVybiBuZXcgTWUoUGl4ZWxzLk5PTkUpO1xufTtcblxuTWUucHJvdG90eXBlLmNvbXBhdGliaWxpdHkgPSBmdW5jdGlvbiBjb21wYXRpYmlsaXR5KCkge1xuXHRyZXR1cm4gWyBNZSBdO1xufTtcblxuTWUucHJvdG90eXBlLnBsdXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIHBsdXMob3BlcmFuZCkge1xuXHRyZXR1cm4gbmV3IE1lKHRoaXMuX3ZhbHVlLnBsdXMob3BlcmFuZC5fdmFsdWUpKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUubWludXMgPSBWYWx1ZS5zYWZlKGZ1bmN0aW9uIG1pbnVzKG9wZXJhbmQpIHtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl92YWx1ZS5taW51cyhvcGVyYW5kLl92YWx1ZSkpO1xufSk7XG5cbk1lLnByb3RvdHlwZS50aW1lcyA9IGZ1bmN0aW9uIHRpbWVzKG9wZXJhbmQpIHtcblx0cmV0dXJuIG5ldyBNZSh0aGlzLl92YWx1ZS50aW1lcyhvcGVyYW5kKSk7XG59O1xuXG5NZS5wcm90b3R5cGUuY29tcGFyZSA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gY29tcGFyZSh0aGF0KSB7XG5cdHJldHVybiB0aGlzLl92YWx1ZS5jb21wYXJlKHRoYXQuX3ZhbHVlKTtcbn0pO1xuXG5NZS5wcm90b3R5cGUuZGlmZiA9IFZhbHVlLnNhZmUoZnVuY3Rpb24gZGlmZihleHBlY3RlZCkge1xuXHR2YXIgYWN0dWFsVmFsdWUgPSB0aGlzLl92YWx1ZTtcblx0dmFyIGV4cGVjdGVkVmFsdWUgPSBleHBlY3RlZC5fdmFsdWU7XG5cblx0aWYgKGFjdHVhbFZhbHVlLmVxdWFscyhleHBlY3RlZFZhbHVlKSkgcmV0dXJuIFwiXCI7XG5cdGlmIChpc05vbmUoZXhwZWN0ZWQpICYmICFpc05vbmUodGhpcykpIHJldHVybiBcInJlbmRlcmVkXCI7XG5cdGlmICghaXNOb25lKGV4cGVjdGVkKSAmJiBpc05vbmUodGhpcykpIHJldHVybiBcIm5vdCByZW5kZXJlZFwiO1xuXG5cdHZhciBkZXNjID0gYWN0dWFsVmFsdWUuY29tcGFyZShleHBlY3RlZFZhbHVlKSA+IDAgPyBcIiBsYXJnZXJcIiA6IFwiIHNtYWxsZXJcIjtcblx0cmV0dXJuIGFjdHVhbFZhbHVlLmRpZmYoZXhwZWN0ZWRWYWx1ZSkgKyBkZXNjO1xufSk7XG5cbk1lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuXHRlbnN1cmUuc2lnbmF0dXJlKGFyZ3VtZW50cywgW10pO1xuXG5cdGlmIChpc05vbmUodGhpcykpIHJldHVybiBcIm5vdCByZW5kZXJlZFwiO1xuXHRlbHNlIHJldHVybiB0aGlzLl92YWx1ZS50b1N0cmluZygpO1xufTtcblxuTWUucHJvdG90eXBlLnRvUGl4ZWxzID0gZnVuY3Rpb24gdG9QaXhlbHMoKSB7XG5cdGVuc3VyZS5zaWduYXR1cmUoYXJndW1lbnRzLCBbXSk7XG5cdHJldHVybiB0aGlzLl92YWx1ZTtcbn07XG5cbmZ1bmN0aW9uIGlzTm9uZShzaXplKSB7XG5cdHJldHVybiBzaXplLl92YWx1ZS5lcXVhbHMoUGl4ZWxzLk5PTkUpO1xufSIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGVuc3VyZSA9IHJlcXVpcmUoXCIuLi91dGlsL2Vuc3VyZS5qc1wiKTtcbnZhciBvb3AgPSByZXF1aXJlKFwiLi4vdXRpbC9vb3AuanNcIik7XG52YXIgc2hpbSA9IHJlcXVpcmUoXCIuLi91dGlsL3NoaW0uanNcIik7XG5cbnZhciBNZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gVmFsdWUoKSB7fTtcbk1lLmV4dGVuZCA9IG9vcC5leHRlbmRGbihNZSk7XG5vb3AubWFrZUFic3RyYWN0KE1lLCBbXG5cdFwiY29tcGF0aWJpbGl0eVwiLFxuXHRcImRpZmZcIixcblx0XCJ0b1N0cmluZ1wiXG5dKTtcblxuTWUuc2FmZSA9IGZ1bmN0aW9uIHNhZmUoZm4pIHtcblx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdGVuc3VyZUNvbXBhdGliaWxpdHkodGhpcywgdGhpcy5jb21wYXRpYmlsaXR5KCksIGFyZ3VtZW50cyk7XG5cdFx0cmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdH07XG59O1xuXG5NZS5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbiB2YWx1ZSgpIHtcblx0ZW5zdXJlLnNpZ25hdHVyZShhcmd1bWVudHMsIFtdKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5NZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKHRoYXQpIHtcblx0cmV0dXJuIHRoaXMuZGlmZih0aGF0KSA9PT0gXCJcIjtcbn07XG5cbk1lLnByb3RvdHlwZS5pc0NvbXBhdGlibGVXaXRoID0gZnVuY3Rpb24gaXNDb21wYXRpYmxlV2l0aCh0aGF0KSB7XG5cdGlmICh0aGF0ID09PSBudWxsIHx8IHR5cGVvZiB0aGF0ICE9PSBcIm9iamVjdFwiKSByZXR1cm4gZmFsc2U7XG5cblx0dmFyIGNvbXBhdGlibGVUeXBlcyA9IHRoaXMuY29tcGF0aWJpbGl0eSgpO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBhdGlibGVUeXBlcy5sZW5ndGg7IGkrKykge1xuXHRcdGlmICh0aGF0IGluc3RhbmNlb2YgY29tcGF0aWJsZVR5cGVzW2ldKSByZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiBlbnN1cmVDb21wYXRpYmlsaXR5KHNlbGYsIGNvbXBhdGlibGUsIGFyZ3MpIHtcblx0dmFyIGFyZztcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7ICAgLy8gYXJncyBpcyBub3QgYW4gQXJyYXksIGNhbid0IHVzZSBmb3JFYWNoXG5cdFx0YXJnID0gYXJnc1tpXTtcblx0XHRpZiAoIXNlbGYuaXNDb21wYXRpYmxlV2l0aChhcmcpKSB7XG5cdFx0XHR2YXIgdHlwZSA9IHR5cGVvZiBhcmc7XG5cdFx0XHRpZiAoYXJnID09PSBudWxsKSB0eXBlID0gXCJudWxsXCI7XG5cdFx0XHRpZiAodHlwZSA9PT0gXCJvYmplY3RcIikgdHlwZSA9IG9vcC5pbnN0YW5jZU5hbWUoYXJnKTtcblxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKG9vcC5pbnN0YW5jZU5hbWUoc2VsZikgKyBcIiBpc24ndCBjb21wYXRpYmxlIHdpdGggXCIgKyB0eXBlKTtcblx0XHR9XG5cdH1cbn1cblxuIiwiLyohXG4gKiBhc3luY1xuICogaHR0cHM6Ly9naXRodWIuY29tL2Nhb2xhbi9hc3luY1xuICpcbiAqIENvcHlyaWdodCAyMDEwLTIwMTQgQ2FvbGFuIE1jTWFob25cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG4oZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGFzeW5jID0ge307XG4gICAgZnVuY3Rpb24gbm9vcCgpIHt9XG4gICAgZnVuY3Rpb24gaWRlbnRpdHkodikge1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgZnVuY3Rpb24gdG9Cb29sKHYpIHtcbiAgICAgICAgcmV0dXJuICEhdjtcbiAgICB9XG4gICAgZnVuY3Rpb24gbm90SWQodikge1xuICAgICAgICByZXR1cm4gIXY7XG4gICAgfVxuXG4gICAgLy8gZ2xvYmFsIG9uIHRoZSBzZXJ2ZXIsIHdpbmRvdyBpbiB0aGUgYnJvd3NlclxuICAgIHZhciBwcmV2aW91c19hc3luYztcblxuICAgIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIChgc2VsZmApIGluIHRoZSBicm93c2VyLCBgZ2xvYmFsYFxuICAgIC8vIG9uIHRoZSBzZXJ2ZXIsIG9yIGB0aGlzYCBpbiBzb21lIHZpcnR1YWwgbWFjaGluZXMuIFdlIHVzZSBgc2VsZmBcbiAgICAvLyBpbnN0ZWFkIG9mIGB3aW5kb3dgIGZvciBgV2ViV29ya2VyYCBzdXBwb3J0LlxuICAgIHZhciByb290ID0gdHlwZW9mIHNlbGYgPT09ICdvYmplY3QnICYmIHNlbGYuc2VsZiA9PT0gc2VsZiAmJiBzZWxmIHx8XG4gICAgICAgICAgICB0eXBlb2YgZ2xvYmFsID09PSAnb2JqZWN0JyAmJiBnbG9iYWwuZ2xvYmFsID09PSBnbG9iYWwgJiYgZ2xvYmFsIHx8XG4gICAgICAgICAgICB0aGlzO1xuXG4gICAgaWYgKHJvb3QgIT0gbnVsbCkge1xuICAgICAgICBwcmV2aW91c19hc3luYyA9IHJvb3QuYXN5bmM7XG4gICAgfVxuXG4gICAgYXN5bmMubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcm9vdC5hc3luYyA9IHByZXZpb3VzX2FzeW5jO1xuICAgICAgICByZXR1cm4gYXN5bmM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG9ubHlfb25jZShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZm4gPT09IG51bGwpIHRocm93IG5ldyBFcnJvcihcIkNhbGxiYWNrIHdhcyBhbHJlYWR5IGNhbGxlZC5cIik7XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9vbmNlKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChmbiA9PT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vIGNyb3NzLWJyb3dzZXIgY29tcGF0aWJsaXR5IGZ1bmN0aW9ucyAvLy8vXG5cbiAgICB2YXIgX3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuICAgIHZhciBfaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gX3RvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgLy8gUG9ydGVkIGZyb20gdW5kZXJzY29yZS5qcyBpc09iamVjdFxuICAgIHZhciBfaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICAgICAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2lzQXJyYXlMaWtlKGFycikge1xuICAgICAgICByZXR1cm4gX2lzQXJyYXkoYXJyKSB8fCAoXG4gICAgICAgICAgICAvLyBoYXMgYSBwb3NpdGl2ZSBpbnRlZ2VyIGxlbmd0aCBwcm9wZXJ0eVxuICAgICAgICAgICAgdHlwZW9mIGFyci5sZW5ndGggPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgIGFyci5sZW5ndGggPj0gMCAmJlxuICAgICAgICAgICAgYXJyLmxlbmd0aCAlIDEgPT09IDBcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZWFjaChjb2xsLCBpdGVyYXRvcikge1xuICAgICAgICByZXR1cm4gX2lzQXJyYXlMaWtlKGNvbGwpID9cbiAgICAgICAgICAgIF9hcnJheUVhY2goY29sbCwgaXRlcmF0b3IpIDpcbiAgICAgICAgICAgIF9mb3JFYWNoT2YoY29sbCwgaXRlcmF0b3IpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hcnJheUVhY2goYXJyLCBpdGVyYXRvcikge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGFyci5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKGFycltpbmRleF0sIGluZGV4LCBhcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX21hcChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJyLmxlbmd0aCxcbiAgICAgICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRvcihhcnJbaW5kZXhdLCBpbmRleCwgYXJyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yYW5nZShjb3VudCkge1xuICAgICAgICByZXR1cm4gX21hcChBcnJheShjb3VudCksIGZ1bmN0aW9uICh2LCBpKSB7IHJldHVybiBpOyB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVkdWNlKGFyciwgaXRlcmF0b3IsIG1lbW8pIHtcbiAgICAgICAgX2FycmF5RWFjaChhcnIsIGZ1bmN0aW9uICh4LCBpLCBhKSB7XG4gICAgICAgICAgICBtZW1vID0gaXRlcmF0b3IobWVtbywgeCwgaSwgYSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWVtbztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZm9yRWFjaE9mKG9iamVjdCwgaXRlcmF0b3IpIHtcbiAgICAgICAgX2FycmF5RWFjaChfa2V5cyhvYmplY3QpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpdGVyYXRvcihvYmplY3Rba2V5XSwga2V5KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2luZGV4T2YoYXJyLCBpdGVtKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXJyW2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgdmFyIF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIga2V5cyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgICAgIGtleXMucHVzaChrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5cztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2tleUl0ZXJhdG9yKGNvbGwpIHtcbiAgICAgICAgdmFyIGkgPSAtMTtcbiAgICAgICAgdmFyIGxlbjtcbiAgICAgICAgdmFyIGtleXM7XG4gICAgICAgIGlmIChfaXNBcnJheUxpa2UoY29sbCkpIHtcbiAgICAgICAgICAgIGxlbiA9IGNvbGwubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8gaSA6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5cyA9IF9rZXlzKGNvbGwpO1xuICAgICAgICAgICAgbGVuID0ga2V5cy5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPCBsZW4gPyBrZXlzW2ldIDogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTaW1pbGFyIHRvIEVTNidzIHJlc3QgcGFyYW0gKGh0dHA6Ly9hcml5YS5vZmlsYWJzLmNvbS8yMDEzLzAzL2VzNi1hbmQtcmVzdC1wYXJhbWV0ZXIuaHRtbClcbiAgICAvLyBUaGlzIGFjY3VtdWxhdGVzIHRoZSBhcmd1bWVudHMgcGFzc2VkIGludG8gYW4gYXJyYXksIGFmdGVyIGEgZ2l2ZW4gaW5kZXguXG4gICAgLy8gRnJvbSB1bmRlcnNjb3JlLmpzIChodHRwczovL2dpdGh1Yi5jb20vamFzaGtlbmFzL3VuZGVyc2NvcmUvcHVsbC8yMTQwKS5cbiAgICBmdW5jdGlvbiBfcmVzdFBhcmFtKGZ1bmMsIHN0YXJ0SW5kZXgpIHtcbiAgICAgICAgc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXggPT0gbnVsbCA/IGZ1bmMubGVuZ3RoIC0gMSA6ICtzdGFydEluZGV4O1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoYXJndW1lbnRzLmxlbmd0aCAtIHN0YXJ0SW5kZXgsIDApO1xuICAgICAgICAgICAgdmFyIHJlc3QgPSBBcnJheShsZW5ndGgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgICAgIHJlc3RbaW5kZXhdID0gYXJndW1lbnRzW2luZGV4ICsgc3RhcnRJbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzd2l0Y2ggKHN0YXJ0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpcywgcmVzdCk7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIGFyZ3VtZW50c1swXSwgcmVzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDdXJyZW50bHkgdW51c2VkIGJ1dCBoYW5kbGUgY2FzZXMgb3V0c2lkZSBvZiB0aGUgc3dpdGNoIHN0YXRlbWVudDpcbiAgICAgICAgICAgIC8vIHZhciBhcmdzID0gQXJyYXkoc3RhcnRJbmRleCArIDEpO1xuICAgICAgICAgICAgLy8gZm9yIChpbmRleCA9IDA7IGluZGV4IDwgc3RhcnRJbmRleDsgaW5kZXgrKykge1xuICAgICAgICAgICAgLy8gICAgIGFyZ3NbaW5kZXhdID0gYXJndW1lbnRzW2luZGV4XTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIC8vIGFyZ3Nbc3RhcnRJbmRleF0gPSByZXN0O1xuICAgICAgICAgICAgLy8gcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3dpdGhvdXRJbmRleChpdGVyYXRvcikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRvcih2YWx1ZSwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vLy8gZXhwb3J0ZWQgYXN5bmMgbW9kdWxlIGZ1bmN0aW9ucyAvLy8vXG5cbiAgICAvLy8vIG5leHRUaWNrIGltcGxlbWVudGF0aW9uIHdpdGggYnJvd3Nlci1jb21wYXRpYmxlIGZhbGxiYWNrIC8vLy9cblxuICAgIC8vIGNhcHR1cmUgdGhlIGdsb2JhbCByZWZlcmVuY2UgdG8gZ3VhcmQgYWdhaW5zdCBmYWtlVGltZXIgbW9ja3NcbiAgICB2YXIgX3NldEltbWVkaWF0ZSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgJiYgc2V0SW1tZWRpYXRlO1xuXG4gICAgdmFyIF9kZWxheSA9IF9zZXRJbW1lZGlhdGUgPyBmdW5jdGlvbihmbikge1xuICAgICAgICAvLyBub3QgYSBkaXJlY3QgYWxpYXMgZm9yIElFMTAgY29tcGF0aWJpbGl0eVxuICAgICAgICBfc2V0SW1tZWRpYXRlKGZuKTtcbiAgICB9IDogZnVuY3Rpb24oZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcblxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHByb2Nlc3MubmV4dFRpY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgYXN5bmMubmV4dFRpY2sgPSBwcm9jZXNzLm5leHRUaWNrO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGFzeW5jLm5leHRUaWNrID0gX2RlbGF5O1xuICAgIH1cbiAgICBhc3luYy5zZXRJbW1lZGlhdGUgPSBfc2V0SW1tZWRpYXRlID8gX2RlbGF5IDogYXN5bmMubmV4dFRpY2s7XG5cblxuICAgIGFzeW5jLmZvckVhY2ggPVxuICAgIGFzeW5jLmVhY2ggPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmVhY2hPZihhcnIsIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hTZXJpZXMgPVxuICAgIGFzeW5jLmVhY2hTZXJpZXMgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmVhY2hPZlNlcmllcyhhcnIsIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpLCBjYWxsYmFjayk7XG4gICAgfTtcblxuXG4gICAgYXN5bmMuZm9yRWFjaExpbWl0ID1cbiAgICBhc3luYy5lYWNoTGltaXQgPSBmdW5jdGlvbiAoYXJyLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBfZWFjaE9mTGltaXQobGltaXQpKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaE9mID1cbiAgICBhc3luYy5lYWNoT2YgPSBmdW5jdGlvbiAob2JqZWN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgb2JqZWN0ID0gb2JqZWN0IHx8IFtdO1xuICAgICAgICB2YXIgc2l6ZSA9IF9pc0FycmF5TGlrZShvYmplY3QpID8gb2JqZWN0Lmxlbmd0aCA6IF9rZXlzKG9iamVjdCkubGVuZ3RoO1xuICAgICAgICB2YXIgY29tcGxldGVkID0gMDtcbiAgICAgICAgaWYgKCFzaXplKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgX2VhY2gob2JqZWN0LCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgaXRlcmF0b3Iob2JqZWN0W2tleV0sIGtleSwgb25seV9vbmNlKGRvbmUpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZ1bmN0aW9uIGRvbmUoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlZCArPSAxO1xuICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZWQgPj0gc2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaE9mU2VyaWVzID1cbiAgICBhc3luYy5lYWNoT2ZTZXJpZXMgPSBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgb2JqID0gb2JqIHx8IFtdO1xuICAgICAgICB2YXIgbmV4dEtleSA9IF9rZXlJdGVyYXRvcihvYmopO1xuICAgICAgICB2YXIga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICBmdW5jdGlvbiBpdGVyYXRlKCkge1xuICAgICAgICAgICAgdmFyIHN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZXJhdG9yKG9ialtrZXldLCBrZXksIG9ubHlfb25jZShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShpdGVyYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlcmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGl0ZXJhdGUoKTtcbiAgICB9O1xuXG5cblxuICAgIGFzeW5jLmZvckVhY2hPZkxpbWl0ID1cbiAgICBhc3luYy5lYWNoT2ZMaW1pdCA9IGZ1bmN0aW9uIChvYmosIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgX2VhY2hPZkxpbWl0KGxpbWl0KShvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9lYWNoT2ZMaW1pdChsaW1pdCkge1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgICAgICBvYmogPSBvYmogfHwgW107XG4gICAgICAgICAgICB2YXIgbmV4dEtleSA9IF9rZXlJdGVyYXRvcihvYmopO1xuICAgICAgICAgICAgaWYgKGxpbWl0IDw9IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIHJ1bm5pbmcgPSAwO1xuICAgICAgICAgICAgdmFyIGVycm9yZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgKGZ1bmN0aW9uIHJlcGxlbmlzaCAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvbmUgJiYgcnVubmluZyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAocnVubmluZyA8IGxpbWl0ICYmICFlcnJvcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3Iob2JqW2tleV0sIGtleSwgb25seV9vbmNlKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGVuaXNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9O1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gZG9QYXJhbGxlbChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oYXN5bmMuZWFjaE9mLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWxMaW1pdChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKF9lYWNoT2ZMaW1pdChsaW1pdCksIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZG9TZXJpZXMoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGFzeW5jLmVhY2hPZlNlcmllcywgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hc3luY01hcChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih2YWx1ZSwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLm1hcCA9IGRvUGFyYWxsZWwoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBTZXJpZXMgPSBkb1NlcmllcyhfYXN5bmNNYXApO1xuICAgIGFzeW5jLm1hcExpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9hc3luY01hcCk7XG5cbiAgICAvLyByZWR1Y2Ugb25seSBoYXMgYSBzZXJpZXMgdmVyc2lvbiwgYXMgZG9pbmcgcmVkdWNlIGluIHBhcmFsbGVsIHdvbid0XG4gICAgLy8gd29yayBpbiBtYW55IHNpdHVhdGlvbnMuXG4gICAgYXN5bmMuaW5qZWN0ID1cbiAgICBhc3luYy5mb2xkbCA9XG4gICAgYXN5bmMucmVkdWNlID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLmVhY2hPZlNlcmllcyhhcnIsIGZ1bmN0aW9uICh4LCBpLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IobWVtbywgeCwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIG1lbW8gPSB2O1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyIHx8IG51bGwsIG1lbW8pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9sZHIgPVxuICAgIGFzeW5jLnJlZHVjZVJpZ2h0ID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXZlcnNlZCA9IF9tYXAoYXJyLCBpZGVudGl0eSkucmV2ZXJzZSgpO1xuICAgICAgICBhc3luYy5yZWR1Y2UocmV2ZXJzZWQsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9maWx0ZXIoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7aW5kZXg6IGluZGV4LCB2YWx1ZTogeH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKF9tYXAocmVzdWx0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICAgICAgICAgICAgfSksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHgudmFsdWU7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLnNlbGVjdCA9XG4gICAgYXN5bmMuZmlsdGVyID0gZG9QYXJhbGxlbChfZmlsdGVyKTtcblxuICAgIGFzeW5jLnNlbGVjdExpbWl0ID1cbiAgICBhc3luYy5maWx0ZXJMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfZmlsdGVyKTtcblxuICAgIGFzeW5jLnNlbGVjdFNlcmllcyA9XG4gICAgYXN5bmMuZmlsdGVyU2VyaWVzID0gZG9TZXJpZXMoX2ZpbHRlcik7XG5cbiAgICBmdW5jdGlvbiBfcmVqZWN0KGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgX2ZpbHRlcihlYWNoZm4sIGFyciwgZnVuY3Rpb24odmFsdWUsIGNiKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih2YWx1ZSwgZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgIGNiKCF2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGFzeW5jLnJlamVjdCA9IGRvUGFyYWxsZWwoX3JlamVjdCk7XG4gICAgYXN5bmMucmVqZWN0TGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX3JlamVjdCk7XG4gICAgYXN5bmMucmVqZWN0U2VyaWVzID0gZG9TZXJpZXMoX3JlamVjdCk7XG5cbiAgICBmdW5jdGlvbiBfY3JlYXRlVGVzdGVyKGVhY2hmbiwgY2hlY2ssIGdldFJlc3VsdCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXJyLCBsaW1pdCwgaXRlcmF0b3IsIGNiKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBkb25lKCkge1xuICAgICAgICAgICAgICAgIGlmIChjYikgY2IoZ2V0UmVzdWx0KGZhbHNlLCB2b2lkIDApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGl0ZXJhdGVlKHgsIF8sIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjYikgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNiICYmIGNoZWNrKHYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYihnZXRSZXN1bHQodHJ1ZSwgeCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IgPSBpdGVyYXRvciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgICAgICBlYWNoZm4oYXJyLCBsaW1pdCwgaXRlcmF0ZWUsIGRvbmUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYiA9IGl0ZXJhdG9yO1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yID0gbGltaXQ7XG4gICAgICAgICAgICAgICAgZWFjaGZuKGFyciwgaXRlcmF0ZWUsIGRvbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFzeW5jLmFueSA9XG4gICAgYXN5bmMuc29tZSA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCB0b0Jvb2wsIGlkZW50aXR5KTtcblxuICAgIGFzeW5jLnNvbWVMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIHRvQm9vbCwgaWRlbnRpdHkpO1xuXG4gICAgYXN5bmMuYWxsID1cbiAgICBhc3luYy5ldmVyeSA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCBub3RJZCwgbm90SWQpO1xuXG4gICAgYXN5bmMuZXZlcnlMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIG5vdElkLCBub3RJZCk7XG5cbiAgICBmdW5jdGlvbiBfZmluZEdldFJlc3VsdCh2LCB4KSB7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgICBhc3luYy5kZXRlY3QgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcbiAgICBhc3luYy5kZXRlY3RTZXJpZXMgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZlNlcmllcywgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcbiAgICBhc3luYy5kZXRlY3RMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG5cbiAgICBhc3luYy5zb3J0QnkgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgYXN5bmMubWFwKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAoZXJyLCBjcml0ZXJpYSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHt2YWx1ZTogeCwgY3JpdGVyaWE6IGNyaXRlcmlhfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIF9tYXAocmVzdWx0cy5zb3J0KGNvbXBhcmF0b3IpLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gY29tcGFyYXRvcihsZWZ0LCByaWdodCkge1xuICAgICAgICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhLCBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICAgICAgICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IDA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuYXV0byA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIGtleXMgPSBfa2V5cyh0YXNrcyk7XG4gICAgICAgIHZhciByZW1haW5pbmdUYXNrcyA9IGtleXMubGVuZ3RoO1xuICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgZnVuY3Rpb24gYWRkTGlzdGVuZXIoZm4pIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy51bnNoaWZ0KGZuKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgdmFyIGlkeCA9IF9pbmRleE9mKGxpc3RlbmVycywgZm4pO1xuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSBsaXN0ZW5lcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gdGFza0NvbXBsZXRlKCkge1xuICAgICAgICAgICAgcmVtYWluaW5nVGFza3MtLTtcbiAgICAgICAgICAgIF9hcnJheUVhY2gobGlzdGVuZXJzLnNsaWNlKDApLCBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF9hcnJheUVhY2goa2V5cywgZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHZhciB0YXNrID0gX2lzQXJyYXkodGFza3Nba10pID8gdGFza3Nba106IFt0YXNrc1trXV07XG4gICAgICAgICAgICB2YXIgdGFza0NhbGxiYWNrID0gX3Jlc3RQYXJhbShmdW5jdGlvbihlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2FmZVJlc3VsdHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgX2ZvckVhY2hPZihyZXN1bHRzLCBmdW5jdGlvbih2YWwsIHJrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhZmVSZXN1bHRzW3JrZXldID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc2FmZVJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHNhZmVSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUodGFza0NvbXBsZXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciByZXF1aXJlcyA9IHRhc2suc2xpY2UoMCwgdGFzay5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIC8vIHByZXZlbnQgZGVhZC1sb2Nrc1xuICAgICAgICAgICAgdmFyIGxlbiA9IHJlcXVpcmVzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkZXA7XG4gICAgICAgICAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShkZXAgPSB0YXNrc1tyZXF1aXJlc1tsZW5dXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIYXMgaW5leGlzdGFudCBkZXBlbmRlbmN5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfaXNBcnJheShkZXApICYmIF9pbmRleE9mKGRlcCwgaykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBjeWNsaWMgZGVwZW5kZW5jaWVzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gcmVhZHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWR1Y2UocmVxdWlyZXMsIGZ1bmN0aW9uIChhLCB4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYSAmJiByZXN1bHRzLmhhc093blByb3BlcnR5KHgpKTtcbiAgICAgICAgICAgICAgICB9LCB0cnVlKSAmJiAhcmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgdGFza1t0YXNrLmxlbmd0aCAtIDFdKHRhc2tDYWxsYmFjaywgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBsaXN0ZW5lcigpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVhZHkoKSkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tbdGFzay5sZW5ndGggLSAxXSh0YXNrQ2FsbGJhY2ssIHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuXG5cbiAgICBhc3luYy5yZXRyeSA9IGZ1bmN0aW9uKHRpbWVzLCB0YXNrLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgREVGQVVMVF9USU1FUyA9IDU7XG4gICAgICAgIHZhciBERUZBVUxUX0lOVEVSVkFMID0gMDtcblxuICAgICAgICB2YXIgYXR0ZW1wdHMgPSBbXTtcblxuICAgICAgICB2YXIgb3B0cyA9IHtcbiAgICAgICAgICAgIHRpbWVzOiBERUZBVUxUX1RJTUVTLFxuICAgICAgICAgICAgaW50ZXJ2YWw6IERFRkFVTFRfSU5URVJWQUxcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBwYXJzZVRpbWVzKGFjYywgdCl7XG4gICAgICAgICAgICBpZih0eXBlb2YgdCA9PT0gJ251bWJlcicpe1xuICAgICAgICAgICAgICAgIGFjYy50aW1lcyA9IHBhcnNlSW50KHQsIDEwKSB8fCBERUZBVUxUX1RJTUVTO1xuICAgICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiB0ID09PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgYWNjLnRpbWVzID0gcGFyc2VJbnQodC50aW1lcywgMTApIHx8IERFRkFVTFRfVElNRVM7XG4gICAgICAgICAgICAgICAgYWNjLmludGVydmFsID0gcGFyc2VJbnQodC5pbnRlcnZhbCwgMTApIHx8IERFRkFVTFRfSU5URVJWQUw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgYXJndW1lbnQgdHlwZSBmb3IgXFwndGltZXNcXCc6ICcgKyB0eXBlb2YgdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgaWYgKGxlbmd0aCA8IDEgfHwgbGVuZ3RoID4gMykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFyZ3VtZW50cyAtIG11c3QgYmUgZWl0aGVyICh0YXNrKSwgKHRhc2ssIGNhbGxiYWNrKSwgKHRpbWVzLCB0YXNrKSBvciAodGltZXMsIHRhc2ssIGNhbGxiYWNrKScpO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA8PSAyICYmIHR5cGVvZiB0aW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSB0YXNrO1xuICAgICAgICAgICAgdGFzayA9IHRpbWVzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGltZXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHBhcnNlVGltZXMob3B0cywgdGltZXMpO1xuICAgICAgICB9XG4gICAgICAgIG9wdHMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgb3B0cy50YXNrID0gdGFzaztcblxuICAgICAgICBmdW5jdGlvbiB3cmFwcGVkVGFzayh3cmFwcGVkQ2FsbGJhY2ssIHdyYXBwZWRSZXN1bHRzKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiByZXRyeUF0dGVtcHQodGFzaywgZmluYWxBdHRlbXB0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlcmllc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2soZnVuY3Rpb24oZXJyLCByZXN1bHQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VyaWVzQ2FsbGJhY2soIWVyciB8fCBmaW5hbEF0dGVtcHQsIHtlcnI6IGVyciwgcmVzdWx0OiByZXN1bHR9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgd3JhcHBlZFJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJldHJ5SW50ZXJ2YWwoaW50ZXJ2YWwpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpZXNDYWxsYmFjayl7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc0NhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2hpbGUgKG9wdHMudGltZXMpIHtcblxuICAgICAgICAgICAgICAgIHZhciBmaW5hbEF0dGVtcHQgPSAhKG9wdHMudGltZXMtPTEpO1xuICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlBdHRlbXB0KG9wdHMudGFzaywgZmluYWxBdHRlbXB0KSk7XG4gICAgICAgICAgICAgICAgaWYoIWZpbmFsQXR0ZW1wdCAmJiBvcHRzLmludGVydmFsID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlJbnRlcnZhbChvcHRzLmludGVydmFsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3luYy5zZXJpZXMoYXR0ZW1wdHMsIGZ1bmN0aW9uKGRvbmUsIGRhdGEpe1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhW2RhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgKHdyYXBwZWRDYWxsYmFjayB8fCBvcHRzLmNhbGxiYWNrKShkYXRhLmVyciwgZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBhIGNhbGxiYWNrIGlzIHBhc3NlZCwgcnVuIHRoaXMgYXMgYSBjb250cm9sbCBmbG93XG4gICAgICAgIHJldHVybiBvcHRzLmNhbGxiYWNrID8gd3JhcHBlZFRhc2soKSA6IHdyYXBwZWRUYXNrO1xuICAgIH07XG5cbiAgICBhc3luYy53YXRlcmZhbGwgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIGlmICghX2lzQXJyYXkodGFza3MpKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byB3YXRlcmZhbGwgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKTtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB3cmFwSXRlcmF0b3IoaXRlcmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtlcnJdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaCh3cmFwSXRlcmF0b3IobmV4dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbnN1cmVBc3luYyhpdGVyYXRvcikuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgd3JhcEl0ZXJhdG9yKGFzeW5jLml0ZXJhdG9yKHRhc2tzKSkoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3BhcmFsbGVsKGVhY2hmbiwgdGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBfaXNBcnJheUxpa2UodGFza3MpID8gW10gOiB7fTtcblxuICAgICAgICBlYWNoZm4odGFza3MsIGZ1bmN0aW9uICh0YXNrLCBrZXksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0YXNrKF9yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRzW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLnBhcmFsbGVsID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoYXN5bmMuZWFjaE9mLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5wYXJhbGxlbExpbWl0ID0gZnVuY3Rpb24odGFza3MsIGxpbWl0LCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoX2VhY2hPZkxpbWl0KGxpbWl0KSwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VyaWVzID0gZnVuY3Rpb24odGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChhc3luYy5lYWNoT2ZTZXJpZXMsIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLml0ZXJhdG9yID0gZnVuY3Rpb24gKHRhc2tzKSB7XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VDYWxsYmFjayhpbmRleCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZm4oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0YXNrc1tpbmRleF0uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLm5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZuLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChpbmRleCA8IHRhc2tzLmxlbmd0aCAtIDEpID8gbWFrZUNhbGxiYWNrKGluZGV4ICsgMSk6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGZuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYWtlQ2FsbGJhY2soMCk7XG4gICAgfTtcblxuICAgIGFzeW5jLmFwcGx5ID0gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGNhbGxBcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkoXG4gICAgICAgICAgICAgICAgbnVsbCwgYXJncy5jb25jYXQoY2FsbEFyZ3MpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIF9jb25jYXQoZWFjaGZuLCBhcnIsIGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2IpIHtcbiAgICAgICAgICAgIGZuKHgsIGZ1bmN0aW9uIChlcnIsIHkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHkgfHwgW10pO1xuICAgICAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMuY29uY2F0ID0gZG9QYXJhbGxlbChfY29uY2F0KTtcbiAgICBhc3luYy5jb25jYXRTZXJpZXMgPSBkb1NlcmllcyhfY29uY2F0KTtcblxuICAgIGFzeW5jLndoaWxzdCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICBpZiAodGVzdCgpKSB7XG4gICAgICAgICAgICB2YXIgbmV4dCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGVzdC5hcHBseSh0aGlzLCBhcmdzKSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuZG9XaGlsc3QgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxscyA9IDA7XG4gICAgICAgIHJldHVybiBhc3luYy53aGlsc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gKytjYWxscyA8PSAxIHx8IHRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMudW50aWwgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy53aGlsc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9VbnRpbCA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmRvV2hpbHN0KGl0ZXJhdG9yLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmR1cmluZyA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuXG4gICAgICAgIHZhciBuZXh0ID0gX3Jlc3RQYXJhbShmdW5jdGlvbihlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goY2hlY2spO1xuICAgICAgICAgICAgICAgIHRlc3QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBjaGVjayA9IGZ1bmN0aW9uKGVyciwgdHJ1dGgpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0cnV0aCkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0ZXN0KGNoZWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9EdXJpbmcgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxscyA9IDA7XG4gICAgICAgIGFzeW5jLmR1cmluZyhmdW5jdGlvbihuZXh0KSB7XG4gICAgICAgICAgICBpZiAoY2FsbHMrKyA8IDEpIHtcbiAgICAgICAgICAgICAgICBuZXh0KG51bGwsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5LCBwYXlsb2FkKSB7XG4gICAgICAgIGlmIChjb25jdXJyZW5jeSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihjb25jdXJyZW5jeSA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb25jdXJyZW5jeSBtdXN0IG5vdCBiZSB6ZXJvJyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwb3MsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRhc2sgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggPT09IDAgJiYgcS5pZGxlKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9hcnJheUVhY2goZGF0YSwgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2sgfHwgbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAocG9zKSB7XG4gICAgICAgICAgICAgICAgICAgIHEudGFza3MudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSBxLmNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBfbmV4dChxLCB0YXNrcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd29ya2VycyAtPSAxO1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIF9hcnJheUVhY2godGFza3MsIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2suY2FsbGJhY2suYXBwbHkodGFzaywgYXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHEucHJvY2VzcygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3b3JrZXJzID0gMDtcbiAgICAgICAgdmFyIHEgPSB7XG4gICAgICAgICAgICB0YXNrczogW10sXG4gICAgICAgICAgICBjb25jdXJyZW5jeTogY29uY3VycmVuY3ksXG4gICAgICAgICAgICBwYXlsb2FkOiBwYXlsb2FkLFxuICAgICAgICAgICAgc2F0dXJhdGVkOiBub29wLFxuICAgICAgICAgICAgZW1wdHk6IG5vb3AsXG4gICAgICAgICAgICBkcmFpbjogbm9vcCxcbiAgICAgICAgICAgIHN0YXJ0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcGF1c2VkOiBmYWxzZSxcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgZmFsc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBraWxsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcS5kcmFpbiA9IG5vb3A7XG4gICAgICAgICAgICAgICAgcS50YXNrcyA9IFtdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVuc2hpZnQ6IGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgdHJ1ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXEucGF1c2VkICYmIHdvcmtlcnMgPCBxLmNvbmN1cnJlbmN5ICYmIHEudGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKHdvcmtlcnMgPCBxLmNvbmN1cnJlbmN5ICYmIHEudGFza3MubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YXNrcyA9IHEucGF5bG9hZCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoMCwgcS5wYXlsb2FkKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoMCwgcS50YXNrcy5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IF9tYXAodGFza3MsIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxLmVtcHR5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXJzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2IgPSBvbmx5X29uY2UoX25leHQocSwgdGFza3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcihkYXRhLCBjYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGVuZ3RoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHEudGFza3MubGVuZ3RoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJ1bm5pbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VycztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpZGxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcS5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VtZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChxLnBhdXNlZCA9PT0gZmFsc2UpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICAgICAgcS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdW1lQ291bnQgPSBNYXRoLm1pbihxLmNvbmN1cnJlbmN5LCBxLnRhc2tzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgLy8gTmVlZCB0byBjYWxsIHEucHJvY2VzcyBvbmNlIHBlciBjb25jdXJyZW50XG4gICAgICAgICAgICAgICAgLy8gd29ya2VyIHRvIHByZXNlcnZlIGZ1bGwgY29uY3VycmVuY3kgYWZ0ZXIgcGF1c2VcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB3ID0gMTsgdyA8PSByZXN1bWVDb3VudDsgdysrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfVxuXG4gICAgYXN5bmMucXVldWUgPSBmdW5jdGlvbiAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuICAgICAgICB2YXIgcSA9IF9xdWV1ZShmdW5jdGlvbiAoaXRlbXMsIGNiKSB7XG4gICAgICAgICAgICB3b3JrZXIoaXRlbXNbMF0sIGNiKTtcbiAgICAgICAgfSwgY29uY3VycmVuY3ksIDEpO1xuXG4gICAgICAgIHJldHVybiBxO1xuICAgIH07XG5cbiAgICBhc3luYy5wcmlvcml0eVF1ZXVlID0gZnVuY3Rpb24gKHdvcmtlciwgY29uY3VycmVuY3kpIHtcblxuICAgICAgICBmdW5jdGlvbiBfY29tcGFyZVRhc2tzKGEsIGIpe1xuICAgICAgICAgICAgcmV0dXJuIGEucHJpb3JpdHkgLSBiLnByaW9yaXR5O1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX2JpbmFyeVNlYXJjaChzZXF1ZW5jZSwgaXRlbSwgY29tcGFyZSkge1xuICAgICAgICAgICAgdmFyIGJlZyA9IC0xLFxuICAgICAgICAgICAgICAgIGVuZCA9IHNlcXVlbmNlLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICB3aGlsZSAoYmVnIDwgZW5kKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1pZCA9IGJlZyArICgoZW5kIC0gYmVnICsgMSkgPj4+IDEpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wYXJlKGl0ZW0sIHNlcXVlbmNlW21pZF0pID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYmVnID0gbWlkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IG1pZCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJlZztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRhc2sgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9hcnJheUVhY2goZGF0YSwgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogcHJpb3JpdHksXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6IG5vb3BcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoX2JpbmFyeVNlYXJjaChxLnRhc2tzLCBpdGVtLCBfY29tcGFyZVRhc2tzKSArIDEsIDAsIGl0ZW0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSBxLmNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGFydCB3aXRoIGEgbm9ybWFsIHF1ZXVlXG4gICAgICAgIHZhciBxID0gYXN5bmMucXVldWUod29ya2VyLCBjb25jdXJyZW5jeSk7XG5cbiAgICAgICAgLy8gT3ZlcnJpZGUgcHVzaCB0byBhY2NlcHQgc2Vjb25kIHBhcmFtZXRlciByZXByZXNlbnRpbmcgcHJpb3JpdHlcbiAgICAgICAgcS5wdXNoID0gZnVuY3Rpb24gKGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJlbW92ZSB1bnNoaWZ0IGZ1bmN0aW9uXG4gICAgICAgIGRlbGV0ZSBxLnVuc2hpZnQ7XG5cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcblxuICAgIGFzeW5jLmNhcmdvID0gZnVuY3Rpb24gKHdvcmtlciwgcGF5bG9hZCkge1xuICAgICAgICByZXR1cm4gX3F1ZXVlKHdvcmtlciwgMSwgcGF5bG9hZCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9jb25zb2xlX2ZuKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGZuLCBhcmdzKSB7XG4gICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjb25zb2xlW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKGFyZ3MsIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZVtuYW1lXSh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSldKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYy5sb2cgPSBfY29uc29sZV9mbignbG9nJyk7XG4gICAgYXN5bmMuZGlyID0gX2NvbnNvbGVfZm4oJ2RpcicpO1xuICAgIC8qYXN5bmMuaW5mbyA9IF9jb25zb2xlX2ZuKCdpbmZvJyk7XG4gICAgYXN5bmMud2FybiA9IF9jb25zb2xlX2ZuKCd3YXJuJyk7XG4gICAgYXN5bmMuZXJyb3IgPSBfY29uc29sZV9mbignZXJyb3InKTsqL1xuXG4gICAgYXN5bmMubWVtb2l6ZSA9IGZ1bmN0aW9uIChmbiwgaGFzaGVyKSB7XG4gICAgICAgIHZhciBtZW1vID0ge307XG4gICAgICAgIHZhciBxdWV1ZXMgPSB7fTtcbiAgICAgICAgaGFzaGVyID0gaGFzaGVyIHx8IGlkZW50aXR5O1xuICAgICAgICB2YXIgbWVtb2l6ZWQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIG1lbW9pemVkKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKGtleSBpbiBtZW1vKSB7XG4gICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgbWVtb1trZXldKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSBpbiBxdWV1ZXMpIHtcbiAgICAgICAgICAgICAgICBxdWV1ZXNba2V5XS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldID0gW2NhbGxiYWNrXTtcbiAgICAgICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgICAgICAgICBtZW1vW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcSA9IHF1ZXVlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gcS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHFbaV0uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG1lbW9pemVkLm1lbW8gPSBtZW1vO1xuICAgICAgICBtZW1vaXplZC51bm1lbW9pemVkID0gZm47XG4gICAgICAgIHJldHVybiBtZW1vaXplZDtcbiAgICB9O1xuXG4gICAgYXN5bmMudW5tZW1vaXplID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZuLnVubWVtb2l6ZWQgfHwgZm4pLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF90aW1lcyhtYXBwZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb3VudCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBtYXBwZXIoX3JhbmdlKGNvdW50KSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYy50aW1lcyA9IF90aW1lcyhhc3luYy5tYXApO1xuICAgIGFzeW5jLnRpbWVzU2VyaWVzID0gX3RpbWVzKGFzeW5jLm1hcFNlcmllcyk7XG4gICAgYXN5bmMudGltZXNMaW1pdCA9IGZ1bmN0aW9uIChjb3VudCwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMubWFwTGltaXQoX3JhbmdlKGNvdW50KSwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnNlcSA9IGZ1bmN0aW9uICgvKiBmdW5jdGlvbnMuLi4gKi8pIHtcbiAgICAgICAgdmFyIGZucyA9IGFyZ3VtZW50cztcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgYXJncy5wb3AoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBub29wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3luYy5yZWR1Y2UoZm5zLCBhcmdzLCBmdW5jdGlvbiAobmV3YXJncywgZm4sIGNiKSB7XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgbmV3YXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgbmV4dGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgY2IoZXJyLCBuZXh0YXJncyk7XG4gICAgICAgICAgICAgICAgfSldKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoYXQsIFtlcnJdLmNvbmNhdChyZXN1bHRzKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLmNvbXBvc2UgPSBmdW5jdGlvbiAoLyogZnVuY3Rpb25zLi4uICovKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5zZXEuYXBwbHkobnVsbCwgQXJyYXkucHJvdG90eXBlLnJldmVyc2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICB9O1xuXG5cbiAgICBmdW5jdGlvbiBfYXBwbHlFYWNoKGVhY2hmbikge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbihmbnMsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBnbyA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlYWNoZm4oZm5zLCBmdW5jdGlvbiAoZm4sIF8sIGNiKSB7XG4gICAgICAgICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MuY29uY2F0KFtjYl0pKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdvLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5hcHBseUVhY2ggPSBfYXBwbHlFYWNoKGFzeW5jLmVhY2hPZik7XG4gICAgYXN5bmMuYXBwbHlFYWNoU2VyaWVzID0gX2FwcGx5RWFjaChhc3luYy5lYWNoT2ZTZXJpZXMpO1xuXG5cbiAgICBhc3luYy5mb3JldmVyID0gZnVuY3Rpb24gKGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZG9uZSA9IG9ubHlfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIHRhc2sgPSBlbnN1cmVBc3luYyhmbik7XG4gICAgICAgIGZ1bmN0aW9uIG5leHQoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhc2sobmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBlbnN1cmVBc3luYyhmbikge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIGFyZ3MucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlubmVyQXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5lbnN1cmVBc3luYyA9IGVuc3VyZUFzeW5jO1xuXG4gICAgYXN5bmMuY29uc3RhbnQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICB2YXIgYXJncyA9IFtudWxsXS5jb25jYXQodmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXN5bmMud3JhcFN5bmMgPVxuICAgIGFzeW5jLmFzeW5jaWZ5ID0gZnVuY3Rpb24gYXN5bmNpZnkoZnVuYykge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgcmVzdWx0IGlzIFByb21pc2Ugb2JqZWN0XG4gICAgICAgICAgICBpZiAoX2lzT2JqZWN0KHJlc3VsdCkgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLm1lc3NhZ2UgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBOb2RlLmpzXG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gYXN5bmM7XG4gICAgfVxuICAgIC8vIEFNRCAvIFJlcXVpcmVKU1xuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBhc3luYztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGluY2x1ZGVkIGRpcmVjdGx5IHZpYSA8c2NyaXB0PiB0YWdcbiAgICBlbHNlIHtcbiAgICAgICAgcm9vdC5hc3luYyA9IGFzeW5jO1xuICAgIH1cblxufSgpKTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0cikge1xuXHRpZiAoc3RyLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBzdHI7XG5cdH1cblxuXHRyZXR1cm4gc3RyXG5cdC5yZXBsYWNlKC9eW18uXFwtIF0rLywgJycpXG5cdC50b0xvd2VyQ2FzZSgpXG5cdC5yZXBsYWNlKC9bXy5cXC0gXSsoXFx3fCQpL2csIGZ1bmN0aW9uIChtLCBwMSkge1xuXHRcdHJldHVybiBwMS50b1VwcGVyQ2FzZSgpO1xuXHR9KTtcbn07XG4iXX0=

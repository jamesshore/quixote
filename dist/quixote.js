!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.quixote=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var Me = module.exports = function Frame(domElement) {
	this._domElement = domElement;
	// TODO: fail fast
};

Me.create = function create() {
	var element = document.createElement("iframe");
	return new Me(element);
};

Me.prototype.toDomElement = function() {
	return this._domElement;
};
},{}],2:[function(require,module,exports){
// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");
var Frame = require("./frame.js");

exports.createFrame = function() {
	return new Frame();
};
},{"./frame.js":1,"./util/ensure.js":3}],3:[function(require,module,exports){
// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
"use strict";

// ****
// Runtime assertions for production code. (Contrast to assert.js, which is for test code.)
// ****

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

	var type, arg, name;
	for (var i = 0; i < signature.length; i++) {
		type = signature[i];
		arg = args[i];
		name = "Argument " + i;

		if (!isArray(type)) type = [ type ];

		if (!typeMatches(type, arg, name)) {
			throw new EnsureException(
				exports.signature,
				name + " expected " + explainType(type) + ", but was " + explainArg(arg)
			);
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
			case "object": return arg instanceof type;
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
				else return functionName(type) + " instance";
		}
	}
}

function explainArg(arg) {
	var type = getType(arg);
	if (type !== "object") return type;

	var prototype = getPrototype(arg);
	if (prototype === null) return "an object without a prototype";
	else return functionName(prototype.constructor) + " instance";
}

function getType(variable) {
	var type = typeof variable;
	if (variable === null) type = "null";
	if (isArray(variable)) type = "array";
	if (type === "number" && isNaN(variable)) type = "NaN";
	return type;
}


/*****/

var EnsureException = exports.EnsureException = function(fnToRemoveFromStackTrace, message) {
	if (Error.captureStackTrace) Error.captureStackTrace(this, fnToRemoveFromStackTrace);
	else this.stack = (new Error()).stack;
	this.message = message;
};
EnsureException.prototype = createObject(Error.prototype);
EnsureException.prototype.constructor = EnsureException;
EnsureException.prototype.name = "EnsureException";


/*****/

// WORKAROUND IE8: no Object.create()
function createObject(prototype) {
	if (Object.create) return Object.create(prototype);

	var Temp = function Temp() {};
	Temp.prototype = prototype;
	return new Temp();
}

// WORKAROUND IE8 IE9 IE10 IE11: no function.name
function functionName(fn) {
	if (fn.name) return fn.name;

	// This workaround is based on code by Jason Bunting et al, http://stackoverflow.com/a/332429
	var funcNameRegex = /function\s+(.{1,})\s*\(/;
	var results = (funcNameRegex).exec((fn).toString());
	return (results && results.length > 1) ? results[1] : "<anon>";
}

// WORKAROUND IE8: no Array.isArray
function isArray(thing) {
	if (Array.isArray) return Array.isArray(thing);

	return Object.prototype.toString.call(thing) === '[object Array]';
}

// WORKAROUND IE8: no Object.getPrototypeOf
function getPrototype(obj) {
	if (Object.getPrototypeOf) return Object.getPrototypeOf(obj);

	var result = obj.constructor ? obj.constructor.prototype : null;
	return result || null;
}
},{}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy9mcmFtZS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3F1aXhvdGUvc3JjL3F1aXhvdGUuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy9xdWl4b3RlL3NyYy91dGlsL2Vuc3VyZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIENvcHlyaWdodCAoYykgMjAxNCBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gRm9yIGxpY2Vuc2UsIHNlZSBcIlJFQURNRVwiIG9yIFwiTElDRU5TRVwiIGZpbGUuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIE1lID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBGcmFtZShkb21FbGVtZW50KSB7XG5cdHRoaXMuX2RvbUVsZW1lbnQgPSBkb21FbGVtZW50O1xuXHQvLyBUT0RPOiBmYWlsIGZhc3Rcbn07XG5cbk1lLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcblx0dmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xuXHRyZXR1cm4gbmV3IE1lKGVsZW1lbnQpO1xufTtcblxuTWUucHJvdG90eXBlLnRvRG9tRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy5fZG9tRWxlbWVudDtcbn07IiwiLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBGb3IgbGljZW5zZSwgc2VlIFwiUkVBRE1FXCIgb3IgXCJMSUNFTlNFXCIgZmlsZS5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZW5zdXJlID0gcmVxdWlyZShcIi4vdXRpbC9lbnN1cmUuanNcIik7XG52YXIgRnJhbWUgPSByZXF1aXJlKFwiLi9mcmFtZS5qc1wiKTtcblxuZXhwb3J0cy5jcmVhdGVGcmFtZSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gbmV3IEZyYW1lKCk7XG59OyIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gU2VlIExJQ0VOU0UuVFhUIGZvciBkZXRhaWxzLlxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vICoqKipcbi8vIFJ1bnRpbWUgYXNzZXJ0aW9ucyBmb3IgcHJvZHVjdGlvbiBjb2RlLiAoQ29udHJhc3QgdG8gYXNzZXJ0LmpzLCB3aGljaCBpcyBmb3IgdGVzdCBjb2RlLilcbi8vICoqKipcblxuZXhwb3J0cy50aGF0ID0gZnVuY3Rpb24odmFyaWFibGUsIG1lc3NhZ2UpIHtcblx0aWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCkgbWVzc2FnZSA9IFwiRXhwZWN0ZWQgY29uZGl0aW9uIHRvIGJlIHRydWVcIjtcblxuXHRpZiAodmFyaWFibGUgPT09IGZhbHNlKSB0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudGhhdCwgbWVzc2FnZSk7XG5cdGlmICh2YXJpYWJsZSAhPT0gdHJ1ZSkgdGhyb3cgbmV3IEVuc3VyZUV4Y2VwdGlvbihleHBvcnRzLnRoYXQsIFwiRXhwZWN0ZWQgY29uZGl0aW9uIHRvIGJlIHRydWUgb3IgZmFsc2VcIik7XG59O1xuXG5leHBvcnRzLnVucmVhY2hhYmxlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRpZiAoIW1lc3NhZ2UpIG1lc3NhZ2UgPSBcIlVucmVhY2hhYmxlIGNvZGUgZXhlY3V0ZWRcIjtcblxuXHR0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKGV4cG9ydHMudW5yZWFjaGFibGUsIG1lc3NhZ2UpO1xufTtcblxuZXhwb3J0cy5zaWduYXR1cmUgPSBmdW5jdGlvbihhcmdzLCBzaWduYXR1cmUpIHtcblx0c2lnbmF0dXJlID0gc2lnbmF0dXJlIHx8IFtdO1xuXHR2YXIgZXhwZWN0ZWRBcmdDb3VudCA9IHNpZ25hdHVyZS5sZW5ndGg7XG5cdHZhciBhY3R1YWxBcmdDb3VudCA9IGFyZ3MubGVuZ3RoO1xuXG5cdGlmIChhY3R1YWxBcmdDb3VudCA+IGV4cGVjdGVkQXJnQ291bnQpIHtcblx0XHR0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKFxuXHRcdFx0ZXhwb3J0cy5zaWduYXR1cmUsXG5cdFx0XHRcIkZ1bmN0aW9uIGNhbGxlZCB3aXRoIHRvbyBtYW55IGFyZ3VtZW50czogZXhwZWN0ZWQgXCIgKyBleHBlY3RlZEFyZ0NvdW50ICsgXCIgYnV0IGdvdCBcIiArIGFjdHVhbEFyZ0NvdW50XG5cdFx0KTtcblx0fVxuXG5cdHZhciB0eXBlLCBhcmcsIG5hbWU7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2lnbmF0dXJlLmxlbmd0aDsgaSsrKSB7XG5cdFx0dHlwZSA9IHNpZ25hdHVyZVtpXTtcblx0XHRhcmcgPSBhcmdzW2ldO1xuXHRcdG5hbWUgPSBcIkFyZ3VtZW50IFwiICsgaTtcblxuXHRcdGlmICghaXNBcnJheSh0eXBlKSkgdHlwZSA9IFsgdHlwZSBdO1xuXG5cdFx0aWYgKCF0eXBlTWF0Y2hlcyh0eXBlLCBhcmcsIG5hbWUpKSB7XG5cdFx0XHR0aHJvdyBuZXcgRW5zdXJlRXhjZXB0aW9uKFxuXHRcdFx0XHRleHBvcnRzLnNpZ25hdHVyZSxcblx0XHRcdFx0bmFtZSArIFwiIGV4cGVjdGVkIFwiICsgZXhwbGFpblR5cGUodHlwZSkgKyBcIiwgYnV0IHdhcyBcIiArIGV4cGxhaW5BcmcoYXJnKVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cbn07XG5cbmZ1bmN0aW9uIHR5cGVNYXRjaGVzKHR5cGUsIGFyZykge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAob25lVHlwZU1hdGNoZXModHlwZVtpXSwgYXJnKSkgcmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xuXG5cdGZ1bmN0aW9uIG9uZVR5cGVNYXRjaGVzKHR5cGUsIGFyZykge1xuXHRcdHN3aXRjaCAoZ2V0VHlwZShhcmcpKSB7XG5cdFx0XHRjYXNlIFwiYm9vbGVhblwiOiByZXR1cm4gdHlwZSA9PT0gQm9vbGVhbjtcblx0XHRcdGNhc2UgXCJzdHJpbmdcIjogcmV0dXJuIHR5cGUgPT09IFN0cmluZztcblx0XHRcdGNhc2UgXCJudW1iZXJcIjogcmV0dXJuIHR5cGUgPT09IE51bWJlcjtcblx0XHRcdGNhc2UgXCJhcnJheVwiOiByZXR1cm4gdHlwZSA9PT0gQXJyYXk7XG5cdFx0XHRjYXNlIFwiZnVuY3Rpb25cIjogcmV0dXJuIHR5cGUgPT09IEZ1bmN0aW9uO1xuXHRcdFx0Y2FzZSBcIm9iamVjdFwiOiByZXR1cm4gYXJnIGluc3RhbmNlb2YgdHlwZTtcblx0XHRcdGNhc2UgXCJ1bmRlZmluZWRcIjogcmV0dXJuIHR5cGUgPT09IHVuZGVmaW5lZDtcblx0XHRcdGNhc2UgXCJudWxsXCI6IHJldHVybiB0eXBlID09PSBudWxsO1xuXHRcdFx0Y2FzZSBcIk5hTlwiOiByZXR1cm4gaXNOYU4odHlwZSk7XG5cblx0XHRcdGRlZmF1bHQ6IGV4cG9ydHMudW5yZWFjaGFibGUoKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZXhwbGFpblR5cGUodHlwZSkge1xuXHR2YXIgam9pbmVyID0gXCJcIjtcblx0dmFyIHJlc3VsdCA9IFwiXCI7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGg7IGkrKykge1xuXHRcdHJlc3VsdCArPSBqb2luZXIgKyBleHBsYWluT25lVHlwZSh0eXBlW2ldKTtcblx0XHRqb2luZXIgPSAoaSA9PT0gdHlwZS5sZW5ndGggLSAyKSA/IFwiLCBvciBcIiA6IFwiLCBcIjtcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xuXG5cdGZ1bmN0aW9uIGV4cGxhaW5PbmVUeXBlKHR5cGUpIHtcblx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdGNhc2UgQm9vbGVhbjogcmV0dXJuIFwiYm9vbGVhblwiO1xuXHRcdFx0Y2FzZSBTdHJpbmc6IHJldHVybiBcInN0cmluZ1wiO1xuXHRcdFx0Y2FzZSBOdW1iZXI6IHJldHVybiBcIm51bWJlclwiO1xuXHRcdFx0Y2FzZSBBcnJheTogcmV0dXJuIFwiYXJyYXlcIjtcblx0XHRcdGNhc2UgRnVuY3Rpb246IHJldHVybiBcImZ1bmN0aW9uXCI7XG5cdFx0XHRjYXNlIG51bGw6IHJldHVybiBcIm51bGxcIjtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJudW1iZXJcIiAmJiBpc05hTih0eXBlKSkgcmV0dXJuIFwiTmFOXCI7XG5cdFx0XHRcdGVsc2UgcmV0dXJuIGZ1bmN0aW9uTmFtZSh0eXBlKSArIFwiIGluc3RhbmNlXCI7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGV4cGxhaW5BcmcoYXJnKSB7XG5cdHZhciB0eXBlID0gZ2V0VHlwZShhcmcpO1xuXHRpZiAodHlwZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIHR5cGU7XG5cblx0dmFyIHByb3RvdHlwZSA9IGdldFByb3RvdHlwZShhcmcpO1xuXHRpZiAocHJvdG90eXBlID09PSBudWxsKSByZXR1cm4gXCJhbiBvYmplY3Qgd2l0aG91dCBhIHByb3RvdHlwZVwiO1xuXHRlbHNlIHJldHVybiBmdW5jdGlvbk5hbWUocHJvdG90eXBlLmNvbnN0cnVjdG9yKSArIFwiIGluc3RhbmNlXCI7XG59XG5cbmZ1bmN0aW9uIGdldFR5cGUodmFyaWFibGUpIHtcblx0dmFyIHR5cGUgPSB0eXBlb2YgdmFyaWFibGU7XG5cdGlmICh2YXJpYWJsZSA9PT0gbnVsbCkgdHlwZSA9IFwibnVsbFwiO1xuXHRpZiAoaXNBcnJheSh2YXJpYWJsZSkpIHR5cGUgPSBcImFycmF5XCI7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiICYmIGlzTmFOKHZhcmlhYmxlKSkgdHlwZSA9IFwiTmFOXCI7XG5cdHJldHVybiB0eXBlO1xufVxuXG5cbi8qKioqKi9cblxudmFyIEVuc3VyZUV4Y2VwdGlvbiA9IGV4cG9ydHMuRW5zdXJlRXhjZXB0aW9uID0gZnVuY3Rpb24oZm5Ub1JlbW92ZUZyb21TdGFja1RyYWNlLCBtZXNzYWdlKSB7XG5cdGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgZm5Ub1JlbW92ZUZyb21TdGFja1RyYWNlKTtcblx0ZWxzZSB0aGlzLnN0YWNrID0gKG5ldyBFcnJvcigpKS5zdGFjaztcblx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn07XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlID0gY3JlYXRlT2JqZWN0KEVycm9yLnByb3RvdHlwZSk7XG5FbnN1cmVFeGNlcHRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW5zdXJlRXhjZXB0aW9uO1xuRW5zdXJlRXhjZXB0aW9uLnByb3RvdHlwZS5uYW1lID0gXCJFbnN1cmVFeGNlcHRpb25cIjtcblxuXG4vKioqKiovXG5cbi8vIFdPUktBUk9VTkQgSUU4OiBubyBPYmplY3QuY3JlYXRlKClcbmZ1bmN0aW9uIGNyZWF0ZU9iamVjdChwcm90b3R5cGUpIHtcblx0aWYgKE9iamVjdC5jcmVhdGUpIHJldHVybiBPYmplY3QuY3JlYXRlKHByb3RvdHlwZSk7XG5cblx0dmFyIFRlbXAgPSBmdW5jdGlvbiBUZW1wKCkge307XG5cdFRlbXAucHJvdG90eXBlID0gcHJvdG90eXBlO1xuXHRyZXR1cm4gbmV3IFRlbXAoKTtcbn1cblxuLy8gV09SS0FST1VORCBJRTggSUU5IElFMTAgSUUxMTogbm8gZnVuY3Rpb24ubmFtZVxuZnVuY3Rpb24gZnVuY3Rpb25OYW1lKGZuKSB7XG5cdGlmIChmbi5uYW1lKSByZXR1cm4gZm4ubmFtZTtcblxuXHQvLyBUaGlzIHdvcmthcm91bmQgaXMgYmFzZWQgb24gY29kZSBieSBKYXNvbiBCdW50aW5nIGV0IGFsLCBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zMzI0Mjlcblx0dmFyIGZ1bmNOYW1lUmVnZXggPSAvZnVuY3Rpb25cXHMrKC57MSx9KVxccypcXCgvO1xuXHR2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XG5cdHJldHVybiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpID8gcmVzdWx0c1sxXSA6IFwiPGFub24+XCI7XG59XG5cbi8vIFdPUktBUk9VTkQgSUU4OiBubyBBcnJheS5pc0FycmF5XG5mdW5jdGlvbiBpc0FycmF5KHRoaW5nKSB7XG5cdGlmIChBcnJheS5pc0FycmF5KSByZXR1cm4gQXJyYXkuaXNBcnJheSh0aGluZyk7XG5cblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0aGluZykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8vIFdPUktBUk9VTkQgSUU4OiBubyBPYmplY3QuZ2V0UHJvdG90eXBlT2ZcbmZ1bmN0aW9uIGdldFByb3RvdHlwZShvYmopIHtcblx0aWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZikgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopO1xuXG5cdHZhciByZXN1bHQgPSBvYmouY29uc3RydWN0b3IgPyBvYmouY29uc3RydWN0b3IucHJvdG90eXBlIDogbnVsbDtcblx0cmV0dXJuIHJlc3VsdCB8fCBudWxsO1xufSJdfQ==

// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var INDENT_TEXT = "  ";

exports.renderDiff = function(expected, actual) {
	return renderDiffWithIndent("", expected, actual);
};

function renderDiffWithIndent(indent, expected, actual) {
	if (exports.match(expected, actual)) return "";

	if (isArray(expected) && isArray(actual)) return arrayRenderDiff(indent, expected, actual);
	if (isObject(actual) && isObject(expected)) return objectRenderDiff(indent, expected, actual);
	else return flatRenderDiff(expected, actual);
}

function flatRenderDiff(expected, actual) {
	var renderedActual = flatRender(actual);
	var renderedExpected = flatRender(expected);

	if (isFunction(expected) && isFunction(actual) && renderedActual === renderedExpected) {
		renderedExpected = "different " + renderedExpected;
	}

	return renderedActual + "   // expected " + renderedExpected;
}

function arrayRenderDiff(indent, expected, actual) {
	return "[" + renderPropertiesDiff(indent, expected, actual, true) + "\n" + indent + "]";
}

function objectRenderDiff(indent, expected, actual) {
	return "{" + renderPropertiesDiff(indent, expected, actual, false) + "\n" + indent + "}";
}

function renderPropertiesDiff(oldIndent, expected, actual, ignoreLengthProperty) {
	var indent = oldIndent + INDENT_TEXT;

	var unionKeys = [];
	var extraKeys = [];
	var missingKeys = [];

	analyzeKeys();
	return incorrectProperties() + missingProperties() + extraProperties() + mismatchedPrototype();

	function analyzeKeys() {
		var expectedKeys = Object.getOwnPropertyNames(expected);
		var actualKeys = Object.getOwnPropertyNames(actual);

		expectedKeys.forEach(function(key) {
			if (actual.hasOwnProperty(key)) unionKeys.push(key);
			else missingKeys.push(key);
		});
		extraKeys = actualKeys.filter(function(key) {
			return (!expected.hasOwnProperty(key));
		});
	}

	function incorrectProperties() {
		return unionKeys.reduce(function(accumulated, key) {
			if (ignoreLengthProperty && key === "length") return accumulated;

			var diff = renderDiffWithIndent(indent, expected[key], actual[key]);
			if (!diff) return accumulated;

			return accumulated + "\n" + indent + key + ": " + diff;
		}, "");
	}

	function missingProperties() {
		return propertyBlock(expected, missingKeys, "missing properties");
	}

	function extraProperties() {
		return propertyBlock(actual, extraKeys, "extra properties");
	}

	function propertyBlock(obj, keys, title) {
		if (keys.length === 0) return "";
		return "\n" + indent + "// " + title + ":" + renderProperties(oldIndent, obj, keys, false, true);
	}

	function mismatchedPrototype() {
		var expectedProto = Object.getPrototypeOf(expected);
		var actualProto = Object.getPrototypeOf(actual);

		if (expectedProto !== actualProto) return "\n" + indent + "// objects have different prototypes";
		else return "";
	}

}

exports.render = function(obj) {
	return renderWithIndent("", obj, false);
};

function renderWithIndent(indent, obj, collapseObjects) {
	if (collapseObjects) return flatRender(obj);
	else if (isArray(obj)) return arrayRender(indent, obj);
	else if (isObject(obj)) return objectRender(indent, obj);
	else return flatRender(obj);
}

function flatRender(obj) {
	if (obj === undefined) return "undefined";
	if (obj === null) return "null";
	if (typeof obj === "string") {
		var str = JSON.stringify(obj);
		if (str.length > 61) str = str.substr(0, 60) + '"...';    // >61, not >60, because of trailing quote
		return str;
	}
	if (isArray(obj)) {
		if (obj.length === 0) return "[]";
		return "[...]";
	}
	if (isObject(obj)) {
		if (Object.getOwnPropertyNames(obj).length === 0) return "{}";
		else return "{...}";
	}
	if (isFunction(obj)) {
		if (!obj.name) return "<anon>()";
		else return obj.name + "()";
	}

	return obj.toString();
}

function arrayRender(indent, obj) {
	if (obj.length === 0) return "[]";

	var properties = renderProperties(indent, obj, Object.getOwnPropertyNames(obj), true, false);
	return "[" + properties + "\n" + indent + "]";
}

function objectRender(indent, obj) {
	if (Object.getOwnPropertyNames(obj).length === 0) return "{}";

	var properties = renderProperties(indent, obj, Object.getOwnPropertyNames(obj), false, false);
	return "{" + properties + "\n" + indent + "}";
}

function renderProperties(indent, obj, keys, ignoreLengthProperty, collapseObjects) {
	var newIndent = indent + INDENT_TEXT;
	var properties = keys.reduce(function(accumulated, key) {
		if (ignoreLengthProperty && key === "length") return accumulated;
		return accumulated + "\n" + newIndent + key + ": " + renderWithIndent(newIndent, obj[key], collapseObjects);
	}, "");
	return properties;
}

exports.match = function(a, b) {
	if (typeof a === "object" && typeof b === "object") return objectAndArrayMatch(a, b);
	else return flatMatch(a, b);
};

function flatMatch(a, b) {
	if (typeof a === "number" && isNaN(a)) return isNaN(b);

	return a === b;
}

function objectAndArrayMatch(a, b) {
	if (a === b) return true;
	if (a === null) return b === null;
	if (b === null) return a === null;

	if (!exports.match(Object.getPrototypeOf(a), Object.getPrototypeOf(b))) return false;

	var aKeys = Object.getOwnPropertyNames(a);
	var bKeys = Object.getOwnPropertyNames(b);
	if (aKeys.length !== bKeys.length) return false;

	return aKeys.every(function(key) {
		return exports.match(a[key], b[key]);
	});
}

function isArray(obj) {
	return Array.isArray(obj);
}

function isObject(obj) {
	return typeof obj === "object" && obj !== null && !isArray(obj);
}

function isFunction(obj) {
	return typeof obj === "function";
}

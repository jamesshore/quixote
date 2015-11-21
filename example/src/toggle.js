// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.

// A simple JavaScript library to toggle the visibility of an element. It's tested by `_toggle_test.js`.
// There's nothing related to Quixote in this file.


(function() {
	"use strict";

	exports.init = function init(clickMe, element, className) {
		clickMe.addEventListener("click", function() {
			element.classList.toggle(className);
		});
	};

}());
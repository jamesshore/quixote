// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	exports.init = function init(clickMe, element, className) {
		clickMe.addEventListener("click", function() {
			element.classList.toggle(className);
		});
	};

}());
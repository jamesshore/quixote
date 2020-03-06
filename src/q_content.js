// Copyright (c) 2014-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
"use strict";

var ensure = require("./util/ensure.js");

var Me = module.exports = function QContent(contentDocument) {
	// Cannot check against HTMLDocument directly because most browsers define HTMLDocument on the Window type
	// Since the document is in an iFrame its HTMLDocument definition is the iFrame window's HTMLDocument and
	// not the top level window's version.
	ensure.signature(arguments, [ Object ]);

	// properties
    this.document = contentDocument;
    this.window = contentDocument.defaultView || contentDocument.parentWindow;
};

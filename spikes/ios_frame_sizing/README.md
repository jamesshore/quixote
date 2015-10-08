These files demonstrate how Mobile Safari sizes an iframe.

To use, serve the files from a web server (I like npm's `http-server` for simplicity and convenience), then
visit index.html in Mobile Safari or any other browser.

On Mobile Safari, observe:
* The frame ignores the `height` and `width` attributes.
* The red full-width element extends all the way to the scroll-creator box. On a desktop browser, the full-width element only extends the width of the viewport.
* The blue `@media successful` box does not appear. (It's styled to appear when the width of the viewport is <= 1000px.)

Now load inner.html in Mobile Safari. Observe that the page behaves similarly to a desktop browser:
* The red full-width element does *not* extend the entire with of the page. It only extends the width of the viewport (980px on iOS, unless otherwise configured with a `<meta viewport>` tag).
* The blue `@media successful` box *does* appear.

Now comment out the "scroll creator" line in inner.html. Load inner.html (to flush the cache) and then index.html. On index.html, observe that the page matches the iframe's width and height.
* The frame obeys the `width` and `height` attributes on Mobile Safari.
* The red full-width element is only 400px wide
* The blue `@media successful` box does appear.


CONCLUSION:

Mobile Safari sizes a frame to the frame size attributes *or* the actual page size, whichever is *larger*.

This is in contrast to a desktop browser, which always sizes a frame its attributes, regardless of the page size.
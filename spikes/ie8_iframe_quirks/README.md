These files demonstrate an issue with iframes when IE 8 is in "quirks" mode.

To use, serve the files from a web server (I like npm's `http-server` for simplicity and convenience), then
visit index.html in IE 8 or any other browser.

Observe:
* The red 'full width' element does not extend the entire width of the frame in IE 8.

Then uncomment the DOCTYPE at the top of inner.html. This turns off "quirks" mode.

Observe:
* The red 'full width' element now extends the entire width of the frame.
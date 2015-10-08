These files demonstrate how Mobile Safari sizes an iframe.

To use, serve the files from a web server (I like npm's `http-server` for simplicity and convenience), then
visit index.html in Mobile Safari or any other browser.

On Mobile Safari, observe:
* The top frame, which extends past the edge of the window, has larger text than the bottom frame, which doesn't.


CONCLUSION:

Mobile Safari will increase the size of text in a frame when the frame extends past the iPhone edge. This behavior can be changed by setting `-webkit-text-size-adjust: 100%` in CSS. Using `-webkit-text-size-adjust: none` will also work, but there are reports that it prevents the text size from being changed in some browsers.  

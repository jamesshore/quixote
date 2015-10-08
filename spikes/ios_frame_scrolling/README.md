These files demonstrate how to make an iframe scrollable on Mobile Safari.

To use, serve the files from a web server (I like npm's `http-server` for simplicity and convenience), then
visit index.html in Mobile Safari or any other browser.

Observe:
* The frame has scroll bars. This is not the default for Mobile Safari. (Thanks to David Walsh, http://davidwalsh.name/scroll-iframes-ios, for this part of the solution.)
* Clicking the button scrolls the frame. This requires special code on Mobile Safari.

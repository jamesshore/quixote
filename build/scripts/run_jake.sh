# This is a script fragment, meant to be used from another script.
# It assumes it's running from the project's root directory.

# Runs Jake from node_modules directory, preventing it from needing to be installed globally
# Also ensures node modules have been installed

[ ! -f node_modules/.bin/jake ] && npm install
node_modules/.bin/jake $*
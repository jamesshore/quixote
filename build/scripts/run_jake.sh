# Runs Jake from node_modules directory, preventing it from needing to be installed globally
# Also ensures node modules have been installed

[ ! -f node_modules/.bin/jake ] && echo "Installing NPM modules:" && npm install
node_modules/.bin/jake $*
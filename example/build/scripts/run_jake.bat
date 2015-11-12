@echo off
REM Runs Jake from node_modules directory, preventing it from needing to be installed globally
REM Also ensures node modules have been installed

if not exist node_modules\.bin\jake.cmd call npm install
node_modules\.bin\jake %*
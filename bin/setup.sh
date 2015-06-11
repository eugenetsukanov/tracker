#!/bin/sh

echo "> Install npm packages"
echo ""

npm install

echo "> Install bower packages"
echo ""
bower install --config.interactive=false --allow-root

echo "> Checking server/config/environment/parameters.js"
echo ""
ls server/config/environment | grep parameters.js > /dev/null || echo "[FAIL] You did not setup 'server/config/environment/parameters.js'"


#!/bin/sh

(ls | grep chromedriver ) || (wget http://chromedriver.storage.googleapis.com/2.25/chromedriver_mac64.zip && unzip chromedriver_mac64.zip && rm chromedriver_mac64.zip)

bin/selenium.sh

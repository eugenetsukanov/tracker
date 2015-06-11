#!/bin/sh

ls | grep chromedriver || wget http://chromedriver.storage.googleapis.com/2.12/chromedriver_mac32.zip && unzip chromedriver_mac32.zip && rm chromedriver_mac32.zip

bin/selenium.sh

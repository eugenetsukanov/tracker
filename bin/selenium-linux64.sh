#!/bin/sh

ls | grep chromedriver || wget http://chromedriver.storage.googleapis.com/2.16/chromedriver_linux64.zip && unzip chromedriver_linux64.zip && rm chromedriver_linux64.zip

bin/selenium.sh

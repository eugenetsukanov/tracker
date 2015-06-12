#!/bin/sh

ls | grep selenium-server-standalone-2.42.2.jar || wget http://selenium-release.storage.googleapis.com/2.42/selenium-server-standalone-2.42.2.jar
java -jar selenium-server-standalone-2.42.2.jar

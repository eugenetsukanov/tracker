#!/bin/sh

ls | grep selenium-server-standalone-2.46.0.jar || wget http://selenium-release.storage.googleapis.com/2.46/selenium-server-standalone-2.46.0.jar
java -jar selenium-server-standalone-2.46.0.jar

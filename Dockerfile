FROM ubuntu:precise

RUN mkdir /project
WORKDIR /project

RUN apt-get update
RUN apt-get install -y build-essential git curl

# node.js
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs

# npm packages
RUN npm install -g bower forever nodemon gulp-cli
RUN npm install -g concurrently plus.shell

RUN apt-get install iputils-ping -y
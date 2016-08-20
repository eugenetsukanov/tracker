FROM ubuntu:precise

RUN mkdir /project
WORKDIR /project

RUN apt-get update
RUN apt-get install -y build-essential git

# node.js
RUN add-apt-repository -y ppa:chris-lea/node.js
RUN apt-get update -y
RUN apt-get -y install nodejs

# npm packages

RUN npm install -g bower
RUN npm install -g forever
RUN npm install -g pm2
RUN npm install -g nodemon

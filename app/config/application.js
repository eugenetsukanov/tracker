var Application = require('plus.application');

var application = new Application({
    dir: __dirname,
    env: process.env.NODE_ENV || 'dev'
});

module.exports = application;
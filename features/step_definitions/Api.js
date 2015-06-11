module.exports = function () {

  require('cucumber.usesteps').share(this);

  var async = require('async');

  function sendPost(url, string, callback) {
    if (!string.trim()) return callback('Request should not be empty');

    this.request = JSON.parse(string);
    this.response = null;

    this.apiResponse = null;

    this.apiTester
      .post(url)
      .send(this.request)
      .set('Content-Type', this.apiContentType)
      .set('Cookie', this.apiCookie)
      .end(handleResponse.call(this, callback));
  }


  function handleResponse(callback) {
    return function (err, res) {
      if (err) throw err;
      this.apiResponse = res;
      this.apiCookie = res.header['set-cookie'] ? res.header['set-cookie'] : null;
      this.response = res.body;
      callback();
    }.bind(this);
  }

  this.Given(/^Endpoint "([^"]*)"$/, function (arg1, callback) {
    this.apiEndpoint = arg1;
    callback();
  });

  this.When(/^I send post:$/, function (string, callback) {
    sendPost.call(this, this.apiEndpoint, string, callback);
  });

  this.When(/^I send post (\d+) times:$/, function (times, string, callback) {
    var counter = parseInt(times);
      async.whilst(function () {
        return counter--
      }, function (next) {
        sendPost.call(this, this.apiEndpoint, string, next);
      }.bind(this), callback)
  });

  this.When(/^I post to "([^"]*)" (\d+) times:$/, function (url, times, string, callback) {

    var counter = parseInt(times);
    async.whilst(function () {
      return counter--
    }, function (next) {
      sendPost.call(this, url, string, next);
    }.bind(this), callback);

  });



  this.Then(/^I see response:$/, function (string, callback) {

    var expected = JSON.parse(string);
    var should = require('should');

    try {
      for (var i in expected) {
        should(expected).have.property(i, this.response[i]);
      }
      callback();
    } catch (e) {
      callback(e.message);
    }

  });

  this.Then(/^I see status (\d+)$/, function (arg1, callback) {
    var eq = this.apiResponse.status == arg1;
    var result = eq ? null : 'Expected status ' + arg1 + '; got ' + this.apiResponse.status;
    callback(result);
  });

  this.Then(/^I debug response$/, function (callback) {
    console.log(this.apiResponse);
    console.log(this.response);
    callback();
  });


  this.When(/^I get "([^"]*)"$/, function (arg1, callback) {

    this.apiTester
      .get(arg1)
      .set('Content-Type', this.apiContentType)
      .set('Cookie', this.apiCookie)
      .end(handleResponse.call(this, callback));

  });

  this.When(/^I post to "([^"]*)":$/, function (arg1, string, callback) {
    sendPost.call(this, arg1, string, callback);
  });


}

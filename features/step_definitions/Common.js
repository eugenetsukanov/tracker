module.exports = function () {

  this.Given(/^Wait timeout (\d+)$/, function (arg1, callback) {
    this.waitTimeout = parseInt(arg1);
    callback();
  });

  this.Given(/^stop$/, function (arg1, callback) {
    setTimeout(callback, 60*60*1000);
  });

  this.Then(/^I sleep (\d+)$/, function (arg1, callback) {
    setTimeout(callback, parseInt(arg1) * 1000);
  });


}

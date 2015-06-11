module.exports = function () {


  this.Before(function (next) {
    if (this.driver) {
      this.driver.manage().window().setSize(1000, 520).then(function () {
        this.prepare(next);
      }.bind(this));
    }
    else {
      this.prepare(next);
    }
  });

  this.After(function (next) {
    if (this.driver) {
      this.driver.quit();
    }
    next();
  });
}

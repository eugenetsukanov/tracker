module.exports = function () {

    this.Given(/^Home page$/, function (callback) {
        this.iVisit('/', callback);
    });

    this.Then(/^I see sign in form$/, function (callback) {
        this.iSee('form[ng-submit="login()"]', callback);
    });

    this.When(/^I type username "([^"]*)"$/, function (arg1, callback) {
        this.iType('input[ng-model="userName"]', arg1, callback);
    });

    this.When(/^I type password "([^"]*)"$/, function (arg1, callback) {
        this.iType('input[ng-model="userPassword"]', arg1, callback);
    });

    this.When(/^click on log in button$/, function (callback) {
        this.iClick('button:contains("Login")', callback)
    });

    this.Then(/^I see task board/, function (callback) {
        this.iSee(".board-view", callback);
    });

    this.Then(/^I don't see username "([^"]*)"$/, function (arg1, callback) {
        this.iDontSee('.nav span:contains("' + arg1 + '")', callback);
    });

    this.Then(/^I see username "([^"]*)"$/, function (arg1, callback) {
        this.iSee('.nav span:contains("' + arg1 + '")', callback);
    });


}
module.exports = function () {

    this.Given(/^Home page$/, function (callback) {
        this.iVisit('/', callback);
    });

    this.Then(/^I see sign in form$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
    });

    this.When(/^I type username "([^"]*)"$/, function (arg1, callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
    });

    this.When(/^I type password "([^"]*)"$/, function (arg1, callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
    });

    this.When(/^click on log in button$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
    });

    this.Then(/^I see task list$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
    });

}
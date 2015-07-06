module.exports = function () {

    this.Then(/^I click my profile link$/, function (callback) {
        this.iClick('a[ui-sref="app.profile"]', callback);
    });

    this.Then(/^I see my profile form$/, function (callback) {
        this.iSee('.profile form input[ng-model="user.first"]', callback);
    });

    this.Then(/^I see first name "([^"]*)" in form$/, function (arg1, callback) {
        this.iSeeValue('.profile form input[ng-model="user.first"]', arg1, callback);
    });

    this.Then(/^I see last name "([^"]*)" in form$/, function (arg1, callback) {
        this.iSeeValue('.profile form input[ng-model="user.last"]', arg1, callback);
    });

    this.Then(/^I see email "([^"]*)" in form$/, function (arg1, callback) {
        this.iSeeValue('.profile form input[ng-model="user.email"]', arg1, callback);
    });

    this.Then(/^I type first name "([^"]*)" in form$/, function (arg1, callback) {
        this.iType('.profile form input[ng-model="user.first"]', arg1, callback);
    });

    this.Then(/^I type last name "([^"]*)" in form$/, function (arg1, callback) {
        this.iType('.profile form input[ng-model="user.last"]', arg1, callback);
    });

    this.Then(/^I type email "([^"]*)" in form$/, function (arg1, callback) {
        this.iType('.profile form input[ng-model="user.email"]', arg1, callback);
    });

    this.Then(/^I save my profile form$/, function (callback) {
        this.iClick('form[ng-submit="save()"] button:contains("Save")', callback);
    });

    this.Then(/^I reload page$/, function (callback) {
        this.iReload(callback);
    });


};

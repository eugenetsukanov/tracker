module.exports = function () {

    this.Then(/^I click register button in navbar$/, function (callback) {
        this.chain
            .iSee('.navbar.navbar-default a[ui-sref="app.register"]')
            .iClick('.navbar.navbar-default a[ui-sref="app.register"]')
            .then(callback);
    });

    this.Then(/^I see registration form$/, function (callback) {
        this.iSee('form[ng-submit="register()"]', callback);
    });

    this.When(/^I type email "([^"]*)"$/, function (arg1, callback) {
        this.chain
            .iSee('form[ng-submit="register()"] input[ng-model="email"]')
            .iType('form[ng-submit="register()"] input[ng-model="email"]', arg1)
            .then(callback);
    });

    this.When(/^click on register button$/, function (callback) {
        this.chain
            .iSee('.navbar.navbar-default button[type="submit"]')
            .iClick('.navbar.navbar-default button[type="submit"]')
            .then(callback);
    });

    this.When(/^I type username "([^"]*)" in reg form$/, function (arg1, callback) {
        this.chain
            .iSee('form[ng-submit="register()"] input[ng-model="username"]')
            .iType('form[ng-submit="register()"] input[ng-model="username"]', arg1)
            .then(callback);
    });

    this.When(/^I type password "([^"]*)" in reg form$/, function (arg1, callback) {
        this.chain
            .iSee('form[ng-submit="register()"] input[ng-model="password"]')
            .iType('form[ng-submit="register()"] input[ng-model="password"]', arg1)
            .then(callback);
    });

    this.When(/^I click on register button$/, function (callback) {
        this.chain
            .iSee('form[ng-submit="register()"] button[type="submit"]')
            .iClick('form[ng-submit="register()"] button[type="submit"]')
            .then(callback);
    });

    this.Then(/^I see notification "([^"]*)"$/, function (arg1, callback) {
        this.iSee('.toaster-popup .toast-title', callback);
    });


};

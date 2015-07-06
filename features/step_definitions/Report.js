module.exports = function () {

    this.When(/^I click on "([^"]*)" button in navbar$/, function (arg1, callback) {
        this.iClick("nav .nav a:contains('" + arg1 + "')", callback);
    });

    this.When(/^I see "([^"]*)" in Done tasks$/, function (arg1, callback) {
        this.iSee('div li[ng-repeat*="accepted"]:contains("'+arg1+'")', callback)
    });

    this.When(/^I see "([^"]*)" in In Progress tasks$/, function (arg1, callback) {
        this.iSee('div li[ng-repeat*="in progress"]:contains("'+arg1+'")', callback)
    });

    this.When(/^I see "([^"]*)" in Plans tasks$/, function (arg1, callback) {
        this.iSee('div li[ng-repeat*="\'\'"]:contains("'+arg1+'")', callback);
    });


    this.Then(/^I share this task on user "([^"]*)"$/, function (arg1, callback) {
        this.chain
            .iClick("div.ui-select-multiple[ng-model='task.team']")
            .iClick('form div a span:contains("' +arg1+ '")')
            .then(callback);
    });


    this.Then(/^I assign it to user "([^"]*)"$/, function (arg1, callback) {
        this.chain
            .iClick("form select[ng-model='task.developer']")
            .iClick('form select[ng-model="task.developer"] option:contains("'+arg1+'")')
            .then(callback);
    });

    this.When(/^I click Report button in task menu$/, function (callback) {
        this.iClick("div.container div.pull-right a:contains(Report)", callback);
    });

    this.Then(/^I see "([^"]*)" in assigned users$/, function (arg1, callback) {
        this.iSee('select[ng-model="developer"]:contains("'+arg1+'")', callback);
    });

    this.When(/^I choose user "([^"]*)"$/, function (arg1, callback) {
        this.chain
            .iClick('select[ng-model="developer"]')
            .iClick('select[ng-model="developer"] option:contains("'+arg1+'")')
            .then(callback);
    });

    this.Then(/^I don't see "([^"]*)" in Plans tasks$/, function (arg1, callback) {
        this.iDontSee('div li[ng-repeat*="\'\'"]:contains("'+arg1+'")', callback);
    });

    this.Then(/^I don't see "([^"]*)" in Done tasks$/, function (arg1, callback) {
        this.iDontSee('div li[ng-repeat*="accepted"]:contains("'+arg1+'")', callback);
    });

    this.When(/^I don't see "([^"]*)" in In Progress tasks$/, function (arg1, callback) {
        this.iDontSee('div li[ng-repeat*="in progress"]:contains("'+arg1+'")', callback);
    });
    //
    //this.When(/^I don't see "([^"]*)" in Plans tasks$/, function (arg1, callback) {
    //    this.iDontSee('div li[ng-repeat*="\'\'"]:contains("'+arg1+'")', callback);
    //});

    this.Then(/^I click back to project "([^"]*)"$/, function (arg1, callback) {
        this.iClick('div a:contains("' +arg1+ '")', callback);
    });



};
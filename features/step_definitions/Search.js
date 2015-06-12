module.exports = function () {

    this.Then(/^I see task "([^"]*)"$/, function (arg1, callback) {
        this.iSee(".board-view a:contains('" + arg1 + "')", callback);
    });


    this.Then(/^I click on task link "([^"]*)"$/, function (arg1, callback) {
        this.iClick(".board-view a:contains('" + arg1 + "')", callback)
    });

    this.Then(/^I see search form$/, function (callback) {
        this.iSee(".nav input[ng-model='search'", callback);
    });

    this.When(/^I type query "([^"]*)"$/, function (arg1, callback) {
        this.iType(".nav input[ng-model='search'", arg1, callback);
    });

    this.Then(/^I don't see task "([^"]*)"$/, function (arg1, callback) {
        this.iDontSee(".board-view a:contains('" + arg1 + "')", callback)
    });


    this.Then(/^I am on "([^"]*)" page$/, function (arg1, callback) {
        this.iSee("h2:contains('" + arg1 + "')", callback)
    });

};
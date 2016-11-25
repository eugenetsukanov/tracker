module.exports = function () {

    this.When(/^I click on link "([^"]*)"$/, function (arg1, callback) {
        this.iClick("a[ng-click='toggleTaskHistory()']:contains('" + arg1 + "')", callback);
    });

    this.Then(/^I see comment message input$/, function (callback) {
        this.iSee("form textarea[ng-model='comment.text']", callback);
    });

    this.Then(/^I see history message "([^"]*)"$/, function (arg1, callback) {
        this.iSee("p.history-message:contains('" + arg1 + "')", callback);
    });

    this.Then(/^I type description "([^"]*)"$/, function (arg1, callback) {
        this.iType("form textarea[ng-model='task.description']", arg1, callback);
    });

    this.Then(/^I type comment "([^"]*)"$/, function (arg1, callback) {
        this.iType("form textarea[ng-model='comment.text']", arg1, callback);
    });

    this.Then(/^I see task "([^"]*)" comments number "([^"]*)"$/, function (arg1, arg2, callback) {
        this.chain
            .iSee('h2:contains("' + arg1 + '")')
            .iSee(' ul.detail-line li span[uib-tooltip="Comments"]:contains("' + arg2 + '")')
            .then(callback);
    });

    this.Then(/^I click on "([^"]*)" filter  button$/, function (arg1, callback) {
        this.chain
            .iClick('div.board-buttons button:contains("' + arg1 + '")')
            .then(callback);
    });
};
module.exports = function () {

    this.Then(/^I see task title input$/, function (callback) {
        this.iSee("form input[ng-model='task.title']", callback);
    });

    this.When(/^I type task title "([^"]*)"$/, function (arg1, callback) {
        this.iType("form input[ng-model='task.title']", arg1, callback);
    });

    this.Then(/^I see task form$/, function (callback) {
        this.iSee("form input[ng-model='task.spenttime']", callback);
    });

    this.Then(/^I see task complexity buttons$/, function (callback) {
        this.iSee("form .btn-group label[ng-model='task.complexity']", callback);
    });

    this.Then(/^I click on task complexity "([^"]*)"$/, function (arg1, callback) {
        this.iClick("form .btn-group label[ng-model='task.complexity']:contains('" + arg1 + "')", callback);
    });

    this.Then(/^I click on save button$/, function (callback) {
        this.iClick("form button:contains('Save')", callback);
    });

    this.Then(/^I see task complexity "([^"]*)"$/, function (arg1, callback) {
        this.iSee("ul.task-metrics li[tooltip='Complexity / Points']:contains('" + arg1 + "')", callback);
    });


    this.Then(/^I click on task status "([^"]*)"$/, function (arg1, callback) {
        this.iClick("form div.btn-group label[ng-model='task.status']:contains('" + arg1 + "')", callback);
    });

    this.Then(/^I type task spent time "([^"]*)"$/, function (arg1, callback) {
        this.iType("form input[ng-model='task.spenttime']", arg1, callback);
    });


};
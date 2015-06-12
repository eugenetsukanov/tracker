module.exports = function () {

    this.Then(/^I see task "([^"]*)"$/, function (arg1, callback) {
        this.iSee(".board-view a:contains('" + arg1 + "')", callback);
    });


    this.Then(/^I click on task link "([^"]*)"$/, function (arg1, callback) {
        this.iClick(".board-view a:contains('" + arg1 + "')", callback)
    });

    this.Then(/^I see search form$/, function (callback) {
        this.iSee(".nav input[ng-model='search']", callback);
    });

    this.When(/^I search "([^"]*)"$/, function (arg1, callback) {
        this.iType(".nav input[ng-model='search']", arg1, callback);
    });

    this.Then(/^I don't see task "([^"]*)"$/, function (arg1, callback) {
        this.iDontSee(".board-view a:contains('" + arg1 + "')", callback)
    });


    this.Then(/^I am on "([^"]*)" page$/, function (arg1, callback) {
        this.iSee("h2:contains('" + arg1 + "')", callback)
    });

    this.When(/^I don't see search form$/, function (callback) {
        this.iDontSee(".nav input[ng-model='search']", callback);
    });

    this.Then(/^I click projects$/, function (callback) {
        this.iClick(".nav a:contains(Projects)", callback)

    });

    this.Then(/^I edit this task$/, function (callback) {
        this.chain
            .iClick('.task-info div[task-metrics]')
            .iSee('.modal-box div[task-editor]')
            .then(callback);
    });

    this.Then(/^I tag this task with "([^"]*)"$/, function (arg1, callback) {
        this.chain
            .iType('.modal-box .ui-select-container input:last', arg1)
            .iClick('.modal-box .ui-select-container a:contains("' +arg1+ '")')
            .then(callback);
    });

    this.Then(/^I save task$/, function (callback) {
        this.iClick('.modal-box button:contains(Save)', callback);
    });

    this.Then(/^I see task with tag "([^"]*)"$/, function (arg1, callback) {
        this.iSee(
            'a[ui-sref="app.tags-find({taskId: task._id, tags: tag})"]:contains("'+arg1+'")',
            callback
        );
    });

};
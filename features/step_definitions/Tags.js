module.exports = function () {

    this.Then(/^I see task tags input$/, function (callback) {
        this.iSee('form div.input-sm[ng-model="task.tags"]',
            callback);
    });

    this.Then(/^I tag task with "([^"]*)"$/, function (arg1, callback) {
        this.chain
            .iType('form input[placeholder="Add Tags..."]', arg1)
            .iClick('form div a span:contains("' +arg1+ '")')
            .then(callback);
    });

    this.Then(/^I click on task tag "([^"]*)"$/, function (arg1, callback) {
        this.iClick('div.board-view div.panel-body a.label:contains("' +arg1+ '")', callback);
    });
};
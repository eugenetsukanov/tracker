module.exports = function () {
    this.Then(/^I see estimated time "([^"]*)"$/, function (arg1, callback) {
        this.chain
            .iSee('ul li span[uib-tooltip="Estimated"]:contains("' + arg1 + '")')
            .then(callback);
    });

    this.Then(/^I see spent time "([^"]*)"$/, function (arg1, callback) {
        this.chain
            .iSee('ul li span[uib-tooltip="Spent"]:contains("' + arg1 + '")')
            .then(callback);
    });

    this.Then(/^I see time todo "([^"]*)"$/, function (arg1, callback) {
        this.chain
            .iSee('ul li span[uib-tooltip="TODO"]:contains("' + arg1 + '")')
            .then(callback);
    });
};
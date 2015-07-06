module.exports = function () {

    this.Then(/^I click my profile link$/, function (callback) {
        this.iClick('a[ui-sref="app.profile"]', callback);
    });

    this.Then(/^I see my profile form$/, function (callback) {
        this.iSee('.profile form.myprofile', callback);
    });

    this.Then(/^I see first name "([^"]*)" in form$/, function (arg1, callback) {
        this.iSeeValue('.profile form.myprofile input[ng-model="user.first"]', arg1, callback);
    });

    this.Then(/^I see last name "([^"]*)" in form$/, function (arg1, callback) {
        this.iSeeValue('.profile form.myprofile input[ng-model="user.last"]', arg1, callback);
    });

    this.Then(/^I see email "([^"]*)" in form$/, function (arg1, callback) {
        this.iSeeValue('.profile form.myprofile input[ng-model="user.email"]', arg1, callback);
    });

    this.Then(/^I type first name "([^"]*)" in form$/, function (arg1, callback) {
        this.iType('.profile form.myprofile input[ng-model="user.first"]', arg1, callback);
    });

    this.Then(/^I type last name "([^"]*)" in form$/, function (arg1, callback) {
        this.iType('.profile form.myprofile input[ng-model="user.last"]', arg1, callback);
    });

    this.Then(/^I type email "([^"]*)" in form$/, function (arg1, callback) {
        this.iType('.profile form.myprofile input[ng-model="user.email"]', arg1, callback);
    });

    this.Then(/^I save my profile form$/, function (callback) {
        this.iClick('form.myprofile button:contains("Save")', callback);
    });

    this.Then(/^I reload page$/, function (callback) {
        this.iReload(callback);
    });

    this.Then(/^I click Change Password link$/, function (callback) {
        this.iClick('form.myprofile a.change-password-btn', callback);
    });

    this.Then(/^I see change password form$/, function (callback) {
        this.iSee('.profile form.password', callback);
    });

    this.Then(/^I type "([^"]*)" in Old Password field$/, function (arg1, callback) {
        this.iType('.profile form.password input[ng-model="oldPassword"]', arg1, callback);
    });

    this.Then(/^I type "([^"]*)" in New Password field$/, function (arg1, callback) {
        this.iType('.profile form.password input[ng-model="newPassword"]', arg1, callback);
    });

    this.Then(/^I type "([^"]*)" in Confirm Password field$/, function (arg1, callback) {
        this.iType('.profile form.password input[ng-model="newPasswordConfirm"]', arg1, callback);
    });

    this.Then(/^I click Change button$/, function (callback) {
        this.iClick('.profile form.password button:contains("Change")', callback);
    });

    this.Then(/^I click Logout button$/, function (callback) {
        this.iClick('.navbar-default .navbar-nav>li>a:contains("Logout")', callback);
    });


};

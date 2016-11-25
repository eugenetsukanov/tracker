Feature: Profile

  Background:
    Given Home page

    Then I see sign in form
    When I type username "test"
    When I type password "test"
    And click on log in button
    And I see task board

  Scenario: Update Profile

    Then I sleep 1
    Then I click my profile link
    Then I see my profile form

    Then I see first name "Andy" in form
    And I see last name "Garcia" in form
    And I see email "mailtotesthere@gmail.com" in form

    Then I type first name "Antonio" in form
    And I type last name "Banderas" in form
    Then I type email "antonio_banderas@mail.com" in form

    Then I save my profile form
    Then I reload page

    Then I see first name "Antonio" in form
    And I see last name "Banderas" in form
    And I see email "antonio_banderas@mail.com" in form

  Scenario: Change Password

    Then I sleep 1
    Then I click my profile link
    Then I see my profile form

    Then I click Change Password link
    Then I see change password form

    Then I type "test" in Old Password field
    Then I type "111" in New Password field
    Then I type "111" in Confirm Password field

    Then I click Change button
    Then I click on toaster notification "Saved"
    Then I sleep 7

    Then I click Logout button

    Then I see sign in form
    When I type username "test"
    When I type password "111"

    And click on log in button
    Then I sleep 5
    And I see task board


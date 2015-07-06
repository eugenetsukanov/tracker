Feature: Auth

  Scenario: Sign In
    Given Home page

    Then I see sign in form
    And I don't see username "test"

    When I type username "test"
    When I type password "test"
    And click on log in button

    Then I see username "Andy Garcia"
    And I see task board



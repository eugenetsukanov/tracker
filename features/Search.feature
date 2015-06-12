Feature: Search

  Background:
    Given Home page

    Then I see sign in form
    When I type username "test"
    When I type password "test"
    And click on log in button
    And I see task board

  Scenario: Search
      Then I see task "task 1"
      And I see task "task 2"

      Then I click on task link "task 1"
      Then I am on "task 1" page
      And I see task "task 1.1"
      And I see task "task 1.2"

      Then I see search form
      When I type query "task 1.1"
      Then I see task "task 1.1"
      Then I see task "task 1.1.1"
      And I don't see task "task 1.2"

      When I type query "task 1.2"
      Then I see task "task 1.2"
      And I don't see task "task 1.1"

      When I type query ""
      Then I am on "task 1" page

      And I see task "task 1.1"
      And I see task "task 1.2"





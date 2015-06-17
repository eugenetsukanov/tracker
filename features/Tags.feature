Feature: Tags

  Background:
    Given Home page

    Then I see sign in form
    When I type username "test"
    When I type password "test"
    And click on log in button
    And I see task board

  Scenario: SimpleTagging

    Then I see task "task 1"
    And I see task "task 2"

    And I see task title input

    When I type task title "task11"
    Then I see task form

    Then I click on save button

    Then I see task "task 1"
    Then I see task "task11"

    Then I click on task link "task11"

    Then I am on "task11" page
    And I don't see task "task 1"

    And I see task title input
    When I type task title "p3"

    Then I see task form

    Then I tag task with "tag1"

    Then I click on save button

    Then I am on "task11" page
    And I see task "p3"

    Then I click on task tag "tag1"
    And I see task "p3"
Feature: TaskFilter

  Background:
    Given Home page

    Then I see sign in form
    When I type username "test"
    When I type password "test"
    And click on log in button
    Then I sleep 1
    And I see task board

  Scenario: Filter tasks with "Move" button(positive case)

    Then I see task "task 1"
    And I see task "task 2"
    And I see task title input
    When I type task title "p1"
    Then I see task form
    Then I click on save button

    And I see task "p1"
    Then I click on task link "p1"
    Then I am on "p1" page

    Then I edit this task
    Then I click on Move link
    And I see search input
    When I type title of a serched task "task 1"
    Then I see in a search list "task 1"

  Scenario: Filter tasks with "Move" button(negative case)
    Then I see task "task 1"
    And I see task "task 2"
    And I see task title input
    When I type task title "p1"
    Then I see task form
    Then I click on save button

    And I see task "p1"
    Then I click on task link "p1"
    Then I am on "p1" page

    Then I edit this task
    Then I click on Move link
    And I see search input
    When I type title of a serched task "test"
    Then I don't see in a search list "test"
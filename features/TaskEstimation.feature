Feature: TaskEstimation

  Background:
    Given Home page

    Then I see sign in form
    When I type username "test"
    When I type password "test"
    And click on log in button
    And I see task board

  Scenario: CalculationPoints
    Then I see task "task 1"
    And I see task "task 2"
    And I see task title input
    When I type task title "p1"
    Then I see task form
    Then I see task complexity buttons
    And I click on task complexity "2+"
    Then I click on save button
    And I see task "p1"
    Then I click on task link "p1"
    Then I am on "p1" page
    Then I don't see task "task 1"
    And I see task complexity "8p"

  @wip
  Scenario: ProjectsEstimation

    When I see task "task 1"
    And I see task "task 2"

    Then I see task title input
    When I type task title "p1"
    Then I see task form

    Then I click on save button

    And I see task "p1"
    And I see task "task 2"

    Then I click on task link "p1"

    And I am on "p1" page
    And I don't see task "task 1"

    Then I see task title input

    When I type task title "p1.1"
    Then I see task form

    And I click on task complexity "2+"

    Then I click on save button

    And I see task "p1.1"
    And I don't see task "task 1"
    And I see task complexity "8p"

    When I see task title input

    Then I type task title "p1.2"
    And I see task form

    Then I click on task complexity "2+"
    Then I click on task status "Accepted"
    Then I type task spent time "1"

    And I click on save button

    Then I see task "p1.2" velocity "8"
    And I don't see task "task 2"
    And I see task "p1.1" estimated time "1.00"
    And I see parent "p1" estimated time "2.00"

    Then I click on task link "p1.1"
    Then I am on "p1.1" page
    Then I don't see task "task 1"
    Then I don't see task "p1.2"

    And I see task title input

    When I type task title "p1.1.1"
    Then I see task form

    And I click on task complexity "2+"

    Then I click on save button

    Then I don't see task "task 1"
    And I don't see task "p1.2"
    And I see task "p1.1.1" estimated time "1.00"
    And I see parent "p1.1" estimated time "1.00"

    Then I see parent "p1" estimated time "0"

    Then I click back to project "p1"
    And I see task "p1.1"
    And I see task "p1.2"

   Then I see parent "p1" estimated time "2.00"
    And I see task "p1.1" estimated time "1.00"




Feature: Report

  Background:
    Given Home page

    Then I see sign in form
    When I type username "test"
    When I type password "test"
    And click on log in button
    And I see task board

  Scenario: CommonReport

    When I see task "task 1"
    And I see task "task 2"

    Then I see task title input
    When I type task title "project 1"
    Then I see task form

    Then I click on save button

    And I see task "project 1"
    And I see task "task 2"

    Then I click on task link "project 1"

    And I am on "project 1" page
    And I don't see task "task 1"

    Then I see task title input

    When I type task title "project 1.1"
    Then I see task form

    Then I click on save button

    And I see task "project 1.1"
    And I don't see task "task 1"

    When I see task title input

    Then I type task title "project 1.2"
    And I see task form

    Then I click on task status "In Progress"

    And I click on save button

    And I see task "project 1.1"
    And I see task "project 1.2"
    And I don't see task "task 2"

    When I see task title input

    Then I type task title "project 1.3"
    And I see task form

    Then I click on task status "Accepted"

    And I click on save button

    Then I click on task link "project 1.1"

    And I am on "project 1.1" page
    And I don't see task "task 1"
    And I don't see task "project 1.2"

    Then I see task title input

    When I type task title "project 1.1.1"
    Then I see task form

    Then I click on save button

    When I click on "Report" button in navbar
    And I see "project 1.3" in Done tasks
    And I see "project 1.2" in In Progress tasks
    And I see "project 1.1" in Plans tasks
    And I see "project 1.1.1" in Plans tasks

  Scenario: ReportForUser

    When I see task "task 1"
    And I see task "task 2"

    Then I see task title input
    When I type task title "project 1"
    Then I see task form

    And I share this task on user "Danny Trejo"
    And I share this task on user "Arnie Shwarziniggah"

    Then I click on save button

    And I see task "project 1"
    And I see task "task 2"

    Then I click on task link "project 1"

    And I am on "project 1" page
    And I don't see task "task 1"

    Then I see task title input

    When I type task title "project 1.1"
    Then I see task form


    Then I click on save button

    And I see task "project 1.1"
    And I don't see task "task 1"

    When I see task title input

    Then I type task title "project 1.2"
    And I see task form

    Then I click on task status "In Progress"

    And I click on save button

    And I see task "project 1.1"
    And I see task "project 1.2"
    And I don't see task "task 2"

    When I see task title input

    Then I type task title "project 1.3"
    And I see task form

    Then I click on task status "Accepted"

    And I click on save button

    And I am on "project 1" page
    Then I click on task link "project 1.1"

#    Then stop
    And I am on "project 1.1" page
    And I don't see task "task 1"
    And I don't see task "project 1.2"

    Then I see task title input

    When I type task title "project 1.1.1"
    Then I see task form

    Then I click on save button

    Then I see task "project 1.1.1"
    Then I don't see task "project 1.2"

    Then I click back to project "project 1"

    Then I see task "project 1.3"
    Then I see task "project 1.2"
    And I don't see task "task 2"

    Then I see task title input

    When I type task title "project 1.4"
    Then I see task form
    And I assign it to user "Danny Trejo"

    Then I click on save button

    And I see task "project 1.4"
    And I see task "project 1.1"
    And I don't see task "task 1"


    Then I see task "project 1.3"
    Then I see task "project 1.2"
    And I don't see task "task 2"

    Then I see task title input

    When I type task title "project 1.5"
    Then I see task form
    And I assign it to user "Arnie Shwarziniggah"

    Then I click on save button

    And I see task "project 1.5"

    And I see task "project 1.2"
    And I don't see task "task 2"

    Then I click on task link "project 1.5"

    And I am on "project 1.5" page
    And I don't see task "project 1.4"
    And I don't see task "project 1.2"

    Then I see task title input

    When I type task title "project 1.5.1"
    Then I see task form

    Then I click on task status "Accepted"
    Then I assign it to user "Arnie Shwarziniggah"

    Then I click on save button

    And I see task "project 1.5.1"
    And I don't see task "task 2"
    And I don't see task "project 1.4"

    Then I click back to project "project 1"

    And I see task "project 1.1"
    And I see task "project 1.5"
    And I don't see task "task 1"

    When I click Report button in task menu

    Then I see "Andy Garcia" in assigned users
    And I see "project 1.3" in Done tasks
    And I see "project 1.2" in In Progress tasks
    And I see "project 1.1" in Plans tasks
    And I see "project 1.1.1" in Plans tasks

    When I choose user "Danny Trejo"
    Then I see "Danny Trejo" in assigned users
    And I see "project 1.4" in Plans tasks
    And I don't see "project 1.1.1" in Plans tasks
    And I don't see "project 1.3" in Done tasks

    When I choose user "Arnie Shwarziniggah"
    And I see "project 1.5" in Done tasks
    And I see "project 1.5.1" in Done tasks
    And I don't see "project 1.2" in In Progress tasks
    And I don't see "project 1.1" in Plans tasks

    When I choose user "All"

    And I see "project 1.3" in Done tasks
    And I see "project 1.5" in Done tasks
    And I see "project 1.5.1" in Done tasks
    And I see "project 1.2" in In Progress tasks
    And I see "project 1.1" in Plans tasks
    And I see "project 1.1.1" in Plans tasks
    And I see "project 1.4" in Plans tasks

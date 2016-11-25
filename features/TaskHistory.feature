Feature: TaskHistory

  Background:
    Given Home page

    Then I see sign in form
    When I type username "test"
    When I type password "test"
    And click on log in button
    Then I sleep 1
    And I see task board

  Scenario: Creating history of a new task

    Then I see task "task 1"
    And I see task "task 2"
    And I see task title input
    When I type task title "p1"
    Then I see task form
    Then I type description "Test"
    Then I click on save button

    And I see task "p1"
    Then I click on task link "p1"
    Then I am on "p1" page
    Then I don't see task "task 1"
    When I click on link "Details"
    Then I see comment message input
    And I see history message "Task was created with status 'new' ."
    And I see history message "Developer of this task is AndyGarcia ."
    And I see history message "Test"

  Scenario: Creating history of a nesting tasks

    Then I see task "task 1"
    And I see task "task 2"
    And I see task title input
    When I type task title "p1"
    Then I see task form
    Then I click on save button

    And I see task "p1"
    Then I click on task link "p1"
    Then I am on "p1" page

    And I see task title input
    When I type task title "p1.1"
    Then I see task form
    Then I click on task status "In Progress"
    Then I click on save button

    And I see task "p1.1"
    Then I click on task link "p1.1"
    Then I am on "p1.1" page
    Then I don't see task "p1"
    When I click on link "Details"
    And I see history message "Status was changed on 'in progress' ."
    And I see history message "Developer of this task is AndyGarcia ."

    Then I click back to project "p1"
    Then I am on "p1" page
    When I click on link "Details"
    And I see history message "Status was changed on 'in progress' ."
    And I see history message "Task was created with status 'new' ."
    And I see history message "Developer of this task is AndyGarcia ."

  Scenario: Creating history of task metrics

    Then I see task "task 1"
    And I see task "task 2"
    And I see task title input
    When I type task title "p1"
    Then I see task form
    Then I click on save button

    And I see task "p1"
    Then I click on task link "p1"
    Then I am on "p1" page
    When I click on link "Details"
    And I see history message "Task was created with status 'new' ."
    And I see history message "Developer of this task is AndyGarcia ."

    When I click on link "Details"
    And I see task title input
    When I type task title "p1.1"
    Then I see task complexity buttons
    And I click on task complexity "2+"
    Then I click task spent time "+1h"
    Then I click on task status "In Progress"
    Then I click on save button

    And I see task "p1.1"
    Then I click on task link "p1.1"
    Then I am on "p1.1" page
    When I click on link "Details"
    And I see history message "Status was changed on 'in progress' ."
    And I see history message "Spenttime was changed to 1 hours ."
    And I see history message "Developer of this task is AndyGarcia ."
    And I see history message "Complexity was changed to 2+ ."
    And I see history message "Points were changed to 8 ."
    Then I click back to project "p1"


    Then I am on "p1" page
    When I click on link "Details"
    And I see history message "Status was changed on 'in progress' ."
    And I see history message "Spenttime was changed to 1 hours ."
    And I see history message "Points were changed to 8 ."

    When I click on link "Details"
    And I see task title input
    When I type task title "p1.2"
    Then I see task form
    And I click on task complexity "1+"
    Then I click task spent time "+1h"
    Then I click on task status "Accepted"
    Then I click on save button

    And I see task "p1.2"
    Then I click on task link "p1.2"
    Then I am on "p1.2" page
    When I click on link "Details"
    And I see history message "Status was changed on 'accepted' ."
    And I see history message "Velocity was changed to 3.00 ."
    And I see history message "Spenttime was changed to 1 hours ."
    And I see history message "Developer of this task is AndyGarcia ."
    And I see history message "Complexity was changed to 1+ ."
    And I see history message "Points were changed to 3 ."

    Then I click back to project "p1"
    Then I am on "p1" page
    Then I see task "p1.1"
    Then I see task "p1.2"
    When I click on link "Details"
    And I see history message "Velocity was changed to 3.00 ."
    And I see history message "Estimated time was changed to 3.67 hours ."
    And I see history message "Spenttime was changed to 2 hours ."
    And I see history message "Points were changed to 11 ."

  Scenario: Creating history of comments

    Then I see task "task 1"
    And I see task "task 2"
    And I see task title input
    When I type task title "p1"
    Then I see task form
    Then I click on save button

    And I see task "p1"
    Then I click on task link "p1"
    Then I am on "p1" page
    When I click on link "Details"
    Then I see comment message input
    Then I type comment "First comment"
    Then I click on save button
    And I see history message "First comment"

    Then I reload page
    Then I sleep 1
    When I click on link "Details"
    And I see history message "First comment"
    And I see history message "Task was created with status 'new' ."
    And I see history message "Developer of this task is AndyGarcia ."
    Then I see task "p1" comments number "1"

    Then I type comment "Second comment"
    Then I click on save button

    And I see history message "Second comment"
    And I see history message "First comment"

    Then I reload page
    Then I sleep 1
    When I click on link "Details"

    And I see history message "Second comment"
    And I see history message "First comment"
    And I see history message "Task was created with status 'new' ."
    And I see history message "Developer of this task is AndyGarcia ."
    Then I see task "p1" comments number "2"

  Scenario: Testing history filters

    Then I see task "task 1"
    And I see task "task 2"
    And I see task title input
    When I type task title "p1"
    Then I see task form
    Then I click on save button

    And I see task title input
    When I type task title "p1.1"
    Then I see task form
    Then I see task complexity buttons
    And I click on task complexity "2+"
    Then I click task spent time "+1h"
    Then I click on task status "In Progress"
    Then I click on save button

    And I see task "p1.1"
    Then I click on task link "p1.1"
    Then I am on "p1.1" page
    When I click on link "Details"
    And I see history message "Status was changed on 'in progress' ."
    And I see history message "Spenttime was changed to 1 hours ."
    And I see history message "Developer of this task is AndyGarcia ."
    And I see history message "Complexity was changed to 2+ ."
    And I see history message "Points were changed to 8 ."

    Then I see comment message input
    Then I type comment "First comment"
    Then I click on save button
    Then I sleep 1

    And I see history message "First comment"
    And I see history message "Status was changed on 'in progress' ."
    And I see history message "Spenttime was changed to 1 hours ."
    And I see history message "Developer of this task is AndyGarcia ."
    And I see history message "Complexity was changed to 2+ ."
    And I see history message "Points were changed to 8 ."

    Then I click on "Comments" filter  button
    And I see history message "First comment"

    Then I click on "Other" filter  button
    And I see history message "Status was changed on 'in progress' ."
    And I see history message "Spenttime was changed to 1 hours ."
    And I see history message "Developer of this task is AndyGarcia ."
    And I see history message "Complexity was changed to 2+ ."
    And I see history message "Points were changed to 8 ."


    Then I click on "All" filter  button
    And I see history message "First comment"
    And I see history message "Status was changed on 'in progress' ."
    And I see history message "Spenttime was changed to 1 hours ."
    And I see history message "Developer of this task is AndyGarcia ."
    And I see history message "Complexity was changed to 2+ ."
    And I see history message "Points were changed to 8 ."










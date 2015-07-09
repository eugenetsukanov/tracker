Feature: Registration

  Scenario: Add new user

    Given Home page

    Then I click register button in nav

    Then I see registration form

    When I type username "testNew" in reg form
    When I type email "testNew@mail.com"
    When I type password "test" in reg form
    And I click on register button

    Then I see username "testNew"

    Then I see task title input
    When I type task title "project 1"
    Then I see task form

    Then I click on save button

    And I see task "project 1"

    And I see task board


  Scenario: Add new user with wrong username

    Given Home page

    Then I click register button in nav

    Then I see registration form

    When I type username "test" in reg form
    When I type email "testNew@mail.com"
    When I type password "test" in reg form
    And I click on register button

    Then I see notification "'test' already exist"
    Then I sleep 2

    Then I type username "test1" in reg form
    And I click on register button

    Then I see username "test1"
    Then I see task title input
    When I type task title "project 1"
    Then I see task form

    Then I click on save button

    And I see task "project 1"

    And I see task board

  Scenario: Add new user with wrong email

    Given Home page

    Then I click register button in nav

    Then I see registration form

    When I type username "test1" in reg form
    When I type email "mailtotesthere@gmail.com"
    When I type password "test" in reg form
    And I click on register button

    Then I see notification "'mailtotesthere@gmail.com' already exist"
    Then I sleep 2

    Then I type email "test1@mail.com"
    And I click on register button

    Then I see username "test1"
    Then I see task title input
    When I type task title "project 1"
    Then I see task form

    Then I click on save button

    And I see task "project 1"

    And I see task board
@ui
Feature: Blankfactor Automation
  As a quality assurance engineer
  I want to perform comprehensive testing of the website
  So that I can ensure all features work correctly

  Background:
    Given I navigate to Blankfactor home page

  Scenario: Blanckfactor Interaction test
    When I hover over "Industries" and open the "Retirement and wealth" section
    And I copy the text from the 3dht tile
    And I scroll to the bottom of the page and click on the Let's get started button
    Then I verify that the page is loaded and the page url is "https://blankfactor.com/contact/"
    And I verify the page title is "Contact | Blankfactor"

  # Data-driven testing with Scenario Outline
  Scenario Outline: Test different Industries menu options
    When I hover over "Industries" and open the "<industry_section>" section
    Then I verify that the page is loaded and the page url is "<expected_url>"
    And I verify the page title is "<expected_title>"

    Examples:
      | industry_section        | expected_url                                      | expected_title                            |
      | Financial Services      | https://blankfactor.com/industries/financial/    | Financial Services - Blankfactor         |
      | Healthcare              | https://blankfactor.com/industries/healthcare/   | Healthcare Solutions - Blankfactor       |
      | Retirement and wealth   | https://blankfactor.com/industries/retirement/   | Retirement & Wealth - Blankfactor        |
      | Insurance               | https://blankfactor.com/industries/insurance/    | Insurance Solutions - Blankfactor        |

  # Another example: Testing different browser types
  @browser-testing
  Scenario Outline: Cross-browser homepage verification
    Given I navigate to Blankfactor home page
    When I scroll to the bottom of the page and click on the Let's get started button
    Then I verify that the page is loaded and the page url is "https://blankfactor.com/contact/"
    And I verify the page title contains "<title_part>"

    Examples:
      | title_part  |
      | Contact     |
      | Blankfactor |

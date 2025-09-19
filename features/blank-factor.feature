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

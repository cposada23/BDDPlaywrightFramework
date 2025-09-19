@ui
Feature: Blankfactor Automation
  As a quality assurance engineer
  I want to perform comprehensive testing of the website
  So that I can ensure all features work correctly across different scenarios

  Background:
    Given I navigate to Blankfactor home page

  Scenario: Form interaction testing
    When I hover over "Industries" and open the "Retirement and wealth" section
    And I copy the text from the 3dht tile
    
# 🎯 Scenario Outline Guide

## What is Scenario Outline?

**Scenario Outline** is a Gherkin feature that allows you to run the same scenario multiple times with different sets of data. It's perfect for **data-driven testing** where you want to test the same functionality with various inputs and expected outputs.

## 📋 **Basic Structure**

```gherkin
Scenario Outline: <descriptive name>
  Given I do something with "<parameter1>"
  When I perform action with "<parameter2>" 
  Then I expect result "<parameter3>"

Examples:
  | parameter1 | parameter2 | parameter3     |
  | value1     | action1    | expected1      |
  | value2     | action2    | expected2      |
  | value3     | action3    | expected3      |
```

## 🚀 **Your BlankFactor Examples**

### **Example 1: Testing Multiple Menu Options**
```gherkin
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
```

**This creates 4 separate test executions:**
1. Test with "Financial Services" → expects financial URL and title
2. Test with "Healthcare" → expects healthcare URL and title  
3. Test with "Retirement and wealth" → expects retirement URL and title
4. Test with "Insurance" → expects insurance URL and title

### **Example 2: Cross-browser Testing**
```gherkin
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
```

## 🎮 **How to Run Scenario Outlines**

### **Run All Examples:**
```bash
npm test
```

### **Run Specific Scenario Outline:**
```bash
# Run only the Industries menu testing
npx cucumber-js --name "Test different Industries menu options"

# Run browser testing scenarios
npx cucumber-js --tags "@browser-testing"
```

### **Run with Different Browsers:**
```bash
# Test all examples in Chrome
BROWSER=chrome npm test

# Test all examples in Firefox  
BROWSER=firefox npm test
```

## 🎯 **Advanced Scenario Outline Examples**

### **Example 3: Form Validation Testing**
```gherkin
Scenario Outline: Contact form validation
  Given I navigate to contact page
  When I fill in name field with "<name>"
  And I fill in email field with "<email>"
  And I fill in message field with "<message>"
  And I click submit button
  Then I should see "<result_type>" message
  And the message should contain "<message_text>"

Examples:
  | name    | email              | message      | result_type | message_text           |
  | John    | john@example.com   | Hello World  | success     | Message sent           |
  |         | john@example.com   | Hello World  | error       | Name is required       |
  | John    | invalid-email      | Hello World  | error       | Invalid email format   |
  | John    | john@example.com   |              | error       | Message is required    |
```

### **Example 4: Search Functionality**
```gherkin
Scenario Outline: Search with different terms
  Given I am on the homepage
  When I search for "<search_term>"
  Then I should see "<result_count>" results
  And the first result should contain "<expected_text>"

Examples:
  | search_term      | result_count | expected_text    |
  | Financial        | 5+           | Financial        |
  | Healthcare       | 3+           | Healthcare       |
  | InvalidSearchTerm| 0            | No results found |
```

## 💡 **Benefits of Scenario Outline**

### ✅ **Data-Driven Testing**
- Test same functionality with multiple data sets
- Easily add new test cases by adding rows to Examples table
- No need to duplicate scenario structure

### ✅ **Maintainability**
- One scenario structure to maintain
- Changes to test logic apply to all examples
- Easy to add/remove test data

### ✅ **Comprehensive Coverage**
- Test edge cases and boundary conditions
- Cover different user paths with same steps
- Validate different expected outcomes

### ✅ **Clear Reporting**
- Each example shows up as a separate test result
- Easy to identify which data set failed
- Clear mapping between input and output

## 🔧 **Step Definition Support**

Your existing step definitions already work with Scenario Outline parameters:

```typescript
// This step works with any parameter value from Examples table
Then('I verify the page title is {string}', async function (this: CustomWorld, title: string) {
  let pageTitle = await blankFactorHomePage.getPageTitle();
  expect(pageTitle).toBe(title); // title comes from Examples table
});
```

## 📊 **Test Output Example**

When you run the Industries Scenario Outline, you'll see:
```
✓ Test different Industries menu options (Financial Services)
✓ Test different Industries menu options (Healthcare)  
✓ Test different Industries menu options (Retirement and wealth)
✗ Test different Industries menu options (Insurance) - Failed: Expected title not found
```

## 🎯 **Best Practices**

### **✅ Do:**
- Use meaningful parameter names in angle brackets `<parameter_name>`
- Keep Examples table organized and readable
- Use descriptive Scenario Outline names
- Group related test data together
- Add comments to explain complex Examples

### **❌ Don't:**
- Make Examples tables too large (consider splitting)
- Use Scenario Outline for just one example (use regular Scenario)
- Mix unrelated test cases in same Examples table
- Forget to handle edge cases in your data

## 🧪 **Testing Your Scenario Outline**

```bash
# Test the new Scenario Outline examples
npm test

# Specific test with verbose output
npm run test:verbose

# Run with screenshots to see each example execution
npm run test:screenshot-all
```

## 🎉 **Result**

You now have powerful **data-driven testing** capabilities:
- ✅ **Multiple test cases** from one scenario structure
- ✅ **Easy maintenance** by updating Examples table
- ✅ **Comprehensive coverage** of different inputs/outputs  
- ✅ **Clear reporting** showing which data sets pass/fail
- ✅ **Scalable testing** - just add more rows to test more cases

**Scenario Outline** is perfect for testing forms, navigation, validations, cross-browser compatibility, and any functionality that needs to work with different data sets! 🚀

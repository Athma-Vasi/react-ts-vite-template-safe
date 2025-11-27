# End-to-End Test Generation Guide 🎭

## 📋 Purpose

Generate comprehensive Playwright end-to-end tests for component user
interactions. E2E tests validate complete user workflows by simulating real
browser interactions, ensuring components behave correctly from a user's
perspective including input validation, visual feedback (icons, error messages),
navigation, and multi-step form workflows.

## 📍 File Location

- **Create** `{componentName}.spec.ts` in the component's directory
- **Example**: `src/components/login/login.spec.ts`,
  `src/components/dashboard/dashboard.spec.ts`
- **Convention**: Use `.spec.ts` suffix for Playwright E2E tests

## 🎯 Basic Pattern

Given a component **Login** with input fields for username, password, and submit
button:

```typescript
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/login");
});

test.describe("Login", async () => {
    test.describe("Username", async () => {
        test("should display checkmark if username is valid", async ({ page }) => {
            const usernameInput = page.getByLabel("username");
            await usernameInput.fill("validuser");
            const validIcon = page.getByTestId("username-input-valid-icon");
            await expect(validIcon).toBeVisible();
        });

        test("should display error dropdown if username is invalid", async ({ page }) => {
            const usernameInput = page.getByLabel("username");
            await usernameInput.fill("invalid!");
            const errorMessage = page.getByTestId(
                "username-input-invalid-text",
            );
            await expect(errorMessage).toBeVisible();
        });

        test("should display exists message if username already exists", async ({ page }) => {
            const usernameInput = page.getByLabel("username");
            await usernameInput.fill("existinguser");
            await page.keyboard.press("Tab");
            const existsMessage = page.getByTestId("username-exists-text");
            await expect(existsMessage).toBeVisible();
        });
    });

    test.describe("Password", async () => {
        test("should display checkmark if password is valid", async ({ page }) => {
            const passwordInput = page.getByTestId("password-input");
            await passwordInput.fill("ValidPass1!");
            await passwordInput.focus();
            const validIcon = page.getByTestId("password-input-valid-icon");
            await expect(validIcon).toBeVisible();
        });

        test("should display error dropdown if password is invalid", async ({ page }) => {
            const passwordInput = page.getByTestId("password-input");
            await passwordInput.fill("weak");
            await passwordInput.focus();
            const errorMessage = page.getByTestId(
                "password-input-invalid-text",
            );
            await expect(errorMessage).toBeVisible();
        });
    });

    test("should successfully login with valid credentials", async ({ page }) => {
        const usernameInput = page.getByLabel("username");
        await usernameInput.fill("validuser");
        const passwordInput = page.getByTestId("password-input");
        await passwordInput.fill("ValidPass1!");
        const submitButton = page.getByTestId("login-submit-button");
        await submitButton.click();

        // Verify navigation to dashboard
        await page.waitForURL("http://localhost:5173/dashboard");
        const dashboardHeading = page.getByRole("heading", {
            name: "Dashboard",
        });
        await expect(dashboardHeading).toBeVisible();
    });
});
```

**Key Points**:

- Use `test.beforeEach()` at top level for common navigation
- Nest `test.describe()` blocks to organize tests by field/feature
- Test both valid and invalid states for each input
- Use `data-testid` attributes for reliable element selection
- Test visual feedback: valid icons, invalid icons, error messages
- Test complete workflows (end-to-end scenarios)

## ➕ Adding to Existing Tests

If `login.spec.ts` already exists with tests for username and password, and you
need to add tests for a new "rememberMe" checkbox:

**Add new describe block** maintaining the component's organization:

```typescript
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/login");
});

test.describe("Login", async () => {
    // ... existing Username tests
    // ... existing Password tests

    test.describe("Remember Me", async () => {
        test("should toggle remember me checkbox", async ({ page }) => {
            const rememberMeCheckbox = page.getByTestId("rememberMe-checkbox");

            // Initially unchecked
            await expect(rememberMeCheckbox).not.toBeChecked();

            // Click to check
            await rememberMeCheckbox.click();
            await expect(rememberMeCheckbox).toBeChecked();

            // Click again to uncheck
            await rememberMeCheckbox.click();
            await expect(rememberMeCheckbox).not.toBeChecked();
        });

        test("should persist login when remember me is checked", async ({ page, context }) => {
            const usernameInput = page.getByLabel("username");
            await usernameInput.fill("validuser");
            const passwordInput = page.getByTestId("password-input");
            await passwordInput.fill("ValidPass1!");
            const rememberMeCheckbox = page.getByTestId("rememberMe-checkbox");
            await rememberMeCheckbox.click();
            const submitButton = page.getByTestId("login-submit-button");
            await submitButton.click();

            await page.waitForURL("http://localhost:5173/dashboard");

            // Create new page in same context (same cookies/storage)
            const newPage = await context.newPage();
            await newPage.goto("http://localhost:5173/login");

            // Verify credentials are pre-filled
            const newUsernameInput = newPage.getByLabel("username");
            await expect(newUsernameInput).toHaveValue("validuser");
        });
    });
});
```

## 🔧 Test Patterns by Input Type

Different input types require specific testing approaches based on the actual
codebase patterns:

### Text Input with Validation Icons

```typescript
test.describe("Email", async () => {
    test("should display checkmark if email is valid", async ({ page }) => {
        const emailInput = page.getByLabel("email");
        await emailInput.fill("user@example.com");
        const validIcon = page.getByTestId("email-input-valid-icon");
        await expect(validIcon).toBeVisible();
    });

    test("should display error dropdown if email is invalid", async ({ page }) => {
        const emailInput = page.getByLabel("email");
        await emailInput.fill("userexample.com");
        const errorMessage = page.getByTestId("email-input-invalid-text");
        await expect(errorMessage).toBeVisible();
    });

    test("should display exists message if email already exists", async ({ page }) => {
        const emailInput = page.getByLabel("email");
        await emailInput.fill("existing@example.com");
        await page.keyboard.press("Tab");
        const existsMessage = page.getByTestId("email-exists-text");
        await expect(existsMessage).toBeVisible();
    });
});
```

### Text Input with Valid/Invalid Icons

```typescript
test.describe("Name Field", () => {
    test("should display checkmark if name is valid", async ({ page }) => {
        const nameInput = page.getByTestId("name-textInput");
        await nameInput.fill("John");
        const validIcon = page.getByTestId("name-input-valid-icon");
        await expect(validIcon).toBeVisible();
    });

    test("should display x if name is invalid", async ({ page }) => {
        const nameInput = page.getByTestId("name-textInput");
        await nameInput.fill("John!");
        const invalidIcon = page.getByTestId("name-input-invalid-icon");
        await expect(invalidIcon).toBeVisible();
    });
});
```

### Password with Confirmation

```typescript
test.describe("Password", async () => {
    test("should display checkmark if password is valid", async ({ page }) => {
        const passwordInput = page.getByTestId("password-input");
        await passwordInput.fill("SecurePass1!");
        await passwordInput.focus();
        const validIcon = page.getByTestId("password-input-valid-icon");
        await expect(validIcon).toBeVisible();
    });

    test("should display error dropdown if password is invalid", async ({ page }) => {
        const passwordInput = page.getByTestId("password-input");
        await passwordInput.fill("weak");
        await passwordInput.focus();
        const errorMessage = page.getByTestId("password-input-invalid-text");
        await expect(errorMessage).toBeVisible();
    });

    test("should display error message if password is different from confirm password", async ({ page }) => {
        const confirmPasswordInput = page.getByTestId("confirmPassword-input");
        await confirmPasswordInput.fill("SecurePass1!");
        const passwordInput = page.getByTestId("password-input");
        await passwordInput.fill("SecurePass2!");
        await passwordInput.focus();
        const errorMessage = page.getByTestId("password-input-invalid-text");
        await expect(errorMessage).toBeVisible();
    });
});

test.describe("Confirm Password", async () => {
    test("should display checkmark if confirm password is valid", async ({ page }) => {
        const passwordInput = page.getByTestId("password-input");
        await passwordInput.fill("SecurePass1!");
        const confirmPasswordInput = page.getByTestId("confirmPassword-input");
        await confirmPasswordInput.fill("SecurePass1!");
        await confirmPasswordInput.focus();
        const validIcon = page.getByTestId("confirmPassword-input-valid-icon");
        await expect(validIcon).toBeVisible();
    });

    test("should display error dropdown if confirm password is invalid", async ({ page }) => {
        const passwordInput = page.getByTestId("password-input");
        await passwordInput.fill("SecurePass1!");
        const confirmPasswordInput = page.getByTestId("confirmPassword-input");
        await confirmPasswordInput.fill("weak");
        await confirmPasswordInput.focus();
        const errorMessage = page.getByTestId(
            "confirmPassword-input-invalid-text",
        );
        await expect(errorMessage).toBeVisible();
    });

    test("should display error message if password is different from confirm password", async ({ page }) => {
        const passwordInput = page.getByTestId("password-input");
        await passwordInput.fill("SecurePass1!");
        const confirmPasswordInput = page.getByTestId("confirmPassword-input");
        await confirmPasswordInput.fill("SecurePass2!");
        await confirmPasswordInput.focus();
        const errorMessage = page.getByTestId(
            "confirmPassword-input-invalid-text",
        );
        await expect(errorMessage).toBeVisible();
    });
});
```

### Select Dropdown Input

```typescript
test.describe("Country", () => {
    test("should allow selecting a country", async ({ page }) => {
        const countrySelect = page.getByTestId("country-selectInput");
        await countrySelect.selectOption("Canada");
        await expect(countrySelect).toHaveValue("Canada");
    });

    test("should display province field when Canada is selected", async ({ page }) => {
        const countrySelect = page.getByTestId("country-selectInput");
        await countrySelect.selectOption("Canada");
        const provinceSelect = page.getByTestId("province-selectInput");
        await expect(provinceSelect).toBeVisible();
    });

    test("should display state field when United States is selected", async ({ page }) => {
        const countrySelect = page.getByTestId("country-selectInput");
        await countrySelect.selectOption("United States");
        const stateSelect = page.getByTestId("state-selectInput");
        await expect(stateSelect).toBeVisible();
    });
});
```

### Conditional Fields Based on Selection

```typescript
test.describe("Postal Code Canada", () => {
    test("should display checkmark if postal code is valid", async ({ page }) => {
        const postalCodeInput = page.getByTestId("postalCodeCanada-textInput");
        await postalCodeInput.fill("A1B 2C3");
        const validIcon = page.getByTestId("postalCodeCanada-input-valid-icon");
        await expect(validIcon).toBeVisible();
    });

    test("should display x if postal code is invalid", async ({ page }) => {
        const postalCodeInput = page.getByTestId("postalCodeCanada-textInput");
        await postalCodeInput.fill("A1B2C3!");
        const invalidIcon = page.getByTestId(
            "postalCodeCanada-input-invalid-icon",
        );
        await expect(invalidIcon).toBeVisible();
    });
});

test.describe("Postal Code US", () => {
    test.beforeEach(async ({ page }) => {
        const countrySelectInput = page.getByTestId("country-selectInput");
        await countrySelectInput.selectOption("United States");
    });

    test("should display checkmark if postal code is valid", async ({ page }) => {
        const postalCodeInput = page.getByTestId("postalCodeUS-textInput");
        await postalCodeInput.fill("12345");
        const validIcon = page.getByTestId("postalCodeUS-input-valid-icon");
        await expect(validIcon).toBeVisible();
    });

    test("should display x if postal code is invalid", async ({ page }) => {
        const postalCodeInput = page.getByTestId("postalCodeUS-textInput");
        await postalCodeInput.fill("12345-6789!");
        const invalidIcon = page.getByTestId("postalCodeUS-input-invalid-icon");
        await expect(invalidIcon).toBeVisible();
    });
});
```

### URL Input Field

```typescript
test.describe("Image Url", () => {
    test("should display checkmark if url is valid", async ({ page }) => {
        const imageUrlInput = page.getByTestId("imageUrl-textInput");
        await imageUrlInput.fill("https://example.com/picture.jpg");
        const validIcon = page.getByTestId("imageUrl-input-valid-icon");
        await expect(validIcon).toBeVisible();
    });

    test("should display x if url is invalid", async ({ page }) => {
        const imageUrlInput = page.getByTestId("imageUrl-textInput");
        await imageUrlInput.fill("invalid-url");
        const invalidIcon = page.getByTestId("imageUrl-input-invalid-icon");
        await expect(invalidIcon).toBeVisible();
    });
});
```

### Multi-Step Forms with beforeEach Navigation

```typescript
test.describe("Step 2 Fields", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to step 2
        const nextStepButton = page.getByTestId("next-step-button");
        await nextStepButton.click();
    });

    test.describe("Field A", () => {
        test("should display checkmark if field is valid", async ({ page }) => {
            const fieldInput = page.getByTestId("fieldA-textInput");
            await fieldInput.fill("Valid Value");
            const validIcon = page.getByTestId("fieldA-input-valid-icon");
            await expect(validIcon).toBeVisible();
        });

        test("should display x if field is invalid", async ({ page }) => {
            const fieldInput = page.getByTestId("fieldA-textInput");
            await fieldInput.fill("Invalid!");
            const invalidIcon = page.getByTestId("fieldA-input-invalid-icon");
            await expect(invalidIcon).toBeVisible();
        });
    });
});

test.describe("Step 3 Fields", () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to step 3 (click next twice)
        const nextStepButton = page.getByTestId("next-step-button");
        await nextStepButton.click();
        await nextStepButton.click();
    });

    test.describe("Field B", () => {
        test("should display checkmark if field is valid", async ({ page }) => {
            const fieldInput = page.getByTestId("fieldB-textInput");
            await fieldInput.fill("123 Main St");
            const validIcon = page.getByTestId("fieldB-input-valid-icon");
            await expect(validIcon).toBeVisible();
        });

        test("should display x if field is invalid", async ({ page }) => {
            const fieldInput = page.getByTestId("fieldB-textInput");
            await fieldInput.fill("123 Main St!");
            await expect(page.getByTestId("fieldB-input-invalid-icon"))
                .toBeVisible();
        });
    });
});
```

### Navigation Between Related Pages

```typescript
test("should take user to login when link is clicked", async ({ page }) => {
    const loginLink = page.getByTestId("login-link");
    await loginLink.click();
    await page.waitForURL("http://localhost:5173/login");
    const registerLink = page.getByTestId("register-link");
    await expect(registerLink).toBeVisible();
});
```

## 🎪 Complete Workflow Examples

### Valid Form Submission Workflow

```typescript
test("Valid Form Submission", async ({ page }) => {
    // Fill all required fields with valid data
    const field1Input = page.getByTestId("field1-textInput");
    await field1Input.fill("validValue1");

    const field2Input = page.getByTestId("field2-textInput");
    await field2Input.fill("validValue2");

    const field3Select = page.getByTestId("field3-selectInput");
    await field3Select.selectOption("Option A");

    // For multi-step forms, navigate through steps
    const nextStepButton = page.getByTestId("next-step-button");
    await nextStepButton.click();

    const field4Input = page.getByTestId("field4-textInput");
    await field4Input.fill("validValue4");
    await nextStepButton.click();

    // Verify form review displays all fields as valid
    await expect(page.getByTestId("field1-formReview-key-valid")).toBeVisible();
    await expect(page.getByTestId("field1-formReview-value-valid"))
        .toBeVisible();
    await expect(page.getByTestId("field2-formReview-key-valid")).toBeVisible();
    await expect(page.getByTestId("field2-formReview-value-valid"))
        .toBeVisible();
    await expect(page.getByTestId("field3-formReview-key-valid")).toBeVisible();
    await expect(page.getByTestId("field3-formReview-value-valid"))
        .toBeVisible();
    await expect(page.getByTestId("field4-formReview-key-valid")).toBeVisible();
    await expect(page.getByTestId("field4-formReview-value-valid"))
        .toBeVisible();

    // Verify submit button is enabled
    const submitButton = page.getByTestId("component-submit-button-enabled");
    await expect(submitButton).toBeVisible();

    // Submit and verify navigation
    await submitButton.click();
    await page.waitForURL("http://localhost:5173/success");
});
```

### Invalid Form Submission Workflow

```typescript
test("Invalid Form Submission", async ({ page }) => {
    // Fill fields with invalid data
    const field1Input = page.getByTestId("field1-textInput");
    await field1Input.fill("invalid!");

    const field2Input = page.getByTestId("field2-textInput");
    await field2Input.fill("bad@data");

    const field3Select = page.getByTestId("field3-selectInput");
    await field3Select.selectOption("Option A");

    // For multi-step forms, navigate through steps
    const nextStepButton = page.getByTestId("next-step-button");
    await nextStepButton.click();

    const field4Input = page.getByTestId("field4-textInput");
    await field4Input.fill("invalid!");
    await nextStepButton.click();

    // Verify form review shows invalid fields as invalid, valid fields as valid
    // Invalid text fields
    await expect(page.getByTestId("field1-formReview-key-invalid"))
        .toBeVisible();
    await expect(page.getByTestId("field1-formReview-value-invalid"))
        .toBeVisible();
    await expect(page.getByTestId("field2-formReview-key-invalid"))
        .toBeVisible();
    await expect(page.getByTestId("field2-formReview-value-invalid"))
        .toBeVisible();
    await expect(page.getByTestId("field4-formReview-key-invalid"))
        .toBeVisible();
    await expect(page.getByTestId("field4-formReview-value-invalid"))
        .toBeVisible();

    // Valid select field
    await expect(page.getByTestId("field3-formReview-key-valid")).toBeVisible();
    await expect(page.getByTestId("field3-formReview-value-valid"))
        .toBeVisible();

    // Verify submit button is disabled
    const submitButton = page.getByTestId("component-submit-button-disabled");
    await expect(submitButton).toBeVisible();
});
```

## ✨ Best Practices

1. **Use data-testid Attributes**: Most reliable selector for E2E tests
   - Valid icon: `{fieldName}-input-valid-icon`
   - Invalid icon: `{fieldName}-input-invalid-icon`
   - Invalid text: `{fieldName}-input-invalid-text`
   - Text input: `{fieldName}-textInput`
   - Select input: `{fieldName}-selectInput`

2. **Test Organization with Nested describe()**:
   - Top level: Component name
   - Second level: Section/Step name or field grouping
   - Third level: Individual field name
   - Tests within field: Valid and invalid cases

3. **Use beforeEach for Navigation**:
   - Top level: Navigate to component page
   - Section level: Navigate to specific step in multi-step forms

4. **Test Both Visual States**:
   - ✅ Valid inputs: Check for valid icon visibility
   - ❌ Invalid inputs: Check for invalid icon/error message visibility

5. **Focus Management**: Use `focus()` or `Tab` key for inputs that validate on
   blur

6. **Complete Workflows**: Include end-to-end tests for:
   - Valid complete flow (all fields valid → submit enabled)
   - Invalid complete flow (some fields invalid → submit disabled)
   - Form review verification (key-valid/invalid, value-valid/invalid)

7. **Conditional Fields**: Use nested `beforeEach()` to set up dependencies
   ```typescript
   test.describe("State Field", () => {
       test.beforeEach(async ({ page }) => {
           const countrySelect = page.getByTestId("country-selectInput");
           await countrySelect.selectOption("United States");
       });
       // ... tests for state field
   });
   ```

## ⚠️ Common Mistakes

1. **Wrong Selector Pattern**: Not using testid consistently
   ```typescript
   // ❌ Wrong - inconsistent selectors
   const input = page.locator('input[name="username"]');

   // ✅ Correct - use data-testid
   const input = page.getByTestId("username-textInput");
   ```

2. **Missing Focus/Blur Triggers**: Not triggering validation
   ```typescript
   // ❌ Wrong - validation may not trigger
   await input.fill("value");
   const icon = page.getByTestId("icon");

   // ✅ Correct - trigger validation with focus/blur
   await input.fill("value");
   await input.focus(); // or await page.keyboard.press("Tab");
   const icon = page.getByTestId("icon");
   ```

3. **Not Waiting for Navigation**: Race conditions on page transitions
   ```typescript
   // ❌ Wrong - may check before navigation completes
   await button.click();
   await expect(page).toHaveURL("...");

   // ✅ Correct - wait explicitly
   await button.click();
   await page.waitForURL("http://localhost:5173/dashboard");
   ```

4. **Testing Implementation Details**: Testing field order instead of
   functionality
   ```typescript
   // ❌ Wrong - testing DOM structure
   const firstInput = page.locator("input").first();

   // ✅ Correct - testing semantic elements
   const usernameInput = page.getByLabel("username");
   ```

5. **Overly Complex Single Tests**: Testing too much in one test
   ```typescript
   // ❌ Wrong - one massive test
   test("should handle all inputs", async ({ page }) => {
       // 100 lines testing everything
   });

   // ✅ Correct - focused tests per field
   test.describe("Username", () => {
       test("should display checkmark if valid", () => {/* ... */});
       test("should display error if invalid", () => {/* ... */});
   });
   ```

6. **Not Testing Form Review States**: Missing validation of review step
   ```typescript
   // ❌ Incomplete - doesn't verify review display
   await submitForm();

   // ✅ Complete - verifies review shows valid/invalid states
   await submitForm();
   await expect(page.getByTestId("field-formReview-key-valid")).toBeVisible();
   await expect(page.getByTestId("field-formReview-value-valid")).toBeVisible();
   ```

## 💡 Pro Tips

1. **Multi-Step Form Pattern**: Use `beforeEach()` to navigate through steps
   efficiently

2. **Form Review Testing**: Verify both key and value display with `-valid` or
   `-invalid` suffix

3. **Password Matching Tests**: Test both password and confirmPassword fields
   for mismatch errors

4. **Conditional Field Testing**: Use separate `beforeEach()` blocks for
   different select values

5. **Complete Flow Tests**: Include one comprehensive valid test and one invalid
   test at the end

6. **Visual Debugging**: Run with `--debug` flag to step through tests:
   ```bash
   npx playwright test --debug
   ```

7. **Test Data Separation**: Keep valid/invalid test data consistent across
   similar fields

8. **Keyboard Navigation**: Test `Tab` key for moving between fields and
   triggering blur validation

9. **Context Sharing**: Use `{ page, context }` when testing persistence across
   page loads

10. **Data-testid Naming Convention**:
    - Inputs: `{fieldName}-textInput`, `{fieldName}-selectInput`
    - Icons: `{fieldName}-input-valid-icon`, `{fieldName}-input-invalid-icon`
    - Errors: `{fieldName}-input-invalid-text`, `{fieldName}-exists-text`
    - Buttons: `{action}-button`, `{component}-submit-button-enabled/disabled`
    - Form Review: `{fieldName}-formReview-key-valid/invalid`,
      `{fieldName}-formReview-value-valid/invalid`

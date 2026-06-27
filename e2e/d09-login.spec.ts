import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

test.describe('D9: Login and Registration Flow', () => {
  let loginPage: LoginPage;
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
  });

  test.describe('User Registration', () => {
    test('should register a new user successfully', async ({ page }) => {
      await registerPage.goto();

      // Fill registration form
      await registerPage.emailInput.fill(`testuser_${Date.now()}@example.com`);
      await registerPage.usernameInput.fill(`testuser_${Date.now()}`);
      await registerPage.passwordInput.fill('TestPassword123!');
      await registerPage.confirmPasswordInput.fill('TestPassword123!');
      await registerPage.termsCheckbox.check();

      // Submit
      await registerPage.registerButton.click();

      // Should redirect to home or dashboard after successful registration
      await expect(page).not.toHaveURL('/register');
    });

    test('should show error for invalid email format', async ({ page }) => {
      await registerPage.goto();

      await registerPage.emailInput.fill('invalid-email');
      await registerPage.usernameInput.fill('testuser');
      await registerPage.passwordInput.fill('TestPassword123!');
      await registerPage.confirmPasswordInput.fill('TestPassword123!');
      await registerPage.termsCheckbox.check();

      await registerPage.registerButton.click();

      // Should show validation error
      await registerPage.expectErrorVisible();
    });

    test('should show error when passwords do not match', async ({ page }) => {
      await registerPage.goto();

      await registerPage.emailInput.fill('test@example.com');
      await registerPage.usernameInput.fill('testuser');
      await registerPage.passwordInput.fill('TestPassword123!');
      await registerPage.confirmPasswordInput.fill('DifferentPassword123!');
      await registerPage.termsCheckbox.check();

      await registerPage.registerButton.click();

      // Should show password mismatch error
      await registerPage.expectErrorVisible();
    });

    test('should require accepting terms to register', async ({ page }) => {
      await registerPage.goto();

      await registerPage.emailInput.fill('test@example.com');
      await registerPage.usernameInput.fill('testuser');
      await registerPage.passwordInput.fill('TestPassword123!');
      await registerPage.confirmPasswordInput.fill('TestPassword123!');

      // Submit without accepting terms
      await registerPage.registerButton.click();

      // Registration should not proceed
      await expect(page).toHaveURL('/register');
    });
  });

  test.describe('User Login', () => {
    test('should show error for invalid credentials', async ({ page }) => {
      await loginPage.goto();

      await loginPage.emailInput.fill('nonexistent@example.com');
      await loginPage.passwordInput.fill('WrongPassword123!');
      await loginPage.loginButton.click();

      // Should show error message
      await loginPage.expectErrorVisible();
    });

    test('should show error for empty email', async ({ page }) => {
      await loginPage.goto();

      await loginPage.passwordInput.fill('SomePassword123!');
      await loginPage.loginButton.click();

      // Should show validation error
      await loginPage.expectErrorVisible();
    });

    test('should show error for empty password', async ({ page }) => {
      await loginPage.goto();

      await loginPage.emailInput.fill('test@example.com');
      await loginPage.loginButton.click();

      // Should show validation error
      await loginPage.expectErrorVisible();
    });

    test('should disable login button while loading', async ({ page }) => {
      await loginPage.goto();

      await loginPage.emailInput.fill('test@example.com');
      await loginPage.passwordInput.fill('password');

      // Button should be enabled initially
      await loginPage.expectLoginButtonEnabled();

      // Click and observe loading state
      await loginPage.loginButton.click();

      // Button should be disabled during loading
      await expect(loginPage.loginButton).toBeDisabled();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate from login to register page', async ({ page }) => {
      await loginPage.goto();

      await registerPage.loginLink.click();

      await expect(page).toHaveURL('/register');
    });

    test('should navigate from register to login page', async ({ page }) => {
      await registerPage.goto();

      await registerPage.loginLink.click();

      await expect(page).toHaveURL('/login');
    });

    test('should redirect authenticated user from login page to home', async ({ page }) => {
      // Login with valid credentials first
      await loginPage.login('test@example.com', 'ValidPassword123!');

      // Then navigate to login page
      await page.goto('/login');

      // Should be redirected to home
      await expect(page).toHaveURL('/');
    });
  });
});

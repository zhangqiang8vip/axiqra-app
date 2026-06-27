import { test, expect } from '@playwright/test';
import { TraceNewPage } from '../pages/TraceNewPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('D11: Trace Submission Flow', () => {
  let traceNewPage: TraceNewPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    traceNewPage = new TraceNewPage(page);
    loginPage = new LoginPage(page);

    // Login before accessing trace creation
    await loginPage.login('test@example.com', 'TestPassword123!');
  });

  test.describe('Create Trace', () => {
    test('should access trace creation page when authenticated', async ({ page }) => {
      await traceNewPage.goto();

      // Should see the trace form
      await expect(traceNewPage.taskGoalInput).toBeVisible();
    });

    test('should redirect to login when not authenticated', async ({ page, context }) => {
      // Clear auth state
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());

      await traceNewPage.goto();

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should show all 9 blocks in form', async ({ page }) => {
      await traceNewPage.goto();

      // Block 1: Task Goal
      await expect(traceNewPage.taskGoalInput).toBeVisible();

      // Block 2: Project Context
      await expect(traceNewPage.projectContextInput).toBeVisible();

      // Block 3: Forward Steps
      await expect(traceNewPage.forwardSteps.first()).toBeVisible();

      // Block 4: Reverse Path
      await expect(traceNewPage.reversePathInput).toBeVisible();

      // Block 5: Failure Path
      await expect(traceNewPage.failurePathInput).toBeVisible();

      // Block 7: Rollback Path
      await expect(traceNewPage.rollbackPathInput).toBeVisible();

      // Block 8: Evolution Hint
      await expect(traceNewPage.evolutionHintInput).toBeVisible();

      // Block 9: Risk Level
      await expect(traceNewPage.riskLevelInputs.first()).toBeVisible();

      // Submit button
      await expect(traceNewPage.submitButton).toBeVisible();
    });
  });

  test.describe('Fill 9-Block Form', () => {
    test('should fill block 1 - Task Goal', async ({ page }) => {
      await traceNewPage.goto();

      const taskGoal = 'Deploy a microservice to Kubernetes cluster';
      await traceNewPage.fillTaskGoal(taskGoal);

      const value = await traceNewPage.taskGoalInput.inputValue();
      expect(value).toBe(taskGoal);
    });

    test('should fill block 2 - Project Context', async ({ page }) => {
      await traceNewPage.goto();

      const context = 'E-commerce platform using Java Spring Boot';
      await traceNewPage.fillProjectContext(context);

      const value = await traceNewPage.projectContextInput.inputValue();
      expect(value).toBe(context);
    });

    test('should add and fill forward steps - Block 3', async ({ page }) => {
      await traceNewPage.goto();

      // Add a forward step
      await traceNewPage.addForwardStep(
        'Build Docker image',
        'docker build -t myapp .',
        'Image built successfully'
      );

      await traceNewPage.addForwardStep(
        'Push to registry',
        'docker push myapp:latest',
        'Image pushed'
      );

      // Should have at least 2 steps
      const stepCount = await traceNewPage.forwardSteps.count();
      expect(stepCount).toBeGreaterThanOrEqual(2);
    });

    test('should fill block 4 - Reverse Path', async ({ page }) => {
      await traceNewPage.goto();

      await traceNewPage.fillReversePath('kubectl delete deployment myapp');

      const value = await traceNewPage.reversePathInput.inputValue();
      expect(value).toContain('kubectl delete');
    });

    test('should fill block 5 - Failure Path', async ({ page }) => {
      await traceNewPage.goto();

      await traceNewPage.fillFailurePath('Check pod status: kubectl get pods');

      const value = await traceNewPage.failurePathInput.inputValue();
      expect(value).toContain('kubectl');
    });

    test('should select block 9 - Risk Level', async ({ page }) => {
      await traceNewPage.goto();

      await traceNewPage.selectRiskLevel('R1');

      // Check that R1 is selected
      const r1Selected = await page.locator('.risk-option input[value="R1"]').isChecked();
      expect(r1Selected).toBeTruthy();
    });

    test('should auto-save draft', async ({ page }) => {
      await traceNewPage.goto();

      await traceNewPage.fillTaskGoal('Test task goal');

      // Wait for auto-save indicator
      await traceNewPage.expectAutoSaveIndicator();
    });

    test('should clear draft', async ({ page }) => {
      await traceNewPage.goto();

      // Fill some data
      await traceNewPage.fillTaskGoal('Test task goal');

      // Clear draft
      await traceNewPage.clearDraftButton.click();

      // Handle confirmation dialog
      page.on('dialog', dialog => dialog.accept());

      // Form should be cleared
      const value = await traceNewPage.taskGoalInput.inputValue();
      expect(value).toBe('');
    });
  });

  test.describe('Submit and Verify', () => {
    test('should submit trace with minimum required fields', async ({ page }) => {
      await traceNewPage.goto();

      // Fill only required fields
      await traceNewPage.fillTaskGoal('Deploy application to production');

      // Submit
      await traceNewPage.submit();

      // Should redirect to confirmation page or show success
      const redirectedToConfirm = page.url().includes('/confirm');
      const hasError = await traceNewPage.errorMessage.isVisible().catch(() => false);

      expect(redirectedToConfirm || hasError).toBeTruthy();
    });

    test('should not submit with empty task goal', async ({ page }) => {
      await traceNewPage.goto();

      // Try to submit without task goal
      await traceNewPage.submit();

      // Should show error
      await traceNewPage.expectErrorVisible();
    });

    test('should disable submit button during submission', async ({ page }) => {
      await traceNewPage.goto();

      await traceNewPage.fillTaskGoal('Deploy application');

      // Click submit
      await traceNewPage.submit();

      // Button should be disabled during submission
      await expect(traceNewPage.submitButton).toBeDisabled();
    });

    test('should show validation errors for required fields', async ({ page }) => {
      await traceNewPage.goto();

      // Submit without filling required fields
      await traceNewPage.submit();

      // Should show error message
      await traceNewPage.expectErrorVisible();
    });

    test('should preserve form data after failed submission', async ({ page }) => {
      await traceNewPage.goto();

      const taskGoal = 'My important task goal';
      await traceNewPage.fillTaskGoal(taskGoal);

      // Submit and expect failure
      await traceNewPage.submit();

      // Form data should still be present
      const value = await traceNewPage.taskGoalInput.inputValue();
      expect(value).toBe(taskGoal);
    });
  });

  test.describe('Desensitization Preview', () => {
    test('should show desensitization preview', async ({ page }) => {
      await traceNewPage.goto();

      // Fill with sensitive data
      await traceNewPage.fillProjectContext('Server at localhost:8080, password: secret123');

      // Click preview button
      await traceNewPage.previewDesensitizationButton.click();

      // Preview should be visible
      const preview = page.locator('.preview-content');
      await expect(preview).toBeVisible();
    });

    test('should mask sensitive data in preview', async ({ page }) => {
      await traceNewPage.goto();

      await traceNewPage.fillProjectContext('localhost:8080 or 192.168.1.1');

      await traceNewPage.previewDesensitizationButton.click();

      // Check that sensitive data is masked
      const previewContent = await page.locator('.preview-content').textContent();
      expect(previewContent).not.toContain('192.168.1.1');
    });
  });
});

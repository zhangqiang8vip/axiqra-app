# E2E Test Fixtures and Utilities

import { test as base, Page, BrowserContext } from '@playwright/test';

// Test user credentials for E2E testing
export const TEST_USERS = {
  valid: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    username: 'testuser',
  },
  invalid: {
    email: 'nonexistent@example.com',
    password: 'WrongPassword123!',
  },
};

// Test data for Trace creation
export const TEST_TRACE_DATA = {
  taskGoal: 'Deploy a microservice to Kubernetes cluster',
  projectContext: 'E-commerce platform using Java Spring Boot, running on Kubernetes',
  forwardStep: {
    step: 'Build Docker image',
    command: 'docker build -t myapp .',
    result: 'Image built successfully',
  },
  reversePath: 'kubectl delete deployment myapp',
  failurePath: 'Check pod status: kubectl get pods',
  riskLevel: 'R1',
};

// Test data for search
export const TEST_SEARCH_QUERIES = {
  valid: ['java', 'kubernetes', 'microservice'],
  invalid: [`nonexistent_${Date.now()}`],
  special: ['test<script>', 'test with spaces'],
};

// Custom test fixture with authentication support
export interface AuthenticatedPage {
  page: Page;
  authenticatedAs: (email: string, password: string) => Promise<void>;
}

export const authenticatedFixture = base.extend<AuthenticatedPage>({
  authenticatedAs: async ({ page }, use) => {
    await use(async (email: string, password: string) => {
      await page.goto('/login');
      await page.getByTestId('email').fill(email);
      await page.getByTestId('password').fill(password);
      await page.getByTestId('login-button').click();
      await page.waitForURL('/');
    });
  },
});

// Helper function to clear local storage
export async function clearAuthState(context: BrowserContext) {
  await context.clearCookies();
  const pages = context.pages();
  for (const page of pages) {
    await page.evaluate(() => localStorage.clear());
  }
}

// Helper function to wait for network idle
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {});
}

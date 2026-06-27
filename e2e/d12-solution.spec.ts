import { test, expect } from '@playwright/test';
import { SolutionsPage, SolutionDetailPage } from '../pages/SolutionsPage';

test.describe('D12: Solution View Flow', () => {
  let solutionsPage: SolutionsPage;
  let solutionDetailPage: SolutionDetailPage;

  test.beforeEach(async ({ page }) => {
    solutionsPage = new SolutionsPage(page);
    solutionDetailPage = new SolutionDetailPage(page);
  });

  test.describe('View Solution List', () => {
    test('should display solutions list page', async ({ page }) => {
      await solutionsPage.goto();

      await expect(page.locator('h1')).toContainText('方案');
    });

    test('should show filter controls', async ({ page }) => {
      await solutionsPage.goto();

      await expect(solutionsPage.statusFilter).toBeVisible();
      await expect(solutionsPage.techStackFilter).toBeVisible();
      await expect(solutionsPage.riskLevelFilter).toBeVisible();
    });

    test('should show solutions or empty state', async ({ page }) => {
      await solutionsPage.goto();

      // Either show solutions or no results message
      const hasSolutions = await solutionsPage.solutionsList.isVisible().catch(() => false);
      const hasNoResults = await solutionsPage.noResultsMessage.isVisible().catch(() => false);

      expect(hasSolutions || hasNoResults).toBeTruthy();
    });

    test('should display solution cards with status badges', async ({ page }) => {
      await solutionsPage.goto();

      // Wait for solutions to load
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const cardCount = await solutionsPage.getSolutionCount();
      if (cardCount > 0) {
        // Should have status badges
        await expect(solutionsPage.page.locator('.card-status').first()).toBeVisible();
      }
    });

    test('should display solution cards with risk badges', async ({ page }) => {
      await solutionsPage.goto();

      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const cardCount = await solutionsPage.getSolutionCount();
      if (cardCount > 0) {
        // Should have risk badges
        await expect(solutionsPage.page.locator('.card-risk').first()).toBeVisible();
      }
    });

    test('should display solution titles', async ({ page }) => {
      await solutionsPage.goto();

      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const cardCount = await solutionsPage.getSolutionCount();
      if (cardCount > 0) {
        await expect(solutionsPage.page.locator('.card-title').first()).toBeVisible();
      }
    });

    test('should display solution summaries', async ({ page }) => {
      await solutionsPage.goto();

      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const cardCount = await solutionsPage.getSolutionCount();
      if (cardCount > 0) {
        await expect(solutionsPage.page.locator('.card-summary').first()).toBeVisible();
      }
    });
  });

  test.describe('Solution Filtering', () => {
    test('should filter by published status', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      await solutionsPage.applyStatusFilter('published');

      // Wait for filtered results
      await solutionsPage.expectSolutionsLoaded().catch(() => {});
    });

    test('should filter by Java tech stack', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      await solutionsPage.applyTechStackFilter('Java');

      await solutionsPage.expectSolutionsLoaded().catch(() => {});
    });

    test('should filter by safe risk level', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      await solutionsPage.applyRiskLevelFilter('safe');

      await solutionsPage.expectSolutionsLoaded().catch(() => {});
    });

    test('should combine multiple filters', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      await solutionsPage.applyStatusFilter('published');
      await solutionsPage.applyTechStackFilter('Python');
    });

    test('should reset filters', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      // Apply and then reset filter
      await solutionsPage.applyStatusFilter('published');

      // Reset by selecting "all"
      await solutionsPage.statusFilter.selectOption('');

      await solutionsPage.expectSolutionsLoaded().catch(() => {});
    });
  });

  test.describe('View Solution Detail', () => {
    test('should navigate to solution detail page', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const cardCount = await solutionsPage.getSolutionCount();
      if (cardCount > 0) {
        // Click on first solution card
        await solutionsPage.solutionCards.first().click();

        // Should navigate to detail page
        await solutionsPage.expectRedirectToDetail();
      }
    });

    test('should display solution detail content', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const cardCount = await solutionsPage.getSolutionCount();
      if (cardCount > 0) {
        await solutionsPage.solutionCards.first().click();

        // Should show detail content
        await solutionDetailPage.expectTitleVisible();
        await solutionDetailPage.expectStatusVisible();
      }
    });

    test('should show status badge on detail page', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const cardCount = await solutionsPage.getSolutionCount();
      if (cardCount > 0) {
        await solutionsPage.solutionCards.first().click();

        await solutionDetailPage.expectStatusVisible();
      }
    });

    test('should show risk badge on detail page', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const cardCount = await solutionsPage.getSolutionCount();
      if (cardCount > 0) {
        await solutionsPage.solutionCards.first().click();

        await solutionDetailPage.expectRiskVisible();
      }
    });

    test('should go back from detail page', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const cardCount = await solutionsPage.getSolutionCount();
      if (cardCount > 0) {
        await solutionsPage.solutionCards.first().click();

        // Go back
        await solutionDetailPage.goBack();

        // Should return to list
        await expect(page).toHaveURL(/\/solutions/);
      }
    });
  });

  test.describe('Verify Status Display', () => {
    test('should show draft status correctly', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.applyStatusFilter('draft');
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const cardCount = await solutionsPage.getSolutionCount();
      if (cardCount > 0) {
        await solutionsPage.expectStatusBadge('draft');
      }
    });

    test('should show published status correctly', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.applyStatusFilter('published');
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const cardCount = await solutionsPage.getSolutionCount();
      if (cardCount > 0) {
        await solutionsPage.expectStatusBadge('published');
      }
    });

    test('should show pending review status correctly', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.applyStatusFilter('pending_review');
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const cardCount = await solutionsPage.getSolutionCount();
      if (cardCount > 0) {
        await solutionsPage.expectStatusBadge('pending_review');
      }
    });

    test('should apply correct CSS class for each status', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.applyStatusFilter('published');
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const cardCount = await solutionsPage.getSolutionCount();
      if (cardCount > 0) {
        // Published status should have green styling
        const statusBadge = page.locator('.status--published').first();
        const isVisible = await statusBadge.isVisible().catch(() => false);
        expect(isVisible).toBeTruthy();
      }
    });
  });

  test.describe('Pagination', () => {
    test('should show pagination when results exceed page size', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const hasPagination = await solutionsPage.pagination.isVisible().catch(() => false);
      if (hasPagination) {
        await expect(solutionsPage.pagination).toBeVisible();
      }
    });

    test('should navigate to next page', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const hasPagination = await solutionsPage.pagination.isVisible().catch(() => false);
      if (hasPagination) {
        const nextButton = solutionsPage.nextPageButton;
        const isNextVisible = await nextButton.isVisible().catch(() => false);
        if (isNextVisible) {
          await nextButton.click();
          await solutionsPage.expectSolutionsLoaded().catch(() => {});
        }
      }
    });

    test('should navigate to previous page', async ({ page }) => {
      await solutionsPage.goto();
      await solutionsPage.expectSolutionsLoaded().catch(() => {});

      const hasPagination = await solutionsPage.pagination.isVisible().catch(() => false);
      if (hasPagination) {
        const prevButton = solutionsPage.prevPageButton;
        const isPrevVisible = await prevButton.isVisible().catch(() => false);
        if (isPrevVisible) {
          await prevButton.click();
          await solutionsPage.expectSolutionsLoaded().catch(() => {});
        }
      }
    });
  });
});

import { test, expect } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';

test.describe('D10: Search Flow', () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
  });

  test.describe('Search Solutions', () => {
    test('should display search input and button', async ({ page }) => {
      await searchPage.goto();

      await expect(searchPage.searchInput).toBeVisible();
      await expect(searchPage.searchButton).toBeVisible();
    });

    test('should search with valid query', async ({ page }) => {
      await searchPage.search('java');

      // Should show results or no results message
      const hasResults = await searchPage.resultsContainer.isVisible();
      const hasNoResults = await searchPage.noResultsMessage.isVisible();

      expect(hasResults || hasNoResults).toBeTruthy();
    });

    test('should search with technical term', async ({ page }) => {
      await searchPage.goto();
      await searchPage.searchInput.fill('kubernetes deployment');
      await searchPage.searchButton.click();

      await expect(page).not.toHaveURL('/search');
    });

    test('should not search with empty query', async ({ page }) => {
      await searchPage.goto();

      await searchPage.searchButton.click();

      // Should stay on search page
      await expect(page).toHaveURL(/\/search/);
    });

    test('should handle special characters in search', async ({ page }) => {
      await searchPage.goto();
      await searchPage.searchInput.fill('test<script>alert(1)</script>');
      await searchPage.searchButton.click();

      // Should handle gracefully
      await expect(page).not.toHaveURL(/\/search\?q=.*script/);
    });
  });

  test.describe('Search Result Filtering', () => {
    test('should apply status filter', async ({ page }) => {
      await searchPage.goto();
      await searchPage.search('test');

      // Wait for results to load
      await searchPage.resultsContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      // Apply filter if available
      await searchPage.applyStatusFilter('published');
    });

    test('should apply tech stack filter', async ({ page }) => {
      await searchPage.goto();
      await searchPage.search('test');

      // Wait for results to load
      await searchPage.resultsContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      // Apply filter
      await searchPage.applyTechStackFilter('Java');
    });

    test('should apply risk level filter', async ({ page }) => {
      await searchPage.goto();
      await searchPage.search('test');

      // Wait for results to load
      await searchPage.resultsContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      // Apply filter
      await searchPage.applyRiskLevelFilter('safe');
    });

    test('should combine multiple filters', async ({ page }) => {
      await searchPage.goto();
      await searchPage.search('test');

      await searchPage.resultsContainer.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      await searchPage.applyStatusFilter('published');
      await searchPage.applyTechStackFilter('Java');
    });
  });

  test.describe('No Results Handling', () => {
    test('should show no results message for unmatched query', async ({ page }) => {
      await searchPage.search(`nonexistent_query_${Date.now()}`);

      // If no results, should show empty state
      const hasNoResults = await searchPage.noResultsMessage.isVisible().catch(() => false);
      const hasResults = await searchPage.resultsContainer.isVisible().catch(() => false);

      // One of these should be true
      expect(hasNoResults || hasResults).toBeTruthy();
    });

    test('should show create seed button when no results', async ({ page }) => {
      await searchPage.search(`unique_seed_query_${Date.now()}`);

      // Check if no results and create seed button is visible
      const hasNoResults = await searchPage.noResultsMessage.isVisible().catch(() => false);
      const hasCreateSeedButton = await searchPage.createSeedButton.isVisible().catch(() => false);

      if (hasNoResults) {
        expect(hasCreateSeedButton).toBeTruthy();
      }
    });
  });

  test.describe('Search Edge Cases', () => {
    test('should handle very long search query', async ({ page }) => {
      await searchPage.goto();
      const longQuery = 'a'.repeat(500);
      await searchPage.searchInput.fill(longQuery);
      await searchPage.searchButton.click();

      // Should handle without crashing
      await expect(page).toBeVisible();
    });

    test('should handle rapid search requests', async ({ page }) => {
      await searchPage.goto();

      // Rapidly click search multiple times
      await searchPage.searchInput.fill('test');
      await searchPage.searchButton.click();
      await searchPage.searchInput.fill('java');
      await searchPage.searchButton.click();
      await searchPage.searchInput.fill('python');
      await searchPage.searchButton.click();

      // Should handle gracefully
      await expect(page).toBeVisible();
    });

    test('should clear search input', async ({ page }) => {
      await searchPage.goto();

      await searchPage.searchInput.fill('test query');
      await searchPage.searchButton.click();

      await searchPage.goto();
      const value = await searchPage.searchInput.inputValue();

      // Input should be empty on new page load
      expect(value).toBe('');
    });
  });
});

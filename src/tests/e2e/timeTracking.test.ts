import { test, expect } from "@playwright/test";

test.describe("Time Tracking E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage and cookies before each test
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();
    await page.goto("/");
  });

  test.describe("User Session Management", () => {
    test("maintains user-specific timer state", async ({ page }) => {
      // Login as first user
      await page.goto("/auth");
      await page.fill('[data-testid="email"]', "user1@example.com");
      await page.fill('[data-testid="password"]', "password");
      await page.click('[data-testid="login-button"]');

      // Start timer
      await page.click('[data-testid="start-timer"]');
      await page.waitForTimeout(5000);

      // Store timer value
      const user1TimerValue = await page.textContent(
        '[data-testid="timer-display"]',
      );

      // Verify localStorage has user-specific key
      const user1Storage = await page.evaluate(() => {
        const userId = JSON.parse(localStorage.getItem("supabase.auth.token")!)
          .user.id;
        return localStorage.getItem(`timer_${userId}`);
      });
      expect(user1Storage).toBeTruthy();

      // Logout
      await page.click('[data-testid="logout-button"]');

      // Login as second user
      await page.fill('[data-testid="email"]', "user2@example.com");
      await page.fill('[data-testid="password"]', "password");
      await page.click('[data-testid="login-button"]');

      // Verify second user starts with fresh timer
      const user2InitialTimer = await page.textContent(
        '[data-testid="timer-display"]',
      );
      expect(user2InitialTimer).toBe("00 : 00 : 00");

      // Start second user's timer
      await page.click('[data-testid="start-timer"]');
      await page.waitForTimeout(3000);

      // Verify separate storage for second user
      const user2Storage = await page.evaluate(() => {
        const userId = JSON.parse(localStorage.getItem("supabase.auth.token")!)
          .user.id;
        return localStorage.getItem(`timer_${userId}`);
      });
      expect(user2Storage).toBeTruthy();
      expect(user2Storage).not.toBe(user1Storage);

      // Logout and login as first user again
      await page.click('[data-testid="logout-button"]');
      await page.fill('[data-testid="email"]', "user1@example.com");
      await page.fill('[data-testid="password"]', "password");
      await page.click('[data-testid="login-button"]');

      // Verify first user's timer state is preserved
      const user1TimerAfter = await page.textContent(
        '[data-testid="timer-display"]',
      );
      expect(user1TimerAfter).toBe(user1TimerValue);
    });

    test("auto-saves timer state", async ({ page }) => {
      // Login
      await page.goto("/auth");
      await page.fill('[data-testid="email"]', "test@example.com");
      await page.fill('[data-testid="password"]', "password");
      await page.click('[data-testid="login-button"]');

      // Start timer
      await page.click('[data-testid="start-timer"]');
      await page.waitForTimeout(2000);

      // Get initial storage state
      const initialStorage = await page.evaluate(() => {
        const userId = JSON.parse(localStorage.getItem("supabase.auth.token")!)
          .user.id;
        return localStorage.getItem(`timer_${userId}`);
      });

      // Wait and check if storage is updated
      await page.waitForTimeout(2000);
      const updatedStorage = await page.evaluate(() => {
        const userId = JSON.parse(localStorage.getItem("supabase.auth.token")!)
          .user.id;
        return localStorage.getItem(`timer_${userId}`);
      });

      expect(updatedStorage).not.toBe(initialStorage);
    });

    test("clears timer state on stop", async ({ page }) => {
      // Login
      await page.goto("/auth");
      await page.fill('[data-testid="email"]', "test@example.com");
      await page.fill('[data-testid="password"]', "password");
      await page.click('[data-testid="login-button"]');

      // Start and stop timer
      await page.click('[data-testid="start-timer"]');
      await page.waitForTimeout(2000);
      await page.click('[data-testid="stop-timer"]');

      // Verify storage is cleared
      const storage = await page.evaluate(() => {
        const userId = JSON.parse(localStorage.getItem("supabase.auth.token")!)
          .user.id;
        const timerData = localStorage.getItem(`timer_${userId}`);
        return timerData ? JSON.parse(timerData) : null;
      });

      expect(storage.state).toBe("stopped");
      expect(storage.time).toBe(0);
    });
  });
});

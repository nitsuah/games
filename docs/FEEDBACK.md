# FEEDBACK.md

- app/package.json
Comment on lines 5 to +6
    "@react-three/fiber": "^9.1.2",
    "gsap": "^3.12.2",
Copilot AI
2 minutes ago
The gsap dependency has been moved in the JSON structure. While this change is functionally correct, it appears to be a reordering of existing dependencies rather than a new addition. Consider whether this reorganization was intentional or if it was an incidental formatting change.

Suggested change
    "@react-three/fiber": "^9.1.2",
    "gsap": "^3.12.2",
    "gsap": "^3.12.2",
    "@react-three/fiber": "^9.1.2",
Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
app/e2e/games.spec.js
    await page.goto('/asteroid');

    // Give canvas time to initialize
    await page.waitForTimeout(2000);
Copilot AI
2 minutes ago
Using fixed timeouts with waitForTimeout is fragile and can lead to flaky tests. Replace with waitForSelector or waitForLoadState to wait for specific conditions rather than arbitrary time periods.

Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
app/e2e/games.spec.js
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/asteroid');
    await page.waitForTimeout(2000);
Copilot AI
2 minutes ago
Using fixed timeouts with waitForTimeout is fragile and can lead to flaky tests. Replace with waitForSelector or waitForLoadState to wait for specific conditions rather than arbitrary time periods.

Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
app/e2e/games.spec.js
    await page.goto('/fps');

    // Give canvas time to initialize
    await page.waitForTimeout(2000);
Copilot AI
2 minutes ago
Using fixed timeouts with waitForTimeout is fragile and can lead to flaky tests. Replace with waitForSelector or waitForLoadState to wait for specific conditions rather than arbitrary time periods.

Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
app/e2e/games.spec.js
Comment on lines +46 to +47
    await page.waitForTimeout(2000);

Copilot AI
2 minutes ago
Using fixed timeouts with waitForTimeout is fragile and can lead to flaky tests. Replace with waitForSelector or waitForLoadState to wait for specific conditions rather than arbitrary time periods.

Suggested change
    await page.waitForTimeout(2000);
    
    
    
Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
.github/workflows/ci-cd.yml
    - name: Run E2E tests
      run: |
        cd app
        npx playwright install --with-deps chromium
Copilot AI
2 minutes ago
[nitpick] Installing Playwright browsers on every CI run can be slow. Consider caching the browser binaries using GitHub Actions cache to speed up CI runs.

Copilot uses AI. Check for mistakes.
@nitsuah	Reply...
.github/prompts/copilot-instructions.md.prompt.md
5. **Cleanup**: Remove unused code, update imports

# Install packages
wsl bash -c "cd /mnt/c/path/to/games/app && npm install <package>"
Copilot AI
2 minutes ago
This line still references the old WSL-based workflow and is inconsistent with the updated environment setup instructions above. Update to use native PowerShell commands: npm install <package>

Suggested change
wsl bash -c "cd /mnt/c/path/to/games/app && npm install <package>"
cd .\app
npm install <package>
Copilot uses AI. Check for mistakes.
@nitsuah	Reply...

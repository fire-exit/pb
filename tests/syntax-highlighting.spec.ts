import { test, expect } from '@playwright/test';

const YAML_SAMPLE = `name: Build
on:
  push:
    branches:
      - main
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test`;

const JSON_SAMPLE = `{
  "name": "pastebin",
  "version": "1.0.0",
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0"
  }
}`;

test.describe('Syntax Highlighting', () => {
  test('JSON highlighting should apply syntax classes', async ({ page }) => {
    await page.goto('/');

    // Select JSON language
    await page.selectOption('select', 'json');

    // Wait for CodeMirror to be ready
    await page.waitForSelector('.cm-editor');

    // Click into the editor and type content
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type(JSON_SAMPLE);

    // Wait for highlighting to apply
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/json-highlighting.png', fullPage: true });

    // Check for syntax highlighting classes
    const highlightedElements = await page.locator('.cm-editor .cm-line span[class*="cm-"]').count();
    console.log(`JSON: Found ${highlightedElements} highlighted elements`);

    // Get the classes applied
    const classes = await page.evaluate(() => {
      const spans = document.querySelectorAll('.cm-editor .cm-line span');
      const classSet = new Set<string>();
      spans.forEach(span => {
        span.classList.forEach(cls => {
          if (cls.startsWith('cm-') && cls !== 'cm-line') {
            classSet.add(cls);
          }
        });
      });
      return Array.from(classSet);
    });
    console.log('JSON syntax classes:', classes);

    expect(highlightedElements).toBeGreaterThan(0);
  });

  test('YAML highlighting should apply syntax classes', async ({ page }) => {
    await page.goto('/');

    // Select YAML language
    await page.selectOption('select', 'yaml');

    // Wait for CodeMirror to be ready
    await page.waitForSelector('.cm-editor');

    // Click into the editor and type content
    const editor = page.locator('.cm-content');
    await editor.click();
    await page.keyboard.type(YAML_SAMPLE);

    // Wait for highlighting to apply
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/yaml-highlighting.png', fullPage: true });

    // Check for syntax highlighting - CodeMirror 6 uses obfuscated class names like ͼ1r, ͼ1w
    // Count spans with any class (these are the highlighted tokens)
    const highlightedSpans = await page.evaluate(() => {
      const spans = document.querySelectorAll('.cm-editor .cm-line span[class]');
      return spans.length;
    });
    console.log(`YAML: Found ${highlightedSpans} highlighted spans`);

    // Verify that YAML keys are styled (they have special classes)
    const yamlKeySpans = await page.evaluate(() => {
      const content = document.querySelector('.cm-editor .cm-content');
      if (!content) return 0;
      // Look for spans that contain YAML keys (name, on, push, etc.)
      const spans = content.querySelectorAll('span[class]');
      let keyCount = 0;
      spans.forEach(span => {
        const text = span.textContent || '';
        if (['name', 'on', 'push', 'branches', 'jobs', 'build'].includes(text)) {
          keyCount++;
        }
      });
      return keyCount;
    });
    console.log(`YAML: Found ${yamlKeySpans} key spans with classes`);

    expect(highlightedSpans).toBeGreaterThan(0);
  });

  test('compare JSON vs YAML highlighting', async ({ page }) => {
    // Test JSON first
    await page.goto('/');
    await page.selectOption('select', 'json');
    await page.waitForSelector('.cm-editor');
    const editorJson = page.locator('.cm-content');
    await editorJson.click();
    await page.keyboard.type(JSON_SAMPLE);
    await page.waitForTimeout(500);

    const jsonHtml = await page.locator('.cm-editor .cm-content').innerHTML();
    console.log('JSON editor HTML structure:');
    console.log(jsonHtml.substring(0, 1000));

    // Navigate to fresh page for YAML
    await page.goto('/');
    await page.selectOption('select', 'yaml');
    await page.waitForSelector('.cm-editor');
    const editorYaml = page.locator('.cm-content');
    await editorYaml.click();
    await page.keyboard.type(YAML_SAMPLE);
    await page.waitForTimeout(500);

    const yamlHtml = await page.locator('.cm-editor .cm-content').innerHTML();
    console.log('YAML editor HTML structure:');
    console.log(yamlHtml.substring(0, 1000));
  });
});

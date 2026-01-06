# Pendo Data Verification Utility

## Overview

A development-only utility that scans the DOM to verify Pendo exclusion is working correctly. It checks for PII in tracking attributes and ensures form inputs are properly excluded from Pendo analytics.

## Usage

### Basic Usage

```typescript
import { runPendoVerification } from 'app/utils/verifyPendoData';

// Run a full verification scan
runPendoVerification();
```

### Via Browser Console (Development Mode Only)

The utility is automatically exposed on the window object in development mode:

```javascript
// Run full scan with formatted output
window.pendoVerify.scan();

// Get raw report data
const report = window.pendoVerify.report();

// Highlight issues on the page
window.pendoVerify.highlight(report);

// Run specific checks
const piiIssues = window.pendoVerify.scanPII();
const exclusionIssues = window.pendoVerify.checkExclusions();
```

## Features

### 1. PII Detection

Scans for personally identifiable information in elements lacking `data-pendo-ignore`:

**High Severity:**
- Email addresses
- Phone numbers
- Credit card numbers
- Social Security Numbers
- API keys/tokens
- Client/Account IDs
- Tax IDs (TIN, EIN)
- Bank account numbers
- IBAN codes
- JWT tokens
- Passwords/Secrets
- AWS Access Keys

**Medium Severity:**
- IP addresses
- User IDs
- ISIN codes (financial securities)

**Low Severity:**
- Postal/ZIP codes

### 2. Form Input Exclusion Verification

Checks that sensitive form inputs have proper exclusion attributes:

- Password fields
- Email inputs
- Phone number inputs
- Text areas
- Inputs with sensitive names (e.g., "email", "password", "token")

### 3. Approved Tracking Attributes

Verifies only approved Pendo attributes are used:

**Approved attributes:**
- `data-pendo-id`
- `data-pendo-guide-id`
- `data-pendo-ignore`
- `data-pendo-exclude`

**Flags unapproved attributes** to prevent accidental custom tracking.

### 4. Sensitive Data Attribute Checks

Verifies elements with sensitive data attributes are excluded:

- `data-user-id`
- `data-email`
- `data-token`
- `data-api-key`

## Exclusion Methods

### Primary Method: `data-pendo-ignore`

```html
<!-- Exclude a single input -->
<input type="email" data-pendo-ignore />

<!-- Exclude a container and all children -->
<div data-pendo-ignore>
  <input type="password" />
  <input type="email" />
  <textarea></textarea>
</div>
```

### Alternative Methods

The utility also recognizes these exclusion markers:

- `data-pendo-exclude`
- `_pendo-exclude_` (class)
- `pendo-exclude` (class)
- `_pensieve-exclude_` (class)

## Report Output

### Console Output Example

```
🔍 Pendo Exclusion Verification Report
Generated: 2026-01-05T10:30:00.000Z
Total Elements Scanned: 1,234
Total Form Inputs: 45

❌ Issues detected - Review and fix before deploying to production!

Summary:
  🔴 High Severity PII Issues: 2
  🟠 Medium Severity PII Issues: 1
  🟡 Low Severity PII Issues: 0
  🟣 Unexcluded Inputs/Tracking Issues: 5
```

### Report Structure

```typescript
interface IPendoVerificationReport {
    timestamp: string;
    totalElements: number;
    totalInputs: number;
    piiIssues: IPIIIssue[];
    exclusionIssues: IPendoExclusionIssue[];
    summary: {
        highSeverityCount: number;
        mediumSeverityCount: number;
        lowSeverityCount: number;
        unexcludedInputsCount: number;
        passed: boolean;
    };
}
```

## API Reference

### `runPendoVerification()`

Runs a complete verification scan and logs formatted results to console.

**Returns:** `IPendoVerificationReport`

**Example:**
```typescript
const report = runPendoVerification();
```

### `generatePendoReport(rootElement?)`

Generates a verification report for a specific element or entire document.

**Parameters:**
- `rootElement` (optional): Element to scan. Defaults to `document`.

**Returns:** `IPendoVerificationReport`

**Example:**
```typescript
const modal = document.querySelector('#user-modal');
const report = generatePendoReport(modal);
```

### `scanForPII(rootElement?)`

Scans for PII in elements lacking exclusion attributes.

**Returns:** `IPIIIssue[]`

### `verifyPendoExclusions(rootElement?)`

Checks that form inputs are properly excluded.

**Returns:** `IPendoExclusionIssue[]`

### `verifyApprovedTrackingAttributes(rootElement?)`

Verifies only approved Pendo attributes are present.

**Returns:** `IPendoExclusionIssue[]`

### `printPendoReport(report)`

Prints a formatted report with actionable warnings.

**Parameters:**
- `report`: The report to print

### `highlightIssues(report)`

Visually highlights problematic elements in the DOM.

**Parameters:**
- `report`: The report containing issues to highlight

## Best Practices

### 1. Run During Development

Add to your development workflow:

```typescript
// In your main app component or dev tools
if (process.env.NODE_ENV === 'development') {
    import('./utils/verifyPendoData').then(({ runPendoVerification }) => {
        // Run on initial load
        setTimeout(() => runPendoVerification(), 2000);
    });
}
```

### 2. Exclude All Form Inputs

```html
<!-- Recommended: Wrap entire forms -->
<form data-pendo-ignore>
  <input type="email" />
  <input type="password" />
  <button type="submit">Login</button>
</form>
```

### 3. Use XPath for Debugging

The report includes XPath for each issue to help locate elements:

```javascript
const report = window.pendoVerify.report();
const xpath = report.piiIssues[0].xpath;

// Use XPath to find element
const element = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
).singleNodeValue;
```

### 4. Review Before Production Deploy

```bash
# Add to your CI/CD pipeline
npm test -- verifyPendoData.spec.ts
```

## Integration with Testing

## Examples

### Unit Tests Example

```typescript
import { generatePendoReport } from 'app/utils/verifyPendoData';

describe('MyComponent', () => {
    it('should not expose PII to Pendo', () => {
        const { container } = render(<MyComponent />);
        const report = generatePendoReport(container);
        
        expect(report.summary.highSeverityCount).toBe(0);
        expect(report.summary.passed).toBe(true);
    });
});
```

### E2E Tests Example

```typescript
test('Pendo verification passes on all pages', async ({ page }) => {
    await page.goto('/');
    
    const report = await page.evaluate(() => {
        return window.pendoVerify.report();
    });
    
    expect(report.summary.passed).toBe(true);
});
```

## Troubleshooting

### Issue: False Positives for IP Addresses

Some version strings may match IP patterns. Add exclusion:

```html
<div data-pendo-ignore>Version: 1.2.3.4</div>
```

### Issue: Custom Pendo Attributes Needed

Request approval for new attributes or use data attributes on excluded elements:

```html
<div data-pendo-ignore data-custom-tracking="value">
    <!-- Your content -->
</div>
```

### Issue: Performance on Large DOMs

Scan specific sections instead of entire document:

```typescript
const section = document.querySelector('#main-content');
const report = generatePendoReport(section);
```

## Development Mode Only

This utility is designed for **development mode only**. It will:

- Only expose `window.pendoVerify` when `NODE_ENV` includes "dev"
- Show a warning if run in production mode
- Return empty/passing report in production

## Support

For questions or issues with the Pendo verification utility, contact the frontend team or file an issue in the repository.


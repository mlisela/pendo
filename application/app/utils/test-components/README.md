# Pendo PII Detection Test Components

## Overview

This directory contains comprehensive TSX test components for validating the Pendo PII detection and exclusion verification utility.

## Files

- **`PendoTestComponents.tsx`** - React components demonstrating various PII scenarios
- **`PendoTestComponents.spec.tsx`** - Automated tests for PII detection
- **`README.md`** - This file

## Test Categories

### 1. Bad Examples (❌)
Components that **SHOULD** trigger PII warnings:

- `BadEmailInAttribute` - Email in `data-pendo-id`
- `BadPhoneInClass` - Phone number in class name
- `BadCreditCardInData` - Credit card in data attribute
- `BadSSNInId` - Social Security Number in ID
- `BadAPIKeyInTitle` - API key in title attribute
- `BadUnexcludedForm` - Form without exclusion markers
- `BadBankAccountInPlaceholder` - Bank account in placeholder
- `BadIBANInAlt` - IBAN code in alt text
- `BadUserIdInName` - User ID in name attribute
- `BadJWTInAriaLabel` - JWT token in aria-label
- `BadIPInText` - IP address in text content

### 2. Good Examples (✅)
Components that are **properly excluded**:

- `GoodEmailExcluded` - Email in excluded container
- `GoodExcludedForm` - Form with `data-pendo-ignore`
- `GoodIndividualInputsExcluded` - Each input individually excluded
- `GoodSensitiveDataExcluded` - Sensitive section with exclusion marker
- `GoodPaymentExcluded` - Payment info with exclusion class
- `GoodAPIConfigExcluded` - API configuration excluded
- `GoodMixedContent` - Mixed safe/excluded content

### 3. Edge Cases (⚠️)
Special scenarios:

- `EdgeCaseVersionNumber` - Version numbers that look like IPs
- `EdgeCaseNestedExclusions` - Nested exclusion markers
- `EdgeCaseTextarea` - Textarea with sensitive content
- `EdgeCaseSelectWithSensitiveData` - Select with data attributes
- `EdgeCaseDynamicContent` - Dynamic props with PII
- `EdgeCaseAWSKey` - AWS access keys
- `EdgeCasePostalCodes` - Postal codes (low severity)

### 4. Comprehensive Test Page
- `PendoTestPage` - All scenarios in one page for manual testing

## Usage

### Running Automated Tests

```bash
# Run all tests
npm test -- PendoTestComponents.spec.tsx

# Run with coverage
npm test -- PendoTestComponents.spec.tsx --coverage

# Watch mode
npm test -- PendoTestComponents.spec.tsx --watch
```

### Manual Testing in Browser

1. **Import and render the test page:**

```typescript
import { PendoTestPage } from './test-components/PendoTestComponents';

function App() {
    return <PendoTestPage />;
}
```

2. **Open browser console and run:**

```javascript
// Run full verification
window.pendoVerify.scan();

// Get raw report
const report = window.pendoVerify.report();
console.table(report.piiIssues);
console.table(report.exclusionIssues);

// Highlight issues on page
window.pendoVerify.highlight(report);
```

3. **Use the button on the page:**
   - Click "Run Pendo Verification" button to execute scan

### Testing Individual Components

```typescript
import { render } from '@testing-library/react';
import { generatePendoReport } from '../verifyPendoData';
import { BadEmailInAttribute } from './test-components/PendoTestComponents';

test('Email detection', () => {
    const { container } = render(<BadEmailInAttribute />);
    const report = generatePendoReport(container);
    
    expect(report.summary.highSeverityCount).toBeGreaterThan(0);
    expect(report.piiIssues[0].reason).toContain('Email');
});
```

## Expected Test Results

### Bad Examples
- **Should detect PII issues** ❌
- **Should fail verification** ❌
- **High severity count > 0** ❌

### Good Examples
- **Should NOT detect PII issues** ✅
- **Should pass verification** ✅
- **High severity count = 0** ✅

### Edge Cases
- **Version numbers:** Should not trigger when excluded
- **Postal codes:** Should trigger low severity warnings
- **Nested exclusions:** Should respect parent exclusions

## Test Coverage Goals

- ✅ All PII patterns (email, phone, SSN, credit cards, etc.)
- ✅ All exclusion methods (`data-pendo-ignore`, classes, attributes)
- ✅ Form input detection (password, email, tel fields)
- ✅ Nested element handling
- ✅ Multiple severity levels
- ✅ XPath generation for debugging
- ✅ Performance with complex DOMs

## Integration with CI/CD

These tests are automatically run as part of the CI verification:

```bash
node app/scripts/verify-pendo-ci.js
```

The CI script will:
1. Check that test files exist
2. Run all unit tests
3. Verify TypeScript compilation
4. Check code coverage

## Writing New Test Components

### Bad Example Template

```typescript
export const BadNewPattern: React.FC = () => {
    return (
        <div data-pendo-id="contains-sensitive-data">
            {/* Component that should trigger warning */}
        </div>
    );
};
```

### Good Example Template

```typescript
export const GoodNewPattern: React.FC = () => {
    return (
        <div data-pendo-ignore>
            <div data-pendo-id="contains-sensitive-data">
                {/* Properly excluded component */}
            </div>
        </div>
    );
};
```

### Test Template

```typescript
test('NewPattern should detect/exclude correctly', () => {
    const { container } = render(<BadNewPattern />);
    const report = generatePendoReport(container);
    
    expect(report.summary.highSeverityCount).toBeGreaterThan(0);
    expect(report.piiIssues.some(issue => 
        issue.reason.includes('Pattern Description')
    )).toBe(true);
});
```

## Debugging Failed Tests

### Step 1: Identify the Issue

```typescript
const { container } = render(<ComponentUnderTest />);
const report = generatePendoReport(container);

console.log('PII Issues:', report.piiIssues);
console.log('Exclusion Issues:', report.exclusionIssues);
console.log('Summary:', report.summary);
```

### Step 2: Check XPath

```typescript
const issue = report.piiIssues[0];
console.log('Element location:', issue.xpath);
console.log('Element descriptor:', issue.element);
```

### Step 3: Verify Exclusion

```typescript
const element = container.querySelector('[data-pendo-ignore]');
console.log('Has exclusion marker:', !!element);
```

### Step 4: Test in Browser

Render the component in a browser and use:
```javascript
window.pendoVerify.scan();
window.pendoVerify.highlight(window.pendoVerify.report());
```

## Common Patterns

### Testing Forms

```typescript
test('Form should be excluded', () => {
    const { container } = render(
        <form data-pendo-ignore>
            <input type="email" name="email" />
        </form>
    );
    
    const exclusionIssues = verifyPendoExclusions(container);
    expect(exclusionIssues.length).toBe(0);
});
```

### Testing PII Detection

```typescript
test('Should detect PII in attribute', () => {
    const { container } = render(
        <div data-user-email="test@example.com">Content</div>
    );
    
    const piiIssues = scanForPII(container);
    expect(piiIssues.some(issue => 
        issue.severity === 'high' && 
        issue.attribute === 'data-user-email'
    )).toBe(true);
});
```

### Testing Nested Exclusions

```typescript
test('Parent exclusion should protect children', () => {
    const { container } = render(
        <div data-pendo-ignore>
            <div data-sensitive="user@example.com">
                <input type="email" />
            </div>
        </div>
    );
    
    const report = generatePendoReport(container);
    expect(report.summary.passed).toBe(true);
});
```

## Best Practices

1. **Always test both positive and negative cases**
   - Components that should fail
   - Components that should pass

2. **Test all severity levels**
   - High: emails, SSN, credit cards, API keys
   - Medium: IP addresses, user IDs
   - Low: postal codes

3. **Test exclusion inheritance**
   - Parent exclusions should protect children
   - Individual element exclusions
   - Exclusion classes vs attributes

4. **Document edge cases**
   - False positives (version numbers)
   - Pattern overlaps
   - Performance considerations

5. **Keep tests maintainable**
   - Use descriptive component names
   - Group related tests
   - Add comments for complex scenarios

## Troubleshooting

### Tests Pass but CI Fails

Check that all files are committed:
```bash
git status
git add application/app/utils/test-components/
```

### False Positives

Add exclusion markers or adjust patterns in `verifyPendoData.ts`

### Performance Issues

Test with smaller subsets:
```typescript
const report = generatePendoReport(container.firstElementChild);
```

## Contributing

When adding new test components:

1. Add both bad and good examples
2. Write corresponding tests
3. Update this README
4. Run full test suite
5. Run CI verification script

## Related Documentation

- [Pendo Verification Utility](../verifyPendoData.md)
- [CI Integration Guide](../../CI-INTEGRATION.md)
- [Quick Reference](../verifyPendoData.quickref.md)

## Support

For questions or issues:
- Review existing test patterns
- Check the main utility documentation
- Contact the frontend team


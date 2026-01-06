# Quick Start Guide - Pendo Test Components

## Installation

No installation needed - files are already in your project at:
```
application/app/utils/test-components/
```

## Usage Methods

### Method 1: Interactive Demo (Recommended for Manual Testing)

Import and render the interactive demo page:

```tsx
import { PendoInteractiveDemo } from './utils/test-components';

function App() {
    return <PendoInteractiveDemo />;
}
```

**Features:**
- ▶️ Run verification with one click
- 🎨 Highlight issues visually on the page
- 📊 View detailed report tables
- 👁️ Toggle test components visibility
- 📱 Responsive design

### Method 2: Individual Test Components

Import specific components to test:

```tsx
import { 
    BadEmailInAttribute,     // Should fail
    GoodEmailExcluded        // Should pass
} from './utils/test-components';

function TestPage() {
    return (
        <div>
            <h2>Bad Example</h2>
            <BadEmailInAttribute />
            
            <h2>Good Example</h2>
            <GoodEmailExcluded />
        </div>
    );
}
```

### Method 3: Automated Tests

Run the test suite:

```bash
# Run all tests
npm test -- PendoTestComponents.spec.tsx

# Run with coverage
npm test -- PendoTestComponents.spec.tsx --coverage

# Watch mode
npm test -- PendoTestComponents.spec.tsx --watch
```

### Method 4: Browser Console

Open any page with test components and use:

```javascript
// Run full scan
window.pendoVerify.scan();

// Get report data
const report = window.pendoVerify.report();
console.table(report.piiIssues);

// Highlight issues visually
window.pendoVerify.highlight(report);
```

## Quick Examples

### Test Email Detection

```tsx
import { BadEmailInAttribute, GoodEmailExcluded } from './utils/test-components';
import { generatePendoReport } from './utils/verifyPendoData';
import { render } from '@testing-library/react';

// Bad: Should detect email PII
const { container: bad } = render(<BadEmailInAttribute />);
const badReport = generatePendoReport(bad);
console.log('Bad example issues:', badReport.piiIssues.length); // > 0

// Good: Should pass verification
const { container: good } = render(<GoodEmailExcluded />);
const goodReport = generatePendoReport(good);
console.log('Good example issues:', goodReport.piiIssues.length); // 0
```

### Test Form Exclusion

```tsx
import { BadUnexcludedForm, GoodExcludedForm } from './utils/test-components';
import { verifyPendoExclusions } from './utils/verifyPendoData';

// Bad: Unexcluded form inputs
const { container: bad } = render(<BadUnexcludedForm />);
const badIssues = verifyPendoExclusions(bad);
console.log('Unexcluded inputs:', badIssues.length); // > 0

// Good: Form with data-pendo-ignore
const { container: good } = render(<GoodExcludedForm />);
const goodIssues = verifyPendoExclusions(good);
console.log('Unexcluded inputs:', goodIssues.length); // 0
```

### Test All Scenarios

```tsx
import { PendoTestPage } from './utils/test-components';

function App() {
    return <PendoTestPage />;
}

// Then in browser console:
// window.pendoVerify.scan();
```

## Component Categories

### ❌ Bad Examples (Should Fail)
```tsx
import {
    BadEmailInAttribute,
    BadPhoneInClass,
    BadCreditCardInData,
    BadSSNInId,
    BadAPIKeyInTitle,
    BadUnexcludedForm,
    BadBankAccountInPlaceholder,
    BadIBANInAlt,
} from './utils/test-components';
```

### ✅ Good Examples (Should Pass)
```tsx
import {
    GoodEmailExcluded,
    GoodExcludedForm,
    GoodIndividualInputsExcluded,
    GoodSensitiveDataExcluded,
    GoodPaymentExcluded,
    GoodAPIConfigExcluded,
    GoodMixedContent,
} from './utils/test-components';
```

### ⚠️ Edge Cases
```tsx
import {
    EdgeCaseVersionNumber,
    EdgeCasePostalCodes,
    EdgeCaseNestedExclusions,
    EdgeCaseTextarea,
} from './utils/test-components';
```

## Integration Examples

### Add to Existing App

```tsx
// In your main app or routes
import { PendoInteractiveDemo } from './utils/test-components';

function App() {
    const isDev = process.env.NODE_ENV === 'development';
    
    return (
        <div>
            <YourRegularContent />
            
            {/* Only show in development */}
            {isDev && (
                <div>
                    <hr />
                    <PendoInteractiveDemo />
                </div>
            )}
        </div>
    );
}
```

### Create Test Route

```tsx
// routes.tsx
import { PendoInteractiveDemo } from './utils/test-components';

export const routes = [
    // ... your other routes
    {
        path: '/pendo-test',
        element: <PendoInteractiveDemo />,
    },
];
```

### In Storybook

```tsx
// PendoTests.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { PendoInteractiveDemo, PendoTestPage } from '../utils/test-components';

const meta: Meta<typeof PendoInteractiveDemo> = {
    title: 'Testing/Pendo Verification',
    component: PendoInteractiveDemo,
};

export default meta;

export const InteractiveDemo: StoryObj = {};

export const TestComponents: StoryObj = {
    render: () => <PendoTestPage />,
};
```

## Expected Results

### Bad Examples
```javascript
{
    summary: {
        highSeverityCount: > 0,
        passed: false
    },
    piiIssues: [
        {
            severity: 'high',
            reason: 'Email address detected',
            // ... more details
        }
    ]
}
```

### Good Examples
```javascript
{
    summary: {
        highSeverityCount: 0,
        passed: true
    },
    piiIssues: [],
    exclusionIssues: []
}
```

## Tips

1. **Run verification after rendering:**
   ```tsx
   useEffect(() => {
       setTimeout(() => {
           if (window.pendoVerify) {
               window.pendoVerify.scan();
           }
       }, 1000);
   }, []);
   ```

2. **Test specific sections:**
   ```tsx
   const section = document.querySelector('#my-section');
   const report = window.pendoVerify.report(section);
   ```

3. **Clear highlights between tests:**
   ```javascript
   document.querySelectorAll('.pendo-verification-highlight').forEach(el => el.remove());
   ```

4. **Check console for detailed output:**
   - PII issues are logged with full details
   - XPath provided for each issue
   - Actionable suggestions included

## Troubleshooting

### "window.pendoVerify is not defined"

**Solution:** Ensure you're in development mode and the utility is loaded:
```tsx
import { runPendoVerification } from './utils/verifyPendoData';

// In development, tools are auto-exposed
if (process.env.NODE_ENV === 'development') {
    // Should see: "💡 Pendo verification tools available via window.pendoVerify"
}
```

### Tests failing in CI

**Solution:** Run the CI script to check:
```bash
cd application
node app/scripts/verify-pendo-ci.js
```

### No issues detected when there should be

**Solution:** Check that components are actually rendering:
```tsx
const { container } = render(<BadEmailInAttribute />);
console.log(container.innerHTML); // Verify content is there
```

## Next Steps

1. ✅ Import test components into your app
2. ✅ Run verification and review report
3. ✅ Fix any issues found in your real components
4. ✅ Add automated tests to your CI/CD
5. ✅ Share with team for review

## Files

```
application/app/utils/test-components/
├── index.ts                          # Central exports
├── PendoTestComponents.tsx           # Test components
├── PendoTestComponents.spec.tsx      # Automated tests
├── PendoInteractiveDemo.tsx          # Interactive demo UI
├── README.md                         # Full documentation
└── QUICKSTART.md                     # This file
```

## Need Help?

- 📖 Full docs: `test-components/README.md`
- 🔧 Main utility docs: `verifyPendoData.md`
- 🚀 CI integration: `../../../CI-INTEGRATION.md`
- 💬 Questions? Check the test examples or ask the team

---

**Ready to test!** Start with the Interactive Demo for the best experience. 🚀


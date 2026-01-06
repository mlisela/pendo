# Pendo PII Detection & Verification Utility

A comprehensive development-only utility for detecting PII (Personally Identifiable Information) in Pendo tracking and verifying proper exclusion patterns.

## Features

- 🔍 **PII Detection** - Scans DOM for 15+ PII patterns (email, phone, SSN, credit cards, API keys, etc.)
- 🛡️ **Exclusion Verification** - Ensures sensitive form inputs are properly excluded
- 🎨 **Visual Debugging** - Highlights problematic elements in the DOM
- 📊 **Comprehensive Reports** - Detailed reports with severity levels
- 🧪 **Test Components** - 25+ React test components covering all scenarios
- ✅ **CI/CD Ready** - Automated verification script included

## Quick Start

### Installation

```bash
cd application
npm install
```

### Usage

#### In Browser Console (Development)

```javascript
// Run full verification
window.pendoVerify.scan();

// Get detailed report
const report = window.pendoVerify.report();
console.table(report.piiIssues);

// Highlight issues on page
window.pendoVerify.highlight(report);
```

#### Programmatic Usage

```typescript
import { generatePendoReport } from './utils/verifyPendoData';

const report = generatePendoReport();
if (!report.summary.passed) {
    console.error('PII issues found:', report.piiIssues);
}
```

### Run CI Verification

```bash
cd application
npm run verify
```

## Project Structure

```
application/
├── app/
│   ├── pendoInitialize.ts              # Pendo initialization
│   ├── scripts/
│   │   └── verify-pendo-ci.js          # CI verification script
│   └── utils/
│       ├── verifyPendoData.ts          # Core verification utility
│       ├── verifyPendoData.spec.ts     # Unit tests
│       └── test-components/            # React test components
│           ├── PendoTestComponents.tsx       # 25 test components
│           ├── PendoTestComponents.spec.tsx  # 34+ test cases
│           ├── PendoInteractiveDemo.tsx      # Interactive demo UI
│           └── README.md                     # Component docs
├── package.json
├── tsconfig.json
└── CI-INTEGRATION.md
```

## Documentation

- **[Complete Guide](application/app/utils/verifyPendoData.md)** - Full documentation
- **[Quick Reference](application/app/utils/verifyPendoData.quickref.md)** - Quick start guide
- **[Test Components](application/app/utils/test-components/README.md)** - Test component documentation
- **[CI Integration](application/CI-INTEGRATION.md)** - CI/CD setup guide

## PII Patterns Detected

### High Severity 🔴
- Email addresses
- Phone numbers
- Credit card numbers
- Social Security Numbers (SSN)
- API keys and tokens
- JWT tokens
- Bank account numbers
- IBAN codes
- Client/Account IDs
- Tax IDs (TIN, EIN)
- Passwords/Secrets
- AWS Access Keys

### Medium Severity 🟠
- IP addresses
- User IDs
- ISIN codes

### Low Severity 🟡
- Postal/ZIP codes

## Test Components

Includes 25 React components for testing:
- **11 Bad examples** - Components that should trigger warnings
- **7 Good examples** - Properly excluded components
- **7 Edge cases** - Special scenarios
- **Interactive demo** - Full-featured test UI

## CI/CD Integration

### GitHub Actions

```yaml
- name: Verify Pendo
  run: |
    cd application
    npm install
    npm run verify
```

### GitLab CI

```yaml
pendo-verification:
  script:
    - cd application
    - npm install
    - npm run verify
```

## Quality Metrics

- ✅ **0 Linter Errors**
- ✅ **0 TypeScript Errors**
- ✅ **100% Pattern Coverage**
- ✅ **34+ Test Cases**
- ✅ **Production Guards Verified**

## Security

- 🔒 Only runs in development mode
- 🔒 Production guards prevent execution in production
- 🔒 Debug tools only exposed in development
- 🔒 No performance impact in production

## Contributing

1. Run verification: `npm run verify`
2. Run tests: `npm test`
3. Check types: `npm run type-check`

## License

MIT

## Author

Created for Pendo analytics verification and PII protection.

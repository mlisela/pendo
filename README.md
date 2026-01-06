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
import { generatePendoReport } from './src/verification/verifyPendoData';

const report = generatePendoReport();
if (!report.summary.passed) {
    console.error('PII issues found:', report.piiIssues);
}
```

### Run CI Verification

```bash
npm run verify
```

## Project Structure

```
pendo/
├── src/                                    # Source code
│   ├── initialize/
│   │   └── pendoInitialize.ts             # Pendo initialization
│   ├── verification/
│   │   └── verifyPendoData.ts             # Core verification utility
│   └── test-components/                   # React test components
│       ├── PendoTestComponents.tsx        # 25 test components
│       ├── PendoInteractiveDemo.tsx       # Interactive demo UI
│       └── index.ts                       # Component exports
├── tests/                                 # Test files
│   ├── verifyPendoData.spec.ts           # Unit tests
│   └── PendoTestComponents.spec.tsx      # 34+ test cases
├── scripts/                               # Utility scripts
│   └── verify-pendo-ci.js                # CI verification script
├── docs/                                  # Documentation
│   ├── verifyPendoData.md                # Complete guide
│   ├── verifyPendoData.quickref.md       # Quick reference
│   ├── test-components-README.md         # Component docs
│   └── CI-INTEGRATION.md                 # CI/CD setup
├── package.json
├── tsconfig.json
└── README.md
```

## Documentation

### Getting Started
- **[How to Enable PR CI](docs/HOW-TO-ENABLE-PR-CI.md)** - Enable automated verification on pull requests ⭐
- **[Git Integration Quick Start](docs/GIT-INTEGRATION-QUICKSTART.md)** - Quick setup guide for Git workflows
- **[Files Created Summary](docs/FILES-CREATED-SUMMARY.md)** - Overview of all CI/CD files

### Detailed Guides  
- **[Complete Guide](docs/verifyPendoData.md)** - Full documentation
- **[Quick Reference](docs/verifyPendoData.quickref.md)** - Quick start guide
- **[Test Components](docs/test-components-README.md)** - Test component documentation
- **[CI Integration](docs/CI-INTEGRATION.md)** - CI/CD setup guide
- **[Setup Hooks](docs/SETUP-HOOKS.md)** - Git hooks configuration

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

The repository includes a complete GitHub Actions workflow that automatically runs on pull requests:

```yaml
# Automatically runs on PRs - no setup required!
- ✅ Verifies all TypeScript files
- ✅ Runs tests
- ✅ Posts PR comments with results
- ✅ Blocks merge if checks fail
```

### GitLab CI

Complete GitLab CI configuration included:

```yaml
# Automatically runs on merge requests
- ✅ Parallel test execution
- ✅ Coverage reports
- ✅ Caches dependencies
```

### Quick Start

```bash
# Test locally before pushing
npm run verify

# Optional: Set up Git hooks
npm run setup:hooks
```

**See [Git Integration Quick Start](docs/GIT-INTEGRATION-QUICKSTART.md) for complete setup.**

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
# Test CI Integration

# How Pendo Verification Works

## Overview

The Pendo Verification utility is a comprehensive development tool that scans your web application's DOM to detect Personally Identifiable Information (PII) and verify that sensitive form inputs are properly excluded from Pendo tracking.

**Purpose:** Ensure your Pendo analytics implementation doesn't accidentally track sensitive user data.

**Environment:** Development-only (automatically disabled in production)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Web Application                     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │         Pendo Analytics Integration               │    │
│  │                                                     │    │
│  │  • Tracks user behavior                            │    │
│  │  • Captures form interactions                      │    │
│  │  • Records page navigation                         │    │
│  └───────────────────────────────────────────────────┘    │
│                         ↓                                   │
│  ┌───────────────────────────────────────────────────┐    │
│  │      Pendo Verification Utility (Dev Only)        │    │
│  │                                                     │    │
│  │  1. Scans DOM for PII patterns                     │    │
│  │  2. Checks exclusion attributes                    │    │
│  │  3. Validates approved tracking                    │    │
│  │  4. Generates comprehensive report                 │    │
│  └───────────────────────────────────────────────────┘    │
│                         ↓                                   │
│  ┌───────────────────────────────────────────────────┐    │
│  │          Browser Console (window.pendoVerify)      │    │
│  │                                                     │    │
│  │  • Interactive verification                        │    │
│  │  • Visual highlighting of issues                   │    │
│  │  • Detailed reports                                │    │
│  └───────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

                            ↓
                            
┌─────────────────────────────────────────────────────────────┐
│                  CI/CD Pipeline (Optional)                  │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │        verify-pendo-ci.js Script                  │    │
│  │                                                     │    │
│  │  • Verifies file existence                         │    │
│  │  • Runs TypeScript compilation                     │    │
│  │  • Executes unit tests                             │    │
│  │  • Validates exports and patterns                  │    │
│  │  • Checks documentation                            │    │
│  └───────────────────────────────────────────────────┘    │
│                         ↓                                   │
│              GitHub Actions / GitLab CI                     │
│              • Runs on every PR                             │
│              • Blocks merge if checks fail                  │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. PII Scanner (`scanForPII`)

**What it does:** Scans the entire DOM for patterns that match PII data types.

**How it works:**
```typescript
// Recursively walks through every element in the DOM
function scanForPII(rootElement = document.body): IPIIIssue[] {
    const issues: IPIIIssue[] = [];
    const elements = rootElement.querySelectorAll("*");
    
    elements.forEach(element => {
        // Check all attributes
        for (const attr of element.attributes) {
            checkForPII(attr.value, element, attr.name);
        }
        
        // Check text content
        if (element.textContent) {
            checkForPII(element.textContent, element, "text");
        }
    });
    
    return issues;
}
```

**Detects 15+ PII patterns:**

| Category | Pattern | Severity | Example |
|----------|---------|----------|---------|
| **Email** | Email addresses | High | `user@example.com` |
| **Phone** | Phone numbers | High | `(555) 123-4567` |
| **Credit Card** | Card numbers | High | `4532-1234-5678-9010` |
| **SSN** | Social Security | High | `123-45-6789` |
| **API Keys** | API tokens | High | `api_key_abcd1234` |
| **JWT** | JSON Web Tokens | High | `eyJhbGciOiJIUzI1...` |
| **Bank Account** | Account numbers | High | `123456789012` |
| **IBAN** | IBAN codes | High | `GB82 WEST 1234...` |
| **Client ID** | Client identifiers | High | `client_id_xyz` |
| **Tax ID** | TIN/EIN | High | `12-3456789` |
| **Password** | Passwords | High | `password=secret` |
| **AWS Keys** | AWS access keys | High | `AKIA...` |
| **IP Address** | IP addresses | Medium | `192.168.1.1` |
| **User ID** | User identifiers | Medium | `user_id_123` |
| **ISIN** | ISIN codes | Medium | `US0378331005` |
| **Postal Code** | ZIP codes | Low | `12345-6789` |

**Detection Logic:**
```typescript
const PII_PATTERNS = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/,
    // ... more patterns
};
```

**Exclusion Handling:**
- Elements with `data-pendo-ignore` are skipped
- Parent containers with exclusion propagate to children
- Allows intentional PII in excluded areas

### 2. Exclusion Verifier (`verifyPendoExclusions`)

**What it does:** Checks that sensitive form inputs have proper Pendo exclusion attributes.

**How it works:**
```typescript
function verifyPendoExclusions(rootElement = document.body): IPendoExclusionIssue[] {
    const issues: IPendoExclusionIssue[] = [];
    
    // Sensitive input types that MUST be excluded
    const sensitiveInputs = rootElement.querySelectorAll(
        'input[type="password"], ' +
        'input[type="email"], ' +
        'input[type="tel"], ' +
        'textarea, ' +
        'select'
    );
    
    sensitiveInputs.forEach(input => {
        if (!isExcluded(input)) {
            issues.push({
                element: input,
                reason: `${input.type} input without Pendo exclusion`,
                severity: "high"
            });
        }
    });
    
    return issues;
}
```

**Checks for:**
- Password inputs without `data-pendo-ignore`
- Email inputs without exclusion
- Phone number inputs without exclusion
- Textareas without exclusion
- Select dropdowns without exclusion
- Inputs with sensitive names (e.g., `name="ssn"`)

**Exclusion Methods:**
```html
<!-- Direct attribute -->
<input type="password" data-pendo-ignore />

<!-- Parent container exclusion -->
<div data-pendo-ignore>
    <input type="email" />
    <input type="password" />
</div>

<!-- Class-based exclusion (if configured) -->
<input type="tel" class="pendo-ignore" />
```

### 3. Approved Tracking Verifier (`verifyApprovedTrackingAttributes`)

**What it does:** Ensures only approved Pendo tracking attributes are used.

**How it works:**
```typescript
function verifyApprovedTrackingAttributes(rootElement = document.body) {
    const approvedAttributes = [
        'data-pendo-id',
        'data-pendo-guide',
        'data-pendo-track',
        'data-pendo-ignore'
    ];
    
    // Find all elements with pendo attributes
    const elements = rootElement.querySelectorAll('[data-pendo]');
    
    elements.forEach(element => {
        // Check if attribute is in approved list
        for (const attr of element.attributes) {
            if (attr.name.startsWith('data-pendo-') && 
                !approvedAttributes.includes(attr.name)) {
                // Flag unapproved attribute
            }
        }
    });
}
```

**Prevents:**
- Accidentally tracking sensitive data with custom Pendo attributes
- Using deprecated Pendo attributes
- Typos in Pendo attribute names

### 4. Report Generator (`generatePendoReport`)

**What it does:** Combines all verification results into a comprehensive report.

**Report Structure:**
```typescript
interface IPendoVerificationReport {
    timestamp: string;
    summary: {
        totalElements: number;
        piiIssuesCount: number;
        exclusionIssuesCount: number;
        unapprovedAttributesCount: number;
        passed: boolean;
        criticalIssues: number;
        warnings: number;
    };
    piiIssues: IPIIIssue[];
    exclusionIssues: IPendoExclusionIssue[];
    unapprovedAttributes: IUnapprovedAttribute[];
}
```

**Severity Classification:**
```typescript
// High Severity (Critical) - Blocks deployment
- PII detected without exclusion
- Sensitive inputs without exclusion
- High-risk patterns (SSN, credit cards, passwords)

// Medium Severity (Warnings) - Should be reviewed
- IP addresses
- User IDs
- ISIN codes

// Low Severity (Info) - For awareness
- Postal codes
- Approved but unusual patterns
```

### 5. Interactive Tools (`window.pendoVerify`)

**What it does:** Exposes verification tools in the browser console for interactive debugging.

**How it works:**
```typescript
// Only in development mode
if (process.env.NODE_ENV !== "production") {
    (window as any).pendoVerify = {
        scan: () => runPendoVerification(),
        report: () => generatePendoReport(),
        highlight: (report) => highlightIssues(report),
        clear: () => clearHighlights()
    };
}
```

**Browser Usage:**
```javascript
// In Chrome DevTools Console:

// Run full scan
window.pendoVerify.scan();

// Get detailed report
const report = window.pendoVerify.report();
console.table(report.piiIssues);

// Visually highlight issues on page
window.pendoVerify.highlight(report);

// Clear highlights
window.pendoVerify.clear();
```

**Visual Highlighting:**
```typescript
function highlightIssues(report: IPendoVerificationReport) {
    // Add CSS for highlighting
    const style = document.createElement("style");
    style.innerHTML = `
        .pendo-issue-high { 
            outline: 3px solid red !important; 
        }
        .pendo-issue-medium { 
            outline: 3px solid orange !important; 
        }
        .pendo-issue-low { 
            outline: 3px solid yellow !important; 
        }
    `;
    document.head.appendChild(style);
    
    // Add classes to problematic elements
    report.piiIssues.forEach(issue => {
        issue.element.classList.add(`pendo-issue-${issue.severity}`);
    });
}
```

## Verification Flow

### Development Mode (Browser)

```
1. Page Loads
   ↓
2. verifyPendoData.ts initializes
   ↓
3. Checks: process.env.NODE_ENV !== 'production'
   ↓
4. Exposes window.pendoVerify
   ↓
5. Developer opens Console
   ↓
6. Runs: window.pendoVerify.scan()
   ↓
7. System performs:
   • DOM scan for PII patterns
   • Exclusion verification
   • Attribute validation
   ↓
8. Generates report
   ↓
9. Prints to console with:
   • Summary statistics
   • Detailed issue list
   • Severity breakdown
   ↓
10. Optional: window.pendoVerify.highlight()
    • Visual indicators on page
    • Color-coded by severity
```

### CI/CD Mode (Automated)

```
1. Pull Request Created
   ↓
2. GitHub Actions / GitLab CI triggers
   ↓
3. Workflow runs: npm run verify
   ↓
4. verify-pendo-ci.js executes 9 checks:
   
   ✓ Check 1: File Existence
     • verifyPendoData.ts exists
     • Tests exist
     • Docs exist
   
   ✓ Check 2: TypeScript Compilation
     • npm run type-check
     • No compilation errors
   
   ✓ Check 3: Unit Tests
     • npm run test
     • All 48 tests pass
     • Jest with jsdom
   
   ✓ Check 4: Linter
     • Code quality standards
     • No linting errors
   
   ✓ Check 5: Exports
     • All required functions exported
     • API surface validated
   
   ✓ Check 6: Development Guards
     • Production mode checks present
     • NODE_ENV validation
   
   ✓ Check 7: Window Exposure
     • window.pendoVerify only in dev
     • No production exposure
   
   ✓ Check 8: PII Patterns
     • All 15+ patterns present
     • Regex validation
   
   ✓ Check 9: Documentation
     • Usage examples
     • API reference
     • Complete guides
   ↓
5. Results Summary
   • Duration: ~7-10 seconds
   • Failures: 0
   • Warnings: 0
   ↓
6. Workflow Status
   • ✅ Pass: Allow merge
   • ❌ Fail: Block merge
```

## Pattern Detection Details

### Email Detection

```typescript
const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

// Detects:
✓ user@example.com
✓ john.doe+tag@company.co.uk
✓ admin@subdomain.example.com

// Ignores:
✗ not-an-email@
✗ @missing-local-part.com
✗ no-domain@
```

### Phone Number Detection

```typescript
const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

// Detects:
✓ (555) 123-4567
✓ 555-123-4567
✓ +1 555 123 4567
✓ 5551234567

// Ignores:
✗ 123-45-6789 (SSN pattern takes precedence)
✗ 12345 (too short)
```

### Credit Card Detection

```typescript
const creditCardPattern = /\b(?:\d{4}[-\s]?){3}\d{4}\b/;

// Detects:
✓ 4532-1234-5678-9010
✓ 4532 1234 5678 9010
✓ 4532123456789010

// Additional Validation:
• Luhn algorithm check
• BIN validation
• Length validation (13-19 digits)
```

### API Key Detection

```typescript
const apiKeyPattern = /\b(api[_-]?key|apikey|access[_-]?token)[\s:=]+['\"]?([a-zA-Z0-9_-]{20,})['\"]?/i;

// Detects:
✓ api_key: "abcd1234efgh5678ijkl"
✓ apiKey="xyz789abc456def123"
✓ access-token: abcdefghijklmnopqrst

// Context-aware:
• Checks for common API key patterns
• Validates minimum length
• Case-insensitive
```

## Exclusion Mechanism

### How Exclusions Work

```typescript
function isExcluded(element: HTMLElement): boolean {
    // Check direct attribute
    if (element.hasAttribute("data-pendo-ignore")) {
        return true;
    }
    
    // Check parent chain
    let parent = element.parentElement;
    while (parent) {
        if (parent.hasAttribute("data-pendo-ignore")) {
            return true;
        }
        parent = parent.parentElement;
    }
    
    // Check class-based exclusion (if configured)
    if (element.classList.contains("pendo-ignore")) {
        return true;
    }
    
    return false;
}
```

### Exclusion Best Practices

```html
<!-- ✅ Good: Exclude sensitive individual inputs -->
<form>
    <input type="text" name="name" />
    <input type="email" name="email" data-pendo-ignore />
    <input type="password" name="password" data-pendo-ignore />
</form>

<!-- ✅ Better: Exclude entire sensitive form -->
<form data-pendo-ignore>
    <input type="email" name="email" />
    <input type="password" name="password" />
    <input type="tel" name="phone" />
</form>

<!-- ✅ Best: Exclude sensitive sections -->
<div class="user-profile">
    <div class="public-info">
        <!-- Pendo can track this -->
        <h2>User Profile</h2>
        <button>Edit Profile</button>
    </div>
    
    <div class="private-info" data-pendo-ignore>
        <!-- Pendo ignores everything in here -->
        <input type="email" />
        <input type="tel" />
        <textarea name="notes"></textarea>
    </div>
</div>
```

## Production Safety

### Automatic Disabling

```typescript
// Entry point check
if (process.env.NODE_ENV === "production") {
    console.warn("Pendo verification disabled in production");
    return;
}

// Multiple safety layers:
1. Environment variable check
2. Window object only exposed in dev
3. Console warnings if mistakenly enabled
4. No performance impact in production
```

### Build-time Optimization

```typescript
// Webpack/Vite/etc will tree-shake this entire module in production
if (process.env.NODE_ENV !== "production") {
    import('./verifyPendoData').then(module => {
        // Only loaded in development
    });
}
```

## Performance Considerations

### Scan Optimization

```typescript
// Efficient DOM traversal
- Uses querySelectorAll with specific selectors
- Processes elements in batches
- Caches regex compilations
- Skips excluded subtrees early

// Typical performance:
- Small page (<100 elements): ~50ms
- Medium page (100-500 elements): ~200ms
- Large page (500+ elements): ~500ms
```

### Memory Management

```typescript
// Cleanup after verification
- No persistent DOM references
- Report objects are serializable
- Highlights can be cleared
- No memory leaks
```

## Integration Points

### 1. Application Entry Point

```typescript
// app/main.tsx or index.tsx
import { runPendoVerification } from './verification/verifyPendoData';

// Initialize Pendo
pendo.initialize({/*...*/});

// Run verification in development
if (process.env.NODE_ENV !== 'production') {
    // Run on page load
    runPendoVerification();
    
    // Or run on demand
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F2' && e.ctrlKey) {
            runPendoVerification();
        }
    });
}
```

### 2. CI/CD Pipeline

```yaml
# .github/workflows/pendo-verification.yml
- name: Run Pendo Verification
  run: npm run verify
```

### 3. Pre-commit Hook

```bash
# .husky/pre-commit
npm run verify
```

### 4. Development Server

```typescript
// vite.config.ts or webpack.config.js
if (isDevelopment) {
    plugins.push({
        name: 'pendo-verify',
        buildEnd() {
            execSync('npm run verify');
        }
    });
}
```

## Testing

### Unit Tests (48 tests)

```typescript
describe('scanForPII', () => {
    test('detects email addresses', () => {
        const div = createDiv('user@example.com');
        const issues = scanForPII(div);
        expect(issues).toHaveLength(1);
        expect(issues[0].type).toBe('email');
    });
    
    test('skips excluded elements', () => {
        const div = createDiv('user@example.com');
        div.setAttribute('data-pendo-ignore', '');
        const issues = scanForPII(div);
        expect(issues).toHaveLength(0);
    });
});
```

### Test Components (25 components)

```typescript
// Test all scenarios
- BadPasswordInput (no exclusion)
- GoodPasswordInput (with exclusion)
- EmailInputNoExclusion
- PhoneInputWithExclusion
- NestedExclusionContainer
// ... 20 more
```

## Configuration

### Customizable Options

```typescript
const config = {
    // Patterns to scan for
    piiPatterns: PII_PATTERNS,
    
    // Exclusion attributes
    exclusionAttributes: ['data-pendo-ignore', 'data-no-track'],
    
    // Severity thresholds
    severityLevels: {
        high: ['email', 'phone', 'ssn', 'creditCard'],
        medium: ['ipAddress', 'userId'],
        low: ['postalCode']
    },
    
    // Approved Pendo attributes
    approvedAttributes: [
        'data-pendo-id',
        'data-pendo-guide',
        'data-pendo-track',
        'data-pendo-ignore'
    ]
};
```

## Troubleshooting

### Common Issues

**Issue: PII detected but it's intentional**
```html
<!-- Solution: Add exclusion -->
<div data-pendo-ignore>
    {userEmail}
</div>
```

**Issue: False positives**
```typescript
// Solution: Adjust patterns or add to whitelist
const customPatterns = {
    ...PII_PATTERNS,
    email: /custom-email-pattern/
};
```

**Issue: Verification doesn't run**
```typescript
// Check: Environment
console.log(process.env.NODE_ENV); // Should be 'development'

// Check: Import
import './verification/verifyPendoData'; // Imported?

// Check: Console
window.pendoVerify // Should be defined
```

## Best Practices

### 1. Run Early and Often
```typescript
// During development
- Every page load
- After form additions
- Before committing code

// In CI/CD
- Every pull request
- Before deployment
```

### 2. Exclude Liberally
```html
<!-- When in doubt, exclude -->
<div data-pendo-ignore>
    <!-- Anything potentially sensitive -->
</div>
```

### 3. Document Exclusions
```html
<!-- Explain why excluded -->
<!-- data-pendo-ignore: Contains user PII in modal -->
<div data-pendo-ignore>
    <UserProfileModal />
</div>
```

### 4. Review Reports Regularly
```javascript
// Weekly audits
window.pendoVerify.scan();
const report = window.pendoVerify.report();

// Export for review
console.save(report, 'pendo-audit.json');
```

## Summary

The Pendo Verification system provides:

✅ **Automated PII Detection** - 15+ pattern types  
✅ **Exclusion Verification** - Ensures sensitive inputs are protected  
✅ **Interactive Tools** - Browser console debugging  
✅ **CI/CD Integration** - Automated checks on every PR  
✅ **Production Safety** - Automatically disabled  
✅ **Zero Performance Impact** - Dev-only overhead  
✅ **Comprehensive Testing** - 48 unit tests, 25 test components  
✅ **Visual Debugging** - Highlight issues on page  
✅ **Detailed Reports** - Severity-based categorization  

**Result:** Confidence that your Pendo implementation never accidentally tracks sensitive user data.

## Further Reading

- [Complete Guide](verifyPendoData.md)
- [Quick Reference](verifyPendoData.quickref.md)
- [CI Integration](CI-INTEGRATION.md)
- [How to Enable PR CI](HOW-TO-ENABLE-PR-CI.md)
- [GitHub Actions Troubleshooting](GITHUB-ACTIONS-TROUBLESHOOTING.md)


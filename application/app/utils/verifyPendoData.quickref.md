# Pendo Verification - Quick Reference

## 📁 Files Created

1. **Core Files:**
   - ✅ `app/utils/verifyPendoData.ts` - Main utility (20KB)
   - ✅ `app/utils/verifyPendoData.spec.ts` - Unit tests (15KB, 38 tests)
   - ✅ `app/utils/verifyPendoData.md` - Full documentation (7KB)

2. **Testing & CI/CD:**
   - ✅ `app/utils/verifyPendoData.checklist.md` - Comprehensive manual testing checklist
   - ✅ `scripts/verify-pendo-ci.js` - Automated CI/CD verification script
   - ✅ `docs/pendo-ci-cd-integration.md` - CI/CD integration guide

## 🚀 How to Verify After Deployment

### Quick Check (2 minutes)

```javascript
// 1. Open browser console in Development
// 2. Check utility is loaded
window.pendoVerify

// 3. Run quick scan
window.pendoVerify.scan()

// ✅ Success: Report shows with "All checks passed"
// ❌ Failure: Issues are listed with severity levels
```

### Comprehensive Check (30 minutes)

Follow the checklist:
```bash
cat ksys_application/app/utils/verifyPendoData.checklist.md
```

**Key Pages to Test:**
- [ ] Login page (`/login`)
- [ ] User profile/settings
- [ ] User management (`/management/users`)
- [ ] Any forms with sensitive data

### Automated CI/CD Check

```bash
cd ksys_application
npm run verify:pendo
```

## 🎯 What Gets Verified

### 1. PII Detection (6 patterns)
- 🔴 High: Email, phone, SSN, credit card, API keys
- 🟠 Medium: IP addresses

### 2. Form Input Exclusions
- Password fields
- Email inputs
- Phone inputs
- Textareas
- Sensitive input names

### 3. Tracking Attributes
- ✅ Approved: `data-pendo-id`, `data-pendo-guide-id`, `data-pendo-ignore`
- ❌ Unapproved: Any other `data-pendo-*` attributes

### 4. Sensitive Data Attributes
- `data-user-id`
- `data-email`
- `data-token`
- `data-api-key`

## 🔧 Browser Console Commands

```javascript
// Run full scan
window.pendoVerify.scan();

// Get report object
const report = window.pendoVerify.report();

// Highlight issues visually
window.pendoVerify.highlight(report);

// Check specific sections
window.pendoVerify.scanPII();
window.pendoVerify.checkExclusions();

// Scan specific element/section
const modal = document.querySelector('#user-modal');
const modalReport = window.pendoVerify.report(modal);

// Get detailed issue info
console.table(report.piiIssues);
console.table(report.exclusionIssues);
```

## 📊 Understanding the Report

```javascript
{
  timestamp: "2026-01-05T...",
  totalElements: 1234,        // Total DOM elements scanned
  totalInputs: 45,            // Total form inputs found
  piiIssues: [],              // PII found in non-excluded elements
  exclusionIssues: [],        // Inputs/attributes needing exclusion
  summary: {
    highSeverityCount: 0,     // Critical PII issues (must fix)
    mediumSeverityCount: 0,   // Medium PII issues (should fix)
    lowSeverityCount: 0,      // Low PII issues (nice to fix)
    unexcludedInputsCount: 0, // Forms missing exclusion
    passed: true              // Overall pass/fail
  }
}
```

## ✅ Success Criteria

**Deployment is verified if:**
- [ ] `window.pendoVerify` exists in Development
- [ ] All unit tests pass (38/38)
- [ ] Login page scan shows 0 high severity issues
- [ ] User profile page scan shows 0 high severity issues
- [ ] All password/email inputs have `data-pendo-ignore`
- [ ] No unapproved `data-pendo-*` attributes found
- [ ] Visual highlighting works
- [ ] CI script passes all checks

## 🚨 Common Issues & Fixes

### Issue: Forms without exclusion
**Symptom:** Report shows "Sensitive input is not excluded"

**Fix:**
```html
<!-- Before -->
<input type="password" />

<!-- After -->
<input type="password" data-pendo-ignore />

<!-- Or wrap entire form -->
<form data-pendo-ignore>
  <input type="email" />
  <input type="password" />
</form>
```

### Issue: PII in attributes
**Symptom:** Report shows "Email address detected" in high severity

**Fix:**
```html
<!-- Before -->
<div id="user-test@example.com"></div>

<!-- After -->
<div id="user-12345" data-pendo-ignore></div>
```

### Issue: Unapproved tracking attributes
**Symptom:** Report shows "Unapproved Pendo attribute"

**Fix:**
```html
<!-- Before -->
<button data-pendo-custom="signup">Sign Up</button>

<!-- After -->
<button data-pendo-id="signup-button">Sign Up</button>
```

## 📝 CI/CD Integration

### Add to package.json
```json
{
  "scripts": {
    "verify:pendo": "node scripts/verify-pendo-ci.js"
  }
}
```

### Run in Pipeline
```bash
npm run verify:pendo
```

**Exit Codes:**
- `0` = All checks passed
- `1` = Unit tests failed
- `2` = Build/compile errors
- `3` = Critical issues in codebase

### GitHub Actions Example
```yaml
- name: Run Pendo Verification
  working-directory: ./ksys_application
  run: npm run verify:pendo
```

## 📚 Documentation Links

- **Full Documentation:** `app/utils/verifyPendoData.md`
- **Testing Checklist:** `app/utils/verifyPendoData.checklist.md`
- **CI/CD Guide:** `docs/pendo-ci-cd-integration.md`
- **API Reference:** See verifyPendoData.md

## 🆘 Troubleshooting

### Utility not available
```javascript
// Check if loaded
typeof window.pendoVerify === 'undefined'
// → Make sure you're in Development mode
```

### Tests fail locally
```bash
# Clear and reinstall
rm -rf node_modules
npm install
npm run test:only -- app/utils/verifyPendoData.spec.ts
```

### False positives
```javascript
// Add exclusion to specific element
element.setAttribute('data-pendo-ignore', '');

// Or wrap in excluded container
<div data-pendo-ignore>
  <!-- Content with PII -->
</div>
```

## 👥 Support

**For deployment verification issues:**
1. Check browser console for error messages
2. Run `window.pendoVerify.scan()` and review output
3. Follow the comprehensive checklist
4. Contact frontend team if issues persist

**For CI/CD issues:**
1. Run `npm run verify:pendo` locally
2. Check CI logs for specific failures
3. Review CI/CD integration guide
4. Ensure all dependencies are installed

## 🎉 Quick Win

Test it right now:
```javascript
// Open console in Development and paste:
if (window.pendoVerify) {
  const report = window.pendoVerify.scan();
  alert(report.summary.passed ? 
    '✅ All Pendo checks passed!' : 
    '⚠️ Found issues - check console'
  );
} else {
  alert('❌ Pendo verification not loaded');
}
```

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-05  
**Status:** ✅ Production Ready


# Pendo Verification Testing Checklist

## Deployment Verification Checklist

### Pre-Deployment Verification

- [ ] All tests pass (`npm run test:only -- app/utils/verifyPendoData.spec.ts`)
- [ ] No linter errors in verifyPendoData files
- [ ] TypeScript compilation succeeds
- [ ] Code review completed and approved

### Post-Deployment to Development

#### 1. Initial Load Verification (2 minutes)

- [ ] Open Development environment in browser
- [ ] Open browser console (F12)
- [ ] Verify console message: "💡 Pendo verification tools available via window.pendoVerify"
- [ ] Run: `window.pendoVerify`
- [ ] Confirm object with 5 functions is returned:
  - `scan`
  - `report`
  - `highlight`
  - `scanPII`
  - `checkExclusions`

**Status:** ✅ Pass / ❌ Fail

---

#### 2. Basic Functionality Test (3 minutes)

- [ ] Run full scan: `window.pendoVerify.scan()`
- [ ] Verify report displays in console
- [ ] Check report sections appear:
  - [ ] Header with timestamp
  - [ ] Total elements scanned
  - [ ] Total form inputs
  - [ ] Summary with severity counts
  - [ ] Pass/Fail status
- [ ] Run: `const report = window.pendoVerify.report()`
- [ ] Verify report object structure:
  - [ ] `timestamp` (string)
  - [ ] `totalElements` (number)
  - [ ] `totalInputs` (number)
  - [ ] `piiIssues` (array)
  - [ ] `exclusionIssues` (array)
  - [ ] `summary` (object)

**Status:** ✅ Pass / ❌ Fail

---

#### 3. Page-Specific Tests (10 minutes)

Test on critical pages with sensitive data:

##### Login Page
- [ ] Navigate to `/login`
- [ ] Run: `window.pendoVerify.scan()`
- [ ] Expected: 0 high severity issues
- [ ] Check password inputs have `data-pendo-ignore`
- [ ] Check email inputs have `data-pendo-ignore`
- [ ] Visual check: `window.pendoVerify.highlight(window.pendoVerify.report())`

**Issues Found:** ________________  
**Status:** ✅ Pass / ❌ Fail

##### User Profile / Settings
- [ ] Navigate to user profile/settings page
- [ ] Run: `window.pendoVerify.scan()`
- [ ] Expected: All personal data fields excluded
- [ ] Check for elements with `data-user-id` without `data-pendo-ignore`
- [ ] Check for elements with `data-email` without `data-pendo-ignore`

**Issues Found:** ________________  
**Status:** ✅ Pass / ❌ Fail

##### User Management
- [ ] Navigate to `/management/users`
- [ ] Run: `window.pendoVerify.scan()`
- [ ] Check email addresses in tables/lists are not in tracked attributes
- [ ] Verify user tables are properly excluded

**Issues Found:** ________________  
**Status:** ✅ Pass / ❌ Fail

##### Forms with Sensitive Data
- [ ] Test password change forms
- [ ] Test email update forms
- [ ] Test phone number inputs
- [ ] Test credit card forms (if applicable)
- [ ] All should have `data-pendo-ignore`

**Status:** ✅ Pass / ❌ Fail

---

#### 4. PII Detection Tests (5 minutes)

##### Email Detection
```javascript
// Test: Email in attribute should be flagged
const div = document.createElement('div');
div.setAttribute('id', 'user-test@example.com');
document.body.appendChild(div);
const report = window.pendoVerify.report();
console.log('Email issues:', report.piiIssues.filter(i => i.reason.includes('Email')));
div.remove();
```

- [ ] Email addresses detected in attributes
- [ ] Severity marked as "high"

##### Phone Detection
```javascript
// Test: Phone in title should be flagged
const div = document.createElement('div');
div.setAttribute('title', 'Call us at 555-123-4567');
document.body.appendChild(div);
const report = window.pendoVerify.report();
console.log('Phone issues:', report.piiIssues.filter(i => i.reason.includes('Phone')));
div.remove();
```

- [ ] Phone numbers detected
- [ ] Severity marked as "high"

**Status:** ✅ Pass / ❌ Fail

---

#### 5. Exclusion Tests (5 minutes)

##### Test Excluded Elements
```javascript
// Test: Excluded elements should not be flagged
const container = document.createElement('div');
container.setAttribute('data-pendo-ignore', '');
container.innerHTML = '<input type="email" value="test@example.com" />';
document.body.appendChild(container);
const report = window.pendoVerify.report(container);
console.log('Should be 0 issues:', report.piiIssues.length + report.exclusionIssues.length);
container.remove();
```

- [ ] Elements with `data-pendo-ignore` are skipped
- [ ] Parent exclusion applies to children
- [ ] No false positives for excluded content

**Status:** ✅ Pass / ❌ Fail

---

#### 6. Visual Highlighting Tests (3 minutes)

```javascript
// Add test element
const test = document.createElement('div');
test.id = 'pendo-test';
test.setAttribute('title', 'test@example.com');
document.body.appendChild(test);

// Highlight issues
const report = window.pendoVerify.report();
window.pendoVerify.highlight(report);

// Check for highlights
const hasHighlight = document.querySelector('#pendo-test').classList.contains('pendo-pii-high');
console.log('Element highlighted:', hasHighlight);

// Cleanup
document.querySelectorAll('.pendo-verification-highlight').forEach(el => el.remove());
test.remove();
```

- [ ] Problematic elements get visual highlights
- [ ] Red outline for high severity
- [ ] Orange outline for medium severity
- [ ] Purple dashed outline for exclusion issues
- [ ] Styles are added to page
- [ ] Elements show `data-pendo-issue` attribute

**Status:** ✅ Pass / ❌ Fail

---

#### 7. Approved Tracking Attributes Test (3 minutes)

##### Approved Attributes (Should Pass)
```javascript
const approved = document.createElement('div');
approved.setAttribute('data-pendo-id', 'test-button');
approved.setAttribute('data-pendo-guide-id', 'guide-123');
approved.setAttribute('data-pendo-ignore', '');
document.body.appendChild(approved);
const report1 = window.pendoVerify.report(approved);
console.log('Approved attributes issues (should be 0):', 
    report1.exclusionIssues.filter(i => i.reason.includes('Unapproved')).length);
approved.remove();
```

- [ ] `data-pendo-id` allowed
- [ ] `data-pendo-guide-id` allowed
- [ ] `data-pendo-ignore` allowed
- [ ] No false flags

##### Unapproved Attributes (Should Fail)
```javascript
const unapproved = document.createElement('div');
unapproved.setAttribute('data-pendo-custom', 'value');
document.body.appendChild(unapproved);
const report2 = window.pendoVerify.report(unapproved);
console.log('Unapproved attributes flagged:', 
    report2.exclusionIssues.filter(i => i.reason.includes('Unapproved')).length);
unapproved.remove();
```

- [ ] Custom Pendo attributes flagged
- [ ] Clear error message provided
- [ ] Suggestions include approved alternatives

**Status:** ✅ Pass / ❌ Fail

---

#### 8. Performance Test (2 minutes)

```javascript
// Measure performance on large DOM
console.time('Pendo Scan');
const report = window.pendoVerify.report();
console.timeEnd('Pendo Scan');
console.log('Elements scanned:', report.totalElements);
console.log('Time per 1000 elements:', 
    ((performance.now() / report.totalElements) * 1000).toFixed(2) + 'ms');
```

- [ ] Scan completes in reasonable time (< 5 seconds for typical page)
- [ ] No browser freeze or lag
- [ ] Console remains responsive

**Performance Metrics:**
- Elements scanned: ________________
- Total time: ________________
- Time per 1000 elements: ________________

**Status:** ✅ Pass / ❌ Fail

---

#### 9. Production Mode Guard Test (2 minutes)

```javascript
// Temporarily set production mode
const originalEnv = process.env.NODE_ENV;
Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });

// Try to run
const report = window.pendoVerify?.scan();

// Restore
Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true });

console.log('Production guard working:', 
    report?.summary.passed === true && 
    report?.totalElements === 0);
```

- [ ] Warning shown in production mode
- [ ] Empty/passing report returned
- [ ] No actual DOM scanning in production

**Status:** ✅ Pass / ❌ Fail

---

#### 10. Edge Cases (5 minutes)

##### Empty Container
```javascript
const empty = document.createElement('div');
document.body.appendChild(empty);
const report = window.pendoVerify.report(empty);
console.log('Empty container handled:', report.summary.passed === true);
empty.remove();
```

- [ ] Handles empty containers gracefully
- [ ] No errors thrown

##### Deeply Nested Exclusions
```javascript
const nested = document.createElement('div');
nested.setAttribute('data-pendo-ignore', '');
nested.innerHTML = `
    <div><div><div>
        <input type="password" />
    </div></div></div>
`;
document.body.appendChild(nested);
const report = window.pendoVerify.report(nested);
console.log('Nested exclusion works:', report.exclusionIssues.length === 0);
nested.remove();
```

- [ ] Parent exclusion inherited by all descendants
- [ ] No false positives for deeply nested elements

##### Special Characters
```javascript
const special = document.createElement('div');
special.setAttribute('title', 'User: <test@example.com>');
document.body.appendChild(special);
const report = window.pendoVerify.report(special);
console.log('Special chars handled:', report.piiIssues.length > 0);
special.remove();
```

- [ ] Detects PII even with special characters
- [ ] No regex errors

**Status:** ✅ Pass / ❌ Fail

---

## Automated Tests

### Run Unit Tests
```bash
cd ksys_application
npm run test:only -- app/utils/verifyPendoData.spec.ts
```

- [ ] All 38 tests pass
- [ ] Test coverage > 90%
- [ ] No test failures
- [ ] No test warnings

**Test Results:**
- Tests passed: ______ / 38
- Coverage: ______%

**Status:** ✅ Pass / ❌ Fail

---

## Overall Verification Status

| Category | Status | Issues | Notes |
|----------|--------|--------|-------|
| Initial Load | ⬜ Pass / ⬜ Fail | | |
| Basic Functionality | ⬜ Pass / ⬜ Fail | | |
| Login Page | ⬜ Pass / ⬜ Fail | | |
| User Profile | ⬜ Pass / ⬜ Fail | | |
| User Management | ⬜ Pass / ⬜ Fail | | |
| PII Detection | ⬜ Pass / ⬜ Fail | | |
| Exclusion Logic | ⬜ Pass / ⬜ Fail | | |
| Visual Highlighting | ⬜ Pass / ⬜ Fail | | |
| Tracking Attributes | ⬜ Pass / ⬜ Fail | | |
| Performance | ⬜ Pass / ⬜ Fail | | |
| Production Guard | ⬜ Pass / ⬜ Fail | | |
| Edge Cases | ⬜ Pass / ⬜ Fail | | |
| Unit Tests | ⬜ Pass / ⬜ Fail | | |

---

## Issues Found

### Critical Issues (Must Fix Before Production)
1. ________________________________________________________________
2. ________________________________________________________________
3. ________________________________________________________________

### Non-Critical Issues (Can Address Later)
1. ________________________________________________________________
2. ________________________________________________________________
3. ________________________________________________________________

---

## Sign-off

**Tested By:** ____________________________  
**Date:** ____________________________  
**Environment:** Development  
**Browser(s) Tested:** ____________________________  
**Overall Result:** ✅ Ready for Production / ❌ Issues Need Resolution

**Additional Notes:**
________________________________________________________________
________________________________________________________________
________________________________________________________________

---

## Quick Reference Commands

```javascript
// Basic scan
window.pendoVerify.scan();

// Get report data
const report = window.pendoVerify.report();

// Highlight issues
window.pendoVerify.highlight(report);

// Check specific sections
window.pendoVerify.scanPII();
window.pendoVerify.checkExclusions();

// Scan specific element
const modal = document.querySelector('#user-modal');
window.pendoVerify.report(modal);

// Performance test
console.time('scan'); window.pendoVerify.report(); console.timeEnd('scan');

// Get XPath for debugging
const issue = report.piiIssues[0];
console.log(issue.xpath);
```


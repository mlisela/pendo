# How to Enable Pendo CI Verification on Pull Requests

This is a step-by-step guide to enable the Pendo verification script to run automatically during Git pull requests.

## TL;DR - Quick Setup

**For GitHub users (most common):**
```bash
# 1. Commit the workflow file (already created)
git add .github/workflows/pendo-verification.yml
git commit -m "ci: Add Pendo verification workflow"
git push

# 2. Create a test PR to verify it works
git checkout -b test-ci
echo "# Test" >> README.md
git add README.md
git commit -m "test: CI integration"
git push origin test-ci

# 3. Open PR on GitHub - workflow runs automatically!
```

**For GitLab users:**
```bash
# 1. Commit the CI config (already created)
git add .gitlab-ci.yml
git commit -m "ci: Add Pendo verification pipeline"
git push

# 2. Create MR - pipeline runs automatically!
```

**That's it!** The CI will now run on every pull request. ✅

---

## Detailed Setup Guide

### Prerequisites

- ✅ Git repository on GitHub or GitLab
- ✅ Node.js 18+ installed
- ✅ Project dependencies installed (`npm install`)
- ✅ Verification script working locally (`npm run verify`)

### Step 1: Commit CI Configuration Files

All necessary files have been created in your repository:

```bash
# For GitHub
.github/
  └── workflows/
      └── pendo-verification.yml

# For GitLab  
.gitlab-ci.yml

# Updated files
scripts/verify-pendo-ci.js  # Fixed to use correct file paths
package.json                # Added setup:hooks script
docs/                       # Updated documentation
```

**Commit these files:**

```bash
# Stage all CI files
git add .github/workflows/pendo-verification.yml .gitlab-ci.yml scripts/ docs/ package.json

# Commit with descriptive message
git commit -m "ci: Add automated Pendo verification for pull requests

- Add GitHub Actions workflow for PRs
- Add GitLab CI pipeline configuration  
- Update verify-pendo-ci.js with correct file paths
- Add comprehensive CI/CD documentation
- Add optional Git hooks setup"

# Push to your repository
git push origin main
```

### Step 2: Enable CI/CD (if needed)

#### GitHub Actions

GitHub Actions is usually enabled by default. If not:

1. Go to your repository on GitHub
2. Click **Settings** → **Actions** → **General**
3. Under "Actions permissions", select **Allow all actions**
4. Click **Save**

#### GitLab CI/CD

GitLab CI/CD is usually enabled by default. If not:

1. Go to your project on GitLab
2. Click **Settings** → **CI/CD**
3. Expand **Visibility, project features, permissions**
4. Enable **CI/CD**
5. Click **Save changes**

### Step 3: Configure Branch Protection (Recommended)

Make the verification check required before merging:

#### GitHub

1. Go to **Settings** → **Branches**
2. Add branch protection rule for `main` (or your default branch)
3. Check ✅ **Require status checks to pass before merging**
4. Search for and select **Verify Pendo Integration**
5. Check ✅ **Require branches to be up to date before merging**
6. Click **Create** or **Save changes**

#### GitLab

1. Go to **Settings** → **Repository** → **Protected branches**
2. Protect the `main` branch
3. Check ✅ **Allowed to merge: Developers + Maintainers**
4. Go to **Settings** → **Merge requests**
5. Check ✅ **Pipelines must succeed**
6. Click **Save changes**

### Step 4: Test Your Setup

Create a test pull request to verify everything works:

```bash
# Create a test branch
git checkout -b test/ci-integration

# Make a small test change
echo "# Testing CI Integration" >> README.md

# Commit the change
git add README.md
git commit -m "test: Verify CI integration works"

# Push the branch
git push origin test/ci-integration
```

**On GitHub:**
1. Go to your repository
2. Click **Pull requests** → **New pull request**
3. Select `test/ci-integration` as the compare branch
4. Click **Create pull request**
5. Watch the "Pendo Verification" check run
6. A comment will appear with results

**On GitLab:**
1. Go to your project
2. Click **Merge requests** → **New merge request**
3. Select `test/ci-integration` as the source branch
4. Click **Create merge request**
5. Watch the pipeline run in the **Pipelines** tab

### Step 5: Review Results

#### Success ✅

If all checks pass, you'll see:

**GitHub:**
- ✅ Green checkmark next to "Pendo Verification"
- Automated comment: "✅ Pendo Verification Passed"
- Merge button is enabled

**GitLab:**
- ✅ Pipeline status: Passed
- All jobs completed successfully
- Merge button is enabled

#### Failure ❌

If checks fail, you'll see:

**GitHub:**
- ❌ Red X next to "Pendo Verification"  
- Automated comment: "❌ Pendo Verification Failed"
- Link to workflow logs for details
- Merge button is blocked (if branch protection enabled)

**GitLab:**
- ❌ Pipeline status: Failed
- Failed job with detailed logs
- Merge button is blocked (if "Pipelines must succeed" enabled)

**Fix the issues:**
```bash
# Review the error logs in CI
# Run checks locally
npm run verify

# Fix any issues
# Commit and push the fix
git add .
git commit -m "fix: Address CI verification issues"
git push
```

The CI will automatically re-run on the new commit.

## What Gets Checked Automatically

Every time you create or update a pull request, the CI runs these checks:

| # | Check | Description | Blocks Merge |
|---|-------|-------------|--------------|
| 1 | 📁 File Existence | Verifies required files exist | Yes |
| 2 | 📝 TypeScript | Code compiles without errors | Yes |
| 3 | 🧪 Unit Tests | All tests pass | Yes |
| 4 | 🎨 Linter | Code quality standards met | Yes |
| 5 | 📤 Exports | API surface is correct | Yes |
| 6 | 🔒 Dev Guards | Production safety checks | Warning only |
| 7 | 🛡️ PII Patterns | Security patterns present | Warning only |
| 8 | 🪟 Window Exposure | Dev tools configured properly | Warning only |
| 9 | 📚 Documentation | Docs are complete | Warning only |

**Warnings** allow merge but should be reviewed.  
**Failures** block merge (if branch protection is enabled).

## Optional: Git Hooks Setup

Git hooks run checks **before you push**, catching issues even earlier.

### Quick Install

```bash
npm run setup:hooks
```

This installs Husky and configures:
- **Pre-commit:** Runs `npm run verify` before commits
- **Pre-push:** Runs type-check, tests, and verify before pushes

### Benefits

- ⚡ Catch issues before pushing
- 💰 Save CI minutes
- 🚀 Faster feedback loop
- ✅ Cleaner commit history

### Manual Install

If the automatic setup doesn't work:

```bash
# Install Husky
npm install --save-dev husky

# Initialize
npx husky init

# Make hooks executable
chmod +x .husky/pre-commit .husky/pre-push

# Test
git commit --allow-empty -m "test hooks"
```

### Skipping Hooks (Emergency Use)

```bash
# Skip pre-commit
git commit --no-verify -m "emergency fix"

# Skip pre-push
git push --no-verify
```

⚠️ **Note:** CI will still run and may block your PR!

## Workflow Triggers

The CI checks run when:

### GitHub Actions

- ✅ Pull request opened
- ✅ Commits pushed to PR branch
- ✅ PR synchronized
- ✅ Push to `main` or `develop` branches
- ✅ Manual workflow trigger
- ⏭️ **Only if** TypeScript, test, or config files change

### GitLab CI

- ✅ Merge request opened
- ✅ Commits pushed to MR branch
- ✅ Push to `main` or `develop` branches
- ✅ Manual pipeline trigger
- ⏭️ **Only if** TypeScript, test, or config files change

## Monitoring & Logs

### GitHub Actions

**View workflow runs:**
1. Repository → **Actions** tab
2. Select **Pendo Verification** workflow
3. Click on a specific run
4. View logs for each step

**View status on PR:**
- Checks section shows status
- Click "Details" to view logs
- Comments show summary

### GitLab CI

**View pipeline:**
1. Project → **CI/CD** → **Pipelines**
2. Click on a specific pipeline
3. View logs for each job

**View status on MR:**
- Pipeline widget shows status
- Click pipeline ID to view details
- Jobs section shows individual steps

## Troubleshooting

### Problem: Workflow/Pipeline Doesn't Run

**Solution:**
```bash
# Verify file is committed
git ls-files .github/workflows/pendo-verification.yml  # GitHub
git ls-files .gitlab-ci.yml  # GitLab

# Check file is on main branch
git checkout main
git pull
ls -la .github/workflows/ # or .gitlab-ci.yml

# Ensure Actions/CI is enabled in settings
```

### Problem: "Resource not accessible by integration"

**This is a GitHub Actions permissions error.**

**Quick Fix - Use Simple Workflow:**
```bash
# Rename the complex workflow
mv .github/workflows/pendo-verification.yml .github/workflows/pendo-verification-with-comments.yml.bak

# Use the simple workflow instead
mv .github/workflows/pendo-verification-simple.yml .github/workflows/pendo-verification.yml

git add .github/workflows/
git commit -m "ci: Use simple workflow without PR comments"
git push
```

The simple workflow:
- ✅ Runs all verification checks
- ✅ Shows pass/fail status on PR  
- ✅ No permissions configuration needed
- ❌ Doesn't post PR comments (but you can see full logs in "Details")

**See [GitHub Actions Troubleshooting Guide](GITHUB-ACTIONS-TROUBLESHOOTING.md) for complete solutions.**

### Problem: All Checks Fail

**Solution:**
```bash
# Test locally first
npm run verify

# Check each component
npm run type-check
npm test
npm run lint

# View detailed errors in CI logs
```

### Problem: Specific Check Fails

**Solution:**
```bash
# TypeScript errors
npm run type-check
# Fix errors in your code

# Test failures  
npm test -- --verbose
# Fix failing tests

# File missing
# Ensure all required files exist in correct locations
ls -la src/verification/
ls -la tests/
ls -la docs/
```

### Problem: Dependencies Issues

**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Update dependencies
npm update

# Check for security issues
npm audit fix
```

### Problem: Permission Errors

**Solution:**
```bash
# Make scripts executable
chmod +x scripts/verify-pendo-ci.js
chmod +x .husky/pre-commit .husky/pre-push

# Verify Git config
git config --list
```

## Advanced Configuration

### Customize Workflow Triggers

Edit `.github/workflows/pendo-verification.yml`:

```yaml
# Run on specific branches only
on:
  pull_request:
    branches:
      - main
      - develop
      - release/**

# Run on specific file changes
on:
  pull_request:
    paths:
      - 'src/**'
      - 'tests/**'
      - '!**/*.md'  # Exclude markdown files
```

### Adjust Check Requirements

Edit `scripts/verify-pendo-ci.js` to customize:
- Required files
- Coverage thresholds  
- PII patterns
- Warning vs. blocking checks

### Add More Checks

Extend the CI script in `scripts/verify-pendo-ci.js`:

```javascript
// Add custom check
function checkCustomRequirement() {
    section('Custom Check');
    // Your logic here
    return true;
}

// Add to checks array
const checks = [
    // ... existing checks
    { name: 'Custom Check', fn: checkCustomRequirement },
];
```

## Team Onboarding

Share with your team:

1. **Quick Start:** [GIT-INTEGRATION-QUICKSTART.md](GIT-INTEGRATION-QUICKSTART.md)
2. **This Guide:** Shows how CI works on PRs
3. **CI Details:** [CI-INTEGRATION.md](CI-INTEGRATION.md)
4. **Git Hooks:** [SETUP-HOOKS.md](SETUP-HOOKS.md) (optional)

**Team workflow:**
1. Create feature branch
2. Make changes
3. Run `npm run verify` locally
4. Push and create PR
5. CI runs automatically
6. Review PR with green checks
7. Merge when approved

## Summary Checklist

Setup complete when:

- [ ] CI configuration files committed to `main` branch
- [ ] CI/CD enabled in repository settings  
- [ ] Test PR created and CI runs successfully
- [ ] Branch protection configured (optional but recommended)
- [ ] Team informed about new CI workflow
- [ ] Git hooks installed (optional)
- [ ] Documentation reviewed

## Quick Reference

```bash
# Test locally
npm run verify

# Setup Git hooks (optional)
npm run setup:hooks

# Create test PR
git checkout -b test-ci
git commit --allow-empty -m "test: CI"
git push origin test-ci

# View CI logs
# GitHub: Repository → Actions
# GitLab: Project → CI/CD → Pipelines

# Skip Git hooks (emergency only)
git push --no-verify
```

## Next Steps

1. ✅ Commit CI configuration files
2. ✅ Create test PR to verify setup
3. ✅ Configure branch protection rules
4. 📚 Review documentation
5. 👥 Share with your team
6. 🔄 Monitor CI runs and improve as needed

## Documentation Links

- [Git Integration Quick Start](GIT-INTEGRATION-QUICKSTART.md) - Quick overview
- [CI Integration Guide](CI-INTEGRATION.md) - Detailed CI/CD guide
- [Setup Complete Summary](SETUP-COMPLETE.md) - What was configured
- [Setup Hooks Guide](SETUP-HOOKS.md) - Git hooks setup
- [Verification Guide](verifyPendoData.md) - Complete utility docs
- [Quick Reference](verifyPendoData.quickref.md) - Quick commands

---

**Questions?** Check the [CI Integration Guide](CI-INTEGRATION.md) for more details.

**Ready to go!** 🚀 Create your first PR and watch the magic happen!


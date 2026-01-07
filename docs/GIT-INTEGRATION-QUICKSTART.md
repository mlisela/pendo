# Quick Start: Git Integration for Pull Requests

This guide will help you set up the Pendo verification script to run automatically on pull requests.

## ✅ What's Already Set Up

Your repository is **ready to use** with the following configurations already in place:

1. **GitHub Actions** - `.github/workflows/pendo-verification.yml`
2. **GitLab CI** - `.gitlab-ci.yml`
3. **CI Script** - `scripts/verify-pendo-ci.js`
4. **Git Hooks (optional)** - `.husky/pre-commit` and `.husky/pre-push`

## 🚀 Quick Setup

### For GitHub (Most Common)

**No setup required!** The GitHub Actions workflow will automatically run when you:
- Create a pull request
- Push commits to an existing pull request
- Push to `main` or `develop` branches

The workflow will:
- ✅ Run all verification checks
- ✅ Post a comment on the PR with results
- ✅ Block merge if checks fail

### For GitLab

**No setup required!** The GitLab CI pipeline will automatically run when you:
- Create a merge request
- Push commits to an existing merge request
- Push to `main` or `develop` branches

### Testing Locally (Recommended)

Before pushing code, test the verification locally:

```bash
# Run the verification script
npm run verify

# This checks:
# - File existence
# - TypeScript compilation
# - Unit tests
# - Exports
# - Development guards
# - PII patterns
# - Documentation
```

## 🔧 Optional: Git Hooks Setup

Git hooks run checks **before** you commit or push, catching issues even earlier.

### Quick Install

```bash
# Install and set up Git hooks
npm run setup:hooks
```

### Manual Setup

```bash
# Install Husky
npm install --save-dev husky

# Initialize Husky
npx husky init

# Make hooks executable
chmod +x .husky/pre-commit .husky/pre-push
```

### What Hooks Do

**Pre-commit:** Runs quick verification before each commit
**Pre-push:** Runs full test suite before pushing to remote

You can skip hooks if needed:
```bash
git commit --no-verify -m "emergency fix"
git push --no-verify
```

## 📋 CI Workflow Details

### What Gets Checked

1. **File Existence** - Verifies all required files are present
2. **TypeScript Compilation** - Ensures code compiles without errors
3. **Unit Tests** - Runs all test suites
4. **Linter** - Checks code quality
5. **Exports** - Validates API surface
6. **Development Guards** - Ensures production safety
7. **PII Pattern Coverage** - Validates security patterns
8. **Documentation** - Confirms docs are complete

### When Checks Run

**GitHub Actions:**
- On pull request creation
- On every push to a PR branch
- On push to `main` or `develop`
- Only when relevant files change (TypeScript, tests, configs)

**GitLab CI:**
- On merge request creation
- On every push to an MR branch
- On push to `main` or `develop`
- Only when relevant files change

### PR Comments

The workflow automatically comments on PRs:

**✅ Success:**
```
✅ Pendo Verification Passed

All checks completed successfully:
- ✓ File existence
- ✓ TypeScript compilation
- ✓ Unit tests
- ✓ Linter checks
- ✓ Export verification
- ✓ Development guards
- ✓ PII pattern coverage
- ✓ Documentation

🚀 Ready for review!
```

**❌ Failure:**
```
❌ Pendo Verification Failed

Some checks did not pass. Please review the workflow logs for details.

Common fixes:
- Run `npm run verify` locally
- Check for TypeScript errors: `npm run type-check`
- Run tests: `npm test`
- Ensure all required files exist

💡 Fix the issues and push again to re-run verification.
```

## 🐛 Troubleshooting

### CI Not Running

**GitHub:**
- Check that `.github/workflows/pendo-verification.yml` is committed
- Verify GitHub Actions is enabled in repository settings
- Check the "Actions" tab in your repository

**GitLab:**
- Check that `.gitlab-ci.yml` is committed
- Verify CI/CD is enabled in project settings
- Check the "CI/CD > Pipelines" section

### Checks Failing

```bash
# Run locally to see detailed errors
npm run verify

# Check specific issues
npm run type-check  # TypeScript errors
npm test           # Test failures
npm run lint       # Linting issues
```

### Need to Skip Checks

**Emergency bypass (not recommended):**
```bash
# Skip pre-commit hook
git commit --no-verify

# Skip pre-push hook  
git push --no-verify
```

Note: CI checks will still run on the PR

## 📚 Additional Resources

- **[CI-INTEGRATION.md](docs/CI-INTEGRATION.md)** - Complete CI/CD integration guide
- **[SETUP-HOOKS.md](docs/SETUP-HOOKS.md)** - Detailed Git hooks setup
- **[verifyPendoData.md](docs/verifyPendoData.md)** - Full utility documentation
- **[verifyPendoData.quickref.md](docs/verifyPendoData.quickref.md)** - Quick reference

## ✨ Next Steps

1. **Test locally:** Run `npm run verify`
2. **Create a PR:** Push your code and create a pull request
3. **Watch CI run:** Check the Actions/Pipelines tab
4. **Review results:** Fix any issues reported by CI
5. **(Optional) Set up hooks:** Run `npm run setup:hooks`

---

**Questions?** See the [CI Integration Guide](docs/CI-INTEGRATION.md) for more details.


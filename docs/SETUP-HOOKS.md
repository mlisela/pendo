# Git Hooks Setup Guide

This guide explains how to set up Git hooks to automatically run Pendo verification checks before commits and pushes.

## Option 1: Using Husky (Recommended)

### Installation

1. Install Husky:

```bash
npm install --save-dev husky
```

2. Initialize Husky:

```bash
npx husky init
```

3. The `.husky/pre-commit` and `.husky/pre-push` hooks are already configured in this repository.

4. Make hooks executable:

```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### What Gets Checked

**Pre-commit Hook:**
- Runs `npm run verify` (quick verification checks)
- Blocks commit if verification fails

**Pre-push Hook:**
- TypeScript compilation (`npm run type-check`)
- Unit tests (`npm test`)
- Full Pendo verification (`npm run verify`)
- Blocks push if any check fails

### Skipping Hooks (Emergency Only)

If you need to skip hooks temporarily:

```bash
# Skip pre-commit hook
git commit --no-verify -m "message"

# Skip pre-push hook
git push --no-verify
```

⚠️ **Warning:** Only skip hooks in emergencies. Your PR will still need to pass CI checks.

## Option 2: Manual Git Hooks (No Dependencies)

If you prefer not to use Husky, you can set up hooks manually:

### Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh

echo "🔍 Running Pendo verification checks..."
npm run verify

if [ $? -ne 0 ]; then
  echo "❌ Pendo verification failed. Commit blocked."
  exit 1
fi

echo "✅ Pendo verification passed!"
```

### Pre-push Hook

Create `.git/hooks/pre-push`:

```bash
#!/bin/sh

echo "🔍 Running full verification suite..."
npm run type-check && npm test && npm run verify

if [ $? -ne 0 ]; then
  echo "❌ Checks failed. Push blocked."
  exit 1
fi

echo "✅ All checks passed!"
```

### Make Hooks Executable

```bash
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push
```

⚠️ **Note:** Manual hooks in `.git/hooks/` are not committed to the repository. Each developer needs to set them up individually.

## Verifying Hook Setup

Test your hooks:

```bash
# Test pre-commit hook
git commit --allow-empty -m "test"

# Test pre-push hook  
git push --dry-run
```

## Disabling Hooks

### Temporarily (Husky)

Set environment variable:

```bash
export HUSKY=0
git commit -m "message"
unset HUSKY
```

### Permanently (Husky)

Remove Husky:

```bash
npm uninstall husky
rm -rf .husky
```

### Permanently (Manual)

Remove hook files:

```bash
rm .git/hooks/pre-commit
rm .git/hooks/pre-push
```

## Troubleshooting

### Hook Not Running

1. Check if hooks are executable:
```bash
ls -la .husky/
# or
ls -la .git/hooks/
```

2. Make them executable:
```bash
chmod +x .husky/pre-commit .husky/pre-push
# or
chmod +x .git/hooks/pre-commit .git/hooks/pre-push
```

### Hook Fails Unexpectedly

1. Run verification manually:
```bash
npm run verify
```

2. Check Node.js version (requires Node 18+):
```bash
node --version
```

3. Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Husky Not Found

Install Husky:

```bash
npm install --save-dev husky
npx husky init
```

## Best Practices

1. **Run checks locally first:**
   ```bash
   npm run verify
   npm run type-check
   npm test
   ```

2. **Commit early, commit often:** Hooks help catch issues early

3. **Don't skip hooks regularly:** They're there to help you

4. **Keep hooks fast:** If checks take too long, optimize them

5. **Communicate with team:** Ensure everyone has hooks set up

## Integration with CI/CD

Even with hooks enabled, CI/CD runs the same checks:
- GitHub Actions (`.github/workflows/pendo-verification.yml`)
- GitLab CI (`.gitlab-ci.yml`)

This provides a safety net if hooks are skipped or disabled.

## Next Steps

- [CI Integration Guide](CI-INTEGRATION.md)
- [Pendo Verification Documentation](verifyPendoData.md)
- [Quick Reference](verifyPendoData.quickref.md)


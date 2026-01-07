# GitHub Actions Workflows

This directory contains GitHub Actions workflow configurations for automated CI/CD.

## Workflows

### Pendo Verification (`pendo-verification.yml`)

Automatically runs Pendo verification checks on pull requests and pushes to main branches.

**Triggers:**
- Pull requests that modify TypeScript files
- Push to `main` or `develop` branches

**What it does:**
1. Checks out code
2. Sets up Node.js environment
3. Installs dependencies
4. Runs `npm run verify`
5. Posts comment on PR with results
6. Blocks merge if checks fail

**Status checks:**
- ✅ File existence
- ✅ TypeScript compilation  
- ✅ Unit tests
- ✅ Linter checks
- ✅ Export verification
- ✅ Development guards
- ✅ PII pattern coverage
- ✅ Documentation

## Monitoring

View workflow runs:
1. Go to the "Actions" tab in GitHub
2. Select "Pendo Verification" workflow
3. View logs and results

## Configuration

The workflow uses:
- **Node.js 18** (via `actions/setup-node@v4`)
- **npm ci** for dependency installation
- **Caching** for faster builds

## Troubleshooting

### Workflow doesn't run

- Check that the workflow file is committed to `main` branch
- Verify GitHub Actions is enabled in repository settings
- Check that file paths in PR match the workflow triggers

### Workflow fails

- View the detailed logs in the Actions tab
- Run `npm run verify` locally to reproduce
- Check for TypeScript errors: `npm run type-check`
- Run tests: `npm test`

## Documentation

For more information, see:
- [Git Integration Quick Start](../docs/GIT-INTEGRATION-QUICKSTART.md)
- [CI Integration Guide](../docs/CI-INTEGRATION.md)
- [Setup Complete](../docs/SETUP-COMPLETE.md)


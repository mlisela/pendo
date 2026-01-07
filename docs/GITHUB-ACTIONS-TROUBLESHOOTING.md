# Troubleshooting GitHub Actions Permissions

## Error: "Resource not accessible by integration"

This error occurs when GitHub Actions doesn't have permission to perform certain operations (like posting comments on PRs).

### Solution 1: Use the Simple Workflow (Recommended)

The simplest solution is to use the basic workflow without PR comments:

**Use:** `.github/workflows/pendo-verification-simple.yml`

This workflow:
- ✅ Runs all verification checks
- ✅ Shows pass/fail status on PR
- ✅ Doesn't require special permissions
- ✅ Works in all repository configurations

To switch to the simple workflow:

```bash
# Rename or delete the complex workflow
mv .github/workflows/pendo-verification.yml .github/workflows/pendo-verification-with-comments.yml.bak

# Rename the simple workflow
mv .github/workflows/pendo-verification-simple.yml .github/workflows/pendo-verification.yml

# Commit
git add .github/workflows/
git commit -m "ci: Switch to simple workflow without PR comments"
git push
```

### Solution 2: Fix Permissions (If You Want PR Comments)

If you want to keep the PR comment feature, you need to configure repository permissions:

#### For Repository Admins

1. **Go to Repository Settings**
   - Navigate to your repository on GitHub
   - Click **Settings** → **Actions** → **General**

2. **Set Workflow Permissions**
   - Scroll down to "Workflow permissions"
   - Select **"Read and write permissions"**
   - Check ✅ **"Allow GitHub Actions to create and approve pull requests"**
   - Click **Save**

3. **Re-run the workflow**
   - Go to your PR
   - Click on the failed workflow
   - Click **"Re-run jobs"**

#### If You Don't Have Admin Access

Ask your repository admin to:
1. Enable "Read and write permissions" for workflows
2. Allow workflows to create/approve pull requests

Or use the simple workflow instead (no admin needed).

### Solution 3: Use GITHUB_TOKEN Explicitly

The updated `pendo-verification.yml` now includes explicit permissions:

```yaml
permissions:
  contents: read
  pull-requests: write
  issues: write
```

This should work automatically if workflow permissions are set to "Read and write" in repository settings.

## Which Workflow Should You Use?

### Use Simple Workflow If:
- ✅ You don't need PR comments
- ✅ You want zero configuration
- ✅ You don't have repository admin access
- ✅ You just want the check status (pass/fail)

**File:** `.github/workflows/pendo-verification-simple.yml`

### Use Full Workflow If:
- ✅ You want automated PR comments
- ✅ You have repository admin access
- ✅ You've configured workflow permissions
- ✅ You want detailed feedback in PR comments

**File:** `.github/workflows/pendo-verification.yml`

## Comparing the Workflows

| Feature | Simple | Full (with comments) |
|---------|--------|----------------------|
| Runs verification checks | ✅ | ✅ |
| Shows pass/fail status | ✅ | ✅ |
| Blocks merge on failure | ✅ | ✅ |
| Posts PR comments | ❌ | ✅ |
| Requires permissions | ❌ | ✅ Admin needed |
| Configuration needed | None | Workflow permissions |

## Checking Workflow Status

Both workflows show the same status information:

### On Pull Request
- **Status Check**: "Verify Pendo Integration" ✅ or ❌
- **Details Link**: Click "Details" to see full logs
- **Merge Blocking**: Failed checks block merge (if branch protection enabled)

### Viewing Logs
1. Go to PR page
2. Scroll to checks section
3. Click "Details" next to "Verify Pendo Integration"
4. View detailed output of all 9 checks

## Alternative: Use Check Runs Instead

If neither workflow works, you can use GitHub Check Runs API or third-party actions:

```yaml
- name: Report Status
  uses: LouisBrunner/checks-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    name: Pendo Verification
    conclusion: ${{ job.status }}
    output: |
      {"summary": "Verification complete"}
```

## Testing Your Setup

### Test Simple Workflow
```bash
# Use the simple workflow
git checkout -b test-simple-workflow
echo "# Test" >> README.md
git add README.md
git commit -m "test: Simple workflow"
git push origin test-simple-workflow
# Create PR and check status
```

### Test Full Workflow
```bash
# Ensure permissions are set
# Then create PR as above
# Should see automated comment if permissions correct
```

## Still Having Issues?

### Check These:

1. **Workflow file is committed to main branch**
   ```bash
   git checkout main
   ls -la .github/workflows/
   ```

2. **Actions are enabled**
   - Settings → Actions → General
   - "Allow all actions and reusable workflows"

3. **Branch protection allows Actions**
   - Settings → Branches
   - Check that "Require status checks" includes the workflow

4. **View Action logs for details**
   - Actions tab → Click failed run
   - Review step-by-step output

### Common Fixes

**Issue**: Workflow doesn't run at all
- **Fix**: Ensure workflow file is in `.github/workflows/` on main branch

**Issue**: "Resource not accessible by integration"
- **Fix**: Use simple workflow OR configure workflow permissions

**Issue**: Workflow runs but doesn't block merge
- **Fix**: Add branch protection rule requiring "Verify Pendo Integration" status

**Issue**: All tests pass locally but fail in CI
- **Fix**: Check Node version (CI uses Node 18, local may differ)

## Recommended Setup

**For most users:**

1. ✅ Use the **simple workflow** (no permissions needed)
2. ✅ Enable **branch protection** to require the check
3. ✅ View detailed logs by clicking "Details"
4. ✅ No PR comments, but full status visibility

**This gives you:**
- ✅ Automated verification on every PR
- ✅ Pass/fail status clearly visible
- ✅ Merge blocking when checks fail
- ✅ Zero permission configuration needed

## Summary

| Problem | Solution |
|---------|----------|
| "Resource not accessible" error | Use simple workflow |
| Want PR comments | Configure workflow permissions (admin) |
| Workflow doesn't run | Check it's committed to main branch |
| Can't configure permissions | Use simple workflow instead |
| Need detailed output | Click "Details" link in PR checks |

---

**Bottom line:** The simple workflow (`pendo-verification-simple.yml`) works everywhere without any configuration. Use it unless you specifically need PR comments.


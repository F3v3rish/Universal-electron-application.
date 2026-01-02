# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automating CI/CD processes.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main`, `develop`, or `copilot/**` branches
- Pull requests to `main` or `develop`

**What it does:**
- Tests on Ubuntu, macOS, and Windows
- Tests with Node.js 18.x and 20.x
- **Setup steps (run before firewall):**
  - Checks out code
  - Sets up Node.js with npm caching
  - Caches node_modules for faster builds
  - Installs dependencies
- Validates code with linting and formatting checks
- Builds all components (main, renderer, preload)
- Verifies build output exists
- Runs security audit
- Uploads build artifacts

**Key Features:**
- Matrix testing across platforms and Node versions
- Dependency caching for faster builds
- Continue-on-error for non-critical checks
- Artifact retention for 7 days

### 2. Release Workflow (`release.yml`)

**Triggers:**
- Push of version tags (e.g., `v1.0.0`)
- Manual workflow dispatch

**What it does:**
- **Setup steps (run before firewall):**
  - Checks out code
  - Sets up Node.js 20 with npm caching
  - Caches node_modules
  - Installs dependencies
- Builds application in production mode
- Creates platform-specific packages (AppImage, NSIS, DMG)
- Uploads release artifacts
- Creates GitHub release with auto-generated notes

**Key Features:**
- Multi-platform builds
- Automatic GitHub releases
- 30-day artifact retention
- Release notes generation

### 3. Security Workflow (`security.yml`)

**Triggers:**
- Weekly on Mondays at 9:00 AM UTC
- Changes to `package.json` or `package-lock.json`
- Manual workflow dispatch

**What it does:**
- **Setup steps (run before firewall):**
  - Checks out code
  - Sets up Node.js 20 with npm caching
  - Installs dependencies
- Runs npm security audit
- Checks for outdated packages
- Lists all dependencies
- Auto-creates GitHub issues for vulnerabilities

**Key Features:**
- Scheduled security checks
- Automatic issue creation
- Dependency monitoring

## Setup Steps Before Firewall

All workflows follow a consistent pattern of running setup steps **before any firewall is enabled**:

1. **Checkout code** - Uses `actions/checkout@v4`
2. **Setup Node.js** - Uses `actions/setup-node@v4` with npm caching
3. **Cache dependencies** - Uses `actions/cache@v4` for node_modules
4. **Install dependencies** - Runs `npm ci` for reproducible builds

These steps ensure that all necessary tools and dependencies are available before any network restrictions or firewalls are applied by subsequent steps or security policies.

## Best Practices Implemented

- ✅ Use of `npm ci` instead of `npm install` for reproducible builds
- ✅ Dependency caching to speed up builds
- ✅ Matrix testing for cross-platform compatibility
- ✅ Security audits on every build
- ✅ Artifact retention for debugging
- ✅ Continue-on-error for non-critical checks
- ✅ Latest action versions (v4)
- ✅ Clear step names and comments
- ✅ Environment variable security

## Usage

### Running CI Locally

To test the build process locally before pushing:

```bash
npm ci
npm run lint
npm run format:check
npm run build
```

### Creating a Release

To create a new release:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes
4. Create and push a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

The release workflow will automatically build and publish the release.

### Manually Triggering Workflows

You can manually trigger workflows from the GitHub Actions tab:

1. Go to Actions tab in GitHub
2. Select the workflow
3. Click "Run workflow"
4. Select branch and run

## Troubleshooting

### Workflow Fails on Dependency Installation

If the workflow fails during `npm ci`:
- Check that `package-lock.json` is committed
- Ensure package.json and package-lock.json are in sync
- Try deleting and regenerating package-lock.json locally

### Build Fails on Specific Platform

If builds fail on specific platforms:
- Check platform-specific dependencies
- Review electron-builder configuration
- Test locally on that platform if possible

### Security Audit Failures

If security audits fail:
- Review the audit report
- Update vulnerable packages
- Use `npm audit fix` to auto-fix
- For breaking changes, update code as needed

## Maintenance

### Updating Action Versions

Periodically update action versions:
- `actions/checkout@v4` → check for v5
- `actions/setup-node@v4` → check for v5
- `actions/cache@v4` → check for v5
- `actions/upload-artifact@v4` → check for v5

### Modifying Node.js Versions

To test with different Node.js versions, update the matrix in `ci.yml`:

```yaml
matrix:
  node-version: [18.x, 20.x, 22.x]  # Add new versions here
```

## Security Considerations

- Secrets should never be committed to the repository
- Use GitHub Secrets for sensitive data (API keys, certificates)
- The `GITHUB_TOKEN` is automatically provided by GitHub Actions
- Code signing certificates should be stored as encrypted secrets
- Regular security audits help maintain dependency security

## Contributing

When adding new workflows:
1. Follow the existing naming convention
2. Include clear comments
3. Document setup steps
4. Test locally before committing
5. Update this README with workflow details

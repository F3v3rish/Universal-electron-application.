# Deployment Guide

This guide covers deploying the Universal Electron Application for production use.

## Table of Contents

- [Quick Deployment](#quick-deployment)
- [Building for Distribution](#building-for-distribution)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [Code Signing](#code-signing)
- [Auto-Update Setup](#auto-update-setup)
- [Deployment Checklist](#deployment-checklist)

## Quick Deployment

### Prerequisites

Before deploying, ensure:
- ✅ All features tested and working
- ✅ Code reviewed and approved
- ✅ Version number updated in `package.json`
- ✅ CHANGELOG.md updated
- ✅ No security vulnerabilities (`npm audit`)
- ✅ All tests passing

### Build for Production

```bash
# Set production environment
export NODE_ENV=production

# Install dependencies (use ci for reproducible builds)
npm ci

# Build the application
npm run build

# Create distribution packages
npm run package
```

This creates installers in the `release/` directory.

## Building for Distribution

### Electron Builder Configuration

The application uses `electron-builder` for packaging. Configuration is in `package.json`:

```json
{
  "build": {
    "appId": "com.universal.electron",
    "productName": "Universal Electron App",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "package.json"
    ],
    "mac": {
      "category": "public.app-category.utilities"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

### Output Files

After running `npm run package`, you'll find:

**Linux:**
- `release/universal-electron-app-*.AppImage` - Portable executable
- No installation required, just make executable and run

**Windows:**
- `release/universal-electron-app-setup-*.exe` - NSIS installer
- Standard Windows installer with uninstaller

**macOS:**
- `release/universal-electron-app-*.dmg` - Disk image installer
- Drag-and-drop installation

## Platform-Specific Instructions

### Linux Deployment

#### AppImage

The AppImage is a portable, single-file executable:

```bash
# Make executable
chmod +x release/universal-electron-app-*.AppImage

# Run
./release/universal-electron-app-*.AppImage
```

**Advantages:**
- Works on most Linux distributions
- No installation required
- Self-contained with all dependencies

**Distribution:**
- Upload to GitHub Releases
- Host on your own server
- Submit to AppImageHub

#### Snap Package (Optional)

To create a Snap package, add to `package.json`:

```json
{
  "build": {
    "linux": {
      "target": ["AppImage", "snap"]
    }
  }
}
```

Then publish to Snap Store:
```bash
snapcraft login
snapcraft push release/*.snap --release=stable
```

### Windows Deployment

#### NSIS Installer

The NSIS installer provides a standard Windows installation experience:

**Features:**
- Start Menu integration
- Desktop shortcut (optional)
- Uninstaller
- Auto-update support

**Code Signing (Recommended):**
```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "your-password",
      "signingHashAlgorithms": ["sha256"],
      "target": "nsis"
    }
  }
}
```

**Distribution:**
- Microsoft Store (requires package signing)
- Direct download from website
- Chocolatey package manager
- GitHub Releases

### macOS Deployment

#### DMG Installer

The DMG provides a native macOS installation experience:

**Code Signing (Required for notarization):**
```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name (TEAM_ID)",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    }
  }
}
```

**Notarization:**
```bash
# After building
xcrun notarytool submit release/*.dmg \
  --apple-id "your-email@example.com" \
  --team-id "YOUR_TEAM_ID" \
  --password "app-specific-password" \
  --wait

# Staple the notarization
xcrun stapler staple release/*.dmg
```

**Distribution:**
- Mac App Store (requires additional setup)
- Direct download from website
- Homebrew Cask
- GitHub Releases

## Code Signing

### Why Code Sign?

- **Trust**: Users trust signed applications
- **Security**: Prevents tampering
- **Requirements**: Required for auto-update on some platforms
- **Distribution**: Required for app stores

### Getting Certificates

**Windows:**
- Purchase from a Certificate Authority (DigiCert, Sectigo, etc.)
- Cost: ~$200-500/year

**macOS:**
- Enroll in Apple Developer Program ($99/year)
- Create certificates in Xcode or Apple Developer portal

**Linux:**
- Not typically required
- GPG signatures are common for repositories

### Signing Configuration

Store certificates securely:
- Use environment variables for passwords
- Never commit certificates to git
- Use CI/CD secrets for automated builds

Example CI/CD workflow:
```yaml
env:
  CSC_LINK: ${{ secrets.MAC_CERTIFICATE }}
  CSC_KEY_PASSWORD: ${{ secrets.MAC_CERTIFICATE_PASSWORD }}
  WIN_CSC_LINK: ${{ secrets.WIN_CERTIFICATE }}
  WIN_CSC_KEY_PASSWORD: ${{ secrets.WIN_CERTIFICATE_PASSWORD }}
```

## Auto-Update Setup

### Electron-Updater

Add auto-update capability:

```bash
npm install electron-updater
```

**Main Process:**
```javascript
import { autoUpdater } from 'electron-updater';

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', () => {
  console.log('Update available');
});

autoUpdater.on('update-downloaded', () => {
  console.log('Update downloaded');
  // Prompt user to restart
});
```

**Update Server:**
- Host on GitHub Releases (free)
- Self-host with electron-release-server
- Use commercial service (e.g., Nucleus)

**Configuration:**
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-username",
      "repo": "your-repo"
    }
  }
}
```

## Deployment Checklist

### Pre-Deployment

- [ ] Code review completed
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Performance tested
- [ ] Security audit completed (`npm audit`)
- [ ] Dependencies updated
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] Documentation updated

### Build Process

- [ ] Clean build environment
- [ ] Production build successful
- [ ] All platforms built (if multi-platform)
- [ ] File sizes reasonable
- [ ] Installers tested on target platforms

### Code Signing

- [ ] Windows installer signed (if applicable)
- [ ] macOS app signed and notarized (if applicable)
- [ ] Certificates valid and not expired

### Distribution

- [ ] Release notes prepared
- [ ] GitHub release created
- [ ] Installers uploaded
- [ ] Download links verified
- [ ] Auto-update configured (if applicable)
- [ ] Website/docs updated

### Post-Deployment

- [ ] Download and test installers
- [ ] Verify auto-update works
- [ ] Monitor error reports
- [ ] Check analytics (if implemented)
- [ ] Respond to user feedback

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/release.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        NODE_ENV: production
    
    - name: Package
      run: npm run package
      env:
        GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: release-${{ matrix.os }}
        path: release/*
    
    - name: Release
      uses: softprops/action-gh-release@v1
      if: startsWith(github.ref, 'refs/tags/')
      with:
        files: release/*
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Best Practices

### Versioning

Follow [Semantic Versioning](https://semver.org/):
- **Major** (1.x.x): Breaking changes
- **Minor** (x.1.x): New features, backward compatible
- **Patch** (x.x.1): Bug fixes

### Release Process

1. Create release branch: `git checkout -b release/v1.0.0`
2. Update version: `npm version major|minor|patch`
3. Update CHANGELOG.md
4. Commit changes: `git commit -am "Release v1.0.0"`
5. Create tag: `git tag v1.0.0`
6. Push: `git push origin release/v1.0.0 --tags`
7. Build and test
8. Create GitHub Release
9. Merge to main

### Distribution Channels

**Direct Download:**
- Host on your website
- Use CDN for better performance
- Provide checksums for verification

**GitHub Releases:**
- Free hosting
- Automatic changelog
- Easy for developers

**App Stores:**
- Higher trust
- Better discovery
- Review process required

**Package Managers:**
- Easy installation and updates
- Platform-specific (Homebrew, Chocolatey, apt, etc.)

## Troubleshooting

### Build Fails

- Clean node_modules: `rm -rf node_modules && npm install`
- Clean build: `rm -rf dist release && npm run build`
- Check electron-builder logs in `release/`

### Signing Issues

- Verify certificate validity
- Check certificate password
- Ensure certificate is for code signing
- On macOS, unlock keychain: `security unlock-keychain`

### Large File Size

- Remove unnecessary dependencies
- Use `asarUnpack` for large files
- Optimize images and assets
- Check for duplicate dependencies

### Auto-Update Not Working

- Verify update server is accessible
- Check app signature
- Test with different update intervals
- Review auto-updater logs

## Support

For deployment issues:
1. Check the [BUILD.md](BUILD.md) guide
2. Review electron-builder documentation
3. Check GitHub issues
4. Ask in Electron Discord/forums

---

**Security Note:** Never commit certificates, keys, or passwords to version control. Always use environment variables or secure secret management.

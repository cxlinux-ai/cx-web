# CX Linux Gold 0.1.0-Alpha ISO Build Instructions

**Build Target**: Production-ready CX Linux Ubuntu 24.04 LTS ISO
**Version**: 0.1.0-Alpha (Gold Release)
**Build Method**: GitHub Actions Cloud Build
**Expected Output**: Signed ISO with SHA256/SHA512 checksums

---

## ✅ Pre-Build Verification Complete

### Repository Status:
- ✅ **Branch**: main
- ✅ **Workflow**: `.github/workflows/build-iso.yml` configured
- ✅ **Version**: Updated to `0.1.0-Alpha` for Gold build
- ✅ **Triggers**: Manual dispatch + auto on push to main
- ✅ **Runner**: ubuntu-24.04 (matching ISO base)

### Build Configuration:
- **Build Type**: offline (full ~2-4GB ISO with all packages)
- **Timeout**: 120 minutes
- **Disk Space**: ~20GB available after cleanup
- **Caching**: Live-build components cached between runs
- **Artifacts**: ISO, checksums, SBOM, build logs

---

## 🚀 Triggering the Gold Build

### Method 1: Manual Dispatch (Recommended)
1. **Navigate to GitHub Actions**:
   ```
   https://github.com/cortexlinux/cortex-distro/actions
   ```

2. **Select Workflow**:
   - Click "Build CX Linux ISO" workflow
   - Click "Run workflow" button (top right)

3. **Configure Build**:
   - **Branch**: `main` (should be pre-selected)
   - **Build type**: `offline` (for Gold ISO)
   - Click "Run workflow"

### Method 2: Git Push Trigger
```bash
# Commit the version update and push
git add .github/workflows/build-iso.yml
git commit -m "feat: Update to version 0.1.0-Alpha for Gold ISO build"
git push origin main
```

---

## 📊 Build Process Monitoring

### Expected Timeline:
- **Start**: Workflow initialization (~2 minutes)
- **Dependencies**: Install build tools (~5 minutes)
- **Package Build**: Create .deb packages (~10 minutes)
- **ISO Build**: Ubuntu 24.04 live-build (~45-75 minutes)
- **Artifacts**: Generate checksums, SBOM (~5 minutes)
- **Upload**: Create GitHub release (~3 minutes)

### **Total Estimated Time: 60-90 minutes**

### Monitoring Progress:
1. **Workflow Status**: https://github.com/cortexlinux/cortex-distro/actions
2. **Live Logs**: Click on running workflow → "build-iso" job
3. **Real-time Updates**: Refresh page for progress updates

---

## 🔐 Checksum Verification Process

### Automatic Generation:
The workflow automatically generates:
- **SHA256**: `cx-linux-0.1.0-Alpha-amd64-offline.iso.sha256`
- **SHA512**: `cx-linux-0.1.0-Alpha-amd64-offline.iso.sha512`
- **SBOM**: Software Bill of Materials for supply chain security

### Verification Commands:
```bash
# Download ISO and checksums from GitHub release

# Verify SHA256
sha256sum -c cx-linux-0.1.0-Alpha-amd64-offline.iso.sha256

# Verify SHA512
sha512sum -c cx-linux-0.1.0-Alpha-amd64-offline.iso.sha512

# Expected output:
# cx-linux-0.1.0-Alpha-amd64-offline.iso: OK
```

### Public Download Ready:
Upon successful build, the following will be available:
- **GitHub Release**: Automatic release creation with version tag
- **Download URL**: `https://github.com/cortexlinux/cortex-distro/releases/tag/v0.1.0-Alpha-build{N}`
- **Files Available**:
  - `cx-linux-0.1.0-Alpha-amd64-offline.iso` (main ISO)
  - `cx-linux-0.1.0-Alpha-amd64-offline.iso.sha256`
  - `cx-linux-0.1.0-Alpha-amd64-offline.iso.sha512`
  - `BUILD-INFO.txt` (build metadata)
  - `sbom/` directory (security artifacts)

---

## ✅ Success Criteria for Gold Build

### Build Success Indicators:
- ✅ Workflow completes without errors (green checkmark)
- ✅ ISO file size ~2-4GB (full offline installation)
- ✅ SHA256 checksum matches generated hash
- ✅ SHA512 checksum matches generated hash
- ✅ GitHub release created automatically
- ✅ All artifacts uploaded successfully

### Technical Validation:
- ✅ Ubuntu 24.04 LTS base system
- ✅ CX Linux branding throughout
- ✅ GPU driver support (NVIDIA/AMD)
- ✅ Python 3.12 AI/ML stack
- ✅ Container readiness (Docker/Podman)
- ✅ Security hardening (AppArmor/UFW)
- ✅ First-boot automation

---

## 🚨 Troubleshooting

### If Build Fails:
1. **Check Build Logs**: Actions tab → failed workflow → build-iso job
2. **Common Issues**:
   - Disk space exhaustion (should not happen with cleanup)
   - Ubuntu package mirror issues (temporary)
   - Live-build compilation errors

### Emergency Rebuild:
```bash
# Force rebuild by triggering workflow manually with same parameters
# Or make a minor change and push:
echo "# Rebuild trigger $(date)" >> .github/workflows/README.md
git add . && git commit -m "trigger: Force Gold ISO rebuild" && git push
```

---

## 📋 Post-Build Verification Checklist

### [ ] Download Verification:
- [ ] ISO file downloads successfully
- [ ] File size matches expected range (2-4GB)
- [ ] SHA256 checksum verification passes
- [ ] SHA512 checksum verification passes

### [ ] Technical Validation:
- [ ] ISO boots in QEMU/VirtualBox
- [ ] CX Linux branding visible in boot screen
- [ ] Installation completes successfully
- [ ] First-boot provisioning functions
- [ ] GPU drivers auto-detect and install

### [ ] Release Quality:
- [ ] GitHub release has professional description
- [ ] All required artifacts present
- [ ] Build information complete
- [ ] Public download links functional

---

## 🎯 Ready to Execute

**The Gold 0.1.0-Alpha build environment is prepared and ready for execution.**

**Next Step**: Navigate to GitHub Actions and trigger the manual workflow dispatch to begin the Gold ISO build process.

**Expected Result**: Production-ready CX Linux ISO with verified checksums available for public download within 60-90 minutes.
#!/usr/bin/env bash
# CX Linux Terminal - Install Script
# Usage: curl -fsSL https://cxlinux.com/install.sh | bash
#
# Supports: Ubuntu 20.04+, Debian 11+, Linux Mint, Pop!_OS
# Also supports: macOS (via Homebrew)

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

info()  { echo -e "${CYAN}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }
fatal() { error "$*"; exit 1; }

# ============================================
# Platform Detection
# ============================================
detect_platform() {
    OS="$(uname -s)"
    ARCH="$(uname -m)"

    case "$OS" in
        Linux)
            if [ -f /etc/os-release ]; then
                . /etc/os-release
                DISTRO="$ID"
                DISTRO_VERSION="$VERSION_ID"
                DISTRO_CODENAME="${VERSION_CODENAME:-}"
                DISTRO_LIKE="${ID_LIKE:-}"
            else
                fatal "Cannot detect Linux distribution. /etc/os-release not found."
            fi
            ;;
        Darwin)
            DISTRO="macos"
            DISTRO_VERSION="$(sw_vers -productVersion)"
            ;;
        *)
            fatal "Unsupported operating system: $OS"
            ;;
    esac

    # Check architecture
    case "$ARCH" in
        x86_64|amd64) ARCH="amd64" ;;
        aarch64|arm64) ARCH="arm64" ;;
        *) fatal "Unsupported architecture: $ARCH" ;;
    esac
}

# ============================================
# Debian/Ubuntu APT Install
# ============================================
install_apt() {
    info "Installing CX Terminal via APT..."

    # Check for root or sudo
    if [ "$(id -u)" -eq 0 ]; then
        SUDO=""
    elif command -v sudo &>/dev/null; then
        SUDO="sudo"
        info "Using sudo for package installation"
    else
        fatal "This script requires root or sudo access to install packages."
    fi

    # Install prerequisites
    info "Installing prerequisites..."
    $SUDO apt-get update -qq
    $SUDO apt-get install -y -qq curl gnupg ca-certificates >/dev/null 2>&1
    ok "Prerequisites installed"

    # Add GPG key
    info "Adding CX Linux GPG key..."
    curl -fsSL https://repo.cxlinux.com/pub.gpg | $SUDO gpg --dearmor -o /usr/share/keyrings/cxlinux-archive-keyring.gpg 2>/dev/null || \
    curl -fsSL https://repo.cxlinux.com/pub.gpg | $SUDO gpg --dearmor --yes -o /usr/share/keyrings/cxlinux-archive-keyring.gpg
    ok "GPG key added"

    # Add APT repository
    info "Adding CX Linux APT repository..."
    echo "deb [signed-by=/usr/share/keyrings/cxlinux-archive-keyring.gpg] https://repo.cxlinux.com/apt stable main" | \
        $SUDO tee /etc/apt/sources.list.d/cxlinux.list >/dev/null
    ok "Repository added"

    # Install
    info "Installing cx-terminal..."
    $SUDO apt-get update -qq
    if $SUDO apt-get install -y cx-terminal; then
        ok "cx-terminal installed successfully!"
    else
        error "apt install failed. Trying direct download..."
        install_deb_direct
        return
    fi
}

# ============================================
# Direct .deb Download (fallback)
# ============================================
install_deb_direct() {
    info "Downloading cx-terminal .deb package directly..."

    local DEB_URL="https://repo.cxlinux.com/apt/pool/main/c/cx-terminal/cx-terminal_latest_amd64.deb"
    local TMP_DEB="/tmp/cx-terminal_latest_amd64.deb"

    curl -fsSL "$DEB_URL" -o "$TMP_DEB"

    if [ "$(id -u)" -eq 0 ]; then
        dpkg -i "$TMP_DEB" || apt-get install -f -y
    else
        sudo dpkg -i "$TMP_DEB" || sudo apt-get install -f -y
    fi

    rm -f "$TMP_DEB"
    ok "cx-terminal installed via direct download"
}

# ============================================
# macOS Install
# ============================================
install_macos() {
    info "Installing CX Terminal on macOS..."

    if ! command -v brew &>/dev/null; then
        warn "Homebrew not found. Installing Homebrew first..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi

    # Check if cask exists, otherwise use npm
    if brew install --cask cx-terminal 2>/dev/null; then
        ok "cx-terminal installed via Homebrew"
    else
        warn "Homebrew cask not available yet. Installing cx-cli via npm..."
        install_npm
    fi
}

# ============================================
# npm Install (universal fallback)
# ============================================
install_npm() {
    info "Installing cx-cli via npm..."

    # Check for Node.js
    if ! command -v node &>/dev/null; then
        info "Node.js not found. Installing..."
        if [ "$DISTRO" = "macos" ]; then
            brew install node
        elif is_debian_based; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO bash -
            $SUDO apt-get install -y nodejs
        else
            fatal "Please install Node.js 18+ first: https://nodejs.org"
        fi
    fi

    # Check Node.js version
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        fatal "Node.js 18+ required (found v${NODE_VERSION}). Please upgrade: https://nodejs.org"
    fi

    npm install -g cx-cli
    ok "cx-cli installed via npm"
}

# ============================================
# Helpers
# ============================================
is_debian_based() {
    case "$DISTRO" in
        ubuntu|debian|linuxmint|pop|elementary|zorin|neon) return 0 ;;
    esac
    case "$DISTRO_LIKE" in
        *debian*|*ubuntu*) return 0 ;;
    esac
    return 1
}

# ============================================
# Verification
# ============================================
verify_install() {
    echo ""
    info "Verifying installation..."

    if command -v cx &>/dev/null; then
        local VERSION
        VERSION=$(cx --version 2>/dev/null || echo "unknown")
        ok "CX Terminal installed: $VERSION"
    elif command -v cx-terminal &>/dev/null; then
        ok "cx-terminal binary found"
    else
        warn "cx binary not found in PATH. You may need to restart your shell."
        return
    fi

    echo ""
    echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║   CX Terminal installed successfully!    ║${NC}"
    echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BOLD}Quick start:${NC}"
    echo -e "    cx ask \"how do I install docker\""
    echo -e "    cx install nginx"
    echo -e "    cx fix"
    echo ""
    echo -e "  ${BOLD}More info:${NC}"
    echo -e "    Documentation: https://docs.cxlinux.com"
    echo -e "    Discord:       https://discord.gg/7K6TR7qtS"
    echo -e "    GitHub:        https://github.com/cxlinux-ai/cx-core"
    echo ""
}

# ============================================
# Main
# ============================================
main() {
    echo ""
    echo -e "${CYAN}${BOLD}  ╔═══════════════════════════════╗${NC}"
    echo -e "${CYAN}${BOLD}  ║   CX Linux Terminal Installer ║${NC}"
    echo -e "${CYAN}${BOLD}  ╚═══════════════════════════════╝${NC}"
    echo ""

    detect_platform

    info "Detected: $DISTRO $DISTRO_VERSION ($ARCH)"

    case "$DISTRO" in
        macos)
            install_macos
            ;;
        ubuntu|debian|linuxmint|pop|elementary|zorin|neon)
            install_apt
            ;;
        *)
            if is_debian_based; then
                install_apt
            elif command -v npm &>/dev/null; then
                warn "Unsupported distro '$DISTRO'. Trying npm install..."
                SUDO="${SUDO:-}"
                install_npm
            else
                fatal "Unsupported distribution: $DISTRO. Install manually: https://docs.cxlinux.com/getting-started"
            fi
            ;;
    esac

    verify_install
}

main "$@"

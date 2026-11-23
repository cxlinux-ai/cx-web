#!/usr/bin/env bash
# CX Linux Terminal - Install Script
# Usage: curl -fsSL https://cxlinux.com/install.sh | bash
#
# Verified: Ubuntu 24.04 LTS (APT install tested)
# Other platforms (Debian, Linux Mint, Pop!_OS, macOS, etc.): untested / coming soon

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
# Preflight: fail before changing anything
# ============================================
# The published cx-terminal package is built for amd64 and links against
# glibc 2.39 (Ubuntu 24.04+). Stop early with a clear message instead of
# adding the repository and then failing inside apt.
MIN_GLIBC="2.39"

glibc_version() {
    getconf GNU_LIBC_VERSION 2>/dev/null | awk '{print $2}'
}

preflight_apt() {
    if [ "$ARCH" != "amd64" ]; then
        fatal "CX Terminal packages are published for amd64 only today (detected: $ARCH). Nothing was changed on this system. Build from source: https://github.com/cxlinux-ai/cx-core"
    fi

    local have
    have="$(glibc_version)"
    if [ -z "$have" ]; then
        warn "Could not determine glibc version; continuing."
        return
    fi
    if [ "$(printf '%s\n%s\n' "$MIN_GLIBC" "$have" | sort -V | head -n1)" != "$MIN_GLIBC" ]; then
        fatal "CX Terminal requires glibc $MIN_GLIBC+ (Ubuntu 24.04 or newer). Detected glibc $have on $DISTRO $DISTRO_VERSION. Nothing was changed on this system."
    fi
}

# ============================================
# Debian/Ubuntu APT Install
# ============================================
install_apt() {
    preflight_apt

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
    fi
    ensure_cx_command
}

# Packages up to 2026-02 ship only /usr/bin/cx-terminal, while every `cx ask`
# suggestion runs `cx ...`. Register the same alternative later packages add in
# postinst, so the two never conflict.
ensure_cx_command() {
    if [ -e /usr/bin/cx ] || ! [ -x /usr/bin/cx-terminal ]; then
        return
    fi
    $SUDO update-alternatives --install /usr/bin/cx cx /usr/bin/cx-terminal 100 >/dev/null
    ok "Registered 'cx' command"
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
    fatal "A macOS package is not published yet. Nothing was changed on this system. Build from source: https://github.com/cxlinux-ai/cx-core"
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

warn_platform_support() {
    if [ "$DISTRO" = "macos" ]; then
        warn "Only Ubuntu 24.04 LTS is verified today. macOS install is untested and may fail (coming soon)."
        return
    fi
    if [ "$DISTRO" = "ubuntu" ] && [ "$DISTRO_VERSION" = "24.04" ]; then
        return
    fi
    warn "Only Ubuntu 24.04 LTS is verified today. Detected: $DISTRO ${DISTRO_VERSION:-unknown}. Continuing is untested and may fail (other distros: coming soon)."
}

# ============================================
# Verification
# ============================================
verify_install() {
    echo ""
    info "Verifying installation..."

    local CX_CMD
    if command -v cx &>/dev/null; then
        CX_CMD="cx"
    elif command -v cx-terminal &>/dev/null; then
        CX_CMD="cx-terminal"
    else
        warn "cx-terminal not found in PATH. You may need to restart your shell."
        return
    fi

    local VERSION
    VERSION=$("$CX_CMD" --version 2>/dev/null || echo "unknown")
    ok "CX Terminal installed: $VERSION"

    echo ""
    echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║   CX Terminal installed successfully!    ║${NC}"
    echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BOLD}Step 1 — enable AI (pick one):${NC}"
    echo -e "    $CX_CMD ai download                 local model, ~5 GB, then works offline"
    echo -e "    export ANTHROPIC_API_KEY=...        Claude API"
    echo -e "    export OLLAMA_HOST=http://...       your Ollama server"
    echo ""
    echo -e "  ${BOLD}Step 2 — try it:${NC}"
    echo -e "    $CX_CMD ask \"how do I install docker\""
    echo -e "    $CX_CMD install nginx"
    echo ""
    echo -e "  ${BOLD}More info:${NC}"
    echo -e "    Getting started: https://cxlinux.com/getting-started"
    echo -e "    Discord:         https://discord.gg/7K6TR7qtS"
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
    warn_platform_support

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
            else
                fatal "Unsupported distribution: $DISTRO. Nothing was changed on this system. See https://cxlinux.com/getting-started"
            fi
            ;;
    esac

    verify_install
}

main "$@"

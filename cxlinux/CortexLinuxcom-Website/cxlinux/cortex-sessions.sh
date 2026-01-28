#!/bin/bash
# Cortex Linux Multi-Session Manager
# Launch and manage Claude Code sessions across all repos

set -euo pipefail

CORTEX_DIR="$HOME/cortexlinux"
REPOS=(
    "cortex"
    "cortex-cli"
    "cortex-llm"
    "cortex-network"
    "cortex-distro"
    "cortex-docs"
    "apt-repo"
    "CortexLinuxcom-Website"
)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}    ${GREEN}Cortex Linux Session Manager${NC}        ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
}

print_usage() {
    echo "Usage: $0 <command> [repo]"
    echo ""
    echo "Commands:"
    echo "  list          List all repos and their status"
    echo "  start <repo>  Start Claude Code session for a repo"
    echo "  start-all     Start sessions for all repos (new terminals)"
    echo "  status        Show git status for all repos"
    echo "  sync          Pull latest from all repos"
    echo "  state         Show current project state"
    echo ""
    echo "Repos: ${REPOS[*]}"
}

list_repos() {
    echo -e "${GREEN}Cortex Linux Repositories:${NC}"
    echo ""
    printf "%-25s %-15s %-20s\n" "REPO" "BRANCH" "STATUS"
    echo "─────────────────────────────────────────────────────────"

    for repo in "${REPOS[@]}"; do
        if [ -d "$CORTEX_DIR/$repo" ]; then
            cd "$CORTEX_DIR/$repo"
            branch=$(git branch --show-current 2>/dev/null || echo "N/A")
            status=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
            if [ "$status" -eq 0 ]; then
                status_text="${GREEN}clean${NC}"
            else
                status_text="${YELLOW}${status} changes${NC}"
            fi
            printf "%-25s %-15s " "$repo" "$branch"
            echo -e "$status_text"
        else
            printf "%-25s %-15s " "$repo" "-"
            echo -e "${RED}not cloned${NC}"
        fi
    done
}

start_session() {
    local repo="$1"

    if [ ! -d "$CORTEX_DIR/$repo" ]; then
        echo -e "${RED}Error: Repo '$repo' not found in $CORTEX_DIR${NC}"
        exit 1
    fi

    echo -e "${GREEN}Starting Claude Code session for: $repo${NC}"
    cd "$CORTEX_DIR/$repo"

    # Check if we're on macOS or Linux
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - open new Terminal tab
        osascript -e "tell application \"Terminal\" to do script \"cd $CORTEX_DIR/$repo && claude\""
    else
        # Linux - try common terminal emulators
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal --tab --working-directory="$CORTEX_DIR/$repo" -- claude
        elif command -v xterm &> /dev/null; then
            xterm -e "cd $CORTEX_DIR/$repo && claude" &
        else
            echo "Starting in current terminal..."
            claude
        fi
    fi
}

start_all_sessions() {
    echo -e "${GREEN}Starting Claude Code sessions for all repos...${NC}"
    echo ""

    for repo in "${REPOS[@]}"; do
        if [ -d "$CORTEX_DIR/$repo" ]; then
            echo -e "  Starting: ${BLUE}$repo${NC}"
            start_session "$repo"
            sleep 1  # Small delay between launches
        fi
    done

    echo ""
    echo -e "${GREEN}All sessions launched!${NC}"
    echo "Tip: Use /cortex-sync in each session to load context"
}

show_status() {
    echo -e "${GREEN}Git Status for All Repos:${NC}"
    echo ""

    for repo in "${REPOS[@]}"; do
        if [ -d "$CORTEX_DIR/$repo" ]; then
            echo -e "${BLUE}=== $repo ===${NC}"
            cd "$CORTEX_DIR/$repo"
            git status -sb
            echo ""
        fi
    done
}

sync_repos() {
    echo -e "${GREEN}Syncing all repos...${NC}"
    echo ""

    for repo in "${REPOS[@]}"; do
        if [ -d "$CORTEX_DIR/$repo" ]; then
            echo -e "${BLUE}Pulling: $repo${NC}"
            cd "$CORTEX_DIR/$repo"
            git fetch -q
            git pull --rebase 2>/dev/null || echo "  (no changes or conflicts)"
        fi
    done

    echo ""
    echo -e "${GREEN}Sync complete!${NC}"
}

show_state() {
    echo -e "${GREEN}Current Project State:${NC}"
    echo ""

    if [ -f "$CORTEX_DIR/.cortex-state.json" ]; then
        cat "$CORTEX_DIR/.cortex-state.json"
    else
        echo "No .cortex-state.json found"
    fi

    echo ""
    echo -e "${GREEN}Milestones:${NC}"
    echo ""

    if [ -f "$CORTEX_DIR/MILESTONES.json" ]; then
        cat "$CORTEX_DIR/MILESTONES.json"
    else
        echo "No MILESTONES.json found"
    fi
}

# Main
print_header

case "${1:-}" in
    list)
        list_repos
        ;;
    start)
        if [ -z "${2:-}" ]; then
            echo -e "${RED}Error: Please specify a repo${NC}"
            echo "Available repos: ${REPOS[*]}"
            exit 1
        fi
        start_session "$2"
        ;;
    start-all)
        start_all_sessions
        ;;
    status)
        show_status
        ;;
    sync)
        sync_repos
        ;;
    state)
        show_state
        ;;
    *)
        print_usage
        ;;
esac

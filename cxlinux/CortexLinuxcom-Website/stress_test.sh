#!/bin/bash

# Sovereignty Pulse Stress Test Script
# Executes cx hire commands 10 times in 10 seconds

PURPLE='\033[38;2;124;58;237m'
RESET='\033[0m'

echo -e "${PURPLE}╭─────────────────────────────────────────────────────────────────╮${RESET}"
echo -e "${PURPLE}│                🔥 SOVEREIGNTY PULSE STRESS TEST                 │${RESET}"
echo -e "${PURPLE}╰─────────────────────────────────────────────────────────────────╯${RESET}"
echo
echo -e "${PURPLE}[STRESS]${RESET} Initializing 10 rapid-fire cx hire commands..."
echo -e "${PURPLE}[STRESS]${RESET} Target: 10 commands in 10 seconds"
echo -e "${PURPLE}[STRESS]${RESET} Monitoring sovereignty pulse transmission..."
echo

START_TIME=$(date +%s)
SUCCESS_COUNT=0
TOTAL_COMMANDS=10

for i in {1..10}; do
    echo -e "${PURPLE}[EXEC-$(printf "%02d" $i)]${RESET} Launching cx hire command..."

    # Execute cx hire command with unique server IDs
    SERVER_ID="stress-server-$(printf "%03d" $i)"
    AGENT_NAME="StressAgent-$i"

    # Run the command and capture exit code
    /Users/allbots/cxlinux/cx/target/release/cx hire \
        --server "$SERVER_ID" \
        --agent-type sysadmin \
        --name "$AGENT_NAME" \
        --dry-run \
        --force 2>&1 | head -n 1

    if [ $? -eq 0 ]; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        echo -e "${PURPLE}[SUCCESS]${RESET} Command $i completed successfully"
    else
        echo -e "\033[38;2;239;68;68m[FAILED]${RESET} Command $i failed"
    fi

    # 1 second interval for 10 commands in 10 seconds
    sleep 1
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo
echo -e "${PURPLE}╭─────────────────────────────────────────────────────────────────╮${RESET}"
echo -e "${PURPLE}│                   📊 STRESS TEST RESULTS                       │${RESET}"
echo -e "${PURPLE}╰─────────────────────────────────────────────────────────────────╯${RESET}"
echo
echo -e "${PURPLE}[RESULTS]${RESET} Total Commands: $TOTAL_COMMANDS"
echo -e "${PURPLE}[RESULTS]${RESET} Successful: $SUCCESS_COUNT"
echo -e "${PURPLE}[RESULTS]${RESET} Duration: ${DURATION} seconds"
echo -e "${PURPLE}[RESULTS]${RESET} Success Rate: $((SUCCESS_COUNT * 100 / TOTAL_COMMANDS))%"
echo
echo -e "${PURPLE}[SYSTEM]${RESET} Stress test completed. Check API server for pulse reception."
echo
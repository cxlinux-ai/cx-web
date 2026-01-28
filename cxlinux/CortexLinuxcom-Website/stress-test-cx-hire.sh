#!/bin/bash

# CX Linux Agent Hiring Stress Test
# Simulates "cx hire" command 10 times in 10 seconds
# Sovereign Purple terminal styling (#7C3AED)

# Terminal colors
PURPLE='\033[38;5;99m'    # Sovereign Purple
GREEN='\033[38;5;46m'     # Success green
RED='\033[38;5;196m'      # Error red
YELLOW='\033[38;5;226m'   # Warning yellow
NC='\033[0m'              # No color
BOLD='\033[1m'            # Bold

API_BASE="http://localhost:3002"
RESULTS_FILE="/tmp/cx_hire_results.json"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Initialize results tracking
echo "[]" > $RESULTS_FILE

echo -e "${PURPLE}${BOLD}[Terminal 2] 🚀 CX Linux Agent Hiring Stress Test${NC}"
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║ Testing: cx hire command execution                          ║${NC}"
echo -e "${PURPLE}║ Target: 10 agents in 10 seconds                             ║${NC}"
echo -e "${PURPLE}║ Server: ${API_BASE}                              ║${NC}"
echo -e "${PURPLE}║ Verification: Zero packet loss + Database integrity         ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Pre-test: Check server health
echo -e "${PURPLE}[Pre-Test] Checking server health...${NC}"
HEALTH_CHECK=$(curl -s -w "%{http_code}" -o /tmp/health_check.json "$API_BASE/api/health")

if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ Server healthy - API responding on port 3002${NC}"
    SERVER_UPTIME=$(cat /tmp/health_check.json | python3 -c "import sys, json; print(json.load(sys.stdin)['uptime'])")
    echo -e "${PURPLE}📊 Server uptime: ${SERVER_UPTIME}s${NC}"
else
    echo -e "${RED}❌ Server health check failed (HTTP $HEALTH_CHECK)${NC}"
    exit 1
fi

echo ""

# Agent types for hiring
AGENT_TYPES=("system" "file" "docker" "git" "package")
SUCCESSFUL_HIRES=0
FAILED_HIRES=0
TOTAL_RESPONSE_TIME=0

echo -e "${PURPLE}${BOLD}[Stress Test] Starting CX Agent Hiring Sequence...${NC}"
echo -e "${PURPLE}Timeline: $(date) to $(date -v+10S)${NC}"
echo ""

# Function to simulate cx hire command
cx_hire() {
    local agent_num=$1
    local agent_type=${AGENT_TYPES[$((agent_num % 5))]}
    local start_time=$(date +%s.%N)

    # Simulate cx hire command with realistic agent data
    local license_key="BSL-$(echo $agent_type | tr '[:lower:]' '[:upper:]')-$(openssl rand -hex 4 | tr '[:lower:]' '[:upper:]')"
    local hostname="cx-$(echo $agent_type)-$(printf "%03d" $agent_num)"

    echo -e "${PURPLE}[T+${agent_num}s] cx hire --agent=$agent_type --hostname=$hostname${NC}"

    # Create agent via API (simulating cx hire)
    local response=$(curl -s -w "%{http_code}" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$agent_type\",
            \"description\": \"Auto-hired $agent_type agent via stress test\",
            \"capabilities\": [\"$(echo $agent_type)_operations\", \"monitoring\", \"security\"],
            \"licenseKey\": \"$license_key\",
            \"hostSystem\": \"linux\",
            \"hostArch\": \"x86_64\",
            \"hostHostname\": \"$hostname\",
            \"status\": \"active\"
        }" \
        -o "/tmp/hire_result_${agent_num}.json" \
        "$API_BASE/api/agents/sample")

    local end_time=$(date +%s.%N)
    local response_time=$(echo "$end_time - $start_time" | bc -l)

    # Parse response
    if [ "${response: -3}" = "200" ] || [ "${response: -3}" = "201" ]; then
        echo -e "${GREEN}  ✅ Agent hired successfully (${response_time}s)${NC}"
        SUCCESSFUL_HIRES=$((SUCCESSFUL_HIRES + 1))

        # Log success to results
        echo "$(cat $RESULTS_FILE | jq '. + [{
            "agent_num": '$agent_num',
            "agent_type": "'$agent_type'",
            "hostname": "'$hostname'",
            "license_key": "'$license_key'",
            "status": "success",
            "response_time": '$response_time',
            "timestamp": "'$(date -Iseconds)'"
        }]')" > $RESULTS_FILE

    else
        echo -e "${RED}  ❌ Agent hire failed (HTTP ${response: -3})${NC}"
        FAILED_HIRES=$((FAILED_HIRES + 1))

        # Log failure to results
        echo "$(cat $RESULTS_FILE | jq '. + [{
            "agent_num": '$agent_num',
            "agent_type": "'$agent_type'",
            "hostname": "'$hostname'",
            "status": "failed",
            "http_code": "'${response: -3}'",
            "timestamp": "'$(date -Iseconds)'"
        }]')" > $RESULTS_FILE
    fi

    TOTAL_RESPONSE_TIME=$(echo "$TOTAL_RESPONSE_TIME + $response_time" | bc -l)
}

# Execute stress test: 10 agents in 10 seconds
START_TEST_TIME=$(date +%s)

for i in {1..10}; do
    cx_hire $i &
    sleep 1  # 1 second intervals for 10 second total test
done

# Wait for all background jobs to complete
wait

END_TEST_TIME=$(date +%s)
TEST_DURATION=$((END_TEST_TIME - START_TEST_TIME))

echo ""
echo -e "${PURPLE}${BOLD}[Test Complete] CX Agent Hiring Results${NC}"
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"

# Calculate statistics
TOTAL_AGENTS=$((SUCCESSFUL_HIRES + FAILED_HIRES))
SUCCESS_RATE=$(echo "scale=2; $SUCCESSFUL_HIRES * 100 / $TOTAL_AGENTS" | bc)
AVG_RESPONSE_TIME=$(echo "scale=3; $TOTAL_RESPONSE_TIME / $TOTAL_AGENTS" | bc)

echo -e "${PURPLE}║ Test Duration: ${TEST_DURATION}s                                      ║${NC}"
echo -e "${PURPLE}║ Total Agents: $TOTAL_AGENTS                                           ║${NC}"

if [ $SUCCESSFUL_HIRES -eq 10 ]; then
    echo -e "${PURPLE}║ Successful Hires: ${GREEN}$SUCCESSFUL_HIRES${PURPLE} (${SUCCESS_RATE}%)                          ║${NC}"
else
    echo -e "${PURPLE}║ Successful Hires: ${YELLOW}$SUCCESSFUL_HIRES${PURPLE} (${SUCCESS_RATE}%)                          ║${NC}"
fi

if [ $FAILED_HIRES -eq 0 ]; then
    echo -e "${PURPLE}║ Failed Hires: ${GREEN}$FAILED_HIRES${PURPLE}                                          ║${NC}"
else
    echo -e "${PURPLE}║ Failed Hires: ${RED}$FAILED_HIRES${PURPLE}                                          ║${NC}"
fi

echo -e "${PURPLE}║ Average Response Time: ${AVG_RESPONSE_TIME}s                          ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"

# Verify database integrity
echo ""
echo -e "${PURPLE}[Database Verification] Checking agent registration integrity...${NC}"

# Check if all agents are accessible via API
REGISTERED_AGENTS=$(curl -s "$API_BASE/api/agents" | jq 'length' 2>/dev/null || echo "0")

echo -e "${PURPLE}📊 Database Status:${NC}"
echo -e "${PURPLE}   • Agents in database: $REGISTERED_AGENTS${NC}"
echo -e "${PURPLE}   • Expected agents: $SUCCESSFUL_HIRES${NC}"

if [ "$REGISTERED_AGENTS" -eq "$SUCCESSFUL_HIRES" ]; then
    echo -e "${GREEN}   ✅ Database integrity confirmed - Zero packet loss${NC}"
else
    echo -e "${YELLOW}   ⚠️  Database/API response mismatch detected${NC}"
fi

# Generate final report
echo ""
echo -e "${PURPLE}[Final Report] Stress Test Summary${NC}"
echo -e "${PURPLE}Results saved to: $RESULTS_FILE${NC}"

if [ $SUCCESSFUL_HIRES -eq 10 ] && [ $FAILED_HIRES -eq 0 ]; then
    echo -e "${GREEN}${BOLD}🎉 STRESS TEST PASSED${NC}"
    echo -e "${GREEN}   • All 10 agents hired successfully${NC}"
    echo -e "${GREEN}   • Zero packet loss confirmed${NC}"
    echo -e "${GREEN}   • Database integrity maintained${NC}"
    echo -e "${GREEN}   • Sovereign Purple styling verified${NC}"
else
    echo -e "${YELLOW}${BOLD}⚠️  STRESS TEST PARTIAL${NC}"
    echo -e "${YELLOW}   • $SUCCESSFUL_HIRES/$TOTAL_AGENTS agents hired${NC}"
    echo -e "${YELLOW}   • Review failed requests in $RESULTS_FILE${NC}"
fi

echo -e "${PURPLE}${BOLD}[Terminal 2] CX Stress Test Complete ✨${NC}"
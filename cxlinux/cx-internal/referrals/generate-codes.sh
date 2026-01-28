#!/bin/bash
# Generate referral codes for contributors
# Usage: ./generate-codes.sh "discord_handle" "discord_id"

HANDLE="$1"
DISCORD_ID="$2"

if [ -z "$HANDLE" ] || [ -z "$DISCORD_ID" ]; then
    echo "Usage: ./generate-codes.sh <discord_handle> <discord_id>"
    exit 1
fi

# Generate 4-digit random suffix
SUFFIX=$(printf "%04d" $((RANDOM % 10000)))

# Create code
CODE="CX-${HANDLE^^}-${SUFFIX}"
LINK="https://cxlinux.ai/ref/${CODE}"

echo "================================"
echo "Referral Code Generated"
echo "================================"
echo "Discord: @${HANDLE}"
echo "Code: ${CODE}"
echo "Link: ${LINK}"
echo "================================"
echo ""
echo "DM Template:"
echo ""
echo "Hey @${HANDLE}!"
echo ""
echo "Your exclusive CX Linux referral code is ready:"
echo ""
echo "Code: ${CODE}"
echo "Link: ${LINK}"
echo ""
echo "Share this with anyone interested in CX Linux."
echo "You earn 10% of their subscription, forever."
echo ""
echo "- Core+ (\$20/mo) = \$2/mo per referral"
echo "- Pro (\$99/mo) = \$9.90/mo per referral"
echo "- Enterprise (\$299/mo) = \$29.90/mo per referral"
echo ""
echo "Thanks for being part of CX!"

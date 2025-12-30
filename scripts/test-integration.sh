#!/bin/bash

# Integration Test Script
# Tests: Magic link login -> Create conversation -> AUTO mode -> Verify DB records

set -e

BASE_URL="http://localhost:3000/api"
COOKIES_FILE="test_cookies.txt"
TEST_EMAIL="integration-test-$(date +%s)@example.com"

echo "╔════════════════════════════════════════╗"
echo "║   Integration Test - AUTO Mode Flow    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Cleanup
rm -f $COOKIES_FILE

# 1. Request magic link
echo "1️⃣  Requesting magic link for $TEST_EMAIL..."
curl -s -X POST "$BASE_URL/auth/magic-link" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}" | jq .

echo "✓ Magic link sent"
echo ""

# 2. Get token from database (simulating email click)
echo "2️⃣  Retrieving magic link token from database..."
TOKEN=$(psql -d amal_chat -t -c "SELECT token FROM magic_links WHERE email = '$TEST_EMAIL' ORDER BY created_at DESC LIMIT 1" | xargs)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to retrieve token"
    exit 1
fi

echo "✓ Token retrieved: ${TOKEN:0:20}..."
echo ""

# 3. Verify magic link
echo "3️⃣  Verifying magic link..."
VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/magic-link/verify?token=$TOKEN" \
  -c $COOKIES_FILE)

USER_ID=$(echo $VERIFY_RESPONSE | jq -r '.user.id')

if [ "$USER_ID" == "null" ]; then
    echo "❌ Magic link verification failed"
    echo $VERIFY_RESPONSE | jq .
    exit 1
fi

echo "✓ Logged in as user: $USER_ID"
echo ""

# 4. Create conversation with AUTO mode
echo "4️⃣  Sending message with AUTO mode..."
CHAT_RESPONSE=$(curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d '{
    "message": "نحس روحي تحت ضغط كبير وما نعرفش كيفاش نتعامل معاه",
    "mode": "AUTO"
  }')

CONV_ID=$(echo $CHAT_RESPONSE | jq -r '.conversationId')
DECISION=$(echo $CHAT_RESPONSE | jq -r '.decision.mode')
REASON=$(echo $CHAT_RESPONSE | jq -r '.decision.reason')
CONFIDENCE=$(echo $CHAT_RESPONSE | jq -r '.decision.confidence')

if [ "$CONV_ID" == "null" ]; then
    echo "❌ Failed to create conversation"
    echo $CHAT_RESPONSE | jq .
    exit 1
fi

echo "✓ Conversation created: $CONV_ID"
echo "✓ AUTO Decision: $DECISION"
echo "✓ Reason: $REASON"
echo "✓ Confidence: $CONFIDENCE"
echo ""

# 5. Verify database records
echo "5️⃣  Verifying database records..."

# Check conversation
CONV_COUNT=$(psql -d amal_chat -t -c "SELECT COUNT(*) FROM conversations WHERE id = '$CONV_ID'" | xargs)
if [ "$CONV_COUNT" != "1" ]; then
    echo "❌ Conversation not found in database"
    exit 1
fi
echo "✓ Conversation record exists"

# Check messages
MSG_COUNT=$(psql -d amal_chat -t -c "SELECT COUNT(*) FROM messages WHERE conversation_id = '$CONV_ID'" | xargs)
if [ "$MSG_COUNT" -lt "2" ]; then
    echo "❌ Expected at least 2 messages (user + assistant)"
    exit 1
fi
echo "✓ Messages recorded: $MSG_COUNT"

# Check decision log
DECISION_COUNT=$(psql -d amal_chat -t -c "SELECT COUNT(*) FROM decision_logs WHERE conversation_id = '$CONV_ID'" | xargs)
if [ "$DECISION_COUNT" != "1" ]; then
    echo "❌ Decision log not found"
    exit 1
fi
echo "✓ Decision log recorded"

# Check audit log
AUDIT_COUNT=$(psql -d amal_chat -t -c "SELECT COUNT(*) FROM audit_logs WHERE user_id = '$USER_ID' AND action = 'chat.message'" | xargs)
if [ "$AUDIT_COUNT" -lt "1" ]; then
    echo "❌ Audit log not found"
    exit 1
fi
echo "✓ Audit log recorded"

# 6. Retrieve conversation
echo ""
echo "6️⃣  Retrieving conversation history..."
HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/chat/conversations/$CONV_ID" \
  -b $COOKIES_FILE)

HISTORY_MSG_COUNT=$(echo $HISTORY_RESPONSE | jq '.messages | length')

if [ "$HISTORY_MSG_COUNT" -lt "2" ]; then
    echo "❌ Failed to retrieve conversation history"
    exit 1
fi

echo "✓ Retrieved $HISTORY_MSG_COUNT messages"
echo ""

# 7. Test RAG mode explicitly
echo "7️⃣  Testing RAG mode explicitly..."
RAG_RESPONSE=$(curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"conversationId\": \"$CONV_ID\",
    \"message\": \"شنوا هي أعراض الإدمان؟\",
    \"mode\": \"RAG\"
  }")

RAG_DECISION=$(echo $RAG_RESPONSE | jq -r '.decision.mode')

if [ "$RAG_DECISION" != "rag" ]; then
    echo "❌ RAG mode not working correctly"
    exit 1
fi

echo "✓ RAG mode working"
echo ""

# 8. Test SUPPORT mode explicitly
echo "8️⃣  Testing SUPPORT mode explicitly..."
SUPPORT_RESPONSE=$(curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"conversationId\": \"$CONV_ID\",
    \"message\": \"نحتاج مساعدة عاجلة\",
    \"mode\": \"SUPPORT\"
  }")

SUPPORT_DECISION=$(echo $SUPPORT_RESPONSE | jq -r '.decision.mode')

if [ "$SUPPORT_DECISION" != "support" ]; then
    echo "❌ SUPPORT mode not working correctly"
    exit 1
fi

echo "✓ SUPPORT mode working"
echo ""

# 9. Create support ticket
echo "9️⃣  Creating support ticket..."
TICKET_RESPONSE=$(curl -s -X POST "$BASE_URL/support/tickets" \
  -H "Content-Type: application/json" \
  -b $COOKIES_FILE \
  -d "{
    \"conversationId\": \"$CONV_ID\",
    \"subject\": \"Integration Test Ticket\",
    \"category\": \"mental_health\",
    \"priority\": \"medium\"
  }")

TICKET_ID=$(echo $TICKET_RESPONSE | jq -r '.ticket.id')

if [ "$TICKET_ID" == "null" ]; then
    echo "❌ Failed to create support ticket"
    exit 1
fi

echo "✓ Support ticket created: $TICKET_ID"
echo ""

# 10. Cleanup
echo "🧹 Cleaning up test data..."
psql -d amal_chat -c "DELETE FROM users WHERE email = '$TEST_EMAIL'" > /dev/null
rm -f $COOKIES_FILE

echo "✓ Cleanup complete"
echo ""

# Success
echo "╔════════════════════════════════════════╗"
echo "║   ✅ All Integration Tests Passed!     ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Summary:"
echo "  ✓ Magic link authentication"
echo "  ✓ Conversation creation"
echo "  ✓ AUTO mode decision"
echo "  ✓ Database records verified"
echo "  ✓ RAG mode"
echo "  ✓ SUPPORT mode"
echo "  ✓ Support ticket creation"
echo ""

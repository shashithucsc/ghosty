# Ghosty Inbox & Chat System - Complete Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [API Endpoints](#api-endpoints)
4. [Frontend Integration](#frontend-integration)
5. [Testing Guide](#testing-guide)
6. [Security Considerations](#security-considerations)

---

## 🎯 Overview

The Ghosty Inbox & Chat System provides a complete message request and chat solution with the following features:

### Inbox Requests
- Users can send message requests to other users
- Requests are saved with `pending` status
- Recipients can accept or reject requests
- Only accepted requests allow messaging
- Block system integration prevents unwanted requests

### Chat System
- Real-time messaging between accepted connections
- Messages stored with conversation context
- Read receipts and unread counts
- Pagination for message history
- Block prevention enforced at message level

### Key Features
- ✅ Row Level Security (RLS) for all tables
- ✅ Automatic conversation creation on request acceptance
- ✅ Unread message tracking per user
- ✅ Message deletion by sender
- ✅ Conversation deletion with cascade
- ✅ Input validation with Zod
- ✅ Comprehensive error handling

---

## 🗄️ Database Setup

### Step 1: Run the Migration

Run the migration script in Supabase SQL Editor:

```bash
# File: database/migration_inbox_chat_system.sql
```

This creates:
- **inbox_requests** - Message request tracking
- **conversations** - Chat sessions between users
- **messages** - Individual chat messages
- Helper functions for common operations
- RLS policies for data security

### Step 2: Verify Tables Created

Check in Supabase Dashboard → Database → Tables:

```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('inbox_requests', 'conversations', 'messages');
```

### Step 3: Test Helper Functions

```sql
-- Test create_conversation function
SELECT create_conversation(
  'user-uuid-1'::uuid, 
  'user-uuid-2'::uuid
);

-- Test get_conversation_id function
SELECT get_conversation_id(
  'user-uuid-1'::uuid, 
  'user-uuid-2'::uuid
);

-- Test is_inbox_request_accepted function
SELECT is_inbox_request_accepted(
  'sender-uuid'::uuid, 
  'recipient-uuid'::uuid
);

-- Test get_unread_count function
SELECT get_unread_count('user-uuid'::uuid);
```

---

## 🔌 API Endpoints

### 1. Inbox Requests API

**Base URL:** `/api/inbox/requests`

#### GET - List Inbox Requests

Retrieve inbox requests (sent/received).

**Query Parameters:**
- `userId` (required) - UUID of the current user
- `type` (optional) - Filter by `received`, `sent`, or `all` (default: `all`)
- `status` (optional) - Filter by `pending`, `accepted`, `rejected`, or `all` (default: `all`)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 50)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/inbox/requests?userId=user-uuid&type=received&status=pending&page=1&limit=20"
```

**Response:**
```json
{
  "success": true,
  "requests": [
    {
      "id": "request-uuid",
      "sender_id": "sender-uuid",
      "recipient_id": "recipient-uuid",
      "status": "pending",
      "message": "Hey! Would love to connect",
      "created_at": "2025-11-12T10:00:00Z",
      "updated_at": "2025-11-12T10:00:00Z",
      "sender": {
        "id": "sender-uuid",
        "username": "ghost123",
        "profiles": {
          "full_name": "Anonymous Ghost",
          "avatar_url": "https://...",
          "verification_status": "verified"
        }
      },
      "recipient": {
        "id": "recipient-uuid",
        "username": "spooky456",
        "profiles": {
          "full_name": "Friendly Ghost",
          "avatar_url": "https://...",
          "verification_status": "unverified"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

#### POST - Send Inbox Request

Send a message request to another user.

**Request Body:**
```json
{
  "userId": "sender-uuid",
  "recipientId": "recipient-uuid",
  "message": "Hi! I'd like to connect with you" // optional
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/inbox/requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "sender-uuid",
    "recipientId": "recipient-uuid",
    "message": "Hey there!"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Inbox request sent successfully",
  "request": {
    "id": "new-request-uuid",
    "sender_id": "sender-uuid",
    "recipient_id": "recipient-uuid",
    "status": "pending",
    "message": "Hey there!",
    "created_at": "2025-11-12T10:30:00Z",
    "updated_at": "2025-11-12T10:30:00Z"
  }
}
```

**Error Responses:**
- `400` - Validation failed (invalid UUID, etc.)
- `404` - Sender or recipient not found
- `403` - Users have blocked each other
- `409` - Request already exists

#### PATCH - Accept/Reject Request

Accept or reject a pending inbox request.

**Request Body:**
```json
{
  "userId": "recipient-uuid",
  "requestId": "request-uuid",
  "action": "accept" // or "reject"
}
```

**Example Request (Accept):**
```bash
curl -X PATCH http://localhost:3000/api/inbox/requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "recipient-uuid",
    "requestId": "request-uuid",
    "action": "accept"
  }'
```

**Success Response (Accept):**
```json
{
  "success": true,
  "message": "Request accepted",
  "request": {
    "id": "request-uuid",
    "sender_id": "sender-uuid",
    "recipient_id": "recipient-uuid",
    "status": "accepted",
    "message": "Hey there!",
    "created_at": "2025-11-12T10:30:00Z",
    "updated_at": "2025-11-12T10:35:00Z"
  },
  "conversationId": "new-conversation-uuid"
}
```

**Success Response (Reject):**
```json
{
  "success": true,
  "message": "Request rejected",
  "request": {
    "id": "request-uuid",
    "status": "rejected",
    ...
  },
  "conversationId": null
}
```

**Error Responses:**
- `400` - Validation failed
- `404` - Request not found
- `403` - Only recipient can accept/reject
- `409` - Request already processed

---

### 2. Chat API

**Base URL:** `/api/chat`

#### GET - Fetch Messages

Get messages in a conversation with pagination.

**Query Parameters:**
- `userId` (required) - UUID of the current user
- `conversationId` (required) - UUID of the conversation
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Messages per page (default: 50, max: 100)
- `markAsRead` (optional) - Mark messages as read (default: false)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/chat?userId=user-uuid&conversationId=conv-uuid&page=1&limit=50&markAsRead=true"
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "message-uuid",
      "conversation_id": "conv-uuid",
      "sender_id": "sender-uuid",
      "content": "Hello! How are you?",
      "is_read": false,
      "read_at": null,
      "created_at": "2025-11-12T11:00:00Z",
      "updated_at": "2025-11-12T11:00:00Z",
      "sender": {
        "id": "sender-uuid",
        "username": "ghost123",
        "profiles": {
          "full_name": "Anonymous Ghost",
          "avatar_url": "https://..."
        }
      }
    },
    {
      "id": "message-uuid-2",
      "conversation_id": "conv-uuid",
      "sender_id": "user-uuid",
      "content": "I'm doing great, thanks!",
      "is_read": true,
      "read_at": "2025-11-12T11:01:00Z",
      "created_at": "2025-11-12T11:00:30Z",
      "updated_at": "2025-11-12T11:01:00Z",
      "sender": {
        "id": "user-uuid",
        "username": "spooky456",
        "profiles": {
          "full_name": "Friendly Ghost",
          "avatar_url": "https://..."
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 127,
    "totalPages": 3
  }
}
```

#### POST - Send Message

Send a message in a conversation.

**Request Body:**
```json
{
  "userId": "sender-uuid",
  "conversationId": "conv-uuid",
  "content": "This is my message"
}
```

**Validation Rules:**
- Content: min 1 char, max 5000 chars
- Cannot be only whitespace
- User must be conversation participant
- Inbox request must be accepted
- Users must not be blocked

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "conversationId": "conv-uuid",
    "content": "Hi! This is my message."
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "new-message-uuid",
    "conversation_id": "conv-uuid",
    "sender_id": "user-uuid",
    "content": "Hi! This is my message.",
    "is_read": false,
    "read_at": null,
    "created_at": "2025-11-12T11:15:00Z",
    "updated_at": "2025-11-12T11:15:00Z",
    "sender": {
      "id": "user-uuid",
      "username": "ghost123",
      "profiles": {
        "full_name": "Anonymous Ghost",
        "avatar_url": "https://..."
      }
    }
  }
}
```

**Error Responses:**
- `400` - Validation failed (empty/too long message)
- `404` - Conversation not found
- `403` - Not a participant / blocked / request not accepted

#### DELETE - Delete Message

Delete a message (only by sender).

**Query Parameters:**
- `userId` (required) - UUID of the current user
- `messageId` (required) - UUID of the message to delete

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/chat?userId=user-uuid&messageId=message-uuid"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

**Error Responses:**
- `404` - Message not found
- `403` - Can only delete your own messages

---

### 3. Conversations API

**Base URL:** `/api/conversations`

#### GET - List Conversations

Get all conversations for a user with last message preview.

**Query Parameters:**
- `userId` (required) - UUID of the current user
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Conversations per page (default: 20, max: 50)
- `unreadOnly` (optional) - Show only unread conversations (default: false)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/conversations?userId=user-uuid&page=1&limit=20&unreadOnly=false"
```

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv-uuid",
      "otherUser": {
        "id": "other-user-uuid",
        "username": "ghost123",
        "profiles": {
          "full_name": "Anonymous Ghost",
          "avatar_url": "https://...",
          "verification_status": "verified"
        }
      },
      "lastMessage": {
        "id": "message-uuid",
        "sender_id": "other-user-uuid",
        "content": "Hey! How are you?",
        "created_at": "2025-11-12T11:30:00Z",
        "is_read": false
      },
      "unreadCount": 3,
      "lastMessageAt": "2025-11-12T11:30:00Z",
      "createdAt": "2025-11-10T09:00:00Z"
    }
  ],
  "totalUnread": 8,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

#### DELETE - Delete Conversation

Delete a conversation and all its messages.

**Query Parameters:**
- `userId` (required) - UUID of the current user
- `conversationId` (required) - UUID of the conversation to delete

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/conversations?userId=user-uuid&conversationId=conv-uuid"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

**Error Responses:**
- `404` - Conversation not found
- `403` - Not a participant in the conversation

---

## ⚛️ Frontend Integration

### React Inbox Requests Component

```tsx
'use client';

import { useState, useEffect } from 'react';

interface InboxRequest {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: string;
  message: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    profiles: {
      full_name: string;
      avatar_url: string;
      verification_status: string;
    };
  };
}

export default function InboxRequests({ userId }: { userId: string }) {
  const [requests, setRequests] = useState<InboxRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRequests();
  }, [page]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(
        `/api/inbox/requests?userId=${userId}&type=received&status=pending&page=${page}&limit=20`
      );
      const data = await res.json();
      
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch('/api/inbox/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, requestId, action }),
      });

      const data = await res.json();

      if (data.success) {
        // Remove from list
        setRequests(prev => prev.filter(r => r.id !== requestId));
        
        if (action === 'accept' && data.conversationId) {
          // Navigate to chat
          window.location.href = `/chat/${data.conversationId}`;
        }
      }
    } catch (error) {
      console.error('Error handling request:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Inbox Requests</h2>
      
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending requests</p>
      ) : (
        requests.map((request) => (
          <div key={request.id} className="border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <img
                src={request.sender.profiles.avatar_url || '/default-avatar.png'}
                alt={request.sender.username}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <p className="font-semibold">{request.sender.profiles.full_name}</p>
                <p className="text-sm text-gray-600">@{request.sender.username}</p>
                {request.message && (
                  <p className="text-sm mt-1">{request.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRequest(request.id, 'accept')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRequest(request.id, 'reject')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
```

### React Chat Component

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender: {
    username: string;
    profiles: {
      full_name: string;
      avatar_url: string;
    };
  };
}

export default function ChatWindow({ 
  userId, 
  conversationId 
}: { 
  userId: string; 
  conversationId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `/api/chat?userId=${userId}&conversationId=${conversationId}&markAsRead=true`
      );
      const data = await res.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          conversationId,
          content: newMessage.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === userId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={5000}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

### React Conversations List Component

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    username: string;
    profiles: {
      full_name: string;
      avatar_url: string;
      verification_status: string;
    };
  };
  lastMessage: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
}

export default function ConversationsList({ userId }: { userId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/conversations?userId=${userId}`);
      const data = await res.json();
      
      if (data.success) {
        setConversations(data.conversations);
        setTotalUnread(data.totalUnread);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading conversations...</div>;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Messages</h2>
        {totalUnread > 0 && (
          <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">
            {totalUnread} unread
          </span>
        )}
      </div>

      {conversations.length === 0 ? (
        <p className="text-gray-500">No conversations yet</p>
      ) : (
        conversations.map((conv) => (
          <Link
            key={conv.id}
            href={`/chat/${conv.id}`}
            className="block border rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={conv.otherUser.profiles.avatar_url || '/default-avatar.png'}
                  alt={conv.otherUser.username}
                  className="w-12 h-12 rounded-full"
                />
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">
                    {conv.otherUser.profiles.full_name}
                  </p>
                  {conv.otherUser.profiles.verification_status === 'verified' && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
                
                {conv.lastMessage && (
                  <p className={`text-sm truncate ${
                    conv.unreadCount > 0 ? 'font-semibold' : 'text-gray-600'
                  }`}>
                    {conv.lastMessage.sender_id === userId ? 'You: ' : ''}
                    {conv.lastMessage.content}
                  </p>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                {new Date(conv.lastMessageAt).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
```

---

## 🧪 Testing Guide

### 1. Test Inbox Request Flow

```bash
# Step 1: Send inbox request
curl -X POST http://localhost:3000/api/inbox/requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "sender-uuid",
    "recipientId": "recipient-uuid",
    "message": "Hi! Would love to connect"
  }'

# Step 2: List received requests (as recipient)
curl -X GET "http://localhost:3000/api/inbox/requests?userId=recipient-uuid&type=received&status=pending"

# Step 3: Accept the request
curl -X PATCH http://localhost:3000/api/inbox/requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "recipient-uuid",
    "requestId": "request-uuid-from-step-1",
    "action": "accept"
  }'
# Save the conversationId from response

# Step 4: Verify conversation created
curl -X GET "http://localhost:3000/api/conversations?userId=recipient-uuid"
```

### 2. Test Chat Flow

```bash
# Step 1: Send first message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "sender-uuid",
    "conversationId": "conv-uuid-from-accept",
    "content": "Hello! Nice to meet you"
  }'

# Step 2: Send reply
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "recipient-uuid",
    "conversationId": "conv-uuid",
    "content": "Hi! Nice to meet you too!"
  }'

# Step 3: Fetch messages (and mark as read)
curl -X GET "http://localhost:3000/api/chat?userId=sender-uuid&conversationId=conv-uuid&markAsRead=true"

# Step 4: Verify unread count updated
curl -X GET "http://localhost:3000/api/conversations?userId=sender-uuid"
```

### 3. Test Block Prevention

```bash
# Step 1: Block a user (using blocks table from recommendation system)
INSERT INTO blocks (blocker_id, blocked_id) 
VALUES ('user1-uuid', 'user2-uuid');

# Step 2: Try to send inbox request (should fail)
curl -X POST http://localhost:3000/api/inbox/requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1-uuid",
    "recipientId": "user2-uuid",
    "message": "Test"
  }'
# Expected: 403 error "Cannot send request to this user"

# Step 3: Try to send message in existing conversation (should fail)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1-uuid",
    "conversationId": "existing-conv-uuid",
    "content": "Test message"
  }'
# Expected: 403 error "Cannot send messages to this user"
```

### 4. Test Validation

```bash
# Test empty message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "conversationId": "conv-uuid",
    "content": "   "
  }'
# Expected: 400 error "Message cannot be only whitespace"

# Test message too long
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"user-uuid\",
    \"conversationId\": \"conv-uuid\",
    \"content\": \"$(python3 -c 'print(\"a\" * 5001)')\"
  }"
# Expected: 400 error "Message too long"

# Test invalid UUID
curl -X GET "http://localhost:3000/api/chat?userId=invalid&conversationId=conv-uuid"
# Expected: 400 error "Invalid user ID format"
```

---

## 🔒 Security Considerations

### Current Implementation

✅ **Row Level Security (RLS)**
- All tables have RLS enabled
- Users can only view/modify their own data
- Conversation participants enforced via RLS policies

✅ **Input Validation**
- Zod schemas validate all inputs
- Message length limits enforced
- UUID format validation
- Content sanitization (trim whitespace)

✅ **Authorization Checks**
- Verify user is conversation participant
- Only recipient can accept/reject requests
- Only sender can delete their messages
- Block enforcement at API level

⚠️ **Missing (TODO)**
- JWT authentication not implemented
- Rate limiting not configured
- XSS prevention (need to sanitize HTML in messages)
- CSRF protection
- Webhook/real-time notifications

### Recommendations

#### 1. Add JWT Authentication

```typescript
// middleware/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function verifyAuth(request: NextRequest, userId: string) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No authentication token provided');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    if (decoded.userId !== userId) {
      throw new Error('Token does not match user');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Usage in API route:
// await verifyAuth(request, userId);
```

#### 2. Add Rate Limiting

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache({
  max: 500,
  ttl: 60000, // 1 minute
});

export function rateLimit(identifier: string, limit: number = 10): boolean {
  const count = (rateLimitCache.get(identifier) as number) || 0;
  
  if (count >= limit) {
    return false; // Rate limit exceeded
  }
  
  rateLimitCache.set(identifier, count + 1);
  return true;
}

// Usage in API route:
// if (!rateLimit(`send-message:${userId}`, 20)) {
//   return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
// }
```

#### 3. Sanitize Message Content

```typescript
import DOMPurify from 'isomorphic-dompurify';

// In POST /api/chat before saving
const sanitizedContent = DOMPurify.sanitize(content.trim(), {
  ALLOWED_TAGS: [], // No HTML tags allowed
  ALLOWED_ATTR: [],
});
```

#### 4. Add Real-time Updates

Consider integrating:
- Supabase Realtime for live message updates
- WebSockets for instant notifications
- Server-Sent Events (SSE) for message streaming

```typescript
// Example: Subscribe to new messages
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    },
    (payload) => {
      console.log('New message:', payload.new);
      // Update UI
    }
  )
  .subscribe();
```

---

## 📝 Environment Variables

Ensure these are set in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secret (add this)
JWT_SECRET=your-secret-key-here

# Optional: Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=20
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Run `migration_inbox_chat_system.sql` in production Supabase
- [ ] Verify all RLS policies are active
- [ ] Add JWT authentication to all endpoints
- [ ] Implement rate limiting
- [ ] Add message content sanitization
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure real-time subscriptions
- [ ] Test all error scenarios
- [ ] Add logging for debugging
- [ ] Document API for frontend team

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Zod Validation Library](https://zod.dev/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/trigger-definition.html)

---

## 🐛 Troubleshooting

### Issue: "Conversation not found" error

**Solution:** Verify conversation was created when request was accepted. Check:
```sql
SELECT * FROM conversations WHERE user1_id = 'uuid1' AND user2_id = 'uuid2';
```

### Issue: Messages not marked as read

**Solution:** Ensure `markAsRead=true` is passed in GET request:
```bash
curl -X GET "http://localhost:3000/api/chat?userId=user-uuid&conversationId=conv-uuid&markAsRead=true"
```

### Issue: "Inbox request must be accepted" error

**Solution:** Verify request status is 'accepted':
```sql
SELECT status FROM inbox_requests 
WHERE (sender_id = 'uuid1' AND recipient_id = 'uuid2')
   OR (sender_id = 'uuid2' AND recipient_id = 'uuid1');
```

### Issue: Unread count not updating

**Solution:** Check the trigger is firing:
```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_conversation_on_message';

-- Manually test trigger function
SELECT update_conversation_on_message();
```

---

**You're all set!** 🎉 The Ghosty Inbox & Chat system is ready to deploy.

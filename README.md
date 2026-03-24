# SyncTalk - Real-Time Messaging Application

## Project Overview

SyncTalk is a modern, real-time messaging application built with Next.js 16, React, TypeScript, and Tailwind CSS. It features secure authentication, cross-user direct messaging, presence tracking, typing indicators, and comprehensive user settings management.

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Framework**: React 19.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API
- **Component Library**: shadcn/ui

### Backend (In-Memory for Demo)
- **Runtime**: Next.js API Routes
- **Authentication**: Custom JWT-based sessions with SHA-256 password hashing
- **Data Storage**: In-memory (localStorage for persistence)

### Security
- Password hashing using Web Crypto API (SHA-256)
- Password strength validation (minimum 8 chars, uppercase, lowercase, numbers, special chars)
- Session token management with 30-minute timeout
- Protected routes with authentication checks
- Read receipts and user presence tracking

---

## Core Features

### 1. Authentication & Security
- **Signup Page** (`/app/signup/page.tsx`): User registration with strong password requirements
  - Email validation
  - Password strength indicator with real-time feedback
  - Password confirmation matching
  - SHA-256 password hashing
  
- **Login Page** (`/app/login/page.tsx`): Secure login with session management
  - Demo credentials: alice/Password1!, bob/Password2!, charlie/Password3!
  - Session token generation
  - 30-minute session timeout
  
- **Security Layer** (`/lib/auth.ts`):
  - `hashPassword()` - SHA-256 password hashing
  - `verifyPassword()` - Password verification
  - `validatePasswordStrength()` - Password complexity validation
  - `createSession()` - Session token generation
  - `isSessionExpired()` - Session timeout checking

- **Session Manager** (`/lib/session.ts`):
  - `SessionManager.saveSession()` - Persist session to localStorage
  - `SessionManager.getSession()` - Retrieve and validate session
  - `SessionManager.isAuthenticated()` - Check if user is logged in
  - `SessionManager.clearSession()` - Secure logout

### 2. Real-Time Messaging
- **Chat Interface** (`/app/chat/page.tsx`): Protected chat page with full messaging functionality
- **Message Components**:
  - `ChatMain` (`/components/chat-main.tsx`) - Main chat area with message display
  - `MessageItem` (`/components/message-item.tsx`) - Individual message rendering
  - `MessageInput` (`/components/message-input.tsx`) - Message composition
  - `MessageSearch` (`/components/message-search.tsx`) - Search and filter messages
  
- **Message Features**:
  - Real-time message sending
  - Message status tracking (sent/delivered/read)
  - Timestamps for all messages
  - Message content filtering and search

### 3. Conversation Management
- **Conversations Sidebar** (`/components/conversation-sidebar.tsx`):
  - Organized into "Channels" (group conversations) and "Direct Messages"
  - Create new direct messages with dropdown user selection
  - Switch between conversations
  - Active conversation highlighting

- **Conversation Types**:
  - Group channels: General, Development, Random
  - Direct messages: One-to-one conversations with other users
  - Cross-user messaging capability

### 4. Presence & Activity Tracking
- **Presence Panel** (`/components/presence-panel.tsx`):
  - Real-time user status display (online/away/offline)
  - User list with status indicators
  - Last seen timestamps
  - Visual status color coding
  
- **Typing Indicators**:
  - Real-time typing detection
  - Animated typing indicator showing who's typing
  - Auto-clear after 1 second of inactivity

### 5. User Settings & Preferences
- **Settings Context** (`/lib/settings-context.tsx`):
  - Global state management for user preferences
  - Persistent settings storage to localStorage
  - Settings Provider for React Context integration

- **User Settings Page** (`/app/settings/page.tsx`):
  - **Notifications**: Enable/disable push notifications and sound
  - **Privacy & Visibility**: 
    - Status control (online/away/offline)
    - Direct message filtering (from anyone, known users only, nobody)
    - Last activity visibility toggle
  - **Message Settings**: Read receipt control
  - **Account**: Reset settings or logout

- **Settings Fields**:
  ```typescript
  {
    notifications: boolean;      // Push notifications enabled
    soundEnabled: boolean;        // Sound effects enabled
    status: 'online' | 'away' | 'offline';
    privateMessages: 'all' | 'friends' | 'none';
    readReceipts: boolean;        // Show when messages are read
    lastActivityVisible: boolean; // Display last seen time
  }
  ```

### 6. User Profiles
- **User Profile Component** (`/components/user-profile.tsx`):
  - View user information (username, email, join date, user ID)
  - User status indicator with color-coded badges
  - Message and block user actions
  - Member avatar with initials

### 7. Chat Features
- **Message Search** (`/components/message-search.tsx`):
  - Search by message content
  - Filter by sender name
  - Search all fields at once
  - Clear search functionality

- **Typing Indicators**: Real-time feedback when users are typing
- **Message Status**: Track message delivery and read status
- **Message Timestamps**: All messages include creation timestamps
- **User Avatars**: Color-coded avatars with user initials

---

## File Structure

```
/
├── app/
│   ├── layout.tsx                 # Root layout with dark theme
│   ├── globals.css                # Global styles and design tokens
│   ├── page.tsx                   # Landing page
│   ├── login/
│   │   └── page.tsx              # Login page with password auth
│   ├── signup/
│   │   └── page.tsx              # Signup page with validation
│   ├── chat/
│   │   └── page.tsx              # Protected chat interface
│   └── settings/
│       └── page.tsx              # User settings page
│
├── lib/
│   ├── auth.ts                    # Password hashing and session management
│   ├── session.ts                 # SessionManager class for auth
│   ├── store.ts                   # Data types and mock data
│   ├── chat-context.tsx           # Chat state management
│   └── settings-context.tsx       # Settings state management
│
├── components/
│   ├── chat-main.tsx              # Main chat area
│   ├── conversation-sidebar.tsx   # Conversations list
│   ├── presence-panel.tsx         # Online users display
│   ├── message-item.tsx           # Single message component
│   ├── message-input.tsx          # Message compose area
│   ├── message-search.tsx         # Message search/filter
│   ├── settings-panel.tsx         # Settings modal
│   └── user-profile.tsx           # User profile view
│
└── v0_plans/
    └── synctalk-features.md       # Implementation plan
```

---

## Data Models

### User Interface
```typescript
interface User {
  id: string;
  username: string;
  email?: string;
  passwordHash?: string;
  createdAt: string;
  status?: 'online' | 'offline' | 'away';
  avatar?: string;
}
```

### Message Interface
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  createdAt: string;
  isTyping?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  readBy?: string[];
}
```

### Conversation Interface
```typescript
interface Conversation {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  members: string[];
  lastMessage?: Message;
  isDirect?: boolean;
  recipientId?: string;
}
```

### Presence Interface
```typescript
interface Presence {
  userId: string;
  username: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
}
```

### Session Interface
```typescript
interface Session {
  token: string;
  userId: string;
  username: string;
  createdAt: number;
  expiresAt: number;
}
```

---

## Authentication Flow

1. **Sign Up** (`/signup`):
   - User enters username, email, password
   - Password strength validated (8+ chars, uppercase, lowercase, numbers, special chars)
   - Password hashed using SHA-256
   - Session created and stored

2. **Login** (`/login`):
   - User enters credentials
   - Password verified against stored hash
   - Session token generated (30-minute timeout)
   - User redirected to `/chat`

3. **Protected Routes**:
   - `/chat` requires valid session
   - Redirects to `/login` if not authenticated

4. **Logout**:
   - Session cleared from localStorage
   - User redirected to home page

---

## Demo Credentials

For testing the application, use these pre-configured accounts:

| Username | Password   | User ID |
|----------|-----------|---------|
| alice    | Password1! | 1       |
| bob      | Password2! | 2       |
| charlie  | Password3! | 3       |

---

## Features Breakdown

### Messaging Features
- Create direct messages with any user
- Send messages in group channels
- Search messages by content or sender
- Real-time typing indicators
- Message status tracking
- Read receipts

### User Experience
- Dark theme by default
- Responsive three-column layout
- Smooth animations and transitions
- User avatars with initials
- Status indicators with color coding
- Organized conversation list

### Privacy & Security
- Password strength requirements
- Secure password hashing
- Session-based authentication
- Customizable privacy settings
- Read receipt control
- Last activity visibility toggle
- Direct message filtering

### Settings Management
- Notification preferences
- Sound effects control
- Status management
- Private message filtering
- Read receipt visibility
- Activity visibility

---

## How to Test

### 1. Create a New Account
- Visit `/signup`
- Enter username, email, and password
- Password must contain: 8+ chars, uppercase, lowercase, numbers, special char (!@#$%^&*)

### 2. Login with Demo Account
- Visit `/login`
- Use credentials: alice/Password1!, bob/Password2!, or charlie/Password3!

### 3. Test Chat Features
- Select conversations from the sidebar
- Send messages in channels or direct messages
- Click "+ New Message" to start a direct chat
- Type to see typing indicators
- Search messages with the search bar

### 4. Configure Settings
- Click settings icon in chat header
- Or visit `/settings` directly
- Adjust notifications, privacy, and message preferences
- Changes are saved automatically

### 5. View User Profiles
- Click "View Profile" on any message
- See user information and status
- Access message and block options

---

## Security Considerations

### Implemented
- Password hashing with SHA-256
- Password strength validation
- Session token management
- 30-minute session timeout
- Protected routes
- User authentication checks

### Production Recommendations
- Use bcrypt or Argon2 for password hashing
- Implement HTTPS/TLS for all communications
- Use secure HTTP-only cookies for sessions
- Add rate limiting on auth endpoints
- Implement CSRF protection
- Add user input validation and sanitization
- Use environment variables for secrets
- Implement proper error handling
- Add audit logging for sensitive actions
- Use a proper database (PostgreSQL, MongoDB, etc.)

---

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance Optimizations

- React Context for local state management
- Debounced typing indicators
- Message virtualization ready
- Optimized component rendering
- CSS-in-JS with Tailwind for minimal bundle size

---

## Future Enhancements

- Media sharing (images, files)
- Message reactions and emojis
- Voice and video calls
- Group management (create, delete, permissions)
- Message history/archiving
- User blocking and muting
- Bot integration
- Message threads/replies
- Message pinning
- User mentions/tags
- Database integration (Supabase, Neon, etc.)
- Real WebSocket implementation with Socket.io
- Mobile app with React Native
- Two-factor authentication
- OAuth integration (Google, GitHub, etc.)

---

## Development Notes

### Adding New Features
1. Update data types in `/lib/store.ts`
2. Extend context in `/lib/chat-context.tsx` or `/lib/settings-context.tsx`
3. Create new components in `/components/`
4. Update pages in `/app/`
5. Ensure settings are persisted to localStorage

### Modifying Authentication
- Password requirements are in `/lib/auth.ts` (`validatePasswordStrength`)
- Session timeout is set in `/lib/auth.ts` (30 minutes)
- Demo credentials are in `/app/login/page.tsx`

### Styling
- All colors use design tokens defined in `/app/globals.css`
- Use Tailwind CSS utility classes
- Dark theme enabled by default in `/app/layout.tsx`

---

## License

This is a demo application created for educational purposes.

---

**Last Updated**: March 2026  
**Version**: 1.0.0

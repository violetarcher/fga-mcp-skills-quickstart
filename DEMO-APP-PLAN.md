# Demo App Scaffold - Implementation Plan

**Status:** Ready for Implementation
**Date:** 2026-03-26
**Purpose:** Blank canvas Next.js app for sales engineers to build custom FGA demos

---

## Philosophy: Blank Canvas, Not Pre-Built Demo

The demo app is a **framework**, not a finished product. Sales engineers use Claude Code to build customer-specific demos based on their authorization requirements.

### What's Included (Out of the Box)
- ✅ Next.js 15 with App Router + TypeScript
- ✅ Auth0 authentication (working login/logout)
- ✅ Auth0 FGA SDK configured with helper functions
- ✅ LiteLLM chat agent (unprotected by default)
- ✅ Basic UI components (login, profile, chat)
- ✅ Empty pages (Claude Code fills these in)
- ✅ Generic API routes
- ✅ Example patterns for reference

### What's NOT Included (Built with Claude Code)
- ❌ Authorization model (designed per customer)
- ❌ Protected routes/pages (added per use case)
- ❌ Business logic (defined per demo)
- ❌ Custom UI components (built per scenario)

---

## Directory Structure

```
demo-app/
├── README.md                              # Quick start for sales engineers
├── SETUP-AUTH0.md                         # Auth0 application setup guide
├── SETUP-LITELLM.md                       # LiteLLM key generation guide
├── package.json
├── .env.local.example                     # Template with all variables
├── .gitignore                             # Includes .env.local
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
│
├── src/
│   ├── lib/
│   │   ├── fga.ts                         # FGA helper functions
│   │   ├── litellm.ts                     # LiteLLM chat client
│   │   └── auth0.ts                       # Auth0 utilities
│   │
│   ├── middleware.ts                      # Auth0 middleware (NO FGA by default)
│   │
│   ├── app/
│   │   ├── layout.tsx                     # Root layout with Auth0Provider
│   │   ├── page.tsx                       # Home page with chat + login
│   │   ├── globals.css                    # Tailwind styles
│   │   │
│   │   ├── auth/
│   │   │   └── [...auth0]/route.ts        # Auth0 authentication routes
│   │   │
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts               # LiteLLM chat endpoint
│   │   │   │
│   │   │   └── fga/
│   │   │       └── check/route.ts         # Generic FGA check endpoint
│   │   │
│   │   └── dashboard/
│   │       └── page.tsx                   # Empty dashboard (Claude builds)
│   │
│   └── components/
│       ├── ChatAgent.tsx                  # LiteLLM chat UI
│       ├── LoginButton.tsx                # Auth0 login
│       ├── LogoutButton.tsx               # Auth0 logout
│       └── Profile.tsx                    # User profile display
│
├── examples/                              # Reference patterns (not used by app)
│   ├── README.md                          # How to use examples
│   │
│   ├── fga-patterns/
│   │   ├── check-permission.tsx.example   # How to check permissions
│   │   ├── list-objects.tsx.example       # How to list accessible objects
│   │   ├── protect-route.tsx.example      # How to protect a page
│   │   ├── protect-api.ts.example         # How to protect an API route
│   │   └── middleware-fga.ts.example      # How to add FGA to middleware
│   │
│   ├── models/
│   │   ├── starter.fga                    # Minimal starting model
│   │   ├── document-management.fga        # Document sharing model
│   │   ├── saas-multi-tenant.fga          # Multi-tenant SaaS model
│   │   ├── healthcare-hipaa.fga           # Healthcare HIPAA model
│   │   └── demo-tuples.json               # Sample relationship data
│   │
│   └── ui-components/
│       ├── PermissionGate.tsx.example     # Conditional rendering by permission
│       └── TupleManager.tsx.example       # UI to manage relationships
│
└── scripts/
    └── setup-demo.sh                      # Guided setup script
```

---

## Core Files Implementation

### 1. `.env.local.example`

```bash
# Auth0 Configuration
AUTH0_SECRET='<generate-with-openssl-rand-hex-32>'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://<your-tenant>.auth0.com'
AUTH0_CLIENT_ID='<from-auth0-dashboard>'
AUTH0_CLIENT_SECRET='<from-auth0-dashboard>'

# Auth0 FGA Configuration
FGA_API_URL='https://api.us1.fga.dev'
FGA_STORE_ID='<your-store-id>'
FGA_API_TOKEN='<your-api-token>'

# LiteLLM Configuration
LITELLM_API_KEY='<your-litellm-key>'
LITELLM_BASE_URL='https://llm.atko.ai'
LITELLM_MODEL='claude-4-6-sonnet'
```

### 2. `src/lib/fga.ts` - Generic FGA Helpers

```typescript
import { FGA } from '@auth0/fga';

const fga = new FGA({
  apiUrl: process.env.FGA_API_URL!,
  storeId: process.env.FGA_STORE_ID!,
  apiToken: process.env.FGA_API_TOKEN!,
});

/**
 * Check if a user has permission to perform an action on an object
 * @example await checkPermission('user:alice', 'can_read', 'document:readme')
 */
export async function checkPermission(
  user: string,
  relation: string,
  object: string
): Promise<boolean> {
  const { allowed } = await fga.check({ user, relation, object });
  return allowed;
}

/**
 * List all objects of a type that a user can access
 * @example await listObjects('user:alice', 'can_read', 'document')
 */
export async function listObjects(
  user: string,
  relation: string,
  type: string
): Promise<string[]> {
  const { objects } = await fga.listObjects({ user, relation, type });
  return objects;
}

/**
 * Write a relationship tuple (grant permission)
 * @example await writeRelationship('user:alice', 'owner', 'document:readme')
 */
export async function writeRelationship(
  user: string,
  relation: string,
  object: string
): Promise<void> {
  await fga.write({
    writes: [{ user, relation, object }]
  });
}

/**
 * Delete a relationship tuple (revoke permission)
 * @example await deleteRelationship('user:bob', 'viewer', 'document:readme')
 */
export async function deleteRelationship(
  user: string,
  relation: string,
  object: string
): Promise<void> {
  await fga.write({
    deletes: [{ user, relation, object }]
  });
}

// Export the raw client for advanced usage
export { fga };
```

### 3. `src/lib/litellm.ts` - LiteLLM Client

```typescript
/**
 * Send a chat completion request to LiteLLM
 * @param messages - Array of chat messages
 * @param model - Model to use (defaults to env var)
 * @returns AI response text
 */
export async function chatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = process.env.LITELLM_MODEL || 'claude-4-6-sonnet'
): Promise<string> {
  const response = await fetch(`${process.env.LITELLM_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LITELLM_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LiteLLM error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Send a streaming chat completion request
 * @param messages - Array of chat messages
 * @param onChunk - Callback for each chunk
 */
export async function chatCompletionStream(
  messages: Array<{ role: string; content: string }>,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch(`${process.env.LITELLM_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LITELLM_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.LITELLM_MODEL || 'claude-4-6-sonnet',
      messages,
      stream: true
    })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error('No response body');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) onChunk(content);
        } catch (e) {
          // Skip malformed JSON
        }
      }
    }
  }
}
```

### 4. `src/middleware.ts` - Basic Auth0 Middleware

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';

/**
 * Basic Auth0 middleware
 * NOTE: This does NOT include FGA checks by default
 * Sales engineers add FGA protection using Claude Code
 */
export async function middleware(request: NextRequest) {
  // Skip auth routes
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Check if accessing dashboard (requires login)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const session = await getSession();

    if (!session?.user) {
      // Redirect to login
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 5. `src/app/api/chat/route.ts` - LiteLLM Chat API

```typescript
import { NextRequest } from 'next/server';
import { chatCompletion } from '@/lib/litellm';

/**
 * Chat endpoint using LiteLLM
 * NOTE: This is NOT protected by FGA by default
 * Sales engineers add protection using Claude Code if needed
 */
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const response = await chatCompletion(messages);

    return Response.json({ message: response });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: error.message || 'Failed to get chat response' },
      { status: 500 }
    );
  }
}
```

### 6. `src/components/ChatAgent.tsx` - Chat UI

```tsx
'use client';

import { useState } from 'react';

export function ChatAgent() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: `Error: ${data.error}` }]);
      }
    } catch (error: any) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white shadow-lg">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <p className="text-sm text-gray-600">Powered by LiteLLM</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-8">Start a conversation...</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 text-gray-600">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 7. `src/app/page.tsx` - Home Page

```tsx
import { getSession } from '@auth0/nextjs-auth0';
import { LoginButton } from '@/components/LoginButton';
import { LogoutButton } from '@/components/LogoutButton';
import { Profile } from '@/components/Profile';
import { ChatAgent } from '@/components/ChatAgent';

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Auth0 FGA Demo</h1>
          {session?.user ? <LogoutButton /> : <LoginButton />}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {session?.user ? (
          <div className="space-y-8">
            <Profile />
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">AI Chat Assistant</h2>
              <p className="text-gray-600 mb-4">
                This chat agent is <strong>not protected by FGA by default</strong>.
                Use Claude Code to add authorization checks based on your demo requirements.
              </p>
              <ChatAgent />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to the FGA Demo Quickstart
            </h2>
            <p className="text-gray-600 mb-8">
              This is a blank canvas. Sign in and use Claude Code to build your custom demo.
            </p>
            <LoginButton />
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## Example Patterns

### `examples/fga-patterns/check-permission.tsx.example`

```tsx
'use server';

import { getSession } from '@auth0/nextjs-auth0';
import { checkPermission } from '@/lib/fga';

export default async function ProtectedPage() {
  const session = await getSession();
  const userId = session?.user.sub;

  // Check if user can view this document
  const canView = await checkPermission(
    `user:${userId}`,
    'can_view',
    'document:demo'
  );

  if (!canView) {
    return <div>Access Denied</div>;
  }

  return <div>Protected Content</div>;
}
```

### `examples/models/starter.fga`

```
model
  schema 1.1

type user

type resource
  relations
    define owner: [user]
    define viewer: [user] or owner
    define can_view: viewer
    define can_edit: owner
```

---

## Setup Guides

### `SETUP-AUTH0.md` - Auth0 Application Setup

**Step 1: Create Auth0 Application**
1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Applications → Create Application
3. Name: "FGA Demo App"
4. Type: "Regular Web Application"
5. Click "Create"

**Step 2: Configure Settings**
- **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`

**Step 3: Get Credentials**
- Copy **Domain** (e.g., `your-tenant.auth0.com`)
- Copy **Client ID**
- Copy **Client Secret**

**Step 4: Create Test Users**
1. User Management → Users → Create User
2. Create demo users:
   - alice@demo.com (password: Demo123!)
   - bob@demo.com (password: Demo123!)

### `SETUP-LITELLM.md` - LiteLLM Key Generation

**Option 1: Use Existing Key**
If you already have a LiteLLM key from your organization, use it in `.env.local`.

**Option 2: Generate Demo Key**
1. Contact your LiteLLM administrator
2. Request a key with access to `claude-4-6-sonnet`
3. Add to `.env.local`

**Available Models:**
- `claude-4-6-sonnet` (recommended)
- `claude-4-5-opus`
- `claude-4-5-sonnet`
- `claude-4-5-haiku`

---

## Sales Engineer Workflow

### 1. Initial Setup (One Time)
```bash
# Install MCP server + skill
cd fga-mcp-skills-quickstart
./install.sh

# Set up demo app
cd demo-app
npm install
cp .env.local.example .env.local

# Edit .env.local with Auth0 + FGA + LiteLLM credentials
```

### 2. Build Custom Demo with Claude Code
```bash
# Start Claude Code in demo-app directory
cd demo-app
claude

# Example: Healthcare demo
> I'm demoing to a healthcare company. Build a patient record system where:
> - Doctors can view and edit their patients' records
> - Nurses can only view records for patients in their care team
> - Patients can view their own records
> - Add FGA checks to all pages and protect the chat agent so only staff can use it

# Claude Code will:
# 1. Design FGA model for healthcare
# 2. Create pages: /patients, /patients/[id], /admin
# 3. Add API routes with FGA checks
# 4. Build UI components
# 5. Deploy model to FGA store
# 6. Write demo tuples
```

### 3. Run Demo
```bash
npm run dev
# Open http://localhost:3000
# Log in as different users to demonstrate permissions
```

---

## Package Dependencies

```json
{
  "dependencies": {
    "@auth0/nextjs-auth0": "^4.0.0",
    "@auth0/fga": "^latest",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^latest",
    "@types/react": "^latest",
    "typescript": "^latest",
    "tailwindcss": "^latest",
    "postcss": "^latest",
    "autoprefixer": "^latest"
  }
}
```

---

## Implementation Checklist

- [ ] Create demo-app directory structure
- [ ] Set up Next.js with TypeScript + Tailwind
- [ ] Install dependencies (Auth0, FGA, Next.js)
- [ ] Create .env.local.example with all variables
- [ ] Implement lib/fga.ts helper functions
- [ ] Implement lib/litellm.ts client
- [ ] Implement lib/auth0.ts utilities
- [ ] Create Auth0 authentication routes
- [ ] Implement basic middleware (Auth0 only)
- [ ] Create ChatAgent component
- [ ] Create Login/Logout/Profile components
- [ ] Implement /api/chat route for LiteLLM
- [ ] Implement /api/fga/check generic route
- [ ] Create home page with chat
- [ ] Create empty dashboard page
- [ ] Add example patterns in /examples
- [ ] Write SETUP-AUTH0.md guide
- [ ] Write SETUP-LITELLM.md guide
- [ ] Write demo-app README.md
- [ ] Create setup-demo.sh script
- [ ] Test full workflow
- [ ] Update main README.md with demo app section
- [ ] Update CLAUDE-CODE-SETUP.md with demo app section

---

## Success Criteria

✅ Sales engineer can set up demo in <15 minutes
✅ Claude Code can build custom demos based on use cases
✅ LiteLLM chat works out of the box
✅ FGA helper functions are easy to use
✅ Example patterns provide clear guidance
✅ No hardcoded authorization logic
✅ Works as blank canvas for any customer scenario

---

**End of Plan**

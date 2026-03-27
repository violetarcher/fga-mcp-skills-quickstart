# Auth0 FGA (Okta FGA) - Hosted Service Specifics

Auth0 FGA (now Okta Fine-Grained Authorization) is the fully managed, hosted version of OpenFGA available at **dashboard.fga.dev**. This section provides specific guidance for working with the hosted service, including CLI commands, SDK integration, and store management.

## Differences: Auth0 FGA vs Self-Hosted OpenFGA

| Aspect | Auth0 FGA (Hosted) | OpenFGA (Self-Hosted) |
|--------|-------------------|----------------------|
| **Hosting** | Fully managed at dashboard.fga.dev | Self-hosted infrastructure |
| **Configuration** | Store ID + API Token | Custom deployment URL |
| **API URL** | `https://api.us1.fga.dev` (regional) | Your deployment URL |
| **Management** | Web dashboard + CLI | CLI + API only |
| **SLA** | Production SLA included | Your responsibility |
| **Modeling Language** | Same DSL | Same DSL |

**Key Point**: Users working with Auth0 FGA at dashboard.fga.dev need Store IDs and API Tokens, not deployment URLs.

---

## Auth0 FGA CLI Commands Reference

The FGA CLI (`fga`) is the primary tool for managing Auth0 FGA stores, models, and tuples.

### Installation
```bash
# macOS
brew install openfga/tap/fga

# Verify installation
fga version
```

### Store Management
```bash
# List all stores in your account
fga store list

# Get details about a specific store
fga store get --store-id <store-id>

# Create a new store
fga store create --name "My Demo Store"

# Delete a store
fga store delete --store-id <store-id>
```

### Model Management
```bash
# Get the current model (JSON format)
fga model get --store-id <store-id>

# Get model in DSL format
fga model get --store-id <store-id> --format fga

# Save model to file
fga model get --store-id <store-id> --format fga > current-model.fga

# Write/deploy a model to store
fga model write --store-id <store-id> --file model.fga

# Validate model syntax locally
fga model validate --file model.fga

# Transform JSON model to DSL format
fga model transform --file model.json

# List all model versions in a store
fga model list --store-id <store-id>
```

**Important Notes**:
- Writing a new model creates a new immutable version
- Old models cannot be deleted (by design)
- Existing tuples remain after model update (may become invalid if types changed)
- Always validate before deploying: `fga model validate --file model.fga`

### Tuple Management
```bash
# Write a single tuple
fga tuple write --store-id <store-id> user:alice owner document:readme

# Write multiple tuples from JSON file
fga tuple write --store-id <store-id> --file tuples.json

# Read tuples for a specific object
fga tuple read --store-id <store-id> --object document:readme

# Read tuples for a specific user
fga tuple read --store-id <store-id> --user user:alice

# Delete a specific tuple
fga tuple delete --store-id <store-id> user:alice owner document:readme
```

**Tuple File Format** (JSON):
```json
{
  "writes": [
    {
      "user": "user:alice",
      "relation": "owner",
      "object": "document:readme"
    },
    {
      "user": "user:bob",
      "relation": "viewer",
      "object": "document:readme"
    }
  ]
}
```

### Authorization Queries
```bash
# Check if user has permission (authorization check)
fga query check --store-id <store-id> user:alice can_read document:readme

# List objects a user can access
fga query list-objects --store-id <store-id> --user user:alice --relation can_read --type document

# List users who can access an object
fga query list-users --store-id <store-id> --object document:readme --relation can_read --user-filter type:user

# Run model tests
fga model test --tests model-tests.fga.yaml

# Run tests against a store
fga model test --store-id <store-id> --tests model-tests.fga.yaml
```

---

## Auth0 FGA SDK Integration

### JavaScript/TypeScript SDK

**Installation**:
```bash
npm install @auth0/fga
```

**Initialization**:
```typescript
import { FGA } from '@auth0/fga';

const fga = new FGA({
  apiUrl: process.env.FGA_API_URL,        // https://api.us1.fga.dev
  storeId: process.env.FGA_STORE_ID,      // Your store ID from dashboard
  apiToken: process.env.FGA_API_TOKEN,    // API token from dashboard
});
```

**Authorization Check**:
```typescript
// Check if user can perform action on object
const { allowed } = await fga.check({
  user: 'user:alice',
  relation: 'can_read',
  object: 'document:readme'
});

if (allowed) {
  // Grant access
  return document;
} else {
  throw new ForbiddenError('Access denied');
}
```

**Write Tuples**:
```typescript
// Grant alice ownership of document
await fga.write({
  writes: [{
    user: 'user:alice',
    relation: 'owner',
    object: 'document:readme'
  }]
});

// Revoke access (delete tuple)
await fga.write({
  deletes: [{
    user: 'user:bob',
    relation: 'viewer',
    object: 'document:readme'
  }]
});
```

**List Objects**:
```typescript
// Get all documents alice can read
const { objects } = await fga.listObjects({
  user: 'user:alice',
  relation: 'can_read',
  type: 'document'
});

console.log(objects); // ['document:readme', 'document:proposal', ...]
```

**Error Handling**:
```typescript
try {
  const result = await fga.check({
    user: 'user:alice',
    relation: 'can_read',
    object: 'document:readme'
  });
} catch (error) {
  if (error.code === 'FGA_STORE_NOT_FOUND') {
    console.error('Store not found - check Store ID');
  } else if (error.code === 'FGA_UNAUTHORIZED') {
    console.error('Invalid API token');
  } else {
    console.error('FGA error:', error.message);
  }
}
```

### Python SDK

**Installation**:
```bash
pip install auth0-fga
```

**Initialization**:
```python
from auth0_fga import FGAClient
import os

client = FGAClient(
    api_url=os.getenv('FGA_API_URL'),
    store_id=os.getenv('FGA_STORE_ID'),
    api_token=os.getenv('FGA_API_TOKEN')
)
```

**Authorization Check**:
```python
response = await client.check({
    "user": "user:alice",
    "relation": "can_read",
    "object": "document:readme"
})

if response.allowed:
    # Grant access
    return document
else:
    raise ForbiddenError("Access denied")
```

---

## Environment Configuration

**Required Environment Variables**:
```bash
# Auth0 FGA Configuration
FGA_STORE_ID=<your-store-id>           # From dashboard.fga.dev
FGA_API_URL=https://api.us1.fga.dev    # Regional API endpoint
FGA_API_TOKEN=<your-api-token>         # Generated in dashboard Settings > API Tokens
```

**Obtaining Credentials**:
1. **Store ID**:
   - Available in dashboard URL: `dashboard.fga.dev/stores/<store-id>`
   - Or run: `fga store list`

2. **API Token**:
   - Dashboard → Settings → API Tokens → Create Token
   - Save immediately (cannot be retrieved later)

3. **API URL**:
   - US Region: `https://api.us1.fga.dev`
   - EU Region: `https://api.eu1.fga.dev`
   - Check dashboard for your region

**CLI Configuration** (Optional):
Create `~/.fga.yaml` for persistent configuration:
```yaml
default_store_id: <your-store-id>
api_url: https://api.us1.fga.dev
api_token: <your-api-token>
```

Then CLI commands don't need `--store-id` flag:
```bash
fga model get  # Uses default_store_id from config
```

---

## Store Management Workflows

### Connecting to an Existing Store

**Step 1: List available stores**
```bash
fga store list
```

**Step 2: Get store details**
```bash
fga store get --store-id <store-id>
```

**Step 3: Verify connection**
```bash
# Get current model
fga model get --store-id <store-id>
```

**Step 4: Set environment variables**
```bash
export FGA_STORE_ID=<store-id>
export FGA_API_URL=https://api.us1.fga.dev
export FGA_API_TOKEN=<api-token>
```

### Model Deployment Workflow

```bash
# 1. Pull current model (for comparison)
fga model get --store-id <store-id> --format fga > current-model.fga

# 2. Make changes to model
# Edit current-model.fga or create new-model.fga

# 3. Validate new model
fga model validate --file new-model.fga

# 4. Deploy to store
fga model write --store-id <store-id> --file new-model.fga

# 5. Verify deployment
fga model get --store-id <store-id> --format fga

# 6. Test with sample data
fga query check --store-id <store-id> user:alice can_read document:readme
```

### Demo Data Setup

**Step 1: Create demo tuples file**
```json
{
  "writes": [
    {"user": "user:alice", "relation": "owner", "object": "document:readme"},
    {"user": "user:bob", "relation": "viewer", "object": "document:readme"},
    {"user": "user:alice", "relation": "member", "object": "organization:acme"}
  ]
}
```

**Step 2: Write tuples to store**
```bash
fga tuple write --store-id <store-id> --file demo-tuples.json
```

**Step 3: Verify tuples**
```bash
fga tuple read --store-id <store-id> --object document:readme
```

**Step 4: Test authorization**
```bash
fga query check --store-id <store-id> user:alice can_read document:readme
# Output: allowed: true

fga query check --store-id <store-id> user:bob can_write document:readme
# Output: allowed: false
```

---

## Common Auth0 FGA Patterns

These patterns are validated for Auth0 FGA and commonly used in production:

### Multi-Tenant SaaS
```
model
  schema 1.1

type user

type organization
  relations
    define member: [user]
    define admin: [user]

type workspace
  relations
    define organization: [organization]
    define owner: [user] or admin from organization
    define member: [user] or member from organization or owner
    define can_view: member
    define can_edit: owner
```

### Document Management (Hierarchical)
```
model
  schema 1.1

type user

type folder
  relations
    define parent: [folder]
    define owner: [user]
    define viewer: [user] or owner or viewer from parent
    define can_view: viewer

type document
  relations
    define folder: [folder]
    define owner: [user]
    define viewer: [user] or owner or viewer from folder
    define can_read: viewer
    define can_write: owner
```

### Healthcare (HIPAA Compliant)
```
model
  schema 1.1

type user

type patient
  relations
    define primary_physician: [user]
    define care_team: [user]

type medical_record
  relations
    define patient: [patient]
    define can_read: primary_physician from patient or care_team from patient
    define can_write: primary_physician from patient
```

---

## Best Practices for Auth0 FGA

### Model Design
- Use singular nouns for types: `document`, `folder` (not `documents`, `folders`)
- Use present tense for relations: `owner`, `viewer` (not `owns`, `owned_by`)
- Prefix permissions with `can_`: `can_read`, `can_write` (not `read`, `write`)
- Keep relation depth ≤3 levels for performance

### Store Management
- One store per environment (dev, staging, production)
- Use descriptive store names: "Acme Corp - Production"
- Generate separate API tokens per application
- Rotate API tokens regularly

### Performance
- Minimize nested `from` chains (avoid >3 levels)
- Use usersets (`team#member`) instead of individual user tuples
- Batch tuple writes when possible
- Use `list_objects` instead of checking each object individually

### Security
- Always specify type restrictions: `[user]` not unrestricted
- Avoid wildcards (`user:*`) unless explicitly needed
- Test negative cases (denied access) in test suites
- Review computed permissions for unintended escalation

### Testing
- Write comprehensive `.fga.yaml` test files
- Include positive AND negative test cases
- Test hierarchical permission inheritance
- Run tests before deploying model changes

---

## When to Use Auth0 FGA vs Self-Hosted OpenFGA

**Use Auth0 FGA (Hosted) when:**
- You want managed infrastructure with SLA
- You need quick setup and deployment
- You prefer web dashboard for management
- You want automatic scaling and high availability
- Your team is focused on building features, not infrastructure

**Use Self-Hosted OpenFGA when:**
- You have strict data residency requirements
- You need complete control over deployment
- You have existing Kubernetes/container infrastructure
- You want to customize the OpenFGA server
- You need on-premise deployment

**Both use the same:**
- OpenFGA DSL modeling language
- Relationship tuple format
- Query API structure
- Testing methodology

---

## Quick Reference: Common Commands

```bash
# Setup
fga store list
export FGA_STORE_ID=<store-id>

# Model workflow
fga model get --store-id $FGA_STORE_ID --format fga > model.fga
fga model validate --file model.fga
fga model write --store-id $FGA_STORE_ID --file model.fga

# Tuple workflow
fga tuple write --store-id $FGA_STORE_ID user:alice owner document:readme
fga tuple read --store-id $FGA_STORE_ID --object document:readme

# Query workflow
fga query check --store-id $FGA_STORE_ID user:alice can_read document:readme
fga query list-objects --store-id $FGA_STORE_ID --user user:alice --relation can_read --type document

# Testing
fga model test --store-id $FGA_STORE_ID --tests tests.fga.yaml
```

---

When users ask about Auth0 FGA, dashboard.fga.dev, hosted FGA, or Okta FGA, provide this Auth0 FGA-specific guidance in addition to the generic OpenFGA modeling concepts.

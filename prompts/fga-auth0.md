# Auth0 FGA (Okta FGA) - Hosted Service Specifics

Auth0 FGA (now Okta Fine-Grained Authorization) is the fully managed, hosted version of OpenFGA available at **dashboard.fga.dev**. This section provides specific guidance for working with the hosted service, including CLI commands, SDK integration, and store management.

## Key Facts About Auth0 FGA

- **Fully managed** at dashboard.fga.dev
- **Authentication**: OAuth2 Client Credentials flow (no simple API tokens)
- **Credentials needed**: Client ID + Client Secret (from "Authorized Clients" in dashboard)
- **API URL**: `https://api.us1.fga.dev` (US) or `https://api.eu1.fga.dev` (EU)
- **Management**: Web dashboard + CLI + SDK

**Key Point**: Auth0 FGA uses **OAuth2 Client Credentials flow exclusively**. You create an "Authorized Client" in the dashboard to get a Client ID and Client Secret, which are exchanged for access tokens automatically by the SDK/CLI. There is no simple "API Token" you can create from the dashboard.

---

## Auth0 FGA Authentication

### How Authentication Works

Auth0 FGA uses the **OAuth 2.0 Client Credentials flow**:

1. You create an "Authorized Client" in the dashboard → get `clientId` + `clientSecret`
2. The SDK/CLI exchanges these credentials for an access token via `https://auth.fga.dev/oauth/token`
3. The access token is used as a Bearer token for API requests
4. The SDK handles token refresh automatically

**There is no simple "API Token" you can create from the dashboard.** All authentication goes through client credentials.

### Obtaining Credentials

1. Go to **dashboard.fga.dev**
2. Select your store (or create one)
3. Navigate to **Settings** → **Authorized Clients**
4. Click **Create Client**
5. Save the `Client ID` and `Client Secret` immediately (secret cannot be retrieved later)

### Required Environment Variables

```bash
# Auth0 FGA Configuration
FGA_STORE_ID=<your-store-id>                    # From dashboard URL or fga store list
FGA_API_URL=https://api.us1.fga.dev             # Regional API endpoint (US1 or EU1)
FGA_CLIENT_ID=<your-client-id>                  # From Authorized Clients
FGA_CLIENT_SECRET=<your-client-secret>          # From Authorized Clients
FGA_API_TOKEN_ISSUER=auth.fga.dev               # Token issuer (always this for Auth0 FGA)
FGA_API_AUDIENCE=https://api.us1.fga.dev/       # Must match your region with trailing slash
```

### Regional Endpoints

| Region | API URL | Audience |
|--------|---------|----------|
| US | `https://api.us1.fga.dev` | `https://api.us1.fga.dev/` |
| EU | `https://api.eu1.fga.dev` | `https://api.eu1.fga.dev/` |

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

### CLI Configuration for Auth0 FGA

Create `~/.fga.yaml` for persistent configuration:

```yaml
# ~/.fga.yaml - Auth0 FGA configuration
api-url: https://api.us1.fga.dev
store-id: 01ABC123...
client-id: your-client-id
client-secret: your-client-secret
api-token-issuer: auth.fga.dev
api-audience: https://api.us1.fga.dev/
```

Then CLI commands work without additional flags:
```bash
fga model get  # Uses credentials from ~/.fga.yaml
```

**Alternative: Use environment variables**
```bash
source .env  # Load FGA_* variables
fga model get --store-id $FGA_STORE_ID
```

**Alternative: Explicit flags (useful for CI/CD)**
```bash
fga model get \
  --api-url "https://api.us1.fga.dev" \
  --store-id "$FGA_STORE_ID" \
  --client-id "$FGA_CLIENT_ID" \
  --client-secret "$FGA_CLIENT_SECRET" \
  --api-token-issuer "auth.fga.dev" \
  --api-audience "https://api.us1.fga.dev/"
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
npm install @openfga/sdk
```

**Initialization with Client Credentials**:
```typescript
import { OpenFgaClient, CredentialsMethod } from '@openfga/sdk';

const fgaClient = new OpenFgaClient({
  apiUrl: process.env.FGA_API_URL,           // https://api.us1.fga.dev
  storeId: process.env.FGA_STORE_ID,
  credentials: {
    method: CredentialsMethod.ClientCredentials,
    config: {
      apiTokenIssuer: process.env.FGA_API_TOKEN_ISSUER,   // auth.fga.dev
      apiAudience: process.env.FGA_API_AUDIENCE,          // https://api.us1.fga.dev/
      clientId: process.env.FGA_CLIENT_ID,
      clientSecret: process.env.FGA_CLIENT_SECRET,
    },
  },
});
```

**Authorization Check**:
```typescript
// Check if user can perform action on object
const { allowed } = await fgaClient.check({
  user: 'user:alice',
  relation: 'can_read',
  object: 'document:readme',
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
await fgaClient.write({
  writes: [{
    user: 'user:alice',
    relation: 'owner',
    object: 'document:readme',
  }],
});

// Revoke access (delete tuple)
await fgaClient.write({
  deletes: [{
    user: 'user:bob',
    relation: 'viewer',
    object: 'document:readme',
  }],
});
```

**List Objects**:
```typescript
// Get all documents alice can read
const { objects } = await fgaClient.listObjects({
  user: 'user:alice',
  relation: 'can_read',
  type: 'document',
});

console.log(objects); // ['document:readme', 'document:proposal', ...]
```

**Error Handling**:
```typescript
try {
  const result = await fgaClient.check({
    user: 'user:alice',
    relation: 'can_read',
    object: 'document:readme',
  });
} catch (error) {
  if (error.code === 'FGA_STORE_NOT_FOUND') {
    console.error('Store not found - check Store ID');
  } else if (error.code === 'FGA_UNAUTHORIZED') {
    console.error('Invalid credentials - check Client ID/Secret');
  } else {
    console.error('FGA error:', error.message);
  }
}
```

### Python SDK

**Installation**:
```bash
pip install openfga_sdk
```

**Initialization with Client Credentials**:
```python
import os
from openfga_sdk import ClientConfiguration, OpenFgaClient
from openfga_sdk.credentials import Credentials, CredentialConfiguration

credentials = Credentials(
    method='client_credentials',
    configuration=CredentialConfiguration(
        api_issuer=os.environ.get('FGA_API_TOKEN_ISSUER'),   # auth.fga.dev
        api_audience=os.environ.get('FGA_API_AUDIENCE'),     # https://api.us1.fga.dev/
        client_id=os.environ.get('FGA_CLIENT_ID'),
        client_secret=os.environ.get('FGA_CLIENT_SECRET'),
    )
)

configuration = ClientConfiguration(
    api_url=os.environ.get('FGA_API_URL'),      # https://api.us1.fga.dev
    store_id=os.environ.get('FGA_STORE_ID'),
    credentials=credentials,
)

async with OpenFgaClient(configuration) as fga_client:
    # Use fga_client for authorization checks
    pass
```

**Authorization Check**:
```python
from openfga_sdk.client.models import ClientCheckRequest

response = await fga_client.check(ClientCheckRequest(
    user="user:alice",
    relation="can_read",
    object="document:readme",
))

if response.allowed:
    # Grant access
    return document
else:
    raise ForbiddenError("Access denied")
```

---

## Troubleshooting CLI Authentication Issues

### Commands Hanging with No Output

**Symptom**: FGA CLI commands hang indefinitely showing only "Using config file: ~/.fga.yaml" with no error message or progress.

**Common Causes**:
1. **Missing client credential parameters** - All four parameters are required
2. **Config file conflicts** - `~/.fga.yaml` has incomplete or conflicting settings
3. **Invalid credentials** - Client ID/Secret are incorrect or revoked

**Solution: Bypass Config File and Use Explicit Flags**

```bash
source .env
fga store list \
  --api-url "https://api.us1.fga.dev" \
  --client-id "$FGA_CLIENT_ID" \
  --client-secret "$FGA_CLIENT_SECRET" \
  --api-token-issuer "auth.fga.dev" \
  --api-audience "https://api.us1.fga.dev/"
```

Or use `--config /dev/null` to ignore any existing config file:
```bash
fga store list --config /dev/null \
  --api-url "https://api.us1.fga.dev" \
  --client-id "$FGA_CLIENT_ID" \
  --client-secret "$FGA_CLIENT_SECRET" \
  --api-token-issuer "auth.fga.dev" \
  --api-audience "https://api.us1.fga.dev/"
```

### Client Credentials - All Required Parameters

When using Auth0 FGA, you **must** provide ALL FOUR credential parameters:

| Parameter | CLI Flag | Environment Variable | Value for Auth0 FGA |
|-----------|----------|---------------------|---------------------|
| Client ID | `--client-id` | `FGA_CLIENT_ID` | From dashboard |
| Client Secret | `--client-secret` | `FGA_CLIENT_SECRET` | From dashboard |
| Token Issuer | `--api-token-issuer` | `FGA_API_TOKEN_ISSUER` | `auth.fga.dev` |
| API Audience | `--api-audience` | `FGA_API_AUDIENCE` | `https://api.us1.fga.dev/` |

**Missing any parameter causes authentication to fail silently (CLI hangs).**

### Quick Diagnostic Checklist

When FGA CLI commands hang or fail:

```bash
# 1. Check if ~/.fga.yaml exists and has complete credentials
cat ~/.fga.yaml

# 2. Verify all required fields are present:
#    - api-url
#    - client-id
#    - client-secret
#    - api-token-issuer
#    - api-audience

# 3. Test with explicit flags (bypassing config)
fga store list --config /dev/null \
  --api-url "https://api.us1.fga.dev" \
  --client-id "$FGA_CLIENT_ID" \
  --client-secret "$FGA_CLIENT_SECRET" \
  --api-token-issuer "auth.fga.dev" \
  --api-audience "https://api.us1.fga.dev/"

# 4. If step 3 hangs, credentials are likely invalid
# Solution: Regenerate credentials from dashboard.fga.dev
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `bearer token is missing in the request` | Missing `--api-token-issuer` or `--api-audience` | Add all 4 client credential parameters |
| `failed to get model due to storeId is required` | Store ID not provided | Use explicit `--store-id` flag |
| Command hangs with only "Using config file..." | Incomplete credentials or invalid config | Use `--config /dev/null` with explicit flags |
| `Configuration.ApiUrl () does not form a valid uri` | Empty or malformed API URL | Check `FGA_API_URL` is set correctly |
| `invalid_client` | Wrong Client ID or Secret | Regenerate credentials in dashboard |

---

## Credential Security & Best Practices

### Securing Your FGA Credentials

Auth0 FGA credentials (Client ID, Client Secret) grant full access to your authorization data. Follow these best practices:

**DO:**
- Store credentials in environment variables or secret managers
- Use `~/.fga.yaml` for persistent CLI configuration (not committed to git)
- Use `.env` files with `.gitignore` for project-specific config
- Create separate Authorized Clients per environment (dev, staging, production)
- Create separate Authorized Clients per application/service
- Rotate credentials regularly by creating new clients and revoking old ones
- Store credentials in secret management systems (AWS Secrets Manager, HashiCorp Vault, etc.) for production

**DON'T:**
- Never commit credentials to git repositories
- Never hardcode credentials in source files
- Never share credentials in plaintext (email, Slack, etc.)
- Never use production credentials in development
- Never log credentials to console or files
- Never include credentials in screenshots or demos

### Credential Storage Options

**Option 1: ~/.fga.yaml (Recommended for CLI)**
```yaml
# ~/.fga.yaml (in your home directory, NOT in project)
api-url: https://api.us1.fga.dev
store-id: 01ABC...
client-id: your-client-id
client-secret: your-client-secret
api-token-issuer: auth.fga.dev
api-audience: https://api.us1.fga.dev/
```

**Option 2: .env File (Recommended for Projects)**
```bash
# Create .env file (add to .gitignore!)
cat > .env <<EOF
FGA_STORE_ID=01ABC...
FGA_API_URL=https://api.us1.fga.dev
FGA_CLIENT_ID=your-client-id
FGA_CLIENT_SECRET=your-client-secret
FGA_API_TOKEN_ISSUER=auth.fga.dev
FGA_API_AUDIENCE=https://api.us1.fga.dev/
EOF

# Add to .gitignore
echo ".env" >> .gitignore

# Load in shell
source .env
```

**Option 3: Secret Management (Recommended for Production)**
```bash
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id fga-credentials

# HashiCorp Vault
vault kv get secret/fga-credentials

# Kubernetes Secrets
kubectl create secret generic fga-credentials \
  --from-literal=client-id=your-client-id \
  --from-literal=client-secret=your-client-secret
```

### Working with Claude Code & Credentials

**INSTRUCTIONS FOR CLAUDE:** When a user provides FGA credentials (Client ID, Client Secret) in the conversation, you MUST:

1. **Immediately offer to create secure storage:**
   ```
   I see you've provided FGA credentials. Let me help you store these securely.

   I'll create a .env file for you with these credentials and add it to .gitignore.
   Would you like me to do that?
   ```

2. **Create the .env file** (if user agrees):
   - Use the Write tool to create `.env` with the provided credentials
   - Include ALL required fields: FGA_STORE_ID, FGA_API_URL, FGA_CLIENT_ID, FGA_CLIENT_SECRET, FGA_API_TOKEN_ISSUER, FGA_API_AUDIENCE
   - Add `.env` to `.gitignore` if not already present
   - Never echo credentials back in plain text

3. **Use the correct authentication method for FGA CLI commands:**
   ```bash
   source .env
   fga store import \
     --file store.fga.yaml \
     --store-id "$FGA_STORE_ID" \
     --api-url "$FGA_API_URL" \
     --client-id "$FGA_CLIENT_ID" \
     --client-secret "$FGA_CLIENT_SECRET" \
     --api-token-issuer "$FGA_API_TOKEN_ISSUER" \
     --api-audience "$FGA_API_AUDIENCE"
   ```

4. **When commands hang with "Using config file..." and no progress:**
   - This indicates authentication issues
   - Use explicit flags to bypass config file issues
   - Ensure all four client credential parameters are provided

5. **Use environment variable references in ALL commands:**
   - `fga model get --store-id $FGA_STORE_ID`
   - Never hardcode: `fga model get --store-id 01ABC123...`

6. **Remind about credential rotation:**
   ```
   Note: Consider rotating your credentials after this session for security.
   You can create a new Authorized Client in the dashboard and revoke the old one.
   ```

### Credential Rotation

Rotate credentials regularly to maintain security:

**Step 1: Create New Authorized Client**
```
Dashboard → Settings → Authorized Clients → Create Client
```

**Step 2: Update Configuration**
```bash
# Update .env or ~/.fga.yaml with new credentials
vim .env  # Update FGA_CLIENT_ID and FGA_CLIENT_SECRET
```

**Step 3: Verify New Credentials Work**
```bash
source .env
fga store list  # Should succeed with new credentials
```

**Step 4: Revoke Old Client**
```
Dashboard → Settings → Authorized Clients → Delete [old client]
```

### Multi-Environment Setup

Use separate Authorized Clients per environment:

```bash
# Development .env
FGA_STORE_ID=01DEV...
FGA_CLIENT_ID=dev-client-id
FGA_CLIENT_SECRET=dev-client-secret

# Staging .env
FGA_STORE_ID=01STAGE...
FGA_CLIENT_ID=staging-client-id
FGA_CLIENT_SECRET=staging-client-secret

# Production .env
FGA_STORE_ID=01PROD...
FGA_CLIENT_ID=prod-client-id
FGA_CLIENT_SECRET=prod-client-secret
```

Or use multiple `~/.fga.yaml` files:
```bash
# Development commands
fga model get --config ~/.fga.dev.yaml

# Production commands
fga model get --config ~/.fga.prod.yaml
```

### Credential Leak Response

If credentials are accidentally exposed:

**Immediate Actions:**
1. Revoke compromised client: Dashboard → Settings → Authorized Clients → Delete
2. Create new Authorized Client
3. Update all systems using the old credentials
4. Review store access logs for suspicious activity

**Git Commit Exposure:**
1. Revoke credentials immediately
2. DO NOT just delete the file and commit again (credentials still in git history)
3. Use `git filter-branch` or BFG Repo-Cleaner to remove from history
4. Force push (coordinate with team)
5. Create new credentials

**Prevention:**
- Use git hooks to scan for credentials before commit
- Use tools like `truffleHog`, `git-secrets`, or `detect-secrets`
- Enable GitHub secret scanning

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
export FGA_CLIENT_ID=<your-client-id>
export FGA_CLIENT_SECRET=<your-client-secret>
export FGA_API_TOKEN_ISSUER=auth.fga.dev
export FGA_API_AUDIENCE=https://api.us1.fga.dev/
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
- Create separate Authorized Clients per application
- Rotate credentials regularly

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
# Setup (ensure credentials are configured in ~/.fga.yaml or environment)
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

## Dashboard Assertions: Persistent Testing in Auth0 FGA

**CRITICAL DISTINCTION**: There are two completely different testing approaches in FGA:

### Local Testing vs Store Assertions

| Aspect | Local Tests (.fga.yaml) | Store Assertions (fga.yaml) |
|--------|------------------------|---------------------------|
| **Purpose** | Development/CI testing | Production validation |
| **File Name** | `.fga.yaml` (with dot) | `fga.yaml` or `store.fga.yaml` (no dot) |
| **Command** | `fga model test --tests .fga.yaml` | `fga store import --file store.fga.yaml` |
| **Storage** | Local filesystem only | Persisted in Auth0 FGA store |
| **Visibility** | Developer's machine | Visible in dashboard.fga.dev |
| **Lifecycle** | Ephemeral (run and discard) | Persistent (stored with model) |
| **Use Case** | Quick iteration, pre-commit checks | Continuous validation, documentation |

### Store File Format with Assertions

When you want assertions to persist in your Auth0 FGA store (visible in dashboard), use the store file format:

```yaml
name: Task Management Store
model_file: task-management.fga
tuples:
  - user: user:alice
    relation: admin
    object: workspace:acme
  - user: workspace:acme
    relation: parent
    object: project:website
  - user: project:website
    relation: parent
    object: task:design-homepage
  - user: user:bob
    relation: assignee
    object: task:design-homepage
tests:
  - name: Workspace Admin Tests
    check:
      - user: user:alice
        object: task:design-homepage
        assertions:
          admin: true
          can_edit: true
      - user: user:bob
        object: task:design-homepage
        assertions:
          admin: false
          can_edit: true  # true because bob is assignee
  - name: Permission Inheritance Tests
    check:
      - user: user:alice
        object: project:website
        assertions:
          admin: true
    list_objects:
      - user: user:alice
        type: task
        assertions:
          admin:
            - task:design-homepage
```

### Importing Store with Assertions

```bash
# Import complete store (model + tuples + assertions)
fga store import --file store.fga.yaml --store-id <store-id>

# This writes:
# 1. Authorization model to the store
# 2. Relationship tuples to the store
# 3. Test assertions to the store (persistent)

# View in dashboard
# Navigate to dashboard.fga.dev → Your Store → Assertions tab
```

### Why Use Store Assertions?

**Use local .fga.yaml tests when:**
- Iterating on model design
- Running pre-commit hooks
- CI/CD pipeline validation
- Quick development feedback

**Use store assertions (fga store import) when:**
- Documenting expected behavior in production
- Creating executable specification
- Continuous validation in dashboard
- Sharing test scenarios with team
- Onboarding new team members

### Store Import Workflow

**Complete workflow for pushing assertions to Auth0 FGA:**

```bash
# 1. Create store file with model, tuples, and assertions
cat > store.fga.yaml <<EOF
name: My Store
model_file: model.fga
tuples:
  - user: user:alice
    relation: admin
    object: workspace:acme
tests:
  - name: Admin Tests
    check:
      - user: user:alice
        object: workspace:acme
        assertions:
          admin: true
EOF

# 2. Validate locally first (optional but recommended)
fga model test --tests store.fga.yaml

# 3. Import to store (writes model, tuples, AND assertions)
fga store import --file store.fga.yaml --store-id $FGA_STORE_ID

# 4. Verify in dashboard
# Go to dashboard.fga.dev → Store → Assertions tab
# Your assertions are now persistent and can be run from the UI
```

### Exporting Store with Assertions

```bash
# Export complete store (including assertions)
fga store export --store-id <store-id> > exported-store.fga.yaml

# The exported file includes:
# - Current authorization model
# - All relationship tuples
# - All stored assertions
```

### API/SDK: Managing Assertions Programmatically

**Note**: Assertions are typically managed via CLI and store import. The FGA SDKs focus on runtime authorization checks (check, listObjects, listUsers) rather than assertion management. For programmatic assertion management, use:

```bash
# Script to deploy store with assertions
#!/bin/bash
source .env

# Deploy everything including assertions
fga store import --file production-store.fga.yaml \
  --store-id "$FGA_STORE_ID" \
  --api-url "$FGA_API_URL" \
  --client-id "$FGA_CLIENT_ID" \
  --client-secret "$FGA_CLIENT_SECRET" \
  --api-token-issuer "$FGA_API_TOKEN_ISSUER" \
  --api-audience "$FGA_API_AUDIENCE"

# Verify
fga store export --store-id "$FGA_STORE_ID" > verify.yaml
diff production-store.fga.yaml verify.yaml
```

**Key Insight**: Think of store assertions as "executable documentation" - they live with your authorization model in production and serve as both tests and documentation of expected behavior.

---

When users ask about Auth0 FGA, dashboard.fga.dev, hosted FGA, or Okta FGA, provide this Auth0 FGA-specific guidance. Remember that Auth0 FGA uses OAuth2 Client Credentials exclusively - there is no simple "API Token" you can create from the dashboard.

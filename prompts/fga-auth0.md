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

## Troubleshooting CLI Authentication Issues

### Commands Hanging with No Output

**Symptom**: FGA CLI commands hang indefinitely showing only "Using config file: ~/.fga.yaml" with no error message or progress.

**Common Causes**:
1. **Config file conflicts** - `~/.fga.yaml` credentials conflict with environment variables or CLI flags
2. **Missing client credential parameters** - Using client ID/secret without all required parameters
3. **Invalid or expired tokens** - Credentials in config file are no longer valid

**Solution 1: Bypass Config File**

If you have conflicting credentials, bypass `~/.fga.yaml` entirely:

```bash
# Use --config /dev/null to ignore ~/.fga.yaml
source .env
fga store import --config /dev/null \
  --file store.fga.yaml \
  --store-id "$FGA_STORE_ID" \
  --api-url "https://api.us1.fga.dev" \
  --client-id "$FGA_CLIENT_ID" \
  --client-secret "$FGA_CLIENT_SECRET" \
  --api-token-issuer "auth.fga.dev" \
  --api-audience "https://api.us1.fga.dev/"
```

**Solution 2: Use Direct API Token (Simplest)**

For CLI usage, use a direct API token instead of client credentials:

```yaml
# ~/.fga.yaml
default_store_id: 01ABC...
api_url: https://api.us1.fga.dev
api_token: fga_xxxxx...  # Direct token from dashboard
```

Then commands work without additional flags:
```bash
fga store import --file store.fga.yaml
```

### Two Authentication Methods

Auth0 FGA supports two authentication approaches:

| Method | Use Case | Configuration | When to Use |
|--------|----------|---------------|-------------|
| **Direct API Token** | CLI usage, quick setup | `api_token` in ~/.fga.yaml | Individual developer CLI usage |
| **Client Credentials** | SDKs, programmatic access | `client-id` + `client-secret` + `issuer` + `audience` | Production applications, automation |

**⚠️ Don't Mix Both**: Having both `api_token` in ~/.fga.yaml AND client credentials in environment variables can cause conflicts.

### Client Credentials Flow - All Required Parameters

When using client credentials (recommended for SDKs and programmatic access), you **must** provide ALL four parameters:

```bash
--client-id <your-client-id>
--client-secret <your-client-secret>
--api-token-issuer auth.fga.dev          # Required!
--api-audience https://api.us1.fga.dev/  # Required!
```

**Missing any parameter causes authentication to fail silently.**

Add these to your `.env` file:

```bash
# Client Credentials (for SDKs/programmatic access)
FGA_CLIENT_ID=A8On6lcfVsdoecbnxCjYqVI2MfpJuJNo
FGA_CLIENT_SECRET=your-client-secret-here
FGA_API_TOKEN_ISSUER=auth.fga.dev
FGA_API_AUDIENCE=https://api.us1.fga.dev/
```

Then use them consistently:

```bash
source .env
fga store import --config /dev/null \
  --file store.fga.yaml \
  --store-id "$FGA_STORE_ID" \
  --api-url "$FGA_API_URL" \
  --client-id "$FGA_CLIENT_ID" \
  --client-secret "$FGA_CLIENT_SECRET" \
  --api-token-issuer "$FGA_API_TOKEN_ISSUER" \
  --api-audience "$FGA_API_AUDIENCE"
```

### Environment Variables vs Config File

**What We Learned**: Environment variables don't reliably override `~/.fga.yaml` settings.

**Best Practice**:
- **For CLI**: Use `~/.fga.yaml` with direct `api_token`
- **For Scripts**: Use explicit flags with `--config /dev/null` to bypass config file
- **For SDKs**: Use environment variables with client credentials (SDKs don't read ~/.fga.yaml)

### Quick Diagnostic Checklist

When FGA CLI commands hang or fail:

```bash
# 1. Check if ~/.fga.yaml exists and what's in it
cat ~/.fga.yaml

# 2. Verify you have valid credentials
fga store list --config /dev/null \
  --api-url "https://api.us1.fga.dev" \
  --client-id "$FGA_CLIENT_ID" \
  --client-secret "$FGA_CLIENT_SECRET" \
  --api-token-issuer "auth.fga.dev" \
  --api-audience "https://api.us1.fga.dev/"

# 3. If step 2 works, the issue is config file conflict
# Solution: Use --config /dev/null in all commands

# 4. If step 2 hangs, check your client credentials are correct
# Solution: Regenerate credentials from dashboard.fga.dev
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `bearer token is missing in the request` | Client credentials missing `--api-token-issuer` or `--api-audience` | Add all 4 client credential parameters |
| `failed to get model due to storeId is required` | Store ID not being read from config/env | Use explicit `--store-id` flag |
| Command hangs with only "Using config file..." | Config file conflicts or invalid token | Use `--config /dev/null` with explicit flags |
| `Configuration.ApiUrl () does not form a valid uri` | Empty or malformed API URL | Check `FGA_API_URL` is set correctly |

### Recommended Setup for Different Use Cases

**For Individual Developers (CLI Usage)**:
```yaml
# ~/.fga.yaml
default_store_id: 01ABC...
api_url: https://api.us1.fga.dev
api_token: fga_xxxxx...  # Get from dashboard → Settings → API Tokens
```

**For Team Projects (SDK/Application Usage)**:
```bash
# .env (in project directory)
FGA_STORE_ID=01ABC...
FGA_API_URL=https://api.us1.fga.dev
FGA_CLIENT_ID=your-client-id
FGA_CLIENT_SECRET=your-client-secret
FGA_API_TOKEN_ISSUER=auth.fga.dev
FGA_API_AUDIENCE=https://api.us1.fga.dev/
```

**For CI/CD Pipelines**:
```bash
# Use explicit flags, don't rely on config files
fga store import --config /dev/null \
  --file store.fga.yaml \
  --store-id "$FGA_STORE_ID" \
  --api-url "$FGA_API_URL" \
  --client-id "$FGA_CLIENT_ID" \
  --client-secret "$FGA_CLIENT_SECRET" \
  --api-token-issuer "$FGA_API_TOKEN_ISSUER" \
  --api-audience "$FGA_API_AUDIENCE"
```

---

## Credential Security & Best Practices

### Securing Your FGA Credentials

Auth0 FGA credentials (Store ID, API Token, Client ID, Client Secret) grant full access to your authorization data. Follow these best practices:

**✅ DO:**
- Store credentials in environment variables
- Use `~/.fga.yaml` for persistent CLI configuration (not committed to git)
- Use `.env` files with `.gitignore` for project-specific config
- Rotate API tokens regularly (Dashboard → Settings → API Tokens)
- Use separate tokens per environment (dev, staging, production)
- Use separate tokens per application/service
- Store tokens in secret management systems (AWS Secrets Manager, HashiCorp Vault, etc.) for production

**❌ DON'T:**
- Never commit credentials to git repositories
- Never hardcode credentials in source files
- Never share credentials in plaintext (email, Slack, etc.)
- Never use production tokens in development
- Never log credentials to console or files
- Never include credentials in screenshots or demos

### Credential Storage Options

**Option 1: Environment Variables (Quick Start)**
```bash
# Set temporarily for current shell session
export FGA_STORE_ID='01ABC...'
export FGA_API_TOKEN='your-token-here'
export FGA_API_URL='https://api.us1.fga.dev'
```

**Option 2: ~/.fga.yaml (Recommended for CLI)**
```yaml
# ~/.fga.yaml (in your home directory, NOT in project)
default_store_id: 01ABC...
api_url: https://api.us1.fga.dev
api_token: your-token-here
```

Then CLI commands work without flags:
```bash
fga model get  # Uses credentials from ~/.fga.yaml
```

**Option 3: .env File (Recommended for Projects)**
```bash
# Create .env file (add to .gitignore!)
cat > .env <<EOF
FGA_STORE_ID=01ABC...
FGA_API_TOKEN=your-token-here
FGA_API_URL=https://api.us1.fga.dev
EOF

# Add to .gitignore
echo ".env" >> .gitignore

# Load with direnv or dotenv
source .env
```

**Option 4: Secret Management (Recommended for Production)**
```bash
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id fga-credentials

# HashiCorp Vault
vault kv get secret/fga-credentials

# Kubernetes Secrets
kubectl create secret generic fga-credentials \
  --from-literal=store-id=01ABC... \
  --from-literal=api-token=your-token
```

### Working with Claude Code & Credentials

**INSTRUCTIONS FOR CLAUDE:** When a user provides FGA credentials (Store ID, API Token, Client ID, Client Secret) in the conversation, you MUST:

1. **Immediately offer to create secure storage:**
   ```
   I see you've provided FGA credentials. Let me help you store these securely.

   I'll create a .env file for you with these credentials and add it to .gitignore.
   Would you like me to do that?
   ```

2. **Create the .env file** (if user agrees):
   - Use the Write tool to create `.env` with the provided credentials
   - Add `.env` to `.gitignore` if not already present
   - Never echo credentials back in plain text

3. **Use the correct authentication method for FGA CLI commands:**

   **If using Client Credentials (FGA_CLIENT_ID + FGA_CLIENT_SECRET):**
   - MUST include ALL FOUR parameters: `--client-id`, `--client-secret`, `--api-token-issuer auth.fga.dev`, `--api-audience https://api.us1.fga.dev/`
   - Use `--config /dev/null` to bypass ~/.fga.yaml conflicts
   - Example:
     ```bash
     source .env
     fga store import --config /dev/null \
       --file store.fga.yaml \
       --store-id "$FGA_STORE_ID" \
       --api-url "$FGA_API_URL" \
       --client-id "$FGA_CLIENT_ID" \
       --client-secret "$FGA_CLIENT_SECRET" \
       --api-token-issuer "auth.fga.dev" \
       --api-audience "https://api.us1.fga.dev/"
     ```

   **If using Direct API Token (FGA_API_TOKEN):**
   - Simpler approach for CLI usage
   - Can rely on ~/.fga.yaml configuration
   - Example:
     ```bash
     fga store import --file store.fga.yaml --store-id "$FGA_STORE_ID"
     ```

4. **When commands hang with "Using config file..." and no progress:**
   - This indicates authentication issues or config file conflicts
   - Try using `--config /dev/null` to bypass ~/.fga.yaml
   - Ensure all client credential parameters are provided if using that method
   - See the "Troubleshooting CLI Authentication Issues" section above

5. **Use environment variable references in ALL commands:**
   - ✅ `fga model get --store-id $FGA_STORE_ID`
   - ❌ `fga model get --store-id 01ABC123...` (never hardcode)

6. **Remind about token rotation:**
   ```
   Note: Consider rotating your API token after this session for security.
   ```

**Example interaction:**

```
User: Here are my FGA credentials:
FGA_STORE_ID=01KN78Z7WA5HGFC9YC9CE1G8JQ
FGA_API_TOKEN=abc123token
FGA_API_URL=https://api.us1.fga.dev

Claude: I'll help you store these securely. Let me:
1. Create a .env file with your credentials
2. Add .env to .gitignore to prevent accidental commits
3. Use environment variables in all CLI commands

[Creates .env file with Write tool]
[Updates .gitignore with Edit tool]

Your credentials are now stored in .env. I'll reference them as $FGA_STORE_ID
and $FGA_API_TOKEN in all commands going forward.

Note: Consider rotating your API token after this session for security.
```

---

When using Claude Code to work with Auth0 FGA, you need to provide credentials. Here are secure approaches for users:

**Method 1: Reference Environment Variables (Most Secure)**
```
I have my FGA credentials set as environment variables:
- FGA_STORE_ID
- FGA_API_TOKEN
- FGA_API_URL

Please use these when running FGA CLI commands.
```

Claude will use commands like:
```bash
fga model get --store-id $FGA_STORE_ID
```

**Method 2: Use ~/.fga.yaml (Recommended)**
```
I have configured my FGA credentials in ~/.fga.yaml

Please run FGA CLI commands which will use those credentials automatically.
```

**Method 3: Provide Placeholders, Set Separately**
```
I want to work with my FGA store. I'll set the credentials separately.

Here's the structure:
- Store ID: 01ABC... (example)
- Region: US1

Please show me commands using $FGA_STORE_ID as a placeholder.
```

**⚠️ Avoid: Pasting Raw Credentials**

If you must provide credentials directly (e.g., for initial setup):
- Provide them once in a private session
- Ask Claude to reference them as variables going forward
- Rotate the tokens after the session
- Never include Client Secrets in demos or shared code

Example of safer approach:
```
I need help setting up my FGA store. I'll provide credentials once:

Store ID: 01ABC123...
API Token: fga_abc123... (I'll rotate this after our session)

Please store these as $FGA_STORE_ID and $FGA_API_TOKEN for the rest of our conversation.
```

### Token Rotation

Rotate API tokens regularly to maintain security:

**Step 1: Create New Token**
```
Dashboard → Settings → API Tokens → Create Token
```

**Step 2: Update Configuration**
```bash
# Update environment variable
export FGA_API_TOKEN='new-token-here'

# Or update ~/.fga.yaml
vim ~/.fga.yaml  # Update api_token field

# Or update secret manager
aws secretsmanager update-secret --secret-id fga-credentials \
  --secret-string '{"api_token":"new-token"}'
```

**Step 3: Verify New Token Works**
```bash
fga store list  # Should succeed with new token
```

**Step 4: Revoke Old Token**
```
Dashboard → Settings → API Tokens → Revoke [old token]
```

### Multi-Environment Setup

Use separate credentials per environment:

```bash
# Development
export FGA_STORE_ID='01DEV...'
export FGA_API_TOKEN='dev-token'

# Staging
export FGA_STORE_ID='01STAGE...'
export FGA_API_TOKEN='staging-token'

# Production
export FGA_STORE_ID='01PROD...'
export FGA_API_TOKEN='prod-token'
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
1. Revoke compromised token: Dashboard → Settings → API Tokens → Revoke
2. Create new token
3. Update all systems using the old token
4. Review store access logs for suspicious activity

**Git Commit Exposure:**
1. Revoke token immediately
2. DO NOT just delete the file and commit again (token still in git history)
3. Use `git filter-branch` or BFG Repo-Cleaner to remove from history
4. Force push (coordinate with team)
5. Rotate all credentials

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
export FGA_STORE_ID="your-store-id"
export FGA_API_TOKEN="your-api-token"

# Deploy everything including assertions
fga store import --file production-store.fga.yaml --store-id $FGA_STORE_ID

# Verify
fga store export --store-id $FGA_STORE_ID > verify.yaml
diff production-store.fga.yaml verify.yaml
```

**Key Insight**: Think of store assertions as "executable documentation" - they live with your authorization model in production and serve as both tests and documentation of expected behavior.

---

When users ask about Auth0 FGA, dashboard.fga.dev, hosted FGA, or Okta FGA, provide this Auth0 FGA-specific guidance in addition to the generic OpenFGA modeling concepts.

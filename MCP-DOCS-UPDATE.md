# MCP Documentation Update - Auth0 FGA Troubleshooting

**Date**: 2026-04-27
**Updated File**: `prompts/fga-auth0.md`
**Purpose**: Add comprehensive troubleshooting guidance for FGA CLI authentication issues

## What Was Added

### 1. New Section: "Troubleshooting CLI Authentication Issues"

Added immediately after the "Environment Configuration" section (line 298) with the following subsections:

#### Commands Hanging with No Output
- Symptom identification
- Common causes (config file conflicts, missing parameters, invalid tokens)
- Two solutions: bypass config file or use direct API token

#### Two Authentication Methods
- Clear comparison table between Direct API Token vs Client Credentials
- When to use each method
- Warning about mixing both methods

#### Client Credentials Flow - All Required Parameters
- Explicit list of all 4 required parameters
- Example .env configuration
- Complete command example with all flags

#### Environment Variables vs Config File
- Lessons learned about variable precedence
- Best practices for CLI, scripts, and SDKs

#### Quick Diagnostic Checklist
- Step-by-step troubleshooting commands
- Decision tree for identifying issues

#### Common Error Messages
- Table of error messages, causes, and solutions
- Covers all errors encountered during testing

#### Recommended Setup for Different Use Cases
- Individual developers (CLI usage)
- Team projects (SDK/application usage)
- CI/CD pipelines

### 2. Updated Section: "INSTRUCTIONS FOR CLAUDE"

Enhanced the instructions at line 545 with:

- **Step 3**: Expanded to cover both authentication methods with specific examples
- **Step 4**: New guidance on handling hanging commands
- **Step 5-6**: Renumbered (previously 3-4)

## Key Learnings Documented

1. **Config File Conflicts**: `~/.fga.yaml` can conflict with environment variables, causing silent hangs
2. **Client Credentials Complexity**: Client credential flow requires 4 parameters, not just 2
3. **Token Issuer Discovery**: Documented that Auth0 FGA uses `auth.fga.dev` as the issuer
4. **Config Bypass Pattern**: `--config /dev/null` is essential for reliable scripting
5. **Silent Failures**: Authentication issues often hang indefinitely with no error messages

## Real-World Testing

These updates are based on actual troubleshooting of:
- Store import hanging indefinitely
- "bearer token is missing" errors
- Config file and environment variable conflicts
- Client credential flow parameter requirements

## Impact

**Before**: Users encountering CLI hanging issues had no guidance and would be stuck
**After**: Comprehensive troubleshooting section helps users:
- Identify authentication method mismatches
- Bypass config file conflicts
- Understand the difference between direct tokens and client credentials
- Diagnose and fix issues independently

## MCP Server Deployment

**No rebuild required** - The `fga-auth0.md` file is loaded at runtime by the MCP server. Changes are immediately available after:
1. Saving the file ✅ (Done)
2. Restarting Claude Code (if already running)

## Related Files

- `/Users/violet.archer/Documents/FGA/vasaris-fga/.env` - Updated with token issuer and audience
- `/Users/violet.archer/Documents/FGA/vasaris-fga/store.fga.yaml` - Successfully deployed after fixes

## Verification

Successfully deployed store to Auth0 FGA using the documented approach:
```bash
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

Result: ✅ Model + 39 tuples + assertions successfully imported

## Next Steps

1. Test the updated MCP documentation by querying it
2. Consider adding similar troubleshooting sections for other prompts
3. Document this pattern for future MCP updates

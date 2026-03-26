# Auth0 FGA (Okta FGA) MCP Server - Claude Code Setup

**Created by Andrés Aguiar** (original MCP server)
**Enhanced for Auth0 FGA** (Okta Fine-Grained Authorization)
**Original Repository**: https://github.com/aaguiarz/openfga-modeling-mcp

Complete guide for installing and configuring the Auth0 FGA MCP Server and FGA Skill with Claude Code CLI for **sales engineers** and **solution architects**.

## Quick Note

This is a packaged distribution for **Auth0 FGA (Okta FGA)** - the fully managed hosted service at **dashboard.fga.dev**. This includes both the MCP server and an enhanced FGA skill for working with Auth0 FGA stores. The original MCP server was created by Andrés Aguiar.

## What You're Installing

This package provides two integrated components for **Auth0 FGA**:

1. **OpenFGA MCP Server** - Automatic expert context for OpenFGA queries
2. **Auth0 FGA Skill** - `/fga` command for working with Auth0 FGA stores, designing models, SDK integration, and building customer demos

## Prerequisites

Before installation, ensure you have:

- ✅ **Claude Code CLI** installed and configured
- ✅ **Node.js 18+**
  ```bash
  node --version  # Should be v18.0.0 or higher
  ```
- ✅ **Git** for cloning the repository
- ✅ **Auth0 FGA Account** - Sign up at https://dashboard.fga.dev
- ✅ **FGA CLI** (required for working with Auth0 FGA stores)
  ```bash
  brew install openfga/tap/fga
  ```
- ⚠️ **VS Code OpenFGA Extension** (recommended for syntax validation)
  - [Install from Marketplace](https://marketplace.visualstudio.com/items?itemName=openfga.openfga-vscode)

### Auth0 FGA Setup

Before using the skill, you'll need:
1. **Store ID** - From dashboard.fga.dev or via `fga store list`
2. **API Token** - From dashboard Settings > API Tokens
3. **Store Access** - Ensure your token has read/write permissions

## Installation

### Option 1: Automated Install (Recommended)

The automated installer works with **all shells** (bash, zsh, fish, etc.):

```bash
# Clone this repository
git clone https://github.com/violetarcher/fga-mcp-skills-quickstart.git
cd fga-mcp-skills-quickstart

# Make the installer executable and run it
chmod +x install.sh
./install.sh
```

The installer will:
1. ✅ Check all prerequisites
2. 🔨 Build the MCP server (`npm install && npm run build`)
3. 📝 Register the server with Claude Code (`claude mcp add`)
4. 📦 Install the FGA skill to `~/.claude/skills/fga`
5. ✔️ Verify the installation

### Option 2: Manual Install

If you prefer to install manually or the automated script fails:

#### Step 1: Build the MCP Server

```bash
# Clone this repository
git clone https://github.com/violetarcher/fga-mcp-skills-quickstart.git
cd fga-mcp-skills-quickstart

# Build the server
npm install
npm run build
```

Verify the build:
```bash
ls dist/index.js  # Should exist
```

#### Step 2: Register with Claude Code

```bash
# Register the MCP server (use absolute path)
claude mcp add openfga -- node $(pwd)/dist/index.js
```

Or with an explicit absolute path:
```bash
claude mcp add openfga -- node /absolute/path/to/fga-mcp-skills-quickstart/dist/index.js
```

Verify registration:
```bash
claude mcp list
# Should show: openfga: node /path/to/dist/index.js - ✓ Connected
```

#### Step 3: Install the FGA Skill

```bash
# Copy skill files to Claude's skills directory
cp -r skill ~/.claude/skills/fga
```

Verify installation:
```bash
ls -la ~/.claude/skills/fga
# Should contain: SKILL.md and reference.md
```

#### Step 4: Restart Claude Code

```bash
# Exit current session
/exit

# Start new session
claude
```

## Verification

After installation, verify everything works:

### 1. Check MCP Server

In Claude Code, ask:
```
What MCP tools do you have available?
```

You should see:
- `mcp__openfga__get_context_for_query` - Get relevant OpenFGA context
- `mcp__openfga__list_available_contexts` - List available contexts

### 2. Test Automatic Context

Ask an OpenFGA question:
```
How do I model hierarchical permissions in OpenFGA?
```

Claude should automatically use the MCP server to provide expert context.

### 3. Test FGA Skill

Try the skill with your Auth0 FGA store:
```
/fga connect to my Auth0 FGA store
```

Or design a new model:
```
/fga design an authorization model for a document management system
```

Claude should invoke the skill and guide you through Auth0 FGA workflows.

## Configuration Details

### MCP Server Configuration

Claude Code stores MCP configuration in `~/.claude.json` (managed via `claude mcp` commands).

**Do NOT manually edit** `~/.claude.json`. Always use `claude mcp` commands.

### Transport Modes

The MCP server automatically selects the transport mode:

- **STDIO Mode** (default for Claude Code CLI)
  - Used when no `PORT` environment variable is set
  - Communicates via stdin/stdout
  - Automatically used by Claude Code

- **HTTP Mode** (for production hosting)
  - Used when `PORT` environment variable is set
  - Provides `/health` and `/mcp` endpoints
  - Example: https://mcp.openfga.dev/mcp

### Skill Location

The FGA skill is installed at:
```
~/.claude/skills/fga/
├── SKILL.md        # Main skill implementation
└── reference.md    # Quick reference guide
```

## Management Commands

### MCP Server

```bash
# List all registered MCP servers
claude mcp list

# Get details about the OpenFGA server
claude mcp get openfga

# Remove the server
claude mcp remove openfga

# Re-add the server
claude mcp add openfga -- node /path/to/dist/index.js
```

### FGA Skill

```bash
# Update the skill after changes
cp -r skill ~/.claude/skills/fga

# View skill files
ls -la ~/.claude/skills/fga

# Remove skill
rm -rf ~/.claude/skills/fga
```

## Troubleshooting

### MCP Server Not Appearing

**Symptom**: Tools don't show up after registration

**Solutions**:
1. Verify registration:
   ```bash
   claude mcp list
   ```
   Should show `openfga` with `✓ Connected` status

2. Fully restart Claude Code:
   ```bash
   /exit
   claude
   ```

3. Check the server can start:
   ```bash
   cd /path/to/fga-mcp-skills-quickstart
   node dist/index.js < /dev/null
   ```

4. Rebuild and re-register:
   ```bash
   npm run build
   claude mcp remove openfga
   claude mcp add openfga -- node $(pwd)/dist/index.js
   ```

### FGA Skill Not Working

**Symptom**: `/fga` command doesn't work

**Solutions**:
1. Verify skill files exist:
   ```bash
   ls -la ~/.claude/skills/fga
   ```
   Should show `SKILL.md` and `reference.md`

2. Check file contents:
   ```bash
   head -20 ~/.claude/skills/fga/SKILL.md
   ```

3. Reinstall skill:
   ```bash
   cp -r skill ~/.claude/skills/fga
   ```

4. Restart Claude Code

### Node.js Version Error

**Symptom**: "Node.js version 18+ required"

**Solution**:
```bash
# Check current version
node --version

# Install/update Node.js
# macOS
brew install node

# Or download from https://nodejs.org
```

### Build Errors

**Symptom**: `npm run build` fails

**Solutions**:
1. Clean install:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. Check Node.js version (18+ required)

3. Check for TypeScript errors:
   ```bash
   npm run build 2>&1 | less
   ```

### Permission Errors

**Symptom**: "EACCES: permission denied"

**Solutions**:
```bash
# Make install script executable
chmod +x install.sh

# Fix npm permissions (if needed)
sudo chown -R $(whoami) ~/.npm

# Or use a Node version manager like nvm
```

## Shell Compatibility

The `install.sh` script works with **all shells**:
- bash users: `./install.sh`
- zsh users: `./install.sh`
- fish users: `./install.sh`
- Others: `bash install.sh`

The script uses `#!/usr/bin/env bash` which means it automatically runs in bash regardless of your default shell. No configuration needed!

## Development Mode

For contributors or those modifying the server:

```bash
# Run in development mode (auto-reload)
npm run dev

# Run with debug logging
LOG_LEVEL=DEBUG npm run dev

# Watch mode
npm run watch
```

## Alternative: Hosted MCP Server

If you prefer not to run the server locally, you can use the hosted version at:
- **MCP Endpoint**: https://mcp.openfga.dev/mcp
- **Health Check**: https://mcp.openfga.dev/health

**Note**: The hosted version only provides the MCP server. You'll still need to install the FGA skill locally for the `/fga` command.

### Configure Hosted Server (VS Code MCP Extensions)

For VS Code MCP extensions, use:

```json
{
  "mcpServers": {
    "openfga-mcp": {
      "url": "https://mcp.openfga.dev/mcp",
      "type": "http",
      "description": "OpenFGA Authorization Model Context Provider"
    }
  }
}
```

**This is NOT for Claude Code CLI** - Claude Code CLI uses `claude mcp add` commands, not JSON configuration.

## Usage Examples

### Using the MCP Server (Automatic)

Just ask OpenFGA questions naturally:

```
"Create an authorization model for a multi-tenant SaaS app"
"How do I implement parent-child relationships in OpenFGA?"
"What's the difference between direct and computed relations?"
"Add support for custom roles to my FGA model"
```

The MCP server detects these queries and automatically provides expert context.

### Using the FGA Skill (Explicit)

Invoke the skill for Auth0 FGA workflows:

```bash
# Connect to Auth0 FGA store
/fga connect to my Auth0 FGA store

# Pull existing model from store
/fga get the current model from my store

# Design a new model
/fga design an authorization model for [customer scenario]

# Deploy model to Auth0 FGA
/fga deploy this model to my store

# Generate and run tests
/fga write tests for this model

# Add demo data
/fga add demo data to my store

# Show SDK integration
/fga show me how to integrate FGA into a TypeScript app

# Prepare customer demo
/fga prepare a demo for [healthcare/finance/SaaS]
```

## Auth0 FGA Skill Features

The enhanced FGA skill includes workflows for:

1. **Store Management** - Connect to Auth0 FGA stores at dashboard.fga.dev
2. **Model Pull/Push** - Download and deploy models to stores
3. **Model Design** - Create authorization models for customer scenarios
4. **Testing** - Generate and run comprehensive test suites
5. **SDK Integration** - Code examples for JavaScript, Python, Go, .NET
6. **Demo Preparation** - Build compelling customer demos
7. **Tuple Management** - Write demo data to stores

### Common Customer Scenarios

The skill includes pre-built patterns for:
- Multi-tenant SaaS applications
- Document management systems
- Healthcare (HIPAA compliance)
- Financial services (SOX, PCI compliance)

## Future Enhancements

See [NEXT-STEPS.md](NEXT-STEPS.md) for planned enhancements including:
- Demo application setup (Next.js + Auth0 + FGA)
- Additional customer scenario templates
- SDK integration improvements

## Further Reading

- **Main README**: [README.md](README.md)
- **FGA Skill Guide**: `~/.claude/skills/fga/SKILL.md`
- **Quick Reference**: `~/.claude/skills/fga/reference.md`
- **Next Steps**: [NEXT-STEPS.md](NEXT-STEPS.md)
- **Auth0 FGA Dashboard**: https://dashboard.fga.dev
- **Auth0 FGA Docs**: https://auth0.com/docs/get-started/fga-overview
- **OpenFGA Docs**: https://openfga.dev/docs
- **Original Repository**: https://github.com/aaguiarz/openfga-modeling-mcp

## Credits

**Created by Andrés Aguiar**

This MCP server and FGA skill provide expert OpenFGA guidance based on:
- Official OpenFGA documentation
- Google's Zanzibar paper
- Real-world ReBAC implementation patterns
- Community best practices

## License

MIT License - Copyright (c) 2025 Andrés Aguiar

See [LICENSE](LICENSE) file for details.

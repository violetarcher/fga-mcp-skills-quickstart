# FGA MCP Server - Claude Code Setup

**Created by Andrés Aguiar** (original MCP server)
**Original Repository**: https://github.com/aaguiarz/openfga-modeling-mcp

Complete guide for installing and configuring the FGA MCP Server and OpenFGA skill with Claude Code CLI.

## Quick Note

This package provides the **OpenFGA Modeling MCP Server** — a passive context-injection tool that automatically enhances Claude's FGA knowledge. The FGA skill is now maintained by the OpenFGA team at [openfga/agent-skills](https://github.com/openfga/agent-skills) and installed separately.

## What You're Installing

1. **OpenFGA MCP Server** - Automatic expert context for OpenFGA queries (this repo)
2. **OpenFGA Skill** - `/openfga` command for designing models, testing, and SDK integration (external, from openfga/agent-skills)
3. **Lucid MCP Server** (optional) - Connect Claude to Lucid for creating and reading diagrams

## Prerequisites

Before installation, ensure you have:

- **Claude Code CLI** installed and configured
- **Node.js 18+**
  ```bash
  node --version  # Should be v18.0.0 or higher
  ```
- **Git** for cloning the repository
- **FGA CLI** (required for working with FGA stores)
  ```bash
  brew install openfga/tap/fga
  ```
- **VS Code OpenFGA Extension** (recommended for syntax validation)
  - [Install from Marketplace](https://marketplace.visualstudio.com/items?itemName=openfga.openfga-vscode)

## Installation

### Option 1: Automated Install (Recommended)

```bash
# Clone this repository
git clone https://github.com/violetarcher/fga-mcp-skills-quickstart.git
cd fga-mcp-skills-quickstart

# Make the installer executable and run it
chmod +x install.sh
./install.sh
```

The installer will:
1. Check all prerequisites
2. Build the MCP server (`npm install && npm run build`)
3. Register the server with Claude Code (`claude mcp add`)

After the script completes, install the OpenFGA skill:

```bash
npx skills add openfga/agent-skills
```

### Option 2: Manual Install

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
claude mcp add --scope user fga -- node $(pwd)/dist/index.js
```

Verify registration:
```bash
claude mcp list
# Should show: fga: node /path/to/dist/index.js - ✓ Connected
```

#### Step 3: Install the OpenFGA Skill

```bash
npx skills add openfga/agent-skills
```

#### Step 4: Restart Claude Code

```bash
# Exit current session
/exit

# Start new session
claude
```

#### Step 5: (Optional) Register Lucid MCP Server

> Requires access to the internal `llm.atko.ai` gateway. See [lucid.co/marketplace/e16391cc/lucid-mcp-server](https://lucid.co/marketplace/e16391cc/lucid-mcp-server).

```bash
claude mcp add --scope user lucid --transport http https://llm.atko.ai/lucid/mcp
```

## Verification

After installation, verify everything works:

### 1. Check MCP Server

In Claude Code, ask:
```
What MCP tools do you have available?
```

You should see:
- `mcp__fga__get_context_for_query` - Get relevant OpenFGA context
- `mcp__fga__list_available_contexts` - List available contexts

### 2. Test Automatic Context

Ask an OpenFGA question:
```
How do I model hierarchical permissions in OpenFGA?
```

Claude should automatically use the MCP server to provide expert context.

### 3. Test OpenFGA Skill

```
/openfga design an authorization model for a document management system
```

Claude should invoke the skill and guide you through the modeling workflow.

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

## Management Commands

### MCP Server

```bash
# List all registered MCP servers
claude mcp list

# Get details about the FGA server
claude mcp get fga

# Remove the server
claude mcp remove fga

# Re-add the server (globally)
claude mcp add --scope user fga -- node /path/to/dist/index.js
```

### OpenFGA Skill

The skill is installed by `npx skills add` and managed externally. To update:

```bash
npx skills add openfga/agent-skills
```

## Troubleshooting

### MCP Server Not Appearing

**Symptom**: Tools don't show up after registration

**Solutions**:
1. Verify registration:
   ```bash
   claude mcp list
   ```
   Should show `fga` with `✓ Connected` status

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
   claude mcp remove fga
   claude mcp add --scope user fga -- node $(pwd)/dist/index.js
   ```

### OpenFGA Skill Not Working

**Symptom**: `/openfga` command doesn't respond

**Solutions**:
- Check it was installed: `npx skills list` (or equivalent)
- Reinstall: `npx skills add openfga/agent-skills`
- Restart Claude Code

### Switching from the Old Custom Skill

If you previously had the custom skill from this repo:

```bash
rm -rf ~/.claude/skills/fga
npx skills add openfga/agent-skills
```

### Node.js Version Error

**Symptom**: "Node.js version 18+ required"

**Solution**:
```bash
node --version
brew install node  # or download from https://nodejs.org
```

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

### Using the OpenFGA Skill (Explicit)

```bash
# Design a new model
/openfga design an authorization model for [customer scenario]

# Review existing model
/openfga review ./model.fga

# Write tests
/openfga write tests for this model

# Show SDK integration
/openfga show me how to integrate FGA into a TypeScript app
```

## Further Reading

- **Main README**: [README.md](README.md)
- **OpenFGA skill source**: https://github.com/openfga/agent-skills
- **Auth0 FGA Dashboard**: https://dashboard.fga.dev
- **OpenFGA Docs**: https://openfga.dev/docs
- **Original MCP server**: https://github.com/aaguiarz/openfga-modeling-mcp
- **Lucid MCP Server**: https://lucid.co/marketplace/e16391cc/lucid-mcp-server

## Credits

**MCP server created by Andrés Aguiar**

**OpenFGA skill maintained by the OpenFGA team** at https://github.com/openfga/agent-skills

## License

MIT License - Copyright (c) 2025 Andrés Aguiar

See [LICENSE](LICENSE) file for details.

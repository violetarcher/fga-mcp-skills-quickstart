# FGA Modeling MCP Server

A specialized MCP (Model Context Protocol) server designed for use with **Claude Code CLI**, providing expert-level FGA authorization modeling guidance directly in your terminal. Pairs with the OpenFGA team's official skill for a complete development workflow.

Watch it in action: [YouTube Demo](https://www.youtube.com/watch?v=JNBtf-1NrPM)

## Credits & Attribution

The original MCP server was created by **[Andrés Aguiar](https://github.com/aaguiarz)** at https://github.com/aaguiarz/openfga-modeling-mcp.

The OpenFGA skill is maintained by the **[OpenFGA team](https://github.com/openfga)** at https://github.com/openfga/agent-skills.

## What You Get

This package provides integrated components for OpenFGA and Auth0 FGA development with Claude Code:

1. **MCP Server** - Automatic expert context injection for FGA queries (maintained in this repo)
2. **OpenFGA Skill** - The official OpenFGA team's `/openfga` skill for model design, testing, SDK integration, and more — installed separately via `npx skills add openfga/agent-skills`
3. **Lucid MCP Server** - Connect Claude to your Lucid diagrams to create visuals, search documents, and share with your team (optional, requires internal gateway access)

> **Note on Auth0 FGA workflows:** The OpenFGA team's skill covers generic OpenFGA modeling best practices. If you need Auth0 FGA-specific workflows (store management at dashboard.fga.dev, hosted-service CLI commands, sales demo prep), you will need to supplement with your own guidance — that content is no longer bundled here.

Together, they transform Claude Code into an expert OpenFGA/Auth0 FGA development assistant.

## Architecture: How They Work Together

### MCP Server vs OpenFGA Skill

| Aspect | MCP Server | OpenFGA Skill |
|--------|-----------|---------------|
| **Activation** | Automatic (passive) | Manual `/openfga` or auto-triggered |
| **Purpose** | Knowledge injection | Task execution |
| **User Action** | Just ask questions | Invoke explicit command or ask FGA questions |
| **Output** | Context for Claude | Concrete actions (files, CLI commands) |
| **Workflow** | Single-step (context lookup) | Multi-step (guided process) |
| **Maintained by** | This repo | [openfga/agent-skills](https://github.com/openfga/agent-skills) |

### Example Workflow

1. **You ask:** "Design a document management authorization model"
2. **MCP server** automatically provides FGA best practices to Claude (invisible to you)
3. **You invoke:** `/openfga design a document management model`
4. **Skill** uses the MCP-provided context and executes workflow:
   - Asks about requirements
   - Designs model with best practices
   - Validates DSL syntax
   - Generates test files

**In short:** The MCP server makes Claude an FGA expert. The skill turns that expertise into actionable development workflows.

## Quick Start

### Prerequisites

- **Claude Code CLI** installed and configured
- **Node.js 18+**
- **FGA CLI** (for testing and validation)
  ```bash
  brew install openfga/tap/fga
  ```
- **VS Code OpenFGA Extension** (recommended for syntax validation)
  - [Install from Marketplace](https://marketplace.visualstudio.com/items?itemName=openfga.openfga-vscode)

### Installation

#### Option 1: Automated Install (Recommended)

```bash
# Clone this repository
git clone https://github.com/violetarcher/fga-mcp-skills-quickstart.git
cd fga-mcp-skills-quickstart

# Run the automated installer
chmod +x install.sh
./install.sh
```

The install script will:
- Check prerequisites (Node.js, Claude CLI, FGA CLI)
- Build the MCP server
- Register it with Claude Code

After the script completes:

```bash
# Install the official OpenFGA skill
npx skills add openfga/agent-skills
```

#### Option 2: Manual Install

1. **Clone and build the MCP server**

```bash
git clone https://github.com/violetarcher/fga-mcp-skills-quickstart.git
cd fga-mcp-skills-quickstart
npm install
npm run build
```

2. **Register the MCP server with Claude Code**

```bash
claude mcp add --scope user fga -- node $(pwd)/dist/index.js
```

3. **Install the OpenFGA skill**

```bash
npx skills add openfga/agent-skills
```

4. **Verify installation**

```bash
# Check MCP server is registered
claude mcp list
```

5. **Test it out**

In Claude Code, try:
```
What MCP tools do you have available?
```

You should see `get_context_for_query` and `list_available_contexts` tools.

Then try the FGA skill:
```
/openfga design an authorization model for a document management system
```

### Lucid MCP Server (Optional)

The Lucid MCP server connects Claude to your Lucid diagrams, letting you intelligently search for files, create visuals, and share with your team.

> **Access:** Requires the internal `llm.atko.ai` gateway. Visit [lucid.co/marketplace/e16391cc/lucid-mcp-server](https://lucid.co/marketplace/e16391cc/lucid-mcp-server) for more information.

```bash
claude mcp add --scope user lucid --transport http https://llm.atko.ai/lucid/mcp
```

After registering, restart Claude Code and you will have access to Lucid tools for creating and reading diagrams inline in your conversations.

## Key Features

### MCP Server Features

- **Automatic Expert Context** - Detects FGA queries and injects relevant guidance
- **Intelligent Pattern Matching** - Recognizes 80+ FGA-specific patterns across 7 topic areas
- **Chunked Expert Knowledge** - 6,000+ words organized into focused topics for efficient context delivery
- **Zero Configuration** - Works automatically once installed
- **Auth0 FGA Support** - CLI commands, SDK patterns, store management
- **Smart Context Delivery** - Returns only relevant sections (70-95% token reduction per query)

### OpenFGA Skill Features (via [openfga/agent-skills](https://github.com/openfga/agent-skills))

- **Model Design** - Types, relations, and permission structures
- **Relationship Patterns** - Direct, concentric, indirect, conditional
- **Testing & Validation** - `.fga.yaml` test files and CLI usage
- **Custom Roles** - User-defined roles and role assignments
- **SDK Integration** - JavaScript/TypeScript, Go, Python, Java, .NET examples
- **Performance Optimization** - Simplification, tuple minimization, type restrictions

### Lucid MCP Server Features

- **Search Lucid documents** - Find diagrams and documents from your workspace
- **Create visuals** - Generate new Lucid diagrams from Claude
- **Share with your team** - Collaborate on diagrams without leaving your terminal

## Usage Guide

### Using the MCP Server

The MCP server works automatically in the background. When you ask FGA-related questions, it automatically injects expert context. No special commands needed!

**Example queries that trigger automatic context:**

```
"Create an authorization model for a document management system"
"How do I model hierarchical permissions in FGA?"
"What's the difference between direct and computed relations?"
"Add support for custom roles to my FGA model"
"Split my model into modular models"
```

**Efficiency:** Each query returns only 1-3k tokens (instead of 11k), providing relevant context without noise.

### Using the OpenFGA Skill

Invoke the skill explicitly with `/openfga` for structured workflows:

```bash
# Design a new model
/openfga design an authorization model for [your domain]

# Review existing model
/openfga review my FGA model at ./model.fga

# Generate tests
/openfga write tests for ./authorization-model.fga

# Optimize performance
/openfga optimize my model for better performance

# Security audit
/openfga security review for ./model.fga
```

The skill also auto-activates when you work with `.fga` model files, `.fga.yaml` test files, or OpenFGA SDK code.

## Development & Testing

### Run in development mode

```bash
npm run dev
```

### Enable debug logging

```bash
LOG_LEVEL=DEBUG npm run dev
```

### Test the MCP server manually

```bash
npm test
# or
node dist/index.js < /dev/null
```

## Configuration

### MCP Server Management

```bash
# List all MCP servers
claude mcp list

# Get server details
claude mcp get fga

# Remove the server
claude mcp remove fga

# Re-add with absolute path (globally)
claude mcp add --scope user fga -- node /absolute/path/to/fga-mcp-skills-quickstart/dist/index.js
```

### Updating the OpenFGA Skill

The skill is maintained externally. To get the latest version:

```bash
npx skills add openfga/agent-skills
```

## Troubleshooting

### Installation Issues

**"Permission denied" when running install.sh**
```bash
chmod +x install.sh
```

**Script runs but MCP server not appearing**
1. Verify registration: `claude mcp list`
2. Fully exit Claude Code: `/exit` then restart with `claude`
3. Rebuild the server: `npm run build`

**"Node.js version error"**
- Requires Node.js 18+
- Check version: `node --version`
- Update Node.js from https://nodejs.org

**Switching from the old custom skill**
If you previously installed the custom FGA skill from this repo:
```bash
rm -rf ~/.claude/skills/fga
```
Then install the official skill:
```bash
npx skills add openfga/agent-skills
```

## Project Structure

```
fga-mcp-skills-quickstart/
├── src/
│   ├── index.ts                    # MCP server implementation
│   ├── prompt-matcher.ts           # Intelligent pattern matching engine (7 topic areas)
│   └── logger.ts                   # Logging system
├── prompts/                        # Chunked expert knowledge (6,000+ words)
│   ├── fga-intro-concepts.md      # Core concepts & DSL (~1.4k tokens)
│   ├── fga-relationships.md       # Relationships & patterns (~1.3k tokens)
│   ├── fga-modeling-guide.md      # Step-by-step modeling (~1.1k tokens)
│   ├── fga-testing.md             # Testing & validation (~1.3k tokens)
│   ├── fga-custom-roles.md        # Custom role patterns (~1.4k tokens)
│   ├── fga-advanced.md            # Modules & best practices (~0.6k tokens)
│   └── fga-auth0.md               # Auth0 FGA specifics (~3.3k tokens)
├── dist/                           # Compiled JavaScript output
├── install.sh                      # Automated installer (bash/zsh compatible)
├── CHUNKING-SUMMARY.md             # Optimization details & benchmarks
├── CLAUDE-CODE-SETUP.md            # Detailed setup guide
├── DEMO-SCRIPT.md                  # Demo walkthrough script
├── README.md                       # Main documentation (this file)
└── package.json                    # Project dependencies
```

## Available MCP Tools

### `get_context_for_query`

Analyzes queries and returns relevant FGA context.

**Parameters:**
- `query` (string): The query to analyze for FGA patterns

**Example:**
```json
{
  "query": "Create an authorization model for a document management system"
}
```

### `list_available_contexts`

Lists all available FGA context prompts and their trigger patterns.

**Example:**
```json
{}
```

## Learning Resources

- **`CHUNKING-SUMMARY.md`** - Performance optimization details (70-95% token reduction)
- **`prompts/`** - Chunked expert guidance across 7 focused topics (6,000+ words total)
  - Core concepts, relationships, modeling, testing, custom roles, advanced topics, Auth0 FGA
- **[openfga/agent-skills](https://github.com/openfga/agent-skills)** - Official OpenFGA skill source

External resources:
- [OpenFGA Documentation](https://openfga.dev)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Zanzibar Paper](https://research.google/pubs/pub48190/)
- [OpenFGA Playground](https://play.openfga.dev)
- [Sample Models](https://github.com/openfga/sample-stores)
- [Auth0 FGA Dashboard](https://dashboard.fga.dev)
- [Lucid MCP Server](https://lucid.co/marketplace/e16391cc/lucid-mcp-server)

## Technical Details

- **Framework**: Model Context Protocol (MCP) SDK v1.17.1
- **Language**: TypeScript with ES2022 target
- **Transport**: STDIO for Claude Code CLI
- **Pattern Engine**: Intelligent topic-based routing (80+ patterns across 7 categories)
- **Context Library**: 6,000+ words chunked into focused topics (70-95% smaller responses)
- **Logging**: Structured logging with performance metrics

## Contributing

Contributions welcome! To contribute:

1. Fork this repository at https://github.com/violetarcher/fga-mcp-skills-quickstart
2. Create a feature branch
3. Make your changes
4. Test locally with Claude Code
5. Submit a pull request

For the OpenFGA skill, contribute at [openfga/agent-skills](https://github.com/openfga/agent-skills).

## License

MIT License - Copyright (c) 2025 Andrés Aguiar

See [LICENSE](LICENSE) file for full details.

---

**Ready to build fine-grained authorization systems?** Install the MCP server and OpenFGA skill to get started with expert FGA guidance in Claude Code!

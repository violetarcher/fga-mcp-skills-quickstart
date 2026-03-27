# FGA Modeling MCP Server

A specialized MCP (Model Context Protocol) server designed for use with **Claude Code CLI**, providing expert-level FGA authorization modeling guidance directly in your terminal. This package includes both the MCP server and a comprehensive FGA skill for building fine-grained authorization systems.

Watch it in action: [YouTube Demo](https://www.youtube.com/watch?v=JNBtf-1NrPM)

## Credits & Attribution

This is a packaged distribution that includes both the MCP server and FGA skill for easy installation with Claude Code. The original MCP server was created by **[Andrés Aguiar](https://github.com/aaguiarz)** at https://github.com/aaguiarz/openfga-modeling-mcp.

This enhanced version provides expert FGA guidance based on:
- Official FGA documentation
- Google's Zanzibar paper
- Real-world ReBAC implementation patterns
- Auth0 FGA (Okta FGA) best practices
- Community best practices

## What You Get

This package provides integrated components for Auth0 FGA development with Claude Code:

1. **MCP Server** - Automatic expert context injection for FGA queries
2. **FGA Skill** - Comprehensive `/fga` command for model design, testing, SDK integration, and demo preparation
3. **Demo App** (Coming Soon) - Blank canvas Next.js app with Auth0 + FGA + LiteLLM integration

Together, they transform Claude Code into an expert Auth0 FGA development assistant for sales engineers.

## 🏗️ Architecture: How They Work Together

### MCP Server vs FGA Skill

| Aspect | MCP Server | FGA Skill |
|--------|-----------|-----------|
| **Activation** | Automatic (passive) | Manual `/fga` (active) |
| **Purpose** | Knowledge injection | Task execution |
| **User Action** | Just ask questions | Invoke explicit command |
| **Output** | Context for Claude | Concrete actions (files, CLI commands) |
| **Workflow** | Single-step (context lookup) | Multi-step (guided process) |
| **When Used** | Every FGA question | Specific sales engineering tasks |

### Example Workflow

1. **You ask:** "Design a document management authorization model"
2. **MCP server** automatically provides FGA best practices to Claude (invisible to you)
3. **You invoke:** `/fga design a document management model`
4. **Skill** uses the MCP-provided context and executes workflow:
   - Asks about requirements
   - Designs model with best practices
   - Validates DSL syntax
   - Generates test files
   - Offers to deploy to Auth0 FGA store

**In short:** The MCP server makes Claude an FGA expert. The skill turns that expertise into actionable sales engineering workflows.

## 🚀 Quick Start

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

Works with both bash and zsh:

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
- Install the FGA skill
- Verify the installation

**Shell Compatibility**: The script works with bash, zsh, fish, and all POSIX-compatible shells. It uses `#!/usr/bin/env bash` so it will automatically run in bash regardless of your default shell. No configuration needed.

#### Option 2: Manual Install

1. **Clone and build the MCP server**

```bash
# Clone this repository
git clone https://github.com/violetarcher/fga-mcp-skills-quickstart.git
cd fga-mcp-skills-quickstart

# Build the server
npm install
npm run build
```

2. **Register the MCP server with Claude Code**

This tells Claude Code to run the MCP server automatically:

```bash
# Register with the current directory's path
claude mcp add --scope user fga -- node $(pwd)/dist/index.js
```

What this does:
- `claude mcp add --scope user fga` - Registers a server named "fga" globally for all projects
- `--scope user` - Makes the server available in all Claude Code sessions (not just this project)
- `--` - Separator between server name and command
- `node $(pwd)/dist/index.js` - Command to start the server ($(pwd) expands to absolute path)

3. **Install the FGA skill**

```bash
# Copy the skill to Claude Code's skill directory
cp -r skill ~/.claude/skills/fga
```

4. **Verify installation**

```bash
# Check MCP server is registered
claude mcp list

# Restart Claude Code
claude
```

5. **Test it out**

In Claude Code, try:
```
What MCP tools do you have available?
```

You should see `get_context_for_query` and `list_available_contexts` tools.

Then try the FGA skill:
```
/fga design an authorization model for a document management system
```

## 🎯 Key Features

### MCP Server Features

- **🚨 Automatic Expert Context** - Detects FGA queries and injects relevant guidance
- **🔍 Intelligent Pattern Matching** - Recognizes 80+ FGA-specific patterns across 7 topic areas
- **📚 Chunked Expert Knowledge** - 6,000+ words organized into focused topics for efficient context delivery
- **⚡ Zero Configuration** - Works automatically once installed
- **🏢 Auth0 FGA Support** - CLI commands, SDK patterns, store management
- **🎯 Smart Context Delivery** - Returns only relevant sections (70-95% token reduction per query)

### FGA Skill Features

- **🎨 Model Design** - Interactive design for customer scenarios
- **✅ DSL Validation** - Syntax checking and security review
- **🧪 Test Generation** - Comprehensive `.fga.yaml` test files
- **🔒 Security Review** - Permission logic verification
- **⚡ Performance Optimization** - Efficient tuple strategies
- **🔄 Migration Planning** - Safe model evolution guidance
- **🏪 Store Management** - Connect to Auth0 FGA stores at dashboard.fga.dev
- **🚀 SDK Integration** - Code examples for JavaScript, Python, Go, .NET
- **🎭 Demo Preparation** - Build compelling customer demos

### Demo App Features (Coming Soon)

- **🎨 Blank Canvas** - No hardcoded authorization logic
- **🔐 Auth0 + FGA** - Authentication + authorization ready
- **🤖 LiteLLM Chat** - AI agent integration
- **📦 Generic Helpers** - Reusable FGA functions
- **📚 Example Patterns** - Reference implementations
- **🏗️ Claude Code Integration** - Build custom demos with AI assistance

## 📖 Usage Guide

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

**The MCP server intelligently routes queries to focused topics:**
- **Core Concepts** - "what is openfga", "dsl", "types", "tuples"
- **Relationships** - "hierarchical permissions", "x from y", "usersets"
- **Modeling** - "how to model", "step by step", "document management"
- **Testing** - "test", "validate", ".fga.yaml", "assertions"
- **Custom Roles** - "role assignment", "user defined roles"
- **Advanced** - "modules", "best practices", "performance"
- **Auth0 FGA** - "dashboard.fga.dev", "store id", "hosted fga"

**Efficiency:** Each query returns only 1-3k tokens (instead of 11k), providing relevant context without noise.

### Using the FGA Skill

Invoke the skill explicitly with `/fga` for structured workflows:

```bash
# Design a new model
/fga design an authorization model for [your domain]

# Review existing model
/fga review my FGA model at ./model.fga

# Generate tests
/fga write tests for ./authorization-model.fga

# Optimize performance
/fga optimize my model for better performance

# Security audit
/fga security review for ./model.fga
```

The skill provides:
- Step-by-step guidance through complex modeling tasks
- Automatic test generation with the FGA CLI
- Security checklist validation
- Performance optimization recommendations
- Common pattern templates

## 🛠️ Development & Testing

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

### Update the skill

If you modify the skill files in `skill/`, reinstall:

```bash
cp -r skill ~/.claude/skills/fga
```

## 🔧 Configuration

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

### Skill Management

The skill is located at `~/.claude/skills/fga/` after installation. To update:

```bash
cd /path/to/fga-mcp-skills-quickstart
cp -r skill ~/.claude/skills/fga
```

## 🛠️ Troubleshooting

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

**FGA skill not working**
- Verify installation: `ls -la ~/.claude/skills/fga`
- Should contain `SKILL.md` and `reference.md`
- Reinstall: `cp -r skill ~/.claude/skills/fga`

## 🏗️ Project Structure

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
├── skill/
│   ├── SKILL.md                    # FGA skill for sales engineers (839 lines)
│   └── reference.md                # Quick reference guide
├── demo-app/                       # (Coming soon) Next.js + Auth0 + FGA + LiteLLM
├── dist/                           # Compiled JavaScript output
├── install.sh                      # Automated installer (bash/zsh compatible)
├── CHUNKING-SUMMARY.md             # Optimization details & benchmarks
├── CLAUDE-CODE-SETUP.md            # Detailed setup guide
├── DEMO-APP-PLAN.md                # Demo app implementation plan
├── NEXT-STEPS.md                   # Future enhancements context
├── README.md                       # Main documentation (this file)
└── package.json                    # Project dependencies
```

## 📚 Available MCP Tools

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

## 🎓 Learning Resources

The package includes comprehensive documentation:

- **`skill/SKILL.md`** - Complete FGA skill guide with workflows and patterns (839 lines)
- **`skill/reference.md`** - Quick reference for OpenFGA DSL syntax
- **`prompts/`** - Chunked expert guidance across 7 focused topics (6,000+ words total)
  - Core concepts, relationships, modeling, testing, custom roles, advanced topics, Auth0 FGA
- **`CHUNKING-SUMMARY.md`** - Performance optimization details (70-95% token reduction)

External resources:
- [OpenFGA Documentation](https://openfga.dev)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Zanzibar Paper](https://research.google/pubs/pub48190/)
- [OpenFGA Playground](https://play.openfga.dev)
- [Sample Models](https://github.com/openfga/sample-stores)

## 🔬 Technical Details

- **Framework**: Model Context Protocol (MCP) SDK v1.17.1
- **Language**: TypeScript with ES2022 target
- **Transport**: STDIO for Claude Code CLI
- **Pattern Engine**: Intelligent topic-based routing (80+ patterns across 7 categories)
- **Context Library**: 6,000+ words chunked into focused topics (70-95% smaller responses)
- **Logging**: Structured logging with performance metrics
- **Optimization**: Smart context delivery returns only relevant sections per query

## 🤝 Contributing

Contributions welcome! To contribute:

1. Fork this repository at https://github.com/violetarcher/fga-mcp-skills-quickstart
2. Create a feature branch
3. Make your changes
4. Test locally with Claude Code
5. Submit a pull request

For the original MCP server, see [Andrés Aguiar's repository](https://github.com/aaguiarz/openfga-modeling-mcp).

## 📄 License

MIT License - Copyright (c) 2025 Andrés Aguiar

See [LICENSE](LICENSE) file for full details.

---

**Ready to build fine-grained authorization systems?** Install the MCP server and FGA skill to get started with expert FGA guidance in Claude Code!

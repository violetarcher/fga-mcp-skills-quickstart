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

## Building End-to-End Demos with Claude Code

This toolkit is designed to power full, polished demos — not just model design. Claude Code, paired with the FGA MCP Server and OpenFGA skill, can take a single well-crafted prompt and produce a complete, customer-ready demo application from scratch.

### Using the Prompt Builder Gem

Before kicking off a build, use the **[FGA Demo Prompt Builder](https://gemini.google.com/gem/1Zl0YF902CUrzLV4Pxm7gOACzbqCfDw0U?usp=sharing)** — a Gemini gem that helps you craft a thorough, structured prompt for your specific domain and demo scenario.

### Prompt Tips

- **Set up your store and project directory first.** Before giving Claude the prompt: (1) create a new FGA store at [dashboard.fga.dev](https://dashboard.fga.dev), (2) open the store and save the default model — if you skip this, Claude's model push will fail against an uninitialized store, (3) create a client in the store's settings to receive your `FGA_CLIENT_ID` and `FGA_CLIENT_SECRET`, then (4) create your project directory and drop a `.env` file in the root with those credentials plus your `FGA_STORE_ID` and `FGA_API_URL` before invoking Claude.
- **Name the demo moments.** Describe the 2–4 scenarios you'll walk through on-screen. Claude will wire them end-to-end and can add a dedicated walkthrough tab.
- **Specify reset behavior.** For live demos, tell Claude to implement reset by rewriting tuples back to the seed file — not by tracking a diff.
- **State quality expectations.** If this is going to senior leadership, say so.
- **Prefer a separate FGA directory.** Keep model, tests, and seed tuples together and away from app code.

### Sample Kickoff Prompt

```
I need a customer-facing demo built on Auth0 FGA for a sales prospect — an investment
banking and wealth management platform managing capital calls. No authentication — just
use a persona picker so I can switch between different users on the fly. The whole point
is to show off fine-grained authorization, so every access decision in the UI should be
a live FGA check, not hardcoded logic. Include an FGA Logger in the UI so we can see
the real-time checks. Use the Batch Check API where necessary for bulk checks. Ensure
the structure of the project has a directory for the demo and for FGA. For demo reset
functionality, ensure we are resetting the demo to the original seed tuple state in
order to allow us to add other on-the-fly modifications. Ensure that in our FGA folder
we have the model, test suite, and tuple seed file. Create a permissions matrix.csv and
a diagrams.md to visually explain our project — use valid mermaid syntax for all
diagrams, and include a visual representation of the permissions matrix.

Model these resources: investment_llc, fund, capital_call, and document.
Roles should be scoped per-fund:
* fund_admin — full access, can invite users to the fund group, and request money
  (initiate capital calls).
* fund_participant (investor) — can view the fund, view relevant documents, and respond
  to capital calls, but cannot invite others or initiate calls.
* agent (representing agentic AI workloads) — minimal, strictly scoped access, perhaps
  temporal or conditional, requiring explicit permission to execute actions on behalf of
  a user.
There's also an organizational layer — an individual (e.g., a high-net-worth physician)
operating under their own investment LLC who manages their own funds but also
participates in external funds.

The demo needs to hit a few specific moments hard:
1. Dual-Role Multi-Fund scoping — show one person acting as a fund_admin for their own
   LLC's fund, while acting as a regular fund_participant in a completely separate fund.
   Prove that access boundaries (like the ability to request money or invite users) do
   not leak across funds.
2. The Capital Call flow — an admin requesting money, proving that only users actively
   participating in that specific fund group can see and participate in the call.
3. Invite flow — demonstrate an admin inviting a new participant to a fund, writing the
   FGA tuple live, and instantly unlocking access for that new user.
   a. Add the demo scenarios and walkthrough steps to their own tab in the application.

Build it in Next.js with the app router and the OpenFGA SDK. Use the FGA MCP Server and
OpenFGA Skill where needed. I have a .env with credentials for our FGA store for you to
use. This has to be polished enough to demo to a senior leadership team, so keep it
realistic to how a capital call and investment management platform actually runs.
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

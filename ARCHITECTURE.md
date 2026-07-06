# FGA MCP Server & Skill Architecture

## Overview Diagram

```mermaid
graph TB
    subgraph User["👤 User Layer"]
        UserQuery["User asks FGA question<br/>or invokes /fga command"]
    end

    subgraph ClaudeCode["🤖 Claude Code (Orchestrator)"]
        Claude["Claude AI<br/>(processes queries)"]
    end

    subgraph MCP["📦 MCP Server (Tool Server)"]
        MCPServer["src/index.ts<br/>MCP Server Entrypoint<br/>━━━━━━━━━━━━━━━━<br/>Exposes 2 Tools:<br/>• get_context_for_query<br/>• list_available_contexts"]
        PatternMatcher["src/prompt-matcher.ts<br/>Pattern Matching Engine<br/>90+ patterns"]

        subgraph Prompts["📚 Expert Knowledge (7 Topic Files)"]
            Intro["fga-intro-concepts.md<br/>~1.4k tokens"]
            Rel["fga-relationships.md<br/>~1.3k tokens"]
            Guide["fga-modeling-guide.md<br/>~1.1k tokens"]
            Test["fga-testing.md<br/>~1.3k tokens"]
            Roles["fga-custom-roles.md<br/>~1.4k tokens"]
            Adv["fga-advanced.md<br/>~0.6k tokens"]
            Auth0["fga-auth0.md<br/>~6.3k tokens"]
        end
    end

    subgraph Skill["⚙️ OpenFGA Skill (Active - External)"]
        SkillMD["openfga/agent-skills<br/>Structured Workflows<br/>(maintained by OpenFGA team)"]
    end

    UserQuery --> Claude

    Claude -->|"Calls Tool:<br/>get_context_for_query('hierarchies')"| MCPServer
    MCPServer --> PatternMatcher
    PatternMatcher -->|"Routes query"| Prompts

    Prompts -->|"Returns prompt content<br/>as tool result"| MCPServer
    MCPServer -->|"Tool result"| Claude

    UserQuery -.->|"/fga command"| SkillMD
    SkillMD -->|"Loads workflow"| Claude
    Claude -.->|"During workflow execution<br/>calls MCP tools"| MCPServer

    Claude -->|"Response with expert guidance"| UserQuery

    style MCP fill:#e1f5ff
    style Skill fill:#fff4e1
    style ClaudeCode fill:#f0e1ff
    style User fill:#e1ffe1
```

## Detailed Component Diagram

```mermaid
graph TB
    subgraph External["External Systems"]
        Dashboard["dashboard.fga.dev<br/>Auth0 FGA Dashboard"]
        CLI["FGA CLI<br/>Command Line Tool"]
    end

    subgraph User["User Environment"]
        Terminal["Terminal<br/>(Claude Code)"]
        Files["Project Files<br/>(.fga, .fga.yaml, .env)"]
    end

    subgraph MCPServer["MCP Server Architecture"]
        direction TB

        Index["src/index.ts<br/>━━━━━━━━━━━━━━━━<br/>• Tool Registration<br/>• get_context_for_query<br/>• list_available_contexts"]

        Matcher["src/prompt-matcher.ts<br/>━━━━━━━━━━━━━━━━<br/>• findBestMatch()<br/>• loadPromptContent()<br/>• 90+ patterns<br/>• 7 rule categories"]

        Logger["src/logger.ts<br/>━━━━━━━━━━━━━━━━<br/>• Debug logging<br/>• Pattern match tracking"]

        subgraph PromptFiles["Prompts Directory"]
            P1["fga-intro-concepts.md<br/>━━━━━━━━━━━━━━━━<br/>Core concepts, DSL, tuples"]
            P2["fga-relationships.md<br/>━━━━━━━━━━━━━━━━<br/>Direct, concentric, indirect<br/>Conditions, usersets"]
            P3["fga-modeling-guide.md<br/>━━━━━━━━━━━━━━━━<br/>Step-by-step process<br/>can_ permissions"]
            P4["fga-testing.md<br/>━━━━━━━━━━━━━━━━<br/>Local .fga.yaml tests<br/>fga model test"]
            P5["fga-custom-roles.md<br/>━━━━━━━━━━━━━━━━<br/>role#assignee pattern<br/>User-defined roles"]
            P6["fga-advanced.md<br/>━━━━━━━━━━━━━━━━<br/>Modules, fga.mod<br/>Performance"]
            P7["fga-auth0.md<br/>━━━━━━━━━━━━━━━━<br/>Store management, SDK<br/>Store assertions<br/>Credential security"]
        end

        Index --> Matcher
        Matcher --> Logger
        Matcher --> PromptFiles
    end

    subgraph SkillArch["Skill Architecture (External)"]
        SkillFile["openfga/agent-skills<br/>━━━━━━━━━━━━━━━━<br/>• Design workflow<br/>• Review workflow<br/>• Optimize workflow<br/>• Testing workflow<br/><br/>Install: npx skills add openfga/agent-skills<br/>Source: github.com/openfga/agent-skills"]
    end

    Terminal --> Index
    Terminal --> SkillFile

    SkillFile -.->|"Triggers MCP context injection"| Index

    Index -.->|"Claude executes commands"| CLI
    CLI -.-> Dashboard
    CLI -.-> Files

    style MCPServer fill:#e1f5ff
    style SkillArch fill:#fff4e1
    style External fill:#ffe1e1
    style User fill:#e1ffe1
```

## Pattern Matching Flow

```mermaid
flowchart TD
    Start["User Query:<br/>'How do I model hierarchies?'"]

    Start --> Detect["Claude Code detects<br/>potential FGA query"]

    Detect --> MCPCall["Calls MCP Tool:<br/>get_context_for_query()"]

    MCPCall --> Matcher["Pattern Matcher<br/>findBestMatch()"]

    Matcher --> Lower["Convert query to lowercase"]

    Lower --> Loop["Loop through 7 rule sets<br/>(in order)"]

    Loop --> Check1["Check: fga-intro-concepts patterns?"]
    Check1 -->|No| Check2["Check: fga-relationships patterns?"]
    Check2 -->|Yes - matches 'hierarchical'| Load2["Load fga-relationships.md"]
    Check2 -->|No| Check3["Check: fga-custom-roles patterns?"]
    Check3 -->|No| Check4["Check: fga-auth0 patterns?"]
    Check4 -->|No| Check5["Check: fga-testing patterns?"]
    Check5 -->|No| Check6["Check: fga-advanced patterns?"]
    Check6 -->|No| Check7["Check: fga-modeling-guide patterns?"]
    Check7 -->|No| NoMatch["Return: null<br/>(no match)"]

    Load2 --> Return["Return context:<br/>~1.3k tokens"]

    Return --> Inject["Claude receives context<br/>+ user query"]

    Inject --> Generate["Claude generates response<br/>with expert FGA knowledge"]

    Generate --> Response["User receives answer about<br/>hierarchical permissions"]

    style Start fill:#e1ffe1
    style Load2 fill:#e1f5ff
    style Generate fill:#f0e1ff
    style Response fill:#e1ffe1
```

## MCP Server + Skill Collaboration

```mermaid
sequenceDiagram
    actor User
    participant Claude as Claude Code
    participant Skill as FGA Skill
    participant MCP as MCP Server Tools
    participant Matcher as Pattern Matcher
    participant Prompts as Prompt Files

    Note over User,Prompts: Scenario: User invokes /fga to design a model

    User->>Claude: /fga design document management model

    activate Skill
    Claude->>Skill: Load skill workflow
    Skill-->>Claude: Workflow instructions loaded
    deactivate Skill

    Note over Claude: Claude processes task,<br/>thinks about FGA concepts

    Claude->>MCP: TOOL CALL: get_context_for_query<br/>(query: "hierarchical permissions")
    activate MCP
    MCP->>Matcher: findBestMatch("hierarchical permissions")
    activate Matcher
    Matcher->>Prompts: Pattern matches fga-relationships.md
    Prompts-->>Matcher: File content (~1.3k tokens)
    Matcher-->>MCP: Matched content
    deactivate Matcher
    MCP-->>Claude: TOOL RESULT: Context content
    deactivate MCP

    Note over Claude: Claude applies workflow<br/>+ relationship knowledge

    Claude->>MCP: TOOL CALL: get_context_for_query<br/>(query: "custom roles")
    activate MCP
    MCP->>Matcher: findBestMatch("custom roles")
    activate Matcher
    Matcher->>Prompts: Pattern matches fga-custom-roles.md
    Prompts-->>Matcher: File content (~1.4k tokens)
    Matcher-->>MCP: Matched content
    deactivate Matcher
    MCP-->>Claude: TOOL RESULT: Context content
    deactivate MCP

    Claude-->>User: Generated FGA model with:<br/>- Hierarchical permissions<br/>- Custom assignee pattern<br/>- Proper DSL syntax

    Note over User,Prompts: Skill provides workflow structure<br/>MCP tools provide expert knowledge on demand
```

## Skill Invocation Flow

```mermaid
flowchart TD
    Start["User types: /fga design a blog platform"]

    Start --> SkillDetect["Claude Code detects /fga command"]

    SkillDetect --> LoadSkill["Load openfga/agent-skills<br/>Active workflow instructions"]

    LoadSkill --> ParseCmd["Parse command:<br/>task = 'design a blog platform'"]

    ParseCmd --> WorkflowStart["Skill: Start design workflow<br/>1. Ask clarifying questions<br/>2. Identify resources<br/>3. Model relationships<br/>4. Define permissions"]

    WorkflowStart --> Step1["Claude asks user:<br/>'What resources need protection?'"]

    Step1 --> UserResp["User: posts, comments, users"]

    UserResp --> MCPInject1["MCP automatically injects<br/>fga-modeling-guide.md"]

    MCPInject1 --> Generate1["Claude generates initial model<br/>with types for post, comment, user"]

    Generate1 --> Step2["Skill: Define relationships"]

    Step2 --> MCPInject2["MCP automatically injects<br/>fga-relationships.md"]

    MCPInject2 --> Generate2["Claude adds relations:<br/>author, commenter, reader"]

    Generate2 --> Step3["Skill: Offer to create tests"]

    Step3 --> MCPInject3["MCP automatically injects<br/>fga-testing.md"]

    MCPInject3 --> Final["Claude generates .fga.yaml<br/>test file with assertions"]

    Final --> Complete["Complete model delivered:<br/>• Model file<br/>• Test file<br/>• Next steps"]

    style Start fill:#e1ffe1
    style LoadSkill fill:#fff4e1
    style MCPInject1 fill:#e1f5ff
    style MCPInject2 fill:#e1f5ff
    style MCPInject3 fill:#e1f5ff
    style Complete fill:#e1ffe1
```

## Token Efficiency Comparison

```mermaid
graph LR
    subgraph Before["Before Chunking"]
        MonoQuery["User Query"]
        MonoFile["authorization-model.md<br/>11.1k tokens<br/>❌ Large response warning"]
        MonoQuery --> MonoFile
    end

    subgraph After["After Chunking"]
        ChunkQuery["User Query"]
        Router["Pattern Matcher<br/>90+ patterns"]
        Chunk1["Matched file<br/>0.6k - 6.3k tokens<br/>✅ Optimized"]

        ChunkQuery --> Router
        Router --> Chunk1
    end

    MonoFile -.->|"Split into 7 files"| After

    style MonoFile fill:#ffcccc
    style Chunk1 fill:#ccffcc
```

## File Organization

```mermaid
graph TD
    Root["fga-mcp-skills-quickstart/"]

    Root --> Src["src/"]
    Root --> Prompts["prompts/"]
    Root --> SkillDir["skill (external)"]
    Root --> Tests["test files"]
    Root --> Docs["documentation"]

    Src --> Index["index.ts<br/>(MCP server)"]
    Src --> Matcher["prompt-matcher.ts<br/>(pattern engine)"]
    Src --> Log["logger.ts"]

    Prompts --> P1["fga-intro-concepts.md"]
    Prompts --> P2["fga-relationships.md"]
    Prompts --> P3["fga-modeling-guide.md"]
    Prompts --> P4["fga-testing.md"]
    Prompts --> P5["fga-custom-roles.md"]
    Prompts --> P6["fga-advanced.md"]
    Prompts --> P7["fga-auth0.md"]
    Prompts --> PBackup["authorization-model.md.backup"]

    SkillDir["External Skill<br/>openfga/agent-skills"]

    Tests --> UAT["test-uat.js<br/>(26 automated tests)"]
    Tests --> UATGuide["UAT-GUIDE.md"]
    Tests --> UATQuick["UAT-QUICKSTART.md"]

    Docs --> Readme["README.md"]
    Docs --> Setup["CLAUDE-CODE-SETUP.md"]
    Docs --> Chunking["CHUNKING-SUMMARY.md"]
    Docs --> Demo["DEMO-SCRIPT.md"]
    Docs --> ClaudeMD[".claude.md"]

    style Src fill:#e1f5ff
    style Prompts fill:#e1f5ff
    style SkillDir fill:#fff4e1
    style Tests fill:#e1ffe1
    style Docs fill:#f0f0f0
```

## Pattern Matching Priority

```mermaid
graph TD
    Query["Incoming Query"]

    Query --> Rule1["1. fga-intro-concepts<br/>━━━━━━━━━━━━━━━━<br/>Patterns: 'what is fga', 'core concept',<br/>'dsl', 'zanzibar', 'rebac'"]

    Rule1 -->|No match| Rule2["2. fga-relationships<br/>━━━━━━━━━━━━━━━━<br/>Patterns: 'hierarchical permission',<br/>'x from y', 'userset', 'condition'"]

    Rule2 -->|No match| Rule3["3. fga-custom-roles<br/>━━━━━━━━━━━━━━━━<br/>Patterns: 'custom role', 'assignee',<br/>'role#assignee', 'dynamic role'"]

    Rule3 -->|No match| Rule4["4. fga-auth0 (IMPORTANT)<br/>━━━━━━━━━━━━━━━━<br/>Patterns: 'dashboard', 'store assertion',<br/>'credentials', 'api token', 'store import'"]

    Rule4 -->|No match| Rule5["5. fga-testing<br/>━━━━━━━━━━━━━━━━<br/>Patterns: 'test', 'assertion', 'validate',<br/>'.fga.yaml', 'fga model test'"]

    Rule5 -->|No match| Rule6["6. fga-advanced<br/>━━━━━━━━━━━━━━━━<br/>Patterns: 'module', 'fga.mod',<br/>'best practice', 'performance'"]

    Rule6 -->|No match| Rule7["7. fga-modeling-guide<br/>━━━━━━━━━━━━━━━━<br/>Patterns: 'how to model', 'step by step',<br/>'document management', 'create a model'"]

    Rule7 -->|No match| NoMatch["No Match<br/>Return null"]

    Rule1 -->|Match| Return["Return matched context"]
    Rule2 -->|Match| Return
    Rule3 -->|Match| Return
    Rule4 -->|Match| Return
    Rule5 -->|Match| Return
    Rule6 -->|Match| Return
    Rule7 -->|Match| Return

    style Rule4 fill:#ffe1e1
    Note1["⚠️ Auth0 rule MUST come before<br/>testing rule to catch<br/>specific assertion patterns"]

    Rule4 -.-> Note1
```

## MCP Tools Exposed

The MCP server exposes **2 tools** that Claude Code can call:

### Tool 1: `get_context_for_query`

**Purpose**: Get relevant FGA expert context for a query

**Input**:
```json
{
  "query": "How do I model hierarchical permissions?"
}
```

**Process**:
1. Pattern matcher searches for matching patterns in query
2. Routes to appropriate prompt file (e.g., fga-relationships.md)
3. Loads file content

**Output**:
```
Context found for query: "How do I model hierarchical permissions?"

Using prompt: Defining relationships in OpenFGA

---

[Full content of fga-relationships.md (~1.3k tokens)]
```

### Tool 2: `list_available_contexts`

**Purpose**: List all available context topics

**Input**: None

**Output**:
```
Available Context Prompts:

**OpenFGA introduction and core concepts**
File: fga-intro-concepts.md
Patterns: what is openfga, core concept, dsl, ...

**Defining relationships in OpenFGA**
File: fga-relationships.md
Patterns: hierarchical permission, x from y, ...

[... 5 more topics]
```

**When Claude calls these tools:**
- When user asks FGA-related questions
- During `/fga` skill execution to get specific knowledge
- When Claude needs to refresh context about a particular topic

## Key Architectural Principles

### 1. Tool Server vs Skill

- **MCP Server (Tool Server)**: Exposes tools that Claude Code calls
  - Provides 2 tools: `get_context_for_query`, `list_available_contexts`
  - Claude Code decides when to call these tools based on query content
  - Returns 0.6k-6.3k tokens per tool call
  - User never directly invokes the tools

- **Skill (Active Workflow)**: User explicitly invokes with `/openfga`
  - Maintained by the OpenFGA team at [openfga/agent-skills](https://github.com/openfga/agent-skills)
  - Provides structured workflows loaded into Claude's context
  - Guides multi-step processes
  - During execution, Claude may call MCP tools to get expert knowledge

### 2. Pattern Matching Order

More specific patterns must come first:
- "create module" before "how do i create"
- "store assertion" before "assertion"
- auth0 rule (specific) before testing rule (generic)

### 3. Token Optimization

- **Before**: 11.1k tokens → Large MCP response warnings
- **After**: 0.6k-6.3k tokens (70-95% reduction)
- Smart routing ensures minimal, relevant context

### 4. Testing Strategy

- **Local tests** (.fga.yaml): Ephemeral, development/CI
- **Store assertions** (fga.yaml): Persistent, dashboard-visible
- Clear separation in prompts (testing.md vs auth0.md)

### 5. Credential Security

- Never hardcode credentials in commands
- Always use environment variable references ($FGA_STORE_ID)
- Automatically offer to create .env files
- Remind about token rotation

## Success Metrics

- ✅ 70-95% token reduction per query
- ✅ No "Large MCP response" warnings
- ✅ 26/26 automated tests passing
- ✅ 90+ patterns across 7 topic areas
- ✅ Clear separation: local tests vs store assertions
- ✅ Secure credential handling built-in

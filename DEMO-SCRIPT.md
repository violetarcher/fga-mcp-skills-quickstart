# FGA MCP + Skill Demo Script

**Demo Goal**: Show complete workflow from use-case to production deployment using FGA MCP server and `/fga` skill

**Duration**: ~15 minutes

**Use Case**: Task Management System (workspace → project → task hierarchy)

---

## Setup (Before Recording)

**Terminal Setup:**
- Terminal 1: Claude Code session
- Terminal 2: Ready for CLI commands
- Browser: dashboard.fga.dev logged in

**Verify MCP Server:**
```bash
claude mcp list
# Should show 'fga' registered
```

**Verify Skill:**
```bash
# OpenFGA skill is installed via: npx skills add openfga/agent-skills
# Verify by invoking /openfga in Claude Code
```

**Credential Setup (IMPORTANT):**

For demos, use a dedicated demo store (not production):

```bash
# Option 1: Environment Variables (for this demo session)
export FGA_STORE_ID='<your-demo-store-id>'
export FGA_API_TOKEN='<demo-api-token>'
export FGA_API_URL='https://api.us1.fga.dev'

# Option 2: ~/.fga.yaml (persistent, recommended)
cat > ~/.fga.yaml <<EOF
default_store_id: <your-demo-store-id>
api_url: https://api.us1.fga.dev
api_token: <demo-api-token>
EOF
```

**🔒 Security Notes:**
- Create a dedicated demo store (not production)
- Use demo-specific API tokens
- Rotate demo tokens after recording
- Never include real production credentials in recordings
- Blur credentials in screen recordings if visible

**Verify Credentials:**
```bash
fga store get
# Should display your demo store details
```

---

## Part 1: Introduction (1 minute)

**SAY:**
> "Today I'm going to show you how to build a complete authorization system using Fine-Grained Authorization. We'll use Claude Code with two powerful tools: an MCP server that provides expert FGA knowledge automatically, and a skill that guides us through the workflow."

**SAY:**
> "Our use case is a task management system - think Asana or Trello. We need to model workspaces that contain projects, which contain tasks. Users can have different permissions at each level, and permissions should inherit down the hierarchy."

---

## Part 2: Building the Model (4 minutes)

**DO:** Open Claude Code
```bash
claude
```

**SAY:**
> "Let me start by asking Claude to help design this model. The MCP server will automatically inject relevant FGA knowledge based on my query."

**TYPE:**
```
Help me design an authorization model for a task management system. I need:

- Workspaces (top level container)
- Projects (belong to workspaces)
- Tasks (belong to projects)

Permissions should be:
- admin: full control
- editor: can modify
- viewer: can view

Permissions should inherit down the hierarchy (workspace admin → project admin → task admin).

Also, tasks should have an "assignee" concept - whoever is assigned to a task can edit it.
```

**SAY:**
> "Notice Claude is using the MCP server in the background - it's pulling in knowledge about hierarchical permissions, the 'from' keyword for inheritance, and custom roles patterns."

**EXPECTED OUTPUT:** Claude generates a model with:
- Types: user, workspace, project, task
- Relations with inheritance using `X from Y`
- Custom assignee pattern

**DO:** Review the generated model
- Point out the `admin from parent` pattern
- Point out the `assignee` custom role
- Point out the `can_view` computed permission

**SAY:**
> "This looks good, but let's save it and test it locally before deploying to production."

**TYPE:**
```
Save this model to a file called task-management.fga
```

---

## Part 3: Local Testing (3 minutes)

**SAY:**
> "Now let's write some tests to verify our model works correctly. FGA uses a .fga.yaml file format for testing."

**TYPE:**
```
Create a .fga.yaml test file that:
1. Sets up a workspace with an admin
2. Creates a project in that workspace
3. Creates a task in that project
4. Assigns the task to a user
5. Tests that permissions inherit correctly
6. Tests that the assignee can edit the task
```

**EXPECTED OUTPUT:** Claude generates `.fga.yaml` with:
- Model file reference
- Tuples section
- Tests section with check assertions

**SAY:**
> "Let me run these tests locally to verify everything works."

**DO:** Switch to Terminal 2
```bash
fga model test --tests .fga.yaml
```

**EXPECTED OUTPUT:**
```
✓ All tests passed (6/6)
```

**SAY:**
> "Perfect! All tests pass. But before we deploy, let's use the FGA skill to review and optimize our model."

---

## Part 4: Model Optimization with Skill (3 minutes)

**DO:** Back to Claude Code

**SAY:**
> "The /openfga skill provides structured workflows for FGA tasks. Let's use it to review our model."

**TYPE:**
```
/openfga review task-management.fga
```

**EXPECTED:** Skill analyzes model and suggests improvements:
- Performance considerations
- Security review
- Best practices check
- Potential optimizations

**SAY:**
> "The skill is highlighting a few things to consider. Let me ask it about one specific concern."

**TYPE:**
```
Should I be concerned about the recursive nature of the parent relationships? Will this cause performance issues at scale?
```

**EXPECTED:** Claude explains:
- Relationship depth considerations
- When to use modules for large models
- Performance characteristics

**SAY:**
> "Good to know. For our demo, this model is fine. Now let's deploy to Auth0 FGA."

---

## Part 5: Setting Up Auth0 FGA Store (2 minutes)

**DO:** Switch to browser (dashboard.fga.dev)

**SAY:**
> "I'm going to create a new FGA store in the Auth0 FGA dashboard."

**DO:**
1. Click "Create Store"
2. Name: "task-management-demo"
3. Copy the Store ID

**DO:** Switch to Terminal 2

**SAY:**
> "I already have my FGA credentials configured. Let me verify the connection to this store."

**NOTE FOR DEMO:**
If you need to update credentials for the new store:
```bash
# Option 1: Update environment variable (if using env vars)
export FGA_STORE_ID="<new-store-id>"

# Option 2: Update ~/.fga.yaml (if using config file)
# Edit the default_store_id field
```

**⚠️ SCREEN RECORDING TIP:** Blur or skip credential setup in recordings

**TYPE:**
```bash
# Verify connection (credentials already set in setup)
fga store get
```

**EXPECTED OUTPUT:** Store details displayed (blur Store ID in recording if needed)

**SAY:**
> "Perfect, we're connected. Let me write our model to the store."

---

## Part 6: Deploy Model to Store (2 minutes)

**DO:** Terminal 2

```bash
# Write the authorization model to the store
fga model write --file task-management.fga
```

**EXPECTED OUTPUT:**
```
Model written successfully
Authorization Model ID: 01HQXXX...
```

**SAY:**
> "Perfect! Our model is now live in the store. Let's verify it in the dashboard."

**DO:** Switch to browser
1. Refresh the store page
2. Navigate to "Authorization Models" tab
3. Show the model we just deployed
4. Click through to show the DSL visualization

**SAY:**
> "You can see our types, relations, and the hierarchy we defined. Now let's add some real data."

---

## Part 7: Importing Store with Assertions (3 minutes)

**SAY:**
> "Now instead of just writing tuples, let's import our complete store including tuples AND assertions. This way our tests persist in the dashboard."

**TYPE:**
```
Create a store.fga.yaml file that includes:
1. Reference to our task-management.fga model
2. Sample tuples (Alice as workspace admin, Bob assigned to a task)
3. Test assertions to verify permission inheritance
```

**EXPECTED OUTPUT:** Claude generates `store.fga.yaml` with model_file, tuples, and tests sections

**DO:** Terminal 2

```bash
# Import complete store (model + tuples + assertions)
fga store import --file store.fga.yaml --store-id $FGA_STORE_ID
```

**EXPECTED OUTPUT:**
```
✓ Authorization model written
✓ Tuples imported
✓ Assertions imported
```

**SAY:**
> "Now let's look at what we just imported."

**DO:** Switch to browser
1. Navigate to "Relationship Tuples" tab → Show the tuples
2. Navigate to "Assertions" tab → Show the persistent test assertions
3. Click "Run Assertions" → Show results

**SAY:**
> "These assertions now live in our store permanently. Every time we update the model, we can re-run these assertions from the dashboard to verify nothing broke."

---

## Part 8: Ad-Hoc Queries (1 minute)

**SAY:**
> "We just ran our assertions from the dashboard, but we can also run ad-hoc queries via CLI."

**DO:** Terminal 2

```bash
# Test: What tasks can Bob edit?
fga query list-objects user:bob can_edit task --store-id $FGA_STORE_ID
```

**EXPECTED OUTPUT:** `["task:design-homepage"]`

**SAY:**
> "Bob can edit the one task he's assigned to - exactly as expected."

**TYPE:**
```bash
# Test: List all workspace admins
fga query list-users object:workspace:acme relation:admin user-filter:type:user --store-id $FGA_STORE_ID
```

**EXPECTED OUTPUT:** `["user:alice"]`

**SAY:**
> "And we can query in reverse - who are the admins of this workspace? Just Alice."

---

## Part 9: Wrap-Up (1 minute)

**SAY:**
> "Let me summarize what we just did:"

**SAY:**
> "1. We used Claude Code with the FGA MCP server to design our authorization model. The MCP server automatically provided expert knowledge about hierarchies, inheritance, and custom roles."

**SAY:**
> "2. We tested locally using .fga.yaml before deploying to production."

**SAY:**
> "3. We used the /openfga skill to review and optimize our model."

**SAY:**
> "4. We deployed to Auth0 FGA using store import - this gave us model, tuples, AND persistent assertions in one command."

**SAY:**
> "5. We verified everything works using both dashboard assertions and ad-hoc CLI queries."

**SAY:**
> "The key insight here is that the MCP server and skill work together - the MCP provides knowledge injection automatically, while the skill provides structured workflows when you need them. And by using store imports with assertions, we get executable documentation that lives with our authorization model in production."

**SAY:**
> "You can find this MCP server and skill at github.com/your-org/fga-mcp-skills-quickstart. Thanks for watching!"

---

## Troubleshooting

**If model test fails:**
- Review the error message
- Show how to debug using `fga model test --verbose`
- Fix the issue and re-run

**If Auth0 FGA connection fails:**
- Verify FGA_STORE_ID is set correctly
- Check API token is valid
- Show `fga store list` to verify

**If tuple write fails:**
- Check syntax (user:id relation type:id)
- Verify the relation exists in the model
- Show error message and fix

---

## Key Talking Points

**MCP Server Value:**
- Passive knowledge injection
- No manual context switching
- Always up-to-date with best practices
- Optimized with chunking (70-95% token reduction)

**Skill Value:**
- Structured workflows
- Guided decision-making
- Review and optimization
- Consistent best practices

**Together:**
- MCP provides the knowledge
- Skill provides the process
- Claude Code orchestrates everything
- Complete FGA development workflow

---

## Optional Extensions

**If time permits, show:**

**1. Using Conditions:**
```
Show how to add a condition like "can edit only during business hours"
```

**2. Modules for Scale:**
```
/fga explain how modules help with large multi-product systems
```

**3. Performance Optimization:**
```
Ask Claude about tuple fanout and query performance
```

**4. SDK Integration:**
```
Show quick Node.js code example using the @auth0/fga SDK
```

---

## Assets Needed

- [ ] GitHub repo URL ready
- [ ] Auth0 FGA account with valid API token
- [ ] Clean terminal windows
- [ ] Browser with dashboard.fga.dev open
- [ ] Claude Code running with MCP server
- [ ] FGA CLI installed and working
- [ ] Demo project directory set up

---

## Post-Demo Cleanup

```bash
# Delete demo store (optional)
fga store delete --store-id $FGA_STORE_ID

# Clean up local files
rm task-management.fga .fga.yaml
```

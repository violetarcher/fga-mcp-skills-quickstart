# User Acceptance Testing Guide

## Quick UAT Checklist

Use this guide to verify the chunked MCP server optimization is working correctly.

---

## Test 1: Verify MCP Server Registration

**Goal:** Confirm the server is properly registered and running.

```bash
# Check MCP server is registered
claude mcp list
```

**Expected:** You should see `fga` in the list.

**Status:** ☐ Pass / ☐ Fail

---

## Test 2: Basic Functionality Test

**Goal:** Verify the MCP server responds to queries.

Start Claude Code and ask:
```
What MCP tools do you have available?
```

**Expected:** You should see:
- `mcp__fga__get_context_for_query`
- `mcp__fga__list_available_contexts`

**Status:** ☐ Pass / ☐ Fail

---

## Test 3: Pattern Matching Tests

**Goal:** Verify queries route to the correct topic files.

### Test 3a: Core Concepts Query
```
What is OpenFGA?
```

**Expected:** Response should mention:
- Core concepts like types, objects, relations, tuples
- Should be concise and focused (not overly long)
- No warning about large MCP response

**Status:** ☐ Pass / ☐ Fail

---

### Test 3b: Relationships Query
```
How do I model hierarchical permissions in FGA?
```

**Expected:** Response should cover:
- `X from Y` syntax
- Indirect relationships
- Parent-child patterns
- Should be focused on relationships (not testing or other topics)

**Status:** ☐ Pass / ☐ Fail

---

### Test 3c: Testing Query
```
How do I test my FGA model?
```

**Expected:** Response should include:
- `.fga.yaml` test file format
- `fga model test` command
- Check, list_objects, list_users tests
- Should NOT include unrelated modeling or relationship details

**Status:** ☐ Pass / ☐ Fail

---

### Test 3d: Custom Roles Query
```
How do I create custom roles in FGA?
```

**Expected:** Response should cover:
- Simple user-defined roles pattern
- Role assignments pattern
- Should be focused on custom roles specifically

**Status:** ☐ Pass / ☐ Fail

---

### Test 3e: Auth0 FGA Query
```
How do I connect to Auth0 FGA?
```

**Expected:** Response should include:
- Store ID and API token setup
- `fga store list` command
- dashboard.fga.dev references
- SDK examples

**Status:** ☐ Pass / ☐ Fail

---

## Test 4: No Warning Test

**Goal:** Confirm large response warnings are gone.

Ask several different FGA questions in sequence:
1. "What is a relationship tuple?"
2. "How do I define direct relationships?"
3. "How do I write FGA tests?"

**Expected:**
- ✅ NO warnings like `⚠ Large MCP response (~11.1k tokens)`
- Responses should be concise and focused
- Each response should feel relevant to the specific question

**Status:** ☐ Pass / ☐ Fail

---

## Test 5: Modeling Workflow Test

**Goal:** Verify the server works for a complete modeling task.

```
Create an authorization model for a document management system with folders
```

**Expected:** Claude should:
1. Use MCP context automatically (you won't see this directly)
2. Create a proper FGA model with:
   - Types: user, document, folder
   - Relations: owner, editor, viewer
   - Hierarchical permissions using `X from Y`
   - Proper DSL syntax

**Status:** ☐ Pass / ☐ Fail

---

## Test 6: Skill Integration Test

**Goal:** Verify the `/fga` skill still works with the new MCP server.

```
/fga design a model for a blog platform
```

**Expected:**
- Skill should execute normally
- Should ask clarifying questions
- Should generate a proper model
- Should offer to create tests

**Status:** ☐ Pass / ☐ Fail

---

## Test 7: Context Relevance Test

**Goal:** Verify responses don't include irrelevant information.

Ask a simple question:
```
What is a userset in OpenFGA?
```

**Expected:** Response should:
- Define usersets clearly
- Include examples like `team#member`
- NOT include unrelated topics like:
  - Auth0 FGA CLI commands
  - Testing methodology
  - Module creation
  - Performance optimization details

**Status:** ☐ Pass / ☐ Fail

---

## Test 8: Multiple Queries Efficiency Test

**Goal:** Verify the server remains efficient across multiple queries.

Ask 5 different questions in quick succession:
1. "What is FGA?"
2. "How do conditions work?"
3. "How do I test assertions?"
4. "What are custom roles?"
5. "How do I connect to my Auth0 FGA store?"

**Expected:**
- All responses should be fast
- No memory issues
- No performance degradation
- Each response should be topic-focused

**Status:** ☐ Pass / ☐ Fail

---

## Test 9: Edge Case Test

**Goal:** Test queries that might match multiple patterns.

```
How do I create and test a custom role?
```

**Expected:** Should return either:
- Custom roles context (preferred), OR
- Modeling guide context

Should NOT return:
- All contexts combined
- Unrelated topics

**Status:** ☐ Pass / ☐ Fail

---

## Test 10: List Available Contexts

**Goal:** Verify the list tool returns all 7 topic areas.

Ask:
```
What FGA contexts are available?
```

Or directly call the tool if you can.

**Expected:** Should list:
1. OpenFGA introduction and core concepts
2. Defining relationships in OpenFGA
3. Custom roles patterns
4. Testing and validating FGA models
5. Step-by-step modeling guide
6. Advanced topics and modules
7. Auth0 FGA hosted service

**Status:** ☐ Pass / ☐ Fail

---

## UAT Summary

**Total Tests:** 10
**Passed:** ___
**Failed:** ___

### Critical Issues Found:
(List any blocking issues)

### Non-Critical Issues:
(List minor issues or improvements)

### Notes:
(Any additional observations)

---

## Automated Test Script

For quick validation, run the automated test:

```bash
cd /path/to/fga-mcp-skills-quickstart
node test-uat.js
```

This will test:
- Pattern matching accuracy
- File size verification
- Response time benchmarks

---

## Rollback Instructions

If you encounter critical issues and need to rollback:

```bash
cd /path/to/fga-mcp-skills-quickstart

# Restore original file
git checkout 01599ee -- prompts/authorization-model.md

# Remove chunked files
rm prompts/fga-*.md

# Restore old pattern matcher
git checkout 01599ee -- src/prompt-matcher.ts

# Rebuild
npm run build

# Restart Claude Code
claude
```

---

## Success Criteria

The UAT is successful if:
- ✅ All 10 tests pass
- ✅ No "Large MCP response" warnings
- ✅ Responses are focused and relevant
- ✅ `/fga` skill continues to work
- ✅ Performance is maintained or improved

---

## Reporting Issues

If you find issues, please note:
1. Which test failed
2. What query you used
3. What you expected vs what you got
4. Any error messages or warnings
5. Your environment (OS, Node version, Claude Code version)

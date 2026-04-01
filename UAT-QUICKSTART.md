# UAT Quick Start

## Run Automated Tests

```bash
node test-uat.js
```

Expected output:
```
✅ All tests passed! MCP server chunking is working correctly.
```

## Manual Testing in Claude Code

Start Claude Code:
```bash
claude
```

### Test 1: Verify MCP Tools Available
```
What MCP tools do you have available?
```

Should see: `mcp__fga__get_context_for_query` and `mcp__fga__list_available_contexts`

### Test 2: Ask FGA Questions

Try these queries and verify **no "Large MCP response" warnings**:

```
What is OpenFGA?
```
```
How do I model hierarchical permissions?
```
```
How do I test my FGA model?
```
```
How do I create custom roles?
```
```
How do I connect to Auth0 FGA?
```

### Test 3: Build a Model

```
Create an authorization model for a document management system with folders
```

Should produce a working FGA model with proper DSL syntax.

### Test 4: Use the Skill

```
/fga design a model for a blog platform
```

Should work normally with no issues.

## Success Criteria

- ✅ No "Large MCP response" warnings
- ✅ Responses are focused and relevant
- ✅ All automated tests pass
- ✅ Models generate correctly
- ✅ Skill continues to work

## Full UAT Guide

For comprehensive testing, see [UAT-GUIDE.md](./UAT-GUIDE.md)

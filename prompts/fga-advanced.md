# Advanced OpenFGA Topics

## Creating Modules

Modular models allows splitting your authorization model across multiple files. You should use Modular Models when you define models that have features for multiple products or product modules that have several related types each.

When creating a model with modules, you need to define an `fga.mod` that lists all the modules, with the following format:

```yaml
schema: '1.2'
contents:
  - core.fga
  - module-1.fga
  - module-2.fga
```

`core.fga` would have types that are shared across modules. In general you'd have types as "organization", "group", "roles".

Each module will have the types specific to that module's functionality. They look like this:

```
module issue-tracker

extend type organization
  relations
    define can_create_project: admin

type project
  relations
    define organization: [organization]
    define viewer: member from organization
```

The test files need to point to the `fga.mod` file:

```yaml
name: Document Management System Authorization Model Tests
model_file: ./fga.mod
tuples: ...
```

**Note that:**
- You can 'extend' types that are defined in other modules and add relations to them.
- All .fga files now start with `module <module name>` even the 'core' module. They do not start with schema declaration, that's in the `fga.mod` file.

**IMPORTANT: Only use modules if you are EXPLICITLY ASKED to create modules.**

## Best Practices

### Model Design
- Use singular nouns for types: `document`, `folder` (not `documents`, `folders`)
- Use present tense for relations: `owner`, `viewer` (not `owns`, `owned_by`)
- Prefix permissions with `can_`: `can_read`, `can_write` (not `read`, `write`)
- Keep relation depth ≤3 levels for performance

### Performance
- Minimize nested `from` chains (avoid >3 levels)
- Use usersets (`team#member`) instead of individual user tuples
- Batch tuple writes when possible
- Use `list_objects` instead of checking each object individually

### Security
- Always specify type restrictions: `[user]` not unrestricted
- Avoid wildcards (`user:*`) unless explicitly needed
- Test negative cases (denied access) in test suites
- Review computed permissions for unintended escalation

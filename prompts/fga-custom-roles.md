# Modeling Custom Roles in OpenFGA

Many applications require the flexibility for end-users to define their own custom roles, in addition to any pre-defined roles. This approach enables organizations to tailor permissions to their specific needs.

**Only consider this if you are asked to implement custom roles.**

## Simple User-Defined Roles

With the following model, your application can support both static roles and user-defined roles, with user-defined roles at the top_level object (in this case 'organization').

```dsl.openfga
model
  schema 1.1

type user

type role
  relations
    define assignee: [user]

type organization
  relations
    define admin: [user]  # static role

    # permissions can be assigned to custom roles or static roles
    define can_create_project: [role#assignee] or admin
    define can_edit_project: [role#assignee] or admin
```

### Setting Up Custom Roles

**1. Define role permissions** by creating tuples that grant the role-specific permissions:

```yaml
- user: role:acme-project-admin#assignee
  relation: can_create_project
  object: organization:acme

- user: role:acme-project-admin#assignee
  relation: can_edit_project
  object: organization:acme
```

**2. Assign users to the role**:

```yaml
- user: user:anne
  relation: assignee
  object: role:acme-project-admin
```

### Adding New Permissions

When you add new permissions to your model, existing roles don't automatically receive them:

```dsl.openfga
model
  schema 1.1

type user

type role
  relations
    define assignee: [user]

type organization
  relations
    define admin: [user]
    define can_create_project: [role#assignee] or admin
    define can_edit_project: [role#assignee] or admin
    define can_delete_project: [role#assignee] or admin  # new permission
```

To grant the new permission to existing roles, create additional tuples:

```yaml
- user: role:acme-project-admin#assignee
  relation: can_delete_project
  object: organization:acme
```

You do not need to add these tuples when adding the new permission. End-users will add the new permission to their custom roles when they find it appropriate.

## Custom Roles with Role Assignments

The previous approach works well when custom roles are global for the organization. However, if you need roles that can be attached to different object instances with different members for each instance, you need role assignments.

**DO NOT USE this approach for defining custom roles for the top-level type (e.g. 'organization').**

### Example: Project-Specific Admin Roles

Let's say you want a "Project Admin" role where each project can have different admins, but the role permissions remain consistent.

#### Step 1: Define the Role and its Permissions

Define a `role` type where you list all the permissions that any role can have:

```dsl.openfga
model
  schema 1.1

type role
  relations
    define can_view_project: [user:*]
    define can_edit_project: [user:*]
```

A "Project Admin" role can have `can_view_project` and `can_edit_project`:

```yaml
# Project Admin role has both the can_view_project and can_edit_project assigned
- user: user:*
  relation: can_view_project
  object: role:project-admin

- user: user:*
  relation: can_edit_project
  object: role:project-admin
```

#### Step 2: Assign Users to a Role on an Entity

Add a `role_assignment` type to assign users to the role:

```dsl.openfga
type role_assignment
  relations
    define assignee: [user]
    define role: [role]

    define can_view_project: assignee and can_view_project from role
    define can_edit_project: assignee and can_edit_project from role
```

#### Step 3: Connect to Your Objects

Define an `organization` type with an `admin` role. Then, define a `project` type that links to an `organization` and a `role_assignment`. Note that we are combining a static `admin` role with custom role assignments. We recommend to always use static roles when they are known in advance.

```dsl.openfga
type organization
  relations
    define admin: [user]

type project
  relations
    define organization: [organization]
    define role_assignment: [role_assignment]

    # combine role assignments and static roles
    define can_edit_project: can_edit_project from role_assignment or admin from organization
    define can_view_project: can_view_project from role_assignment or admin from organization
```

### Setting Up Role Assignments

**1. Create the role assignment instance**:

```yaml
- user: user:anne
  relation: assignee
  object: role_assignment:project-admin-openfga

- user: role:project-admin
  relation: role
  object: role_assignment:project-admin-openfga
```

**2. Link the role assignment to the project**:

```yaml
- user: role_assignment:project-admin-openfga
  relation: role_assignment
  object: project:openfga
```

**3. Link the project to an organization**:

```yaml
- user: organization:acme
  relation: organization
  object: project:openfga
```

---

## When to Use Each Custom Role Pattern

| Pattern | Use Case | Pros | Cons |
|---------|----------|------|------|
| **Global Custom Roles** | Organization-wide roles with consistent permissions | Simple, efficient | Less flexible for per-resource customization |
| **Role Assignments** | Resource-specific roles with different members per resource | Highly flexible | More complex, potential performance impact |

## Migration Strategies

When evolving from static roles to custom roles:

1. **Additive approach**: Introduce custom roles alongside existing static roles
2. **Gradual migration**: Move permissions one at a time to custom roles
3. **Backwards compatibility**: Maintain existing static role behavior during transition

# Step-by-Step: Authoring Your OpenFGA Model

The process of authoring an OpenFGA model is iterative, starting with critical features and systematically translating authorization requirements into a structured model.

The central question guiding this process is: "Why could user U perform an action A on object O?" This encourages a relational perspective.

The iterative nature of model design, including "Test the model" and "Iterate" steps, is fundamental. Dedicated testing tools like the CLI, Playground, and .fga.yaml configuration support this workflow, enabling rapid feedback and refinement.

## Recommended Steps for Defining an Authorization Model

1. **Pick the most important feature:** Focus on a high-priority use case to establish a foundational model.
2. **List the object types:** Identify all relevant entities (e.g., user, document, folder, organization).
3. **List relations for those types:** For each type, determine relationships users or other objects can have (e.g., owner, editor, viewer, member).
4. **Define relations:** Translate these relationships into OpenFGA DSL, specifying direct, concentric, and indirect relationships as needed.
5. **Test the model:** Validate your model against expected behaviors using assertions and comprehensive test cases.
6. **Iterate:** Refine the model based on testing and evolving requirements.

## Illustrative Example: Building a Document Management Authorization Model

Consider a document management system with these requirements:

* Documents can be created by users.
* Documents can be shared, granting editor or viewer roles.
* A document's creator inherently has delete, share, edit, and view permissions.
* Editors can edit and view.
* Viewers can only view.
* Documents can belong to folders, with permissions inherited from the parent.

Let's walk through the modeling process:

### Step 1: Identify Types

Core types: user, document, folder. An organization type can represent groups.

### Step 2: Define Relations for organization

An organization can define membership:

```dsl.openfga
type organization
  relations
     define member: [user] # Users can be members.
```

### Step 3: Define Relations for document

The document type defines ownership, editing, viewing, sharing, and deleting:

```dsl.openfga
type document
  relations
    define organization : [organization] # A document belongs to an organization.
    define parent_folder: [folder] # A document can have a parent folder.

    define owner: [user]  # A direct user
    define editor: [user] or owner or editor from parent_folder # A direct user or editor or anyone who is an owner.
    define viewer: [user] or editor or viewer from parent_folder or member from organization # A direct user, or anyone who is an editor.
    define can_share: owner # Example of a permission: owner
    define can_delete: owner or editor # Example of a permission: owner or editor
```

### Step 4: Consider Folder Inheritance (Parent-Child Objects)

Permissions can be inherited from parent folders. This requires defining relations on the folder type and using `X from Y` to propagate permissions:

```dsl.openfga
type folder
  relations
    define parent_folder: [folder]
    define owner: [user]
    define editor: [user] or owner or editor from parent_folder
    define viewer: [user] or editor or viewer from parent_folder
```

In this extension, an editor of a document could be someone directly assigned, an owner, or an editor of its parent_folder, leveraging `X from Y` for hierarchical permissions.

## Adding Permissions

It's a common practice to define specific permissions that can't be directly assigned, using `can_<permission>` relations, for example:

```dsl.openfga
type folder
  relations
    define parent_folder: [folder]
    define owner: [user]
    define editor: [user] or owner or editor from parent_folder
    define viewer: [user] or editor or viewer from parent_folder

    define can_view: viewer
    define can_edit: editor
    define can_delete: editor
    define can_share: owner
```

**Always define permissions in the authorization models.**

## Simplify Models

After generating model and tests, remove from the model all types and relations that are not referenced in the model or the tests.

## Naming Users

When naming users, use proper naming conventions that reflect their roles and responsibilities within the organization. This includes using prefixes or suffixes to indicate their role, such as "admin_", "member_", or "guest_".

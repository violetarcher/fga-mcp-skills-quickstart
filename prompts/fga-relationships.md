# Defining Relationships in OpenFGA

OpenFGA provides a rich set of constructs for defining relationships, enabling the modeling of complex authorization policies.

## Direct Relationships: Explicit Access Grants

A direct relationship is established when a specific relationship tuple (e.g., user=X, relation=R, object=Y) is explicitly stored. The authorization model must explicitly permit this through direct relationship type restrictions. These restrictions define which types of users can be directly associated with an object for a given relation, using formats like `[<type>]`, `[<type:*>]`, or `[<type>#<relation>]`.

For example,

```
define owner: [user]
```

means only individual users can be directly assigned as owners.

A tuple like:

```
{"user": "user:anne", "relation": "owner", "object": "document:1"}
```

is a direct relationship.

## Concentric Relationships: Inheriting Permissions

Concentric relationships represent nested or implied relations, where one relation automatically confers another (e.g., "all editors are viewers"). This is implemented using the `or` keyword within a relation definition.

For example,

```
define viewer: [user] or editor
```

means a user is a viewer if directly assigned OR if they are an editor. If `user:anne` is an editor of `document:new-roadmap`, she implicitly has viewer access, reducing the number of required tuples.

## Indirect Relationships with 'X from Y': Scalable Hierarchical and Group-Based Access

The `X from Y` syntax is crucial for scalability, allowing a user to acquire a relation (X) to an object through an intermediary object (Y) and a defined relation on Y. This avoids individual tuple creation for every permission, enabling higher-level abstraction. It is highly effective for hierarchical and group-based access control.

For example,

```
define admin: [user] or repo_admin from organization
```

on a repo type means a user is an admin if directly assigned, or if they have the `repo_admin` relation to an org that owns the repo.

This simplifies management; revoking access can be done by deleting a single tuple linking the intermediary.

## Contextual Authorization with Conditions: Dynamic Permissions

Conditions introduce dynamic, contextual authorization. A condition is a function using Google's Common Expression Language (CEL), with parameters and a boolean expression.

Example:
```
condition less_than_hundred(x: int) {
  x < 100
}
```

Conditions are required to be defined at the end of the model (after the type definitions), and are instantiated using conditional relationship tuples.

## Leveraging Usersets for Group-Based Access Control

A userset represents a set or collection of users, denoted by `object#relation` (e.g., `company:xy#employee`). Usersets are fundamental for assigning permissions to groups, reducing tuple count and providing flexibility for bulk access management. They can be used in direct relationship type restrictions, such as:

```
define editor: [user, team#member]
```

OpenFGA computes implied relationships based on userset membership, and usersets are integral to defining complex access rules involving union, intersection, or exclusion of groups.

**Note:** Specifying `team#member` means "all members from a specific team". It does not mean that "you need to be a team member to be an editor". Only use it when you need to assign a relation to a set of users from specific object.

OpenFGA's strength lies in its capacity to construct complex authorization logic from foundational elements: direct relationships, concentric relationships (`or`), and indirect relationships (`X from Y`). This compositional approach enables modeling intricate real-world permission structures efficiently.

## Relationship Definition Patterns Summary

| Pattern Name | Description | DSL Syntax Example | Explanation of Effect |
| :---- | :---- | :---- | :---- |
| **Direct Relationship** | Explicitly grants a user a relation to an object via a stored tuple, subject to type restrictions. | `define owner: [user]` | Only individual users can be directly assigned as owner. |
| **Concentric Relationship** | Defines that having one relation implies having another relation to the same object (e.g., editors are viewers). | `define viewer: [user] or editor` | A user is a viewer if directly assigned as viewer OR if they are an editor. |
| **Indirect Relationship ('X from Y')** | A user gains a relation (X) to an object through another object (Y) and a specific relation on Y. | `define admin: [user] or repo_admin from owner`| A user is admin of a repo if directly assigned OR if they are repo_admin of an org that owns the repo. |
| **Conditional Relationship** | A relationship is permissible only if a specified condition, evaluated at runtime, is true. | `define admin: [user with non_expired_grant]` | A user is admin only if the non_expired_grant condition evaluates to true for their context. |
| **Usersets** | Represents a collection of users (e.g., a group or a set of users related by a specific relation). | `define editor: [user, team#member]` | An editor can be a direct user OR any member of a specified team. |

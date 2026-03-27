# OpenFGA Introduction & Core Concepts

## Introduction to OpenFGA and Authorization Modeling

OpenFGA is an open-source authorization solution that empowers developers to implement fine-grained access control within their applications through an intuitive modeling language.

It functions as a flexible authorization engine, simplifying the process of defining application permissions.

Inspired by Google's Zanzibar paper, OpenFGA primarily champions Relationship-Based Access Control (ReBAC), while also effectively addressing use cases for Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC). Its "developer-first" philosophy is evident in its Domain Specific Language (DSL) and supporting tools, which lower the barrier to entry for developers.

The core purpose of an authorization model is to define a system's permission structure, answering questions like, "Can user U perform action A on object O?". By externalizing authorization logic from application code, OpenFGA provides a robust mechanism for managing complex access policies, especially in large-scale systems. The modeling language is designed to be powerful for engineers yet accessible to other team stakeholders, fostering collaborative policy development.

## OpenFGA Core Concepts: The Building Blocks of Your Model

To effectively model authorization in OpenFGA, it is essential to understand its core building blocks:

* **Authorization Model:** A static blueprint that combines one or more type definitions to precisely define the permission structure of a system. It represents the *possible* relations between users and objects. Models are immutable; each modification creates a new version with a unique ID. Models aren't expected change often - only when new product features or change in functionality is introduced. They're also generally expected to be backward compatible, but can break backward compatibility once the system has completely moved off the older relations in it.

* **Type:** A string that defines a class of objects sharing similar characteristics (e.g., user, document, folder, organization, team, repo).

* **Object:** A specific instance of a defined Type (e.g., `document:roadmap`, `user:anne`, `organization:acme`). An object's relationships are defined through relationship tuples and the authorization model.

* **User:** An entity that can be related to an object. A user can be a specific individual (e.g., user:anne), a wildcard representing everyone of a certain type (e.g. `user:*` which means all users), or a userset (e.g., `team:product#member`), which denotes a group of users.

* **Relation:** A string defined within a type definition in the authorization model. It specifies the *possibility* of a relationship existing between an object of that type and a user. Relation names are arbitrary (e.g., owner, editor, viewer, member, admin), but must be defined on the object type in the model.

* **Relationship Tuple:** Dynamic data elements representing the *facts* about relationships between users and objects (e.g., {"user": "user:anne", "relation": "editor", "object": "document:new-roadmap"}). Without these, authorization checks will fail, as the model only defines what is *possible*, not what *currently exists*.

The clear separation between the static authorization model (schema) and dynamic relationship tuples (data) is a fundamental design principle. This enables efficient permission evaluation and decouples core logic changes from specific user permission modifications. The immutability of models supports robust versioning, allowing for controlled rollouts and managing complex migrations.

The following table summarizes these core concepts:

| Concept | Description | Example |
| :---- | :---- | :---- |
| **Type** | A class of objects that share similar characteristics. | user, document, folder, organization |
| **Object** | A specific instance of a defined type, an entity in the system. | `user:anne`, `document:report_2023`, `folder:marketing_docs` |
| **User** | An entity that can be related to an object. Can be a specific object, a wildcard, or a userset. | `user:bob`, `user:*` (everyone), `team:product#member` |
| **Relation** | A string defined within a type definition that specifies the possibility of a relationship between an object of that type and a user. | owner, editor, viewer, member, admin |
| **Relationship Tuple** | A grouping of a user, a relation, and an object, representing a factual relationship in the system. | `{"user": "user:anne", "relation": "viewer", "object": "document:roadmap"}` |
| **Authorization Model** | A static definition combining type definitions to define the entire permission structure of a system. | ```type document relations define viewer: [user]``` |

## The OpenFGA Modeling Language: DSL

OpenFGA's Configuration Language is fundamental to constructing a system's authorization model, informing OpenFGA about object types and their relationships. It describes all possible relations for an object of a given type and the conditions under which one entity is related to that object. The language is primarily expressed in DSL (Domain Specific Language).

### DSL: Developer-Friendly Syntax for Readability

The DSL provides syntactic sugar over the underlying JSON, designed for ease of use and improved readability. It is the preferred syntax for developers using the Playground, CLI, and IDE extensions (like Visual Studio Code), offering features like syntax highlighting and validation. DSL models are compiled to JSON before being sent to OpenFGA's API.

An example of an OpenFGA model in DSL:

```dsl.openfga
model
  schema 1.1
type user
type document
  relations
  define viewer: [user] or editor
  define editor: [user]
```

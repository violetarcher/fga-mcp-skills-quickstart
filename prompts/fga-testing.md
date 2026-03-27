# Testing and Validating Your OpenFGA Models

Thorough testing and validation are indispensable. OpenFGA provides tools for rapid prototyping and automated testing to ensure your authorization model is correctly designed before deployment.

**ALWAYS test the models you create. Run the `fga` CLI command directly, do not create a script to call the CLI.**

## OpenFGA CLI: Command-Line Model Management and Testing

The OpenFGA CLI serves as a cross-platform command-line tool for interacting with an OpenFGA server. It provides a robust set of commands for various tasks, including:

* Reading, writing, validating, and transforming authorization models.
* Running tests on an authorization model, which is crucial for verifying its correctness.
* Managing OpenFGA stores, encompassing operations such as creation, listing, retrieval, deletion, import, and export.

To execute tests defined within a .fga.yaml file, the `fga model test` command is utilized: `fga model test --tests <filename>.fga.yaml`.

The CLI can be installed in different ways:

- Using Homebrew for MacOS: `brew install openfga/tap/fga`
- Debian: `sudo apt install ./fga_<version>_linux_<arch>.deb`
- Fedora: `sudo dnf install ./fga_<version>_linux_<arch>.rpm`
- Alpine Linux: `sudo apk add --allow-untrusted ./fga_<version>_linux_<arch>.apk`
- Windows via Scoop: `scoop install openfga`

It can be run using Docker:
- `docker pull openfga/cli; docker run -it openfga/cli`

## Automated Testing with .fga.yaml

The .fga.yaml file is central to defining and testing OpenFGA authorization models, providing a structured approach for validation. This file can include:

* `name` (optional): A descriptive name for the test file.
* `model` or `model_file`: The authorization model can be defined inline or referenced from an external .fga, .json, or .mod file.
* `tuples` or `tuple_file` or `tuple_files` (optional): Relationship tuples can be defined inline or referenced from external JSON, JSONL, YAML, or CSV files, and are considered for all tests.

### Defining the Model and Tuples in .fga.yaml

You can define your authorization model and relationship tuples directly within the .fga.yaml file. This allows for a self-contained test definition.

Example of defining a model and tuples inline:

```yaml
name: Model Tests # optional
model: |
  model
  schema 1.1
  type user
  type organization
    relations
    define member : [user]
    define admin : [user with non_expired_grant]
  condition non_expired_grant(current_time: timestamp, grant_time: timestamp, grant_duration: duration) {
    current_time < grant_time + grant_duration
  }
tuples: # Inline tuple definitions go here
  # Anne is a member of the Acme organization
  - user: user:anne
    relation: member
    object: organization:acme
  # Peter has the admin role from February 2nd 2024 0AM to 1AM
  - user: user:peter
    relation: admin
    object: organization:acme
    condition:
      name: non_expired_grant
      context:
        grant_time : "2024-02-01T00:00:00Z"
        grant_duration : 1h
```

### Writing Tests in .fga.yaml

The tests section within the .fga.yaml file is where you define specific test cases for OpenFGA API calls, including check, list_objects, and list_users.

#### Check Tests

Verify whether a user U has a relation R with an object O. These tests include the user, object, context (for evaluating conditions), and assertions (pairs of relation: expected-result).

Example of Check tests:

```yaml
tests:
  - name: Test
    check:
      - user: user:peter
        object: organization:acme
        context:
          current_time : "2024-02-01T00:10:00Z"
        assertions:
          member: false
          admin: true
```

#### List Objects Tests

Validate the expected results when querying which objects a user has a specific relation with (e.g., user:anne is a member of organization:acme). These tests include the user, type of object, context, and assertions.

Example of List Objects tests:

```yaml
list_objects:
  - user: user:anne
    type: organization
    assertions:
      member:
        - organization:acme
      admin:

  - user: user:peter
    type: organization
    context:
      current_time : "2024-02-01T00:10:00Z"
    assertions:
      member:
      admin:
        - organization:acme
```

#### List Users Tests

Confirm which users possess access to a given object. These tests specify the object, a user_filter (by type or userset), context, and assertions for the users for any number of relations. The users field within assertions supports specific syntax for different userset types: `<type>:<id>` for a user, `<type>:<id>#<relation>` for a relation on a type, and `<type>:*` for public access.

Example of List Users tests:

```yaml
list_users:
  - object: organization:acme
    user_filter:
      - type: user
    context:
      current_time : "2024-02-02T00:10:00Z"
    assertions:
      member:
        users:
          - user:anne
      admin:
        users:
```

The .fga.yaml format actively promotes a test-driven development methodology for authorization logic.

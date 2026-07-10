# OpenFGA REST API Reference

Base URL: `https://api.{environment}.fga.dev` (Auth0 FGA) or your self-hosted OpenFGA server.

All requests require authentication. Store ID is part of the path for every endpoint.

---

## Authorization Models

**List all models**
```
GET /stores/{store_id}/authorization-models
```

**Create a new model**
```
POST /stores/{store_id}/authorization-models
Body: { schema_version: "1.1", type_definitions: [...] }
```

**Get a specific model version**
```
GET /stores/{store_id}/authorization-models/{id}
```

---

## Relationship Tuples

**Write or delete tuples**
```
POST /stores/{store_id}/write
Body: {
  writes: { tuple_keys: [{ user, relation, object }] },
  deletes: { tuple_keys: [{ user, relation, object }] },
  authorization_model_id?
}
```
Use `writes` to add tuples, `deletes` to remove them. Both are optional in the same request.

**Read tuples (no userset expansion)**
```
POST /stores/{store_id}/read
Body: { tuple_key: { user?, relation?, object? }, page_size?, continuation_token? }
```
Returns stored tuples matching the filter. Does not follow rewrite rules.

**List tuple changes**
```
GET /stores/{store_id}/changes?type={type}&page_size={n}&continuation_token={token}
```

---

## Relationship Queries

**Check access**
```
POST /stores/{store_id}/check
Body: { tuple_key: { user, relation, object }, authorization_model_id?, context?, contextual_tuples? }
Returns: { allowed: bool, resolution? }
```

**Batch check**
```
POST /stores/{store_id}/batch-check
Body: { checks: [{ tuple_key: { user, relation, object }, correlation_id }], authorization_model_id?, context?, contextual_tuples? }
Returns: { result: { [correlation_id]: { allowed: bool } } }
```

**List objects a user can access**
```
POST /stores/{store_id}/list-objects
Body: { user, relation, type, authorization_model_id?, context?, contextual_tuples? }
Returns: { objects: ["type:id", ...] }
```

**List users that have access to an object**
```
POST /stores/{store_id}/list-users
Body: { object: { type, id }, relation, user_filters: [{ type, relation? }], authorization_model_id?, context?, contextual_tuples? }
Returns: { users: [...] }
```

**Expand userset tree**
```
POST /stores/{store_id}/expand
Body: { tuple_key: { relation, object }, authorization_model_id? }
Returns: { tree: { root: ... } }
```
Useful for debugging — shows the full tree of how a relation resolves.

**Streamed list objects (experimental)**
```
POST /stores/{store_id}/streamed-list-objects
```
Same body as `list-objects`. Returns results as a stream rather than waiting for all results.

---

## Assertions

**Read assertions**
```
GET /stores/{store_id}/assertions/{authorization_model_id}
```

**Upsert assertions**
```
PUT /stores/{store_id}/assertions/{authorization_model_id}
Body: { assertions: [{ tuple_key: { user, relation, object }, expectation: bool }] }
```

---

## Permissions Index (experimental)

**List indexes**
```
GET /stores/{store_id}/indexes
```

**Get an index**
```
GET /stores/{store_id}/indexes/{index_id}
```

**Stream expansion events from an index**
```
GET /stores/{store_id}/indexes/{index_id}/expansions
```

---

## Logs

**Search logs**
```
GET /stores/{store_id}/logs
```

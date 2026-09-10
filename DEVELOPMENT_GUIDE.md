# Development Guidelines & Coding Standards

This document outlines the mandatory rules and architectural patterns to follow when contributing to the **Tia-asset-backend** codebase. Sticking to these guidelines ensures stability, security, and maintainability.

---

## 1. Architectural Layers (Controller-Service-Repository)

We use a strict 3-tier architecture to separate concerns and make the codebase maintainable and testable.

- **Repository Layer (`repositories/`)**: Handles _all_ raw database interactions (SQL queries). Export plain async functions. Write raw SQL using `db.query()`. Do not use classes.
- **Service Layer (`services/`)**: Contains all business logic (password hashing, checking for duplicates, calculating totals, formatting). Services consume Repositories. Export plain async functions.
- **Controller Layer (`controllers/`)**: Extremely thin layer. Extracts data from the request, calls the appropriate Service method, and sends the HTTP response. Export plain Express route handlers wrapped in `asyncHandler`.

**Rule:** Dependencies are imported directly into the files that need them. We use a **purely functional approach** — no classes, no `this` bindings, and no complex base inheritance.

---

## 2. Validation (`express-validator`)

Never trust client data. All endpoints accepting payloads or path parameters must be validated at the route level before hitting the controller.

- Define validation rule chains inside the `validators/` directory (e.g., `body("email").isEmail()`).
- Apply the validation rules in your router (`routes/XRoutes.js`).
- **MANDATORY**: You must include the `validate` middleware immediately after your rules to enforce them.

```javascript
// Correct Example:
const { validate } = require("../middleware/validate");

router.post(
  "/",
  createUserValidationRules(), // 1. Set the rules
  validate, // 2. Enforce the rules (Blocks bad requests)
  controller.create, // 3. Execute business logic
);
```

---

## 3. Error Handling

Express does not automatically catch errors in `async` functions. Failing to catch an error will crash the server or hang the request.

- **MANDATORY**: Do NOT use repetitive `try/catch` blocks in your controllers.
- **Rule**: Every single route handler exported from a controller must be wrapped in `asyncHandler` from `utils/asyncHandler.js`.

```javascript
// Correct controller handler example:
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");

const myCustomRoute = asyncHandler(async (req, res) => {
  const data = await myService.doSomething();
  sendSuccess(res, data, "Fetched successfully");
});
```

- **Throwing Errors**: Inside Services, if a business rule fails, you must throw an `AppError` from `utils/AppError.js` with a status code. The centralized error handler in `app.js` will catch it automatically and ensure a uniform JSON response.
  ```javascript
  const AppError = require("../utils/AppError");
  throw new AppError("User not found", 404);
  ```

---

## 4. Standardized Responses

Ensure a consistent API contract across the entire application by standardizing JSON responses.
Do not manually build `res.status(200).json(...)`. Instead, use the helper functions from `utils/response.js`.

```javascript
const { sendSuccess, sendCreated, sendNoContent } = require("../utils/response");

// For GET / PUT / General responses (200 OK)
sendSuccess(res, data, "Action completed successfully");

// For POST responses (201 Created)
sendCreated(res, data, "Resource created successfully");

// For DELETE responses (204 No Content)
sendNoContent(res);
```

This guarantees every response follows the standard `{ success, message, data }` format.

---

## 5. Security & Data Transfer Objects (DTOs)

Never send raw database rows directly to the frontend, as they may contain sensitive data (like `password_hash`, internal IDs, etc.).

- Create DTO mappers in the `dtos/` folder (e.g., `userResponseDto(user)`).
- **Rule**: The controller layer is responsible for data serialization. When sending a response, explicitly map your data through the DTO before passing it to `sendSuccess`.

```javascript
// Correctly mapping a single object
sendSuccess(res, userResponseDto(user), "Fetched successfully");

// Correctly mapping an array of objects
sendSuccess(res, users.map(userResponseDto), "Fetched successfully");
```

### SQL Injection Prevention (Pagination/Sorting)

PostgreSQL cannot parameterize `ORDER BY` clauses using standard `$1` bindings.

- **Rule**: Never inject raw `req.query.sort` strings directly into SQL queries. You must always use a whitelist or RegEx to validate sorting clauses.

---

## 6. Auditing & Context

For any endpoint that modifies data (CREATE, UPDATE, DELETE), you must record who performed the action and from where.

- **Rule**: The `authMiddleware` automatically captures this and attaches it to the request object as `req.auditCtx`.
- Pass `req.auditCtx` directly from the controller down to the service for any mutating methods.

```javascript
// In your controller:
const update = asyncHandler(async (req, res) => {
  const updated = await myService.update(req.params.id, req.body, req.auditCtx);
  sendSuccess(res, updated, "Updated successfully");
});
```

---

## 6. Swagger API Documentation

If you create a new endpoint or modify the request/response body of an existing one, you **must** update the Swagger documentation.

- **Paths & Definitions**: Update the Swagger definitions inside the `docs/` folder to keep the API documentation accurate and synced with the code.

---

## 7. Testing

Code should be covered by both Unit and Integration tests using Jest.

- **Unit Tests (`tests/unit/`)**: Test Services or Controllers in complete isolation by mocking their dependencies. No real database connection is made.
- **Integration Tests (`tests/integration/`)**: Test the full flow from the Route down to the Database.
  - _Rule:_ Integration tests must dynamically create their own test data in `beforeAll` / `beforeEach` blocks, and clean up after themselves in `afterAll` / `afterEach` blocks. Never rely on the database being pre-seeded or statically configured.

---

## 8. Editor Configuration (VS Code)

To ensure consistent formatting and catch linting errors automatically as you code, it is highly recommended to configure your VS Code environment.

You can add these settings to your workspace by creating a `.vscode/settings.json` file in the root of the project:

```json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.wordWrap": "on",
  "editor.rulers": [110],
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript"],

  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.eol": "\n",

  "typescript.updateImportsOnFileMove.enabled": "always",
  "javascript.updateImportsOnFileMove.enabled": "always",

  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  }
}
```

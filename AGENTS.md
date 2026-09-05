# Step-Wise agent instructions


## Repository overview

Step-Wise is an npm monorepo requiring Node.js 24.15 or newer.

- `frontend/` contains the React and Vite application.
- `api/` contains the TypeScript GraphQL API backed by PostgreSQL.
- `packages/` contains reusable TypeScript packages shared by the frontend and API.
- `ops/` contains production deployment and server-operation tooling.
- `scripts/` contains repository-level development and CI utilities.

Read the README of the affected workspace before making architectural or public-API changes.


## Working rules

- Run commands from the repository root unless a command explicitly requires another directory.
- Use npm workspaces. Do not install dependencies separately inside workspace directories.
- Use `npm ci` for a clean installation. Use `npm install` only when intentionally changing dependencies.
- Do not edit generated `dist/` files. Change the source and rebuild instead.
- Do not commit `.env` files, credentials, database dumps, or other secrets.
- Preserve unrelated user changes and work safely in a dirty working tree.
- Keep changes focused on the requested task. Do not perform opportunistic large-scale refactors.
- Reuse existing abstractions and patterns before introducing parallel ones.


## Code style

Follow the style of the surrounding code and these repository conventions:

- Use tabs for indentation, except in file formats such as YAML that require spaces.
- Use UTF-8 and LF line endings.
- End text files with a newline. JSON files are exempt: generated or automatically updated JSON may omit the final newline, and existing JSON files should not be changed solely to add one.
- Trim trailing whitespace.
- Put two blank lines before every level-two (`##`) Markdown heading to visually separate major sections. Use one blank line before lower-level headings.
- Do not add semicolons unless the syntax requires one.
- Prefer single quotes for strings where the language permits them.
- Prefer compact code when it remains immediately readable. Avoid vertical expansion when a short statement naturally fits on one line, but do not compress complex logic merely to reduce line count.
- Write a simple `if` statement with one short operation on one line, without braces.

```ts
if (!value) return
if (items.length === 0) throw new Error('No items were provided.')
```

- Use multiple lines when a condition or operation becomes difficult to scan, benefits from explanation, or contains meaningful branches.
- Keep comments focused on intent and non-obvious constraints rather than restating the code.


## Imports

Organize imports into blocks separated by one blank line, in this order:

1. External dependencies.
2. `@step-wise/*` workspace packages.
3. Relative imports, grouped by relative-path depth from deepest to shallowest: imports from the greatest number of parent directories first, then progressively fewer parent directories, then `../`, and finally `./` imports.

Within each block, order imports by dependency hierarchy where that hierarchy is known: foundational modules come before modules that depend on them. Otherwise, use a stable alphabetical order.

Place type imports before value imports within an import declaration:

```ts
import { type ExpressionSettings, asExpression } from '@step-wise/cas'
```

Prefer inline `type` modifiers when importing types and values from the same module. Use a separate `import type` declaration when a module provides only types or when separation is substantially clearer.

Do not merge unrelated relative-path-depth groups merely to reduce the number of import blocks.


## Packages

Package source lives in `packages/*/src` and is compiled with TypeScript project references.

- Build packages with `npm run build:packages`.
- Remove and rebuild package output with `npm run rebuild:packages`.
- Run package tests with `npm run test:packages`.
- Run package tests in watch mode with `npm run test:packages:watch`.
- Verify native ESM entry points with `npm run verify:package-entry-points`.
- Verify publishable contents with `npm run verify:package-artifacts`.

When changing a package's public API, update its exports, tests, README, and consumers where applicable. Consider both source-level development resolution and compiled `dist` entry points.


## Frontend

The frontend uses React, Vite, Material UI, Apollo Client, and Vitest.

- Start it with `npm run dev:frontend`.
- Build it with `npm run build:frontend`.
- Run its tests with `npm run test:frontend`.
- Run its tests in watch mode with `npm run test:frontend:watch`.

Reuse the existing components, hooks, form/input systems, exercise infrastructure, and styling patterns before adding new equivalents.


## API

The API uses TypeScript, Express, Apollo Server, Sequelize, PostgreSQL, and Vitest. Consult `api/README.md` for its architecture, configuration, database, migration, and testing conventions.

- Start it with `npm run dev:api`.
- Build packages and the API with `npm run build:api`.
- Build packages and type-check the API with `npm run typecheck:api`.
- Run its complete test suite with `npm run test:api`.

Database schema changes require a numbered migration and corresponding model changes. Confirm the configured target before running destructive database operations. Integration tests may only use the disposable `testing` database and must never target a database containing valuable data.


## Verification

Verify changes in proportion to their scope:

- Package changes: run the relevant tests and build the affected package or all packages as appropriate.
- Frontend changes: run relevant frontend tests and build the frontend when bundling or production behavior may be affected.
- API changes: run the API type-check and the relevant unit or integration tests.
- Cross-cutting changes: run `npm run build` and `npm test` when practical.
- Package publication changes: also run both package verification scripts.
- Documentation-only changes: verify commands and links, then run `git diff --check`.

Report the checks performed and any checks that could not be run.

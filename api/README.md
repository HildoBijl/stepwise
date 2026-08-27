# Step-Wise API

The Step-Wise API provides the server-side interface for Step-Wise. It exposes an HTTP and WebSocket GraphQL API, manages authentication and sessions, and persists application data in PostgreSQL.

The API is built with TypeScript, Express, Apollo Server, Sequelize, PostgreSQL, and Vitest. Shared domain definitions and logic come from the `@step-wise/*` workspace packages.


## Getting started

From the repository root:

1. Install the workspace dependencies.

   ```sh
   npm ci
   ```

2. Copy `api/.env-template` to `api/.env` and fill in the local PostgreSQL credentials and a session secret of at least 20 characters.

3. Ensure PostgreSQL contains both the development database configured by `POSTGRES_DB` and a separate database named `testing`. For example, using PostgreSQL's `createdb` command:

   ```sh
   createdb testing
   ```

   The configured administrator must be allowed to modify the schema in both databases.

4. Create or update the development database schema.

   ```sh
   npm run -w @step-wise/api db:migrate -- up
   ```

5. Start the development server.

   ```sh
   npm run -w @step-wise/api dev
   ```

By default, the API is available at <http://localhost:4000>. In development, Apollo Sandbox is available at <http://localhost:4000/graphql>.


## Configuration

The complete template is in [`.env-template`](.env-template). The application reads `.env` when it starts.

### Server

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Enables development behavior when set to `development` and production behavior when set to `production`. |
| `PORT` | HTTP server port. |
| `SESSION_SECRET` | Secret used to sign session cookies; must contain at least 20 characters. |
| `SESSION_MAXAGE_HOURS` | Session-cookie lifetime in hours. |
| `HOMEPAGE_URL` | Frontend URL used for redirects. |
| `API_DOMAIN` | Domain assigned to the session cookie. |
| `CORS_URLS` | Semicolon-separated frontend origins allowed to make credentialed requests. |

Production enables secure, cross-site session cookies. Development enables Apollo Sandbox, the mock authentication portal, and the development i18n routes.

### PostgreSQL

| Variable | Purpose |
| --- | --- |
| `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB` | PostgreSQL connection location. |
| `POSTGRES_APP_USER`, `POSTGRES_APP_PASSWORD` | Credentials used by the running API. |
| `POSTGRES_ADMIN_USER`, `POSTGRES_ADMIN_PASSWORD` | Credentials used by migrations, schema clearing, and integration tests. |
| `POSTGRES_SSLCERT` | Optional CA certificate. Use literal `\n` sequences for line breaks. An empty value disables database SSL. |

The application and administrator credentials may be identical during local development. They should have appropriately restricted permissions in deployed environments.

### Authentication and sessions

SURFconext production authentication uses `SURFCONEXT_ISSUER_URL`, `SURFCONEXT_REDIRECT_URL`, `SURFCONEXT_CLIENT_ID`, and `SURFCONEXT_SECRET`. Google Sign-In uses `GOOGLE_CLIENT_ID`.

Production sessions are stored in Redis using `REDIS_HOST` and `REDIS_PORT`. Development uses an in-memory session store and mock SURFconext identities from [`mockData.json`](src/modules/authentication/surfConext/mockData.json). The development session helper uses `lastSessionData` to restore the most recently selected mock identity after a restart.

Never commit `.env`, authentication secrets, or production database credentials.


## Architecture

The API is organized by feature under [`src/modules`](src/modules). A module may contribute:

- Sequelize model factories and associations;
- GraphQL schema definitions and resolvers;
- request-scoped DataLoader factories;
- service functions containing reusable application and persistence logic.

[`src/modules/index.ts`](src/modules/index.ts) registers modules in dependency order. The current order is user, authentication, course, skill, exercise, group, and group exercise. Keep foundational modules before modules that depend on them.

The main layers are:

| Area | Responsibility |
| --- | --- |
| [`scripts`](scripts) | Executable entry points and infrastructure construction. |
| [`src/server`](src/server) | Express, sessions, CORS, Apollo HTTP/WebSocket setup, and request context creation. |
| [`src/graphql`](src/graphql) | Combines module schemas, resolvers, and loader factories. |
| [`src/modules`](src/modules) | Feature models, services, schemas, resolvers, loaders, and access rules. |
| [`src/database.ts`](src/database.ts) | Initializes the typed Sequelize model registry and associations. |
| [`migrations`](migrations) | Versioned PostgreSQL schema changes. |

### Request flow

A typical GraphQL request passes through these stages:

1. Express restores the session and applies CORS.
2. Apollo creates an `ApiContext` containing the typed database registry, current user information, authorization helpers, pub/sub, and request-scoped loaders.
3. A resolver validates authentication and access, then delegates reusable work to a service.
4. The service reads or changes Sequelize records, optionally inside a transaction or using row locks.
5. The resolver returns the GraphQL transport shape and publishes subscription events when applicable.

Resolvers should remain focused on GraphQL concerns. Put persistence logic that can be called independently in the feature's `service.ts` file.

### Types and module registries

The central interfaces `ApiModels`, `ApiLoaders`, and `ApiContext` are extended by feature modules through TypeScript module augmentation. This lets modules register their own types without making the foundational types depend on every feature.

Model and loader registries are checked for completeness at startup. Avoid weakening these types with `any` or broad type assertions. Prefer package domain types for stored domain data and explicit GraphQL transport types for resolver inputs and outputs.

### GraphQL and subscriptions

GraphQL uses `/graphql` for both HTTP operations and WebSocket subscriptions. HTTP authentication uses the signed session cookie. WebSocket connections restore that same session during the upgrade and reject anonymous clients.

Schemas and resolvers live in their owning feature module. Public schema renames are API changes and must be applied to frontend operations in the same change.

### Errors

Expected request failures use the application error classes in [`src/errors.ts`](src/errors.ts):

- `UnauthenticatedError` for missing authentication;
- `ForbiddenError` for denied access;
- `InvalidInputError` for invalid user-controlled input.

These errors expose stable GraphQL extension codes. Unexpected consistency or infrastructure failures should remain ordinary errors rather than being presented as input mistakes.


## Database and migrations

Sequelize models describe the schema expected by the running application, but they do not update PostgreSQL automatically. Every schema change therefore requires both:

1. a numbered migration in [`migrations`](migrations);
2. corresponding model and application changes.

Common commands are:

```sh
npm run -w @step-wise/api db:migrate -- up
npm run -w @step-wise/api db:migrate -- down
npm run -w @step-wise/api db:clear
```

`db:migrate -- up` applies all pending migrations. `db:migrate -- down` reverts the most recent migration. `db:clear` drops and recreates the configured database schema without reapplying migrations, so verify the target database before running it and run `db:migrate -- up` afterwards.

Use explicit, stable names for indexes and constraints in both migrations and model definitions. Test both the `up` and `down` paths locally. See [`migrations/README.md`](migrations/README.md) for the migration procedure and production guidance.


## Testing

The API has two complementary test layers.

### Unit tests

Unit tests live in [`tests/unit`](tests/unit). They cover pure domain behavior, access rules, resolver decisions, configuration, context construction, and other behavior that does not require PostgreSQL.

```sh
npm run -w @step-wise/api test:unit
```

This command uses `vitest.unit.config.ts`, does not initialize the test database, and may run test files in parallel.

### Integration tests

Integration tests live in [`tests/integration`](tests/integration):

- `graphql` tests make real HTTP GraphQL requests and cover the complete path through authentication, resolvers, services, Sequelize, and response serialization;
- `services` tests call services and models directly against PostgreSQL to verify persistence, ordering, constraints, cascades, and transactions.

```sh
npm run -w @step-wise/api test:integration
```

Integration tests force `POSTGRES_DB=testing`; this database must already exist before the tests start. Their global setup drops and recreates its `public` schema and reapplies every migration. Ensure the administrator credentials point to this disposable local test database and never to a database containing valuable data. Test files run serially because they share this database.

The complete suite runs unit and integration tests together:

```sh
npm test -w @step-wise/api
```

The main configuration also runs all files serially. Within a test file, tests are sequential unless explicitly marked concurrent.

For iterative GraphQL work:

```sh
npm run -w @step-wise/api test:watch
```

Shared test utilities are in [`tests/support`](tests/support). `database.ts` contains generic database-cleaning functions; `integrationDatabase.ts` owns the direct service-test connection and its Vitest lifecycle hooks.


## Development commands

| Command | Purpose |
| --- | --- |
| `npm run -w @step-wise/api dev` | Start the API in watch mode. |
| `npm run -w @step-wise/api start` | Start the API once with `tsx`. |
| `npm run -w @step-wise/api typecheck` | Type-check source, scripts, migrations, and tests. |
| `npm run -w @step-wise/api build` | Clean and compile the API to `dist`. |
| `npm run -w @step-wise/api test:unit` | Run the database-independent unit tests. |
| `npm run -w @step-wise/api test:integration` | Rebuild the test schema and run integration tests. |
| `npm test -w @step-wise/api` | Run the complete API test suite. |

Before committing an API change, run at least the typecheck and the relevant test layer. Run the complete suite for changes to shared context, model registration, authentication, database behavior, or GraphQL workflows.

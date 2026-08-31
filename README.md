# Step-Wise

Step-Wise is an open-source educational platform for learning mathematics, physics and engineering mechanics through interactive, automatically generated exercises. It organizes subject matter as a Skill Tree, recommends what a student should practise next, and tracks the student's progress as they work.

Step-Wise is also a collection of JavaScript and TypeScript tools for teachers and developers building educational software with React. The workspace contains reusable packages for defining skills and exercises, interpreting mathematical input, grading answers, selecting exercises, tracking mastery, working with physical quantities, drawing geometry, and performing computer algebra.

This repository contains the complete platform as well as the reusable packages. All code is open source and reusable packages are exported through npm.


## Repository structure

Step-Wise is an npm workspace with three main areas:

- [`frontend`](frontend/) is the React application students and teachers interact with. It uses Vite, Apollo Client, Material UI, and Vitest.
- [`api`](api/) is the TypeScript GraphQL server. It handles authentication, courses, exercises, progress, and persistence in PostgreSQL.
- [`packages`](packages/) contains the framework and domain packages shared by the frontend and API. Many of these packages can also be installed independently from npm and used in other educational applications.

Operational configuration and release tooling live in [`ops`](ops/).

Some useful entry points into the package ecosystem are:

- [`@step-wise/skill-setup`](packages/skill-setup/) and [`@step-wise/skill-definition`](packages/skill-definition/) for defining, validating, and inspecting custom skill trees;
- [`@step-wise/exercise-definition`](packages/exercise-definition/), [`@step-wise/input-exercises`](packages/input-exercises/), and [`@step-wise/exercise-grading`](packages/exercise-grading/) for developing generated exercises and checking submitted answers;
- [`@step-wise/skill-tracking`](packages/skill-tracking/) and [`@step-wise/exercise-selection`](packages/exercise-selection/) for tracking student progress, recommending what to practise, and selecting exercises appropriate to a student's current level;
- [`@step-wise/physics-core`](packages/physics-core/) and [`@step-wise/physics-data`](packages/physics-data/) for working with physical quantities, units, and related reference data;
- [`@step-wise/math-input-value`](packages/math-input-value/) and [`@step-wise/cas`](packages/cas/) for intuitive mathematical input and for inspecting, transforming, evaluating, and comparing mathematical expressions and equations;
- [`@step-wise/geometry`](packages/geometry/) and [`@step-wise/engineering-mechanics`](packages/engineering-mechanics/) for geometry, free-body diagrams, loads, and related engineering-mechanics concepts;
- [`@step-wise/skill-tree`](packages/skill-tree/) for exploring and using the concrete skill tree that powers the Step-Wise platform.

Each package has its own README with installation instructions, examples, and API details.


## Requirements

To work on the repository, install:

- [Git](https://git-scm.com/downloads);
- [Node.js](https://nodejs.org/en/download) 24.12 or newer, including npm;
- [PostgreSQL](https://www.postgresql.org/download/) when running the API or its integration tests.

PostgreSQL is not required when you only want to run the frontend without login and server-backed features.


## Install the repository

Clone the repository and install the exact dependency versions recorded in `package-lock.json`:

```sh
git clone https://github.com/HildoBijl/stepwise.git
cd stepwise
npm ci
```

Build all shared packages and the frontend:

```sh
npm run build
```


## Run only the frontend

The frontend can run without the API. This is useful for browsing educational content and developing components or exercises that do not need user accounts.

1. Copy [`frontend/.env-template`](frontend/.env-template) to `frontend/.env`. The template values are suitable for normal local development and do not need to be changed.

   In PowerShell:

   ```powershell
   Copy-Item frontend/.env-template frontend/.env
   ```

   On macOS or Linux:

   ```sh
   cp frontend/.env-template frontend/.env
   ```

2. Start Vite from the repository root:

   ```sh
   npm run dev:frontend
   ```

Vite opens the application at <http://localhost:3000>. Without the API, login, courses, and persisted student progress are unavailable.


## Run the complete application

The complete local application consists of PostgreSQL, the API, and the frontend.

### 1. Configure PostgreSQL

Install and start PostgreSQL. Create a development database for the application. You may use the default `postgres` database from the template, but a dedicated database such as `stepwise` makes the local data and schema easier to manage.

You can use the PostgreSQL command line:

```sh
createdb stepwise
createdb testing
```

Alternatively, create both databases through pgAdmin by right-clicking **Databases**, choosing **Create → Database**, and entering `stepwise` and `testing` as their names.

The `testing` database is disposable: the API integration tests drop and recreate its `public` schema. Never point the test configuration at a database containing valuable data.

### 2. Configure the API

Copy [`api/.env-template`](api/.env-template) to `api/.env`:

```powershell
Copy-Item api/.env-template api/.env
```

On macOS or Linux, use `cp api/.env-template api/.env` instead.

Open `api/.env` and set at least:

```dotenv
POSTGRES_DB=stepwise
POSTGRES_APP_PASSWORD=your-postgres-password
POSTGRES_ADMIN_PASSWORD=your-postgres-password
SESSION_SECRET=replace-this-with-a-random-secret-of-at-least-20-characters
```

Also update `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_APP_USER`, and `POSTGRES_ADMIN_USER` if they differ from the local defaults. For local development, the application and administrator accounts may be the same PostgreSQL account. The application reads the app credentials during normal operation and uses the administrator credentials for migrations and integration-test setup.

Leave `POSTGRES_SSLCERT` empty for a normal local PostgreSQL installation. The remaining development defaults enable the local frontend, mock authentication, and an in-memory session store. Do not commit `.env` files or real credentials.

See the [API configuration guide](api/README.md#configuration) for every supported setting, including SURFconext, Google Sign-In, Redis, CORS, cookies, and database SSL.

### 3. Create the database schema

From the repository root, apply all database migrations:

```sh
npm run -w @step-wise/api db:migrate -- up
```

This creates the required tables in the database selected by `POSTGRES_DB`. It does not create the database itself, which is why the previous PostgreSQL step is required.

### 4. Start the API and frontend

Start the complete development environment from the repository root:

```sh
npm run dev
```

This rebuilds the workspace packages and starts both development servers. The frontend opens at <http://localhost:3000>, while the GraphQL API and Apollo Sandbox are available at <http://localhost:4000/graphql>.

Development uses mock authentication, so you can choose a local test identity and log in without production SURFconext credentials.

After the initial package build, `npm run dev:fast` starts both servers without rebuilding every package first. You can also run them separately with `npm run dev:api` and `npm run dev:frontend`.


## Verify the setup

Run the complete test suite with:

```sh
npm test
```

This runs the package, API, and frontend Vitest suites. The API integration tests require the `testing` database and use the administrator credentials from `api/.env`.

The suites can also be run separately:

| Command | Purpose |
| --- | --- |
| `npm run test:packages` | Test the reusable workspace packages. |
| `npm run test:api` | Test the API, including PostgreSQL integration tests. |
| `npm run test:frontend` | Test the React frontend. |
| `npm run test:packages:watch` | Run package tests in watch mode. |
| `npm run test:frontend:watch` | Run frontend tests in watch mode. |

For API-specific unit, integration, type-check, and migration commands, see the [API README](api/README.md).


## Common development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Rebuild packages and start the API and frontend. |
| `npm run dev:fast` | Start both development servers without rebuilding packages. |
| `npm run dev:api` | Start only the API in watch mode. |
| `npm run dev:frontend` | Start only Vite and open the frontend. |
| `npm run watch:packages` | Rebuild packages and continue compiling package changes. |
| `npm run build` | Build all packages and the production frontend. |
| `npm run build:packages` | Compile the workspace packages with TypeScript project references. |
| `npm run rebuild:packages` | Remove and rebuild all generated package output. |
| `npm run build:api` | Build the packages followed by the API. |
| `npm run build:frontend` | Build the production frontend. |


## How Step-Wise fits together

Educational content is divided into small skills with explicit prerequisite relationships. A course groups those skills into a path for a particular class. The exercise registry connects each skill to generated examples and exercises. Submitted work is interpreted and graded using shared domain packages, while skill tracking estimates mastery and exercise selection determines useful next practice.

The same architecture makes the educational tooling reusable outside the Step-Wise application. A custom platform can use only the packages it needs—for example, the CAS and math-input packages, the exercise-definition and grading packages, or the generic skill modelling tools—while providing its own React interface and server.

The repository's [development philosophy](philosophy.md) explains the principles behind the platform and its educational design.


## Contributing

Contributions are welcome, from corrections to individual exercises through new reusable tools and platform features.

Before starting a large change, consider contacting <info@step-wise.com> to coordinate it with the project direction. For code changes, create a branch, add or update relevant tests, run the appropriate build and test commands, and open a pull request.

Production deployment and server administration are documented separately in the [operations guide](ops/README.md).

The manual npm release procedure is documented in [PUBLISHING.md](PUBLISHING.md).

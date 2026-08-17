# Package test migration

## Baseline

Recorded on 2026-08-17 before migrating any package from Jest to Vitest.

| Check | Command | Result |
| --- | --- | --- |
| Package build | `npm run build:packages` | Passed |
| Package Jest suite | `npm run test:packages -- --runInBand` | 49 suites and 1,903 tests passed |
| Migrated-package Vitest suite | `npm run test:packages:vitest` | Passed with no migrated tests |

The package build uses `tsconfig.base.json`, which excludes test files and only
loads Node globals. Jest and Vitest tests use their respective root test
TypeScript configurations.

## Migrating a package

When a package moves to Vitest:

1. Add its directory name to `migratedPackages` in `vitest.config.ts`.
2. Exclude its test path from `jest.config.js`.
3. Run its Vitest tests, the remaining Jest suite, and the package build.


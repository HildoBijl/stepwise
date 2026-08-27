# CAS testing conventions

Tests are placed according to the scope of the behavior they verify.


## Co-located tests

Put a test beside its implementation when it primarily exercises one module, class or rule. Use the corresponding source name where practical, such as `numeric.test.ts`, `checks.test.ts` or `Expression.test.ts`.

Co-located tests should cover:

- normal behavior and meaningful edge cases;
- invalid inputs and expected errors;
- option defaults and non-default option objects;
- invariants owned by that module;
- identity behavior when unchanged references are significant.


## Core integration tests

Use [`core/tests/integration`](../core/tests/integration/) for workflows spanning multiple core subsystems. Current groups cover:

- interpretation and output round trips;
- simplification rules and presets;
- differentiation workflows.

A rule still needs focused tests near its implementation when its branching logic is substantial. Integration tests verify that registered rules, dependencies and surrounding passes work together.


## Wrapper integration tests

Use [`tests/integration`](./integration/) for workflows that cross the expression/equation boundary or exercise the package through its public wrappers. Shared wrapper assertions belong in [`tests/support`](./support/) and should not contain domain behavior of their own.


## Choosing test inputs

- Prefer constructors and node factories in focused core tests.
- Prefer `asExpression` and `asEquation` in wrapper and package integration tests.
- Use exact structural assertions when representation is the subject of the test.
- Use semantic comparisons only when multiple representations are intentionally acceptable.
- Test both directions of conversion APIs and include ambiguity cases in round-trip suites.

Run the package suite with:

```bash
npm test --workspace @step-wise/cas
```

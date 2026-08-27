# Differentiation

Differentiation is a semantic operation: its behavior depends on mathematical meaning rather than only on node structure.


## Execution flow

`differentiate` resolves the expression settings and derivative variable, then creates a `DerivativeContext`. The context contains:

- the variable with respect to which differentiation occurs;
- the resolved expression settings;
- a recursive `differentiate` function used by derivative rules.

`applyDerivativeRules` dispatches the current node to the applicable rule. The resulting derivative receives the `removeTrivial` simplification preset, but broader combination or formatting remains the caller's choice.


## Rule organization

Rules are grouped by mathematical node family under [`rules`](./rules/): constants, variables, signs, sums, products, fractions, powers, roots, logarithms and trigonometric functions.

A rule should construct the mathematically correct derivative without relying on unrelated broad simplification. Use the recursive function from the context when differentiating child nodes so the same variable and settings are retained.


## Adding a rule

1. Put the rule in the file matching the node family.
2. Add it to the dispatcher in `applyDerivativeRules` when necessary.
3. Test the rule beside the derivative implementation for focused behavior.
4. Add representative multi-rule examples to `core/tests/integration/derivatives/differentiationWorkflows.test.ts`.

Keep simplification expectations explicit in tests. Differentiation performs only trivial cleanup; callers commonly use `combine`, `normalize` or `format` afterwards.

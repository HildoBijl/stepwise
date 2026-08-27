# CAS core

The core represents mathematics as immutable `ExpressionNode` trees and provides plain functions that operate on those trees. The public `Expression` and `Equation` wrappers are built on top of it.


## Expression nodes

Every node extends `ExpressionNode` and exposes its direct children. The principal node families are:

- Constants: positive integers, floats and named constants such as `π`, `e` and `∞`.
- Signs: `Minus` and `PlusMinus`. Negative values are represented by a sign around a positive value rather than by a negative constant.
- Variables: a symbol with optional subscript and accent information.
- Lists: sums and products, which contain an ordered `nodes` collection.
- Functions: fractions, powers, roots, logarithms, trigonometric functions and other nodes with named arguments.

Tree structure is meaningful. For example, a nested sum and a flat sum can render similarly but remain structurally different until a flattening rule is applied.

Nodes contain only intrinsic tree data and recreation behavior. Algebraic behavior belongs in operation functions rather than methods on individual node classes.


## Dependency hierarchy

The core follows a strict one-way hierarchy:

```text
export ──→ operations ──→ construction
```

Within operations, dependencies generally flow as follows:

```text
semantic ──→ simplification ──→ structural
```

Code may import from an earlier layer, but an earlier layer must not import from a later one. This prevents cycles and keeps basic node construction independent of higher-level algebra.


## Folder structure

- [`construction`](./construction/) defines and creates nodes.
  - `nodes` contains node classes and their input/storage types.
  - `creation` contains factories such as `sum`, `product`, `fraction` and `power`.
  - [`interpretation`](./construction/interpretation/) turns math input values into node trees.
- [`operations`](./operations/) operates on existing nodes.
  - `structural/inspection` contains type, value, dependency, equality and traversal checks.
  - `structural/evaluation` extracts a concrete value from an eligible tree.
  - `structural/manipulation` performs direct tree transformations such as arithmetic construction, substitution and plural expansion.
  - [`simplification`](./operations/simplification/) applies validated rewrite rules until the tree stabilizes.
  - `semantic` contains operations whose meaning goes beyond tree structure, including equivalence, settings conversion and differentiation.
- [`export`](./export/) converts nodes to strings, TeX, math input values and storage values.
- [`tests`](./tests/) contains integration tests that exercise multiple core areas together.


## Immutability and recreation

Operations create new nodes rather than modifying existing ones. Node implementations support `recreateWithChildren`, allowing generic traversal code to rebuild a tree without knowing each concrete subtype.

When an operation makes no change, it should return the original node where practical. The simplification engine uses reference equality to determine whether a pass has stabilized.


## Adding a node type

A new node normally requires coordinated changes:

1. Define the node, its input type and its storage representation under `construction/nodes`.
2. Add a creation helper when callers should not construct the class directly.
3. Add type checks and any relevant structural inspections.
4. Teach interpretation and each output format how to handle it.
5. Add simplification and derivative rules where mathematically applicable.
6. Export it through barrel files in dependency order.
7. Add focused tests beside each affected module and round-trip tests where relevant.

An unsupported node should generally cause an explicit error at a conversion boundary rather than silently producing incomplete output.


## Storage boundary

Core storage functions record only intrinsic node data. They do not record the wrapper type or expression settings. The expression and equation serialization layers add that domain information and integrate with the serialization package.

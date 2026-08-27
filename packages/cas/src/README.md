# CAS developer guide

This guide describes where the main parts of the CAS live and how they depend on each other. The package-level [README](../README.md) documents the public API.


## Architecture

The source has three main layers.

```text
equations ──→ expressions ──→ core
```

- [`core`](./core/) defines expression nodes and the functions that construct, inspect, transform, simplify, interpret and export them. It does not depend on the wrapper layers.
- [`expressions`](./expressions/) provides the public `Expression` wrapper. It owns expression settings and turns core functions into an ergonomic, immutable API.
- [`equations`](./equations/) provides the public `Equation` wrapper. It coordinates two expressions that must use the same expression settings.

Imports must follow this direction. Shared node-level behavior belongs in the core rather than being duplicated in a wrapper.


## Core folder overview

The core is divided into the following first- and second-level folders.

| Folder | Purpose |
|---|---|
| [`core/construction`](./core/construction/) | Defines everything needed to create expression-node trees. It is the lowest core layer. |
| [`core/construction/nodes`](./core/construction/nodes/) | Contains `ExpressionNode`, the concrete node classes, and their input and storage types. |
| [`core/construction/creation`](./core/construction/creation/) | Provides factories and input coercion for constructing valid nodes, such as `sum`, `product`, `fraction` and `power`. |
| [`core/construction/interpretation`](./core/construction/interpretation/) | Turns math input values and parsed strings into expression-node trees. |
| [`core/operations`](./core/operations/) | Contains functions that inspect, evaluate or transform existing nodes. |
| [`core/operations/structural`](./core/operations/structural/) | Handles behavior based directly on tree structure, divided into inspection, evaluation and manipulation. |
| [`core/operations/simplification`](./core/operations/simplification/) | Defines rewrite rules, rule validation and staging, simplification presets, and the engine that applies rules until stable. |
| [`core/operations/semantic`](./core/operations/semantic/) | Contains operations with mathematical meaning beyond direct tree structure, such as equivalence, settings conversion and differentiation. |
| [`core/export`](./core/export/) | Converts completed node trees into external representations. |
| [`core/export/printing`](./core/export/printing/) | Produces strings, TeX and math input values, and infers interpretation settings needed for unambiguous output. |
| [`core/export/storage`](./core/export/storage/) | Converts nodes to and from intrinsic storage values without wrapper type or settings information. |
| [`core/tests`](./core/tests/) | Holds shared core test utilities and tests whose scope does not belong beside one source module. |
| [`core/tests/integration`](./core/tests/integration/) | Exercises workflows spanning multiple core areas, including interpretation round trips, simplification and differentiation. |

The structural subfolders are one level deeper: `inspection` does not change nodes, `evaluation` extracts concrete values, and `manipulation` constructs a different tree without selecting a broad simplification strategy. More specialized folders below the levels shown here group node families, rewrite categories and integration-test subjects within their owning subsystem.


## Important conventions

- Expression nodes, expressions and equations are immutable. Return the original object when nothing changed where practical; reference equality is used to detect stability.
- Keep public calls readable. Use an options object when optional booleans would otherwise appear as positional arguments.
- Traversal callbacks may receive ancestors, but callers do not provide ancestor state. Recursive helpers maintain it internally.
- Interpretation settings are used while parsing and then discarded. Expression settings remain attached to expressions and equations.
- A storage value contains enough intrinsic data to rebuild an object when its type is already known. Serialization additionally includes type information and may include context such as shared settings.
- Imports and barrel exports follow the dependency hierarchy: definitions from earlier layers appear before their consumers.


## Detailed guides

- [Core architecture](./core/README.md)
- [Interpretation pipeline](./core/construction/interpretation/README.md)
- [Simplification engine and rule reference](./core/operations/simplification/README.md)
- [Differentiation](./core/operations/semantic/derivatives/README.md)
- [Expression wrapper](./expressions/README.md)
- [Equation wrapper](./equations/README.md)
- [Testing conventions](./tests/README.md)

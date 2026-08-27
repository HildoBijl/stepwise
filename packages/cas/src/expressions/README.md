# Expression wrapper internals

`Expression` is the public wrapper around an `ExpressionNode`. It combines a node tree with resolved expression settings and exposes core operations through an immutable object API.


## Responsibilities

The expression layer is responsible for:

- coercing `ExpressionLike` inputs;
- keeping expression settings attached to every result;
- presenting safe type checks and subtype-specific accessors;
- wrapping node-level construction, manipulation, simplification and semantic operations;
- converting between strings, TeX, math input values, storage values and serialized expressions;
- defining expression-level comparison and preprocessing APIs.

Mathematical algorithms that can work directly on nodes belong in the core. The wrapper should coordinate settings, input coercion and return types rather than duplicate those algorithms.


## Input coercion and settings

`asExpression` accepts an existing `Expression` or an `ExpressionInput`. Non-expression inputs are interpreted into a node. An existing expression is returned unchanged unless new expression settings require conversion.

Operations that accept another expression-like value coerce it to the settings of the receiving expression. Likewise, a callback used by `mapExpressions` may return an expression with different settings, but the mapped result is converted back to the original settings before it is inserted. The final expression therefore retains the settings with which the operation started.

Interpretation settings only decide how input becomes a node tree. They are not retained. When printing, the wrapper infers compatible interpretation settings from the finished tree.


## Inspection and subtype access

Type-check methods such as `isSum`, `isFraction` and `isPower` inspect the root node. Accessors such as `terms`, `numerator` and `exponent` wrap the corresponding child nodes as expressions with the same settings.

Subtype-specific accessors throw when called on the wrong node type. Callers should run the corresponding type check first.

Recursive inspection uses `some`, `every`, `find`, `findAll` and `forEachExpression`. These methods use the core traversal option types. Callbacks receive the current expression and its ancestors; the ancestor list is constructed internally and is ordered from the root toward the direct parent.


## Transformations

Arithmetic and subtype-specific mapping methods create a new expression. Recursive `mapExpressions` is children-first by default, so transformed children are inserted before their parent is offered to the callback. A replacement is not recursively processed again during the same visit.

Substitution is simultaneous. Given `{ x: 'y', y: 'z' }`, an original `x` becomes `y`, not `z`. This is implemented without applying one user replacement to the result of another.

`evaluateAt` performs substitution and then requires the result to reduce to one numeric value. `toNumber` is intentionally strict and throws for non-numeric, plural or unsupported real-valued expressions.


## Comparison

Structural comparison and mathematical comparison are separate concerns:

- `strictEqualStructure` requires identical tree structure and order.
- `equalStructure` can allow order changes in sums and products.
- `equals` supports preprocessing through expression equality options.
- `isEquivalentTo`, `isIntegerMultiple` and `isConstantMultiple` use semantic core operations.

The standalone `expressionComparisons` object exposes the comparisons used by exercises without forcing callers to construct wrapper-specific option objects.


## Storage and serialization

`toStorageValue` delegates to core node storage and therefore contains no wrapper type or settings. `Expression.fromStorageValue` requires settings when the defaults are insufficient.

Serialization adds the `Expression` type marker and participates in shared serialization context. Keep this distinction intact when adding fields or formats.

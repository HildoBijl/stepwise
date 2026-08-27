# Equation wrapper internals

`Equation` coordinates a left and right `Expression`. Most mathematical behavior delegates to the expression layer, while this wrapper enforces equation-wide invariants and side-aware operations.


## Construction and settings

`asEquation` accepts an existing equation, an equation input value, a string containing one equals sign or an object with `left` and `right` values.

Both sides must use the equation's resolved expression settings. Construction and mapping convert side results where needed so that `equation.settings`, `equation.left.settings` and `equation.right.settings` remain compatible.

The two sides may originally be interpreted with different interpretation settings because those settings are discarded after interpretation. When an equation is printed or converted back to an input value, `inferInterpretationSettings` inspects both completed trees. It throws if no single interpretation can reproduce both sides, such as when the same symbol is used as both a named constant and a variable.


## Side and tree operations

`someSide`, `everySide` and `findSide` inspect whole sides. `mapSides`, `mapLeft` and `mapRight` transform sides while preserving the settings invariant.

Expression-tree traversal methods add the side name to their callbacks. `find`, `findAll`, `forEachExpression` and `mapExpressions` reuse the expression traversal options and traverse each side independently.

Arithmetic methods apply the same operation to both sides. `switchSides` only exchanges the sides. `moveAllToLeft` and `normalizeToZero` deliberately change the representation to support equation-wide comparison.


## Comparison

Equation comparison must decide independently whether to allow:

- ordering changes within sums and products;
- switching the left and right sides;
- negating both sides;
- preprocessing the whole equation;
- preprocessing or comparing each side with shared or side-specific functions.

`equalStructure` covers structural order and side switching. `equals` handles the broader `EquationEqualityOptions`. It rejects conflicting shared and side-specific preprocessors or comparators rather than choosing one silently.

Equivalence treats an equation as an expression equal to zero. Both equations are normalized to zero and their remaining left sides are compared up to a nonzero constant multiple.


## Storage and serialization

An equation storage value contains the storage values of its left and right expressions. Their shared settings are not duplicated inside that value.

Serialization adds the `Equation` type marker and carries the settings required to reconstruct both sides. Deserialization must restore the common settings invariant.

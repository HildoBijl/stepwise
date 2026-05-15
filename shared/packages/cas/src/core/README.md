# CAS Expression Core

This folder forms the basis of the CAS. 


## Main idea

The idea behind the `core` is to define a set of `ExpressionNodes` that contain each other in a tree structure. Nodes that exist are:

- Constants: values (always positive) that represent numbers.
  - Integers: `2, 3, 5, 8, ...`
	- Floats: `1.4, 3.14, 4.2, ...`
	- NamedConstants: `π, e, ∞, ...`
- Signs: modifiers of values.
  - Minus: adds a minus sign.
	- PlusMinus: adds a ± sign.
- Variables: they have a symbol, a subscript (optional) and an accent (optional). So we could have `x`, `y_2`, `dot(m)` or similar.
- Functions: nodes with one or more arguments. These include:
  - `Fraction`: has a `numerator` and `denominator`.
	- `Power`: has a `base` and an `exponent`.
	- `Sqrt`: has a `radicand`.
	- `Root`: has a `radicand` and `degree`.
	- `Ln`: has an `argument`.
	- `Log`: has an `argument` and `base`.
	- Various other single-argument functions having an `argument`. Think of `Sin`, `Cos`, `Tan`, `Arcsin`, `Arccos` and `Arctan`.

These nodes itself have no functionalities, but they can be passed to a variety of functions.


## Folder set-up

The `core` is structured through four folders, each with various subfolders. The import hierarchy is strict: folders may only import from folders above them, but never the other way around.

- [construction](./construction/): everything needed to set up `ExpressionNodes`. This includes:
  - [nodes](./construction/nodes/): defining all `ExpressionNode` types.
	- [creation](./construction/creation/): helper functions like `sum`, `product`, etcetera to easily set up `ExpressionNodes`.
	- [interpreting](./construction/interpreting/): tools that can turn a string into an `ExpressionNode`.
- [operations](./operations/): everything used to adjust/manipulate `ExpressionNodes` into different `ExpressionNodes`.
  - [structural](./operations/structural/): operations working directly on the structure of the data. Think of type checks, traversal tools, etcetera.
	- [simplification](./operations/simplification/): the `simplify` function can receive a large variety of options and uses it to rewrite the expression into something that is equivalent but differently written.
	- [semantic](./operations/semantic/): all operations that have an inherent mathematical meaning outside of just tree nodes. For instance `getDerivative`.
- [export](./export/): everything needed to display/output expressions.
  - [printing](./export/printing/): turn an expression into something that can be displayed, either as a string or through TeX or so.
	- [serialization](./export/serialization/): turn an expression into a plain object that can be stored in a database, or reinterpret/deserialize stored objects.
- [tests](./tests/): unit tests to see if everything does what it's intended to do.

All tools are plain functions that require one or more nodes and perform operations with them.

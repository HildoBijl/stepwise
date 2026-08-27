# @step-wise/cas

This package provides the computer algebra system used by Step-Wise. It represents mathematical expressions and equations, and offers tools for inspecting, transforming, simplifying, comparing, evaluating and differentiating them.

Strings are parsed through [`@step-wise/math-input-value`](https://www.npmjs.com/package/@step-wise/math-input-value), whose editable input format this package expands with algebra functionality.


## Installation

```bash
npm install @step-wise/cas
```


## Quick start

Use `asExpression` and `asEquation` to create the two main public objects.

```ts
import { asEquation, asExpression } from '@step-wise/cas'

const expression = asExpression('(2x^2+3x+1)/(x^2-1)')
const equation = asEquation('2x+3=9')

const normalizedExpression = expression.normalize()
const equationWithoutConstant = equation.subtract(3)
```

These objects are immutable: operations return a new `Expression` or `Equation` and leave the original unchanged.


## Expressions

An `Expression` wraps an expression tree together with the settings used to operate on it. Its getters and checks let you inspect the expression without working with internal nodes directly.

```ts
const expression = asExpression('2x+3')

expression.str
expression.isSum()
expression.isPolynomial()
expression.collectVariables()
```

Arithmetic methods build new expressions. Mapping methods can transform either the whole tree or selected expressions within it.

```ts
const x = asExpression('x')
const polynomial = x.square().add(x.multiply(3)).add(2) // x^2 + 3x + 2

const cubedPowers = polynomial.mapExpressions(part =>
  part.isPower() ? part.mapExponent(() => asExpression(3)) : part,
) // x^3 + 3x + 2
```

Use `forEachExpression`, `some`, `every`, `find` and `findAll` for recursive inspection. `mapExpressions` recursively transforms expressions and applies each mapping only once to the original tree.

Substitution is simultaneous, so one replacement does not trigger another replacement from the same call.

```ts
const expression = asExpression('x+y') // x + y
const substituted = expression.substitute({ x: 'y', y: 'z' }) // y + z
```

Numeric expressions can be evaluated with `toNumber`. This throws when the expression cannot be reduced to one real number, for example for a variable, a plus-minus value or an unsupported real root.

```ts
asExpression('2+3').toNumber() // 5
```


## Equations

An `Equation` contains a left and right `Expression` with shared expression settings.

```ts
const equation = asEquation('2x+3=9')

equation.left
equation.right
equation.settings
```

Arithmetic methods apply the same operation to both sides. You can also switch the sides, normalize the equation to zero or map its expressions.

```ts
const reduced = equation.subtract(3).divide(2)
const switched = equation.switchSides()
const normalized = equation.normalizeToZero()
```


## Simplification

Call `simplify` with the rules that should be applied. Rules are applied repeatedly until no selected rule changes the expression further.

```ts
const simplified = asExpression('2x+3x').simplify([
  'flattenSums',
  'combineLikeTerms',
]) // 5x
```

Common groups of rules are available through convenience methods:

- `flatten`
- `removeTrivial`
- `mergeNumbers`
- `cancel`
- `combine`
- `expand`
- `sort`
- `normalize`
- `factorize`
- `format`

Each preset method accepts separate collections of rules to add and remove, allowing its defaults to be adapted for one operation.

```ts
const result = expression.combine(
  ['sortProducts'], // Added options
  ['combineLikeTerms'], // Removed options
)
```


## Comparison

Expressions and equations support different levels of comparison. Choose the one that represents the distinction relevant to the exercise or operation.

```ts
import { expressionComparisons } from '@step-wise/cas'

expressionComparisons.areExactlyEqual('x+x', '2x') // false
expressionComparisons.areEquivalent('x+x', '2x') // true
expressionComparisons.areConstantMultiples('3x', '2x') // true
```

`areExactlyEqual` compares the actual tree structure. It therefore preserves visible distinctions such as `2+(3+4)` versus `2+3+4`, and `-(x/y)` versus `(-x)/y`.

The standalone `expressionComparisons` and `equationComparisons` exports provide common comparison functions directly. The `equals` methods accept options that configure preprocessing, order changes and, for equations, whether switching the two sides is allowed.

```ts
import { asEquation } from '@step-wise/cas'

asEquation('x=2').equals('2=x', {
  allowSideSwitch: true,
}) // true
```


## Differentiation

Use `differentiate` to take a derivative with respect to a variable. The result is an expression and can be simplified further as needed.

```ts
const derivative = asExpression('x^3+2x').differentiate('x').combine()
```


## Settings

The package distinguishes interpretation settings from expression settings.

- `InterpretationSettings` determine how input is turned into an expression tree. They are used only during interpretation and are discarded afterwards.
- `ExpressionSettings` determine how an existing expression tree behaves. They remain attached to expressions and equations.

```ts
const constantE = asExpression('2e')
const variableE = asExpression('2e', { interpretEAsConstant: false })

const radians = asExpression('sin(180)')
const degrees = asExpression(
  'sin(180)',
  undefined,
  { angleUnit: 'degrees' },
)
```

Use `withSettings` when an existing expression or equation must be converted to different expression settings.


## Input and output formats

The package accepts strings as a convenient input, as well as the editable values from `@step-wise/math-input-value`.

```ts
import { inputValueToEquation, inputValueToExpression } from '@step-wise/cas'

const expression = inputValueToExpression(expressionInputValue)
const equation = inputValueToEquation(equationInputValue)
```

Expressions and equations can be printed as strings, LaTeX or math input values.

```ts
expression.str
expression.tex
expression.toInputValue()
```


## Storage and serialization

A storage value contains the data needed to recreate an object when its type is already known. It intentionally does not include the object type or surrounding serialization context.

```ts
import { Expression } from '@step-wise/cas'

const stored = expression.toStorageValue()
const restored = Expression.fromStorageValue(stored, expression.settings)
```

Full serialization also records type information and may carry context such as shared settings. Serialization is integrated with [`@step-wise/serialization`](https://www.npmjs.com/package/@step-wise/serialization).


## TypeScript

The package is written in TypeScript and exports the public types used by its APIs, including expression and equation inputs, settings, storage values, comparison options, simplification options and preprocessors.

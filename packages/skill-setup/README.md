# @step-wise/skill-setup

Describe which skills a learner needs to apply to complete an exercise or perform a larger skill. Setups can be combined, inspected, serialized, and converted into success-probability polynomials.


## Installation

```bash
npm install @step-wise/skill-setup
```


## Quick start

```ts
import { and, or, part, repeat } from '@step-wise/skill-setup'

const setup = and(
	'addition',
	or('multiplication', 'division'),
	part('subtraction', 0.75),
	repeat('checkAnswer', 2),
)

setup.getSkillList()
// ['addition', 'multiplication', 'division', 'subtraction', 'checkAnswer']

setup.toString()
// 'and("addition", or("multiplication", "division"), part("subtraction", 0.75), repeat("checkAnswer", 2))'

setup.isDeterministic()
// false
```


## Deterministic and stochastic setups

A setup describes which underlying skills are required to accomplish a task.

A **deterministic setup** (as used for exercises) always requires the same skills. For example, `and('addition', 'multiplication')` always requires both skills. Its eventual outcome may still be correct or incorrect, but the structure of the task is fixed.

A **stochastic setup** (as commonly used for skills) randomly determines part of that structure. For example, `pick(['addition', 'subtraction'])` chooses one of the two skills, while `part('checkAnswer', 0.5)` includes a check in half of the generated cases.

Call `setup.isDeterministic()` to distinguish the two.


## Building setups

### `skill(id)`

Creates a setup for one skill. Most APIs accept the identifier directly, so this factory is mainly useful when a standalone setup object is needed.

```ts
import { skill } from '@step-wise/skill-setup'

const setup = skill('addition')
```

Identifiers must be non-empty strings and may not consist only of whitespace.

### `and(...setups)`

Requires every child setup to succeed.

```ts
const setup = and('addition', 'multiplication')
```

If the success probabilities are `a` and `m`, the combined probability is `a * m`.

### `or(...setups)`

Succeeds when at least one child setup succeeds.

```ts
const setup = or('factorization', 'quadraticFormula')
```

For child probabilities `a` and `b`, the combined probability is `1 - (1 - a) * (1 - b)`.

Both `and` and `or` require at least one child.

### `repeat(setup, count)`

Requires the same setup repeatedly. The count must be a positive integer.

```ts
const setup = repeat('addition', 3)
// Equivalent probability model to and('addition', 'addition', 'addition')
```

### `pick(setups, count?, weights?)`

Selects a subset and requires every selected setup. The count defaults to `1` and may range from `1` through the number of supplied setups.

```ts
const setup = pick(
	['addition', 'subtraction', 'multiplication'],
	2,
	[1, 1, 2],
)
```

Weights must be positive finite numbers. A subset's probability is proportional to the product of the weights of its selected items. In the example, subsets containing `multiplication` have twice the weight of the subset containing only `addition` and `subtraction`.

When every supplied setup is selected, `pick` is equivalent to `and` and is deterministic if all its children are deterministic.

### `part(setup, probability?)`

Includes a setup with the given probability, which defaults to `0.5`. The probability must be between `0` and `1`, inclusive.

`part` must be used as a direct child of `and` or `or`, because its meaning depends on its parent:

```ts
and('addition', part('multiplication', 0.6))
// 60% require both skills; 40% require only addition.

or('addition', part('multiplication', 0.6))
// Multiplication is offered as an alternative in 60% of cases.
```

Calling `getPolynomial()` directly on an unparented `part` setup throws an error.


## Inspecting a setup

Every factory returns a `SkillSetup` with the following public methods:

- `getSkillList()` returns unique skill identifiers in encounter order.
- `getSkillSet()` returns the same identifiers as a `Set`.
- `isDeterministic()` reports whether the required structure contains randomness.
- `toString()` returns a readable expression using the public factory syntax.
- `getPolynomial()` returns `{ coefficients, variables }` for calculating the combined success probability. See the [@step-wise/polynomials](https://www.npmjs.com/package/@step-wise/polynomials) package for further polynomial functions.
- `getPolynomialCoefficients()` returns only the coefficient structure.
- `getPolynomialString()` returns a readable form of the probability polynomial.
- `serialize()` returns the setup's plain-data representation.

For example:

```ts
const setup = and('addition', repeat('multiplication', 2))

setup.getPolynomialString()
// 'addition*multiplication^2'

setup.getPolynomial()
// {
//   coefficients: [
//     [0, 0, 0],
//     [0, 0, 1],
//   ],
//   variables: ['addition', 'multiplication'],
// }
```

The coefficient axes follow the order in `variables`; an index along an axis is the exponent of that variable. Consumers that need to evaluate or manipulate the result can use `@step-wise/polynomials`.


## Serialization

Use `serializeSetup` and `deserializeSetup` at storage or network boundaries:

```ts
import {
	and,
	deserializeSetup,
	repeat,
	serializeSetup,
} from '@step-wise/skill-setup'

const setup = and('addition', repeat('multiplication', 2))
const stored = serializeSetup(setup)

// Store as JSON if desired.
const json = JSON.stringify(stored)
const restored = deserializeSetup(JSON.parse(json))

restored.toString()
// 'and("addition", repeat("multiplication", 2))'
```

Serialized setups use stable type identifiers. Default `pick` and `part` options are omitted to keep the result compact. `deserializeSetup('addition')` is also supported as shorthand for a serialized single skill. Invalid serialized structures throw rather than creating partially valid setups.

TypeScript users can import types `SerializedSkillSetup` and `SkillSetupStorageValue` when defining storage interfaces.


## Factory object

All factories are also available through `setupFactories`. This is useful when passing the complete factory collection to another module:

```ts
import { setupFactories } from '@step-wise/skill-setup'

const setup = setupFactories.and('addition', setupFactories.repeat('multiplication', 2))
```

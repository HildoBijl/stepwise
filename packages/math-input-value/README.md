# @step-wise/math-input-value

Represent editable mathematical expressions and equations as a mixture of plain text and structured visual constructs.

The representation is deliberately less rigid than a mathematical expression tree. Ordinary input such as `2x+sin(y)` remains editable text, while fractions, roots, scripts and accents become structured values that a visual math input can render and edit recursively.

For mathematical interpretation and algebra operations, [@step-wise/cas](https://www.npmjs.com/package/@step-wise/cas) expands this input-value toolbox with expressions, equations, simplification, comparison and other algebra functionality.


## Installation

```bash
npm install @step-wise/math-input-value
```


## Quick start

```ts
import { parseExpressionInputValue } from '@step-wise/math-input-value'

const input = parseExpressionInputValue('2+x/(3+sqrt(y))')
```

This produces an editable expression input value:

```ts
{
	type: 'Expression',
	value: [
		'2+',
		{
			type: 'Fraction',
			alias: '/',
			numerator: ['x'],
			denominator: [
				'3+',
				{
					type: 'SquareRoot',
					alias: 'sqrt(',
					radicand: ['y'],
				},
				'',
			],
		},
		'',
	],
}
```

Use `parseEquationInputValue` when the top-level value represents an equation:

```ts
import { parseEquationInputValue } from '@step-wise/math-input-value'

parseEquationInputValue('x/2=3')
```

The equation parser creates an editable `EquationInputValue`; interpreting the equality and validating that it contains exactly one equals sign are responsibilities of [@step-wise/cas](https://www.npmjs.com/package/@step-wise/cas).


## Input-value structure

An `ExpressionInputValue` or `EquationInputValue` contains an `ExpressionValue`: a non-empty array that starts and ends with a text part. Text and constructs alternate naturally, although adjacent text parts can temporarily occur and can be normalized with `mergeAdjacentTextParts`.

```ts
type ExpressionValue = InputValuePart[]
type InputValuePart = string | ConstructInputValue | AccentInputValue
```

The package supports these structured parts:

- `Fraction` contains `numerator` and `denominator` expression values.
- `SquareRoot` contains a `radicand` expression value.
- `Root` contains `degree` and `radicand` expression values.
- `Logarithm` contains a `base`. Its argument remains in the following text because the construct opens an external bracket group.
- `SubSup` contains an optional plain-text `subscript`, an optional expression-value `superscript`, or both.
- `Accent` contains the accent `name` (`dot` or `hat`) and a plain-text `value`.

Nested expression fields are arrays directly; they do not have another `Expression` wrapper or their own settings. An optional `alias` records the source text that created a construct, allowing an editor to turn it back into text later.

The structure can represent incomplete editing states. For example, a newly inserted fraction can temporarily have an empty numerator or denominator. Consumers that need a valid mathematical domain value should perform that stricter validation during interpretation.


## Parsing syntax

Parsing removes whitespace and recognizes visual syntax including:

```ts
parseExpressionInputValue('x/y')        // Fraction
parseExpressionInputValue('sqrt(x)')    // SquareRoot
parseExpressionInputValue('root[3](x)') // Root with degree 3
parseExpressionInputValue('root(x)')    // Root with default degree 2
parseExpressionInputValue('log[2](x)')  // Logarithm with base 2
parseExpressionInputValue('log(x)')     // Logarithm with default base 10
parseExpressionInputValue('x_1^2')      // SubSup
parseExpressionInputValue('hat(x)')     // Accent
```

Unknown text functions such as `sin(x)` remain text. This lets a learner change the function name without first dismantling a rigid expression-tree node.

Parsing runs functions and accents first, then scripts, then fractions. Fraction operands extend to factor boundaries: explicit operators delimit an operand, while grouped or adjacent input can remain part of it. Parentheses surrounding a complete numerator or denominator are removed from that operand.

Round and square brackets must match by type. Missing, extra and mismatched brackets throw an `InterpretationError`. Empty subscripts and superscripts also throw instead of creating malformed script constructs.


## Creating and inspecting values

Values can also be created without parsing:

```ts
import {
	createEmptyExpressionInputValue,
	createExpressionInputValue,
	createExpressionInputValueFromText,
	isExpressionInputValue,
} from '@step-wise/math-input-value'

createEmptyExpressionInputValue() // { type: 'Expression', value: [''] }
createExpressionInputValueFromText('2x+1') // { type: 'Expression', value: ['2x+1'] }
const input = createExpressionInputValue(['x']) isExpressionInputValue(input) // true
```

`createExpressionInputValue` and `createEquationInputValue` reject structurally invalid expression arrays. Runtime predicates are available for every relevant level:

- `isExpressionInputValue` and `isEquationInputValue`
- `isExpressionValue`
- `isInputValuePart`
- `isConstructInputValue`
- `isAccentInputValue`
- `isTextPart`

Validation is recursive. It rejects malformed required fields, sparse arrays and circular structures.


## Settings

Interpretation settings describe how later mathematical interpretation should understand otherwise ambiguous text:

```ts
const defaultInterpretationSettings = {
	interpretEAsConstant: true,
	recognizeLogarithms: true,
	recognizeTrigonometricFunctions: true,
	allowMultiCharacterVariables: false,
}
```

Expression settings describe the meaning of an interpreted expression:

```ts
const defaultExpressionSettings = {
	angleUnit: 'radians',
}
```

Pass partial settings while parsing or creating a wrapper:

```ts
const input = parseExpressionInputValue(
	'sin(90)',
	{ recognizeTrigonometricFunctions: true },
	{ angleUnit: 'degrees' },
)
```

Only non-default settings are stored on the input value. Use `resolveInterpretationSettings` and `resolveExpressionSettings` to merge stored options with the current defaults.


## Cursors and input states

An `ExpressionCursor` recursively identifies the active location in an expression. It first selects an array part and then either stores a numeric offset into a text part or enters a construct field:

```ts
const cursor = {
	part: 1,
	cursor: {
		part: 'denominator',
		cursor: { part: 0, cursor: 2 },
	},
}
```

Combining an input value with a cursor gives an `ExpressionInputState` or `EquationInputState`. Cursor state is intended for the active editor and is normally removed before persistence.

An `ExpressionTextCursor` is the non-recursive subset used by parsing and array-manipulation helpers. The package provides:

- `getExpressionStartCursor` and `getExpressionEndCursor`
- `shiftExpressionTextCursorLeft` and `shiftExpressionTextCursorRight`
- `areExpressionTextCursorsEqual`
- `sliceExpressionValue`

Cursor helpers validate non-negative integer indexes and offsets. `sliceExpressionValue` additionally checks that its cursors point to valid text parts and occur in the correct order.


## Expression-value utilities

- `createEmptyExpressionValue` returns the canonical empty value `['']`.
- `isEmptyExpressionValue` recognizes that canonical empty value.
- `mergeAdjacentTextParts` joins neighboring strings and restores required text boundaries.
- `sliceExpressionValue` extracts a range while preserving any constructs within it.

Definition exports such as `constructDefinitions`, `constructTypes`, `accentNames`, `getConstructTypeByAlias` and `opensExternalBracketGroup` describe the constructs understood by the parser and editor.


## TypeScript

The package exports the complete input-value, construct, cursor, state and settings types. All values are plain objects, arrays and strings, making them suitable for application state and storage without class-instance serialization.

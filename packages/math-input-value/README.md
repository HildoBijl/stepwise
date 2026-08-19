# Math Input Value

The `math-input-value` toolbox supports the input of mathematical expressions and equations. Inputting mathematical equations is always tricky:
- You don't just want to input plain text. Imagine writing `2/(x+3/(y+6))`. It's hard tracking brackets. (And this is only small.) A visual interface would be nice!
- A visual interface that immediately access the expression tree is not ideal. For new students this is confusing, and it also doesn't allow one to for instance write `sin(x)`, turn `sin` into `cos`, and then edit further.
To solve all this, the `math-input-value` package has built a middle-ground: keep text where possible, but also provide display tools for visual elements like fractions, roots, etcetera.

## The format of a math-input-value object

A typical `math-input-value` object, for instance to display `2+x/(3+5sin(x))`, looks like this:

```
{
	"type": "Expression",
	"value": [
		"2+",
		{
			"type": "Fraction",
			"alias": "/",
			"numerator": ["x"],
			"denominator": ["3+5sin(x)"]
		},
		""
	]
}
```

Everything is a plain object or string, for easy storage. At the top, the type is `Expression` or `Equation`. Its `value` is an expression array that starts and ends with a string. Strings contain the text the user can edit directly. Objects represent constructs that require special visual editing:

- `Fraction` has a `numerator` and `denominator` expression array.
- `SquareRoot` has a `radicand` expression array.
- `Root` has `degree` and `radicand` expression arrays.
- `Logarithm` has a `base` expression array. It opens an external bracket group, so its ordinary argument remains in the text following the construct.
- `SubSup` has an optional plain-text `subscript` and an optional expression-array `superscript`.
- `Accent` has a typed accent `name` and a plain-text `value`.

Construct expression fields contain expression arrays directly, without nested `Expression` wrappers or their own settings. An optional `alias` remembers the text that created a construct so the frontend can restore that text if the construct is destroyed.

That's *all*! Everything else (like `sin(x)` or `ln(x)`) is simply kept as plain text, since they don't require special displays.

While editing, an `Expression` can also be combined with a recursive cursor. Cursor state is not part of the stored `math-input-value`; it is removed before persistence and restored when the input is hydrated.

## Toolbox contents

This toolbox concerns itself with describing a `math-input-value` and supporting its definition and manipulation. This is done through the following folders.

- [settings](./src/settings/) defines a few default settings. This includes:
  - `InterpretationSettings`: How should we interpret something? For instance, does `f(x+2)` mean multiplication `f*(x+2)` or do we have custom functions in our expression? And is `xy` the multiplication `x*y` or can we also have variables with longer names?
	- `ExpressionSettings`: What does an already interpreted expression mean? For instance, if we use degrees, then `sin(90)` gives another value than if we use radians.
- [types](./src/types/): Defines in Typescript what an `ExpressionInputValue` object looks like.
- [utils](./src/utils/): Provides various utility functions for manipulating the input value. Think of making adjustments, moving the cursor around, etcetera.
- [definitions](./src/definitions/): Defines what functions and accents exist and what properties they have.
- [parsing](./src/parsing/): Turn a string into a `math-input-value`. An important note for parsing is the operations order. Implicit multiplication is pulled into fractions, while explicit multiplication is kept outside of fractions. So `a*b/c*d` is formatted as `"a*",fraction("b","c"),"*d"`. However, `x*ab/cd*y` is taken as `"x*",fraction("ab","cd"),"*y"`. This rule is necessary in order to for instance properly interpret `sin(x)/cos(x)`.

Browse through the respective folders and files to see how it all works behind the scenes.

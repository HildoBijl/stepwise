# Math Input Value

The `Math-Input-Value` toolbox supports the input of mathematical expressions and equations. Inputting mathematical equations is always tricky:
- You don't just want to input plain text. Imagine writing `2/(x+3/(y+6))`. It's hard tracking brackets. (And this is only small.) A visual interface would be nice!
- A visual interface that immediately access the expression tree is not ideal. For new students this is confusing, and it also doesn't allow one to for instance write `sin(x)`, turn `sin` into `cos`, and then edit further.
To solve all this, the `Math-Input-Value` package has built a middle-ground: keep text where possible, but also provide display tools for visual elements like fractions, roots, etcetera.


## The format of a Math-Input-Value object

A typical `Math-Input-Value` object, for instance to display `2+(x/(3+5sin(x+[cursor])))`, would look like this.

```
{
	"type": "Expression",
	"value": [
		{
			"type": "ExpressionPart",
			"value": "2+"
			}, {
				"type": "Function",
				"name": "frac",
				"value": [
					{
						"type": "Expression",
						"value": [ { "type": "ExpressionPart", "value": "x" } ]
					}, {
						"type": "Expression",
						"value": [ { "type": "ExpressionPart", "value": "3+5sin(x+)" } ]
					}
				]
			}, {
				"type": "ExpressionPart",
				"value": ""
			}
		],
	"settings": {},
	"cursor": { "part": 1, "cursor": { "part": 1, "cursor": { "part": 0, "cursor": 9 } } }
}
```

Everything is a plain object, for easy storage. At the top, the type is `Expression`. Its value always is an array that starts an end with an `ExpressionPart` type. There can also be various other types.

- `ExpressionPart` can be seen as "plain text" where the user can type in.
- `Function` is some kind of special function with adjusted display options. There are only five possible types.
  - `Fraction` (name: `frac`): a fraction with a numerator and a denominator. Will be displayed with a dividing line.
	- `Subscript/Superscript` (name `subSup`): subscripts and superscripts for whatever comes before it. Subscripts can only have regular text and no further functions. Superscripts can have further functions.
	- `Logarithm` (name `log`): a logarithm component in which the user can also adjust the logarithm base. It ends with an opening fraction, and whatever comes after is plain text in an `ExpressionPart`.
	- `Sqrt` (name `sqrt`): a square too component that will be displayed through the root symbol. The user can adjust the radicand inside of it.
	- `Root` (name `root`): similar to the `Sqrt` component, but now the user can also change the root degree.
- `Accent` is an accent that can be placed over a variable. Think of `hat(x)` or `dot(x)`. Within an accent, only plain text can be written.

That's *all*! Everything else (like `sin(x)` or `ln(x)`) is simply kept as plain text, since they don't require special displays.

An `Expression` object can also have a `cursor`. This cursor recursively describes its position within the `Math-Input-Value`. Generally, when the `Math-Input-Value` is stored, it is normalized which removes the cursor. Then, when data is loaded from the database, a default cursor (either at the start or at the end) can be requested, adding it in the hydration step.


## Toolbox contents

This toolbox concerns itself with describing a `Math-Input-Value` and supporting its definition and manipulation. This is done through the following folders.

- [settings](./src/settings/) defines a few default settings. This includes:
  - `InterpretationSettings`: How should we interpret something? For instance, does `f(x+2)` mean multiplication `f*(x+2)` or do we have custom functions in our expression? And is `xy` the multiplication `x*y` or can we also have variables with longer names?
	- `ExpressionSettings`: What does an already interpreted expression mean? For instance, if we use degrees, then `sin(90)` gives another value than if we use radians.
- [types](./src/types/): Defines in Typescript what an `ExpressionInputValue` object looks like.
- [utils](./src/utils/): Provides various utility functions for manipulating the input value. Think of making adjustments, moving the cursor around, etcetera.
- [definitions](./src/definitions/): Defines what functions and accents exist and what properties they have.
- [parsing](./src/parsing/): Turn a string into a `Math-Input-Value`. An important note for parsing is the operations order. Implicit multiplication is pulled into fractions, while explicit multiplication is kept outside of fractions. So `a*b/c*d` is formatted as `"a*",fraction("b","c"),"*d"`. However, `x*ab/cd*y` is taken as `"x*",fraction("ab","cd"),"*y"`. This rule is necessary in order to for instance properly interpret `sin(x)/cos(x)`.

Browse through the respective folders and files to see how it all works behind the scenes.
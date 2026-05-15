# CAS Simplification

This folder has all the tools used to simplify expressions. Let's study how it works.


## Entry point: the simplify function

To simplify an expression, call:

- For a `node`: `simplify(node, expressionSettings, simplificationOptions)`.
- For an `Expression` object: `exp.simplify(simplificationOptions)`.

All that's left to do is specify the `simplificationOptions`.


## Simplification options

The `simplificationOptions` attribute is a `Set` of strings that describe what kind of rewrites to do. (It can also be given as array, in which case it's transformed to a set.) Example of options include:

- `flattenSums`: Turn `x+(y+z)` into `x+y+z`.
- `removeZeroesFromSums`: Remove `+0` from sums.
- `mergeSumNumbers`: Group numbers in sums. So `2+3*x+4` becomes `6+3*x`.

There are far more options. For a full overview, see [allSimplificationOptions.ts](./simplificationOptions/allSimplificationOptions.ts). Each simplification option has a corresponding simplification rule (a function) within the [rules](./rules/) folder.


# Presets

It is very tedious to specify exactly which simplification options to apply every single time. That's why they are grouped together in `presets`. There are the following presets:

- `removeTrivial`: get rid of pointless brackets, 0s or 1s in your expression.
- `mergeNumbers`: reduce a numeric calculation like `2 + 3`, `2*3`, `2^3` or `sqrt(4)` to a single number.
- `cancel` (includes `removeTrivial` and `mergeNumbers`): cancel terms/factors/operations that instantly undo each other, like `x - x`, `x/x` or `sqrt(x)^2`.
- `combine` (includes `cancel`): group terms/factors together where possible. So `2x+3x` becomes `5x` and `x^5/x^2` becomes `x^3`.
- `expand` (includes `combine`): expand brackets where possible. This includes expanding `2(x+3)`, `(x+3)^2` and `(3x)^2`.
- `sort`: sorts sums and products.
- `normalize` (includes `expand` and `sort`): bring an expression to one consistent format, for as much as possible. This for instance reduces `(x-5)/(2-y)` to `-(x-5)/(y-2)`.
- `factorize` (includes `removeTrivial`): try to pull out as many factors from sums, numbers and products as possible. Turns `12x^2+24x` into `2^2*3*x*(x+2)`.
- `format` (includes `removeTrivial`, `mergeNumbers` and `sort`): make some adjustments that make expressions cleaner to display. Think of turning `x^(1/2)` into `sqrt(x)` and `1/sqrt(2)` into `sqrt(2)/2`.

Within the `Expression` wrapper, each preset has its own function that makes it easy to directly apply.

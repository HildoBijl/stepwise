# Interpretation pipeline

The interpreter turns an `ExpressionInputValue` from [`@step-wise/math-input-value`](https://www.npmjs.com/package/@step-wise/math-input-value) into an `ExpressionNode`. String inputs first pass through that package and then enter the same node interpretation pipeline.


## Boundaries and settings

Math input values are editable, temporary representations and may contain partially completed constructs. The CAS interpretation boundary is stricter: it must produce complete domain nodes or throw an explicit input error.

Interpretation settings determine how symbols and constructs are understood. Expression settings are resolved alongside the tree because later evaluation and semantic operations still need them. Interpretation settings themselves are discarded once the node tree exists.


## Ordered steps

Interpretation proceeds from low-precedence outer structure toward increasingly local constructs:

1. Match brackets and recursively interpret their contents.
2. Split sums at top-level plus, minus and plus-minus signs.
3. Split explicit and implicit products.
4. Interpret remaining strings as numeric tokens, named constants and variables.
5. Convert constructs such as fractions, roots, superscripts, subscripts, accents and functions into their node counterparts.

Each recursive call resumes at the appropriate step. Earlier structure must not be reconsidered in a way that changes precedence.


## Ambiguity and validation

Bracket matching tracks bracket type. A closing bracket of the wrong type leaves the opening bracket unmatched and produces the corresponding error.

Numeric strings use one shared grammar. A value accepted as numeric input must either produce a valid numeric node or throw; malformed numeric-looking tokens must not fall through and become variables.

Variable subscripts may contain underscores, but output must bracket such subscripts so the representation remains unambiguous. Interpretation and printing should be treated as a round trip when changing this grammar.


## Adding an input construct

When adding a construct:

1. Add or update its math-input-value type and guard in the owning package.
2. Interpret it in the appropriate step without weakening validation of other constructs.
3. Add the inverse conversion in `export/printing/toInputValue`.
4. Add focused interpretation tests.
5. Add string and input-value round-trip cases under `core/tests/integration/interpretation`.

Round-trip tests are important because a representation can parse correctly while still printing ambiguously.

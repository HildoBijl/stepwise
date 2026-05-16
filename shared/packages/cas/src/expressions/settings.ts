// Interpretation settings
export { type InterpretationSettings, defaultInterpretationSettings } from '@step-wise/math-input-value'

// Expression settings
export { type ExpressionSettings, defaultExpressionSettings } from '@step-wise/math-input-value'

// Structural comparison
export { type ComparisonSettings, defaultComparisonSettings, strictComparisonSettings } from '../core'

// Simplification
export { type SimplificationOption, SimplificationOptions, SimplificationOptionsInput, allSimplificationOptions } from '../core'
export { removeTrivial, mergeNumbers, cancel, combine, expand, expandOnlyWithinSums, sort, normalize, factorize, format } from '../core'

// Printing
export type { TexDisplayOptions } from '../core'

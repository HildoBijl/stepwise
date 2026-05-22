// Interpretation settings
export { type InterpretationSettings, type InterpretationSettingsInput, defaultInterpretationSettings, asInterpretationSettings } from '@step-wise/math-input-value'

// Expression settings
export { type ExpressionSettings, type ExpressionSettingsInput, defaultExpressionSettings, asExpressionSettings } from '@step-wise/math-input-value'

// Input value
export { type ExpressionInputValue } from '@step-wise/math-input-value'

// Structural comparison
export { type ExpressionComparisonSettings, type ExpressionComparisonSettingsInput, defaultExpressionComparisonSettings, asExpressionComparisonSettings, strictExpressionComparisonSettings, asStrictExpressionComparisonSettings } from '../core'

// Simplification
export { type SimplificationOption, SimplificationOptions, SimplificationOptionsInput, allSimplificationOptions } from '../core'
export { removeTrivial, mergeNumbers, cancel, combine, expand, expandOnlyWithinSums, sort, normalize, factorize, format } from '../core'

// Printing
export type { TexDisplayOptions, TexDisplayOptionsInput, defaultTexDisplayOptions, asTexDisplayOptions } from '../core'

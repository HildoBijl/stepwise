import { defineRuleRegistry } from '../ruleDefinition'

import { sortSums } from './sortSums'
import { sortProducts } from './sortProducts'
import { applyPolynomialCancellation } from './applyPolynomialCancellation'
import { normalizeFractionMinuses } from './normalizeFractionMinuses'
import { preventRootDenominators } from './preventRootDenominators'

export const normalizationRules = defineRuleRegistry(sortSums, sortProducts, applyPolynomialCancellation, normalizeFractionMinuses, preventRootDenominators)
export { sortSums, sortProducts, applyPolynomialCancellation, normalizeFractionMinuses, preventRootDenominators }
export { normalizationRequirementRules } from './normalizationRequirements'

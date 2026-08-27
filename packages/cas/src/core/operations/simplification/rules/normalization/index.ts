import { defineRuleRegistry } from '../ruleDefinition'

import { sortSums } from './sortSums'
import { sortProducts } from './sortProducts'
import { cancelPolynomialFactors } from './cancelPolynomialFactors'
import { normalizeFractionSigns } from './normalizeFractionSigns'
import { rationalizeRootDenominators } from './rationalizeRootDenominators'

export const normalizationRules = defineRuleRegistry(sortSums, sortProducts, cancelPolynomialFactors, normalizeFractionSigns, rationalizeRootDenominators)
export { sortSums, sortProducts, cancelPolynomialFactors, normalizeFractionSigns, rationalizeRootDenominators }
export { normalizationRequirementRules } from './normalizationRequirements'

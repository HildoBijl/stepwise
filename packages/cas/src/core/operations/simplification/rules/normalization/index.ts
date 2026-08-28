import { defineRuleRegistry } from '../ruleDefinition.ts'

import { sortSums } from './sortSums.ts'
import { sortProducts } from './sortProducts.ts'
import { cancelPolynomialFactors } from './cancelPolynomialFactors.ts'
import { normalizeFractionSigns } from './normalizeFractionSigns.ts'
import { rationalizeRootDenominators } from './rationalizeRootDenominators.ts'

export const normalizationRules = defineRuleRegistry(sortSums, sortProducts, cancelPolynomialFactors, normalizeFractionSigns, rationalizeRootDenominators)
export { sortSums, sortProducts, cancelPolynomialFactors, normalizeFractionSigns, rationalizeRootDenominators }
export { normalizationRequirementRules } from './normalizationRequirements.ts'

import { defineRuleRegistry } from '../ruleDefinition.ts'

import { factorizeIntegers } from './factorizeIntegers.ts'
import { factorCommonNumericTerms } from './factorCommonNumericTerms.ts'
import { factorCommonFactors } from './factorCommonFactors.ts'
import { extractFactorsFromRoots } from './extractFactorsFromRoots.ts'

export const factorizationRules = defineRuleRegistry(factorizeIntegers, factorCommonNumericTerms, factorCommonFactors, extractFactorsFromRoots)
export { factorizeIntegers, factorCommonNumericTerms, factorCommonFactors, extractFactorsFromRoots }

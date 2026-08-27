import { defineRuleRegistry } from '../ruleDefinition'

import { factorizeIntegers } from './factorizeIntegers'
import { factorCommonNumericTerms } from './factorCommonNumericTerms'
import { factorCommonFactors } from './factorCommonFactors'
import { extractFactorsFromRoots } from './extractFactorsFromRoots'

export const factorizationRules = defineRuleRegistry(factorizeIntegers, factorCommonNumericTerms, factorCommonFactors, extractFactorsFromRoots)
export { factorizeIntegers, factorCommonNumericTerms, factorCommonFactors, extractFactorsFromRoots }

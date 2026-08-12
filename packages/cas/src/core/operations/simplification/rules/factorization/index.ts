import { defineRuleRegistry } from '../ruleDefinition'

import { factorizeIntegers } from './factorizeIntegers'
import { pullOutCommonSumNumbers } from './pullOutCommonSumNumbers'
import { pullOutCommonSumFactors } from './pullOutCommonSumFactors'
import { pullFactorsOutOfRoots } from './pullFactorsOutOfRoots'

export const factorizationRules = defineRuleRegistry(factorizeIntegers, pullOutCommonSumNumbers, pullOutCommonSumFactors, pullFactorsOutOfRoots)
export { factorizeIntegers, pullOutCommonSumNumbers, pullOutCommonSumFactors, pullFactorsOutOfRoots }

import { defineRuleRegistry } from '../ruleDefinition'

import { groupSumTerms } from './groupSumTerms'
import { mergeProductFactors } from './mergeProductFactors'
import { mergeFractionProducts } from './mergeFractionProducts'
import { mergeNumericFractionSums } from './mergeNumericFractionSums'
import { mergeFractionSums } from './mergeFractionSums'
import { mergeFractionFactors } from './mergeFractionFactors'
import { mergeProductsOfRoots } from './mergeProductsOfRoots'
import { mergeProductsWithRoots } from './mergeProductsWithRoots'
import { pullExponentsIntoRoots } from './pullExponentsIntoRoots'

export const combinationRules = defineRuleRegistry(groupSumTerms, mergeProductFactors, mergeFractionProducts, mergeNumericFractionSums, mergeFractionSums, mergeFractionFactors, mergeProductsOfRoots, mergeProductsWithRoots, pullExponentsIntoRoots)
export { groupSumTerms, mergeProductFactors, mergeFractionProducts, mergeNumericFractionSums, mergeFractionFactors, mergeFractionSums, mergeProductsOfRoots, mergeProductsWithRoots, pullExponentsIntoRoots }

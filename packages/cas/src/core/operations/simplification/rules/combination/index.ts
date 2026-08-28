import { defineRuleRegistry } from '../ruleDefinition.ts'

import { combineLikeTerms } from './combineLikeTerms.ts'
import { combineLikeFactors } from './combineLikeFactors.ts'
import { combineProductFractions } from './combineProductFractions.ts'
import { combineNumericFractionsInSums } from './combineNumericFractionsInSums.ts'
import { combineSumFractions } from './combineSumFractions.ts'
import { combineFractionFactors } from './combineFractionFactors.ts'
import { combineRootsInProducts } from './combineRootsInProducts.ts'
import { combineProductsWithRoots } from './combineProductsWithRoots.ts'
import { moveExponentsIntoRoots } from './moveExponentsIntoRoots.ts'

export const combinationRules = defineRuleRegistry(combineLikeTerms, combineLikeFactors, combineProductFractions, combineNumericFractionsInSums, combineSumFractions, combineFractionFactors, combineRootsInProducts, combineProductsWithRoots, moveExponentsIntoRoots)
export { combineLikeTerms, combineLikeFactors, combineProductFractions, combineNumericFractionsInSums, combineFractionFactors, combineSumFractions, combineRootsInProducts, combineProductsWithRoots, moveExponentsIntoRoots }

import { defineRuleRegistry } from '../ruleDefinition'

import { combineLikeTerms } from './combineLikeTerms'
import { combineLikeFactors } from './combineLikeFactors'
import { combineProductFractions } from './combineProductFractions'
import { combineNumericFractionsInSums } from './combineNumericFractionsInSums'
import { combineSumFractions } from './combineSumFractions'
import { combineFractionFactors } from './combineFractionFactors'
import { combineRootsInProducts } from './combineRootsInProducts'
import { combineProductsWithRoots } from './combineProductsWithRoots'
import { moveExponentsIntoRoots } from './moveExponentsIntoRoots'

export const combinationRules = defineRuleRegistry(combineLikeTerms, combineLikeFactors, combineProductFractions, combineNumericFractionsInSums, combineSumFractions, combineFractionFactors, combineRootsInProducts, combineProductsWithRoots, moveExponentsIntoRoots)
export { combineLikeTerms, combineLikeFactors, combineProductFractions, combineNumericFractionsInSums, combineFractionFactors, combineSumFractions, combineRootsInProducts, combineProductsWithRoots, moveExponentsIntoRoots }

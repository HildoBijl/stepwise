import { defineRuleRegistry } from '../ruleDefinition'

import { rewriteNegativePowersAsFractions } from './rewriteNegativePowersAsFractions'
import { flattenFractions } from './flattenFractions'
import { flattenNestedPowers } from './flattenNestedPowers'
import { rewriteRootsAsFractionalPowers } from './rewriteRootsAsFractionalPowers'
import { rewriteFractionalPowersAsRoots } from './rewriteFractionalPowersAsRoots'
import { rewriteSquareRootsAsSqrts } from './rewriteSquareRootsAsSqrts'
import { rewriteSqrtsAsSquareRoots } from './rewriteSqrtsAsSquareRoots'

export const rewritingRules = defineRuleRegistry(rewriteNegativePowersAsFractions, flattenFractions, flattenNestedPowers, rewriteRootsAsFractionalPowers, rewriteFractionalPowersAsRoots, rewriteSquareRootsAsSqrts, rewriteSqrtsAsSquareRoots)
export { rewriteNegativePowersAsFractions, flattenFractions, flattenNestedPowers, rewriteRootsAsFractionalPowers, rewriteFractionalPowersAsRoots, rewriteSquareRootsAsSqrts, rewriteSqrtsAsSquareRoots }

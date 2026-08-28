import { defineRuleRegistry } from '../ruleDefinition.ts'

import { rewriteNegativePowersAsFractions } from './rewriteNegativePowersAsFractions.ts'
import { flattenFractions } from './flattenFractions.ts'
import { flattenNestedPowers } from './flattenNestedPowers.ts'
import { rewriteRootsAsFractionalPowers } from './rewriteRootsAsFractionalPowers.ts'
import { rewriteFractionalPowersAsRoots } from './rewriteFractionalPowersAsRoots.ts'
import { rewriteSquareRootsAsSqrts } from './rewriteSquareRootsAsSqrts.ts'
import { rewriteSqrtsAsSquareRoots } from './rewriteSqrtsAsSquareRoots.ts'

export const rewritingRules = defineRuleRegistry(rewriteNegativePowersAsFractions, flattenFractions, flattenNestedPowers, rewriteRootsAsFractionalPowers, rewriteFractionalPowersAsRoots, rewriteSquareRootsAsSqrts, rewriteSqrtsAsSquareRoots)
export { rewriteNegativePowersAsFractions, flattenFractions, flattenNestedPowers, rewriteRootsAsFractionalPowers, rewriteFractionalPowersAsRoots, rewriteSquareRootsAsSqrts, rewriteSqrtsAsSquareRoots }

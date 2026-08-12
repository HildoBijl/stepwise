import { defineRuleRegistry } from '../ruleDefinition'

import { convertNegativePowers } from './convertNegativePowers'
import { flattenFractions } from './flattenFractions'
import { removePowersWithinPowers } from './removePowersWithinPowers'
import { turnRootsIntoFractionExponents } from './turnRootsIntoFractionExponents'
import { turnFractionExponentsIntoRoots } from './turnFractionExponentsIntoRoots'
import { turnDegreeTwoRootsIntoSqrts } from './turnDegreeTwoRootsIntoSqrts'
import { turnSqrtsIntoDegreeTwoRoots } from './turnSqrtsIntoDegreeTwoRoots'

export const rewritingRules = defineRuleRegistry(convertNegativePowers, flattenFractions, removePowersWithinPowers, turnRootsIntoFractionExponents, turnFractionExponentsIntoRoots, turnDegreeTwoRootsIntoSqrts, turnSqrtsIntoDegreeTwoRoots)
export { convertNegativePowers, flattenFractions, removePowersWithinPowers, turnRootsIntoFractionExponents, turnFractionExponentsIntoRoots, turnDegreeTwoRootsIntoSqrts, turnSqrtsIntoDegreeTwoRoots }

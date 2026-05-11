import { type ExpressionNode } from '../../../../construction'

import { isPower, isSum } from '../../../structural'

import { type SimplificationContext } from '../../definitions'

import { removeZeroExponentFromPowers } from './removeZeroExponentFromPowers'
import { removeZeroBaseFromPowers } from './removeZeroBaseFromPowers'
import { removeOneExponentFromPowers } from './removeOneExponentFromPowers'
import { removeOneBaseFromPowers } from './removeOneBaseFromPowers'
import { mergePowerMinuses } from './mergePowerMinuses'
import { mergePowerNumbers } from './mergePowerNumbers'
import { removePowersWithinPowers } from './removePowersWithinPowers'
import { removeNegativePowers } from './removeNegativePowers'
import { expandPowers } from './expandPowers'
import { expandPowersOfProducts } from './expandPowersOfProducts'
import { expandPowersOfFractions } from './expandPowersOfFractions'
import { expandPowersOfSums } from './expandPowersOfSums'

export function simplifyPowers(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	if (isPower(node) && context.simplificationOptions.removeZeroExponentFromPowers) node = removeZeroExponentFromPowers(node)
	if (isPower(node) && context.simplificationOptions.removeZeroBaseFromPowers) node = removeZeroBaseFromPowers(node)
	if (isPower(node) && context.simplificationOptions.removeOneExponentFromPowers) node = removeOneExponentFromPowers(node)
	if (isPower(node) && context.simplificationOptions.removeOneBaseFromPowers) node = removeOneBaseFromPowers(node)
	if (isPower(node) && context.simplificationOptions.mergePowerMinuses) node = mergePowerMinuses(node)
	if (isPower(node) && context.simplificationOptions.mergePowerNumbers) node = mergePowerNumbers(node)
	if (isPower(node) && context.simplificationOptions.removePowersWithinPowers) node = removePowersWithinPowers(node)
	if (isPower(node) && context.simplificationOptions.removeNegativePowers) node = removeNegativePowers(node)
	if (isPower(node) && context.simplificationOptions.expandPowers) node = expandPowers(node)
	if (isPower(node) && context.simplificationOptions.expandPowersOfProducts) node = expandPowersOfProducts(node)
	if (isPower(node) && context.simplificationOptions.expandPowersOfFractions) node = expandPowersOfFractions(node)
	if (isPower(node) && (context.simplificationOptions.expandPowersOfSums || (context.simplificationOptions.expandPowersOfSumsWithinSums && context.parents.some(isSum)))) node = expandPowersOfSums(node)
	return node
}

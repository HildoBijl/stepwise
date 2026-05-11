import { type ExpressionNode } from '../../../../construction'

import { isPower, isSum } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { reducePowersWithZeroExponent } from './reducePowersWithZeroExponent'
import { reducePowersWithZeroBase } from './reducePowersWithZeroBase'
import { removeOneExponentFromPowers } from './removeOneExponentFromPowers'
import { reducePowersWithOneBase } from './reducePowersWithOneBase'
import { mergePowerMinuses } from './mergePowerMinuses'
import { mergePowerNumbers } from './mergePowerNumbers'
import { removePowersWithinPowers } from './removePowersWithinPowers'
import { removeNegativePowers } from './removeNegativePowers'
import { expandPowers } from './expandPowers'
import { expandPowersOfProducts } from './expandPowersOfProducts'
import { expandPowersOfFractions } from './expandPowersOfFractions'
import { expandPowersOfSums } from './expandPowersOfSums'

export function simplifyPowers(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	if (isPower(node) && context.simplificationOptions.reducePowersWithZeroExponent) node = reducePowersWithZeroExponent(node)
	if (isPower(node) && context.simplificationOptions.reducePowersWithZeroBase) node = reducePowersWithZeroBase(node)
	if (isPower(node) && context.simplificationOptions.removeOneExponentFromPowers) node = removeOneExponentFromPowers(node)
	if (isPower(node) && context.simplificationOptions.reducePowersWithOneBase) node = reducePowersWithOneBase(node)
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

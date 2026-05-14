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
	const options = context.simplificationOptions
	if (isPower(node) && options.has('reducePowersWithZeroExponent')) node = reducePowersWithZeroExponent(node)
	if (isPower(node) && options.has('reducePowersWithZeroBase')) node = reducePowersWithZeroBase(node)
	if (isPower(node) && options.has('removeOneExponentFromPowers')) node = removeOneExponentFromPowers(node)
	if (isPower(node) && options.has('reducePowersWithOneBase')) node = reducePowersWithOneBase(node)
	if (isPower(node) && options.has('mergePowerMinuses')) node = mergePowerMinuses(node)
	if (isPower(node) && options.has('mergePowerNumbers')) node = mergePowerNumbers(node)
	if (isPower(node) && options.has('removePowersWithinPowers')) node = removePowersWithinPowers(node)
	if (isPower(node) && options.has('removeNegativePowers')) node = removeNegativePowers(node)
	if (isPower(node) && options.has('expandPowers')) node = expandPowers(node)
	if (isPower(node) && options.has('expandPowersOfProducts')) node = expandPowersOfProducts(node)
	if (isPower(node) && options.has('expandPowersOfFractions')) node = expandPowersOfFractions(node)
	if (isPower(node) && (options.has('expandPowersOfSums') || (options.has('expandPowersOfSumsWithinSums') && context.parents.some(isSum)))) node = expandPowersOfSums(node)
	return node
}

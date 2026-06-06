import { type ExpressionNode } from '../../../../construction'

import { isPower, isSum } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { reducePowersWithZeroExponent } from './reducePowersWithZeroExponent'
import { reducePowersWithZeroBase } from './reducePowersWithZeroBase'
import { removeOneExponentsFromPowers } from './removeOneExponentsFromPowers'
import { reducePowersWithOneBase } from './reducePowersWithOneBase'
import { mergePowerMinuses } from './mergePowerMinuses'
import { reduceNumberPowers } from './reduceNumberPowers'
import { removePowersWithinPowers } from './removePowersWithinPowers'
import { convertNegativePowers } from './convertNegativePowers'
import { expandPowers } from './expandPowers'
import { expandPowersOfProducts } from './expandPowersOfProducts'
import { expandPowersOfFractions } from './expandPowersOfFractions'
import { expandPowersOfSums } from './expandPowersOfSums'

export function simplifyPowers(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	const options = context.simplificationOptions
	if (isPower(node) && options.has('reducePowersWithZeroExponent')) node = reducePowersWithZeroExponent(node)
	if (isPower(node) && options.has('reducePowersWithZeroBase')) node = reducePowersWithZeroBase(node)
	if (isPower(node) && options.has('removeOneExponentsFromPowers')) node = removeOneExponentsFromPowers(node)
	if (isPower(node) && options.has('reducePowersWithOneBase')) node = reducePowersWithOneBase(node)
	if (isPower(node) && options.has('mergePowerMinuses')) node = mergePowerMinuses(node)
	if (isPower(node) && options.has('reduceNumberPowers')) node = reduceNumberPowers(node)
	if (isPower(node) && options.has('removePowersWithinPowers')) node = removePowersWithinPowers(node)
	if (isPower(node) && options.has('convertNegativePowers')) node = convertNegativePowers(node)
	if (isPower(node) && options.has('expandPowers')) node = expandPowers(node)
	if (isPower(node) && options.has('expandPowersOfProducts')) node = expandPowersOfProducts(node)
	if (isPower(node) && options.has('expandPowersOfFractions')) node = expandPowersOfFractions(node)
	if (isPower(node) && (options.has('expandPowersOfSums') || (options.has('expandPowersOfSumsWithinSums') && context.parents.some(isSum)))) node = expandPowersOfSums(node)
	return node
}

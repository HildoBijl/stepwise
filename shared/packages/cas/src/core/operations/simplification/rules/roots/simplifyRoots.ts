import { type ExpressionNode } from '../../../../construction'

import { isProduct, isFraction, isPower, isSqrt, isRoot } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { isRootLike } from '../utils'

import { reduceRootsWithZeroArgument } from './reduceRootsWithZeroArgument'
import { reduceRootsWithOneArgument } from './reduceRootsWithOneArgument'
import { reduceIntegerRoots } from './reduceIntegerRoots'
import { reduceCanceledRoots } from './reduceCanceledRoots'
import { turnRootsIntoFractionExponents } from './turnRootsIntoFractionExponents'
import { turnFractionExponentsIntoRoots } from './turnFractionExponentsIntoRoots'
import { turnBaseTwoRootsIntoSqrts } from './turnBaseTwoRootsIntoSqrts'
import { turnSqrtsIntoBaseTwoRoots } from './turnSqrtsIntoBaseTwoRoots'
import { expandRootsOfProducts } from './expandRootsOfProducts'
import { mergeProductsOfRoots } from './mergeProductsOfRoots'
import { pullExponentsIntoRoots } from './pullExponentsIntoRoots'
import { pullFactorsOutOfRoots } from './pullFactorsOutOfRoots'
import { preventRootDenominators } from './preventRootDenominators'

export function simplifyRoots(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	const options = context.simplificationOptions
	if (isRootLike(node) && options.has('reduceRootsWithZeroArgument')) node = reduceRootsWithZeroArgument(node)
	if (isRootLike(node) && options.has('reduceRootsWithOneArgument')) node = reduceRootsWithOneArgument(node)
	if (isRootLike(node) && options.has('reduceIntegerRoots')) node = reduceIntegerRoots(node)
	if ((isRootLike(node) || isPower(node)) && options.has('reduceCanceledRoots')) node = reduceCanceledRoots(node)
	if (isRootLike(node) && options.has('turnRootsIntoFractionExponents')) node = turnRootsIntoFractionExponents(node)
	if (isPower(node) && options.has('turnFractionExponentsIntoRoots')) node = turnFractionExponentsIntoRoots(node)
	if (isRoot(node) && options.has('turnBaseTwoRootsIntoSqrts')) node = turnBaseTwoRootsIntoSqrts(node)
	if (isSqrt(node) && options.has('turnSqrtsIntoBaseTwoRoots')) node = turnSqrtsIntoBaseTwoRoots(node)
	if (isRootLike(node) && options.has('expandRootsOfProducts')) node = expandRootsOfProducts(node)
	if (isProduct(node) && options.has('mergeProductsOfRoots') && !options.has('expandRootsOfProducts')) node = mergeProductsOfRoots(node)
	if (isPower(node) && options.has('pullExponentsIntoRoots')) node = pullExponentsIntoRoots(node)
	if (isRootLike(node) && options.has('pullFactorsOutOfRoots')) node = pullFactorsOutOfRoots(node)
	if (isFraction(node) && options.has('preventRootDenominators')) node = preventRootDenominators(node)
	return node
}

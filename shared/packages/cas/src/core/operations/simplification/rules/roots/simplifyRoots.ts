import { type ExpressionNode } from '../../../../construction'

import { isProduct, isFraction, isPower, isSqrt, isRoot, isRootLike } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { reduceRootsWithZeroRadicand } from './reduceRootsWithZeroRadicand'
import { reduceRootsWithOneRadicand } from './reduceRootsWithOneRadicand'
import { reduceIntegerRoots } from './reduceIntegerRoots'
import { reduceCanceledRoots } from './reduceCanceledRoots'
import { turnRootsIntoFractionExponents } from './turnRootsIntoFractionExponents'
import { turnFractionExponentsIntoRoots } from './turnFractionExponentsIntoRoots'
import { turnDegreeTwoRootsIntoSqrts } from './turnDegreeTwoRootsIntoSqrts'
import { turnSqrtsIntoDegreeTwoRoots } from './turnSqrtsIntoDegreeTwoRoots'
import { expandRootsOfProducts } from './expandRootsOfProducts'
import { mergeProductsOfRoots } from './mergeProductsOfRoots'
import { pullExponentsIntoRoots } from './pullExponentsIntoRoots'
import { pullFactorsOutOfRoots } from './pullFactorsOutOfRoots'
import { preventRootDenominators } from './preventRootDenominators'

export function simplifyRoots(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	const options = context.simplificationOptions
	if (isRootLike(node) && options.has('reduceRootsWithZeroRadicand')) node = reduceRootsWithZeroRadicand(node)
	if (isRootLike(node) && options.has('reduceRootsWithOneRadicand')) node = reduceRootsWithOneRadicand(node)
	if (isRootLike(node) && options.has('reduceIntegerRoots')) node = reduceIntegerRoots(node)
	if ((isRootLike(node) || isPower(node)) && options.has('reduceCanceledRoots')) node = reduceCanceledRoots(node)
	if (isRootLike(node) && options.has('turnRootsIntoFractionExponents')) node = turnRootsIntoFractionExponents(node)
	if (isPower(node) && options.has('turnFractionExponentsIntoRoots')) node = turnFractionExponentsIntoRoots(node)
	if (isRoot(node) && options.has('turnDegreeTwoRootsIntoSqrts')) node = turnDegreeTwoRootsIntoSqrts(node)
	if (isSqrt(node) && options.has('turnSqrtsIntoDegreeTwoRoots')) node = turnSqrtsIntoDegreeTwoRoots(node)
	if (isRootLike(node) && options.has('expandRootsOfProducts')) node = expandRootsOfProducts(node)
	if (isProduct(node) && options.has('mergeProductsOfRoots') && !options.has('expandRootsOfProducts')) node = mergeProductsOfRoots(node)
	if (isPower(node) && options.has('pullExponentsIntoRoots')) node = pullExponentsIntoRoots(node)
	if (isRootLike(node) && options.has('pullFactorsOutOfRoots')) node = pullFactorsOutOfRoots(node)
	if (isFraction(node) && options.has('preventRootDenominators')) node = preventRootDenominators(node)
	return node
}

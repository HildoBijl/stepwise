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
	if (isRootLike(node) && context.simplificationOptions.reduceRootsWithZeroArgument) node = reduceRootsWithZeroArgument(node)
	if (isRootLike(node) && context.simplificationOptions.reduceRootsWithOneArgument) node = reduceRootsWithOneArgument(node)
	if (isRootLike(node) && context.simplificationOptions.reduceIntegerRoots) node = reduceIntegerRoots(node)
	if ((isRootLike(node) || isPower(node)) && context.simplificationOptions.reduceCanceledRoots) node = reduceCanceledRoots(node)
	if (isRootLike(node) && context.simplificationOptions.turnRootsIntoFractionExponents) node = turnRootsIntoFractionExponents(node)
	if (isPower(node) && context.simplificationOptions.turnFractionExponentsIntoRoots) node = turnFractionExponentsIntoRoots(node)
	if (isRoot(node) && context.simplificationOptions.turnBaseTwoRootsIntoSqrts) node = turnBaseTwoRootsIntoSqrts(node)
	if (isSqrt(node) && context.simplificationOptions.turnSqrtsIntoBaseTwoRoots) node = turnSqrtsIntoBaseTwoRoots(node)
	if (isRootLike(node) && context.simplificationOptions.expandRootsOfProducts) node = expandRootsOfProducts(node)
	if (isProduct(node) && context.simplificationOptions.mergeProductsOfRoots && !context.simplificationOptions.expandRootsOfProducts) node = mergeProductsOfRoots(node)
	if (isPower(node) && context.simplificationOptions.pullExponentsIntoRoots) node = pullExponentsIntoRoots(node)
	if (isRootLike(node) && context.simplificationOptions.pullFactorsOutOfRoots) node = pullFactorsOutOfRoots(node)
	if (isFraction(node) && context.simplificationOptions.preventRootDenominators) node = preventRootDenominators(node)
	return node
}

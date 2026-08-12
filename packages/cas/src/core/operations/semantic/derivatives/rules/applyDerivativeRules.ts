import { type ExpressionNode } from '../../../../construction'

import { isConstantNode, isVariable, isSignNode, isSum, isProduct, isFraction, isPower, isSqrt, isRoot, isLn, isLog, isSin, isCos, isTan, isArcsin, isArccos, isArctan } from '../../../structural'

import { type DerivativeContext } from '../types'

import { getConstantDerivative } from './constants'
import { getSignDerivative } from './signs'
import { getVariableDerivative } from './variables'
import { getSumDerivative } from './sums'
import { getProductDerivative } from './products'
import { getFractionDerivative } from './fractions'
import { getPowerDerivative } from './powers'
import { getSqrtDerivative, getRootDerivative } from './roots'
import { getLnDerivative, getLogDerivative } from './logarithms'
import { getSinDerivative, getCosDerivative, getTanDerivative, getArcsinDerivative, getArccosDerivative, getArctanDerivative } from './trigonometry'

export function applyDerivativeRules(node: ExpressionNode, context: DerivativeContext): ExpressionNode {
	// Fundamentals
	if (isConstantNode(node)) return getConstantDerivative()
	if (isSignNode(node)) return getSignDerivative(node, context)
	if (isVariable(node)) return getVariableDerivative(node, context)

	// Lists
	if (isSum(node)) return getSumDerivative(node, context)
	if (isProduct(node)) return getProductDerivative(node, context)

	// Functions
	if (isFraction(node)) return getFractionDerivative(node, context)
	if (isPower(node)) return getPowerDerivative(node, context)
	if (isSqrt(node)) return getSqrtDerivative(node, context)
	if (isRoot(node)) return getRootDerivative(node, context)
	if (isLn(node)) return getLnDerivative(node, context)
	if (isLog(node)) return getLogDerivative(node, context)

	// Trigonometry
	if (isSin(node)) return getSinDerivative(node, context)
	if (isCos(node)) return getCosDerivative(node, context)
	if (isTan(node)) return getTanDerivative(node, context)
	if (isArcsin(node)) return getArcsinDerivative(node, context)
	if (isArccos(node)) return getArccosDerivative(node, context)
	if (isArctan(node)) return getArctanDerivative(node, context)

	throw new Error(`Cannot take derivative of "${node.subtype}" yet.`)
}

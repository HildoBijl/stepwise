import { compareNumberArrays, compareNumbers } from '@step-wise/js-utils'

import { type PolynomialExpression, type PolynomialMatrix } from './types'
import { ensurePolynomialExpression } from './checks'
import { restructurePolynomial } from './restructuring'

// Compare two polynomial matrices, accounting for small floating-point differences.
export function comparePolynomialMatrices(matrix1: PolynomialMatrix, matrix2: PolynomialMatrix): boolean {
	if (Array.isArray(matrix1)) return Array.isArray(matrix2) && compareNumberArrays(matrix1, matrix2)
	return !Array.isArray(matrix2) && compareNumbers(matrix1, matrix2)
}

// Compare two polynomial expressions, optionally allowing their variables to be ordered differently.
export function comparePolynomialExpressions(expression1: PolynomialExpression, expression2: PolynomialExpression, allowVariableReordering = true): boolean {
	ensurePolynomialExpression(expression1)
	ensurePolynomialExpression(expression2)

	if (expression1.list.length !== expression2.list.length || expression1.list.some(variable => !expression2.list.includes(variable))) return false
	if (!allowVariableReordering) return expression1.list.every((variable, index) => variable === expression2.list[index]) && comparePolynomialMatrices(expression1.matrix, expression2.matrix)

	const restructuredExpression2 = restructurePolynomial(expression2, expression1.list)
	return comparePolynomialMatrices(expression1.matrix, restructuredExpression2.matrix)
}

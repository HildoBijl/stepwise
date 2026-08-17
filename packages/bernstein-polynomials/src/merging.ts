import { product, repeat } from '@step-wise/js-utils'
import { binomial } from '@step-wise/math-tools'

import { BernsteinCoefficients } from './types'
import { getBernsteinOrder, increaseBernsteinCoefficientsOrder, normalizeBernsteinCoefficients } from './fundamentals'

// Merge a list of coefficient arrays.
export function mergeBernsteinCoefficients(...coefficientsList: BernsteinCoefficients[]): BernsteinCoefficients {
	if (coefficientsList.length === 0) return [1]
	if (coefficientsList.length === 1) return coefficientsList[0]
	if (coefficientsList.length === 2) return mergeTwo(coefficientsList[0], coefficientsList[1])
	return coefficientsList.slice(1).reduce(mergeTwo, coefficientsList[0])
}

// Merge two sets of coefficients, producing a joint distribution.
function mergeTwo(coefficients1: BernsteinCoefficients, coefficients2: BernsteinCoefficients): BernsteinCoefficients {
	const order1 = getBernsteinOrder(coefficients1)
	const order2 = getBernsteinOrder(coefficients2)
	const order = order1 + order2

	const multiplicationCoefficients1 = coefficients1.map((c, i) => c * binomial(order1, i))
	const multiplicationCoefficients2 = coefficients2.map((c, i) => c * binomial(order2, i))

	const coefficients = new Array(order + 1).fill(0)
	multiplicationCoefficients1.forEach((value1, i) => {
		multiplicationCoefficients2.forEach((value2, j) => {
			coefficients[i + j] += value1 * value2
		})
	})

	return normalizeBernsteinCoefficients(coefficients.map((value, i) => value / binomial(order, i)))
}

// Multiply coefficient arrays element-wise. Coefficient arrays of lower orders are first increased to the highest given order.
export function mergeBernsteinCoefficientsElementwise(...coefficientsList: BernsteinCoefficients[]): BernsteinCoefficients {
	if (coefficientsList.length === 0) return [1]
	const order = Math.max(...coefficientsList.map(getBernsteinOrder))
	const increasedCoefficientsList = coefficientsList.map(coefficients => increaseBernsteinCoefficientsOrder(coefficients, order))
	return normalizeBernsteinCoefficients(repeat(order + 1, index => product(increasedCoefficientsList.map(coefficients => coefficients[index]))))
}

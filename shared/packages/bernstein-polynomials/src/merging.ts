import { product, repeat } from '@step-wise/utils'
import { binomial } from '@step-wise/math-tools'

import { BernsteinCoefficients } from './types'
import { getBernsteinOrder, normalizeBernsteinCoefficients } from './fundamentals'

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

// Multiply coefficient arrays element-wise. All coefficient arrays must have the same length.
export function mergeBernsteinCoefficientsElementwise(...coefficientsList: BernsteinCoefficients[]): BernsteinCoefficients {
	if (coefficientsList.length === 0) return [1]
	if (coefficientsList.some(coefficients => coefficients.length !== coefficientsList[0].length)) throw new Error(`Invalid coefficient list: when merging coefficient lists element-wise, all coefficient lists must have the same number of coefficients.`)

	const numCoefficients = coefficientsList[0].length
	return normalizeBernsteinCoefficients(repeat(numCoefficients, index => product(coefficientsList.map(coefficients => coefficients[index]))))
}

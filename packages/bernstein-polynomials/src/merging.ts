import { product, repeat } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'

import { type BernsteinCoefficients, elevateBernsteinCoefficients, getBernsteinDegree, normalizeBernsteinCoefficients } from './fundamentals'

// Merge a list of coefficient arrays.
export function mergeBernsteinCoefficients(...coefficientsList: BernsteinCoefficients[]): BernsteinCoefficients {
	if (coefficientsList.length === 0) return [1]
	coefficientsList.forEach(getBernsteinDegree)
	if (coefficientsList.length === 1) return coefficientsList[0]
	if (coefficientsList.length === 2) return mergeTwo(coefficientsList[0], coefficientsList[1])
	return coefficientsList.slice(1).reduce(mergeTwo, coefficientsList[0])
}

// Merge two sets of coefficients, producing a joint distribution.
function mergeTwo(coefficients1: BernsteinCoefficients, coefficients2: BernsteinCoefficients): BernsteinCoefficients {
	const degree1 = getBernsteinDegree(coefficients1)
	const degree2 = getBernsteinDegree(coefficients2)
	const degree = degree1 + degree2

	const multiplicationCoefficients1 = coefficients1.map((c, i) => c * binomialCoefficient(degree1, i))
	const multiplicationCoefficients2 = coefficients2.map((c, i) => c * binomialCoefficient(degree2, i))

	const coefficients = new Array(degree + 1).fill(0)
	multiplicationCoefficients1.forEach((value1, i) => {
		multiplicationCoefficients2.forEach((value2, j) => {
			coefficients[i + j] += value1 * value2
		})
	})

	return normalizeBernsteinCoefficients(coefficients.map((value, i) => value / binomialCoefficient(degree, i)))
}

// Multiply coefficient arrays element-wise. Lower-degree coefficient arrays are first elevated to the highest given degree.
export function mergeBernsteinCoefficientsElementwise(...coefficientsList: BernsteinCoefficients[]): BernsteinCoefficients {
	if (coefficientsList.length === 0) return [1]
	const degree = Math.max(...coefficientsList.map(getBernsteinDegree))
	const elevatedCoefficientsList = coefficientsList.map(coefficients => elevateBernsteinCoefficients(coefficients, degree))
	return normalizeBernsteinCoefficients(repeat(degree + 1, index => product(elevatedCoefficientsList.map(coefficients => coefficients[index]))))
}

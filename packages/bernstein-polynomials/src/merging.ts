import { product, repeat } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'

import { type BernsteinCoefficients, elevateBernsteinCoefficients, getBernsteinDegree, normalizeBernsteinCoefficients } from './fundamentals'

// Multiply and normalize the PDFs represented by a list of coefficient arrays.
export function multiplyBernsteinPDFs(...coefficientsList: BernsteinCoefficients[]): BernsteinCoefficients {
	if (coefficientsList.length === 0) return [1]
	coefficientsList.forEach(getBernsteinDegree)
	if (coefficientsList.length === 1) return coefficientsList[0]
	if (coefficientsList.length === 2) return multiplyTwoPDFs(coefficientsList[0], coefficientsList[1])
	return coefficientsList.slice(1).reduce(multiplyTwoPDFs, coefficientsList[0])
}

// Multiply and normalize two PDFs.
function multiplyTwoPDFs(coefficients1: BernsteinCoefficients, coefficients2: BernsteinCoefficients): BernsteinCoefficients {
	const degree1 = getBernsteinDegree(coefficients1)
	const degree2 = getBernsteinDegree(coefficients2)
	const degree = degree1 + degree2

	const multiplicationCoefficients1 = coefficients1.map((coefficient, index) => coefficient * binomialCoefficient(degree1, index))
	const multiplicationCoefficients2 = coefficients2.map((coefficient, index) => coefficient * binomialCoefficient(degree2, index))

	const coefficients = new Array(degree + 1).fill(0)
	multiplicationCoefficients1.forEach((value1, index1) => {
		multiplicationCoefficients2.forEach((value2, index2) => {
			coefficients[index1 + index2] += value1 * value2
		})
	})

	return normalizeBernsteinCoefficients(coefficients.map((value, index) => value / binomialCoefficient(degree, index)))
}

// Multiply coefficient arrays element-wise. Lower-degree coefficient arrays are first elevated to the highest given degree.
export function multiplyBernsteinCoefficientsElementwise(...coefficientsList: BernsteinCoefficients[]): BernsteinCoefficients {
	if (coefficientsList.length === 0) return [1]
	const degree = Math.max(...coefficientsList.map(getBernsteinDegree))
	const elevatedCoefficientsList = coefficientsList.map(coefficients => elevateBernsteinCoefficients(coefficients, degree))
	return normalizeBernsteinCoefficients(repeat(degree + 1, index => product(elevatedCoefficientsList.map(coefficients => coefficients[index]))))
}

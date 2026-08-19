import { approximatelyEqual, ensureInteger, sum } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'

export type BernsteinCoefficients = readonly number[]

// Get the degree of a coefficient array, equal to its length minus one.
export function getBernsteinDegree(coefficients: BernsteinCoefficients): number {
	if (coefficients.length === 0) throw new RangeError('Invalid Bernstein coefficients: expected a non-empty coefficient array.')
	return coefficients.length - 1
}

// Elevate the degree of a coefficient array without changing its PDF.
export function elevateBernsteinCoefficients(coefficients: BernsteinCoefficients, newDegree: number): BernsteinCoefficients {
	newDegree = ensureInteger(newDegree, { nonNegative: true, safe: true })
	const oldDegree = getBernsteinDegree(coefficients)
	if (newDegree < oldDegree) throw new Error(`Invalid Bernstein degree: cannot elevate coefficients of degree ${oldDegree} to the lower degree ${newDegree}.`)
	if (newDegree === oldDegree) return coefficients

	const degreeIncrease = newDegree - oldDegree
	const degreeFactor = 1 / binomialCoefficient(newDegree + 1, oldDegree + 1)
	return Array.from({ length: newDegree + 1 }, (_, newIndex) => {
		const minOldIndex = Math.max(0, newIndex - degreeIncrease)
		const maxOldIndex = Math.min(oldDegree, newIndex)
		const elevatedCoefficient = sum(coefficients.slice(minOldIndex, maxOldIndex + 1).map((coefficient, offset) => {
			const oldIndex = minOldIndex + offset
			return coefficient * binomialCoefficient(newIndex, oldIndex) * binomialCoefficient(newDegree - newIndex, oldDegree - oldIndex)
		}))
		return elevatedCoefficient * degreeFactor
	})
}

// Normalize coefficients so their sum equals one. Negative coefficients are clipped to zero first to guard against numerical noise. Only used internally.
export function normalizeBernsteinCoefficients(coefficients: BernsteinCoefficients): BernsteinCoefficients {
	const ensuredCoefficients = coefficients.map(c => Math.max(c, 0))
	const coefficientSum = sum(ensuredCoefficients)
	if (coefficientSum === 0) throw new RangeError('Invalid Bernstein coefficients: cannot normalize a coefficient array whose values sum to zero.')
	return approximatelyEqual(coefficientSum, 1) ? ensuredCoefficients : ensuredCoefficients.map(c => c / coefficientSum)
}

// Reverse the coefficients. If the coefficients describe x, the result describes 1 - x.
export function invertBernsteinCoefficients(coefficients: BernsteinCoefficients): BernsteinCoefficients {
	getBernsteinDegree(coefficients)
	return [...coefficients].reverse()
}

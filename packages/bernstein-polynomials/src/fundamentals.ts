import { approximatelyEqual, ensureInteger, sum } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'

import { BernsteinCoefficients } from './types'

// Get the order of a coefficient array, equal to its length minus one.
export function getBernsteinOrder(coefficients: BernsteinCoefficients): number {
	if (coefficients.length === 0) throw new RangeError('Invalid Bernstein coefficients: expected a non-empty coefficient array.')
	return coefficients.length - 1
}

// Increase the order of a coefficient array without changing its PDF.
export function increaseBernsteinCoefficientsOrder(coefficients: BernsteinCoefficients, newOrder: number): BernsteinCoefficients {
	newOrder = ensureInteger(newOrder, { nonNegative: true, safe: true })
	const oldOrder = getBernsteinOrder(coefficients)
	if (newOrder < oldOrder) throw new Error(`Invalid Bernstein order: cannot increase coefficients of order ${oldOrder} to the lower order ${newOrder}.`)
	if (newOrder === oldOrder) return coefficients

	const orderIncrease = newOrder - oldOrder
	const orderFactor = 1 / binomialCoefficient(newOrder + 1, oldOrder + 1)
	return Array.from({ length: newOrder + 1 }, (_, newIndex) => {
		const minOldIndex = Math.max(0, newIndex - orderIncrease)
		const maxOldIndex = Math.min(oldOrder, newIndex)
		const elevatedCoefficient = sum(coefficients.slice(minOldIndex, maxOldIndex + 1).map((coefficient, offset) => {
			const oldIndex = minOldIndex + offset
			return coefficient * binomialCoefficient(newIndex, oldIndex) * binomialCoefficient(newOrder - newIndex, oldOrder - oldIndex)
		}))
		return elevatedCoefficient * orderFactor
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
	getBernsteinOrder(coefficients)
	return [...coefficients].reverse()
}

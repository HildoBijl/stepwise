import { randomNumber } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs, cv } = gasProperties.air

export default buildStepExercise({
	metadata: {
		skill: 'calculateWithInternalEnergy',
		...createStepExerciseMetadata(['poissonsLaw', 'calculateHeatAndWork', 'solveLinearEquation']),
		comparisons: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const n = getRandomFloatUnit({ min: 1.1, max: 1.3, decimals: 1, unit: '' })
		const p2 = getRandomFloatUnit({ min: 1.3, max: 1.8, decimals: 2, unit: 'bar' })
		const V2 = getRandomFloatUnit({ min: 300, max: 600, significantDigits: 2, unit: 'cm^3' }).setDecimals(0)
		const volumeFactor = randomNumber(15, 25)
		const V1 = V2.divide(volumeFactor).setDecimals(0).roundToPrecision()
		const p1 = p2.multiply(Math.pow(volumeFactor, n.number)).setDecimals(0).roundToPrecision()
		return { p1, V1, V2, n }
	},

	getSolution({ p1, V1, V2, n }) {
		const p1s = p1.simplify()
		const V1s = V1.simplify()
		const V2s = V2.simplify()
		const cvSimplified = cv.simplify()
		const p2 = p1s.multiply(Math.pow(V1s.number / V2s.number, n.number))
		const p2s = p2.simplify()
		const diff = p2s.multiply(V2s).subtract(p1s.multiply(V1s)).setUnit('J')
		const c = cvSimplified.subtract(Rs.divide(n.number - 1))
		const Q = c.divide(Rs).multiply(diff).setUnit('J').setMinimumSignificantDigits(2)
		const W = diff.multiply(-1 / (n.number - 1)).setMinimumSignificantDigits(2)
		const dU = Q.subtract(W).setMinimumSignificantDigits(2)
		return { cv: cvSimplified, Rs, c, p1s, V1s, p2, p2s, V2s, n, Q, W, dU }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('p2', data)
			case 2: return compareInputs(['Q', 'W'], data)
			default: return compareInputs('dU', data)
		}
	},
})

import { randomNumber } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { k } = gasProperties.helium

export default buildStepExercise({
	metadata: {
		skill: 'calculateWithInternalEnergy',
		...createStepExerciseMetadata(['calculateHeatAndWork', 'solveLinearEquation']),
		comparisons: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const factor = randomNumber(1.1, 1.25)
		const p = getRandomFloatUnit({ min: 1.01, max: 1.10, decimals: 2, unit: 'bar' })
		const V1 = getRandomFloatUnit({ min: 3, max: 10, significantDigits: 2, unit: 'l' })
		const V2 = V1.multiply(factor).roundToPrecision()
		return { p, V1, V2 }
	},

	getSolution({ p, V1, V2 }) {
		const ps = p.simplify()
		const V1s = V1.simplify()
		const V2s = V2.simplify()
		const W = ps.multiply(V2s.subtract(V1s)).setUnit('J').setMinimumSignificantDigits(2)
		const Q = W.multiply(k.number / (k.number - 1)).setMinimumSignificantDigits(2)
		const dU = Q.subtract(W).setMinimumSignificantDigits(2)
		return { k, ps, V1s, V2s, Q, W, dU }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['Q', 'W'], data)
			default: return compareInputs('dU', data)
		}
	},
})

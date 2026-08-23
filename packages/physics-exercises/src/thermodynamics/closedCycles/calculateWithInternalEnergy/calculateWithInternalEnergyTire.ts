import { randomNumber } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs, cv } = gasProperties.air

export default buildStepExercise({
	metadata: {
		skill: 'calculateWithInternalEnergy',
		...createStepExerciseMetadata(['gasLaw', 'specificHeats', 'solveLinearEquation']),
		comparisons: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			cv: { float: { relativeTolerance: 0.02 } },
		},
	},

	generateParameters() {
		const T1 = getRandomFloatUnit({ min: 5, max: 30, decimals: 0, unit: 'dC' })
		const p2 = getRandomFloatUnit({ min: 2.5, max: 3.8, significantDigits: 2, unit: 'bar' })
		const V2 = getRandomFloatUnit({ min: 1, max: 3, significantDigits: 2, unit: 'l' })
		const n = randomNumber(1.1, 1.3)
		const T2 = T1.setUnit('K').multiply(Math.pow(p2.number, (n - 1) / n)).setUnit('dC').roundToPrecision()
		return { T1, p2, V2, T2 }
	},

	getSolution({ T1, p2, V2, T2 }) {
		const T1s = T1.simplify()
		const p2s = p2.simplify()
		const V2s = V2.simplify()
		const T2s = T2.simplify()
		const cvSimplified = cv.simplify()
		const m = p2s.multiply(V2s).divide(Rs.multiply(T2s)).setUnit('kg')
		const dU = m.multiply(cvSimplified).multiply(T2s.subtract(T1s)).setUnit('J')
		return { cv: cvSimplified, Rs, T1s, p2s, V2s, T2s, m, dU }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('m', data)
			case 2: return compareInputs('cv', data)
			default: return compareInputs('dU', data)
		}
	},
})

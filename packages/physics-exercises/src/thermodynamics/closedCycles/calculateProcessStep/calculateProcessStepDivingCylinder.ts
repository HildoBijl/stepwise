import { randomInteger } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs } = gasProperties.oxygen
const TComparison = { value: { absoluteTolerance: 0.7, significantDigitTolerance: 1 } }

export default buildStepExercise({
	metadata: {
		skill: 'calculateProcessStep',
		...createStepExerciseMetadata(['gasLaw', 'recognizeProcessTypes', 'gasLaw']),
		comparisons: {
			FloatUnit: { value: { relativeTolerance: 0.015, significantDigitTolerance: 1 } },
			T1: TComparison,
			T2: TComparison,
		},
	},

	generateParameters() {
		const p1 = getRandomFloatUnit({ min: 180, max: 300, significantDigits: 2, unit: 'bar' })
		const V1 = getRandomFloatUnit({ min: 3, max: 18, significantDigits: randomInteger(2, 3), unit: 'l' })
		const T1 = getRandomFloatUnit({ min: 20, max: 35, significantDigits: 2, unit: 'dC' })
		const T2 = getRandomFloatUnit({ min: 5, max: 15, significantDigits: 2, unit: 'dC' })
		const m = p1.multiply(V1).divide(Rs.multiply(T1.setUnit('K'))).setUnit('kg').roundToPrecision()
		return { m, p1, T1, T2 }
	},

	getSolution({ m, p1, T1, T2 }) {
		const p1s = p1.simplify()
		const T1s = T1.simplify()
		const T2s = T2.simplify()
		const V1 = m.multiply(Rs).multiply(T1s).divide(p1s).setUnit('m^3')
		const V2 = V1
		const p2 = m.multiply(Rs).multiply(T2s).divide(V2).setUnit('Pa')
		return { process: 1, m, p1, T1, T2, Rs, p1s, p2, V1, V2, T1s, T2s }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['p1', 'V1', 'T1'], data)
			case 2: return compareInputs('process', data)
			case 3: return compareInputs(['p2', 'V2', 'T2'], data)
			default: return compareInputs(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], data)
		}
	},
})

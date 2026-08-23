import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs } = gasProperties.air
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
		const p1 = getRandomFloatUnit({ min: 1.02, max: 1.09, unit: 'bar' })
		const V1 = getRandomFloatUnit({ min: 3, max: 9, significantDigits: 2, unit: 'l' })
		const T1 = getRandomFloatUnit({ min: 10, max: 25, significantDigits: 2, unit: 'dC' })
		const T2 = new FloatUnit('100 dC')
		const m = p1.setUnit('Pa').multiply(V1.setUnit('m^3')).divide(Rs.multiply(T1.setUnit('K'))).setUnit('g').roundToPrecision()
		return { m, V1, T1, T2 }
	},

	getSolution({ m, V1, T1, T2 }) {
		const ms = m.simplify()
		const V1s = V1.simplify()
		const T1s = T1.simplify()
		const T2s = T2.simplify()
		const p1 = ms.multiply(Rs).multiply(T1s).divide(V1s).setUnit('Pa')
		const p2 = p1
		const V2 = ms.multiply(Rs).multiply(T2s).divide(p2).setUnit('m^3')
		return { process: 0, m, V1, T1, T2, ms, Rs, p1, p2, V1s, V2, T1s, T2s }
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

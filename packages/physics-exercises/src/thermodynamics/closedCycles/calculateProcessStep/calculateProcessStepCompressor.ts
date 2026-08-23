import { sample } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata, getInput } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const gases = ['methane', 'helium', 'hydrogen'] as const

export default buildStepExercise({
	metadata: {
		skill: 'calculateProcessStep',
		...createStepExerciseMetadata(['gasLaw', 'recognizeProcessTypes', 'poissonsLaw', 'gasLaw']),
		compare: { FloatUnit: { float: { relativeTolerance: 0.015, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const gas = sample(gases)
		const p1 = getRandomFloatUnit({ min: 2, max: 8, unit: 'bar' })
		const V1 = getRandomFloatUnit({ min: 10, max: 30, decimals: 0, unit: 'l' })
		const T1 = getRandomFloatUnit({ min: 5, max: 25, decimals: 0, unit: 'dC' })
		const p2 = getRandomFloatUnit({ min: 15, max: 40, unit: 'bar' })

		const { k, Rs } = gasProperties[gas]
		const m = p1.simplify().multiply(V1.simplify()).divide(Rs.multiply(T1.simplify())).setUnit('g').roundToPrecision()
		const V2 = V1.multiply(Math.pow(p1.number / p2.number, 1 / k.number)).roundToPrecision()

		return { gas, m, T1, V1, V2 }
	},

	getSolution({ gas, m, T1, V1, V2 }) {
		const { k, Rs } = gasProperties[gas]
		const ms = m.simplify()
		const T1s = T1.simplify()
		const V1s = V1.simplify()
		const V2s = V2.simplify()
		const p1 = ms.multiply(Rs).multiply(T1s).divide(V1s).setUnit('Pa')
		const p2 = p1.multiply(Math.pow(V1s.number / V2s.number, k.number))
		const T2 = p2.multiply(V2s).divide(ms.multiply(Rs)).setUnit('K')
		return { process: 3, m, T1, V1, V2, k, Rs, ms, p1, V1s, T1s, p2, V2s, T2 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['p1', 'V1', 'T1'], data)
			case 2: return compareInputs('process', data)
			case 3: return compareInputs(getInput('choice', data, 'number') === 1 ? 'T2' : 'p2', data)
			case 4: return compareInputs(['p2', 'V2', 'T2'], data)
			default: return compareInputs(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], data)
		}
	},
})

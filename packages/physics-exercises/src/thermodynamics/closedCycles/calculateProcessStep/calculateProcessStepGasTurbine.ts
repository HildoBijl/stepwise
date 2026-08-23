import { buildStepExercise, createStepExerciseMetadata, getInput } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { Quantity, getRandomQuantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { k, Rs } = gasProperties.air

export default buildStepExercise({
	metadata: {
		skill: 'calculateProcessStep',
		...createStepExerciseMetadata(['gasLaw', 'recognizeProcessTypes', 'poissonsLaw', 'gasLaw']),
		comparisons: { Quantity: { value: { relativeTolerance: 0.015, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const m = getRandomQuantity({ min: 500, max: 3000, significantDigits: 2, unit: 'kg' })
		const T1 = getRandomQuantity({ min: 900, max: 1200, decimals: -1, unit: 'K' })
		const p1 = getRandomQuantity({ min: 7, max: 11, decimals: 1, unit: 'bar' })
		const p2 = new Quantity('1.0 bar')
		return { m, T1, p1, p2 }
	},

	getSolution({ m, T1, p1, p2 }) {
		const p1s = p1.simplify()
		const p2s = p2.simplify()
		const V1 = m.multiply(Rs).multiply(T1).divide(p1).setUnit('m^3')
		const V2 = V1.multiply(Math.pow(p1.number / p2.number, 1 / k.number))
		const T2 = p2.multiply(V2).divide(m.multiply(Rs)).setUnit('K')
		return { process: 3, m, T1, p1, p2, k, Rs, p1s, V1, p2s, V2, T2 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['p1', 'V1', 'T1'], data)
			case 2: return compareInputs('process', data)
			case 3: return compareInputs(getInput('choice', data, 'number') === 1 ? 'T2' : 'V2', data)
			case 4: return compareInputs(['p2', 'V2', 'T2'], data)
			default: return compareInputs(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], data)
		}
	},
})

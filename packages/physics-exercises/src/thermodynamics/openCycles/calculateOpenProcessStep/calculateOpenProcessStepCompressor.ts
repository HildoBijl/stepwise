import { buildStepExercise, createStepExerciseMetadata, getInput } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs, k } = gasProperties.air

export default buildStepExercise({
	metaData: {
		skill: 'calculateOpenProcessStep',
		...createStepExerciseMetadata(['gasLaw', 'poissonsLaw', 'gasLaw']),
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			T1: { float: { absoluteTolerance: 0.7, relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			T2: { float: { absoluteTolerance: 0.7, relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const p1o = getRandomFloatUnit({ min: 1, max: 3, unit: 'bar', significantDigits: 2 })
		const p2o = getRandomFloatUnit({ min: 8, max: 16, unit: 'bar', significantDigits: 2 })
		const T1o = getRandomFloatUnit({ min: 10, max: 25, significantDigits: 2, unit: 'dC' })
		const n = getRandomFloatUnit({ min: 1.2, max: k.number, significantDigits: 3, unit: '' })
		return { p1o, p2o, T1o, n }
	},

	getSolution({ p1o, p2o, T1o, n }) {
		const p1 = p1o.simplify()
		const p2 = p2o.simplify()
		const T1 = T1o.simplify()
		const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
		const v2 = v1.multiply(Math.pow(p1.number / p2.number, 1 / n.number))
		const T2 = p2.multiply(v2).divide(Rs).setUnit('K')
		return { Rs, n, p1, p2, v1, v2, T1, T2 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare(['p1', 'v1', 'T1'], data)
			case 2: return compare(getInput('choice', data, 'number') === 1 ? 'T2' : 'v2', data)
			case 3: return compare(['p2', 'v2', 'T2'], data)
			default: return compare(['p1', 'v1', 'T1', 'p2', 'v2', 'T2'], data)
		}
	},
})

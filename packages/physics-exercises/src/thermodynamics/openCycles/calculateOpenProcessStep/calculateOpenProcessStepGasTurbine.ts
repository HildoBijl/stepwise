import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs, k } = gasProperties.air

export default buildStepExercise({
	metaData: {
		skill: 'calculateOpenProcessStep',
		...stepsToSetup(['gasLaw', 'recognizeProcessTypes', 'gasLaw']),
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			T1: { float: { absoluteTolerance: 0.7, relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			T2: { float: { absoluteTolerance: 0.7, relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const p1o = getRandomFloatUnit({ min: 6, max: 14, unit: 'bar', significantDigits: 2 })
		const T0o = getRandomFloatUnit({ min: 275, max: 300, unit: 'K' })
		const T1o = T0o.multiply(Math.pow(p1o.number, 1 - 1 / k.number)).setDecimals(-1).roundToPrecision().setDecimals(0)
		const T2o = getRandomFloatUnit({ min: 900, max: 1300, unit: 'K', decimals: -1 }).setDecimals(0)
		return { p1o, T1o, T2o }
	},

	getSolution({ p1o, T1o, T2o }) {
		const p1 = p1o.simplify()
		const T1 = T1o.simplify()
		const T2 = T2o.simplify()
		const p2 = p1
		const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
		const v2 = Rs.multiply(T2).divide(p2).setUnit('m^3/kg')
		return { process: 0, Rs, p1, p2, v1, v2, T1, T2 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare(['p1', 'v1', 'T1'], data)
			case 2: return compare('process', data)
			case 3: return compare(['p2', 'v2', 'T2'], data)
			default: return compare(['p1', 'v1', 'T1', 'p2', 'v2', 'T2'], data)
		}
	},
})

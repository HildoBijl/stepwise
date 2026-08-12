import { buildStepExercise, stepsToSetup, getInput } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs, k } = gasProperties.air

export default buildStepExercise({
	metaData: {
		skill: 'calculateOpenProcessStep',
		...stepsToSetup(['calculateWithSpecificQuantities', 'gasLaw', 'recognizeProcessTypes', 'poissonsLaw', 'gasLaw']),
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			T1: { float: { absoluteTolerance: 0.7, relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			T2: { float: { absoluteTolerance: 0.7, relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		},
	},

	generateState() {
		const p1o = getRandomFloatUnit({ min: 200, max: 400, unit: 'mbar', decimals: -1 }).setDecimals(0)
		const p2o = p1o.divide(1.8).subtract(getRandomFloatUnit({ min: 20, max: 40, unit: 'mbar' })).setDecimals(-1).roundToPrecision().setDecimals(0)
		const rho = getRandomFloatUnit({ min: 0.4, max: 0.65, significantDigits: 2, unit: 'kg/m^3' })
		return { p1o, p2o, rho }
	},

	getSolution({ p1o, p2o, rho }) {
		const p1 = p1o.simplify()
		const p2 = p2o.simplify()
		const v1 = rho.invert()
		const T1 = p1.multiply(v1).divide(Rs).setUnit('K')
		const v2 = v1.multiply(Math.pow(p1.number / p2.number, 1 / k.number))
		const T2 = p2.multiply(v2).divide(Rs).setUnit('K')
		return { process: 3, Rs, k, rho, p1, p2, v1, v2, T1, T2 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('v1', data)
			case 2: return compare(['p1', 'v1', 'T1'], data)
			case 3: return compare('process', data)
			case 4: return compare(getInput('choice', data, 'number') === 1 ? 'T2' : 'v2', data)
			case 5: return compare(['p2', 'v2', 'T2'], data)
			default: return compare(['p1', 'v1', 'T1', 'p2', 'v2', 'T2'], data)
		}
	},
})

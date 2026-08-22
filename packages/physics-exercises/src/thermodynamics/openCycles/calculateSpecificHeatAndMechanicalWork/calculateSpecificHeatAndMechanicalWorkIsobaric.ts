import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { cp } = gasProperties.air

export default buildStepExercise({
	metaData: {
		skill: 'calculateSpecificHeatAndMechanicalWork',
		...createStepExerciseMetadata(['recognizeProcessTypes', undefined, 'specificHeats', 'calculateWithTemperature', 'calculateWithSpecificQuantities']),
		compare: {
			cp: { float: { relativeTolerance: 0.02 } },
			T1: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 2 } },
			T2: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 2 } },
			q: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
			wt: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const T1o = getRandomFloatUnit({ min: 150, max: 300, decimals: -1, unit: 'dC' }).setDecimals(0)
		const T2o = getRandomFloatUnit({ min: 650, max: 800, decimals: -1, unit: 'dC' }).setDecimals(0)
		return { T1o, T2o }
	},

	getSolution({ T1o, T2o }) {
		const cpSimplified = cp.simplify()
		const T1 = T1o
		const T2 = T2o
		const q = cpSimplified.multiply(T2.subtract(T1)).setUnit('J/kg')
		const wt = new FloatUnit('0 J/kg')
		return { process: 0, eq: 1, T1, T2, cp: cpSimplified, q, wt }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('process', data)
			case 2: return compare('eq', data)
			case 3: return compare('cp', data)
			case 4: return compare(['T1', 'T2'], data)
			default: return compare(['q', 'wt'], data)
		}
	},
})

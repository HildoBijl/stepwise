import { compareInputs } from '@step-wise/exercise-grading'
import { Quantity, getRandomQuantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { buildStepExercise, createStepExerciseMetadata } from '#exerciseBuilding'

const { cp } = gasProperties.air

export default buildStepExercise({
	metadata: {
		skill: 'calculateSpecificHeatAndMechanicalWork',
		...createStepExerciseMetadata(['recognizeProcessTypes', undefined, 'specificHeats', 'calculateWithTemperature', 'calculateWithSpecificQuantities']),
		comparisons: {
			cp: { value: { relativeTolerance: 0.02 } },
			T1: { value: { absoluteTolerance: 0.7, significantDigitTolerance: 2 } },
			T2: { value: { absoluteTolerance: 0.7, significantDigitTolerance: 2 } },
			q: { value: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
			wt: { value: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const T1o = getRandomQuantity({ min: 150, max: 300, decimals: -1, unit: 'dC' }).setDecimals(0)
		const T2o = getRandomQuantity({ min: 650, max: 800, decimals: -1, unit: 'dC' }).setDecimals(0)
		return { T1o, T2o }
	},

	getSolution({ T1o, T2o }) {
		const cpSimplified = cp.simplify()
		const T1 = T1o
		const T2 = T2o
		const q = cpSimplified.multiply(T2.subtract(T1)).setUnit('J/kg')
		const wt = new Quantity('0 J/kg')
		return { process: 0, eq: 1, T1, T2, cp: cpSimplified, q, wt }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('process', data)
			case 2: return compareInputs('eq', data)
			case 3: return compareInputs('cp', data)
			case 4: return compareInputs(['T1', 'T2'], data)
			default: return compareInputs(['q', 'wt'], data)
		}
	},
})

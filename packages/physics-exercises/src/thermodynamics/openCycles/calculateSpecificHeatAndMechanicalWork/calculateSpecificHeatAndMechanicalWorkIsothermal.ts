import { sample } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { buildStepExercise, createStepExerciseMetadata } from '#physicsExerciseBuilding'

const gases = ['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

export default buildStepExercise({
	metadata: {
		skill: 'calculateSpecificHeatAndMechanicalWork',
		...createStepExerciseMetadata(['recognizeProcessTypes', undefined, 'specificGasConstant', 'gasLaw', 'calculateWithTemperature', 'calculateWithSpecificQuantities']),
		comparisons: {
			Rs: { value: { relativeTolerance: 0.015 } },
			ratio: { value: { relativeTolerance: 0.01 } },
			T: { value: { absoluteTolerance: 0.7, significantDigitTolerance: 2 }, unit: { target: 'unchanged' } },
			q: { value: { relativeTolerance: 0.015, significantDigitTolerance: 1 } },
			wt: { value: { relativeTolerance: 0.015, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const gas = sample(gases)
		const To = getRandomQuantity({ min: 6, max: 30, decimals: 0, unit: 'dC' })
		const p1o = getRandomQuantity({ min: 2, max: 9, decimals: 1, unit: 'bar' })
		const p2o = getRandomQuantity({ min: 10, max: 30, decimals: 0, unit: 'bar' })
		return { gas, To, p1o, p2o }
	},

	getSolution({ gas, To, p1o, p2o }) {
		const { Rs } = gasProperties[gas]
		const T = To.simplify()
		const p1 = p1o
		const p2 = p2o
		const ratio = p1.divide(p2).simplify()
		const q = Rs.multiply(T).multiply(Math.log(ratio.number)).setUnit('J/kg')
		const wt = q
		return { gas, process: 2, eq: 5, Rs, ratio, T, p1, p2, q, wt }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('process', data)
			case 2: return compareInputs('eq', data)
			case 3: return compareInputs('Rs', data)
			case 4: return compareInputs('ratio', data)
			case 5: return compareInputs('T', data)
			default: return compareInputs(['q', 'wt'], data)
		}
	},
})

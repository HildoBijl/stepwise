import { sample } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { buildStepExercise, createStepExerciseMetadata } from '#physicsExerciseBuilding'

const gases = ['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

export default buildStepExercise({
	metadata: {
		skill: 'calculateHeatAndWork',
		...createStepExerciseMetadata(['recognizeProcessTypes', undefined, 'specificGasConstant', 'gasLaw', ['calculateWithMass', 'calculateWithTemperature'], undefined]),
		comparisons: {
			Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 2 } },
			ms: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			Ts: { value: { absoluteTolerance: 0.7, significantDigitTolerance: 2 }, unit: { target: 'unchanged' } },
		},
	},

	generateParameters() {
		const gas = sample(gases)
		const m = getRandomQuantity({ min: 0.5, max: 6, significantDigits: 2, unit: 'kg' })
		const T = getRandomQuantity({ min: 6, max: 30, decimals: 0, unit: 'dC' })
		const p1 = getRandomQuantity({ min: 2, max: 9, decimals: 1, unit: 'bar' })
		const p2 = getRandomQuantity({ min: 10, max: 30, decimals: 0, unit: 'bar' })
		return { gas, m, T, p1, p2 }
	},

	getSolution({ gas, m, T, p1, p2 }) {
		const { Rs } = gasProperties[gas]
		const Ts = T.simplify()
		const ms = m
		const ratio = p1.divide(p2).simplify()
		const Q = ms.multiply(Rs).multiply(Ts).multiply(Math.log(ratio.number)).setUnit('J')
		const W = Q
		return { gas, process: 2, eq: 5, Rs, ratio, ms, Ts, p1, p2, Q, W }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compareInputs('process', data)
			case 2: return compareInputs('eq', data)
			case 3: return compareInputs('Rs', data)
			case 4: return compareInputs('ratio', data)
			case 5:
				switch (substep) {
					case 1: return compareInputs('ms', data)
					case 2: return compareInputs('Ts', data)
				}
			default: return compareInputs(['Q', 'W'], data)
		}
	},
})

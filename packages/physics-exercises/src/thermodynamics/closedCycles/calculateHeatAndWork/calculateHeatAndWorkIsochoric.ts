import { sample } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { Quantity, getRandomQuantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { buildStepExercise, createStepExerciseMetadata } from '#physicsExerciseBuilding'

const gases = ['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

export default buildStepExercise({
	metadata: {
		skill: 'calculateHeatAndWork',
		...createStepExerciseMetadata(['recognizeProcessTypes', undefined, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], undefined]),
		comparisons: {
			Quantity: { value: { relativeTolerance: 0.015, significantDigitTolerance: 2 } },
			Vs: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			p1s: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			p2s: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
		},
	},

	generateParameters() {
		const gas = sample(gases)
		const V = getRandomQuantity({ min: 20, max: 200, decimals: -1, unit: 'l' }).setDecimals(0)
		const p1 = getRandomQuantity({ min: 6, max: 12, decimals: 0, unit: 'bar' })
		const p2 = getRandomQuantity({ min: 13, max: 24, decimals: 0, unit: 'bar' })
		return { gas, V, p1, p2 }
	},

	getSolution({ gas, V, p1, p2 }) {
		const { k } = gasProperties[gas]
		const Vs = V.simplify()
		const p1s = p1.simplify()
		const p2s = p2.simplify()
		const Q = Vs.multiply(p2s.subtract(p1s)).multiply(1 / (k.number - 1)).setUnit('J')
		const W = new Quantity('0 J')
		return { gas, process: 1, eq: 2, k, Vs, p1s, p2s, Q, W }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compareInputs('process', data)
			case 2: return compareInputs('eq', data)
			case 3: return compareInputs('k', data)
			case 4:
				switch (substep) {
					case 1: return compareInputs('Vs', data)
					case 2: return compareInputs(['p1s', 'p2s'], data)
				}
			default: return compareInputs(['Q', 'W'], data)
		}
	},
})

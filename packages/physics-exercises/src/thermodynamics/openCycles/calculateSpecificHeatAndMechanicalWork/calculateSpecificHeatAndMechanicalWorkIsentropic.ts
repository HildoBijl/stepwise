import { randomNumber } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { Quantity, getRandomQuantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { buildStepExercise, createStepExerciseMetadata } from '#physicsExerciseBuilding'

const { k } = gasProperties.air

export default buildStepExercise({
	metadata: {
		skill: 'calculateSpecificHeatAndMechanicalWork',
		...createStepExerciseMetadata(['recognizeProcessTypes', undefined, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], 'calculateWithSpecificQuantities']),
		comparisons: {
			k: { value: { relativeTolerance: 0.015 } },
			v1: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			v2: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			p1: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			p2: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			q: { value: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
			wt: { value: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const v2o = getRandomQuantity({ min: 1.5, max: 1.8, decimals: 1, unit: 'm^3/kg' })
		const pressureRatio = randomNumber(7, 11)
		const v1o = v2o.multiply(Math.pow(1 / pressureRatio, 1 / k.number)).roundToPrecision()
		const p2o = new Quantity('1.0 bar')
		const p1o = p2o.multiply(Math.pow(v2o.number / v1o.number, k.number)).setDecimals(1).roundToPrecision()
		return { p1o, p2o, v1o, v2o }
	},

	getSolution({ p1o, p2o, v1o, v2o }) {
		const p1 = p1o.simplify()
		const p2 = p2o.simplify()
		const v1 = v1o
		const v2 = v2o
		const q = new Quantity('0 J/kg')
		const wt = p2.multiply(v2).subtract(p1.multiply(v1)).multiply(-k.number / (k.number - 1)).setUnit('J/kg')
		return { process: 3, eq: 6, k, p1, p2, v1, v2, q, wt }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compareInputs('process', data)
			case 2: return compareInputs('eq', data)
			case 3: return compareInputs('k', data)
			case 4:
				switch (substep) {
					case 1: return compareInputs(['v1', 'v2'], data)
					case 2: return compareInputs(['p1', 'p2'], data)
				}
			default: return compareInputs(['q', 'wt'], data)
		}
	},
})

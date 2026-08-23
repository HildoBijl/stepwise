import { sample } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata, getInput } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { Quantity, getRandomQuantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const gases = ['methane', 'helium', 'hydrogen'] as const

export default buildStepExercise({
	metadata: {
		skill: 'poissonsLaw',
		...createStepExerciseMetadata([[undefined, 'calculateWithPressure', undefined], 'specificHeatRatio', undefined, 'solveExponentEquation']),
		comparisons: {
			V2s: { value: { absoluteTolerance: 0.001, significantDigitTolerance: 1 } }, // Standard units, in m^3.
			p1s: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 } },
			p2s: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 } },
			k: { value: { relativeTolerance: 0.015 } },
			V1: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const gas = sample(gases)
		const V2 = getRandomQuantity({ min: 20, max: 120, decimals: 0, unit: 'l' })
		const p1 = getRandomQuantity({ min: 2, max: 10, decimals: 1, unit: 'bar' })
		const p2 = getRandomQuantity({ min: 200, max: 300, decimals: -1, unit: 'bar' }).setDecimals(0)
		return { gas, V2, p1, p2 }
	},

	getSolution({ gas, p1, p2, V2 }) {
		const p1s = p1
		const p2s = p2
		const V2s = V2
		const { k } = gasProperties[gas]
		const eq = 0
		const V1 = V2.multiply(p2.divide(p1).value.toPower(k.value.invert()))
		return { k, p1s, p2s, V2s, eq, V1 }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1:
				switch (substep) {
					case 1: return compareInputs('p1s', data) && getInput('p1s', data, Quantity).unit.equals(getInput('p2s', data, Quantity).unit, { target: 'unchanged' })
					case 2: return compareInputs('p2s', data) && getInput('p1s', data, Quantity).unit.equals(getInput('p2s', data, Quantity).unit, { target: 'unchanged' })
					case 3: return compareInputs('V2s', data)
				}
			case 2: return compareInputs('k', data)
			case 3: return compareInputs('eq', data)
			default: return compareInputs('V1', data)
		}
	},
})

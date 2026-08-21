import { sample } from '@step-wise/js-utils'
import { buildStepExercise, stepsToSetup, getInput } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const gases = ['methane', 'helium', 'hydrogen'] as const

export default buildStepExercise({
	metaData: {
		skill: 'poissonsLaw',
		...stepsToSetup([[undefined, 'calculateWithPressure', undefined], 'specificHeatRatio', undefined, 'solveExponentEquation']),
		compare: {
			V2s: { float: { absoluteTolerance: 0.001, significantDigitTolerance: 1 } }, // Standard units, in m^3.
			p1s: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 } },
			p2s: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 } },
			k: { float: { relativeTolerance: 0.015 } },
			V1: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const gas = sample(gases)
		const V2 = getRandomFloatUnit({ min: 20, max: 120, decimals: 0, unit: 'l' })
		const p1 = getRandomFloatUnit({ min: 2, max: 10, decimals: 1, unit: 'bar' })
		const p2 = getRandomFloatUnit({ min: 200, max: 300, decimals: -1, unit: 'bar' }).setDecimals(0)
		return { gas, V2, p1, p2 }
	},

	getSolution({ gas, p1, p2, V2 }) {
		const p1s = p1
		const p2s = p2
		const V2s = V2
		const { k } = gasProperties[gas]
		const eq = 0
		const V1 = V2.multiply(p2.divide(p1).float.toPower(k.float.invert()))
		return { k, p1s, p2s, V2s, eq, V1 }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1:
				switch (substep) {
					case 1: return compare('p1s', data) && getInput('p1s', data, FloatUnit).unit.equals(getInput('p2s', data, FloatUnit).unit, { target: 'unchanged' })
					case 2: return compare('p2s', data) && getInput('p1s', data, FloatUnit).unit.equals(getInput('p2s', data, FloatUnit).unit, { target: 'unchanged' })
					case 3: return compare('V2s', data)
				}
			case 2: return compare('k', data)
			case 3: return compare('eq', data)
			default: return compare('V1', data)
		}
	},
})

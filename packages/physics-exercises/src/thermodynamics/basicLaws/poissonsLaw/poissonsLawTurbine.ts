import { buildStepExercise, createStepExerciseMetadata, getInput } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { k } = gasProperties.air

export default buildStepExercise({
	metadata: {
		skill: 'poissonsLaw',
		...createStepExerciseMetadata([[undefined, undefined, 'calculateWithPressure'], 'specificHeatRatio', undefined, 'solveExponentEquation']),
		comparisons: {
			T1s: { value: { absoluteTolerance: 0.7, significantDigitTolerance: 2 }, unit: { target: 'unchanged' } },
			p1s: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 } },
			p2s: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 } },
			k: { value: { relativeTolerance: 0.015 } },
			T2: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const T1 = getRandomFloatUnit({ min: 700, max: 1200, decimals: -1, unit: 'K' }).setSignificantDigits(3)
		const p1 = getRandomFloatUnit({ min: 6, max: 12, significantDigits: 2, unit: 'bar' })
		const p2 = new FloatUnit('1.0 bar')
		return { p1, p2, T1 }
	},

	getSolution({ p1, p2, T1 }) {
		const T1s = T1
		const p1s = p1
		const p2s = p2
		const eq = 2
		const kNum = k.value.number
		const T2 = T1.multiply(p2.divide(p1).value.toPower((kNum - 1) / kNum))
		return { k, p1s, p2s, T1s, T2, eq }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1:
				switch (substep) {
					case 1: return compareInputs('T1s', data)
					case 2: return compareInputs('p1s', data) && getInput('p1s', data, FloatUnit).unit.equals(getInput('p2s', data, FloatUnit).unit, { target: 'unchanged' })
					case 3: return compareInputs('p2s', data) && getInput('p1s', data, FloatUnit).unit.equals(getInput('p2s', data, FloatUnit).unit, { target: 'unchanged' })
				}
			case 2: return compareInputs('k', data)
			case 3: return compareInputs('eq', data)
			default: return compareInputs('T2', data)
		}
	},
})

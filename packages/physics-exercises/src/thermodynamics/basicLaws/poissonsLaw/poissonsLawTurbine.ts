import { buildStepExercise, createStepExerciseMetadata, getInput } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { k } = gasProperties.air

export default buildStepExercise({
	metaData: {
		skill: 'poissonsLaw',
		...createStepExerciseMetadata([[undefined, undefined, 'calculateWithPressure'], 'specificHeatRatio', undefined, 'solveExponentEquation']),
		compare: {
			T1s: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 2 }, unit: { target: 'unchanged' } },
			p1s: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 } },
			p2s: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 } },
			k: { float: { relativeTolerance: 0.015 } },
			T2: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
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
		const kNum = k.float.number
		const T2 = T1.multiply(p2.divide(p1).float.toPower((kNum - 1) / kNum))
		return { k, p1s, p2s, T1s, T2, eq }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1:
				switch (substep) {
					case 1: return compare('T1s', data)
					case 2: return compare('p1s', data) && getInput('p1s', data, FloatUnit).unit.equals(getInput('p2s', data, FloatUnit).unit, { target: 'unchanged' })
					case 3: return compare('p2s', data) && getInput('p1s', data, FloatUnit).unit.equals(getInput('p2s', data, FloatUnit).unit, { target: 'unchanged' })
				}
			case 2: return compare('k', data)
			case 3: return compare('eq', data)
			default: return compare('T2', data)
		}
	},
})

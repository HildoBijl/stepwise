import { getRandomNumber } from '@step-wise/js-utils'
import { buildStepExercise, stepsToSetup, getInput } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloat, getRandomFloatUnit } from '@step-wise/physics-core'

export default buildStepExercise({
	metaData: {
		skill: 'poissonsLaw',
		...stepsToSetup([['calculateWithTemperature', undefined, 'calculateWithVolume'], undefined, 'solveLinearEquation']),
		compare: {
			V1s: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 } },
			V2s: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 } },
			T1s: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 2 }, unit: { target: 'unchanged' } },
			T2: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		},
	},

	generateState() {
		const n = getRandomFloat({ min: 1.1, max: 1.3, decimals: 1 })
		const T1 = getRandomFloatUnit({ min: 5, max: 30, significantDigits: 2, unit: 'dC' })
		const V1 = getRandomFloatUnit({ min: 0.2, max: 1.2, significantDigits: 2, unit: 'l' })
		const pressureRatio = getRandomNumber(2, 5)
		const V2 = V1.multiply(Math.pow(pressureRatio, -1 / n.number)).roundToPrecision()
		return { n, T1, V1, V2 }
	},

	getSolution({ n, T1, V1, V2 }) {
		const T1s = T1.simplify()
		const V1s = V1
		const V2s = V2
		const eq = 1
		const T2 = T1s.multiply(V1.float.divide(V2.float).toPower(n.subtract(1)))
		return { n, T1s, T2, V1s, V2s, eq }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1:
				switch (substep) {
					case 1: return compare('T1s', data)
					case 2: return compare('V1s', data) && getInput('V1s', data, FloatUnit).unit.equals(getInput('V2s', data, FloatUnit).unit, { target: 'unchanged' })
					case 3: return compare('V2s', data) && getInput('V1s', data, FloatUnit).unit.equals(getInput('V2s', data, FloatUnit).unit, { target: 'unchanged' })
				}
			case 2: return compare('eq', data)
			default: return compare('T2', data)
		}
	},
})

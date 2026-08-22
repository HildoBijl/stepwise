import { randomNumber } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs, k, cp } = gasProperties.air

export default buildStepExercise({
	metadata: {
		skill: 'calculateWithEnthalpy',
		...createStepExerciseMetadata(['solveLinearEquation', 'solveLinearEquation']),
		compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const n = randomNumber(1.2, 1.38)
		const pressureRatio = randomNumber(6, 9)
		const T1 = getRandomFloatUnit({ min: 5, max: 25, decimals: 0, unit: 'dC' })
		const T2 = T1.simplify().multiply(Math.pow(pressureRatio, 1 - 1 / k.number)).setUnit('dC').roundToPrecision()
		const wt = Rs.multiply(-n / (n - 1)).multiply(T2.subtract(T1)).setUnit('kJ/kg')
		return { T1, T2, wt }
	},

	getSolution({ T1, T2, wt }) {
		const wts = wt.simplify()
		const cpSimplified = cp.simplify()
		const dh = cpSimplified.multiply(T2.subtract(T1)).setUnit('J/kg')
		const q = dh.add(wts)
		return { cp: cpSimplified, wts, dh, q }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('dh', data)
			default: return compare('q', data)
		}
	},
})

import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloat, getRandomExponentialFloat } from '@step-wise/physics-core'

// a*x^c = b*x^d

export default buildMonoExercise({
	metadata: {
		skill: 'solveExponentEquation',
		compare: { Float: { significantDigitTolerance: 2 } },
	},

	generateParameters() {
		const x = getRandomExponentialFloat({ min: 0.1, max: 10, prevent: 1 })
		const a = getRandomExponentialFloat({ min: 0.1, max: 10, significantDigits: 2 })
		const c = getRandomFloat({ min: -3, max: 3, decimals: 1, prevent: 0 })
		const d = getRandomFloat({ min: -3, max: 3, decimals: 1, prevent: [0, c.number] })
		const b = a.multiply(x.toPower(c.subtract(d))).setSignificantDigits(2).roundToPrecision()
		return { a, b, c, d }
	},

	getSolution({ a, b, c, d }) {
		const power = c.subtract(d, true)
		const bDivA = b.divide(a, true)
		const ans = b.divide(a).toPower(c.subtract(d).invert())
		return { power, bDivA, ans }
	},

	checkInput(data) {
		return compareInputs('ans', data)
	},
})

import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomPrecisionNumber, getRandomExponentialPrecisionNumber } from '@step-wise/physics-core'

// a*x^p = b*x^p + c

export default buildMonoExercise({
	metadata: {
		skill: 'solveExponentEquation',
		comparisons: { PrecisionNumber: { significantDigitTolerance: 2 } },
	},

	generateParameters() {
		const x = getRandomExponentialPrecisionNumber({ min: 0.1, max: 10, prevent: 1 })
		const p = getRandomPrecisionNumber({ min: -3, max: 3, decimals: 1, prevent: 0 })
		const c = getRandomExponentialPrecisionNumber({ min: 1, max: 100, significantDigits: 2 })
		const cDivPower = c.divide(x.toPower(p))
		const b = getRandomPrecisionNumber({ min: -2, max: 2 }).multiply(cDivPower).setSignificantDigits(2).roundToPrecision()
		const a = b.add(cDivPower).setSignificantDigits(2).roundToPrecision()
		return { a, b, c, p }
	},

	getSolution({ a, b, c, p }) {
		const aMinusB = a.subtract(b, true)
		const cDivAMinusB = c.divide(aMinusB, true)
		const ans = a.subtract(b).divide(c).toPower(p.negate().invert()).setMinimumSignificantDigits(2)
		return { aMinusB, cDivAMinusB, ans }
	},

	checkInput(data) {
		return compareInputs('ans', data)
	},
})

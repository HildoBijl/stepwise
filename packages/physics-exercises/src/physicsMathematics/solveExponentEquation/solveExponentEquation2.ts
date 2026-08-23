import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomPrecisionNumber, getRandomExponentialPrecisionNumber } from '@step-wise/physics-core'

// a + b*x^p = c

export default buildMonoExercise({
	metadata: {
		skill: 'solveExponentEquation',
		comparisons: { PrecisionNumber: { significantDigitTolerance: 2 } },
	},

	generateParameters() {
		const a = getRandomPrecisionNumber({ min: -20, max: 20, significantDigits: 2, prevent: 0 })
		const c = getRandomPrecisionNumber({ min: -20, max: 20, significantDigits: 2, prevent: [0, a.number] })
		const x = getRandomExponentialPrecisionNumber({ min: 0.2, max: 40, prevent: 1 })
		const p = getRandomPrecisionNumber({ min: -3, max: 3, significantDigits: 2, prevent: 0 })
		const b = c.subtract(a).divide(x.toPower(p)).setSignificantDigits(2).roundToPrecision()
		return { a, b, p, c }
	},

	getSolution({ a, b, p, c }) {
		const cMinusA = c.subtract(a, true)
		const cMinusADivB = cMinusA.divide(b, true)
		const ans = cMinusADivB.toPower(p.invert())
		return { cMinusA, cMinusADivB, ans }
	},

	checkInput(data) {
		return compareInputs('ans', data)
	},
})

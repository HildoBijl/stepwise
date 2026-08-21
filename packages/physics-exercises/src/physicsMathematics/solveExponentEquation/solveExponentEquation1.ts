import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloat, getRandomExponentialFloat } from '@step-wise/physics-core'

// a/x^p = b/c^p (=fraction)

export default buildSimpleExercise({
	metaData: {
		skill: 'solveExponentEquation',
		compare: { Float: { significantDigitTolerance: 2 } },
	},

	generateParameters() {
		const fraction = getRandomExponentialFloat({ min: 0.1, max: 10 })
		const p = getRandomFloat({ min: -3, max: 3, decimals: 1, prevent: 0 })
		const x = getRandomExponentialFloat({ min: 0.1, max: 10, prevent: 1 })
		const c = getRandomExponentialFloat({ min: 0.1, max: 10, significantDigits: 2 })
		const a = fraction.multiply(x.toPower(p)).setSignificantDigits(2).roundToPrecision()
		const b = fraction.multiply(c.toPower(p)).setSignificantDigits(2).roundToPrecision()
		return { a, b, c, p }
	},

	getSolution({ a, b, c, p }) {
		const aDivB = a.divide(b, true)
		const aDivBTimesCToP = aDivB.multiply(c.toPower(p))
		const ans = a.divide(b).toPower(p.invert()).multiply(c).setMinimumSignificantDigits(2)
		return { aDivB, aDivBTimesCToP, ans }
	},

	checkInput(data) {
		return compare('ans', data)
	},
})

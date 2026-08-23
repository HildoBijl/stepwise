import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'

export default buildMonoExercise({
	metadata: {
		skill: 'massFlowTrick',
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const wt = getRandomQuantity({ min: 200, max: 360, unit: 'kJ/kg', decimals: -1 }).setDecimals(0)
		const mdot = getRandomQuantity({ min: 20, max: 100, unit: 'g/s', significantDigits: 2 })
		const P = mdot.multiply(wt).setUnit('kW').roundToPrecision()
		return { mdot, P }
	},

	getSolution({ mdot, P }) {
		const mdots = mdot.simplify()
		const Ps = P.simplify()
		const wt = P.divide(mdot).setUnit('J/kg')
		return { mdots, Ps, wt }
	},

	checkInput(data) {
		return compareInputs('wt', data)
	},
})

import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'

export default buildMonoExercise({
	metadata: {
		skill: 'massFlowTrick',
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const q = getRandomQuantity({ min: 150, max: 250, unit: 'kJ/kg', decimals: -1 }).setDecimals(0)
		const mdot = getRandomQuantity({ min: 0.2, max: 1, unit: 'kg/s', significantDigits: 2 })
		const Qdot = mdot.multiply(q).setUnit('kW').roundToPrecision()
		return { q, Qdot }
	},

	getSolution({ q, Qdot }) {
		const qs = q.simplify()
		const Qdots = Qdot.simplify()
		const mdot = Qdots.divide(qs).setUnit('kg/s')
		return { qs, Qdots, mdot }
	},

	checkInput(data) {
		return compareInputs('mdot', data)
	},
})

import { buildMonoExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

export default buildMonoExercise({
	metaData: {
		skill: 'massFlowTrick',
		compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const q = getRandomFloatUnit({ min: 150, max: 250, unit: 'kJ/kg', decimals: -1 }).setDecimals(0)
		const mdot = getRandomFloatUnit({ min: 0.2, max: 1, unit: 'kg/s', significantDigits: 2 })
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
		return compare('mdot', data)
	},
})

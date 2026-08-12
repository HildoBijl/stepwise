import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

export function generateState() {
	const q = getRandomFloatUnit({ min: 150, max: 250, unit: 'kJ/kg' })
	const Q = getRandomFloatUnit({ min: 100, max: 200, decimals: -1, unit: 'MJ' }).setDecimals(0)
	const m = Q.divide(q).setUnit('kg').setDecimals(-1).roundToPrecision().setDecimals(0)
	return { Q, m }
}

export default buildSimpleExercise({
	metaData: {
		skill: 'calculateWithSpecificQuantities',
		compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateState,

	getSolution({ Q, m }) {
		const Qs = Q.simplify()
		const q = Qs.divide(m).setUnit('J/kg')
		return { Qs, q }
	},

	checkInput(data) {
		return compare('q', data)
	},
})

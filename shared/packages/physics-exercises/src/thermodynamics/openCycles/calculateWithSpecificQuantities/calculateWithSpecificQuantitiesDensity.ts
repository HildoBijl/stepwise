import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

export default buildSimpleExercise({
	metaData: {
		skill: 'calculateWithSpecificQuantities',
		compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},
	
	generateState() {
		const rho = getRandomFloatUnit({ min: 0.4, max: 1.2, unit: 'kg/m^3', significantDigits: 2 })
		return { rho }
	},

	getSolution({ rho }) {
		return { v: rho.invert() }
	},

	checkInput(data) {
		return compare('v', data)
	},
})

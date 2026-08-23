import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

export default buildMonoExercise({
	metadata: {
		skill: 'calculateWithSpecificQuantities',
		comparisons: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},
	
	generateParameters() {
		const wt = getRandomFloatUnit({ min: 600, max: 1200, unit: 'kJ/kg', decimals: -1 }).setDecimals(0)
		const m = getRandomFloatUnit({ min: 2, max: 10, unit: 'Mg', significantDigits: 2 })
		return { wt, m }
	},

	getSolution({ wt, m }) {
		const wts = wt.simplify()
		const ms = m.simplify()
		const Wt = wts.multiply(ms).setUnit('J')
		return { wts, ms, Wt }
	},

	checkInput(data) {
		return compareInputs('Wt', data)
	},
})

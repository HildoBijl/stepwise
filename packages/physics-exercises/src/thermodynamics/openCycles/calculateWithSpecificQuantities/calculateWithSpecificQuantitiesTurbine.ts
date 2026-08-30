import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'

import { buildMonoExercise } from '#physicsExerciseBuilding'

export default buildMonoExercise({
	metadata: {
		skill: 'calculateWithSpecificQuantities',
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},
	
	generateParameters() {
		const wt = getRandomQuantity({ min: 600, max: 1200, unit: 'kJ/kg', decimals: -1 }).setDecimals(0)
		const m = getRandomQuantity({ min: 2, max: 10, unit: 'Mg', significantDigits: 2 })
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

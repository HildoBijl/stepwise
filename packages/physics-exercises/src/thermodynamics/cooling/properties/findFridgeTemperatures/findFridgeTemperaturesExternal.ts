import { sample } from '@step-wise/js-utils'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { getTemperatures } from '../../coolingCycles/tools'

export default buildMonoExercise({
	metadata: {
		skill: 'findFridgeTemperatures',
		comparisons: { Quantity: { value: { significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const type = sample(['fridge', 'heatPump'] as const)
		const { TCond, TEvap, dTCold, dTWarm } = getTemperatures()
		return { type, TCond, TEvap, dTCold, dTWarm }
	},

	getSolution({ TCond, TEvap, dTCold, dTWarm }) {
		const TWarm = TCond.subtract(dTWarm)
		const TCold = TEvap.add(dTCold)
		return { TCold, TWarm }
	},

	checkInput(data) {
		return compareInputs(['TCold', 'TWarm'], data)
	},
})

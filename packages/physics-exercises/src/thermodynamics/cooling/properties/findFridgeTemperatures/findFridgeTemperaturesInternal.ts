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
		const { TCold, TWarm, dTCold, dTWarm } = getTemperatures()
		return { type, TCold, TWarm, dTCold, dTWarm }
	},

	getSolution({ type, TCold, TWarm, dTCold, dTWarm }) {
		const TEvap = TCold.subtract(dTCold)
		const TCond = TWarm.add(dTWarm)
		return { type, TCold, TWarm, dTCold, dTWarm, TEvap, TCond }
	},

	checkInput(data) {
		return compareInputs(['TEvap', 'TCond'], data)
	},
})

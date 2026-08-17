import { sample } from '@step-wise/js-utils'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { getTemperatures } from '../../coolingCycles/tools'

export default buildSimpleExercise({
	metaData: {
		skill: 'findFridgeTemperatures',
		compare: { FloatUnit: { float: { significantDigitTolerance: 1 } } },
	},

	generateState() {
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
		return compare(['TCold', 'TWarm'], data)
	},
})

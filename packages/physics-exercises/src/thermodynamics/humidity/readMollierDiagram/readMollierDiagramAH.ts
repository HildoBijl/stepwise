import { first, last } from '@step-wise/js-utils'
import { interpolateTable } from '@step-wise/interpolation'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'
import { maximumHumidity } from '@step-wise/physics-data'

export default buildMonoExercise({
	metadata: {
		skill: 'readMollierDiagram',
		comparisons: { Quantity: { value: { absoluteTolerance: 0.0005 } } },
	},

	generateParameters() {
		const temperatureRange = maximumHumidity.inputAxes[0]
		const T = getRandomQuantity({ min: 5, max: last(temperatureRange).number, unit: first(temperatureRange).unit, decimals: 0 })
		const RH = getRandomQuantity({ min: 20, max: 100, decimals: 0, unit: '%' })
		return { T, RH }
	},

	getSolution({ T, RH }) {
		const AHmax = interpolateTable(T, maximumHumidity)!.setSignificantDigits(2)
		const AH = RH.simplify().multiply(AHmax)
		return { AHmax, AH }
	},

	checkInput(data) {
		return compareInputs('AH', data)
	},
})

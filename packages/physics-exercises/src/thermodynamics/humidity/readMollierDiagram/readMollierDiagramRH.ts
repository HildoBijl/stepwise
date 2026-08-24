import { first, last } from '@step-wise/js-utils'
import { interpolateTable } from '@step-wise/interpolation'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'
import { maximumHumidityByTemperature } from '@step-wise/physics-data'

export default buildMonoExercise({
	metadata: {
		skill: 'readMollierDiagram',
		comparisons: { Quantity: { value: { absoluteTolerance: 0.04 } } },
	},

	generateParameters() {
		const temperatureRange = maximumHumidityByTemperature.inputAxes[0]
		const T = getRandomQuantity({ min: 5, max: last(temperatureRange).number, unit: first(temperatureRange).unit, decimals: 0 })
		const RH = getRandomQuantity({ min: 0.2, max: 1, unit: '' })
		const AHmax = interpolateTable(T, maximumHumidityByTemperature)!
		const AH = RH.multiply(AHmax).setDecimals(0).roundToPrecision()
		return { T, AH }
	},

	getSolution({ T, AH }) {
		const AHmax = interpolateTable(T, maximumHumidityByTemperature)!.setSignificantDigits(2)
		const RH = AH.divide(AHmax).setUnit('%').setDecimals(0)
		return { AHmax, RH }
	},

	checkInput(data) {
		return compareInputs('RH', data)
	},
})

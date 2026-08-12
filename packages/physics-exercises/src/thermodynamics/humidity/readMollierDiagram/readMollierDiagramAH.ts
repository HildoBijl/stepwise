import { first, last } from '@step-wise/utils'
import { tableInterpolate } from '@step-wise/interpolation'
import { buildSimpleExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { maximumHumidity } from '@step-wise/physics-data'

export default buildSimpleExercise({
	metaData: {
		skill: 'readMollierDiagram',
		compare: { FloatUnit: { float: { absoluteTolerance: 0.0005 } } },
	},

	generateState() {
		const temperatureRange = maximumHumidity.inputValues[0]
		const T = getRandomFloatUnit({ min: 5, max: last(temperatureRange).number, unit: first(temperatureRange).unit, decimals: 0 })
		const RH = getRandomFloatUnit({ min: 20, max: 100, decimals: 0, unit: '%' })
		return { T, RH }
	},

	getSolution({ T, RH }) {
		const AHmax = tableInterpolate(T, maximumHumidity)!.setSignificantDigits(2)
		const AH = RH.simplify().multiply(AHmax)
		return { AHmax, AH }
	},

	checkInput(data) {
		return compare('AH', data)
	},
})

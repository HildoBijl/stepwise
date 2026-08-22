import { first, last } from '@step-wise/js-utils'
import { tableInterpolate } from '@step-wise/interpolation'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { maximumHumidity } from '@step-wise/physics-data'

export default buildMonoExercise({
	metaData: {
		skill: 'readMollierDiagram',
		compare: { FloatUnit: { float: { absoluteTolerance: 0.04 } } },
	},

	generateParameters() {
		const temperatureRange = maximumHumidity.inputValues[0]
		const T = getRandomFloatUnit({ min: 5, max: last(temperatureRange).number, unit: first(temperatureRange).unit, decimals: 0 })
		const RH = getRandomFloatUnit({ min: 0.2, max: 1, unit: '' })
		const AHmax = tableInterpolate(T, maximumHumidity)!
		const AH = RH.multiply(AHmax).setDecimals(0).roundToPrecision()
		return { T, AH }
	},

	getSolution({ T, AH }) {
		const AHmax = tableInterpolate(T, maximumHumidity)!.setSignificantDigits(2)
		const RH = AH.divide(AHmax).setUnit('%').setDecimals(0)
		return { AHmax, RH }
	},

	checkInput(data) {
		return compare('RH', data)
	},
})

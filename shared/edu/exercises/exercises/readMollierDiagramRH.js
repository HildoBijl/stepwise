import { getRandomFloatUnit } from '../../../inputTypes/FloatUnit'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { checkParameter } from '../util/check'
import { maximumHumidity } from '../../../data/moistureProperties'
import { tableInterpolate } from '../../../util/interpolation'
import { firstOf, lastOf } from '../../../util/arrays'

export const data = {
	skill: 'readMollierDiagram',
	equalityOptions: {
		default: {
			absoluteMargin: 4, // 4 percent margin on the relative humidity.
		},
	},
}

export function generateState() {
	const temperatureRange = maximumHumidity.headers[0]
	const T = getRandomFloatUnit({
		min: 5, // Limit to higher temperatures to have some resolution in the plot.
		max: lastOf(temperatureRange).number,
		unit: firstOf(temperatureRange).unit,
		decimals: 0,
	})
	const RH = getRandomFloatUnit({
		min: 0.2, // Limit to RH above 20% to not have too low AHs.
		max: 1,
		unit: '',
	})
	const AHmax = tableInterpolate(T, maximumHumidity)
	const AH = RH.multiply(AHmax).setDecimals(0).roundToPrecision()
	return { T, AH }
}

export function getCorrect({ T, AH }) {
	const AHmax = tableInterpolate(T, maximumHumidity).setSignificantDigits(2)
	const RH = AH.divide(AHmax).setUnit('%').setDecimals(0)
	return { T, RH, AHmax, AH }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter(['RH'], correct, input, data.equalityOptions)
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

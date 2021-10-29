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
			absoluteMargin: 0.0005, // In standard units: kg/kg.
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
		min: 20, // Limit to RH above 20% to not have too low AHs.
		max: 100,
		decimals: 0,
		unit: '%',
	})
	return { T, RH }
}

export function getCorrect({ T, RH }) {
	RH = RH.simplify()
	const AHmax = tableInterpolate(T, maximumHumidity).setSignificantDigits(2)
	const AH = RH.multiply(AHmax)
	return { T, RH, AHmax, AH }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter(['AH'], correct, input, data.equalityOptions)
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

import { getRandomInteger } from '../../../util/random'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { checkParameter } from '../util/check'
import { withTemperature } from '../../../data/steamProperties'
import { tableInterpolate } from '../../../util/interpolation'

export const data = {
	skill: 'lookUpSteamProperties',
	equalityOptions: {
		default: {
			relativeMargin: 0.001,
		},
	},
}

export function generateState() {
	const temperatureRange = withTemperature.boilingPressure.headers[0]
	const T = temperatureRange[getRandomInteger(0, Math.min(25, temperatureRange.length))] // Limit to a certain part of the table.
	const type = getRandomInteger(1, 2) // Type 1: liquid line. Type 2: vapor line.
	return { T, type }
}

export function getCorrect({ T, type }) {
	// Get pressure.
	const p = tableInterpolate(T, withTemperature.boilingPressure)

	// Get enthalpy.
	h = tableInterpolate(T, type === 1 ? withTemperature.enthalpyLiquid : withTemperature.enthalpyVapor)

	// Get entropy.
	s = tableInterpolate(T, type === 1 ? withTemperature.entropyLiquid : withTemperature.entropyVapor)

	return { T, type, p, h, s }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter(['p', 'h', 's'], correct, input, data.equalityOptions)
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

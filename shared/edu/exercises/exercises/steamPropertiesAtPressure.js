import { getRandomInteger } from '../../../util/random'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { checkParameter } from '../util/check'
import { withPressure } from '../../../data/steamProperties'
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
	const pressureRange = withPressure.boilingTemperature.headers[0]
	const p = pressureRange[getRandomInteger(0, Math.min(25, pressureRange.length))] // Limit to a certain part of the table.
	const type = getRandomInteger(1, 2) // Type 1: liquid line. Type 2: vapor line.
	return { p, type }
}

export function getCorrect({ p, type }) {
	// Get pressure.
	const T = tableInterpolate(p, withPressure.boilingTemperature)

	// Get enthalpy.
	h = tableInterpolate(p, type === 1 ? withPressure.enthalpyLiquid : withPressure.enthalpyVapor)

	// Get entropy.
	s = tableInterpolate(p, type === 1 ? withPressure.entropyLiquid : withPressure.entropyVapor)

	return { p, type, T, h, s }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter(['T', 'h', 's'], correct, input, data.equalityOptions)
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

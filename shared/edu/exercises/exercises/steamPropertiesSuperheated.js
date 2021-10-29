import { getRandomInteger } from '../../../util/random'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { checkParameter } from '../util/check'
import { enthalpy, entropy } from '../../../data/steamProperties'
import { tableInterpolate } from '../../../util/interpolation'

export const data = {
	skill: 'lookUpSteamProperties',
	weight: 2,
	equalityOptions: {
		default: {
			relativeMargin: 0.001,
		},
	},
}

export function generateState() {
	// Extract pressure column.
	const pressureRange = enthalpy.headers[0]
	const p = pressureRange[getRandomInteger(3, Math.min(20, pressureRange.length))] // Limit to a certain part of the table.

	// Extract temperature row.
	const temperatureRange = enthalpy.headers[1]
	const T = temperatureRange[getRandomInteger(6, Math.min(24, temperatureRange.length))] // Limit to a certain part of the table.

	return { p, T }
}

export function getCorrect({ p, T }) {
	const h = tableInterpolate([p, T], enthalpy)
	const s = tableInterpolate([p, T], entropy)
	return { p, T, h, s }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter(['h', 's'], correct, input, data.equalityOptions)
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

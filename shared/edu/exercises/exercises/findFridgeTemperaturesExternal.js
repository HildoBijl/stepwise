import { selectRandomly } from '../../../util/random'
import { getSimpleExerciseProcessor } from '../util/simpleExercise'
import { checkParameter } from '../util/check'
import { getCycle } from './support/fridgeCycle'

export const data = {
	skill: 'findFridgeTemperatures',
	equalityOptions: {
		default: {
			significantDigitMargin: 1,
		},
	}
}

export function generateState() {
	const type = selectRandomly(['fridge', 'heatPump'])
	let { Tcond, Tevap, dTcold, dTwarm } = getCycle()
	return { type, Tcond, Tevap, dTcold, dTwarm }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter(['Tcold', 'Twarm'], correct, input, data.equalityOptions)
}

export function getCorrect({ type, Tcond, Tevap, dTcold, dTwarm }) {
	const Twarm = Tcond.subtract(dTwarm)
	const Tcold = Tevap.add(dTcold)
	return { type, Tcold, Twarm, dTcold, dTwarm, Tevap, Tcond }
}

export default {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

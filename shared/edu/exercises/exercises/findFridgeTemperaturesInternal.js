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
	let { Tcold, Twarm, dTcold, dTwarm } = getCycle()
	return { type, Tcold, Twarm, dTcold, dTwarm }
}

export function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter(['Tevap', 'Tcond'], correct, input, data.equalityOptions)
}

export function getCorrect({ type, Tcold, Twarm, dTcold, dTwarm }) {
	const Tevap = Tcold.subtract(dTcold)
	const Tcond = Twarm.add(dTwarm)
	return { type, Tcold, Twarm, dTcold, dTwarm, Tevap, Tcond }
}

export const processAction = getSimpleExerciseProcessor(checkInput, data)

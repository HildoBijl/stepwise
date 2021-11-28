const { selectRandomly } = require('../../../util/random')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { checkParameter } = require('../util/check')
const { getCycle } = require('./support/fridgeCycle')

const data = {
	skill: 'findFridgeTemperatures',
	equalityOptions: {
		default: {
			significantDigitMargin: 1,
		},
	}
}

function generateState() {
	const type = selectRandomly(['fridge', 'heatPump'])
	let { Tcold, Twarm, dTcold, dTwarm } = getCycle()
	return { type, Tcold, Twarm, dTcold, dTwarm }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return checkParameter(['Tevap', 'Tcond'], solution, input, data.equalityOptions)
}

function getSolution({ type, Tcold, Twarm, dTcold, dTwarm }) {
	const Tevap = Tcold.subtract(dTcold)
	const Tcond = Twarm.add(dTwarm)
	return { type, Tcold, Twarm, dTcold, dTwarm, Tevap, Tcond }
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
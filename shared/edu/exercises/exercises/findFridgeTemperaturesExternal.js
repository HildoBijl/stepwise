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
	let { Tcond, Tevap, dTcold, dTwarm } = getCycle()
	return { type, Tcond, Tevap, dTcold, dTwarm }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return checkParameter(['Tcold', 'Twarm'], solution, input, data.equalityOptions)
}

function getSolution({ type, Tcond, Tevap, dTcold, dTwarm }) {
	const Twarm = Tcond.subtract(dTwarm)
	const Tcold = Tevap.add(dTcold)
	return { type, Tcold, Twarm, dTcold, dTwarm, Tevap, Tcond }
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
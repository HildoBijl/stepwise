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
	const correct = getCorrect(state)
	return checkParameter(['Tcold', 'Twarm'], correct, input, data.equalityOptions)
}

function getCorrect({ type, Tcond, Tevap, dTcold, dTwarm }) {
	const Twarm = Tcond.subtract(dTcold)
	const Tcold = Tevap.add(dTwarm)
	return { type, Tcold, Twarm, dTcold, dTwarm, Tevap, Tcond }
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
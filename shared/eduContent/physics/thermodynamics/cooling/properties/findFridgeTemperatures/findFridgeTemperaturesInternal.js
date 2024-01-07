const { selectRandomly } = require('../../../../../../util')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../../eduTools')
const { getTemperatures } = require('../../coolingCycles')

const metaData = {
	skill: 'findFridgeTemperatures',
	comparison: {
		default: {
			significantDigitMargin: 1,
		},
	}
}

function generateState() {
	const type = selectRandomly(['fridge', 'heatPump'])
	let { TCold, TWarm, dTCold, dTWarm } = getTemperatures()
	return { type, TCold, TWarm, dTCold, dTWarm }
}

function getSolution({ type, TCold, TWarm, dTCold, dTWarm }) {
	const TEvap = TCold.subtract(dTCold)
	const TCond = TWarm.add(dTWarm)
	return { type, TCold, TWarm, dTCold, dTWarm, TEvap, TCond }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, ['TEvap', 'TCond'])
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

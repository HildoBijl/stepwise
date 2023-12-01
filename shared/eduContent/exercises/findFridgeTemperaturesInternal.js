const { selectRandomly } = require('../../util')
const { getSimpleExerciseProcessor, performComparison } = require('../../eduTools')
const { getTemperatures } = require('../physics/thermodynamics/coolingCycles')

const data = {
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

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison(['TEvap', 'TCond'], input, solution, data.comparison)
}

function getSolution({ type, TCold, TWarm, dTCold, dTWarm }) {
	const TEvap = TCold.subtract(dTCold)
	const TCond = TWarm.add(dTWarm)
	return { type, TCold, TWarm, dTCold, dTWarm, TEvap, TCond }
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
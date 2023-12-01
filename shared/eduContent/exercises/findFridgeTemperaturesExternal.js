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
	let { TCond, TEvap, dTCold, dTWarm } = getTemperatures()
	return { type, TCond, TEvap, dTCold, dTWarm }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison(['TCold', 'TWarm'], input, solution, data.comparison)
}

function getSolution({ type, TCond, TEvap, dTCold, dTWarm }) {
	const TWarm = TCond.subtract(dTWarm)
	const TCold = TEvap.add(dTCold)
	return { type, TCold, TWarm, dTCold, dTWarm, TEvap, TCond }
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
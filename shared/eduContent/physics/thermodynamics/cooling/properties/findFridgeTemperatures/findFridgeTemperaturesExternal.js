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
	let { TCond, TEvap, dTCold, dTWarm } = getTemperatures()
	return { type, TCond, TEvap, dTCold, dTWarm }
}

function getSolution({ TCond, TEvap, dTCold, dTWarm }) {
	const TWarm = TCond.subtract(dTWarm)
	const TCold = TEvap.add(dTCold)
	return { TCold, TWarm }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, ['TCold', 'TWarm'])
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

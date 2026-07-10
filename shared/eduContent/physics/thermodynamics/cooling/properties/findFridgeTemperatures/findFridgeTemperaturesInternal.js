const { sample } = require('@step-wise/utils')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../../eduTools')
const { getTemperatures } = require('../../coolingCycles')

const metaData = {
	skill: 'findFridgeTemperatures',
	compare: {
		FloatUnit: {
			float: {
				significantDigitTolerance: 1,
			},
		},
	}
}

function generateState() {
	const type = sample(['fridge', 'heatPump'])
	let { TCold, TWarm, dTCold, dTWarm } = getTemperatures()
	return { type, TCold, TWarm, dTCold, dTWarm }
}

function getSolution({ type, TCold, TWarm, dTCold, dTWarm }) {
	const TEvap = TCold.subtract(dTCold)
	const TCond = TWarm.add(dTWarm)
	return { type, TCold, TWarm, dTCold, dTWarm, TEvap, TCond }
}

function checkInput(data) {
	return compare(['TEvap', 'TCond'], data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

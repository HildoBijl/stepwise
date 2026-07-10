const { sample } = require('@step-wise/utils')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')
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
	let { TCond, TEvap, dTCold, dTWarm } = getTemperatures()
	return { type, TCond, TEvap, dTCold, dTWarm }
}

function getSolution({ TCond, TEvap, dTCold, dTWarm }) {
	const TWarm = TCond.subtract(dTWarm)
	const TCold = TEvap.add(dTCold)
	return { TCold, TWarm }
}

function checkInput(data) {
	return compare(['TCold', 'TWarm'], data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

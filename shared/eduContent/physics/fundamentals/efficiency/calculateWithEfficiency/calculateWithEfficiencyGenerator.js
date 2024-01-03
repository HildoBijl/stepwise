const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithEfficiency',
	comparison: { default: { significantDigitMargin: 1 } },
}

function generateState() {
	const P = getRandomFloatUnit({
		min: 2.5,
		max: 20,
		significantDigits: 2,
		unit: 'kW',
	})
	const eta = getRandomFloatUnit({
		min: 0.10,
		max: 0.30,
		significantDigits: 2,
		unit: '',
	})
	const Pin = P.divide(eta).roundToPrecision()

	return { P, Pin }
}

function getSolution({ P, Pin }) {
	return { eta: P.divide(Pin).setUnit('') }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'eta')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

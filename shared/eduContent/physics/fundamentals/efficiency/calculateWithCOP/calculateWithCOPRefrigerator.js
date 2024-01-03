const { getRandom } = require('../../../../../util')
const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithCOP',
	comparison: { default: { significantDigitMargin: 1 } },
}

function generateState() {
	const Ee = getRandomFloatUnit({
		min: 3,
		max: 8,
		significantDigits: 2,
		unit: 'MJ',
	})
	const epsilon = getRandom(2, 4)
	const Eout = Ee.multiply(epsilon + 1).roundToPrecision()

	return { Ee, Eout }
}

function getSolution({ Ee, Eout }) {
	return {
		Ef: Eout.subtract(Ee, true),
		epsilon: Eout.subtract(Ee).divide(Ee).setUnit('').setSignificantDigits(2),
	}
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'epsilon')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

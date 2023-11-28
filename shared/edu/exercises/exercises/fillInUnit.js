const { selectRandomly } = require('../../../util')
const { Unit } = require('../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../eduTools')

const data = {
	skill: 'fillInUnit',
	comparison: {
		type: Unit.equalityTypes.exact,
	}
}

function generateState() {
	return { unit: selectRandomly([
		new Unit('dC'),
		new Unit('mum'),
		new Unit('Ohm'),
		new Unit('kg * m / s^2'),
		new Unit('N / mm^2'),
		new Unit('kJ / kg * K'),
		new Unit('m^3 / kg * s^2'),
	 ]) }
}

function getSolution({ unit }) {
	return { ans: unit }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison('ans', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}
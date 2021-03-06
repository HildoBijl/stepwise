const { selectRandomly } = require('../../../util/random')
const { Unit } = require('../../../inputTypes/Unit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'fillInUnit',
	equalityOptions: {
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

function checkInput({ unit }, { ans }) {
	return unit.equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}
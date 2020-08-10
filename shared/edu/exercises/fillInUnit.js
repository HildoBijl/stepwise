const { selectRandomly } = require('../../util/random')
const { getSimpleExerciseProcessor } = require('../util/exercises/simpleExercise')
const { Unit, FOtoIO } = require('../util/inputTypes/Unit')

const data = {
	// ToDo: add data on difficulty.
	equalityOptions: {
		comparePrefixes: true,
		compareOrder: true,
	}
}

function generateState() {
	return { unit: selectRandomly([
		new Unit('kg * m / s^2'),
		new Unit('dC'),
		new Unit('mum'),
		new Unit('Ohm'),
		new Unit('N / mm^2'),
	 ]) }
}

function checkInput({ unit }, { ans }) {
	return unit.equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput),
	checkInput,
}
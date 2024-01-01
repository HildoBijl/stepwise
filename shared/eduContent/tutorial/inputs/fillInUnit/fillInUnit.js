const { selectRandomly } = require('../../../../util')
const { Unit } = require('../../../../inputTypes')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'fillInUnit',
	comparison: { ans: { type: Unit.equalityTypes.exact } },
}

function generateState() {
	return {
		unit: selectRandomly([
			new Unit('dC'),
			new Unit('mum'),
			new Unit('Ohm'),
			new Unit('kg * m / s^2'),
			new Unit('N / mm^2'),
			new Unit('kJ / kg * K'),
			new Unit('m^3 / kg * s^2'),
		])
	}
}

function getSolution({ unit }) {
	return { ans: unit }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'ans')
}

const exercise = { metaData, generateState, getSolution, checkInput }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}

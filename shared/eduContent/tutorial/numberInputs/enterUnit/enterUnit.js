const { sample } = require('@step-wise/utils')
const { Unit } = require('@step-wise/physics-core')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'enterUnit',
	compare: { ans: { target: 'unchanged' } },
}

function generateState() {
	return {
		unit: sample([
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

function checkInput(data) {
	return compare('ans', data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })

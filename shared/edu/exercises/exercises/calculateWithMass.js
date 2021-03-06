const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getRandomExponentialFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Unit } = require('../../../inputTypes/Unit')
const { selectRandomly } = require('../../../util/random')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

// Type 0: from (mu/m/./M)g to kg.
// Type 1: from (mu/m/./M)g to SI (so kg: which it may already be in).
// Type 2: from kg to (mu/m/./M)g.

const data = {
	skill: 'calculateWithMass',
	equalityOptions: {
		relativeMargin: 0.001,
		significantDigitMargin: 0,
		unitCheck: Unit.equalityTypes.exact,
	},
}

function generateState() {
	const type = getRandomInteger(0, 2)
	const prefix = selectRandomly(['mu', 'm', '', 'M'])

	let m = getRandomExponentialFloatUnit({
		min: 1e-1,
		max: 1e3,
		significantDigits: getRandomInteger(2, 3),
		unit: `${prefix}g`,
	})

	if (type === 2)
		m = m.setUnit('kg')

	return { m, type, prefix }
}

function getCorrect({ m, type, prefix }) {
	return (type === 2 ? m.setUnit(`${prefix}g`) : m.setUnit('kg'))
}

function checkInput(state, { ans }) {
	return getCorrect(state).equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
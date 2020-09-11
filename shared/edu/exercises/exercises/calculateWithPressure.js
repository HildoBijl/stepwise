const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getRandomExponentialFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Unit } = require('../../../inputTypes/Unit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'calculateWithPressure',
	equalityOptions: {
		relativeMargin: 0.001,
		significantDigitMargin: 0,
		unitCheck: Unit.equalityTypes.sameUnits,
	},
	getCorrect: (p, type) => {
		p = p.simplify()
		if (type === 0)
			p = p.useUnit('bar')
		return p
	},
}

function generateState() {
	// Type 0: from Pa to bar.
	// Type 1: from Pa to SI (so Pa: which it already is in).
	// Type 2: from bar to Pa.
	// Type 3: from bar to SI (so Pa).
	const type = getRandomInteger(0, 3)
	const p = (type <= 1 ? getRandomExponentialFloatUnit({
		min: 1e3,
		max: 2e7,
		significantDigits: getRandomInteger(2, 3),
		unit: 'Pa',
	}) : getRandomExponentialFloatUnit({
		min: 1e-2,
		max: 2e2,
		significantDigits: getRandomInteger(2, 3),
		unit: 'bar',
	}))

	return {
		p,
		type,
	}
}

function checkInput({ p, type }, { ans }) {
	return data.getCorrect(p, type).equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}
const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getRandomExponentialFloat } = require('../../../inputTypes/Float')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'fillInFloat',
	equalityOptions: { relativeMargin: 0.0001 },
}

function generateState() {
	return {
		x: getRandomExponentialFloat({
			min: 1e-6,
			max: 1e7,
			randomSign: true,
			significantDigits: getRandomInteger(2, 4),
		})
	}
}

function checkInput({ x }, { ans }) {
	return x.equals(ans, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}
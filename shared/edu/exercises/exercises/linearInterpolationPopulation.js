const { getRandom } = require('../../../util/random')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerRepeat } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { getRandomInteger } = require('../../../inputTypes/Integer')

const data = {
	skill: 'linearInterpolation',
	setup: combinerRepeat('solveLinearEquation', 2),
	steps: ['solveLinearEquation', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			absoluteMargin: 1,
		},
		x: {
			absoluteMargin: 0.005,
			relativeMargin: 0.01,
		}
	},
}

function generateState() {
	const type = getRandomInteger(1, 2) // 1 means give year, find population. 2 means give population, find year.
	const year1 = getRandomInteger(1950, 1970)
	const year2 = getRandomInteger(1980, 2000)
	const pop1 = getRandomInteger(1500, 2500)
	const pop2 = getRandomInteger(3500, 5500)
	const x = getRandom(0.1, 0.9)

	if (type === 1) {
		const year = Math.floor(year1 + x * (year2 - year1))
		return { type, year1, year2, pop1, pop2, year }
	} else {
		const pop = Math.round(pop1 + x * (pop2 - pop1))
		return { type, year1, year2, pop1, pop2, pop }
	}
}

function getCorrect({ type, year1, year2, pop1, pop2, year, pop }) {
	let x, popRounded, yearFloored
	if (type === 1) {
		x = (year - year1) / (year2 - year1)
		pop = pop1 + x * (pop2 - pop1)
		popRounded = Math.round(pop)
	} else {
		x = (pop - pop1) / (pop2 - pop1)
		year = year1 + x * (year2 - year1)
		yearFloored = Math.floor(year)
	}
	return { type, year1, year2, pop1, pop2, x, year, pop, yearFloored, popRounded }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('x', correct, input, data.equalityOptions)
		default:
			return checkParameter(state.type === 1 ? 'pop' : 'year', correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
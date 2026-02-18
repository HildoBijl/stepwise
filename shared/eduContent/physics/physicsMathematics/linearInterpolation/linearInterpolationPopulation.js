const { getRandomNumber } = require('../../../../util')
const { getRandomInteger, Float } = require('../../../../inputTypes')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../eduTools')

const metaData = {
	skill: 'linearInterpolation',
	steps: ['solveLinearEquation', 'solveLinearEquation'],

	comparison: {
		default: {
			absoluteMargin: 1,
		},
		x: {
			absoluteMargin: 0.005,
			relativeMargin: 0.01,
		}
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const type = getRandomInteger(1, 2) // 1 means give year, find population. 2 means give population, find year.
	const year1 = getRandomInteger(1950, 1970)
	const year2 = getRandomInteger(1980, 2000)
	const pop1 = getRandomInteger(1500, 2500)
	const pop2 = getRandomInteger(3500, 5500)
	const x = getRandomNumber(0.1, 0.9)

	if (type === 1) {
		const year = Math.floor(year1 + x * (year2 - year1))
		return { type, year1, year2, pop1, pop2, year }
	} else {
		const pop = Math.round(pop1 + x * (pop2 - pop1))
		return { type, year1, year2, pop1, pop2, pop }
	}
}

function getSolution({ type, year1, year2, pop1, pop2, year, pop }) {
	let x, popUnrounded, yearUnrounded
	if (type === 1) {
		x = (year - year1) / (year2 - year1)
		popUnrounded = pop1 + x * (pop2 - pop1)
		pop = Math.round(popUnrounded)
	} else {
		x = (pop - pop1) / (pop2 - pop1)
		yearUnrounded = year1 + x * (year2 - year1)
		year = Math.floor(yearUnrounded)
	}
	x = new Float({ number: x, significantDigits: 2 })
	return { type, year1, year2, pop1, pop2, x, year, pop, yearUnrounded, popUnrounded }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'x')
		default:
			return performComparison(exerciseData, exerciseData.state.type === 1 ? 'pop' : 'year')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

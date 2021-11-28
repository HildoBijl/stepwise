const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { generateState, getSolution: getSolutionPrevious } = require('./calculateEntropyChangeWithProperties')

const data = {
	skill: 'calculateMissedWork',
	setup: combinerAnd('poissonsLaw', combinerRepeat('calculateEntropyChange', 2), 'solveLinearEquation'),
	steps: ['poissonsLaw', 'calculateEntropyChange', 'calculateSpecificHeatAndMechanicalWork', 'calculateEntropyChange', null, 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}

function getSolution(state) {
	const solution = getSolutionPrevious(state)
	let { T1, T2, ds: dsIn, c } = solution
	dsIn = dsIn.setDecimals(0)
	const q = c.multiply(T2.subtract(T1)).multiply(-1).setUnit('J/kg')
	const dsOut = q.divide(T1).setUnit('J/kg * K').setDecimals(0)
	const ds = dsIn.add(dsOut)
	const wm = T1.multiply(ds).setUnit('J/kg')
	return { ...solution, q, dsIn, dsOut, ds, wm }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return checkParameter('T2', solution, input, data.equalityOptions)
		case 2:
			return checkParameter('dsIn', solution, input, data.equalityOptions)
		case 3:
			return checkParameter('q', solution, input, data.equalityOptions)
		case 4:
			return checkParameter('dsOut', solution, input, data.equalityOptions)
		case 5:
			return checkParameter('ds', solution, input, data.equalityOptions)
		default:
			return checkParameter('wm', solution, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}

const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const gasProperties = require('../../../data/gasProperties')
const { combinerRepeat } = require('../../../skillTracking')
const { checkParameter: checkParameter } = require('../util/check')
const { generateState, getCorrect: getCycleParameters } = require('./calculateClosedCycleSimple')

const data = {
	skill: 'createClosedCycleEnergyOverview',
	setup: combinerRepeat('calculateHeatAndWork', 3),
	steps: ['calculateHeatAndWork', 'calculateHeatAndWork', 'calculateHeatAndWork'],

	equalityOptions: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}

function getCorrect(state) {
	const { m, p1, V1, T1, p2, V2, T2, V3, T3 } = getCycleParameters(state)
	let { cv, cp } = gasProperties[state.medium]
	cv = cv.simplify()
	cp = cp.simplify()
	const Q12 = m.multiply(cp).multiply(T2.subtract(T1)).setUnit('J').useMinimumSignificantDigits(2)
	const W12 = p1.multiply(V2.subtract(V1)).setUnit('J').useMinimumSignificantDigits(2)
	const Q23 = p2.multiply(V2).multiply(Math.log(V3.number / V2.number)).setUnit('J').useMinimumSignificantDigits(2)
	const W23 = Q23
	const Q31 = m.multiply(cv).multiply(T1.subtract(T3)).setUnit('J').useMinimumSignificantDigits(2)
	const W31 = new FloatUnit('0 J')
	return { cv, cp, Q12, W12, Q23, W23, Q31, W31 }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['Q12', 'W12'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['Q23', 'W23'], correct, input, data.equalityOptions)
		case 3:
			return checkParameter(['Q31', 'W31'], correct, input, data.equalityOptions)
		default:
			return checkParameter(['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'], correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCycleParameters,
	getCorrect,
}

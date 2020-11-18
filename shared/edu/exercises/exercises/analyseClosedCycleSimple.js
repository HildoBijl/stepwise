const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const gasProperties = require('../../../data/gasProperties')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter: checkParameter } = require('../util/check')
const { generateState, getCorrect: getCycleParameters } = require('./calculateClosedCycleSimple')

const data = {
	skill: 'analyseClosedCycle',
	setup: combinerAnd('calculateClosedCycle', 'createClosedCycleEnergyOverview', 'calculateWithCOP'),
	steps: ['calculateClosedCycle', 'createClosedCycleEnergyOverview', null, 'calculateWithCOP'],

	equalityOptions: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}

function getCorrect(state) {
	const { m, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = getCycleParameters(state)
	let { Rs, cv, cp } = gasProperties[state.medium]
	cv = cv.simplify()
	cp = cp.simplify()
	const Q12 = m.multiply(cp).multiply(T2.subtract(T1)).setUnit('kJ').useMinimumSignificantDigits(2)
	const W12 = p1.multiply(V2.subtract(V1)).setUnit('kJ').useMinimumSignificantDigits(2)
	const Q23 = p2.multiply(V2).multiply(Math.log(V3.number / V2.number)).setUnit('kJ').useMinimumSignificantDigits(2)
	const W23 = Q23
	const Q31 = m.multiply(cv).multiply(T1.subtract(T3)).setUnit('kJ').useMinimumSignificantDigits(2)
	const W31 = new FloatUnit('0 kJ')
	const Wn = W12.add(W23, true).add(W31)
	const epsilon = Q12.divide(Wn.abs()).setUnit('').useMinimumSignificantDigits(2)
	const COP = epsilon.add(1)
	return { Rs, cv, cp, m, p1, V1, T1, p2, V2, T2, p3, V3, T3, Q12, W12, Q23, W23, Q31, W31, Wn, epsilon, COP }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	const { choice } = input
	console.log(input)
	console.log(choice)
	switch (step) {
		case 1:
			return checkParameter(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'], correct, input, data.equalityOptions)
		case 3:
			return choice === 1
		default:
			if (choice === 0)
				return false
			return checkParameter(['epsilon', 'COP'], correct, input, data.equalityOptions)
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

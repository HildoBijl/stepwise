const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const gasProperties = require('../../../data/gasProperties')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter: checkParameter } = require('../util/check')
const { generateState, getCorrect: getCycleParameters } = require('./calculateClosedCycleVTp')

const data = {
	skill: 'analyseClosedCycle',
	setup: combinerAnd('calculateClosedCycle', 'createClosedCycleEnergyOverview', 'calculateWithEfficiency'),
	steps: ['calculateClosedCycle', 'createClosedCycleEnergyOverview', null, 'calculateWithEfficiency'],

	equalityOptions: {
		default: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
		eta: {
			relativeMargin: 0.05,
			significantDigitMargin: 1,
		},
	},
}

function getCorrect(state) {
	const { m, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = getCycleParameters(state)
	let { Rs, cv, cp } = gasProperties[state.medium]
	cv = cv.simplify()
	cp = cp.simplify()

	const Q12 = m.multiply(cv).multiply(T2.subtract(T1)).setUnit('J')
	const W12 = new FloatUnit('0 J')
	const Q23 = p2.multiply(V2).multiply(Math.log(V3.number / V2.number)).setUnit('J')
	const W23 = Q23
	const Q31 = m.multiply(cp).multiply(T1.subtract(T3)).setUnit('J')
	const W31 = p3.multiply(V1.subtract(V3)).setUnit('J')

	const Wn = W12.add(W23, true).add(W31).useMinimumSignificantDigits(2)
	const Qin = Q12.add(Q23).useMinimumSignificantDigits(2)
	const eta = Wn.divide(Qin).setUnit('')
	return { Rs, cv, cp, m, p1, V1, T1, p2, V2, T2, p3, V3, T3, Q12, W12, Q23, W23, Q31, W31, Wn, Qin, eta }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	const { choice } = input
	switch (step) {
		case 1:
			return checkParameter(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'], correct, input, data.equalityOptions)
		case 3:
			return choice === 0
		default:
			if (choice === 1)
				return false
			return checkParameter('eta', correct, input, data.equalityOptions)
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

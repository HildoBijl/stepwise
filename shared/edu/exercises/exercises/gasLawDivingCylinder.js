const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Unit } = require('../../../inputTypes/Unit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { oxygen: Rs } = require('../../../data/specificGasConstants')
const { combinerAnd } = require('../../../skillTracking')

const data = {
	skill: 'gasLaw',
	setup: combinerAnd('calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature', 'specificGasConstant', 'solveLinearEquation'),
	steps: [['calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature'], 'specificGasConstant', 'solveLinearEquation'],

	equalityOptions: {
		V: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		m: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		T: {
			absoluteMargin: 0.2,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		Rs: {
			relativeMargin: 0.01,
			unitCheck: Unit.equalityTypes.sameUnitsAndPrefixes,
		},
		p: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const p = getRandomFloatUnit({ // Note: this is the final answer. It won't be part of the state.
		min: 180,
		max: 300,
		significantDigits: 2,
		unit: 'bar',
	})

	const V = getRandomFloatUnit({
		min: 3,
		max: 18,
		significantDigits: getRandomInteger(2, 3),
		unit: 'l',
	})

	const T = getRandomFloatUnit({
		min: 3,
		max: 18,
		significantDigits: 2,
		unit: 'dC',
	})

	const m = p.multiply(V).divide(Rs.multiply(T.useUnit('K'))).useUnit('kg')

	return { V, m, T }
}

function getCorrect({ V, m, T }) {
	V = V.simplify()
	T = T.simplify()
	const p = m.multiply(Rs).multiply(T).divide(V).useUnit('Pa')
	return { p, V, m, Rs, T }
}

function checkInput(state, { ansV, ansm, ansp, ansT, ansRs }, step, substep) {
	const { p, V, m, Rs, T } = getCorrect(state)

	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return V.equals(ansV, data.equalityOptions.V)
				case 2:
					return m.equals(ansm, data.equalityOptions.m)
				case 3:
					return T.equals(ansT, data.equalityOptions.T)
			}
		case 2:
			return Rs.equals(ansRs, data.equalityOptions.Rs)
		default:
			return p.equals(ansp, data.equalityOptions.p)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

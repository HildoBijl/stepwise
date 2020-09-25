const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Unit } = require('../../../inputTypes/Unit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { argon: Rs } = require('../../../data/specificGasConstants')

const data = {
	skill: 'gasLaw',
	setup: { type: 'and', skills: ['calculateWithPressure', 'calculateWithTemperature', 'calculateWithVolume', 'specificGasConstant', 'solveLinearEquation'] },
	steps: ['calculateWithPressure', 'calculateWithTemperature', 'calculateWithVolume', 'specificGasConstant', 'solveLinearEquation'],

	equalityOptions: {
		V: {
			relativeMargin: 0.001,
			significantDigitMargin: 0,
			unitCheck: Unit.equalityTypes.exact,
		},
		p: {
			relativeMargin: 0.001,
			significantDigitMargin: 0,
			unitCheck: Unit.equalityTypes.exact,
		},
		T: {
			absoluteMargin: 0.2,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		Rs: {
			relativeMargin: 0.01,
		},
		m: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	const p = getRandomFloatUnit({
		min: 200,
		max: 800,
		significantDigits: 2,
		unit: 'mbar',
	}).adjustSignificantDigits(1)

	const V = getRandomFloatUnit({
		min: 40,
		max: 200,
		decimals: -1,
		unit: 'cm^3',
	}).adjustSignificantDigits(1)

	const T = getRandomFloatUnit({
		min: 15,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})

	return { p, V, T }
}

function getCorrect({ p, V, T }) {
	V = V.simplify()
	p = p.simplify()
	T = T.simplify()
	const m = p.multiply(V).divide(Rs.multiply(T)).useUnit('kg')
	return { V, p, T, Rs, m }
}

function checkInput(state, { ansm, ansV, ansp, ansT, ansRs }, step) {
	const { V, p, T, Rs, m } = getCorrect(state)
	switch (step) {
		case 1:
			return V.equals(ansV, data.equalityOptions.V)
		case 2:
			return p.equals(ansp, data.equalityOptions.p)
		case 3:
			return T.equals(ansT, data.equalityOptions.T)
		case 4:
			return Rs.equals(ansRs, data.equalityOptions.Rs)
		default:
			return m.equals(ansm, data.equalityOptions.m)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}

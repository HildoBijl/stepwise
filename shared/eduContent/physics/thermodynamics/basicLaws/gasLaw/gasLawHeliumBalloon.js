const { Unit, getRandomFloatUnit } = require('../../../../../inputTypes')
const { helium: { Rs } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'gasLaw',
	steps: [['calculateWithMass', 'calculateWithTemperature', 'calculateWithPressure'], 'specificGasConstant', 'solveLinearEquation'],
	comparison: {
		ms: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		Ts: {
			absoluteMargin: 0.7,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		ps: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		Rs: {
			relativeMargin: 0.01,
			unitCheck: Unit.equalityTypes.sameUnitsAndPrefixes,
		},
		V: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const m = getRandomFloatUnit({
		min: 0.4,
		max: 2,
		significantDigits: 2,
		unit: 'g',
	})

	const T = getRandomFloatUnit({
		min: 10,
		max: 25,
		significantDigits: 2,
		unit: 'dC',
	})

	const p = getRandomFloatUnit({
		min: 1.0,
		max: 1.1,
		decimals: 2,
		unit: 'bar',
	})

	return { m, T, p }
}

function getSolution({ m, T, p }) {
	const ms = m.simplify()
	const Ts = T.simplify()
	const ps = p.simplify()
	const V = ms.multiply(Rs).multiply(Ts).divide(ps).setUnit('m^3')
	return { ps, V, ms, Rs, Ts }
}

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'ms')
				case 2:
					return performComparison(exerciseData, 'Ts')
				case 3:
					return performComparison(exerciseData, 'ps')
			}
		case 2:
			return performComparison(exerciseData, 'Rs')
		default:
			return performComparison(exerciseData, 'V')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

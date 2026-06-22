const { getRandomInteger, Unit, getRandomFloatUnit } = require('../../../../../inputTypes')
const { oxygen: { Rs } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'gasLaw',
	steps: [['calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature'], 'specificGasConstant', 'solveLinearEquation'],
	comparison: {
		Vs: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
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
addSetupFromSteps(metaData)

function generateState() {
	const p = getRandomFloatUnit({ // Note: this is the final input.wer. It won't be part of the state.
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

	const m = p.multiply(V).divide(Rs.multiply(T.setUnit('K'))).setUnit('kg').roundToPrecision()

	return { V, m, T }
}

function getSolution({ V, m, T }) {
	const Vs = V.simplify()
	const Ts = T.simplify()
	const ms = m
	const p = ms.multiply(Rs).multiply(Ts).divide(Vs).setUnit('Pa')
	return { p, Vs, ms, Rs, Ts }
}

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'Vs')
				case 2:
					return performComparison(exerciseData, 'ms')
				case 3:
					return performComparison(exerciseData, 'Ts')
			}
		case 2:
			return performComparison(exerciseData, 'Rs')
		default:
			return performComparison(exerciseData, 'p')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}

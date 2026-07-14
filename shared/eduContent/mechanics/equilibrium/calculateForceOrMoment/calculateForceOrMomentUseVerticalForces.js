const { isMultipleOf, deg2rad, integerRange, getRandomBoolean, getRandomInteger } = require('@step-wise/utils')
const { asExpression } = require('@step-wise/cas')
const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { Vector } = require('@step-wise/geometry')
const { isForce, createForce, createMoment, getAxisComponents } = require('@step-wise/engineering-mechanics')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'calculateForceOrMoment',
	...stepsToSetup([undefined, undefined, undefined]), // ToDo later: add steps, once they have been implemented.
	compare: {
		FloatUnit: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
		method: {},
	},
}

function generateState() {
	// Generate state.
	const points = integerRange(0, 3).map(() => new Vector(getRandomInteger(0, 4), getRandomInteger(0, 4)))
	const angle = getRandomInteger(5, 13) * 5
	const up = getRandomBoolean()
	const FD = getRandomFloatUnit({ min: 3, max: 18, significantDigits: 2, unit: 'kN' })

	// Run checks.
	if (points.some((point, index) => points.some((otherPoint, otherIndex) => index < otherIndex && point.equals(otherPoint))))
		return generateState()
	if (points[1].y === points[2].y)
		return generateState()

	// Assemble the state.
	return { points, angle, up, FD }
}

function getSolution(state) {
	const { points, angle, up, FD } = state
	const [A, B, C, D] = points
	const angleRad = deg2rad(angle)
	const method = 1

	// Define loads and their names.
	const forceLength = 1.25
	const loads = [
		createForce({ position: A, angle: (up ? 1 : -1) * Math.PI / 2 - angleRad }),
		createForce({ position: B, angle: 0 }),
		createForce({ position: C, angle: Math.PI }),
		createForce({ position: D, angle: (up ? -1 : 1) * Math.PI / 2 }),
	]
	const pointNames = ['A', 'B', 'C', 'D']
	const loadNames = loads.map((load, index) => ({ load, variable: asExpression(`${isForce(load) ? 'F' : 'M'}_(${pointNames[index]})`), point: points[index] }))

	// Decompose load and attach names.
	const decomposedLoads = [], decomposedLoadNames = []
	loads.forEach((load, index) => {
		if (isForce(load) && !isMultipleOf(load.angle, Math.PI / 2)) {
			const components = getAxisComponents(load)
			const magnitudes = [Math.abs(Math.cos(load.angle)), Math.abs(Math.sin(load.angle))]
			decomposedLoads.push(...components)
			decomposedLoadNames.push({ load: components[0], variable: asExpression(`F_(${pointNames[index]}x)`), point: points[index], magnitude: magnitudes[0] })
			decomposedLoadNames.push({ load: components[1], variable: asExpression(`F_(${pointNames[index]}y)`), point: points[index], magnitude: magnitudes[1] })
		} else {
			decomposedLoads.push(load)
			decomposedLoadNames.push({ load, variable: asExpression(`${isForce(load) ? 'F' : 'M'}_(${pointNames[index]})`), point: points[index] })
		}
	})

	// Calculate solution values.
	const FAy = FD
	const FA = FAy.divide(Math.cos(angleRad))

	return { ...state, points, A, B, C, D, angleRad, method, loads, loadNames, decomposedLoads, decomposedLoadNames, FAy, FA }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('method', data)
		case 2:
			return compare('FAy', data)
		default:
			return compare('FA', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })

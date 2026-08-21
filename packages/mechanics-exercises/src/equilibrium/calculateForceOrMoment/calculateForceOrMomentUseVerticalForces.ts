import { degreesToRadians, randomBoolean, randomInteger, integerRange, isMultipleOf } from '@step-wise/js-utils'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { Vector } from '@step-wise/geometry'
import { type Load, createForce, deriveLoadNames, getAxisComponents } from '@step-wise/engineering-mechanics'

export default buildStepExercise({
	metaData: {
		skill: 'calculateForceOrMoment',
		...stepsToSetup([undefined, undefined, undefined]), // ToDo later: add steps, once they have been implemented.
		compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		while (true) {
			const points = integerRange(0, 3).map(() => new Vector(randomInteger(0, 4), randomInteger(0, 4)))
			const angle = randomInteger(5, 13) * 5
			const up = randomBoolean()
			const FD = getRandomFloatUnit({ min: 3, max: 18, significantDigits: 2, unit: 'kN' })
			if (points.some((point, index) => points.some((otherPoint, otherIndex) => index < otherIndex && point.equals(otherPoint)))) continue
			if (points[1].y === points[2].y) continue
			return { points, angle, up, FD }
		}
	},

	getSolution(parameters) {
		const { points, angle, up, FD } = parameters
		const [A, B, C, D] = points
		const angleRad = degreesToRadians(angle)
		const method = 1

		// Set up loads and their names.
		const loads = [
			createForce({ position: A, angle: (up ? 1 : -1) * Math.PI / 2 - angleRad }),
			createForce({ position: B, angle: 0 }),
			createForce({ position: C, angle: Math.PI }),
			createForce({ position: D, angle: (up ? -1 : 1) * Math.PI / 2 }),
		]
		const pointNames = ['A', 'B', 'C', 'D']
		const namedPoints = points.map((position, index) => ({ name: pointNames[index], position }))
		const loadNames = deriveLoadNames(loads, namedPoints)

		// Decompose diagonal loads and add names.
		const decomposedLoads = loads.flatMap(load => !isMultipleOf(load.angle, Math.PI / 2) ? getAxisComponents(load) : load)
		const decomposedLoadNames = deriveLoadNames(decomposedLoads, namedPoints)

		// Calculate the respective load.
		const FAy = FD
		const FA = FAy.divide(Math.cos(angleRad))
		return { ...parameters, A, B, C, D, angleRad, method, loads, loadNames, decomposedLoads, decomposedLoadNames, FAy, FA }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('method', data)
			case 2: return compare('FAy', data)
			default: return compare('FA', data)
		}
	},
})

import { degreesToRadians, randomBoolean, randomInteger, integerRange, isMultipleOf } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'
import { Vector } from '@step-wise/geometry'
import { type Load, createForce, createMoment, deriveLoadNames, decomposeForceIntoAxisComponents, isForce } from '@step-wise/engineering-mechanics'

import { buildStepExercise, createStepExerciseMetadata } from '#exerciseBuilding/vectorPhysics'

export default buildStepExercise({
	metadata: {
		skill: 'calculateForceOrMoment',
		...createStepExerciseMetadata([undefined, undefined, undefined]), // ToDo later: add steps, once they have been implemented.
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		for (let attempt = 0; attempt < 100; attempt++) {
			const points = integerRange(0, 3).map(() => new Vector(randomInteger(0, 4), randomInteger(0, 4)))
			const angle = randomInteger(5, 13) * 5
			const up = randomBoolean()
			const right = randomBoolean()
			const clockwise = randomBoolean()
			const FD = getRandomQuantity({ min: 3, max: 18, significantDigits: 2, unit: 'kN' })
			if (points.some((point, index) => points.some((otherPoint, otherIndex) => index < otherIndex && point.equals(otherPoint)))) continue
			return { points, angle, up, right, clockwise, FD }
		}
		throw new Error('Failed to generate valid calculate-force-or-moment parameters after 100 attempts.')
	},

	getSolution(parameters) {
		const { points, angle, up, right, clockwise, FD } = parameters
		const [A, B, C, D] = points
		const angleRad = degreesToRadians(angle)
		const method = 0

		// Set up loads and their names.
		const loads = [
			createForce({ position: A, angle: right ? 0 : Math.PI }),
			createForce({ position: B, angle: (up ? -1 : 1) * Math.PI / 2 }),
			createMoment({ position: C, clockwise }),
			createForce({ position: D, angle: (up ? 1 : -1) * Math.PI / 2 + (right === up ? 1 : -1) * angleRad }),
		]
		const pointNames = ['A', 'B', 'C', 'D']
		const namedPoints = points.map((position, index) => ({ name: pointNames[index], position }))
		const loadNames = deriveLoadNames(loads, namedPoints)

		// Decompose diagonal loads and add names.
		const decomposedLoads = loads.flatMap(load => isForce(load) && !isMultipleOf(load.angle, Math.PI / 2) ? decomposeForceIntoAxisComponents(load) : load)
		const decomposedLoadNames = deriveLoadNames(decomposedLoads, namedPoints)

		// Calculate the respective load.
		const FDx = FD.multiply(Math.sin(angleRad))
		const FA = FDx
		return { ...parameters, A, B, C, D, angleRad, method, loads, loadNames, decomposedLoads, decomposedLoadNames, FDx, FA }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('method', data)
			case 2: return compareInputs('FDx', data)
			default: return compareInputs('FA', data)
		}
	},
})

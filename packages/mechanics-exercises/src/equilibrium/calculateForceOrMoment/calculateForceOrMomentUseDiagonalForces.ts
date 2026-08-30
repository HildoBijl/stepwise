import { randomBoolean, randomInteger, integerRange } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'
import { Vector } from '@step-wise/geometry'
import { type Load, type NamedLoad, createForce, deriveLoadNames } from '@step-wise/engineering-mechanics'

import { buildStepExercise, createStepExerciseMetadata } from '#mechanicsExerciseBuilding/vectorPhysics'

export default buildStepExercise({
	metadata: {
		skill: 'calculateForceOrMoment',
		...createStepExerciseMetadata([undefined, undefined, undefined]), // ToDo later: add steps, once they have been implemented.
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		for (let attempt = 0; attempt < 100; attempt++) {
			const points = integerRange(0, 3).map(() => new Vector(randomInteger(0, 4), randomInteger(0, 4)))
			const up = randomBoolean()
			const right = randomBoolean()
			const horizontal = randomBoolean()
			const FD = getRandomQuantity({ min: 3, max: 18, significantDigits: 2, unit: 'kN' })
			if (points.some((point, index) => points.some((otherPoint, otherIndex) => index < otherIndex && point.equals(otherPoint)))) continue
			const index = up === right ? -1 : 1
			if (points[1].x + index * points[1].y === points[2].x + index * points[2].y) continue
			return { points, up, right, horizontal, FD }
		}
		throw new Error('Failed to generate valid calculate-force-or-moment parameters after 100 attempts.')
	},

	getSolution(parameters) {
		const { points, up, right, horizontal, FD } = parameters
		const [A, B, C, D] = points
		const method = 2
		const angle = (up ? -1 : 1) * Math.PI / 2 + (up === right ? 1 : -1) * Math.PI / 4

		// Set up loads and their names.
		const loads = [
			createForce({ position: A, angle }),
			createForce({ position: B, angle: angle + Math.PI / 2 }),
			createForce({ position: C, angle: angle - Math.PI / 2 }),
			createForce({ position: D, angle: (horizontal ? (right ? 1 : 0) : (up ? 1 / 2 : -1 / 2)) * Math.PI }),
		]
		const pointNames = ['A', 'B', 'C', 'D']
		const namedPoints = points.map((position, index) => ({ name: pointNames[index], position }))
		const loadNames = deriveLoadNames(loads, namedPoints)

		// Decompose FD parallel and perpendicular to FB and FC.
		const decomposedDLoads = [
			createForce({ position: D, angle: angle + Math.PI, relativeMagnitude: 1 / Math.sqrt(2) }),
			createForce({ position: D, angle: angle + Math.PI + ((Number(up) + Number(right) + Number(horizontal)) % 2 === 0 ? -1 : 1) * Math.PI / 2, relativeMagnitude: 1 / Math.sqrt(2) }),
		]
		const decomposedLoads: Load[] = loads.flatMap((load, index) => index === 3 ? decomposedDLoads : load)
		const predefinedLoadNames: NamedLoad[] = [
			{ load: decomposedDLoads[0], name: { symbol: 'F', point: 'D', suffix: 'l' } },
			{ load: decomposedDLoads[1], name: { symbol: 'F', point: 'D', suffix: 'p' } },
		]
		const decomposedLoadNames = deriveLoadNames(decomposedLoads, namedPoints, predefinedLoadNames)

		// Calculate the respective load.
		const FDl = FD.divide(Math.sqrt(2))
		const FA = FDl
		return { ...parameters, A, B, C, D, angle, method, loads, loadNames, decomposedLoads, decomposedLoadNames, FDl, FA }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('method', data)
			case 2: return compareInputs('FDl', data)
			default: return compareInputs('FA', data)
		}
	},
})

import { degreesToRadians, randomInteger } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { Vector } from '@step-wise/geometry'
import { compareLoadSets, createForce, createMoment, isLoad } from '@step-wise/engineering-mechanics'

export default buildStepExercise({
	metaData: {
		skill: 'schematizeSupport',
		...createStepExerciseMetadata([undefined, undefined, undefined, undefined]),
		compare: { loads: compareSupportLoads },
	},

	generateParameters() {
		return {
			wallRotation: randomInteger(0, 11) * 30,
			beamRotation: randomInteger(-1, 1) * 30,
		}
	},

	getSolution(parameters) {
		const { wallRotation, beamRotation } = parameters
		const A = Vector.zero
		return {
			...parameters,
			points: [A],
			loads: [
				createForce({ position: A, angle: degreesToRadians(wallRotation) }),
				createMoment({ position: A, clockwise: true, openingAngle: degreesToRadians(wallRotation + beamRotation) }),
			],
			forcePerpendicular: 0,
			forceParallel: 3,
			moment: 0,
		}
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('forcePerpendicular', data)
			case 2: return compare('forceParallel', data)
			case 3: return compare('moment', data)
			default: return compare('loads', data)
		}
	},
})

function compareSupportLoads(input: unknown, solution: unknown): boolean {
	if (!Array.isArray(input) || !input.every(isLoad) || !Array.isArray(solution) || !solution.every(isLoad)) return false
	return compareLoadSets(input, solution, {
		Force: { direction: 'parallel', applicationPointAt: 'ignore' },
		Moment: { direction: 'ignore', openingAngle: 'ignore' },
	}).equal
}

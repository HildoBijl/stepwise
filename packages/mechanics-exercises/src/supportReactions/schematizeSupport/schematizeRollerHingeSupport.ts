import { degreesToRadians, randomInteger } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { Vector } from '@step-wise/geometry'
import { compareLoadLists, createForce, isLoad } from '@step-wise/engineering-mechanics'

export default buildStepExercise({
	metadata: {
		skill: 'schematizeSupport',
		...createStepExerciseMetadata([undefined, undefined, undefined, undefined]),
		comparisons: { loads: compareSupportLoads },
	},

	generateParameters() {
		return {
			wallRotation: randomInteger(0, 11) * 30,
			beamRotation: randomInteger(-1, 1) * 30,
		}
	},

	getSolution(parameters) {
		const { wallRotation } = parameters
		const A = Vector.zero
		return {
			...parameters,
			points: [A],
			loads: [createForce({ position: A, angle: degreesToRadians(wallRotation) })],
			forcePerpendicular: 0,
			forceParallel: 3,
			moment: 3,
		}
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('forcePerpendicular', data)
			case 2: return compareInputs('forceParallel', data)
			case 3: return compareInputs('moment', data)
			default: return compareInputs('loads', data)
		}
	},
})

function compareSupportLoads(input: unknown, solution: unknown): boolean {
	if (!Array.isArray(input) || !input.every(isLoad) || !Array.isArray(solution) || !solution.every(isLoad)) return false
	return compareLoadLists(input, solution, { force: { direction: 'parallel', applicationPointAt: 'ignore' } }).equal
}

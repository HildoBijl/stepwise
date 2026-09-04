import { degreesToRadians, anglesEqual, randomInteger } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { Vector } from '@step-wise/geometry'
import { createForce, isForce } from '@step-wise/engineering-mechanics'

import { mechanicsExerciseBuilders, createStepExerciseMetadata } from '#mechanicsExerciseBuilding'

const { buildStepExercise } = mechanicsExerciseBuilders.freeBodyDiagram

export default buildStepExercise({
	metadata: {
		skill: 'schematizeSupport',
		...createStepExerciseMetadata([undefined, undefined, undefined, undefined]),
		comparisons: { loads: checkHingeSupport },
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
			loads: [
				createForce({ position: A, angle: degreesToRadians(wallRotation) }),
				createForce({ position: A, angle: degreesToRadians(wallRotation + 90) }),
			],
			forcePerpendicular: 0,
			forceParallel: 0,
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

function checkHingeSupport(input: unknown, _solution: unknown, exerciseSolution: unknown): boolean {
	if (!Array.isArray(input) || input.length !== 2 || !input.every(isForce)) return false
	if (!hasSingleSolutionPoint(exerciseSolution, input[0].position)) return false
	if (input.some(load => !load.position.equals(input[0].position))) return false
	return !anglesEqual(input[0].angle, input[1].angle, Math.PI)
}

function hasSingleSolutionPoint(solution: unknown, position: Vector): boolean {
	if (typeof solution !== 'object' || solution === null || !('points' in solution)) return false
	const { points } = solution as { points?: unknown }
	return Array.isArray(points) && points.length === 1 && points[0] instanceof Vector && points[0].equals(position)
}

import { deg2rad, equalAngles, getRandomInteger } from '@step-wise/js-utils'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { Vector } from '@step-wise/geometry'
import { createForce, isForce } from '@step-wise/engineering-mechanics'

export default buildStepExercise({
	metaData: {
		skill: 'schematizeSupport',
		...stepsToSetup([undefined, undefined, undefined, undefined]),
		compare: { loads: checkHingeSupport },
	},

	generateState() {
		return {
			wallRotation: getRandomInteger(0, 11) * 30,
			beamRotation: getRandomInteger(-1, 1) * 30,
		}
	},

	getSolution(state) {
		const { wallRotation } = state
		const A = Vector.zero
		return {
			...state,
			points: [A],
			loads: [
				createForce({ position: A, angle: deg2rad(wallRotation) }),
				createForce({ position: A, angle: deg2rad(wallRotation + 90) }),
			],
			forcePerpendicular: 0,
			forceParallel: 0,
			moment: 3,
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

function checkHingeSupport(input: unknown, _solution: unknown, exerciseSolution: unknown): boolean {
	if (!Array.isArray(input) || input.length !== 2 || !input.every(isForce)) return false
	if (!hasSingleSolutionPoint(exerciseSolution, input[0].position)) return false
	if (input.some(load => !load.position.equals(input[0].position))) return false
	return !equalAngles(input[0].angle, input[1].angle, Math.PI)
}

function hasSingleSolutionPoint(solution: unknown, position: Vector): boolean {
	if (typeof solution !== 'object' || solution === null || !('points' in solution)) return false
	const { points } = solution as { points?: unknown }
	return Array.isArray(points) && points.length === 1 && points[0] instanceof Vector && points[0].equals(position)
}

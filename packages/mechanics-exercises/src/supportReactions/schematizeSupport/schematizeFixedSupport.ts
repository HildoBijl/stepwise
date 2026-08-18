import { degreesToRadians, anglesEqual, randomInteger } from '@step-wise/js-utils'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { Vector } from '@step-wise/geometry'
import { createForce, createMoment, isForce, isMoment } from '@step-wise/engineering-mechanics'

export default buildStepExercise({
	metaData: {
		skill: 'schematizeSupport',
		...stepsToSetup([undefined, undefined, undefined, undefined]),
		compare: { loads: checkFixedSupport },
	},

	generateState() {
		return {
			wallRotation: randomInteger(0, 11) * 30,
			beamRotation: randomInteger(-1, 1) * 30,
		}
	},

	getSolution(state) {
		const { wallRotation, beamRotation } = state
		const A = Vector.zero
		return {
			...state,
			points: [A],
			loads: [
				createForce({ position: A, angle: degreesToRadians(wallRotation) }),
				createForce({ position: A, angle: degreesToRadians(wallRotation + 90) }),
				createMoment({ position: A, clockwise: true, openingAngle: degreesToRadians(wallRotation + beamRotation) }),
			],
			forcePerpendicular: 0,
			forceParallel: 0,
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

function checkFixedSupport(input: unknown, _solution: unknown, exerciseSolution: unknown): boolean {
	if (!Array.isArray(input) || input.length !== 3) return false
	const forces = input.filter(isForce)
	const moments = input.filter(isMoment)
	if (forces.length !== 2 || moments.length !== 1) return false
	if (!hasSingleSolutionPoint(exerciseSolution, forces[0].position)) return false
	if (input.some(load => (!isForce(load) && !isMoment(load)) || !load.position.equals(forces[0].position))) return false
	return !anglesEqual(forces[0].angle, forces[1].angle, Math.PI)
}

function hasSingleSolutionPoint(solution: unknown, position: Vector): boolean {
	if (typeof solution !== 'object' || solution === null || !('points' in solution)) return false
	const { points } = solution as { points?: unknown }
	return Array.isArray(points) && points.length === 1 && points[0] instanceof Vector && points[0].equals(position)
}

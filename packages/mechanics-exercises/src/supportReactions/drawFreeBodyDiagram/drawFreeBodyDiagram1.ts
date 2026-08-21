import { randomBoolean, randomInteger } from '@step-wise/js-utils'
import { Vector } from '@step-wise/geometry'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { type Load, FBDComparison, compareLoadSets, createForce, createMoment, equalLoads, isLoad } from '@step-wise/engineering-mechanics'

export default buildStepExercise({
	metaData: {
		skill: 'drawFreeBodyDiagram',
		...stepsToSetup(['schematizeSupport', 'schematizeSupport', undefined]),
		compare: {
			loadsLeft: compareReactionLoads,
			loadsRight: compareReactionLoads,
			loads: compareAllLoads,
		},
	},

	generateParameters() {
		const distances = [
			randomBoolean() ? 0 : randomInteger(2, 4),
			randomInteger(4, 8),
			randomBoolean() ? 0 : randomInteger(2, 4),
		]
		const support1 = randomInteger(0, 3)
		const supportTypes = [support1, randomInteger(0, 3, { exclude: [support1] })]
		const loadPositionIndex = randomInteger(distances[0] === 0 ? 1 : 0, distances[2] === 0 ? 1 : 2)
		const loadProperties = {
			isForce: randomBoolean(),
			isPositiveDirection: randomBoolean(),
			position: [0, distances[0] + randomInteger(2, distances[1] - 2), distances[0] + distances[1] + distances[2]][loadPositionIndex],
		}
		return { distances, supportTypes, loadProperties }
	},

	getSolution(parameters) {
		const { distances, supportTypes, loadProperties } = parameters
		const left = Vector.zero
		const A = left.add(new Vector(distances[0], 0))
		const B = A.add(new Vector(distances[1], 0))
		const right = B.add(new Vector(distances[2], 0))
		const points = [left, A, B, right]
		const isAEnd = left.equals(A)
		const isBEnd = right.equals(B)

		const loadPositionIndex = loadProperties.position === 0 ? 0 : loadProperties.position === right.x ? 2 : 1
		const loadPoint = new Vector(loadProperties.position, 0)
		if (loadPositionIndex === 1) points.splice(2, 0, loadPoint)
		const externalLoad = loadProperties.isForce
			? createForce({ position: loadPoint, angle: loadProperties.isPositiveDirection ? Math.PI / 2 : -Math.PI / 2 })
			: createMoment({ position: loadPoint, clockwise: loadProperties.isPositiveDirection, openingAngle: loadPositionIndex === 0 ? 0 : Math.PI })

		const loadsLeft = getReactionLoads(supportTypes[0], A, isAEnd, true)
		const loadsRight = getReactionLoads(supportTypes[1], B, isBEnd, !isBEnd)
		const loads = [...loadsLeft, ...loadsRight, externalLoad]
		return { ...parameters, left, A, B, right, points, isAEnd, isBEnd, loadPositionIndex, loadPoint, externalLoad, loadsLeft, loadsRight, loads }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('loadsLeft', data)
			case 2: return compare('loadsRight', data)
			default: return compare('loads', data)
		}
	},
})

function getReactionLoads(supportType: number, point = Vector.zero, rotated = false, toRight = true): Load[] {
	const horizontal = createForce({ position: point, angle: toRight ? 0 : Math.PI })
	const vertical = createForce({ position: point, angle: -Math.PI / 2 })
	const moment = createMoment({ position: point, clockwise: toRight, openingAngle: toRight ? 0 : Math.PI })
	switch (supportType) {
		case 0: return [horizontal, vertical, moment]
		case 1: return [horizontal, vertical]
		case 2: return [rotated ? horizontal : vertical, moment]
		case 3: return [rotated ? horizontal : vertical]
		default: throw new Error(`Invalid support type: ${supportType}.`)
	}
}

function compareReactionLoads(input: unknown, solution: unknown): boolean {
	if (!isLoadArray(input) || !isLoadArray(solution)) return false
	return compareLoadSets(input, solution, FBDComparison).equal
}

function compareAllLoads(input: unknown, solution: unknown): boolean {
	if (!isLoadArray(input) || !isLoadArray(solution) || solution.length === 0) return false
	const externalLoad = solution[solution.length - 1]
	const externalInputIndex = input.findIndex(load => equalLoads(load, externalLoad, externalLoadComparison))
	if (externalInputIndex === -1) return false
	const reactionInput = input.filter((_, index) => index !== externalInputIndex)
	const reactionSolution = solution.slice(0, -1)
	return input.length === solution.length && compareLoadSets(reactionInput, reactionSolution, FBDComparison).equal
}

const externalLoadComparison = {
	Force: { direction: 'equal', applicationPointAt: 'ignore' },
	Moment: { direction: 'equal', openingAngle: 'ignore' },
} as const

function isLoadArray(value: unknown): value is Load[] {
	return Array.isArray(value) && value.every(isLoad)
}

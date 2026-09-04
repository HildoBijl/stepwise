import { randomBoolean, randomInteger } from '@step-wise/js-utils'
import { Vector } from '@step-wise/geometry'
import { compareInputs } from '@step-wise/exercise-grading'
import { type Load, freeBodyDiagramComparisonOptions, compareLoadLists, createForce, createMoment, loadsEqual, isLoad } from '@step-wise/engineering-mechanics'

import { mechanicsExerciseBuilders, createStepExerciseMetadata } from '#mechanicsExerciseBuilding'

const { buildStepExercise } = mechanicsExerciseBuilders.freeBodyDiagram

export default buildStepExercise({
	metadata: {
		skill: 'drawFreeBodyDiagram',
		...createStepExerciseMetadata(['schematizeSupport', 'schematizeSupport', undefined]),
		comparisons: {
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
			: createMoment({ position: loadPoint, clockwise: loadProperties.isPositiveDirection, openingDirection: loadPositionIndex === 0 ? 0 : Math.PI })

		const loadsLeft = getReactionLoads(supportTypes[0], A, isAEnd, true)
		const loadsRight = getReactionLoads(supportTypes[1], B, isBEnd, !isBEnd)
		const loads = [...loadsLeft, ...loadsRight, externalLoad]
		return { ...parameters, left, A, B, right, points, isAEnd, isBEnd, loadPositionIndex, loadPoint, externalLoad, loadsLeft, loadsRight, loads }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('loadsLeft', data)
			case 2: return compareInputs('loadsRight', data)
			default: return compareInputs('loads', data)
		}
	},
})

function getReactionLoads(supportType: number, point = Vector.zero, rotated = false, toRight = true): Load[] {
	const horizontal = createForce({ position: point, angle: toRight ? 0 : Math.PI })
	const vertical = createForce({ position: point, angle: -Math.PI / 2 })
	const moment = createMoment({ position: point, clockwise: toRight, openingDirection: toRight ? 0 : Math.PI })
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
	return compareLoadLists(input, solution, freeBodyDiagramComparisonOptions).equal
}

function compareAllLoads(input: unknown, solution: unknown): boolean {
	if (!isLoadArray(input) || !isLoadArray(solution) || solution.length === 0) return false
	const externalLoad = solution[solution.length - 1]
	const externalInputIndex = input.findIndex(load => loadsEqual(load, externalLoad, externalLoadComparison))
	if (externalInputIndex === -1) return false
	const reactionInput = input.filter((_, index) => index !== externalInputIndex)
	const reactionSolution = solution.slice(0, -1)
	return input.length === solution.length && compareLoadLists(reactionInput, reactionSolution, freeBodyDiagramComparisonOptions).equal
}

const externalLoadComparison = {
	force: { direction: 'equal', applicationPointAt: 'ignore' },
	moment: { direction: 'equal', openingDirection: 'ignore' },
} as const

function isLoadArray(value: unknown): value is Load[] {
	return Array.isArray(value) && value.every(isLoad)
}

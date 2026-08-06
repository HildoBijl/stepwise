import { equalAngles, getOneToOneMatching } from '@step-wise/utils'
import { type Load, FBDComparison, compareLoadSets, equalLoads, isForce, isLoad, isMoment } from '@step-wise/engineering-mechanics'

const externalComparison = {
	Force: { direction: 'equal', applicationPointAt: 'ignore' },
	Moment: { direction: 'equal', openingAngle: 'ignore' },
} as const

export function compareExerciseLoads(input: unknown, solution: unknown): boolean {
	if (!isLoadArray(input) || !isLoadArray(solution) || solution.length === 0) return false
	const externalInputIndex = input.findIndex(load => equalLoads(load, solution[0], externalComparison))
	if (externalInputIndex === -1) return false
	return input.length === solution.length && compareLoadSets(input.filter((_, index) => index !== externalInputIndex), solution.slice(1), FBDComparison).equal
}

export function getLoadDirectionIndices(input: unknown, solution: readonly Load[]): boolean[] {
	const defaults = solution.map(() => true)
	if (!isLoadArray(input)) return defaults
	const externalInputIndex = input.findIndex(load => equalLoads(load, solution[0], externalComparison))
	if (externalInputIndex === -1) return defaults
	const reactionInput = input.filter((_, index) => index !== externalInputIndex)
	const reactionLoads = solution.slice(1)
	const matching = getOneToOneMatching(reactionLoads, reactionInput, (solutionLoad, inputLoad) => equalLoads(inputLoad, solutionLoad, FBDComparison))
	if (matching.some(index => index === undefined) || reactionInput.length !== reactionLoads.length) return defaults
	return [true, ...reactionLoads.map((load, index) => hasSameDirection(reactionInput[matching[index] as number], load))]
}

function hasSameDirection(input: Load, solution: Load): boolean {
	if (isForce(input) && isForce(solution)) return equalAngles(input.angle, solution.angle)
	if (isMoment(input) && isMoment(solution)) return input.clockwise === solution.clockwise
	return false
}

function isLoadArray(value: unknown): value is Load[] {
	return Array.isArray(value) && value.every(isLoad)
}

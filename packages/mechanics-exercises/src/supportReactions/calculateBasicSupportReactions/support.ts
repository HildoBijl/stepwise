import { anglesEqual, getOneToOneMatching } from '@step-wise/js-utils'
import { type Load, freeBodyDiagramComparisonOptions, loadsEqual, isForce, isLoad, isMoment } from '@step-wise/engineering-mechanics'

export function getLoadDirectionIndices(input: unknown, solution: readonly Load[]): boolean[] {
	const defaults = solution.map(() => true)
	if (!isLoadArray(input)) return defaults
	const externalInputIndex = input.findIndex(load => loadsEqual(load, solution[0], freeBodyDiagramComparisonOptions))
	if (externalInputIndex === -1) return defaults
	const reactionInput = input.filter((_, index) => index !== externalInputIndex)
	const reactionLoads = solution.slice(1)
	const matching = getOneToOneMatching(reactionLoads, reactionInput, (solutionLoad, inputLoad) => loadsEqual(inputLoad, solutionLoad, freeBodyDiagramComparisonOptions))
	if (matching.some(index => index === undefined) || reactionInput.length !== reactionLoads.length) return defaults
	return [true, ...reactionLoads.map((load, index) => hasSameDirection(reactionInput[matching[index] as number], load))]
}

function hasSameDirection(input: Load, solution: Load): boolean {
	if (isForce(input) && isForce(solution)) return anglesEqual(input.angle, solution.angle)
	if (isMoment(input) && isMoment(solution)) return input.clockwise === solution.clockwise
	return false
}

function isLoadArray(value: unknown): value is Load[] {
	return Array.isArray(value) && value.every(isLoad)
}

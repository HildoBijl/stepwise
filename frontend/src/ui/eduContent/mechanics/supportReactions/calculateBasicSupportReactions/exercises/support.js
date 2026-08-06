import { FBDComparison, compareLoadSets, deriveLoadNames, equalLoads } from '@step-wise/engineering-mechanics'
import { loadNameToVariable } from '@step-wise/mechanics-exercises'

const externalComparison = { Force: { direction: 'equal', applicationPointAt: 'ignore' }, Moment: { direction: 'equal', openingAngle: 'ignore' } }

export function compareExerciseLoads(input, solution) {
	if (!Array.isArray(input) || !Array.isArray(solution) || solution.length === 0) return false
	const externalInputIndex = input.findIndex(load => equalLoads(load, solution[0], externalComparison))
	return externalInputIndex !== -1 && input.length === solution.length && compareLoadSets(input.filter((_, index) => index !== externalInputIndex), solution.slice(1), FBDComparison).equal
}

export function getNamedLoads(loads, solution) {
	loads = loads ?? []
	const namedPoints = Object.entries(solution.points).map(([name, position]) => ({ name, position }))
	const predefined = [{ load: solution.externalLoad, name: solution.loadNameDefinitions[0] }]
	return deriveLoadNames(loads, namedPoints, predefined, { predefinedComparison: externalComparison })
}

export function getLoadVariables(solution) {
	return solution.loadNameDefinitions.map(loadNameToVariable)
}

export function getLoadInputId(loadNameOrVariable) {
	if (loadNameOrVariable.type === 'Expression')
		return `${loadNameOrVariable.symbol}${loadNameOrVariable.subscript ?? ''}`
	return `${loadNameOrVariable.symbol}${loadNameOrVariable.point ?? ''}${loadNameOrVariable.suffix ?? ''}`
}

export function getUnknownNamedLoads(loads, solution) {
	return getNamedLoads(loads, solution).filter(({ load }) => !equalLoads(load, solution.externalLoad, externalComparison))
}

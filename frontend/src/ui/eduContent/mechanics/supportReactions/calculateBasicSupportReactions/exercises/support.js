import { freeBodyDiagramComparisonOptions, deriveLoadNames, loadsEqual } from '@step-wise/engineering-mechanics'
import { loadNameToVariable } from '@step-wise/mechanics-exercises'

export function getNamedLoads(loads, solution) {
	loads = Array.isArray(loads) ? loads : []
	const namedPoints = Object.entries(solution.points).map(([name, position]) => ({ name, position }))
	const predefined = [{ load: solution.externalLoad, name: solution.loadNameDefinitions[0] }]
	return deriveLoadNames(loads, namedPoints, predefined, { predefinedLoadComparison: freeBodyDiagramComparisonOptions })
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
	return getNamedLoads(loads, solution).filter(({ load }) => !loadsEqual(load, solution.externalLoad, freeBodyDiagramComparisonOptions))
}

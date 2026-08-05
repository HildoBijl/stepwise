import { equalAngles } from '@step-wise/utils'

import { type Force, type Load, type LoadType, type Moment, loadTypes } from './types'
import { type ForceApplicationComparison, type ForceComparisonOptionsInput, type ForceDirectionComparison, type ForcePositionComparison, type LoadComparisonOptionsInput, type MomentComparisonOptionsInput, type MomentDirectionComparison, type MomentOpeningAngleComparison, type MomentPositionComparison, resolveForceComparisonOptions, resolveLoadComparisonOptions, resolveMomentComparisonOptions, } from './comparisonOptions'

/*
 * Types to report comparison differences.
 */

export type LoadComparisonDifference =
	| { type: 'loadType', input: LoadType, solution: LoadType }
	| { type: 'position', comparison: ForcePositionComparison | MomentPositionComparison }
	| { type: 'direction', comparison: ForceDirectionComparison | MomentDirectionComparison }
	| { type: 'applicationPointAt', comparison: ForceApplicationComparison }
	| { type: 'openingAngle', comparison: MomentOpeningAngleComparison }

export type LoadComparisonReport = {
	equal: boolean
	differences: LoadComparisonDifference[]
}

/*
 * Publicly accessible compare functions.
 */

export function compareForces(input: Force, solution: Force, options: ForceComparisonOptionsInput = {}): LoadComparisonReport {
	const resolvedOptions = resolveForceComparisonOptions(options)
	const differences: LoadComparisonDifference[] = []
	if (!compareForcePositions(input, solution, resolvedOptions.position)) differences.push({ type: 'position', comparison: resolvedOptions.position })
	if (!compareForceDirections(input, solution, resolvedOptions.direction)) differences.push({ type: 'direction', comparison: resolvedOptions.direction })
	if (resolvedOptions.applicationPointAt === 'equal' && input.applicationPointAt !== solution.applicationPointAt) differences.push({ type: 'applicationPointAt', comparison: resolvedOptions.applicationPointAt })
	return { equal: differences.length === 0, differences }
}

export function compareMoments(input: Moment, solution: Moment, options: MomentComparisonOptionsInput = {}): LoadComparisonReport {
	const resolvedOptions = resolveMomentComparisonOptions(options)
	const differences: LoadComparisonDifference[] = []
	if (!compareMomentPositions(input, solution, resolvedOptions.position)) differences.push({ type: 'position', comparison: resolvedOptions.position })
	if (!compareMomentDirections(input, solution, resolvedOptions.direction)) differences.push({ type: 'direction', comparison: resolvedOptions.direction })
	if (!compareMomentOpeningAngles(input, solution, resolvedOptions.openingAngle)) differences.push({ type: 'openingAngle', comparison: resolvedOptions.openingAngle })
	return { equal: differences.length === 0, differences }
}

export function compareLoads(input: Load, solution: Load, options: LoadComparisonOptionsInput = {}): LoadComparisonReport {
	if (input.type !== solution.type) return { equal: false, differences: [{ type: 'loadType', input: input.type, solution: solution.type }] }
	const resolvedOptions = resolveLoadComparisonOptions(options)
	switch (input.type) {
		case loadTypes.force: return compareForces(input, solution as Force, resolvedOptions.Force)
		case loadTypes.moment: return compareMoments(input, solution as Moment, resolvedOptions.Moment)
	}
}

export function equalLoads(input: Load, solution: Load, options: LoadComparisonOptionsInput = {}): boolean {
	return compareLoads(input, solution, options).equal
}

/*
 * Comparison internals.
 */

function compareForcePositions(input: Force, solution: Force, comparison: ForcePositionComparison): boolean {
	switch (comparison) {
		case 'equal': return solution.position.equals(input.position)
		case 'equalLine':
			const relativePosition = input.position.subtract(solution.position)
			return relativePosition.isZero() || equalAngles(solution.angle, relativePosition.argument, Math.PI)
		case 'ignore': return true
	}
}

function compareForceDirections(input: Force, solution: Force, comparison: ForceDirectionComparison): boolean {
	switch (comparison) {
		case 'equal': return equalAngles(input.angle, solution.angle)
		case 'parallel': return equalAngles(input.angle, solution.angle, Math.PI)
		case 'ignore': return true
	}
}

function compareMomentPositions(input: Moment, solution: Moment, comparison: MomentPositionComparison): boolean {
	switch (comparison) {
		case 'equal': return solution.position.equals(input.position)
		case 'ignore': return true
	}
}

function compareMomentDirections(input: Moment, solution: Moment, comparison: MomentDirectionComparison): boolean {
	switch (comparison) {
		case 'equal': return input.clockwise === solution.clockwise
		case 'ignore': return true
	}
}

function compareMomentOpeningAngles(input: Moment, solution: Moment, comparison: MomentOpeningAngleComparison): boolean {
	switch (comparison) {
		case 'equal': return equalAngles(input.openingAngle, solution.openingAngle)
		case 'ignore': return true
	}
}

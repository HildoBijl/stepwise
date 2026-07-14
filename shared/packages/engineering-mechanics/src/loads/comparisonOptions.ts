import { mergeDefaults } from '@step-wise/utils'

// Define Force types.
export type ForcePositionComparison = 'equal' | 'equalLine' | 'ignore'
export type ForceDirectionComparison = 'equal' | 'parallel' | 'ignore'
export type ForceApplicationComparison = 'equal' | 'ignore'

export type ForceComparisonOptions = {
	position: ForcePositionComparison
	direction: ForceDirectionComparison
	applicationPointAt: ForceApplicationComparison
}
export type ForceComparisonOptionsInput = Partial<ForceComparisonOptions>

// Define Moment types.
export type MomentPositionComparison = 'equal' | 'ignore'
export type MomentDirectionComparison = 'equal' | 'ignore'
export type MomentOpeningAngleComparison = 'equal' | 'ignore'

export type MomentComparisonOptions = {
	position: MomentPositionComparison
	direction: MomentDirectionComparison
	openingAngle: MomentOpeningAngleComparison
}
export type MomentComparisonOptionsInput = Partial<MomentComparisonOptions>

// Define Load types.
export type LoadComparisonOptions = {
	Force: ForceComparisonOptions
	Moment: MomentComparisonOptions
}
export type LoadComparisonOptionsInput = {
	Force?: ForceComparisonOptionsInput
	Moment?: MomentComparisonOptionsInput
}

// Set up defaults.
export const defaultForceComparison: ForceComparisonOptions = {
	position: 'equal',
	direction: 'equal',
	applicationPointAt: 'equal',
}
export const defaultMomentComparison: MomentComparisonOptions = {
	position: 'equal',
	direction: 'equal',
	openingAngle: 'equal',
}
export const defaultLoadComparison: LoadComparisonOptions = {
	Force: defaultForceComparison,
	Moment: defaultMomentComparison,
}

// Set up resolving functions.
export function resolveForceComparisonOptions(options: ForceComparisonOptionsInput = {}, defaults = defaultForceComparison): ForceComparisonOptions {
	const resolvedOptions = mergeDefaults(options, defaults)
	if (resolvedOptions.position === 'equalLine' && resolvedOptions.direction === 'ignore') throw new Error(`Invalid Force comparison options: cannot have the position require "equal line" while the direction is left ignored.`)
	return resolvedOptions
}
export function resolveMomentComparisonOptions(options: MomentComparisonOptionsInput = {}, defaults = defaultMomentComparison): MomentComparisonOptions {
	return mergeDefaults(options, defaults)
}
export function resolveLoadComparisonOptions(options: LoadComparisonOptionsInput = {}, defaults = defaultLoadComparison): LoadComparisonOptions {
	return {
		Force: resolveForceComparisonOptions(options.Force, defaults.Force),
		Moment: resolveMomentComparisonOptions(options.Moment, defaults.Moment),
	}
}

// Set up specific FBD comparison options.
export const FBDComparison = resolveLoadComparisonOptions({
	Force: {
		direction: 'parallel',
		applicationPointAt: 'ignore',
	},
	Moment: {
		direction: 'ignore',
		openingAngle: 'ignore',
	},
})

import { mergeDefaults } from '@step-wise/utils'

// Define Force types.
export type ForcePositionComparison = 'equal' | 'equalLine' | 'ignore'
export type ForceDirectionComparison = 'equal' | 'parallel' | 'ignore'
export type ApplicationPointComparison = 'equal' | 'ignore'

export type ForceComparisonOptions = {
	position: ForcePositionComparison
	direction: ForceDirectionComparison
	applicationPointAt: ApplicationPointComparison
}
export type ForceComparisonOptionsInput = Partial<ForceComparisonOptions>

// Define Moment types.
export type MomentPositionComparison = 'equal' | 'ignore'
export type MomentDirectionComparison = 'equal' | 'ignore'

export type MomentComparisonOptions = {
	position: MomentPositionComparison
	direction: MomentDirectionComparison
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
}
export const defaultLoadComparison: LoadComparisonOptions = {
	Force: defaultForceComparison,
	Moment: defaultMomentComparison,
}

// Set up resolving functions.
export function resolveForceComparisonOptions(options: ForceComparisonOptionsInput = {}): ForceComparisonOptions {
	const resolvedOptions = mergeDefaults(options, defaultForceComparison)
	if (resolvedOptions.position === 'equalLine' && resolvedOptions.direction === 'ignore') throw new Error(`Invalid Force comparison options: cannot have the position require "equal line" while the direction is left ignored.`)
	return resolvedOptions
}
export function resolveMomentComparisonOptions(options: MomentComparisonOptionsInput = {}): MomentComparisonOptions {
	return mergeDefaults(options, defaultMomentComparison)
}
export function resolveLoadComparisonOptions(options: LoadComparisonOptionsInput = {}): LoadComparisonOptions {
	return {
		Force: resolveForceComparisonOptions(options.Force),
		Moment: resolveMomentComparisonOptions(options.Moment),
	}
}

// Set up specific FBD comparison options.
export const freeBodyDiagramComparison = resolveLoadComparisonOptions({
	Force: {
		direction: 'parallel',
		applicationPointAt: 'ignore',
	},
	Moment: {
		direction: 'ignore',
	},
})

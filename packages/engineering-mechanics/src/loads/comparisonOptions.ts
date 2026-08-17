import { isIn, mergeDefaults } from '@step-wise/js-utils'

// Define Force types.
export const forcePositionComparisons = ['equal', 'equalLine', 'ignore'] as const
export const forceDirectionComparisons = ['equal', 'parallel', 'ignore'] as const
export const forceApplicationComparisons = ['equal', 'ignore'] as const

export type ForcePositionComparison = typeof forcePositionComparisons[number]
export type ForceDirectionComparison = typeof forceDirectionComparisons[number]
export type ForceApplicationComparison = typeof forceApplicationComparisons[number]

export type ForceComparisonOptions = {
	position: ForcePositionComparison
	direction: ForceDirectionComparison
	applicationPointAt: ForceApplicationComparison
}
export type ForceComparisonOptionsInput = Partial<ForceComparisonOptions>

// Define Moment types.
export const momentPositionComparisons = ['equal', 'ignore'] as const
export const momentDirectionComparisons = ['equal', 'ignore'] as const
export const momentOpeningAngleComparisons = ['equal', 'ignore'] as const

export type MomentPositionComparison = typeof momentPositionComparisons[number]
export type MomentDirectionComparison = typeof momentDirectionComparisons[number]
export type MomentOpeningAngleComparison = typeof momentOpeningAngleComparisons[number]

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
	return validateForceComparisonOptions(resolvedOptions)
}
export function resolveMomentComparisonOptions(options: MomentComparisonOptionsInput = {}, defaults = defaultMomentComparison): MomentComparisonOptions {
	return validateMomentComparisonOptions(mergeDefaults(options, defaults))
}
export function resolveLoadComparisonOptions(options: LoadComparisonOptionsInput = {}, defaults = defaultLoadComparison): LoadComparisonOptions {
	return {
		Force: resolveForceComparisonOptions(options.Force, defaults.Force),
		Moment: resolveMomentComparisonOptions(options.Moment, defaults.Moment),
	}
}

export function validateForceComparisonOptions(options: ForceComparisonOptions): ForceComparisonOptions {
	if (!isIn(options.position, forcePositionComparisons)) throw new Error(`Invalid Force comparison position: expected one of ${displayOptions(forcePositionComparisons)}, but received "${String(options.position)}".`)
	if (!isIn(options.direction, forceDirectionComparisons)) throw new Error(`Invalid Force comparison direction: expected one of ${displayOptions(forceDirectionComparisons)}, but received "${String(options.direction)}".`)
	if (!isIn(options.applicationPointAt, forceApplicationComparisons)) throw new Error(`Invalid Force application point comparison: expected one of ${displayOptions(forceApplicationComparisons)}, but received "${String(options.applicationPointAt)}".`)
	if (options.position === 'equalLine' && options.direction === 'ignore') throw new Error(`Invalid Force comparison options: cannot require an equal line while ignoring its direction.`)
	return options
}

export function validateMomentComparisonOptions(options: MomentComparisonOptions): MomentComparisonOptions {
	if (!isIn(options.position, momentPositionComparisons)) throw new Error(`Invalid Moment comparison position: expected one of ${displayOptions(momentPositionComparisons)}, but received "${String(options.position)}".`)
	if (!isIn(options.direction, momentDirectionComparisons)) throw new Error(`Invalid Moment comparison direction: expected one of ${displayOptions(momentDirectionComparisons)}, but received "${String(options.direction)}".`)
	if (!isIn(options.openingAngle, momentOpeningAngleComparisons)) throw new Error(`Invalid Moment opening angle comparison: expected one of ${displayOptions(momentOpeningAngleComparisons)}, but received "${String(options.openingAngle)}".`)
	return options
}

function displayOptions(options: readonly string[]): string {
	return options.map(option => `"${option}"`).join(', ')
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

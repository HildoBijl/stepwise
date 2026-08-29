import { hasOnlyKeys, isIn, isPlainObject, mergeDefaults } from '@step-wise/js-utils'

// Define Force types.
const forcePositionComparisons = ['equal', 'sameLine', 'ignore'] as const
const forceDirectionComparisons = ['equal', 'parallel', 'ignore'] as const
const forceApplicationComparisons = ['equal', 'ignore'] as const

export type ForcePositionComparison = typeof forcePositionComparisons[number]
export type ForceDirectionComparison = typeof forceDirectionComparisons[number]
export type ForceApplicationComparison = typeof forceApplicationComparisons[number]

export type ForceComparisonOptions = {
	readonly position: ForcePositionComparison
	readonly direction: ForceDirectionComparison
	readonly applicationPointAt: ForceApplicationComparison
}
export type ForceComparisonOptionsInput = Partial<ForceComparisonOptions>

export function isForceComparisonOptionsInput(value: unknown): value is ForceComparisonOptionsInput {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['position', 'direction', 'applicationPointAt'])) return false
	if (value.position !== undefined && !isIn(value.position, forcePositionComparisons)) return false
	if (value.direction !== undefined && !isIn(value.direction, forceDirectionComparisons)) return false
	if (value.applicationPointAt !== undefined && !isIn(value.applicationPointAt, forceApplicationComparisons)) return false
	return value.position !== 'sameLine' || value.direction !== 'ignore'
}

// Define Moment types.
const momentPositionComparisons = ['equal', 'ignore'] as const
const momentDirectionComparisons = ['equal', 'ignore'] as const
const momentOpeningDirectionComparisons = ['equal', 'ignore'] as const

export type MomentPositionComparison = typeof momentPositionComparisons[number]
export type MomentDirectionComparison = typeof momentDirectionComparisons[number]
export type MomentOpeningDirectionComparison = typeof momentOpeningDirectionComparisons[number]

export type MomentComparisonOptions = {
	readonly position: MomentPositionComparison
	readonly direction: MomentDirectionComparison
	readonly openingDirection: MomentOpeningDirectionComparison
}
export type MomentComparisonOptionsInput = Partial<MomentComparisonOptions>

export function isMomentComparisonOptionsInput(value: unknown): value is MomentComparisonOptionsInput {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['position', 'direction', 'openingDirection'])) return false
	return (value.position === undefined || isIn(value.position, momentPositionComparisons))
		&& (value.direction === undefined || isIn(value.direction, momentDirectionComparisons))
		&& (value.openingDirection === undefined || isIn(value.openingDirection, momentOpeningDirectionComparisons))
}

// Define Load types.
export type LoadComparisonOptions = {
	readonly force: ForceComparisonOptions
	readonly moment: MomentComparisonOptions
}
export type LoadComparisonOptionsInput = {
	readonly force?: ForceComparisonOptionsInput
	readonly moment?: MomentComparisonOptionsInput
}

export function isLoadComparisonOptionsInput(value: unknown): value is LoadComparisonOptionsInput {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['force', 'moment'])) return false
	return (value.force === undefined || isForceComparisonOptionsInput(value.force))
		&& (value.moment === undefined || isMomentComparisonOptionsInput(value.moment))
}

// Set up defaults.
const defaultForceComparisonOptions: ForceComparisonOptions = Object.freeze({
	position: 'equal',
	direction: 'equal',
	applicationPointAt: 'equal',
})
const defaultMomentComparisonOptions: MomentComparisonOptions = Object.freeze({
	position: 'equal',
	direction: 'equal',
	openingDirection: 'equal',
})
export const defaultLoadComparisonOptions: LoadComparisonOptions = Object.freeze({
	force: defaultForceComparisonOptions,
	moment: defaultMomentComparisonOptions,
})

// Set up resolving functions.
export function resolveForceComparisonOptions(options: ForceComparisonOptionsInput = {}, defaults = defaultForceComparisonOptions): ForceComparisonOptions {
	const resolvedOptions = mergeDefaults(options, defaults)
	return Object.freeze(validateForceComparisonOptions(resolvedOptions))
}
export function resolveMomentComparisonOptions(options: MomentComparisonOptionsInput = {}, defaults = defaultMomentComparisonOptions): MomentComparisonOptions {
	return Object.freeze(validateMomentComparisonOptions(mergeDefaults(options, defaults)))
}
export function resolveLoadComparisonOptions(options: LoadComparisonOptionsInput = {}, defaults = defaultLoadComparisonOptions): LoadComparisonOptions {
	return Object.freeze({
		force: resolveForceComparisonOptions(options.force, defaults.force),
		moment: resolveMomentComparisonOptions(options.moment, defaults.moment),
	})
}

function validateForceComparisonOptions(options: ForceComparisonOptions): ForceComparisonOptions {
	if (!isIn(options.position, forcePositionComparisons)) throw new Error(`Invalid Force comparison position: expected one of ${displayOptions(forcePositionComparisons)}, but received "${String(options.position)}".`)
	if (!isIn(options.direction, forceDirectionComparisons)) throw new Error(`Invalid Force comparison direction: expected one of ${displayOptions(forceDirectionComparisons)}, but received "${String(options.direction)}".`)
	if (!isIn(options.applicationPointAt, forceApplicationComparisons)) throw new Error(`Invalid Force application point comparison: expected one of ${displayOptions(forceApplicationComparisons)}, but received "${String(options.applicationPointAt)}".`)
	if (options.position === 'sameLine' && options.direction === 'ignore') throw new Error(`Invalid Force comparison options: cannot require the same line while ignoring its direction.`)
	return options
}

function validateMomentComparisonOptions(options: MomentComparisonOptions): MomentComparisonOptions {
	if (!isIn(options.position, momentPositionComparisons)) throw new Error(`Invalid Moment comparison position: expected one of ${displayOptions(momentPositionComparisons)}, but received "${String(options.position)}".`)
	if (!isIn(options.direction, momentDirectionComparisons)) throw new Error(`Invalid Moment comparison direction: expected one of ${displayOptions(momentDirectionComparisons)}, but received "${String(options.direction)}".`)
	if (!isIn(options.openingDirection, momentOpeningDirectionComparisons)) throw new Error(`Invalid Moment opening direction comparison: expected one of ${displayOptions(momentOpeningDirectionComparisons)}, but received "${String(options.openingDirection)}".`)
	return options
}

function displayOptions(options: readonly string[]): string {
	return options.map(option => `"${option}"`).join(', ')
}

// Set up comparison options for free-body diagrams.
export const freeBodyDiagramComparisonOptions = resolveLoadComparisonOptions({
	force: {
		direction: 'parallel',
		applicationPointAt: 'ignore',
	},
	moment: {
		direction: 'ignore',
		openingDirection: 'ignore',
	},
})

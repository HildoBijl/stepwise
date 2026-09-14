import { ensureNumber, hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

import type { SkillThresholdOptions, SkillThresholdOptionsInput } from './types.ts'

// Define default threshold values and factors for skills.
const defaultMasteryThreshold = 0.55
const defaultRecapFactor = 0.9
const defaultPriorKnowledgeRecapFactor = 0.8

export const defaultSkillThresholdOptions: SkillThresholdOptions = Object.freeze({
	mastery: defaultMasteryThreshold,
	recap: defaultMasteryThreshold * defaultRecapFactor,
	priorKnowledgeMastery: defaultMasteryThreshold,
	priorKnowledgeRecap: defaultMasteryThreshold * defaultPriorKnowledgeRecapFactor,
})

const skillThresholdOptionNames = Object.keys(defaultSkillThresholdOptions) as (keyof SkillThresholdOptions)[]

// Resolve and validate skill threshold options, applying defaults and ensuring that the provided values are within acceptable ranges. Throw an error if any validation fails.
export function resolveSkillThresholdOptions(input: SkillThresholdOptionsInput = {}): SkillThresholdOptions {
	// Throw on invalid formats.
	if (!isPlainObject(input)) throw new TypeError('Invalid skill threshold options: expected a plain object.')
	if (!hasOnlyKeys(input, skillThresholdOptionNames)) throw new TypeError('Invalid skill threshold options: received an unsupported option.')

	// Resolve each threshold option, applying defaults and validating the values.
	const mastery = input.mastery === undefined ? defaultSkillThresholdOptions.mastery : ensureThreshold(input.mastery, 'mastery')
	const recap = input.recap === undefined ? mastery * defaultRecapFactor : ensureThreshold(input.recap, 'recap')
	const priorKnowledgeMastery = input.priorKnowledgeMastery === undefined ? mastery : ensureThreshold(input.priorKnowledgeMastery, 'priorKnowledgeMastery')
	const priorKnowledgeRecap = input.priorKnowledgeRecap === undefined ? priorKnowledgeMastery * defaultPriorKnowledgeRecapFactor : ensureThreshold(input.priorKnowledgeRecap, 'priorKnowledgeRecap')

	// Validate that the recap thresholds do not exceed their corresponding mastery thresholds.
	if (recap > mastery) throw new RangeError(`Invalid recap threshold "${recap}": it must not exceed the mastery threshold "${mastery}".`)
	if (priorKnowledgeRecap > priorKnowledgeMastery) throw new RangeError(`Invalid priorKnowledgeRecap threshold "${priorKnowledgeRecap}": it must not exceed the priorKnowledgeMastery threshold "${priorKnowledgeMastery}".`)

	// Return the resolved and validated skill threshold options.
	return { mastery, recap, priorKnowledgeMastery, priorKnowledgeRecap }
}

// Ensure that a threshold value is a number between 0 and 1, throwing an error if it is not.
function ensureThreshold(value: unknown, name: keyof SkillThresholdOptions): number {
	const threshold = ensureNumber(value)
	if (threshold < 0 || threshold > 1) throw new RangeError(`Invalid ${name} threshold "${threshold}": expected a value between 0 and 1.`)
	return threshold
}

import { SkillSetup } from '@step-wise/skill-setup'
import { ensureInteger, ensureNumber, isPlainObject } from '@step-wise/js-utils'

import type { ExerciseMetadata, ResolvedExerciseMetadata } from './types.ts'

export function isExerciseMetadata(value: unknown): value is ExerciseMetadata {
	if (!isPlainObject(value)) return false
	try {
		resolveExerciseMetadata(value)
		return true
	} catch (error) {
		if (error instanceof TypeError || error instanceof RangeError) return false
		throw error
	}
}

export function resolveExerciseMetadata<TMetadata extends ExerciseMetadata>(metadata: TMetadata): ResolvedExerciseMetadata<TMetadata> {
	if (!isPlainObject(metadata)) throw new TypeError(`Invalid exercise metadata: expected a plain object but received something of type "${typeof metadata}".`)

	if (metadata.skill !== undefined) {
		if (typeof metadata.skill !== 'string') throw new TypeError(`Invalid exercise skill: expected a string but received something of type "${typeof metadata.skill}".`)
		if (metadata.skill.length === 0 || metadata.skill.trim() !== metadata.skill) throw new RangeError('Invalid exercise skill: expected a non-empty skill ID without leading or trailing whitespace.')
	}
	if (metadata.setup !== undefined && !(metadata.setup instanceof SkillSetup)) throw new TypeError('Invalid exercise setup: expected a SkillSetup instance.')

	return {
		...metadata,
		weight: ensureNumber(metadata.weight ?? 1, { nonNegative: true }),
		repeatAfter: ensureInteger(metadata.repeatAfter ?? 1, { nonNegative: true, safe: true }),
		...(metadata.setupInferenceOrder === undefined ? {} : { setupInferenceOrder: ensureInteger(metadata.setupInferenceOrder, { nonNegative: true, safe: true }) }),
	}
}

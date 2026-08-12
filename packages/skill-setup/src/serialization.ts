import { SkillSetup } from './abstracts'
import { type SerializedSkillSetup, skill, setupTypes } from './setups'

export function serializeSetup(setup: SkillSetup): SerializedSkillSetup {
	return setup.serialize() as SerializedSkillSetup
}

export function deserializeSetup(setup: SerializedSkillSetup | string): SkillSetup {
	if (typeof setup === 'string') return skill(setup) // Provide short-cut of interpreting strings as skills.
	const { type, value } = setup
	const Type = setupTypes[type as keyof typeof setupTypes] as any
	if (!Type || typeof Type.fromStorageValue !== 'function') throw new Error(`Invalid skill setup type: received a serialized setup object "${JSON.stringify(setup)}" but its type was not known.`)
	return Type.fromStorageValue(value as any, deserializeSetup)
}

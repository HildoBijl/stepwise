import { SkillSetup, type SerializedSkillSetup } from './abstracts'
import * as setupTypes from './setups'

// Turn a storage value into a functional setup object.
export function deserializeSetup(setup: SerializedSkillSetup | string): SkillSetup {
	if (typeof setup === 'string') return new setupTypes.Skill(setup) // Provide short-cut of interpreting strings as skills.
	const { type, value } = setup
	const Type = setupTypes[type as keyof typeof setupTypes] as any
	if (!Type || typeof Type.fromStorageValue !== 'function') throw new Error(`Invalid skill setup type: received a serialized setup object "${JSON.stringify(setup)}" but its type was not known.`)
	return Type.fromStorageValue(value as any, deserializeSetup)
}

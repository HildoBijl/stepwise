import { ensurePlainObject } from '@step-wise/js-utils'

import { type SkillSetup } from './abstracts'
import { type SerializedSkillSetup, setupConstructors, skill } from './setups'

export function serializeSetup(setup: SkillSetup): SerializedSkillSetup {
	return setup.serialize() as SerializedSkillSetup
}

export function deserializeSetup(setup: unknown): SkillSetup {
	if (typeof setup === 'string') return skill(setup) // Provide short-cut of interpreting strings as skills.

	const serializedSetup = ensurePlainObject(setup)
	const { type, value } = serializedSetup
	if (typeof type !== 'string') throw new TypeError(`Invalid serialized skill setup: expected "type" to be a string, but received "${String(type)}".`)
	if (!Object.hasOwn(serializedSetup, 'value')) throw new TypeError(`Invalid serialized skill setup: expected a "value" property.`)
	if (!(type in setupConstructors)) throw new TypeError(`Invalid skill setup type: received "${type}", but this type was not known.`)

	const Type = setupConstructors[type as keyof typeof setupConstructors]
	const fromStorageValue = Type.fromStorageValue as (storageValue: unknown, deserialize: typeof deserializeSetup) => SkillSetup
	return fromStorageValue(value, deserializeSetup)
}

import { type SkillStorageValue, type SerializedSkill, Skill, skill } from './Skill.ts'
import { type AndStorageValue, type SerializedAnd, And, and } from './And.ts'
import { type OrStorageValue, type SerializedOr, Or, or } from './Or.ts'
import { type RepeatStorageValue, type SerializedRepeat, Repeat, repeat } from './Repeat.ts'
import { type PickStorageValue, type SerializedPick, Pick, pick } from './Pick.ts'
import { type PartStorageValue, type SerializedPart, Part, part } from './Part.ts'

export { type SkillId, type SkillSetupLike, ensureSetup } from './Skill.ts'

export type SkillSetupStorageValue = SkillStorageValue | AndStorageValue | OrStorageValue | RepeatStorageValue | PickStorageValue | PartStorageValue
export type SerializedSkillSetup = SerializedSkill | SerializedAnd | SerializedOr | SerializedRepeat | SerializedPick | SerializedPart
export { skill, and, or, repeat, pick, part }
export const setupConstructors = { Skill, And, Or, Repeat, Pick, Part }
export const setupFactories = { skill, and, or, repeat, pick, part }

import { type SkillStorageValue, type SerializedSkill, Skill, skill } from './Skill'
import { type AndStorageValue, type SerializedAnd, And, and } from './And'
import { type OrStorageValue, type SerializedOr, Or, or } from './Or'
import { type RepeatStorageValue, type SerializedRepeat, Repeat, repeat } from './Repeat'
import { type PickStorageValue, type SerializedPick, Pick, pick } from './Pick'
import { type PartStorageValue, type SerializedPart, Part, part } from './Part'

export { type SkillId, type SkillSetupLike, ensureSetup } from './Skill'

export type SkillSetupStorageValue = SkillStorageValue | AndStorageValue | OrStorageValue | RepeatStorageValue | PickStorageValue | PartStorageValue
export type SerializedSkillSetup = SerializedSkill | SerializedAnd | SerializedOr | SerializedRepeat | SerializedPick | SerializedPart
export { skill, and, or, repeat, pick, part }
export const setupTypes = { Skill, And, Or, Repeat, Pick, Part }

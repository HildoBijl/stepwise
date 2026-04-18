export type SkillStorageValue = string

export type SkillItemStorageValue = { skill: SerializedSkillSetup }
export type RepeatStorageValue = SkillItemStorageValue & { repeat: number }
export type PartStorageValue = SkillItemStorageValue & { part?: number }

export type SkillListStorageValue = { skills: SerializedSkillSetup[] }
export type PickStorageValue = SkillListStorageValue & { number?: number, weights?: number[] }

export type SkillSetupStorageValue = SkillStorageValue | SkillItemStorageValue | RepeatStorageValue | PartStorageValue | SkillListStorageValue | PickStorageValue
export type SerializedSkillSetup = { type: string, value: SkillSetupStorageValue }

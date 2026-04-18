import { type SkillSetupLike, SkillSetup } from './SkillSetup'
import { Skill } from './Skill'

// Ensure a value is a SkillSetup. Strings are converted to basic Skill instances.
export function ensureSetup(setup: SkillSetupLike): SkillSetup {
	if (setup instanceof SkillSetup) return setup
	if (typeof setup === 'string') return new Skill(setup)
	throw new Error(`Invalid skill: expected a skill or skill set-up, but received "${JSON.stringify(setup)}".`)
}

import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import applyChainRuleTwoElementary from './applyChainRuleTwoElementary.ts'
import applyChainRuleElementaryAndBasic from './applyChainRuleElementaryAndBasic.ts'

export default {
	examples: {},
	exercises: { applyChainRuleTwoElementary, applyChainRuleElementaryAndBasic },
} satisfies SkillExerciseBundle

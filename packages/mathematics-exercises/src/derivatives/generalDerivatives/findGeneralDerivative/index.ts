import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import findGeneralDerivativeProductRule from './findGeneralDerivativeProductRule.ts'
import findGeneralDerivativeQuotientRule from './findGeneralDerivativeQuotientRule.ts'
import findGeneralDerivativeChainRule from './findGeneralDerivativeChainRule.ts'

export default {
	examples: {},
	exercises: { findGeneralDerivativeProductRule, findGeneralDerivativeQuotientRule, findGeneralDerivativeChainRule },
} satisfies SkillExerciseBundle

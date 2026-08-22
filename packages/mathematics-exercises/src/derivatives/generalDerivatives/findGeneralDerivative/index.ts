import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import findGeneralDerivativeProductRule from './findGeneralDerivativeProductRule'
import findGeneralDerivativeQuotientRule from './findGeneralDerivativeQuotientRule'
import findGeneralDerivativeChainRule from './findGeneralDerivativeChainRule'

export default {
	examples: {},
	exercises: { findGeneralDerivativeProductRule, findGeneralDerivativeQuotientRule, findGeneralDerivativeChainRule },
} satisfies SkillExerciseBundle

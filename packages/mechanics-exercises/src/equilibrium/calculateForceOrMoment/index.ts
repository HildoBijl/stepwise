import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateForceOrMomentUseDiagonalForces from './calculateForceOrMomentUseDiagonalForces.ts'
import calculateForceOrMomentUseHorizontalForces from './calculateForceOrMomentUseHorizontalForces.ts'
import calculateForceOrMomentUseMomentsWithMomentAsked from './calculateForceOrMomentUseMomentsWithMomentAsked.ts'
import calculateForceOrMomentUseMomentsWithMomentGiven from './calculateForceOrMomentUseMomentsWithMomentGiven.ts'
import calculateForceOrMomentUseMomentsWithOnlyForces from './calculateForceOrMomentUseMomentsWithOnlyForces.ts'
import calculateForceOrMomentUseVerticalForces from './calculateForceOrMomentUseVerticalForces.ts'

export default {
	examples: {},
	exercises: {
		calculateForceOrMomentUseDiagonalForces,
		calculateForceOrMomentUseHorizontalForces,
		calculateForceOrMomentUseMomentsWithMomentAsked,
		calculateForceOrMomentUseMomentsWithMomentGiven,
		calculateForceOrMomentUseMomentsWithOnlyForces,
		calculateForceOrMomentUseVerticalForces,
	},
} satisfies SkillExerciseBundle

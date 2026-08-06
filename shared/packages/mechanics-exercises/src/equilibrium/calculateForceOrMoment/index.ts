import { type SkillExercises } from '@step-wise/exercise-bundling'

import calculateForceOrMomentUseDiagonalForces from './calculateForceOrMomentUseDiagonalForces'
import calculateForceOrMomentUseHorizontalForces from './calculateForceOrMomentUseHorizontalForces'
import calculateForceOrMomentUseMomentsWithMomentAsked from './calculateForceOrMomentUseMomentsWithMomentAsked'
import calculateForceOrMomentUseMomentsWithMomentGiven from './calculateForceOrMomentUseMomentsWithMomentGiven'
import calculateForceOrMomentUseMomentsWithOnlyForces from './calculateForceOrMomentUseMomentsWithOnlyForces'
import calculateForceOrMomentUseVerticalForces from './calculateForceOrMomentUseVerticalForces'

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
} satisfies SkillExercises

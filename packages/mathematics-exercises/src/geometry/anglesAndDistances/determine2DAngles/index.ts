import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import determine2DAnglesTriangleX from './determine2DAnglesTriangleX.ts'
import determine2DAnglesTriangleZ from './determine2DAnglesTriangleZ.ts'
import determine2DAnglesCircleSymmetry from './determine2DAnglesCircleSymmetry.ts'

export default {
	examples: {},
	exercises: { determine2DAnglesTriangleX, determine2DAnglesTriangleZ, determine2DAnglesCircleSymmetry },
} satisfies SkillExerciseBundle

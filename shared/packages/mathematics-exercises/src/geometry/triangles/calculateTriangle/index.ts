import { type SkillExercises } from '@step-wise/exercise-bundling'

import calculateTriangleASAS from './calculateTriangleASAS'
import calculateTriangleSSAA from './calculateTriangleSSAA'
import calculateTriangleASSA from './calculateTriangleASSA'
import calculateTriangleSASS from './calculateTriangleSASS'
import calculateTriangleSSAS from './calculateTriangleSSAS'
import calculateTriangleSASA from './calculateTriangleSASA'
import calculateTriangleSSSA from './calculateTriangleSSSA'

export default {
	examples: {},
	exercises: { calculateTriangleASAS, calculateTriangleSSAA, calculateTriangleASSA, calculateTriangleSASS, calculateTriangleSSAS, calculateTriangleSASA, calculateTriangleSSSA },
} satisfies SkillExercises

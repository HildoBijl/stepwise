import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateTriangleASAS from './calculateTriangleASAS.ts'
import calculateTriangleSSAA from './calculateTriangleSSAA.ts'
import calculateTriangleASSA from './calculateTriangleASSA.ts'
import calculateTriangleSASS from './calculateTriangleSASS.ts'
import calculateTriangleSSAS from './calculateTriangleSSAS.ts'
import calculateTriangleSASA from './calculateTriangleSASA.ts'
import calculateTriangleSSSA from './calculateTriangleSSSA.ts'

export default {
	examples: {},
	exercises: { calculateTriangleASAS, calculateTriangleSSAA, calculateTriangleASSA, calculateTriangleSASS, calculateTriangleSSAS, calculateTriangleSASA, calculateTriangleSSSA },
} satisfies SkillExerciseBundle

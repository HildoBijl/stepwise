import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import noSolutions from './noSolutions.ts'
import oneSolution from './oneSolution.ts'
import twoIntegerSolutions from './twoIntegerSolutions.ts'
import twoNonIntegerSolutions from './twoNonIntegerSolutions.ts'

export default {
	examples: { oneSolution, twoIntegerSolutions },
	exercises: { noSolutions, oneSolution, twoIntegerSolutions, twoNonIntegerSolutions },
} satisfies SkillExerciseBundle

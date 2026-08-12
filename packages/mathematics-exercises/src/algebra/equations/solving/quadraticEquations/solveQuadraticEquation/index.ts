import { type SkillExercises } from '@step-wise/exercise-bundling'

import noSolutions from './noSolutions'
import oneSolution from './oneSolution'
import twoIntegerSolutions from './twoIntegerSolutions'
import twoNonIntegerSolutions from './twoNonIntegerSolutions'

export default {
	examples: { oneSolution, twoIntegerSolutions },
	exercises: { noSolutions, oneSolution, twoIntegerSolutions, twoNonIntegerSolutions },
} satisfies SkillExercises

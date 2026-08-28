import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import solveExponentEquation1 from './solveExponentEquation1.ts'
import solveExponentEquation2 from './solveExponentEquation2.ts'
import solveExponentEquation3 from './solveExponentEquation3.ts'
import solveExponentEquation4 from './solveExponentEquation4.ts'

export default {
	examples: { solveExponentEquation1 },
	exercises: { solveExponentEquation1, solveExponentEquation2, solveExponentEquation3, solveExponentEquation4 },
} satisfies SkillExerciseBundle

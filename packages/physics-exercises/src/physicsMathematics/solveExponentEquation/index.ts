import { type SkillExercises } from '@step-wise/exercise-bundling'

import solveExponentEquation1 from './solveExponentEquation1'
import solveExponentEquation2 from './solveExponentEquation2'
import solveExponentEquation3 from './solveExponentEquation3'
import solveExponentEquation4 from './solveExponentEquation4'

export default {
	examples: { solveExponentEquation1 },
	exercises: { solveExponentEquation1, solveExponentEquation2, solveExponentEquation3, solveExponentEquation4 },
} satisfies SkillExercises

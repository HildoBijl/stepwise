import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import readMollierDiagramRH from './readMollierDiagramRH.ts'
import readMollierDiagramAH from './readMollierDiagramAH.ts'

export default {
	examples: { readMollierDiagramRH },
	exercises: { readMollierDiagramRH, readMollierDiagramAH },
} satisfies SkillExerciseBundle

import { type SkillExercises } from '@step-wise/exercise-bundling'

import readMollierDiagramRH from './readMollierDiagramRH'
import readMollierDiagramAH from './readMollierDiagramAH'

export default {
	examples: { readMollierDiagramRH },
	exercises: { readMollierDiagramRH, readMollierDiagramAH },
} satisfies SkillExercises

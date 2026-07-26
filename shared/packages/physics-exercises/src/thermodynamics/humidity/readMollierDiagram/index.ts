import { type SkillExercises } from '@step-wise/exercise-definition'

import readMollierDiagramRH from './readMollierDiagramRH'
import readMollierDiagramAH from './readMollierDiagramAH'

export default {
	examples: { readMollierDiagramRH },
	exercises: { readMollierDiagramRH, readMollierDiagramAH },
} satisfies SkillExercises

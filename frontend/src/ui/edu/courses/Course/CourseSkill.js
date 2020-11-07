import React from 'react'
import { Link } from 'react-router-dom'

import { usePaths } from 'ui/routing'

import Skill from '../../skills/Skill'
import { useSkillId } from '../../skills/Skill'

import { useCourseData } from './Provider'
import { useSkillAdvice } from './SkillAdvice'

export default function CourseSkill() {
	const paths = usePaths()
	const { courseId, course, overview, analysis } = useCourseData()
	const { type: adviceType, recommendation} = useSkillAdvice()
	const skillId = useSkillId()

	// ToDo: add modal pop-ups upon changes in the recommendation.

	// If the skill is not part of this course, show a warning.
	if (!overview.all.includes(skillId))
		return <div>Oops ... de vaardigheid die je probeert te oefenen is niet onderdeel van de cursus <Link to={paths.course({ courseId })}>{course.name}</Link>.</div>



	return <Skill />
}
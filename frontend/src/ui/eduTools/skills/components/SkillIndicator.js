import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { getCourseOverview } from 'step-wise/eduTools'

import { useSkillData, useUserQuery } from 'api'

import { useCourseData } from '../../course'
import { processStudent } from '../../courses'

import { SkillFlask } from './SkillFlask'

export function SkillIndicator() {
	const { studentId } = useParams()
	if (!studentId)
		return <SkillIndicatorForSelf />
	return <SkillIndicatorForUser userId={studentId} />
}

// For the signed-in user, we access the Skill Cacher.
function SkillIndicatorForSelf() {
	const { skillId } = useParams()
	const skill = useSkillData(skillId)
	if (!skill)
		return null
	return <SkillIndicatorGraphics skill={skill} />
}

// We only inspect a user as part of a course. So load the course data as well. This is probably cached already anyway.
function SkillIndicatorForUser({ userId }) {
	const { course, loading: courseLoading, error: courseError } = useCourseData()
	const { data, loading: userLoading, error: userError } = useUserQuery(userId)
	if (userLoading || courseLoading || userError || courseError)
		return null
	const { user } = data
	return <SkillIndicatorForLoadedUser course={course} user={user} />
}

function SkillIndicatorForLoadedUser({ course, user }) {
	const overview = useMemo(() => getCourseOverview(course), [course])
	const { skillId } = useParams()
	const processedStudent = useMemo(() => processStudent(user, overview), [user, overview])
	return <SkillIndicatorGraphics skill={processedStudent.skillsData[skillId]} />
}

function SkillIndicatorGraphics({ skill }) {
	if (!skill)
		return null
	return <SkillFlask skillId={skill.skillId} coef={skill.coefficients} strongShadow={true} sx={theme => ({
		height: '34px',
		ml: 2,
		width: '34px',
		[theme.breakpoints.up('sm')]: {
			height: '40px',
			width: '40px',
		},
	})} />
}

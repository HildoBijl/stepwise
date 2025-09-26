import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Box } from '@mui/material'

import { arraysToObject, keysToObject, formatDate } from 'step-wise/util'
import { processSkillDataSet } from 'step-wise/skillTracking'
import { skillTree, includePrerequisitesAndLinks, processSkill, getDefaultSkillData } from 'step-wise/eduTools'

import { useUserQuery } from 'api'
import { Par, HorizontalSlider } from 'ui/components'
import { TitleItem } from 'ui/routingTools'
import { SkillFlask } from 'ui/eduTools'

export function UserInspection() {
	const params = useParams()
	const res = useUserQuery(params && params.userId)

	// Check if data has loaded properly.
	if (res.loading)
		return <Par>Looking up user data...</Par>
	if (res.error || !res.data)
		return <Par>Oops... Something went wrong while looking up user data.</Par>
	const user = res.data.user
	if (!user)
		return <Par>Oops... The user could not be found. It doesn't exist.</Par>

	// Display the user.
	return <UserInspectionForUser user={user} />
}

function UserInspectionForUser({ user }) {
	const skillsList = useSkillsList(user)
	return <>
		<Par>Below you see all the skills that {user.name} has practiced, with the most recent one on top.</Par>
		<HorizontalSlider>
			<Box sx={{
				display: 'grid',
				gridGap: '0.8rem 0.8rem',
				gridTemplateColumns: '50px 4fr 1fr 1fr',
				placeItems: 'center stretch',
				width: '100%',

				'& .head': { fontWeight: 'bold' },
				'& .flask': { textAlign: 'center' },
				'& .name': { width: '160px' },
				'& .numPracticed': { width: '80px', textAlign: 'center' },
				'& .lastPracticed': { width: '80px', textAlign: 'center' },
			}} className="skillList">
				<div className="flask head"></div>
				<div className="name head">Skill</div>
				<div className="numPracticed head">Number of executions</div>
				<div className="lastPracticed head">Last activity</div>
				{skillsList.map(skillData => <UserInspectionItem key={skillData.skill.id} skillId={skillData.skill.id} skillData={skillData} />)}
			</Box>
		</HorizontalSlider>
	</>
}

function UserInspectionItem({ skillId, skillData }) {
	return <>
		<div className="flask"><SkillFlask skillId={skillId} coef={skillData.coefficients} size={40} /></div>
		<div className="name">{skillTree[skillData.skillId].name}</div>
		<div className="numPracticed">{skillData.numPracticed}</div>
		<div className="lastPracticed">{formatDate(skillData.lastPracticed, true)}</div>
	</>
}

export function UserInspectionTitle() {
	const params = useParams()
	const res = useUserQuery(params && params.userId)
	const name = getUserNameFromQueryResult(res)
	return <TitleItem name={name} />
}

function getUserNameFromQueryResult(res) {
	// Check if the query was successful.
	if (res.loading)
		return 'Loading name...'
	if (res.error || !res.data)
		return 'Oops...'

	// Check if the user exists.
	const user = res.data.user
	if (!user)
		return 'Unknown user'
	return user.name
}

function useSkillsList(user) {
	return useMemo(() => {
		// Process the skills into a raw data set. (Also filter them to remove outdated skills not in the skill tree anymore.)
		const skillsProcessed = user.skills.filter(skill => skillTree[skill.skillId]).map(skill => processSkill(skill))
		const skillIds = skillsProcessed.map(skill => skill.skillId)
		const skillsAsObject = arraysToObject(skillIds, skillsProcessed)

		// Add skills that are not in the data set. (These are skills that are not in the database yet.)
		const allSkillIds = includePrerequisitesAndLinks(skillIds)
		const skills = keysToObject(allSkillIds, skillId => skillsAsObject[skillId] || getDefaultSkillData(skillId))
		const skillDataSet = processSkillDataSet(skills, skillTree)

		// Turn the object back into an array, with only the practiced skills and not the prerequisites, and sort by last activity.
		const skillList = skillIds.map(skillId => skillDataSet[skillId])
		return skillList.sort((a, b) => b.lastPracticed - a.lastPracticed) // Sort with latest first.
	}, [user])
}

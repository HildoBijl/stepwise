import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Box } from '@mui/material'

import { formatDate } from '@step-wise/js-utils'
import { skillTree } from '@step-wise/skill-tree'

import { useUserWithSkills } from 'api'
import { Par, HorizontalSlider } from 'ui/components'
import { TitleItem } from 'ui/routingTools'
import { SkillFlask } from 'ui/eduTools'

export function UserInspection() {
	const params = useParams()
	const { user, loading, error } = useUserWithSkills(params?.userId)

	// Check if data has loaded properly.
	if (loading) return <Par>Looking up user data...</Par>
	if (error) return <Par>Oops... Something went wrong while looking up user data.</Par>
	if (!user) return <Par>Oops... The user could not be found. It doesn't exist.</Par>

	// Display the user.
	return <UserInspectionForUser user={user} />
}

function UserInspectionForUser({ user }) {
	const skillsList = useSkillsLevelsList(user)
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
				{skillsList.map(skillLevel => <UserInspectionItem key={skillLevel.skillId} skillId={skillLevel.skillId} skillLevel={skillLevel} />)}
			</Box>
		</HorizontalSlider>
	</>
}

function UserInspectionItem({ skillId, skillLevel }) {
	return <>
		<div className="flask"><SkillFlask skillId={skillId} coef={skillLevel.coefficients} size={40} /></div>
		<div className="name">{skillTree[skillLevel.skillId].name}</div>
		<div className="numPracticed">{skillLevel.numPracticed}</div>
		<div className="lastPracticed">{formatDate(skillLevel.coefficientsOn, { includeTime: true })}</div>
	</>
}

export function UserInspectionTitle() {
	const params = useParams()
	const result = useUserWithSkills(params?.userId)
	const name = getUserNameFromResult(result)
	return <TitleItem name={name} />
}

function getUserNameFromResult({ user, loading, error }) {
	// Check if the query was successful.
	if (loading) return 'Loading name...'
	if (error) return 'Oops...'

	// Check if the user exists.
	if (!user) return 'Unknown user'
	return user.name
}

function useSkillsLevelsList(user) {
	return useMemo(() => {
		const skillLevelSet = user.skillLevelSet
		const skillIds = user.skills.map(skill => skill.skillId).filter(skillId => !!skillTree[skillId])
		const skillLevels = skillIds.map(skillId => skillLevelSet.getSkillLevel(skillId))
		return skillLevels.sort((a, b) => b.coefficientsOn - a.coefficientsOn) // Sort with latest first.
	}, [user])
}

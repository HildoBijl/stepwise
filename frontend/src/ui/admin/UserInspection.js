import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { arraysToObject, keysToObject, formatDate } from 'step-wise/util'
import { processSkillDataSet } from 'step-wise/skillTracking'
import { skillTree } from 'step-wise/edu/skills'
import { includePrerequisitesAndLinks, processSkill, getDefaultSkillData } from 'step-wise/edu/skills/util'

import { useUserQuery } from 'api/admin'
import { Par, HorizontalSlider } from 'ui/components'
import { TitleItem } from 'ui/layout/Title'
import { SkillFlask } from 'ui/edu/skills'

export default function UserInspection() {
	const params = useParams()
	const res = useUserQuery(params && params.userId)

	// Check if data has loaded properly.
	if (res.loading)
		return <Par>Gebruiker wordt opgezocht...</Par>
	if (res.error || !res.data)
		return <Par>Oops... Er ging iets mis bij het opzoeken van de gebruiker.</Par>
	const user = res.data.user
	if (!user)
		return <Par>Oops... De gebruiker kon niet gevonden worden. Hij bestaat niet.</Par>

	// Display the user.
	return <UserInspectionForUser user={user} />
}

const useStyles = makeStyles((theme) => ({
	skillList: {
		display: 'grid',
		gridGap: '0.8rem 0.8rem',
		gridTemplateColumns: '50px 4fr 1fr 1fr',
		placeItems: 'center stretch',
		width: '100%',

		'& .head': {
			fontWeight: 'bold',
		},

		'& .flask': {
			textAlign: 'center',
		},
		'& .name': {
			width: '160px',
		},
		'& .numPracticed': {
			width: '80px',
			textAlign: 'center',
		},
		'& .lastPracticed': {
			width: '80px',
			textAlign: 'center',
		},
	},
}))

function UserInspectionForUser({ user }) {
	const skillsList = useSkillsList(user)
	const classes = useStyles()
	return <>
		<Par>Hier zie je al de vaardigheden die {user.name} geoefend heeft, met de meest recente boven.</Par>
		<HorizontalSlider>
			<div className={clsx(classes.skillList, 'skillList')}>
				<div className="flask head"></div>
				<div className="name head">Vaardigheid</div>
				<div className="numPracticed head">Gemaakte pogingen</div>
				<div className="lastPracticed head">Laatste actie</div>
				{skillsList.map(skillData => <UserInspectionItem key={skillData.skill.id} skillId={skillData.skill.id} skillData={skillData} />)}
			</div>
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
		return 'Even wachten...'
	if (res.error || !res.data)
		return 'Oops...'

	// Check if the user exists.
	const user = res.data.user
	if (!user)
		return 'Onbekende gebruiker'
	return user.name
}

function useSkillsList(user) {
	return useMemo(() => {
		// Process the skills into a raw data set.
		const skillsProcessed = user.skills.map(skill => processSkill(skill))
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
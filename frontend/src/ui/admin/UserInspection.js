import React, { useMemo } from 'react'
import { useRouteMatch } from 'react-router-dom'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { formatDate } from 'step-wise/util/date'
import skills from 'step-wise/edu/skills'
import SkillData from 'step-wise/edu/skills/SkillData'
import { includePrerequisites, processSkill, getDefaultSkillData } from 'step-wise/edu/skills/util'

import { useUserQuery } from 'api/admin'
import { Par } from 'ui/components/containers'
import SkillFlask from 'ui/edu/skills/SkillFlask'
import HorizontalSlider from 'ui/components/layout/HorizontalSlider'

export default function UserInspection() {
	const { params } = useRouteMatch()
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
	const skillsData = useSkillsData(user)
	const classes = useStyles()
	return <>
		<Par>Hier zie je al de vaardigheden die {user.name} geoefend heeft, met de meest recente boven.</Par>
		<HorizontalSlider>
			<div className={clsx(classes.skillList, 'skillList')}>
				<div className="flask head"></div>
				<div className="name head">Vaardigheid</div>
				<div className="numPracticed head">Gemaakte pogingen</div>
				<div className="lastPracticed head">Laatste actie</div>
				{Object.keys(skillsData).map(skillId => <UserInspectionItem key={skillId} skillData={skillsData[skillId]} />)}
			</div>
		</HorizontalSlider>
	</>
}

function UserInspectionItem({ skillData }) {
	return <>
		<div className="flask"><SkillFlask coef={skillData.coefficients} size={40} /></div>
		<div className="name">{skills[skillData.skillId].name}</div>
		<div className="numPracticed">{skillData.numPracticed}</div>
		<div className="lastPracticed">{formatDate(skillData.lastPracticed, true)}</div>
	</>
}

export function useUserInspectionTitle() {
	const { params } = useRouteMatch()
	const res = useUserQuery(params && params.userId)
	if (res.loading)
		return 'Even wachten...'
	if (res.error || !res.data)
		return 'Oops...'
	const user = res.data.user
	if (!user)
		return 'Onbekende gebruiker'
	return user.name
}

function useSkillsData(user) {
	return useMemo(() => {
		// Process the skills into a raw data set.
		const skills = user.skills
		const data = {}
		skills.forEach(skill => {
			data[skill.skillId] = processSkill(skill)
		})

		// Add skills that are not in the data set. (These are skills that are not in the database yet.)
		const skillIds = user.skills.map(skill => skill.skillId)
		const skillIdsWithPrerequisites = includePrerequisites(skillIds)
		skillIdsWithPrerequisites.forEach(skillId => {
			if (!data[skillId])
				data[skillId] = getDefaultSkillData(skillId)
		})

		// Set up SkillData objects.
		const result = skillIds.map(skillId => new SkillData(skillId, data))
		return result.sort((a, b) => b.lastPracticed - a.lastPracticed) // Sort with latest first.
	}, [user])
}
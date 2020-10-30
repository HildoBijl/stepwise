import React, { useState, useCallback } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Collapse from '@material-ui/core/Collapse'
import Box from '@material-ui/core/Box'
import { ChevronRight as Arrow } from '@material-ui/icons'

import skills from 'step-wise/edu/skills'

import { notSelectable } from 'ui/theme'
import { usePaths } from 'ui/routing'

import { getSkillRecommendation } from '../skills/util'
import { useSkillData, useSkillsData } from '../skills/SkillCacher'
import SkillFlask from '../skills/SkillFlask'

import { getCourseSkills } from './util'
import SkillRecommender from './SkillRecommender'

const courseSetup = {
	priorKnowledge: [
		'calculateWithPressure',
		'calculateWithVolume',
		'calculateWithTemperature',
		'calculateWithMass',
		'solveLinearEquation',
		'solveExponentEquation',
	],
	blocks: [
		{
			title: 'De gaswet',
			goals: ['gasLaw'],
		},
		{
			title: 'Een processtap doorrekenen',
			goals: ['calculateProcessStep'],
		},
		{
			title: 'De warmte en arbeid berekenen',
			goals: ['calculateHeatAndWork'],
		},
	],
}

const skillLists = getCourseSkills(courseSetup)
console.log(skillLists)

const useStyles = makeStyles((theme) => ({
	courseOverview: {
		alignItems: 'flex-start',
		display: 'flex',
		flexFlow: 'row nowrap',
		width: '100%',
	},
	landscapeOverview: {
		'& .blockList': {
			marginRight: '1rem',
			width: '50%',
		},
		'& .skillList': {
			width: '50%',
		},
	},
	portraitOverview: {
		'& .blockList': {
			width: '100%',
		},
	},
}))

export default function Course(props) {
	const landscape = useMediaQuery('(orientation: landscape)')

	// Track which block is active.
	const [activeBlock, setActiveBlock] = useState() // -1 means prior knowledge. Undefined means none selected.
	const toggleActiveBlock = useCallback((index) => setActiveBlock(activeBlock => activeBlock === index ? undefined : index), [setActiveBlock])

	// Extract the skill recommendation.
	const skillsData = useSkillsData([...skillLists.priorKnowledge, ...skillLists.course])
	const recommendation = getSkillRecommendation(skillsData, skillLists.priorKnowledge, skillLists.course)
	const hasRecommendation = !!skillsData[recommendation]

	// Render the component.
	const data = { ...props, activeBlock, toggleActiveBlock }
	return <>
		{hasRecommendation ? <SkillRecommender recommendation={recommendation} /> : null}
		{landscape ? <LandscapeCourse {...data} /> : <PortraitCourse {...data} />}
	</>
}

function LandscapeCourse({ activeBlock, toggleActiveBlock }) {
	const landscape = true
	const classes = useStyles({ landscape })

	let skillIds = null
	if (activeBlock === undefined)
		skillIds = []
	else if (activeBlock === -1)
		skillIds = skillLists.priorKnowledge
	else
		skillIds = skillLists.blocks[activeBlock]

	return (
		<div className={clsx(classes.courseOverview, classes.landscapeOverview)}>
			<div className="blockList">
				<Block landscape={landscape} active={activeBlock === -1} toggleActive={() => toggleActiveBlock(-1)} title="Directe voorkennis" />
				{courseSetup.blocks.map((block, index) => <Block key={index} landscape={landscape} active={activeBlock === index} toggleActive={() => toggleActiveBlock(index)} title={block.title} number={index + 1} />)}
			</div>
			<SkillList skillIds={skillIds} landscape={landscape} />
		</div>
	)
}

function PortraitCourse({ activeBlock, toggleActiveBlock }) {
	const landscape = false
	const classes = useStyles({ landscape })

	return (
		<div className={clsx(classes.courseOverview, classes.portraitOverview)}>
			<div className={clsx(classes.blockList, 'blockList')}>
				<Block landscape={landscape} skillIds={skillLists.priorKnowledge} active={activeBlock === -1} toggleActive={() => toggleActiveBlock(-1)} title="Directe voorkennis" />
				{courseSetup.blocks.map((block, index) => (
					<Block key={index} landscape={landscape} skillIds={skillLists.blocks[index]} active={activeBlock === index} toggleActive={() => toggleActiveBlock(index)} title={block.title} number={index + 1} />
				))}
			</div>
		</div>
	)
}

const borderRadius = '0.5rem'
const useBlockStyles = makeStyles((theme) => ({
	blockBox: {
		borderRadius,
		marginBottom: '0.6rem',
		overflow: 'hidden',

		'& .block': {
			alignItems: 'center',
			background: fade(theme.palette.primary.main, 0.05),
			cursor: 'pointer',
			display: 'flex',
			flexFlow: 'row nowrap',
			justifyContent: 'flex-start',
			padding: '1rem',
			...notSelectable,

			'& .number': {
				color: theme.palette.primary.main,
				flex: '0 0 auto',
				fontSize: '1.6rem',
				marginRight: '1rem',
			},

			'& .title': {
				flex: '1 1 auto',
				fontSize: '1.1rem',
			},

			'& .arrow': {
				flex: '0 0 auto',
				opacity: 0.4,
				transition: `transform ${theme.transitions.duration.standard}ms`,
			},

			'&:hover .arrow': {
				opacity: 1,
			},
		},

		'&.landscape': {
			'&.active .block, & .block:hover': {
				background: fade(theme.palette.primary.main, 0.1),
			},
			'&.active': {
				'& .arrow': {
					opacity: 1,
				},
			},
		},
		'&.portrait': {
			'& .arrow': {
				transform: 'rotate(90deg)',
			},

			'&.active': {
				'& .arrow': {
					transform: 'rotate(-90deg)',
				},
			},
		},
	},
}))

function Block({ landscape, skillIds, active, toggleActive, title, number }) {
	const classes = useBlockStyles({ landscape, active })
	return (
		<Box boxShadow={1} className={clsx(classes.blockBox, 'blockBox', { active, landscape, portrait: !landscape })}>
			<div className="block" onClick={toggleActive}>
				{number === undefined ? null : <div className="number">{number}</div>}
				<div className="title">{title}</div>
				<Arrow className="arrow" />
			</div>
			{landscape || !skillIds ? null : (
				<Collapse in={active}>
					<SkillList skillIds={skillIds} landscape={landscape} />
				</Collapse>
			)}
		</Box>
	)
}

const useSkillListStyles = makeStyles((theme) => ({
	skillList: {
		overflow: 'hidden',
		...notSelectable,

		'& .skillItem': {
			alignItems: 'center',
			color: theme.palette.text.primary,
			cursor: 'pointer',
			display: 'flex',
			flexFlow: 'row nowrap',
			padding: '0.8rem',
			textDecoration: 'none',
			width: '100%',

			'&:hover': {
				background: fade(theme.palette.primary.main, 0.05),
			},

			'& .skillFlask': {
				marginRight: '0.8rem',
			},
			'& .skillName': {

			},
		},

		'&.landscape': {
			borderRadius,

			'& .skillItem': {
				background: fade(theme.palette.primary.main, 0.05),
				'&:hover': {
					background: fade(theme.palette.primary.main, 0.1),
				},
			},
		},
	},
}))

function SkillList({ skillIds, landscape }) {
	const classes = useSkillListStyles()
	return (
		<Box boxShadow={landscape ? 1 : 0} className={clsx(classes.skillList, 'skillList', { landscape })}>
			{skillIds.map((skillId, index) => <SkillItem key={skillId} skillId={skillId} />)}
		</Box>
	)
}

function SkillItem({ skillId }) {
	const skillData = useSkillData(skillId)
	const skill = skills[skillId]
	const paths = usePaths()

	if (!skillData)
		return null
	return (
		<Link to={paths.skill({ skillId })} className="skillItem">
			<SkillFlask coef={skillData.coefficients} size={40} />
			<div className="skillName">{skill.name}</div>
		</Link>
	)
}
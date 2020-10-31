import React, { useState, useCallback, useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { getSkillRecommendation } from '../../skills/util'
import { useSkillsData } from '../../skills/SkillCacher'

import { getCourseSkills } from '../util'

import SkillRecommender from './SkillRecommender'
import Block from './Block'
import SkillList from './SkillList'

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

	// Extract the skill recommendation.
	const skillsData = useSkillsData([...skillLists.priorKnowledge, ...skillLists.course])
	const recommendation = getSkillRecommendation(skillsData, skillLists.priorKnowledge, skillLists.course)
	const hasRecommendation = !!skillsData[recommendation]

	// Track which block is active.
	const [activeBlock, setActiveBlock] = useState() // -1 means prior knowledge. Undefined means none selected.
	const toggleActiveBlock = useCallback((index) => setActiveBlock(activeBlock => activeBlock === index ? undefined : index), [setActiveBlock])

	// Make the block with the recommendation active when figuring out said recommendation.
	useEffect(() => {
		if (hasRecommendation) {
			setActiveBlock(activeBlock => {
				if (activeBlock !== undefined)
					return activeBlock
				if (skillLists.priorKnowledge.includes(recommendation))
					return -1
				return skillLists.blocks.findIndex(blockList => blockList.includes(recommendation))
			})
		}
	}, [hasRecommendation, recommendation, setActiveBlock])

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
				<Block landscape={landscape} priorKnowledge={true} skillIds={skillLists.priorKnowledge} active={activeBlock === -1} toggleActive={() => toggleActiveBlock(-1)} title="Directe voorkennis" />
				{courseSetup.blocks.map((block, index) => <Block key={index} landscape={landscape} skillIds={skillLists.blocks[index]} active={activeBlock === index} toggleActive={() => toggleActiveBlock(index)} title={block.title} number={index + 1} />)}
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
				<Block landscape={landscape} priorKnowledge={true} skillIds={skillLists.priorKnowledge} active={activeBlock === -1} toggleActive={() => toggleActiveBlock(-1)} title="Directe voorkennis" />
				{courseSetup.blocks.map((block, index) => (
					<Block key={index} landscape={landscape} skillIds={skillLists.blocks[index]} active={activeBlock === index} toggleActive={() => toggleActiveBlock(index)} title={block.title} number={index + 1} />
				))}
			</div>
		</div>
	)
}
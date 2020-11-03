import React, { useState, useCallback, useEffect } from 'react'
import { useRouteMatch } from 'react-router-dom'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { getSkillRecommendation } from '../../skills/util'
import { useSkillsData } from '../../skills/SkillCacher'

import courses from '../courses'
import { getCourseSkills } from '../util'

import SkillRecommender from './SkillRecommender'
import Block from './Block'
import SkillList from './SkillList'

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
	// Figure out the course to display.
	const { params } = useRouteMatch()
	const { courseId } = params
	const course = courses[courseId.toLowerCase()]
	const skillLists = getCourseSkills(course)

	// Extract the skill recommendation.
	const skillsData = useSkillsData([...skillLists.priorKnowledge, ...skillLists.course])
	const recommendation = getSkillRecommendation(skillsData, skillLists.priorKnowledge, skillLists.course)
	const hasRecommendation = !!skillsData[recommendation]
	const recommendationBlock = skillLists.priorKnowledge.includes(recommendation) ? -1 : skillLists.blocks.findIndex(blockList => blockList.includes(recommendation))

	// Track which block is active.
	const [activeBlock, setActiveBlock] = useState() // -1 means prior knowledge. Undefined means none selected.
	const toggleActiveBlock = useCallback((index) => setActiveBlock(activeBlock => activeBlock === index ? undefined : index), [setActiveBlock])

	// Make the block with the recommendation active when figuring out said recommendation.
	useEffect(() => {
		if (hasRecommendation) {
			setActiveBlock(activeBlock => {
				if (activeBlock !== undefined)
					return activeBlock
				return recommendationBlock
			})
		}
	}, [hasRecommendation, recommendationBlock, setActiveBlock])

	// Determine other important data for rendering.
	const landscape = useMediaQuery('(orientation: landscape)')

	// If there is an unknown course, display this.
	if (!course)
		return <div>Oops... De cursus die je wilt bezoeken is niet bekend. Mogelijk is er iets mis met de link?</div>

	// Render the component.
	const data = { ...props, course, skillLists, activeBlock, toggleActiveBlock, recommendation }
	return <>
		{hasRecommendation ? <SkillRecommender recommendation={recommendation} /> : null}
		{landscape ? <LandscapeCourse {...data} /> : <PortraitCourse {...data} />}
	</>
}

function LandscapeCourse({ course, skillLists, activeBlock, toggleActiveBlock, recommendation }) {
	const landscape = true
	const classes = useStyles({ landscape })

	let skillIds = null
	if (activeBlock === undefined)
		skillIds = []
	else if (activeBlock === -1)
		skillIds = skillLists.priorKnowledge
	else
		skillIds = skillLists.blocks[activeBlock]

	const hasPriorKnowledge = skillLists.priorKnowledge.length > 0

	return (
		<div className={clsx(classes.courseOverview, classes.landscapeOverview)}>
			<div className="blockList">
				{hasPriorKnowledge ? <Block landscape={landscape} priorKnowledge={true} skillIds={skillLists.priorKnowledge} active={activeBlock === -1} toggleActive={() => toggleActiveBlock(-1)} title="Directe voorkennis" recommendation={recommendation} /> : null}
				{course.blocks.map((block, index) => <Block key={index} landscape={landscape} skillIds={skillLists.blocks[index]} active={activeBlock === index} toggleActive={() => toggleActiveBlock(index)} title={block.title} number={index + 1} recommendation={recommendation} />)}
			</div>
			<SkillList skillIds={skillIds} landscape={landscape} recommendation={recommendation} />
		</div>
	)
}

function PortraitCourse({ course, skillLists, activeBlock, toggleActiveBlock, recommendation }) {
	const landscape = false
	const classes = useStyles({ landscape })
	const hasPriorKnowledge = skillLists.priorKnowledge.length > 0

	return (
		<div className={clsx(classes.courseOverview, classes.portraitOverview)}>
			<div className={clsx(classes.blockList, 'blockList')}>
				{hasPriorKnowledge ? <Block landscape={landscape} priorKnowledge={true} skillIds={skillLists.priorKnowledge} active={activeBlock === -1} toggleActive={() => toggleActiveBlock(-1)} title="Directe voorkennis" recommendation={recommendation} /> : null}
				{course.blocks.map((block, index) => (
					<Block key={index} landscape={landscape} skillIds={skillLists.blocks[index]} active={activeBlock === index} toggleActive={() => toggleActiveBlock(index)} title={block.title} number={index + 1} recommendation={recommendation} />
				))}
			</div>
		</div>
	)
}

export function useCourseTitle() {
	const { params } = useRouteMatch()
	const { courseId } = params
	const course = courses[courseId.toLowerCase()]
	return course ? course.title : 'Onbekende cursus'
}
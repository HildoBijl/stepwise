import React, { useState, useCallback, useEffect } from 'react'
import { useRouteMatch } from 'react-router-dom'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { useSkillsData } from '../../skills/SkillCacher'

import courses from '../courses'
import { getOverview, getAnalysis } from '../util'

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
	const overview = getOverview(course)

	// Extract the skill recommendation.
	const skillsData = useSkillsData(overview.all)
	const analysis = getAnalysis(overview, skillsData)
	const recommendation = analysis.recommendation
	const hasRecommendation = !!recommendation
	const recommendationBlock = overview.priorKnowledge.includes(recommendation) ? -1 : overview.blocks.findIndex(blockList => blockList.includes(recommendation))

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
	const data = { ...props, course, overview, analysis, activeBlock, toggleActiveBlock }
	return <>
		{hasRecommendation ? <SkillRecommender courseId={courseId} recommendation={recommendation} /> : null}
		{landscape ? <LandscapeCourse {...data} /> : <PortraitCourse {...data} />}
	</>
}

function LandscapeCourse({ course, overview, analysis, activeBlock, toggleActiveBlock }) {
	const landscape = true
	const classes = useStyles({ landscape })

	// Determine which skillIds to show on the right.
	let skillIds = null
	if (activeBlock === undefined)
		skillIds = []
	else if (activeBlock === -1)
		skillIds = overview.priorKnowledge
	else
		skillIds = overview.blocks[activeBlock]

	// Determine other important data.
	const hasPriorKnowledge = overview.priorKnowledge.length > 0

	return (
		<div className={clsx(classes.courseOverview, classes.landscapeOverview)}>
			<div className="blockList">
				{hasPriorKnowledge ? <Block
					landscape={landscape}
					courseId={course.name}
					skillIds={overview.priorKnowledge}
					active={activeBlock === -1}
					toggleActive={() => toggleActiveBlock(-1)}
					title="Directe voorkennis"
					isPriorKnowledge={true}
					analysis={analysis}
				/> : null}
				{course.blocks.map((block, index) => <Block
					key={index}
					landscape={landscape}
					courseId={course.name}
					skillIds={overview.blocks[index]}
					active={activeBlock === index}
					toggleActive={() => toggleActiveBlock(index)}
					title={block.title}
					number={index + 1}
					isPriorKnowledge={false}
					analysis={analysis}
				/>)}
			</div>
			<SkillList courseId={course.name} skillIds={skillIds} landscape={landscape} isPriorKnowledge={activeBlock === -1} analysis={analysis} />
		</div>
	)
}

function PortraitCourse({ course, overview, analysis, activeBlock, toggleActiveBlock }) {
	const landscape = false
	const classes = useStyles({ landscape })
	const hasPriorKnowledge = overview.priorKnowledge.length > 0

	return (
		<div className={clsx(classes.courseOverview, classes.portraitOverview)}>
			<div className={clsx(classes.blockList, 'blockList')}>
				{hasPriorKnowledge ? <Block
					landscape={landscape}
					courseId={course.name}
					skillIds={overview.priorKnowledge}
					active={activeBlock === -1}
					toggleActive={() => toggleActiveBlock(-1)}
					title="Directe voorkennis"
					isPriorKnowledge={true}
					analysis={analysis}
				/> : null}
				{course.blocks.map((block, index) => (
					<Block
						key={index}
						landscape={landscape}
						courseId={course.name}
						skillIds={overview.blocks[index]}
						active={activeBlock === index}
						toggleActive={() => toggleActiveBlock(index)}
						title={block.title}
						number={index + 1}
						isPriorKnowledge={false}
						analysis={analysis}
					/>
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
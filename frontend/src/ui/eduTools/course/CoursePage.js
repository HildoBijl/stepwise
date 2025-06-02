import React, { useState, useCallback, useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { TranslationFile, Translation, useTranslator } from 'i18n'

import { strFreePractice } from '../courses'

import { useCourseData, SkillList, SkillRecommender, Block, GradeEstimate } from './components'

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
	gradeEstimate: {
		padding: '0.5rem',
		width: '100%',

		'& .disclaimer': {
			fontSize: '0.6rem',
		},
	},
}))

export function CoursePage(props) {
	const landscape = useMediaQuery('(orientation: landscape)')

	// Load in relevant data about the course.
	const { courseId, course, overview, analysis } = useCourseData()
	const recommendation = analysis?.recommendation
	const hasRecommendation = !!recommendation

	// Determine which block to open up at the start.
	let recommendationBlock = overview.blocks.findIndex(blockList => blockList.includes(recommendation)) // Find the block containing the recommendation.
	if (overview.priorKnowledge.includes(recommendation))
		recommendationBlock = -1 // -1 means prior knowledge.
	if (recommendation === strFreePractice)
		recommendationBlock = overview.blocks.length - 1 // When everything is mastered, open up the last block.

	// Track which block is active.
	const [activeBlock, setActiveBlock] = useState() // -1 means prior knowledge. Undefined means none selected.
	const toggleActiveBlock = useCallback((index) => setActiveBlock(activeBlock => activeBlock === index && !landscape ? undefined : index), [setActiveBlock, landscape])

	// Make the block with the recommendation active when figuring out said recommendation.
	useEffect(() => {
		if (hasRecommendation && activeBlock === undefined) {
			setActiveBlock(activeBlock => {
				if (activeBlock !== undefined)
					return activeBlock
				return recommendationBlock
			})
		}
	}, [hasRecommendation, recommendationBlock, activeBlock, setActiveBlock])

	// If there is an unknown course, display this.
	if (!course)
		return <TranslationFile path="eduTools/pages/coursePage"><div><Translation entry="unknownCourse.message">Oops... The course you wanted to visit is unknown here. Perhaps something is wrong in the URL?</Translation></div></TranslationFile>

	// Render the component.
	const data = { ...props, course, overview, analysis, activeBlock, toggleActiveBlock }
	return <TranslationFile path="eduTools/pages/coursePage">
		{hasRecommendation ? <SkillRecommender courseId={courseId} recommendation={recommendation} /> : null}
		{landscape ? <LandscapeCourse {...data} /> : <PortraitCourse {...data} />}
	</TranslationFile>
}

function LandscapeCourse({ course, overview, analysis, activeBlock, toggleActiveBlock }) {
	const translate = useTranslator()
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
					courseId={course.id}
					skillIds={overview.priorKnowledge}
					active={activeBlock === -1}
					toggleActive={() => toggleActiveBlock(-1)}
					name={translate('Prior knowledge', 'priorKnowledge')}
					isPriorKnowledge={true}
					analysis={analysis}
				/> : null}
				{course.blocks.map((block, index) => <Block
					key={index}
					landscape={landscape}
					courseId={course.id}
					skillIds={overview.blocks[index]}
					active={activeBlock === index}
					toggleActive={() => toggleActiveBlock(index)}
					name={translate(block.name, `${course.id}.blocks.${index}`, 'eduContent/courseInfo')}
					number={index + 1}
					isPriorKnowledge={false}
					analysis={analysis}
				/>)}
				<GradeEstimate />
			</div>
			<SkillList courseId={course.id} skillIds={skillIds} display={activeBlock !== undefined} landscape={landscape} isPriorKnowledge={activeBlock === -1} analysis={analysis} />
		</div>
	)
}

function PortraitCourse({ course, overview, analysis, activeBlock, toggleActiveBlock }) {
	const translate = useTranslator()
	const landscape = false
	const classes = useStyles({ landscape })
	const hasPriorKnowledge = overview.priorKnowledge.length > 0

	return (
		<div className={clsx(classes.courseOverview, classes.portraitOverview)}>
			<div className={clsx(classes.blockList, 'blockList')}>
				{hasPriorKnowledge ? <Block
					landscape={landscape}
					courseId={course.id}
					skillIds={overview.priorKnowledge}
					active={activeBlock === -1}
					toggleActive={() => toggleActiveBlock(-1)}
					name={translate('Prior knowledge', 'priorKnowledge')}
					isPriorKnowledge={true}
					analysis={analysis}
				/> : null}
				{course.blocks.map((block, index) => (
					<Block
						key={index}
						landscape={landscape}
						courseId={course.id}
						skillIds={overview.blocks[index]}
						active={activeBlock === index}
						toggleActive={() => toggleActiveBlock(index)}
						name={translate(block.name, `${course.id}.blocks.${index}`, 'eduContent/courseInfo')}
						number={index + 1}
						isPriorKnowledge={false}
						analysis={analysis}
					/>
				))}
				<GradeEstimate />
			</div>
		</div>
	)
}

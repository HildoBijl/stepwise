import React, { useState, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { keysToObject } from 'step-wise/util'
import { getInverseCDF } from 'step-wise/skillTracking'

import { TranslationFile, Translation, useTranslator } from 'i18n'
import { TitleItem } from 'ui/layout/Title'

import courses from '../courses'

import { strFreePractice } from './util'
import SkillRecommender from './SkillRecommender'
import Block from './Block'
import SkillList from './SkillList'
import { useCourseData } from './Provider'

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

export default function Course(props) {
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
		return <TranslationFile path="edu/courses/coursePage"><div><Translation entry="courseNotFound">Oops... De cursus die je wilt bezoeken is niet bekend. Mogelijk is er iets mis met de link?</Translation></div></TranslationFile>

	// Render the component.
	const data = { ...props, course, overview, analysis, activeBlock, toggleActiveBlock }
	return <TranslationFile path="edu/courses/coursePage">
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
					name={translate(block.name, `${course.id}.blocks.${index}`, 'edu/courses/courseInfo')}
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
						name={translate(block.name, `${course.id}.blocks.${index}`, 'edu/courses/courseInfo')}
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

export function GradeEstimate() {
	const classes = useStyles()
	const { skillsDataLoaded, skillsData, course } = useCourseData()

	// Do not show an estimate when no set-up has been given.
	const { setup } = course
	if (!skillsDataLoaded || !setup)
		return null

	// Gather all the required data.
	const coefficientSet = keysToObject(setup.getSkillList(), skillId => skillsData[skillId].coefficients)
	const EV = setup.getEV(coefficientSet)
	const distribution = setup.getDistribution(coefficientSet)
	const inverseCDF = getInverseCDF(distribution)

	// Display the grade estimate.
	const scoreToPercentage = score => `${Math.round(score * 100)}%`
	const cdfValueToPercentage = cdfValue => scoreToPercentage(inverseCDF(cdfValue))
	return <div className={clsx(classes.gradeEstimate, 'gradeEstimate')}
	>
		<div className="estimate"><Translation entry="gradeEstimate">Based on your practice so far, we expect a score of roughly <strong>{{ percentage: scoreToPercentage(EV) }}</strong> (about <strong>{{ lowerPercentage: cdfValueToPercentage(0.3) }} - {{ upperPercentage: cdfValueToPercentage(0.7) }}</strong>) on the final test.</Translation><sup>*</sup></div>
		<div className="disclaimer"><sup>*</sup><Translation entry="disclaimer">No rights can be derived from this estimate.</Translation></div>
	</div>
}

export function CourseName() {
	const { courseId } = useParams()
	const course = courses[courseId.toLowerCase()]
	const courseInfoPath = 'edu/courses/courseInfo'
	if (!course)
		return <TitleItem path={courseInfoPath} entry="unknownCourse.name" name="Unknown course" />
	return <TitleItem path={courseInfoPath} entry={`${course.id}.name`} name={course.name} />
}

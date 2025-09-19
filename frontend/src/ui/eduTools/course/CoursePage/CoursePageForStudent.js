import { useState, useCallback, useEffect } from 'react'
import { Box, useMediaQuery } from '@mui/material'

import { TranslationFile, TranslationSection, useTranslator } from 'i18n'

import { strFreePractice } from '../../courses'

import { useCourseData, SkillList, SkillRecommender, Block, GradeEstimate } from '../components'

const translationPath = 'eduTools/pages/coursePage'
const translationSection = 'students'

// Define central style.
const courseOverviewStyle = {
	alignItems: 'flex-start',
	display: 'flex',
	flexFlow: 'row nowrap',
	width: '100%',
}

export function CoursePageForStudent() {
	// Load in relevant data about the course.
	const { course, overview, analysis } = useCourseData()
	const recommendation = analysis?.recommendation
	const hasRecommendation = !!recommendation

	// Determine which block to open up at the start.
	let recommendationBlock = overview.blocks.findIndex(block => block.contents.includes(recommendation)) // Find the block containing the recommendation.
	if (overview.priorKnowledge.includes(recommendation))
		recommendationBlock = -1 // -1 means prior knowledge.
	if (recommendation === strFreePractice)
		recommendationBlock = overview.blocks.length - 1 // When everything is mastered, open up the last block.

	// Track which block is active.
	const [activeBlock, setActiveBlock] = useState() // -1 means prior knowledge. Undefined means none selected.
	const landscape = useMediaQuery('(orientation: landscape)')
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

	// Render the component.
	const data = { course, overview, analysis, activeBlock, toggleActiveBlock }
	return <TranslationFile path={translationPath}>
		<TranslationSection entry={translationSection}>
			{hasRecommendation ? <SkillRecommender courseCode={course.code} recommendation={recommendation} /> : null}
			{landscape ? <LandscapeCourse {...data} /> : <PortraitCourse {...data} />}
		</TranslationSection>
	</TranslationFile>
}

function LandscapeCourse({ course, overview, analysis, activeBlock, toggleActiveBlock }) {
	const translate = useTranslator()
	const landscape = true

	// Determine which skillIds to show on the right.
	let skillIds = null
	if (activeBlock === undefined)
		skillIds = []
	else if (activeBlock === -1)
		skillIds = overview.priorKnowledge
	else
		skillIds = overview.blocks[activeBlock].contents

	// Determine other important data.
	const hasPriorKnowledge = overview.priorKnowledge.length > 0

	return (
		<Box sx={courseOverviewStyle}>
			<Box sx={{ marginRight: '1rem', width: '50%' }}>
				{hasPriorKnowledge ? <Block
					landscape={landscape}
					courseCode={course.code}
					skillIds={overview.priorKnowledge}
					active={activeBlock === -1}
					toggleActive={() => toggleActiveBlock(-1)}
					name={translate('Prior knowledge', 'priorKnowledge')}
					isPriorKnowledge={true}
					analysis={analysis}
				/> : null}
				{overview.blocks.map((block, index) => <Block
					key={index}
					landscape={landscape}
					courseCode={course.code}
					skillIds={block.contents}
					active={activeBlock === index}
					toggleActive={() => toggleActiveBlock(index)}
					name={translate(block.name, `${course.organization}.${course.code}.blocks.${index}`, 'eduContent/courseInfo')}
					number={index + 1}
					isPriorKnowledge={false}
					analysis={analysis}
				/>)}
				<GradeEstimate />
			</Box>
			<SkillList courseCode={course.code} skillIds={skillIds} display={activeBlock !== undefined} landscape={landscape} isPriorKnowledge={activeBlock === -1} analysis={analysis} sx={{ width: '50%' }} />
		</Box>
	)
}

function PortraitCourse({ course, overview, analysis, activeBlock, toggleActiveBlock }) {
	const translate = useTranslator()
	const landscape = false
	const hasPriorKnowledge = overview.priorKnowledge.length > 0

	return (
		<Box sx={courseOverviewStyle}>
			<Box sx={{ width: '100%' }}>
				{hasPriorKnowledge ? <Block
					landscape={landscape}
					courseCode={course.code}
					skillIds={overview.priorKnowledge}
					active={activeBlock === -1}
					toggleActive={() => toggleActiveBlock(-1)}
					name={translate('Prior knowledge', 'priorKnowledge')}
					isPriorKnowledge={true}
					analysis={analysis}
				/> : null}
				{overview.blocks.map((block, index) => (
					<Block
						key={index}
						landscape={landscape}
						courseCode={course.code}
						skillIds={block.contents}
						active={activeBlock === index}
						toggleActive={() => toggleActiveBlock(index)}
						name={translate(block.name, `${course.organization}.${course.code}.blocks.${index}`, 'eduContent/courseInfo')}
						number={index + 1}
						isPriorKnowledge={false}
						analysis={analysis}
					/>
				))}
				<GradeEstimate />
			</Box>
		</Box>
	)
}

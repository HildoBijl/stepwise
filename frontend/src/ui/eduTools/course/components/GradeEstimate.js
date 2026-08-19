import React from 'react'
import { Box } from '@mui/material'

import { fromKeys } from '@step-wise/js-utils'
import { getQuantileFunction } from '@step-wise/skill-tracking'

import { Translation } from 'i18n'

import { useCourseData } from './CourseProvider'

export function GradeEstimate() {
	const { skillsDataLoaded, skillsData, overview } = useCourseData()

	// Do not show an estimate when no set-up has been given.
	const { setup } = overview
	if (!skillsDataLoaded || !setup)
		return null

	// Gather all the required data.
	const coefficientSet = fromKeys(setup.getSkillList(), skillId => skillsData[skillId].coefficients)
	const EV = setup.getExpectedValue(coefficientSet)
	const distribution = setup.getDistribution(coefficientSet)
	const quantile = getQuantileFunction(distribution)

	// Display the grade estimate.
	const scoreToPercentage = score => `${Math.round(score * 100)}%`
	const probabilityToPercentage = probability => scoreToPercentage(quantile(probability))
	return <Box sx={{ padding: '0.5rem', width: '100%' }}>
		<Box><Translation entry="gradeEstimate">Based on your practice so far, we expect a score of roughly <strong>{{ percentage: scoreToPercentage(EV) }}</strong> (about <strong>{{ lowerPercentage: probabilityToPercentage(0.3) }} - {{ upperPercentage: probabilityToPercentage(0.7) }}</strong>) on the final test.</Translation><sup>*</sup></Box>
		<Box sx={{ fontSize: '0.6rem' }}><sup>*</sup><Translation entry="disclaimer">No rights can be derived from this estimate.</Translation></Box>
	</Box>
}

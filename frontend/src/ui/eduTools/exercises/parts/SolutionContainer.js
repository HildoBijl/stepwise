import React from 'react'

import { Translation } from 'i18n'
import { Arrow } from 'ui/components'

import { useExerciseScrolling } from '../wrappers/ExerciseWrapper'

import { ContentsContainer } from './ContentsContainer'

export function SolutionContainer({ onClick, onExpand, problemStep, scrollTarget, ...props }) {
	const scrollToExercisePart = useExerciseScrolling()
	const { part: scrollPart = 'solution', step: scrollStep = problemStep } = scrollTarget || {}
	const handleExpand = () => {
		onExpand?.()
		scrollToExercisePart(scrollStep, { part: scrollPart })
	}
	const handleClick = onClick ? event => {
		onClick(event)
		handleExpand()
	} : undefined

	return <ContentsContainer
		{...props}
		Icon={Arrow}
		canToggle={true}
		color="success"
		onClick={handleClick}
		onExpand={handleExpand}
		solutionStep={problemStep}
		text={<Translation entry="solution" path="eduTools/exercises">Solution</Translation>} />
}

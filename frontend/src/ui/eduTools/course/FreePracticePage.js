import React, { useState, useCallback, useEffect } from 'react'

import { sample } from '@step-wise/js-utils'
import { hasExercises } from '@step-wise/exercises'

import { Translation, TranslationCatalog } from '@step-wise/i18n'

import { SkillPageForSkill } from '../skills'

import { useCourseData } from './components'

export function FreePracticePage() {
	const { courseDefinition } = useCourseData()
	const [skillId, setSkillId] = useState()

	// Select a skillId to display, taking into account the weights defined for the course.
	const changeSkill = useCallback((previousSkillId) => {
		// When the course has not load yet, do nothing.
		if (!courseDefinition)
			return

		// Get the skillIds and weights. Turn the weights of skills without exercises to zero.
		const skillIds = courseDefinition.learningGoalIds
		const weights = courseDefinition.learningGoalWeights
		skillIds.forEach((skillId, index) => {
			if (!hasExercises(skillId))
				weights[index] = 0
		})

		// Adjust the weights to give the previous skillId a zero weight.
		const weightsClone = [...weights]
		if (previousSkillId) {
			const previousSkillIndex = skillIds.findIndex(skillId => skillId === previousSkillId)
			if (previousSkillIndex !== -1)
				weightsClone[previousSkillIndex] = 0
		}

		// Is there a skill with non-zero weight that's unequal to the previous skill?
		if (weightsClone.find(weight => weight !== 0))
			setSkillId(sample(skillIds, { weights: weightsClone }))
		else if (weights.find(weight => weight !== 0)) // Is there a skill with non-zero weight?
			setSkillId(sample(skillIds, { weights }))
		else
			setSkillId(null) // Null means there's an error.
	}, [courseDefinition, setSkillId])

	// On loading, pick a random skill.
	useEffect(() => {
		if (!skillId)
			changeSkill()
	}, [skillId, courseDefinition, changeSkill])

	// When no skill has been chosen, show a loading message.
	if (skillId === undefined) {
		return <TranslationCatalog folder={['eduTools', 'pages']} name="freePracticePage">
			<Translation id="selectingSkill">Selecting the right skill to practice ...</Translation>
		</TranslationCatalog>
	}

	// When no skill has exercises, show an error message.
	if (skillId === null) {
		return <TranslationCatalog folder={['eduTools', 'pages']} name="freePracticePage">
			<Translation id="noSkillWithExercises">The free practice mode is not available yet for this course: the course still seems to be under development. None of the final goals of this course has exercises.</Translation>
		</TranslationCatalog>
	}

	// When a skill has been chosen, show an exercise for that skill.
	return <SkillPageForSkill skillId={skillId} freePracticeMode={true} onNewExercise={() => changeSkill(skillId)} />
}

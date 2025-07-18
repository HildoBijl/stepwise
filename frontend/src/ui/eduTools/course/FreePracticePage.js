import React, { useState, useCallback, useEffect } from 'react'

import { selectRandomly } from 'step-wise/util'
import { skillTree } from 'step-wise/eduTools'

import { TranslationFile, Translation } from 'i18n'

import { SkillPageForSkill } from '../skills'

import { useCourseData } from './components'

const translationPath = 'eduTools/pages/freePracticePage'

export function FreePracticePage() {
	const { overview } = useCourseData()
	const [skillId, setSkillId] = useState()

	// Select a skillId to display, taking into account the weights defined for the course.
	const changeSkill = useCallback((previousSkillId) => {
		// Get the skillIds and weights. Turn the weights of skills without exercises to zero.
		const skillIds = overview.goals
		const weights = overview.goalWeights || overview.goals.map(() => 1)
		skillIds.forEach((skillId, index) => {
			if (!Array.isArray(skillTree[skillId].exercises) || skillTree[skillId].exercises.length === 0)
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
			setSkillId(selectRandomly(skillIds, weightsClone))
		else if (weights.find(weight => weight !== 0)) // Is there a skill with non-zero weight?
			setSkillId(selectRandomly(skillIds, weights))
		else
			setSkillId(null) // Null means there's an error.
	}, [overview, setSkillId])

	// On loading, pick a random skill.
	useEffect(() => {
		if (!skillId)
			changeSkill()
	}, [skillId, changeSkill])

	// When no skill has been chosen, show a loading message.
	if (skillId === undefined) {
		return <TranslationFile path={translationPath}>
			<Translation entry="selectingSkill">Selecting the right skill to practice ...</Translation>
		</TranslationFile>
	}

	// When no skill has exercises, show an error message.
	if (skillId === null) {
		return <TranslationFile path={translationPath}>
			<Translation entry="noSkillWithExercises">The free practice mode is not available yet for this course: the course still seems to be under development. None of the final goals of this course has exercises.</Translation>
		</TranslationFile>
	}

	// When a skill has been chosen, show an exercise for that skill.
	return <SkillPageForSkill skillId={skillId} freePracticeMode={true} onNewExercise={() => changeSkill(skillId)} />
}

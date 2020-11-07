import React from 'react'
import { Link } from 'react-router-dom'

import skills from 'step-wise/edu/skills'

import { usePaths } from 'ui/routing'
import NotificationBar from 'ui/components/NotificationBar'

import { useSkillId } from '../../skills/Skill'

import { useCourseData } from './Provider'

export default function SkillAdvice() {
	const { type: adviceType, recommendation } = useSkillAdvice()
	const paths = usePaths()
	const { courseId, course } = useCourseData()

	// Based on the advice received, generate a warning.
	switch (adviceType) {
		case undefined: // This skill is not part of the course.
		return null

		case 0: // This skill is already mastered. Show a recommendation.
			return <NotificationBar type="warning">Je beheerst deze vaardigheid al goed! Als je effectief wilt oefenen voor <Link to={paths.course({ courseId })}>{course.name}</Link>, dan kun je beter bezig gaan met <Link to={paths.courseSkill({ courseId, skillId: recommendation })}>{skills[recommendation].name}</Link>.</NotificationBar>

		case 1: // This skill is reasonable to practice. Don't show a warning.
			return null

		case 2: // This skill is not mastered. Find a prior skill that requires practice. If there is none, this is a good skill to practice.
			return <NotificationBar type="warning">Je zit nog niet op het niveau van deze vaardigheid. Het is handiger om eerst <Link to={paths.courseSkill({ courseId, skillId: recommendation })}>{skills[recommendation].name}</Link> te oefenen.</NotificationBar>

		default:
			throw new Error(`Impossible case.`)
	}
}

// useSkillAdvice returns an object { type: 0/1/2, recommendation: 'someSkillId' } that 
export function useSkillAdvice() {
	const { analysis } = useCourseData()
	const skillId = useSkillId()

	switch (analysis.practiceNeeded[skillId]) {
		case undefined: // This skill is not part of the course.
			return {}

		case 0: // This skill is already mastered. Show a recommendation.
			return { type: 0, recommendation: analysis.recommendation }

		case 1: // This skill is reasonable to practice. Don't show a warning.
			return { type: 1 }

		case 2: // This skill is not mastered. Find a prior skill that requires practice. If there is none, this is a good skill to practice.
			const recommendation = findPriorSkillToPractice(skillId, analysis.practiceNeeded)
			if (recommendation === skillId)
				return { type: 1 }
			return { type: 2, recommendation }

		default:
			throw new Error(`Impossible case.`)
	}
}

// findPriorSkillToPractice takes a skillId and a practiceNeeded object and determines which prior skill requires 
function findPriorSkillToPractice(skillId, practiceNeeded) {
	// Walk through prior skills to see if one requires practice.
	const recommendation = skills[skillId].prerequisites.find(prerequisiteId => practiceNeeded[prerequisiteId] === 2)

	// If none requires practice, return that we best practice the current skill.
	if (!recommendation)
		return skillId

	// If there is one that requires practice, recursively search further.
	return findPriorSkillToPractice(recommendation, practiceNeeded)
}
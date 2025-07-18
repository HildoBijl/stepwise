import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { CheckCircle as SuccessIcon, Info as InfoIcon, TrendingFlat as RightArrow, VerticalAlignBottom as DownArrow } from '@material-ui/icons'

import { skillTree } from 'step-wise/eduTools'

import { TranslationFile, Translation, useTranslator } from 'i18n'
import { usePrevious } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.
import { linkStyle } from 'ui/theme'
import { usePaths } from 'ui/routingTools'
import { NotificationBar, useModalContext } from 'ui/components'

import { useSkillId } from '../../skills'
import { strFreePractice } from '../../courses'

import { useCourseData } from './CourseProvider'

export function SkillAdvice() {
	useSkillModal()
	return <TranslationFile path="eduTools/pages/skillPage">
		<SkillNotification />
	</TranslationFile>
}

// SkillNotification shows the notification bar at the top of the screen recommending users to go to a different skill within the course.
function SkillNotification() {
	const translate = useTranslator()
	const { type: adviceType, recommendation } = useSkillAdvice()
	const paths = usePaths()
	const { course, overview, analysis } = useCourseData()
	const courseCode = course?.code
	const skillId = useSkillId()

	// First check if the skill is part of the course.
	if (skillId && !overview.all.includes(skillId)) {
		if (recommendation === undefined)
			return <NotificationBar type="warning"><Translation entry="notifications.notPartOfCourse.noRecommendation">The skill you are currently practising is not part of the course <Link to={paths.course({ courseCode })}>{{ course: translate(course.name, `${course.code}.name`, 'eduContent/courseInfo') }}</Link>.</Translation></NotificationBar>
		if (recommendation === strFreePractice)
			return <NotificationBar type="warning"><Translation entry="notifications.notPartOfCourse.freePracticeRecommendation">The skill you are currently practising is not part of the course <Link to={paths.course({ courseCode })}>{{ course: translate(course.name, `${course.code}.name`, 'eduContent/courseInfo') }}</Link>. If you want to practice for this course, it's best to use the <Link to={paths.freePractice({ courseCode })}>free practice mode</Link>.</Translation></NotificationBar>
		const recommendedSkill = skillTree[analysis.recommendation]
		return <NotificationBar type="warning"><Translation entry="notifications.notPartOfCourse.skillRecommendation">The skill you are currently practising is not part of the course <Link to={paths.course({ courseCode })}>{{ course: translate(course.name, `${course.code}.name`, 'eduContent/courseInfo') }}</Link>. If you want to practice for this course, it's best to work on <Link to={paths.courseSkill({ courseCode, skillId: recommendedSkill.id })}>{{ skill: translate(recommendedSkill.name, `${recommendedSkill.path.join('.')}.${recommendedSkill.id}`, 'eduContent/skillNames') }}</Link>.</Translation></NotificationBar>
	}

	// Check if there is a recommendation. If not, not all data is loaded yet.
	if (!recommendation)
		return null

	// Based on the advice received, generate a notification.
	switch (adviceType) {
		case undefined: // This skill is not part of the course.
			return null

		case 0: // This skill is already mastered. Show a recommendation.
			if (recommendation === strFreePractice)
				return <NotificationBar type="info"><Translation entry="notifications.alreadyMastered.freePracticeRecommendation">You have already sufficiently mastered this skill! It is more effective for the course <Link to={paths.course({ courseCode })}>{{ course: translate(course.name, `${course.code}.name`, 'eduContent/courseInfo') }}</Link> to use the <Link to={paths.freePractice({ courseCode })}>free practice mode</Link>.</Translation></NotificationBar>
			const skill = skillTree[recommendation]
			return <NotificationBar type="info"><Translation entry="notifications.alreadyMastered.skillRecommendation">You have already sufficiently mastered this skill! It is more effective for the course <Link to={paths.course({ courseCode })}>{{ course: translate(course.name, `${course.code}.name`, 'eduContent/courseInfo') }}</Link> if you practice <Link to={paths.courseSkill({ courseCode, skillId: recommendation })}>{{ skill: translate(skill.name, `${skill.path.join('.')}.${skill.id}`, 'eduContent/skillNames') }}</Link>.</Translation></NotificationBar>

		case 1: // This skill is reasonable to practice. Don't show a warning.
			return null

		case 2: // This skill is not mastered. Find a prior skill that requires practice. If there is none, this is a good skill to practice.
			const recommendedSkill = skillTree[recommendation]
			if (skillId === undefined)
				return <NotificationBar type="warning"><Translation entry="notifications.notMastered.onFreePracticeMode">You're not ready yet for free practice on the final level of the course. It is wiser to first practice <Link to={paths.courseSkill({ courseCode, skillId: recommendation })}>{{ skill: translate(recommendedSkill.name, `${recommendedSkill.path.join('.')}.${recommendedSkill.id}`, 'eduContent/skillNames') }}</Link>.</Translation></NotificationBar>
			return <NotificationBar type="warning"><Translation entry="notifications.notMastered.onSkill">You have not yet mastered all the prerequisites for this skill. It is wiser to first practice <Link to={paths.courseSkill({ courseCode, skillId: recommendation })}>{{ skill: translate(recommendedSkill.name, `${recommendedSkill.path.join('.')}.${recommendedSkill.id}`, 'eduContent/skillNames') }}</Link>.</Translation></NotificationBar>

		default:
			throw new Error(`Impossible case.`)
	}
}

const useStyles = makeStyles((theme) => ({
	skillModal: {
		'& a': {
			...linkStyle,
		},

		'& .title': {
			color: theme.palette.success.main,
			fontSize: '1.5rem',
			fontWeight: 'bold',
			textAlign: 'center',
		},

		'& .icon': {
			display: 'flex',
			flexFlow: 'row nowrap',
			justifyContent: 'center',
			margin: '0.8rem 0',

			'& svg': {
				height: '8rem',
				width: '8rem',
			},
		},

		'& .message': {
			margin: '0.4rem 0',
			textAlign: 'justify',
		},

		'& .buttons': {
			display: 'flex',
			flexFlow: 'row wrap',
			justifyContent: 'stretch',
			margin: '0.4rem -0.6rem -0.4rem',

			'& .button': {
				flex: '1 1 auto',
				margin: '0.4rem 0.6rem',

				'& .rotate': {
					lineHeight: 0,
					transform: 'rotate(180deg)',
				},
			},
		},

		'&.masteryModal': {
			'& .title': {
				color: theme.palette.success.main,
			},
			'& .icon': {
				color: theme.palette.success.main,
			},

		},
		'&.repeatModal': {
			'& .title': {
				color: theme.palette.info.main,
			},
			'& .icon': {
				color: theme.palette.info.main,
			},
		},
	},
}))

// useSkillModal shows a pop-up modal whenever the skill advice changes. So when the user mastered the skill he's practicing ("mastery") or when he sinks a prerequisite too low ("repeat").
function useSkillModal() {
	const translate = useTranslator()
	const classes = useStyles()
	const paths = usePaths()
	const navigate = useNavigate()
	const { course, skillsDataLoaded } = useCourseData()
	const courseCode = course?.code
	const skillId = useSkillId()
	const { useModal, closeModal } = useModalContext()
	const { type: adviceType, recommendation } = useSkillAdvice()

	// Set up handlers.
	const goToRecommendation = () => {
		closeModal()
		navigate(recommendation === strFreePractice ? paths.freePractice({ courseCode }) : paths.courseSkill({ courseCode, skillId: recommendation }))
	}

	// Determine the contents to show in the modal. (If there is no recommendation, don't do anything yet. We don't have all data yet.)
	let contents = <div />
	if (skillsDataLoaded) {
		if (adviceType === 0) {
			const message = recommendation === strFreePractice ?
				<Translation entry="modals.mastery.toFreePracticeMode">You just mastered <Link to={paths.courseSkill({ courseCode, skillId })} onClick={closeModal}>{{ passedSkill: translate(skillTree[skillId].name, `${skillTree[skillId].path.join('.')}.${skillId}`, 'eduContent/skillNames') }}</Link>, and with that all skills of <Link to={paths.course({ courseCode })} onClick={closeModal}>{{ course: translate(course.name, `${course.code}.name`, 'eduContent/courseInfo') }}</Link>! We recommend you to practice with a mixed assortment of exercises in the <Link to={paths.freePractice({ courseCode })} onClick={closeModal}>free practice mode</Link>.</Translation> :
				<Translation entry="modals.mastery.nextSkill">You just mastered <Link to={paths.courseSkill({ courseCode, skillId })} onClick={closeModal}>{{ passedSkill: translate(skillTree[skillId].name, `${skillTree[skillId].path.join('.')}.${skillId}`, 'eduContent/skillNames') }}</Link>! You can carry on with the next skill: <Link to={paths.courseSkill({ courseCode, skillId: recommendation })} onClick={closeModal}>{{ nextSkill: translate(skillTree[recommendation].name, `${skillTree[recommendation].path.join('.')}.${recommendation}`, 'eduContent/skillNames') }}</Link>.</Translation>
			contents = (
				<div className={clsx(classes.skillModal, 'masteryModal')}>
					<div className="title"><Translation entry="modals.mastery.title">Amazing!</Translation></div>
					<div className="icon"><SuccessIcon /></div>
					<div className="message">{message}</div>
					<div className="buttons">
						<Button variant="contained" className="button" startIcon={<DownArrow />} onClick={closeModal} color="secondary"><Translation entry="buttons.stay">Stay for a bit</Translation></Button>
						<Button variant="contained" className="button" endIcon={<RightArrow />} onClick={goToRecommendation} color="primary"><Translation entry="buttons.continue">Continue onwards</Translation></Button>
					</div>
				</div>
			)
		}
		if (adviceType === 2) {
			const skill = skillTree[recommendation]
			contents = (
				<div className={clsx(classes.skillModal, 'repeatModal')}>
					<div className="title"><Translation entry="modals.deficiency.title">Oh, wait ...</Translation></div>
					<div className="icon"><InfoIcon /></div>
					<div className="message"><Translation entry="modals.deficiency.toDeficientSkill">If seems that you haven't yet sufficiently mastered the subskill <Link to={paths.courseSkill({ courseCode, skillId: recommendation })} onClick={closeModal}>{{ deficientSkill: translate(skill.name, `${skill.path.join('.')}.${skill.id}`, 'eduContent/skillNames') }}</Link>. We recommend to practice this separately first.</Translation></div>
					<div className="message"><Translation entry="modals.deficiency.reassurance">Don't worry: your exercise remains saved and you can always come back.</Translation></div>
					<div className="buttons">
						<Button variant="contained" className="button" startIcon={<div className="rotate"><RightArrow /></div>} onClick={goToRecommendation} color="primary"><Translation entry="buttons.goBack">Go back a step</Translation></Button>
						<Button variant="contained" className="button" endIcon={<DownArrow />} onClick={closeModal} color="secondary"><Translation entry="buttons.stay">Stay for a bit</Translation></Button>
					</div>
				</div>
			)
		}
	}
	const [, setShowModal] = useModal(<TranslationFile path="eduTools/pages/skillPage">{contents}</TranslationFile>)

	// Use an effect to show a modal when the advice changes. But only do this when we previously already had good data and suddenly the advice type changes while staying at the same skill.
	const previousAdviceType = usePrevious(adviceType)
	const previousSkillId = usePrevious(skillId)
	const previousSkillsDataLoaded = usePrevious(skillsDataLoaded)
	useEffect(() => {
		if (previousSkillsDataLoaded && previousSkillId === skillId && previousAdviceType === 1 && (adviceType === 0 || adviceType === 2))
			setShowModal(true)
	}, [previousSkillsDataLoaded, adviceType, previousAdviceType, skillId, previousSkillId, setShowModal])
}

// useSkillAdvice returns an object { type: 0/1/2, recommendation: 'someSkillId' } that is used to determine whether the user should be sent to another skill. The types match with isPracticeNeeded: 0 means "all fine", 1 means "OK, but could be better" and 2 means "wrong". The recommendation is based on the current skillId: it's not always the course recommendation. For instance, if a prerequisite of the given skill is good to practice, it recommends that one.
export function useSkillAdvice() {
	const { overview, analysis } = useCourseData()
	const skillId = useSkillId()

	// If there is no analysis data, then do not give advice.
	if (!analysis)
		return {}

	// If there is no skillId, then we are in free practice mode.
	if (!skillId) {
		// If there is a skill with practiceNeeded === 2 then this should be practiced first.
		const recommendation = overview.all.find(skillId => analysis.practiceNeeded[skillId] === 2 && skillTree[skillId].exercises.length > 0)
		if (recommendation)
			return { type: 2, recommendation } // A skill with significant work needed was found.
		return { type: 1, recommendation: strFreePractice } // All good: recommend free practice. Give advice 1 since free practice can always need some work.
	}

	// There is a skillId. Check if it's OK to work on it.
	switch (analysis.practiceNeeded[skillId]) {
		case undefined: // This skill is not part of the course. Give the general recommendation.
			return { recommendation: analysis.recommendation }

		case 0: // This skill is already mastered. Show a recommendation, ideally based on the current skill, but otherwise the general course recommendation.
			return { type: 0, recommendation: findNextSkillToPractice(skillId, overview.all, analysis.practiceNeeded) || analysis.recommendation }

		case 1: // This skill is reasonable to practice. Don't show a warning.
			return { type: 1 }

		case 2: // This skill is not mastered. Find a prior skill that requires practice. If there is none, this is a good skill to practice.
			const recommendation = findPriorSkillToPractice(skillId, overview.all, analysis.practiceNeeded)
			if (recommendation === skillId)
				return { type: 1 }
			return { type: 2, recommendation }

		default: // Impossible to reach.
			throw new Error(`Invalid practice needed index: a practice needed index was given that was not among the available options.`)
	}
}

// findPriorSkillToPractice takes a skillId, a list of courseSkills (order matters) and a practiceNeeded object, and determines which prior skill should be practiced before the current skill. For this, it walks through the prerequisites and checks if any of them require work. This is done recursively. With "require work" we mean that practiceNeeded equals 2. If the includeDoubtfulCases parameter is set to true, also practiceNeeded equaling 1 is included.
function findPriorSkillToPractice(skillId, courseSkills, practiceNeeded, includeDoubtfulCases = false) {
	// Find the first skill in the course that is a prerequisite, requires work and can be worked on.
	const recommendation = courseSkills.find(prerequisiteId => skillTree[skillId].prerequisites.includes(prerequisiteId) && (practiceNeeded[prerequisiteId] === 2 || (includeDoubtfulCases && practiceNeeded[prerequisiteId] === 1)) && skillTree[prerequisiteId].exercises.length > 0)

	// If no prior skill requires work, return that we best practice the current skill.
	if (!recommendation)
		return skillId

	// If there is one that requires practice, recursively search further from it.
	return findPriorSkillToPractice(recommendation, courseSkills, practiceNeeded, includeDoubtfulCases)
}

// findNextSkillToPractice takes a skillId, a list of courseSkills (order matters) and a practiceNeeded object and determines which next skill should be practice upon completion of the current skill. For this, it studies the continuation skills and sees if any require work. (Or even continuations of those continuations, if the continuations are done already.) It then also checks their children, to see if any of those still require works. The most suitable option (that is, the first in the general skills list) is returned. If nothing suitable is found, undefined is returned.
function findNextSkillToPractice(skillId, courseSkills, practiceNeeded) {
	// Find the first skill in the course that is a continuation, requires practice and can be worked on. If there is none, do a depth-first search on the continuations of the continuations, to see if anything suitable pops up.
	const continuations = courseSkills.filter(continuationId => skillTree[skillId].continuations.includes(continuationId))
	let recommendation = continuations.find(continuationId => (practiceNeeded[continuationId] === 1 || practiceNeeded[continuationId] === 2) && skillTree[continuationId].exercises.length > 0)
	if (!recommendation)
		return continuations.find(continuationId => findNextSkillToPractice(continuationId, courseSkills, practiceNeeded))

	// For the given recommendation, check child skills. If any of them require work, recommend that one instead.
	return findPriorSkillToPractice(recommendation, courseSkills, practiceNeeded, true)
}

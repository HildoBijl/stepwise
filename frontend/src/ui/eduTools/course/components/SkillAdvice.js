import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import { CheckCircle as SuccessIcon, Info as InfoIcon, TrendingFlat as RightArrow, VerticalAlignBottom as DownArrow } from '@mui/icons-material'

import { freePracticeRecommendation } from '@step-wise/course-analysis'
import { moduleTree } from '@step-wise/module-tree'
import { usePrevious } from '@step-wise/react-utils'
import { Translation, TranslationCatalog, withTranslation } from '@step-wise/i18n'

import { linkStyle } from 'ui/theme'
import { usePaths } from 'ui/routingTools'
import { NotificationBar, useModalContext } from 'ui/components'

import { useSkillId } from '../../skills'
import { TranslatedSkillName } from '../../skills/components/TranslatedSkillName'
import { getSkillPracticeAdvice } from '../../courses'

import { useCourseData } from './CourseProvider'
import { CourseTranslation } from './CourseTranslation'

const TranslationLink = withTranslation(Link, { tag: 'link' })

export function SkillAdvice() {
	useSkillModal()
	return <TranslationCatalog folder={['eduTools', 'pages']} name="skillPage">
		<SkillNotification />
	</TranslationCatalog>
}

// SkillNotification shows the notification bar at the top of the screen recommending users to go to a different skill within the course.
function SkillNotification() {
	const skillAdvice = useSkillAdvice()
	const paths = usePaths()
	const { course } = useCourseData()
	const courseCode = course?.code
	const skillId = useSkillId()

	// If the course or its analysis has not loaded, no recommendation is given.
	if (!course || !skillAdvice) return null
	const { type: adviceType, recommendation } = skillAdvice

	// First check if the skill is part of the course.
	if (adviceType === 'notInCourse') {
		if (recommendation === freePracticeRecommendation)
			return <NotificationBar type="warning"><Translation group={['notifications', 'notPartOfCourse']} id="freePracticeRecommendation">The skill you are currently practising is not part of the course <TranslationLink to={paths.course({ courseCode })}>{{ course: <CourseTranslation course={course} /> }}</TranslationLink>. If you want to practice for this course, it's best to use the <TranslationLink to={paths.freePractice({ courseCode })}>free practice mode</TranslationLink>.</Translation></NotificationBar>
		const recommendedSkill = moduleTree[recommendation]
		return <NotificationBar type="warning"><Translation group={['notifications', 'notPartOfCourse']} id="skillRecommendation">The skill you are currently practising is not part of the course <TranslationLink to={paths.course({ courseCode })}>{{ course: <CourseTranslation course={course} /> }}</TranslationLink>. If you want to practice for this course, it's best to work on <TranslationLink to={paths.courseSkill({ courseCode, skillId: recommendedSkill.id })}>{{ skill: <TranslatedSkillName skillId={recommendedSkill.id} /> }}</TranslationLink>.</Translation></NotificationBar>
	}

	// Based on the advice received, generate a notification.
	switch (adviceType) {
		case 'moveOnward': // This skill is already mastered. Show a recommendation.
			if (recommendation === freePracticeRecommendation)
				return <NotificationBar type="info"><Translation group={['notifications', 'alreadyMastered']} id="freePracticeRecommendation">You have already sufficiently mastered this skill! It is more effective for the course <TranslationLink to={paths.course({ courseCode })}>{{ course: <CourseTranslation course={course} /> }}</TranslationLink> to use the <TranslationLink to={paths.freePractice({ courseCode })}>free practice mode</TranslationLink>.</Translation></NotificationBar>
			const skill = moduleTree[recommendation]
			return <NotificationBar type="info"><Translation group={['notifications', 'alreadyMastered']} id="skillRecommendation">You have already sufficiently mastered this skill! It is more effective for the course <TranslationLink to={paths.course({ courseCode })}>{{ course: <CourseTranslation course={course} /> }}</TranslationLink> if you practice <TranslationLink to={paths.courseSkill({ courseCode, skillId: recommendation })}>{{ skill: <TranslatedSkillName skillId={skill.id} /> }}</TranslationLink>.</Translation></NotificationBar>

		case 'stay': // This skill is reasonable to practice. Don't show a warning.
			return null

		case 'goBack': // This skill is not mastered. Find a prior skill that requires practice. If there is none, this is a good skill to practice.
			const recommendedSkill = moduleTree[recommendation]
			if (skillId === undefined)
				return <NotificationBar type="warning"><Translation group={['notifications', 'notMastered']} id="onFreePracticeMode">You're not ready yet for free practice on the final level of the course. It is wiser to first practice <TranslationLink to={paths.courseSkill({ courseCode, skillId: recommendation })}>{{ skill: <TranslatedSkillName skillId={recommendedSkill.id} /> }}</TranslationLink>.</Translation></NotificationBar>
			return <NotificationBar type="warning"><Translation group={['notifications', 'notMastered']} id="onSkill">You have not yet mastered all the prerequisites for this skill. It is wiser to first practice <TranslationLink to={paths.courseSkill({ courseCode, skillId: recommendation })}>{{ skill: <TranslatedSkillName skillId={recommendedSkill.id} /> }}</TranslationLink>.</Translation></NotificationBar>

		default:
			throw new Error(`Impossible case.`)
	}
}

// Define styles.
const modalStyle = { '& a': linkStyle }
const titleStyle = {
	fontSize: '1.5rem',
	fontWeight: 'bold',
	textAlign: 'center',
}
const iconStyle = {
	display: 'flex',
	flexFlow: 'row nowrap',
	justifyContent: 'center',
	margin: '0.8rem 0',
	'& svg': {
		height: '8rem',
		width: '8rem',
	},
}
const messageStyle = {
	margin: '0.4rem 0',
	textAlign: 'justify',
}
const buttonsStyle = {
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
}

// useSkillModal shows a pop-up modal whenever the skill advice changes. So when the user mastered the skill he's practicing ("mastery") or when he sinks a prerequisite too low ("repeat").
function useSkillModal() {
	const paths = usePaths()
	const navigate = useNavigate()
	const { course, skillLevelsLoaded } = useCourseData()
	const courseCode = course?.code
	const skillId = useSkillId()
	const { useModal, closeModal } = useModalContext()
	const { type: adviceType, recommendation } = useSkillAdvice() ?? {}

	// Set up handlers.
	const goToRecommendation = () => {
		closeModal()
		navigate(recommendation === freePracticeRecommendation ? paths.freePractice({ courseCode }) : paths.courseSkill({ courseCode, skillId: recommendation }))
	}

	// Determine the contents to show in the modal. (If there is no recommendation, don't do anything yet. We don't have all data yet.)
	let contents = <div />
	if (skillLevelsLoaded) {
		if (adviceType === 'moveOnward') {
			const message = recommendation === freePracticeRecommendation ?
				<Translation group={['modals', 'mastery']} id="toFreePracticeMode">You just mastered <TranslationLink to={paths.courseSkill({ courseCode, skillId })} onClick={closeModal}>{{ passedSkill: <TranslatedSkillName skillId={skillId} /> }}</TranslationLink>, and with that all skills of <TranslationLink to={paths.course({ courseCode })} onClick={closeModal}>{{ course: <CourseTranslation course={course} /> }}</TranslationLink>! We recommend you to practice with a mixed assortment of exercises in the <TranslationLink to={paths.freePractice({ courseCode })} onClick={closeModal}>free practice mode</TranslationLink>.</Translation> :
				<Translation group={['modals', 'mastery']} id="nextSkill">You just mastered <TranslationLink to={paths.courseSkill({ courseCode, skillId })} onClick={closeModal}>{{ passedSkill: <TranslatedSkillName skillId={skillId} /> }}</TranslationLink>! You can carry on with the next skill: <TranslationLink to={paths.courseSkill({ courseCode, skillId: recommendation })} onClick={closeModal}>{{ nextSkill: <TranslatedSkillName skillId={recommendation} /> }}</TranslationLink>.</Translation>
			contents = (
				<Box sx={modalStyle}>
					<Box sx={theme => ({ ...titleStyle, color: theme.palette.success.main })}><Translation group={['modals', 'mastery']} id="title">Amazing!</Translation></Box>
					<Box sx={theme => ({ ...iconStyle, color: theme.palette.success.main })}><SuccessIcon /></Box>
					<Box sx={messageStyle}>{message}</Box>
					<Box sx={buttonsStyle}>
						<Button variant="contained" className="button" startIcon={<DownArrow />} onClick={closeModal} color="secondary"><Translation group={['buttons']} id="stay">Stay for a bit</Translation></Button>
						<Button variant="contained" className="button" endIcon={<RightArrow />} onClick={goToRecommendation} color="primary"><Translation group={['buttons']} id="continue">Continue onwards</Translation></Button>
					</Box>
				</Box>
			)
		}
		if (adviceType === 'goBack') {
			const skill = moduleTree[recommendation]
			contents = (
				<Box sx={modalStyle}>
					<Box sx={theme => ({ ...titleStyle, color: theme.palette.success.main })}><Translation group={['modals', 'deficiency']} id="title">Oh, wait ...</Translation></Box>
					<Box sx={theme => ({ ...iconStyle, color: theme.palette.success.main })}><InfoIcon /></Box>
					<Box sx={messageStyle}><Translation group={['modals', 'deficiency']} id="toDeficientSkill">It seems that you haven't yet sufficiently mastered the subskill <TranslationLink to={paths.courseSkill({ courseCode, skillId: recommendation })} onClick={closeModal}>{{ deficientSkill: <TranslatedSkillName skillId={skill.id} /> }}</TranslationLink>. We recommend to practice this separately first.</Translation></Box>
					<Box sx={messageStyle}><Translation group={['modals', 'deficiency']} id="reassurance">Don't worry: your exercise remains saved and you can always come back.</Translation></Box>
					<Box sx={buttonsStyle}>
						<Button variant="contained" className="button" startIcon={<div className="rotate"><RightArrow /></div>} onClick={goToRecommendation} color="primary"><Translation group={['buttons']} id="goBack">Go back a step</Translation></Button>
						<Button variant="contained" className="button" endIcon={<DownArrow />} onClick={closeModal} color="secondary"><Translation group={['buttons']} id="stay">Stay for a bit</Translation></Button>
					</Box>
				</Box>
			)
		}
	}
	const [, setShowModal] = useModal(<TranslationCatalog folder={['eduTools', 'pages']} name="skillPage">{contents}</TranslationCatalog>)

	// Use an effect to show a modal when the advice changes. But only do this when we previously already had good data and suddenly the advice type changes while staying at the same skill.
	const previousAdviceType = usePrevious(adviceType)
	const previousSkillId = usePrevious(skillId)
	const previousSkillLevelsLoaded = usePrevious(skillLevelsLoaded)
	useEffect(() => {
		if (previousSkillLevelsLoaded && previousSkillId === skillId && previousAdviceType === 'stay' && (adviceType === 'moveOnward' || adviceType === 'goBack'))
			setShowModal(true)
	}, [previousSkillLevelsLoaded, adviceType, previousAdviceType, skillId, previousSkillId, setShowModal])
}

// useSkillAdvice returns an advice type and recommendation that determine whether the user should stay, move onward or go back to a prerequisite. The recommendation is based on the current skillId: it is not always the course recommendation. For instance, if a prerequisite of the given skill is good to practice, it recommends that one.
export function useSkillAdvice() {
	const { courseDefinition, analysis } = useCourseData()
	const skillId = useSkillId()
	return getSkillPracticeAdvice(courseDefinition, analysis, skillId)
}

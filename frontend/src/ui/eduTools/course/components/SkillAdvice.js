import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import { CheckCircle as SuccessIcon, Info as InfoIcon, TrendingFlat as RightArrow, VerticalAlignBottom as DownArrow } from '@mui/icons-material'

import { freePracticeRecommendation } from '@step-wise/course-analysis'
import { skillTree } from '@step-wise/skill-tree'

import { TranslationFile, Translation, useTranslator } from 'i18n'
import { usePrevious } from 'util/index' // Unit test import issue: use 'util/index' because the test runner otherwise resolves Node's built-in util package.
import { linkStyle } from 'ui/theme'
import { usePaths } from 'ui/routingTools'
import { NotificationBar, useModalContext } from 'ui/components'

import { useSkillId } from '../../skills'
import { getSkillPracticeAdvice } from '../../courses'

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

	// If the course has not loaded, no recommendation is given.
	if (!course)
		return null

	// First check if the skill is part of the course.
	if (skillId && !overview.allSkillIds.includes(skillId)) {
		if (recommendation === undefined)
			return <NotificationBar type="warning"><Translation entry="notifications.notPartOfCourse.noRecommendation">The skill you are currently practising is not part of the course <Link to={paths.course({ courseCode })}>{{ course: translate(course.name, `${course.organization}.${course.code}.name`, 'eduContent/courseInfo') }}</Link>.</Translation></NotificationBar>
		if (recommendation === freePracticeRecommendation)
			return <NotificationBar type="warning"><Translation entry="notifications.notPartOfCourse.freePracticeRecommendation">The skill you are currently practising is not part of the course <Link to={paths.course({ courseCode })}>{{ course: translate(course.name, `${course.organization}.${course.code}.name`, 'eduContent/courseInfo') }}</Link>. If you want to practice for this course, it's best to use the <Link to={paths.freePractice({ courseCode })}>free practice mode</Link>.</Translation></NotificationBar>
		const recommendedSkill = skillTree[analysis.recommendation]
		return <NotificationBar type="warning"><Translation entry="notifications.notPartOfCourse.skillRecommendation">The skill you are currently practising is not part of the course <Link to={paths.course({ courseCode })}>{{ course: translate(course.name, `${course.organization}.${course.code}.name`, 'eduContent/courseInfo') }}</Link>. If you want to practice for this course, it's best to work on <Link to={paths.courseSkill({ courseCode, skillId: recommendedSkill.id })}>{{ skill: translate(recommendedSkill.name, `${recommendedSkill.groupPath.join('.')}.${recommendedSkill.id}`, 'eduContent/skillNames') }}</Link>.</Translation></NotificationBar>
	}

	// If there is no recommendation, some data is still loading/missing.
	if (!recommendation)
		return null

	// Based on the advice received, generate a notification.
	switch (adviceType) {
		case undefined: // This skill is not part of the course.
			return null

		case 0: // This skill is already mastered. Show a recommendation.
			if (recommendation === freePracticeRecommendation)
				return <NotificationBar type="info"><Translation entry="notifications.alreadyMastered.freePracticeRecommendation">You have already sufficiently mastered this skill! It is more effective for the course <Link to={paths.course({ courseCode })}>{{ course: translate(course.name, `${course.organization}.${course.code}.name`, 'eduContent/courseInfo') }}</Link> to use the <Link to={paths.freePractice({ courseCode })}>free practice mode</Link>.</Translation></NotificationBar>
			const skill = skillTree[recommendation]
			return <NotificationBar type="info"><Translation entry="notifications.alreadyMastered.skillRecommendation">You have already sufficiently mastered this skill! It is more effective for the course <Link to={paths.course({ courseCode })}>{{ course: translate(course.name, `${course.organization}.${course.code}.name`, 'eduContent/courseInfo') }}</Link> if you practice <Link to={paths.courseSkill({ courseCode, skillId: recommendation })}>{{ skill: translate(skill.name, `${skill.groupPath.join('.')}.${skill.id}`, 'eduContent/skillNames') }}</Link>.</Translation></NotificationBar>

		case 1: // This skill is reasonable to practice. Don't show a warning.
			return null

		case 2: // This skill is not mastered. Find a prior skill that requires practice. If there is none, this is a good skill to practice.
			const recommendedSkill = skillTree[recommendation]
			if (skillId === undefined)
				return <NotificationBar type="warning"><Translation entry="notifications.notMastered.onFreePracticeMode">You're not ready yet for free practice on the final level of the course. It is wiser to first practice <Link to={paths.courseSkill({ courseCode, skillId: recommendation })}>{{ skill: translate(recommendedSkill.name, `${recommendedSkill.groupPath.join('.')}.${recommendedSkill.id}`, 'eduContent/skillNames') }}</Link>.</Translation></NotificationBar>
			return <NotificationBar type="warning"><Translation entry="notifications.notMastered.onSkill">You have not yet mastered all the prerequisites for this skill. It is wiser to first practice <Link to={paths.courseSkill({ courseCode, skillId: recommendation })}>{{ skill: translate(recommendedSkill.name, `${recommendedSkill.groupPath.join('.')}.${recommendedSkill.id}`, 'eduContent/skillNames') }}</Link>.</Translation></NotificationBar>

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
	const translate = useTranslator()
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
		navigate(recommendation === freePracticeRecommendation ? paths.freePractice({ courseCode }) : paths.courseSkill({ courseCode, skillId: recommendation }))
	}

	// Determine the contents to show in the modal. (If there is no recommendation, don't do anything yet. We don't have all data yet.)
	let contents = <div />
	if (skillsDataLoaded) {
		if (adviceType === 0) {
			const message = recommendation === freePracticeRecommendation ?
				<Translation entry="modals.mastery.toFreePracticeMode">You just mastered <Link to={paths.courseSkill({ courseCode, skillId })} onClick={closeModal}>{{ passedSkill: translate(skillTree[skillId].name, `${skillTree[skillId].groupPath.join('.')}.${skillId}`, 'eduContent/skillNames') }}</Link>, and with that all skills of <Link to={paths.course({ courseCode })} onClick={closeModal}>{{ course: translate(course.name, `${course.organization}.${course.code}.name`, 'eduContent/courseInfo') }}</Link>! We recommend you to practice with a mixed assortment of exercises in the <Link to={paths.freePractice({ courseCode })} onClick={closeModal}>free practice mode</Link>.</Translation> :
				<Translation entry="modals.mastery.nextSkill">You just mastered <Link to={paths.courseSkill({ courseCode, skillId })} onClick={closeModal}>{{ passedSkill: translate(skillTree[skillId].name, `${skillTree[skillId].groupPath.join('.')}.${skillId}`, 'eduContent/skillNames') }}</Link>! You can carry on with the next skill: <Link to={paths.courseSkill({ courseCode, skillId: recommendation })} onClick={closeModal}>{{ nextSkill: translate(skillTree[recommendation].name, `${skillTree[recommendation].groupPath.join('.')}.${recommendation}`, 'eduContent/skillNames') }}</Link>.</Translation>
			contents = (
				<Box sx={modalStyle}>
					<Box sx={theme => ({ ...titleStyle, color: theme.palette.success.main })}><Translation entry="modals.mastery.title">Amazing!</Translation></Box>
					<Box sx={theme => ({ ...iconStyle, color: theme.palette.success.main })}><SuccessIcon /></Box>
					<Box sx={messageStyle}>{message}</Box>
					<Box sx={buttonsStyle}>
						<Button variant="contained" className="button" startIcon={<DownArrow />} onClick={closeModal} color="secondary"><Translation entry="buttons.stay">Stay for a bit</Translation></Button>
						<Button variant="contained" className="button" endIcon={<RightArrow />} onClick={goToRecommendation} color="primary"><Translation entry="buttons.continue">Continue onwards</Translation></Button>
					</Box>
				</Box>
			)
		}
		if (adviceType === 2) {
			const skill = skillTree[recommendation]
			contents = (
				<Box sx={modalStyle}>
					<Box sx={theme => ({ ...titleStyle, color: theme.palette.success.main })}><Translation entry="modals.deficiency.title">Oh, wait ...</Translation></Box>
					<Box sx={theme => ({ ...iconStyle, color: theme.palette.success.main })}><InfoIcon /></Box>
					<Box sx={messageStyle}><Translation entry="modals.deficiency.toDeficientSkill">It seems that you haven't yet sufficiently mastered the subskill <Link to={paths.courseSkill({ courseCode, skillId: recommendation })} onClick={closeModal}>{{ deficientSkill: translate(skill.name, `${skill.groupPath.join('.')}.${skill.id}`, 'eduContent/skillNames') }}</Link>. We recommend to practice this separately first.</Translation></Box>
					<Box sx={messageStyle}><Translation entry="modals.deficiency.reassurance">Don't worry: your exercise remains saved and you can always come back.</Translation></Box>
					<Box sx={buttonsStyle}>
						<Button variant="contained" className="button" startIcon={<div className="rotate"><RightArrow /></div>} onClick={goToRecommendation} color="primary"><Translation entry="buttons.goBack">Go back a step</Translation></Button>
						<Button variant="contained" className="button" endIcon={<DownArrow />} onClick={closeModal} color="secondary"><Translation entry="buttons.stay">Stay for a bit</Translation></Button>
					</Box>
				</Box>
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

// useSkillAdvice returns an object { type: 0/1/2, recommendation: 'someSkillId' } that is used to determine whether the user should be sent to another skill. The types match with getPracticeNeed: 0 means "all fine", 1 means "OK, but could be better" and 2 means "wrong". The recommendation is based on the current skillId: it's not always the course recommendation. For instance, if a prerequisite of the given skill is good to practice, it recommends that one.
export function useSkillAdvice() {
	const { overview, analysis } = useCourseData()
	const skillId = useSkillId()
	return getSkillPracticeAdvice(overview, analysis, skillId)
}

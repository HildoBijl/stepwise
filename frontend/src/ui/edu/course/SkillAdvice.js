import React, { useState, useEffect, useRef } from 'react'
import { Link, useHistory } from 'react-router-dom'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import { CheckCircle as SuccessIcon, Info as InfoIcon, TrendingFlat as RightArrow, VerticalAlignBottom as DownArrow } from '@material-ui/icons'

import skills from 'step-wise/edu/skills'

import { usePrevious } from 'util/react'
import { linkStyle, centered } from 'ui/theme'
import { usePaths } from 'ui/routing'
import NotificationBar from 'ui/components/notifications/NotificationBar'

import { useSkillId } from '../skills/Skill'

import { strFreePractice } from './util'
import { useCourseData } from './Provider'

export default function SkillAdvice() {
	return <>
		<SkillNotification />
		<SkillModal />
	</>
}

// SkillNotification shows the notification bar at the top of the screen recommending users to go to a different skill.
function SkillNotification() {
	const { type: adviceType, recommendation } = useSkillAdvice()
	const paths = usePaths()
	const { courseId, course, overview, analysis } = useCourseData()
	const skillId = useSkillId()

	// First check if the skill is part of the course.
	if (skillId && !overview.all.includes(skillId)) {
		if (analysis.recommendation === undefined)
			return <NotificationBar type="warning">De vaardigheid die je nu probeert te oefenen is niet onderdeel van de cursus <Link to={paths.course({ courseId })}>{course.name}</Link>.</NotificationBar>
		if (analysis.recommendation === strFreePractice)
			return <NotificationBar type="warning">De vaardigheid die je nu probeert te oefenen is geen onderdeel van de cursus <Link to={paths.course({ courseId })}>{course.name}</Link>. Als je wilt oefenen voor deze cursus, dan kun je het beste naar de <Link to={paths.freePractice({ courseId })}>vrij-oefenen-modus</Link> gaan.</NotificationBar>
		return <NotificationBar type="warning">De vaardigheid die je nu probeert te oefenen is niet onderdeel van de cursus <Link to={paths.course({ courseId })}>{course.name}</Link>. Als je wilt oefenen voor deze cursus, dan kun je beter bezig gaan met <Link to={paths.courseSkill({ courseId, skillId: analysis.recommendation })}>{skills[analysis.recommendation].name}</Link>.</NotificationBar>
	}

	// Based on the advice received, generate a notification.
	switch (adviceType) {
		case undefined: // This skill is not part of the course.
			return null

		case 0: // This skill is already mastered. Show a recommendation.
			if (recommendation === strFreePractice)
				return <NotificationBar type="info">Je beheerst deze vaardigheid al goed! Als je effectief wilt oefenen voor <Link to={paths.course({ courseId })}>{course.name}</Link>, dan kun je beter bezig gaan met de <Link to={paths.freePractice({ courseId })}>vrij-oefenen-modus</Link>.</NotificationBar>
			return <NotificationBar type="info">Je beheerst deze vaardigheid al goed! Als je effectief wilt oefenen voor <Link to={paths.course({ courseId })}>{course.name}</Link>, dan kun je beter bezig gaan met <Link to={paths.courseSkill({ courseId, skillId: recommendation })}>{skills[recommendation].name}</Link>.</NotificationBar>

		case 1: // This skill is reasonable to practice. Don't show a warning.
			return null

		case 2: // This skill is not mastered. Find a prior skill that requires practice. If there is none, this is a good skill to practice.
			return <NotificationBar type="warning">{skillId === undefined ? 'Je bent nog niet toe aan vrij oefenen op het eindniveau.' : 'Je zit nog niet op het niveau van deze vaardigheid.'} Het is handiger om eerst <Link to={paths.courseSkill({ courseId, skillId: recommendation })}>{skills[recommendation].name}</Link> te oefenen.</NotificationBar>

		default:
			throw new Error(`Impossible case.`)
	}
}

const useStyles = makeStyles((theme) => ({
	skillModal: {
		alignItems: 'stretch',
		background: theme.palette.background.main,
		borderRadius: '1rem',
		display: 'flex',
		flexFlow: 'column nowrap',
		outline: 0,
		padding: '1.5rem',
		width: 'min(80vw, 30rem)',
		...centered,

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

// SkillModal shows a pop-up modal whenever the skill advice changes. So when the user mastered the skill he's practicing ("mastery") or when he sinks a prerequisite too low ("repeat").
function SkillModal() {
	const classes = useStyles()
	const { type: adviceType, recommendation } = useSkillAdvice()
	const paths = usePaths()
	const history = useHistory()
	const { courseId, course } = useCourseData()
	const skillId = useSkillId()

	// Use an effect to show a modal when the advice changes.
	const [showModal, setShowModal] = useState(false)
	const previousAdviceType = usePrevious(adviceType)
	const previousSkillId = usePrevious(skillId)
	useEffect(() => {
		if (previousSkillId === skillId && previousAdviceType === 1 && (adviceType === 0 || adviceType === 2))
			setShowModal(true)
	}, [adviceType, previousAdviceType, skillId, previousSkillId, setShowModal])

	// Set up handlers.
	const closeModal = () => setShowModal(false)
	const goToRecommendation = () => {
		closeModal()
		history.push(recommendation === strFreePractice ? paths.freePractice({ courseId }) : paths.courseSkill({ courseId, skillId: recommendation }))
	}

	// Add tab control.
	const stayButtonRef = useRef(), followAdviceButtonRef = useRef()
	// useFieldRegistration({ id: 'stayButton', ref: stayButtonRef, apply: showModal, focusRefOnActive: true })
	// useFieldRegistration({ id: 'followAdviceButton', ref: followAdviceButtonRef, apply: showModal, focusRefOnActive: true })
	// ToDo later: fix tab control. Tab control now does not work because the modal element doesn't fall within the field controller, and because the buttons appear later than that the tab order is checked. If this needs to be implemented, then the existing field controller should be deactivated and a new one should be set up inside the modal.

	// Determine the contents to show in the modal.
	let contents = <div />
	if (adviceType === 0) {
		const message = recommendation === strFreePractice ?
			<>Je beheerst nu <Link to={paths.courseSkill({ courseId, skillId })} onClick={closeModal}>{skills[skillId].name}</Link>, en daarmee alle vaardigheden van <Link to={paths.course({ courseId })} onClick={closeModal}>{course.name}</Link>! Je kunt nog verder oefenen in de <Link to={paths.freePractice({ courseId })} onClick={closeModal}>vrij-oefenen-modus</Link>.</> :
			<>Je beheerst nu <Link to={paths.courseSkill({ courseId, skillId })} onClick={closeModal}>{skills[skillId].name}</Link>! Tijd om verder te gaan met het volgende onderwerp: <Link to={paths.courseSkill({ courseId, skillId: recommendation })} onClick={closeModal}>{skills[recommendation].name}</Link>.</>
		contents = (
			<div className={clsx(classes.skillModal, 'masteryModal')}>
				<div className="title">Geweldig!</div>
				<div className="icon"><SuccessIcon /></div>
				<div className="message">{message}</div>
				<div className="buttons">
					<Button variant="contained" className="button" startIcon={<DownArrow />} onClick={closeModal} color="secondary" ref={stayButtonRef}>Blijf nog even</Button>
					<Button variant="contained" className="button" endIcon={<RightArrow />} onClick={goToRecommendation} color="primary" ref={followAdviceButtonRef}>Ga verder</Button>
				</div>
			</div>
		)
	}
	if (adviceType === 2) {
		contents = (
			<div className={clsx(classes.skillModal, 'repeatModal')}>
				<div className="title">Wacht even ...</div>
				<div className="icon"><InfoIcon /></div>
				<div className="message">Het lijkt erop dat je de sub-vaardigheid <Link to={paths.courseSkill({ courseId, skillId: recommendation })} onClick={closeModal}>{skills[recommendation].name}</Link> nog niet voldoende beheerst. Het is handig om hier eerst los wat mee te oefenen.</div>
				<div className="message">Maak je geen zorgen: je opgave blijft bewaard en je kunt altijd nog terugkomen.</div>
				<div className="buttons">
					<Button variant="contained" className="button" startIcon={<div className="rotate"><RightArrow /></div>} onClick={goToRecommendation} color="primary" ref={followAdviceButtonRef}>Ga een stapje terug</Button>
					<Button variant="contained" className="button" endIcon={<DownArrow />} onClick={closeModal} color="secondary" ref={stayButtonRef}>Blijf nog even</Button>
				</div>
			</div>
		)
	}

	return (
		<Modal open={showModal} onClose={() => setShowModal(false)}>
			{contents}
		</Modal>
	)
}

// useSkillAdvice returns an object { type: 0/1/2, recommendation: 'someSkillId' } that is used to determine whether the user should be sent to another skill. The types match with isPracticeNeeded: 0 means "all fine", 1 means "OK, but could be better" and 2 means "wrong". The recommendation is based on the current skillId: it's not always the course recommendation. For instance, if a prerequisite of the given skill is good to practice, it recommends that one.
export function useSkillAdvice() {
	const { overview, analysis } = useCourseData()
	const skillId = useSkillId()

	// If there is no skillId, then we are in free practice mode.
	if (!skillId) {
		// If there is a skill with practiceNeeded === 2 then this should be practiced first.
		const recommendation = overview.all.find(skillId => analysis.practiceNeeded[skillId] === 2)
		if (recommendation)
			return { type: 2, recommendation } // A skill with significant work needed was found.
		return { type: 1, recommendation: strFreePractice } // All good: recommend free practice. Give advice 1 since free practice can always need some work.
	}

	// There is a skillId. Check if it's OK to work on it.
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
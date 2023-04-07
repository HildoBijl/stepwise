import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { CheckCircle as SuccessIcon, Info as InfoIcon, TrendingFlat as RightArrow, VerticalAlignBottom as DownArrow } from '@material-ui/icons'

import { skillTree } from 'step-wise/edu/skills'

import { usePrevious } from 'util/react'
import { linkStyle } from 'ui/theme'
import { usePaths } from 'ui/routing'
import NotificationBar from 'ui/components/notifications/NotificationBar'
import { useModalContext } from 'ui/components/Modal'

import { useSkillId } from '../skills/Components/Skill'

import { strFreePractice } from './util'
import { useCourseData } from './Provider'

export default function SkillAdvice() {
	useSkillModal()
	return <SkillNotification />
}

// SkillNotification shows the notification bar at the top of the screen recommending users to go to a different skill.
function SkillNotification() {
	const { type: adviceType, recommendation } = useSkillAdvice()
	const paths = usePaths()
	const { courseId, course, overview, analysis } = useCourseData()
	const skillId = useSkillId()

	// First check if the skill is part of the course.
	if (skillId && !overview.all.includes(skillId)) {
		if (recommendation === undefined)
			return <NotificationBar type="warning">De vaardigheid die je nu probeert te oefenen is niet onderdeel van de cursus <Link to={paths.course({ courseId })}>{course.name}</Link>.</NotificationBar>
		if (recommendation === strFreePractice)
			return <NotificationBar type="warning">De vaardigheid die je nu probeert te oefenen is geen onderdeel van de cursus <Link to={paths.course({ courseId })}>{course.name}</Link>. Als je wilt oefenen voor deze cursus, dan kun je het beste naar de <Link to={paths.freePractice({ courseId })}>vrij-oefenen-modus</Link> gaan.</NotificationBar>
		return <NotificationBar type="warning">De vaardigheid die je nu probeert te oefenen is niet onderdeel van de cursus <Link to={paths.course({ courseId })}>{course.name}</Link>. Als je wilt oefenen voor deze cursus, dan kun je beter bezig gaan met <Link to={paths.courseSkill({ courseId, skillId: recommendation })}>{skillTree[analysis.recommendation].name}</Link>.</NotificationBar>
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
				return <NotificationBar type="info">Je beheerst deze vaardigheid al goed! Het is effectiever voor de cursus <Link to={paths.course({ courseId })}>{course.name}</Link> om met de <Link to={paths.freePractice({ courseId })}>vrij-oefenen-modus</Link> bezig te gaan.</NotificationBar>
			return <NotificationBar type="info">Je beheerst deze vaardigheid al goed! Het is effectiever voor de cursus <Link to={paths.course({ courseId })}>{course.name}</Link> als je <Link to={paths.courseSkill({ courseId, skillId: recommendation })}>{skillTree[recommendation].name}</Link> oefent.</NotificationBar>

		case 1: // This skill is reasonable to practice. Don't show a warning.
			return null

		case 2: // This skill is not mastered. Find a prior skill that requires practice. If there is none, this is a good skill to practice.
			return <NotificationBar type="warning">{skillId === undefined ? 'Je bent nog niet toe aan vrij oefenen op het eindniveau.' : 'Je hebt nog niet alle voorkennis voor deze vaardigheid.'} Het is handiger om eerst <Link to={paths.courseSkill({ courseId, skillId: recommendation })}>{skillTree[recommendation].name}</Link> te oefenen.</NotificationBar>

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
	const classes = useStyles()
	const paths = usePaths()
	const navigate = useNavigate()
	const { courseId, course, skillsDataLoaded } = useCourseData()
	const skillId = useSkillId()
	const { useModal, closeModal } = useModalContext()
	const { type: adviceType, recommendation } = useSkillAdvice()

	// Set up handlers.
	const goToRecommendation = () => {
		closeModal()
		navigate(recommendation === strFreePractice ? paths.freePractice({ courseId }) : paths.courseSkill({ courseId, skillId: recommendation }))
	}

	// Determine the contents to show in the modal. (If there is no recommendation, don't do anything yet. We don't have all data yet.)
	let contents = <div />
	if (skillsDataLoaded) {
		if (adviceType === 0) {
			const message = recommendation === strFreePractice ?
				<>Je beheerst nu <Link to={paths.courseSkill({ courseId, skillId })} onClick={closeModal}>{skillTree[skillId].name}</Link>, en daarmee alle vaardigheden van <Link to={paths.course({ courseId })} onClick={closeModal}>{course.name}</Link>! Je kunt nog verder oefenen in de <Link to={paths.freePractice({ courseId })} onClick={closeModal}>vrij-oefenen-modus</Link>.</> :
				<>Je beheerst nu <Link to={paths.courseSkill({ courseId, skillId })} onClick={closeModal}>{skillTree[skillId].name}</Link>! Tijd om verder te gaan met het volgende onderwerp: <Link to={paths.courseSkill({ courseId, skillId: recommendation })} onClick={closeModal}>{skillTree[recommendation].name}</Link>.</>
			contents = (
				<div className={clsx(classes.skillModal, 'masteryModal')}>
					<div className="title">Geweldig!</div>
					<div className="icon"><SuccessIcon /></div>
					<div className="message">{message}</div>
					<div className="buttons">
						<Button variant="contained" className="button" startIcon={<DownArrow />} onClick={closeModal} color="secondary">Blijf nog even</Button>
						<Button variant="contained" className="button" endIcon={<RightArrow />} onClick={goToRecommendation} color="primary">Ga verder</Button>
					</div>
				</div>
			)
		}
		if (adviceType === 2) {
			contents = (
				<div className={clsx(classes.skillModal, 'repeatModal')}>
					<div className="title">Wacht even ...</div>
					<div className="icon"><InfoIcon /></div>
					<div className="message">Het lijkt erop dat je de sub-vaardigheid <Link to={paths.courseSkill({ courseId, skillId: recommendation })} onClick={closeModal}>{skillTree[recommendation].name}</Link> nog niet voldoende beheerst. Het is handig om hier eerst los wat mee te oefenen.</div>
					<div className="message">Maak je geen zorgen: je opgave blijft bewaard en je kunt altijd nog terugkomen.</div>
					<div className="buttons">
						<Button variant="contained" className="button" startIcon={<div className="rotate"><RightArrow /></div>} onClick={goToRecommendation} color="primary">Ga een stapje terug</Button>
						<Button variant="contained" className="button" endIcon={<DownArrow />} onClick={closeModal} color="secondary">Blijf nog even</Button>
					</div>
				</div>
			)
		}
	}
	const [, setShowModal] = useModal(contents)

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
		const recommendation = overview.all.find(skillId => analysis.practiceNeeded[skillId] === 2)
		if (recommendation)
			return { type: 2, recommendation } // A skill with significant work needed was found.
		return { type: 1, recommendation: strFreePractice } // All good: recommend free practice. Give advice 1 since free practice can always need some work.
	}

	// There is a skillId. Check if it's OK to work on it.
	switch (analysis.practiceNeeded[skillId]) {
		case undefined: // This skill is not part of the course.
			return {}

		case 0: // This skill is already mastered. Show a recommendation, ideally based on the current skill, but otherwise the general course recommendation.
			return { type: 0, recommendation: findNextSkillToPractice(skillId, analysis.practiceNeeded) || analysis.recommendation }

		case 1: // This skill is reasonable to practice. Don't show a warning.
			return { type: 1 }

		case 2: // This skill is not mastered. Find a prior skill that requires practice. If there is none, this is a good skill to practice.
			const recommendation = findPriorSkillToPractice(skillId, analysis.practiceNeeded)
			if (recommendation === skillId)
				return { type: 1 }
			return { type: 2, recommendation }

		default: // Impossible to reach.
			throw new Error(`Invalid practice needed index: a practice needed index was given that was not among the available options.`)
	}
}

// findPriorSkillToPractice takes a skillId and a practiceNeeded object, and determines which prior skill should be practiced before the current skill. For this, it walks through the prerequisites and checks if any of them require work. This is done recursively. With "require work" we mean that practiceNeeded equals 2. If the includeDoubtfulCases parameter is set to true, also practiceNeeded equaling 1 is included.
function findPriorSkillToPractice(skillId, practiceNeeded, includeDoubtfulCases = false) {
	// Find the first prior skill that requires work.
	const recommendation = skillTree[skillId].prerequisites.find(prerequisiteId => practiceNeeded[prerequisiteId] === 2 || (includeDoubtfulCases && practiceNeeded[prerequisiteId] === 1))

	// If no prior skill requires work, return that we best practice the current skill.
	if (!recommendation)
		return skillId

	// If there is one that requires practice, recursively search further from it.
	return findPriorSkillToPractice(recommendation, practiceNeeded, includeDoubtfulCases)
}

// findNextSkillToPractice takes a skillId and a practiceNeeded object and determines which next skill should be practice upon completion of the current skill. For this, it studies the continuation skills and sees if any require work. (Or even continuations of those continuations, if the continuations are done already.) It then also checks their children, to see if any of those still require works. The most suitable option (that is, the first in the general skills list) is returned. If nothing suitable is found, undefined is returned.
function findNextSkillToPractice(skillId, practiceNeeded) {
	// Find the first continuation within the course that still requires practice. If there is none, do a depth-first search on the continuations of the continuations, to see if anything suitable pops up.
	const continuations = skillTree[skillId].continuations.filter(continuationId => practiceNeeded[continuationId] !== undefined)
	let recommendation = continuations.find(continuationId => (practiceNeeded[continuationId] === 1 || practiceNeeded[continuationId] === 2))
	if (!recommendation)
		return continuations.find(continuationId => findNextSkillToPractice(continuationId, practiceNeeded))

	// For the given recommendation, check child skills. If any of them require work, recommend that one instead.
	return findPriorSkillToPractice(recommendation, practiceNeeded, true)
}
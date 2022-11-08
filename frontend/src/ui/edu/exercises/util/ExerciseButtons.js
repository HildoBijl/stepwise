import React, { useRef, useMemo } from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { Check, Clear, Send, ArrowForward } from '@material-ui/icons'

import { getStep } from 'step-wise/edu/exercises/util/stepExercise'

import { getWordList } from 'util/language'
import { useUserId } from 'api/user'
import { useActiveGroup } from 'api/group'
import { useFieldRegistration } from 'ui/form/FieldController'
import { useModal, PictureConfirmation } from 'ui/components/Modal'
import { Warning } from '@material-ui/icons'

import { useExerciseData } from '../ExerciseContainer'
import { useSubmitAction, useGiveUpAction, useCancelAction, useResolveEvent, canResolveGroupEvent } from './actions'

const useStyles = makeStyles((theme) => ({
	buttonContainer: {
		display: 'flex',
		flexFlow: 'row wrap',
		justifyContent: 'flex-end',
		margin: '0.2rem 0',

		'& .description': {
			flexGrow: 1,
			flexShrink: 1,
		},
		'& button': {
			flexGrow: 0,
			flexShrink: 0,
			margin: '0.4rem 0 0.4rem 0.8rem',

			[theme.breakpoints.down('xs')]: {
				marginLeft: '0.4rem',
				width: '100%',
			},
		},
	},
}))

export default function ExerciseButtons(props) {
	const { groupExercise } = useExerciseData()
	if (groupExercise)
		return <GroupExerciseButtons {...props} />
	return <SingleUserExerciseButtons {...props} />
}

function SingleUserExerciseButtons({ stepwise = false }) {
	const { progress, history, submitting, startNewExercise } = useExerciseData()
	const theme = useTheme()
	const classes = useStyles()

	// Set up button handlers.
	const submit = useSubmitAction()
	const giveUp = useGiveUpAction()

	// Include the buttons in the tabbing.
	const submitButtonRef = useRef(), giveUpButtonRef = useRef(), startNewExerciseButtonRef = useRef()
	useFieldRegistration({ id: 'submitButton', element: submitButtonRef, apply: !progress.done, focusRefOnActive: true })
	useFieldRegistration({ id: 'giveUpButton', element: giveUpButtonRef, apply: !progress.done, focusRefOnActive: true })
	useFieldRegistration({ id: 'startNewExerciseButton', element: startNewExerciseButtonRef, apply: !!progress.done, focusRefOnActive: true })

	// Set up a warning Modal for when the user gives up a step exercise without even trying.
	const [, setModalOpen] = useModal(<PictureConfirmation
		title={<span style={{ color: theme.palette.warning.main }}>Weet je het zeker?</span>}
		picture={<Warning style={{ color: theme.palette.warning.main, height: '8rem', width: '8rem' }} />}
		message='Het doel van Step-Wise is dat je uiteindelijk opgaven op kunt lossen zonder de hulp van tussenstappen. Geef je het op zonder te proberen? Dan geldt dit als een foute inzending: je score gaat omlaag.'
		rejectText='Wacht even ...'
		confirmText='Laat me tussenstappen zien'
		onConfirm={giveUp}
	/>)

	// Is the exercise done? Then return the restart button.
	if (progress.done) {
		return (
			<div className={classes.buttonContainer}>
				<Button variant="contained" endIcon={<ArrowForward />} onClick={startNewExercise} color="primary" ref={startNewExerciseButtonRef}>Volgende opgave</Button>
			</div>
		)
	}

	// If the exercise is not done, we need the submit and give-up buttons. First set up the text.
	let giveUpText = 'Ik geef het op'
	const step = getStep(progress)
	if (stepwise)
		giveUpText = step ? 'Ik geef deze stap op' : 'Los stapsgewijs op'

	// On giving up, check if a warning needs to be shown.
	const checkGiveUp = () => {
		// Should we warn the user that his rating will go down upon a step-wise solution?
		const showWarning = stepwise && step === 0 && history.length === 0
		if (showWarning) {
			setModalOpen(true)
		} else {
			giveUp()
		}
	}

	return (
		<div className={classes.buttonContainer}>
			<Button variant="contained" startIcon={<Clear />} onClick={checkGiveUp} disabled={submitting} color="secondary" ref={giveUpButtonRef}>{giveUpText}</Button>
			<Button variant="contained" startIcon={<Check />} onClick={submit} disabled={submitting} color="primary" ref={submitButtonRef}>Controleer</Button>
		</div>
	)
}

function GroupExerciseButtons({ stepwise = false }) {
	const { progress, history } = useExerciseData()
	const activeGroup = useActiveGroup()
	const userId = useUserId()

	// Determine the status of the exercise.
	const derivedParameters = useMemo(() => {
		const currentEvent = history.find(event => event.progress === null)
		const currentSubmissions = currentEvent?.submissions || []
		const submittedAction = currentSubmissions.find(submission => submission.userId === userId)?.action
		const hasSubmitted = !!submittedAction
		const numSubmissions = currentSubmissions.length
		const unsubmittedMembers = activeGroup.members.filter(member => currentSubmissions.some(submission => submission.userId === member.userId))
		const canResolve = canResolveGroupEvent(activeGroup, history)
		return { currentEvent, currentSubmissions, submittedAction, hasSubmitted, numSubmissions, unsubmittedMembers, canResolve }
	}, [activeGroup, history, userId])

	// Set up button handlers.
	const cancel = useCancelAction()

	// Is the exercise done? Then return the restart button.
	if (progress.done)
		return <StartNewExerciseButton />

	// Render the variety of buttons required.
	return <>
		<div>Er zijn nu {derivedParameters.numSubmissions} inzending(en). {derivedParameters.hasSubmitted ? <span onClick={cancel}>Je hebt iets ingestuurd.</span> : <>Je hebt nog niets ingestuurd.</>}</div>

		{/* ToDo */}

		<GiveUpAndSubmitButtons stepwise={stepwise} {...derivedParameters} />
		<ResolveNote {...derivedParameters} />
	</>
}

function StartNewExerciseButton() {
	const classes = useStyles()
	const { startNewExercise } = useExerciseData()

	// Register the button to tab control.
	const startNewExerciseButtonRef = useRef()
	useFieldRegistration({ id: 'startNewExerciseButton', element: startNewExerciseButtonRef, focusRefOnActive: true })

	// Render the button.
	return <>
		<div className={classes.buttonContainer}>
			<Button variant="contained" endIcon={<ArrowForward />} onClick={startNewExercise} color="primary" ref={startNewExerciseButtonRef}>Volgende opgave</Button>
		</div>
	</>
}

function GiveUpAndSubmitButtons({ stepwise, submittedAction }) {
	const classes = useStyles()
	const { progress, submitting } = useExerciseData()
	const submit = useSubmitAction()
	const giveUp = useGiveUpAction()

	// Determine whether the user has given up.
	const hasGivenUp = submittedAction && submittedAction.type === 'giveUp'

	// Register the buttons to tab control.
	const submitButtonRef = useRef(), giveUpButtonRef = useRef()
	useFieldRegistration({ id: 'giveUpButton', element: giveUpButtonRef, apply: !hasGivenUp, focusRefOnActive: true })
	useFieldRegistration({ id: 'submitButton', element: submitButtonRef, focusRefOnActive: true })

	// Determine the give-up button text.
	let giveUpText = 'Ik geef het op'
	const step = getStep(progress)
	if (stepwise)
		giveUpText = step ? 'Ik geef deze stap op' : 'Los stapsgewijs op'

	// Render the buttons.
	return <div className={classes.buttonContainer}>
		{hasGivenUp ? null : <Button variant="contained" startIcon={<Clear />} onClick={giveUp} disabled={submitting} color="secondary" ref={giveUpButtonRef}>{giveUpText}</Button>}
		<Button variant="contained" endIcon={<Send />} onClick={submit} disabled={submitting} color="primary" ref={submitButtonRef}>Insturen</Button>
	</div>
}

function ResolveNote({ hasSubmitted, canResolve, submitting, unsubmittedMembers }) {
	const classes = useStyles()
	const resolve = useResolveEvent()

	// Register the resolve button to tab control.
	const resolveButtonRef = useRef()
	useFieldRegistration({ id: 'resolveButton', element: resolveButtonRef, apply: canResolve, focusRefOnActive: true })

	// If the user has not submitted anything, do not show anything.
	if (!hasSubmitted)
		return null

	// If the exercise can be resolved, show this.
	if (canResolve) {
		return <div className={classes.buttonContainer}>
			<div className="description">Iedereen heeft een inzending voor de opgave gedaan.</div>
			<Button variant="contained" startIcon={<Check />} onClick={resolve} disabled={submitting} color="primary" ref={resolveButtonRef}>Controleer</Button>
		</div>
	}

	// If the exercise cannot be resolved, show remaining members.
	return <div className={classes.buttonContainer}>
		<div className="description">De opgave kan nog niet nagekeken worden: {unsubmittedMembers.length === 1 ? 'er ontbreekt nog een inzending van' : 'er ontbreken nog inzendingen van'} {getWordList(unsubmittedMembers.map(member => member.name))}.</div>
	</div>
}
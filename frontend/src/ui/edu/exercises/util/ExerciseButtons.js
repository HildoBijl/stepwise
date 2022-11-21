import React, { useRef, useMemo, useCallback } from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { Check, Clear, Send, ArrowForward, Search } from '@material-ui/icons'

import { lastOf } from 'step-wise/util/arrays'
import { getLastAction, getLastInput } from 'step-wise/edu/exercises/util/simpleExercise'
import { getStep } from 'step-wise/edu/exercises/util/stepExercise'

import { getWordList } from 'util/language'
import { useRefWithValue } from 'util/react'
import { useUserId } from 'api/user'
import { useActiveGroup } from 'api/group'
import { useModal, PictureConfirmation } from 'ui/components/Modal'
import { useFormData } from 'ui/form/Form'
import { useFieldRegistration } from 'ui/form/FieldController'
import { useFeedback } from 'ui/form/FeedbackProvider'
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
	const { isInputEqual } = useFormData()

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

	// Determine if the input is the same as previously.
	const lastAction = getLastAction(history)
	const inputIsEqualToLastInput = lastAction && lastAction.type === 'input' && isInputEqual(lastAction.input)

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
			<Button variant="contained" startIcon={<Check />} onClick={submit} disabled={submitting || inputIsEqualToLastInput} color="primary" ref={submitButtonRef}>Controleer</Button>
		</div>
	)
}

function GroupExerciseButtons({ stepwise = false }) {
	const { progress } = useExerciseData()

	// Determine the status of the exercise.
	const derivedParameters = useDerivedParameters()

	// Is the exercise done? Then return the restart button.
	if (progress.done)
		return <StartNewExerciseButton />

	// Render the variety of buttons required.
	return <>
		<GiveUpAndSubmitButtons stepwise={stepwise} {...derivedParameters} />
		<CurrentSubmissions {...derivedParameters} />
		<ResolveNote stepwise={stepwise} {...derivedParameters} />
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
	const { progress, submitting, history } = useExerciseData()
	const userId = useUserId()
	const { isInputEqual } = useFormData()

	// Set up button handlers.
	const submit = useSubmitAction()
	const giveUp = useGiveUpAction()

	// Determine whether the user has given up.
	const hasGivenUp = submittedAction && submittedAction.type === 'giveUp'

	// Register the buttons to tab control.
	const submitButtonRef = useRef(), giveUpButtonRef = useRef()
	useFieldRegistration({ id: 'giveUpButton', element: giveUpButtonRef, apply: !hasGivenUp, focusRefOnActive: true })
	useFieldRegistration({ id: 'submitButton', element: submitButtonRef, focusRefOnActive: true })

	// Determine if the input is the same as previously.
	const lastAction = getLastAction(history, userId)
	const inputIsEqualToLastInput = lastAction && lastAction.type === 'input' && isInputEqual(lastAction.input)

	// Determine the give-up button text.
	let giveUpText = 'Ik geef het op'
	const step = getStep(progress)
	if (stepwise)
		giveUpText = step ? 'Ik geef deze stap op' : 'Los stapsgewijs op'

	// Render the buttons.
	return <div className={classes.buttonContainer}>
		{hasGivenUp ? null : <Button variant="contained" startIcon={<Clear />} onClick={giveUp} disabled={submitting} color="secondary" ref={giveUpButtonRef}>{giveUpText}</Button>}
		<Button variant="contained" endIcon={<Send />} onClick={submit} disabled={submitting || inputIsEqualToLastInput} color="primary" ref={submitButtonRef}>Insturen</Button>
	</div>
}

function CurrentSubmissions(derivedProperties) {
	const { groupedSubmissions } = derivedProperties
	return groupedSubmissions.input.map((submissionList, index) => <CurrentSubmissionRow key={index} {...{ ...derivedProperties, index, submissionList }} />)
}

function CurrentSubmissionRow({ submissionList, submitting, index }) {
	const { history } = useExerciseData()
	const classes = useStyles()
	const userId = useUserId()
	const activeGroup = useActiveGroup()
	const { setInputSI, isInputEqual } = useFormData()
	const { updateFeedback } = useFeedback()

	// Set up button handlers.
	const cancel = useCancelAction()
	const submit = useSubmitAction()

	// Register the buttons to tab control.
	const viewButtonRef = useRef(), copyCancelButtonRef = useRef()
	useFieldRegistration({ id: `viewButton${index}`, element: viewButtonRef, focusRefOnActive: true })
	useFieldRegistration({ id: `copyCancelButton${index}`, element: copyCancelButtonRef, focusRefOnActive: true })

	// Determine the members and their names for display purposes.
	const submissionMembers = submissionList.map(submission => activeGroup.members.find(member => member.userId === submission.userId))
	const isSelfPresent = submissionMembers.some(member => member.userId === userId)
	const nameList = getWordList(submissionMembers.map(member => member.name))

	// Set up handlers to put the input into the form and possibly submit it.
	const historyRef = useRefWithValue(history), submissionListRef = useRefWithValue(submissionList)
	const setFormInput = useCallback(() => {
		// Find the previous input action of the user and show the feedback on this.
		updateFeedback(getLastInput(historyRef.current, lastOf(submissionListRef.current).userId, true) || {}) // Show feedback on the last resolved input.
		console.log('TEsting 1234 ToDo')
		setInputSI(lastOf(submissionListRef.current).action.input) // Show the input of the last action.
	}, [historyRef, submissionListRef, updateFeedback, setInputSI])
	const setAndSubmitFormInput = useCallback(() => {
		setFormInput()
		submit()
	}, [setFormInput, submit])

	// Show the buttons. Which exact button depends on whether the user itself is in the list.
	const submittedInput = lastOf(submissionList).action.input
	const isEqual = isInputEqual(submittedInput)
	return <div className={classes.buttonContainer}>
		<div className="description">{nameList} {submissionMembers.length > 1 ? 'hebben' : 'heeft'} een inzending gemaakt.</div>
		<Button variant="contained" startIcon={<Search />} disabled={isEqual} onClick={setFormInput} color="primary" ref={viewButtonRef}>Bekijken</Button>
		{isSelfPresent ?
			<Button variant="contained" startIcon={<Clear />} onClick={cancel} disabled={submitting} color="secondary" ref={copyCancelButtonRef}>Inzending annuleren</Button> :
			<Button variant="contained" endIcon={<Send />} onClick={setAndSubmitFormInput} disabled={submitting} color="primary" ref={copyCancelButtonRef}>Ook insturen</Button>
		}
	</div>
}

function ResolveNote({ stepwise, hasSubmitted, gaveUp, canResolve, allGaveUp, submitting, unsubmittedMembers, groupedSubmissions }) {
	const classes = useStyles()
	const { progress } = useExerciseData()
	const activeGroup = useActiveGroup()

	// Set up button handlers.
	const cancel = useCancelAction()
	const resolve = useResolveEvent()

	// Register the resolve button to tab control.
	const cancelButtonRef = useRef(), resolveButtonRef = useRef()
	useFieldRegistration({ id: 'cancelButton', element: cancelButtonRef, apply: gaveUp, focusRefOnActive: true })
	useFieldRegistration({ id: 'resolveButton', element: resolveButtonRef, apply: canResolve, focusRefOnActive: true })

	// If the user has not submitted anything, do not show anything.
	if (!hasSubmitted)
		return null

	// The button to cancel a give-up is the same for all cases.
	const cancelGiveUpButton = gaveUp ? <Button variant="contained" startIcon={<Clear />} onClick={cancel} disabled={submitting} color="secondary" ref={cancelButtonRef}>{!stepwise || progress.step ? 'Opgeven annuleren' : 'Stapsgewijs oplossen annuleren'}</Button> : null

	// If everyone gave up, show an alternate note.
	if (allGaveUp) {
		return <div className={classes.buttonContainer}>
			<div className="description">{!stepwise || progress.step ? 'Iedereen heeft het opgegeven.' : 'Iedereen stemt voor stapsgewijs oplossen.'}</div>
			{cancelGiveUpButton}
			<Button variant="contained" startIcon={<Clear />} onClick={resolve} disabled={submitting} color="primary" ref={resolveButtonRef}>{!stepwise || progress.step ? 'Opgeven bevestigen' : 'Stapsgewijs oplossen bevestigen'}</Button>
		</div>
	}

	// Determine the text for those who gave up.
	const giveUpMembers = groupedSubmissions.giveUp.map(submission => activeGroup.members.find(member => member.userId === submission.userId))
	const giveUpNameList = getWordList(giveUpMembers.map(member => member.name))
	const giveUpText = !stepwise || progress.step ?
		`${giveUpNameList} ${giveUpMembers.length > 1 ? 'hebben' : 'heeft'} het opgegeven.` :
		`${giveUpNameList} ${giveUpMembers.length > 1 ? 'stemmen' : 'stemt'} voor stapsgewijs oplossen.`

	// If the exercise can be resolved, show this.
	if (canResolve) {
		return <div className={classes.buttonContainer}>
			<div className="description">{giveUpMembers.length === 0 ? 'Iedereen heeft een inzending voor de opgave gedaan.' : `${giveUpText} Alle inzendingen zijn binnen.`}</div>
			{cancelGiveUpButton}
			<Button variant="contained" startIcon={<Check />} onClick={resolve} disabled={submitting} color="primary" ref={resolveButtonRef}>Controleer</Button>
		</div>
	}

	// If the exercise cannot be resolved, show remaining members.
	return <div className={classes.buttonContainer}>
		<div className="description">{giveUpMembers.length > 0 ? `${giveUpText} ` : ``}{unsubmittedMembers.length === 1 ? 'Er ontbreekt nog een inzending van' : 'Er ontbreken nog inzendingen van'} {getWordList(unsubmittedMembers.map(member => member.name))}.</div>
		{cancelGiveUpButton}
	</div>
}

// useDerivedParameters takes the exercise data and extracts a variety of parameters that can be used to display the right buttons.
function useDerivedParameters() {
	const { history } = useExerciseData()
	const activeGroup = useActiveGroup()
	const userId = useUserId()
	const { isInputEqual } = useFormData()

	// Determine the status of the exercise.	
	return useMemo(() => {
		const currentEvent = history.find(event => event.progress === null)
		const currentSubmissions = currentEvent?.submissions || []
		const gaveUp = currentSubmissions.some(submission => submission.userId === userId && submission.action.type === 'giveUp')
		const submittedAction = currentSubmissions.find(submission => submission.userId === userId)?.action
		const hasSubmitted = !!submittedAction
		const numSubmissions = currentSubmissions.length
		const unsubmittedMembers = activeGroup.members.filter(member => member.active && !currentSubmissions.some(submission => submission.userId === member.userId))
		const canResolve = canResolveGroupEvent(activeGroup, history)
		const allGaveUp = canResolve && currentEvent.submissions.every(submission => submission.action.type === 'giveUp')
		const groupedSubmissions = groupSubmissions(currentSubmissions, userId, isInputEqual)
		return { currentEvent, currentSubmissions, gaveUp, submittedAction, hasSubmitted, numSubmissions, unsubmittedMembers, canResolve, allGaveUp, groupedSubmissions }
	}, [activeGroup, history, userId, isInputEqual])
}

// groupSubmissions takes a set of submissions and groups them based on their type. The result is an object of the form { input: [[ ...identical actions...], ]}
function groupSubmissions(submissions, userId, isInputEqual) {
	// Filter the submissions by their type.
	const inputSubmissions = submissions.filter(submission => submission.action.type === 'input')
	const giveUpSubmissions = submissions.filter(submission => submission.action.type === 'giveUp')

	// Walk through the input submissions and group them based on equality. If there is an earlier submission with equal input, group them together.
	const inputSubmissionsGrouped = []
	inputSubmissions.forEach(submission => {
		const index = inputSubmissionsGrouped.findIndex(submissionList => isInputEqual(submissionList[0].action.input, submission.action.input))
		if (index !== -1)
			inputSubmissionsGrouped[index].push(submission)
		else
			inputSubmissionsGrouped.push([submission])
	})

	// Sort the submission lists based on their last submission time, with later first. But put the user's submission always first.
	const inputSubmissionsSorted = inputSubmissionsGrouped.sort((a, b) => {
		if (a.some(submission => submission.userId === userId))
			return -2
		if (b.some(submission => submission.userId === userId))
			return 2
		const lastASubmission = Math.max(...a.map(submission => new Date(submission.performedAt).getTime()))
		const lastBSubmission = Math.max(...b.map(submission => new Date(submission.performedAt).getTime()))
		return Math.sign(lastBSubmission - lastASubmission)
	})

	// Return the final result.
	return {
		input: inputSubmissionsSorted.map(submissionList => sortSubmissionList(submissionList, userId)),
		giveUp: sortSubmissionList(giveUpSubmissions),
	}
}

// sortSubmissionList takes an array of submissions and sorts it: it puts the given user last, and other than that it sorts them based on time with later submissions last.
function sortSubmissionList(submissions, userId) {
	return submissions.sort((a, b) => {
		if (a.userId === userId)
			return 2
		if (b.userId === userId)
			return -2
		return Math.sign(new Date(a.performedAt) - new Date(b.performedAt))
	})
}

import React, { useRef, useMemo, useCallback } from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { Check, Clear, Send, ArrowForward, Search, Warning } from '@material-ui/icons'

import { lastOf } from 'step-wise/util/arrays'
import { getLastAction, getLastInput } from 'step-wise/edu/exercises/util/simpleExercise'
import { getStep } from 'step-wise/edu/exercises/util/stepExercise'

import { useLatest, useConsistentValue } from 'util/react'
import { useUserId } from 'api/user'
import { useActiveGroup } from 'api/group'
import { getIcon } from 'ui/theme'
import { Button, useModal, PictureConfirmation } from 'ui/components'
import { useFormData } from 'ui/form/Form'
import { useFieldRegistration } from 'ui/form/FieldController'
import { useFeedback } from 'ui/form/FeedbackProvider'
import { useSelfAndOtherMembers } from 'ui/pages/Groups/util'
import MemberList from 'ui/pages/Groups/MemberList'

import { useExerciseData } from '../ExerciseContainer'
import { useSubmitAction, useGiveUpAction, useCancelAction, useResolveEvent, canResolveGroupEvent } from './actions'

const useStyles = makeStyles((theme) => ({
	buttonContainer: {
		display: 'flex',
		flexFlow: 'row wrap',
		justifyContent: 'flex-end',
		margin: '0.2rem 0',

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
	buttonGrid: {
		display: 'grid',
		gridGap: '0.6rem 0.6rem',
		placeItems: 'center stretch',
		width: '100%',

		[theme.breakpoints.down('xs')]: {
			gridTemplateColumns: 'auto 1fr',

			'& .inBetween': {
				height: '0.25rem',
				gridColumnStart: 1,
				gridColumnEnd: 3,
			},
			'& .description1, & .description2, & .description3, & .description4': {
				gridColumnStart: 1,
			},
			'& .description1': {
				gridColumnEnd: 2,
			},
			'& .description2, & .description3, & .description4': {
				gridColumnEnd: 3,
			},
			'& .memberList': {
				gridColumnStart: 2,
				gridColumnEnd: 3,
			},
			'& .button1': {
				gridColumnStart: 1,
				gridColumnEnd: 3,
			},
			'& .button2': {
				gridColumnStart: 1,
				gridColumnEnd: 3,
			},
		},
		[theme.breakpoints.up('sm')]: {
			gridTemplateColumns: `auto 1fr auto auto`,

			'& .inBetween': {
				display: 'none', // Only for smartphones.
			},
			'& .description1': {
				gridColumnStart: 1,
				gridColumnEnd: 2,
			},
			'& .description2': {
				gridColumnStart: 1,
				gridColumnEnd: 3,
			},
			'& .description3': {
				gridColumnStart: 1,
				gridColumnEnd: 4,
			},
			'& .description4': {
				gridColumnStart: 1,
				gridColumnEnd: 5,
			},
			'& .memberList': {
				gridColumnStart: 2,
				gridColumnEnd: 3,
			},
			'& .button1': {
				gridColumnStart: 3,
				gridColumnEnd: 4,
			},
			'& .button2': {
				gridColumnStart: 4,
				gridColumnEnd: 5,
			},
		},

		'& .description1, & .description2, & .description3, & .description4': {
			alignItems: 'center',
			display: 'flex',
			flexFlow: 'row nowrap',
			padding: '0.25rem 0',

			'& > svg': {
				marginRight: '0.3rem',
			},
		},
		'& .info': {
			color: theme.palette.info.main,
			fontWeight: 'bold',
		},
		'& .warning': {
			color: theme.palette.warning.main,
			fontWeight: 'bold',
		},

		'& .buttonText': {
			width: '100%', // Ensure button icons are still on the side of the button.
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
	const classes = useStyles()
	const { progress } = useExerciseData()

	// Determine the status of the exercise.
	const derivedParameters = useDerivedParameters()

	// Is the exercise done? Then return the restart button.
	if (progress.done)
		return <StartNewExerciseButton />

	// Render the variety of buttons required.
	return <div className={classes.buttonGrid}>
		<GiveUpAndSubmitButtons stepwise={stepwise} {...derivedParameters} />
		<CurrentSubmissions {...derivedParameters} />
		<GivenUpNote stepwise={stepwise} {...derivedParameters} />
		<ResolveNote stepwise={stepwise} {...derivedParameters} />
	</div>
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

	// Determine if the input is the same as previously, or as to what is currently submitted.
	const lastAction = getLastAction(history, userId)
	const isInputEqualToLastInput = lastAction && lastAction.type === 'input' && isInputEqual(lastAction.input)
	const isInputEqualToSubmittedInput = submittedAction && submittedAction.type === 'input' && isInputEqual(submittedAction.input)

	// Determine the give-up button text.
	let giveUpText = 'Ik geef het op'
	const step = getStep(progress)
	if (stepwise)
		giveUpText = step ? 'Ik geef deze stap op' : 'Los stapsgewijs op'

	// Render the buttons.
	const WarningIcon = getIcon('warning')
	return <>
		{submittedAction && submittedAction.type === 'input' && !isInputEqualToSubmittedInput ? <div className="description2 warning"><WarningIcon />De invoer hierboven is niet gelijk aan je ingezonden antwoord.</div> : null}
		{hasGivenUp ? null : <Button className="button1" variant="contained" startIcon={<Clear />} onClick={giveUp} disabled={submitting} color="secondary" ref={giveUpButtonRef}><span className="buttonText">{giveUpText}</span></Button>}
		<Button className="button2" variant="contained" endIcon={<Send />} onClick={submit} disabled={submitting || isInputEqualToLastInput || isInputEqualToSubmittedInput} color="primary" ref={submitButtonRef}><span className="buttonText">Insturen</span></Button>
	</>
}

function CurrentSubmissions(derivedProperties) {
	const { groupedSubmissions } = derivedProperties
	return groupedSubmissions.input.map((submissionList, index) => <CurrentSubmissionRow key={index} {...{ ...derivedProperties, index, submissionList }} />)
}

function CurrentSubmissionRow({ submissionList, submitting, index }) {
	const { history } = useExerciseData()
	const userId = useUserId()
	const activeGroup = useActiveGroup()
	const { setAllInputSI, isInputEqual } = useFormData()
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
	const membersSorted = useSelfAndOtherMembers(submissionMembers)
	const isSelfPresent = submissionMembers.some(member => member.userId === userId)

	// Set up handlers to put the input into the form and possibly submit it.
	const historyRef = useLatest(history), submissionListRef = useLatest(submissionList)
	const setFormInput = useCallback(() => {
		// Find the previous input action of the user and show the feedback on this.
		updateFeedback(getLastInput(historyRef.current, lastOf(submissionListRef.current).userId, true) || {}) // Show feedback on the last resolved input.
		setAllInputSI(lastOf(submissionListRef.current).action.input) // Show the input of the last action.
	}, [historyRef, submissionListRef, updateFeedback, setAllInputSI])
	const setAndSubmitFormInput = useCallback(() => {
		setFormInput()
		submit()
	}, [setFormInput, submit])

	// Show the buttons. Which exact button depends on whether the user itself is in the list.
	const submittedInput = lastOf(submissionList).action.input
	const isEqual = isInputEqual(submittedInput)
	return <>
		<div className="inBetween" />
		<div className="description1">Ingezonden:</div>
		<div className="memberList"><MemberList members={membersSorted} /></div>
		<Button className="button1" variant="contained" startIcon={<Search />} disabled={isEqual} onClick={setFormInput} color="info" ref={viewButtonRef}><span className="buttonText">Bekijken</span></Button>
		{isSelfPresent ?
			<Button className="button2" variant="contained" startIcon={<Clear />} onClick={cancel} disabled={submitting} color="secondary" ref={copyCancelButtonRef}><span className="buttonText">Inzending annuleren</span></Button> :
			<Button className="button2" variant="contained" endIcon={<Send />} onClick={setAndSubmitFormInput} disabled={submitting} color="primary" ref={copyCancelButtonRef}><span className="buttonText">Ook insturen</span></Button>
		}
	</>
}

function GivenUpNote({ stepwise, gaveUp, submitting, groupedSubmissions }) {
	const { progress } = useExerciseData()
	const activeGroup = useActiveGroup()

	// Set up a cancel button ref and register it to tab control.
	const cancel = useCancelAction()
	const cancelButtonRef = useRef()
	useFieldRegistration({ id: 'cancelButton', element: cancelButtonRef, apply: gaveUp, focusRefOnActive: true })

	// Determine who gave up.
	const giveUpMembers = groupedSubmissions.giveUp.map(submission => activeGroup.members.find(member => member.userId === submission.userId))
	const membersSorted = useSelfAndOtherMembers(giveUpMembers)

	// If no one gave up, show nothing.
	if (groupedSubmissions.giveUp.length === 0)
		return null

	// Show the people that gave up.
	return <>
		<div className="inBetween" />
		<div className="description1">{!stepwise || progress.step ? 'Opgegeven:' : 'Stapsgewijs oplossen:'}</div>
		<div className="memberList"><MemberList members={membersSorted} /></div>
		{gaveUp ? <Button className="button2" variant="contained" startIcon={<Clear />} onClick={cancel} disabled={submitting} color="secondary" ref={cancelButtonRef}><span className="buttonText">{!stepwise || progress.step ? 'Opgeven annuleren' : 'Stapsgewijs oplossen annuleren'}</span></Button> : null}
	</>
}

function ResolveNote({ stepwise, hasSubmitted, canResolve, allGaveUp, submitting, unsubmittedMembers }) {
	const { progress } = useExerciseData()

	// Set up a resolve button ref and register it to tab control.
	const resolve = useResolveEvent()
	const resolveButtonRef = useRef()
	useFieldRegistration({ id: 'resolveButton', element: resolveButtonRef, apply: canResolve, focusRefOnActive: true })

	// If the user has not submitted anything, do not show anything.
	if (!hasSubmitted)
		return null

	// If everyone gave up, show an alternate note.
	const InfoIcon = getIcon('info')
	if (allGaveUp) {
		return <>
			<div className="inBetween" />
			<div className="description3 info"><InfoIcon />{!stepwise || progress.step ? 'Iedereen heeft het opgegeven.' : 'Iedereen stemt voor stapsgewijs oplossen.'}</div>
			<Button className="button2" variant="contained" startIcon={<Clear />} onClick={resolve} disabled={submitting} color="primary" ref={resolveButtonRef}><span className="buttonText">{!stepwise || progress.step ? 'Opgeven bevestigen' : 'Stapsgewijs oplossen bevestigen'}</span></Button>
		</>
	}

	// If the exercise can be resolved, show this.
	if (canResolve) {
		return <>
			<div className="inBetween" />
			<div className="description3 info"><InfoIcon />Alle inzendingen zijn binnen.</div>
			<Button className="button2" variant="contained" startIcon={<Check />} onClick={resolve} disabled={submitting} color="primary" ref={resolveButtonRef}><span className="buttonText">Controleer</span></Button>
		</>
	}

	// If the exercise cannot be resolved because submissions are missing, show remaining members.
	if (unsubmittedMembers.length > 0) {
		return <>
			<div className="inBetween" />
			<div className="description1">Ontbrekend:</div>
			<div className="memberList"><MemberList members={unsubmittedMembers} /></div>
		</>
	}

	// There must simply be too few active members. Note this.
	const WarningIcon = getIcon('warning')
	return <>
		<div className="description4 warning"><WarningIcon />In de samenwerkingsmodus zijn minimaal twee inzendingen nodig om een opgave na te laten kijken. Nodig een studiegenoot uit.</div>
	</>
}

// useDerivedParameters takes the exercise data and extracts a variety of parameters that can be used to display the right buttons.
function useDerivedParameters() {
	const { history } = useExerciseData()
	const activeGroup = useActiveGroup()
	const userId = useUserId()
	const { isInputEqual, getFieldIds } = useFormData()
	const fieldIds = useConsistentValue(getFieldIds())

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeGroup, history, userId, isInputEqual, fieldIds]) // The fieldIds dependency is needed because, only after the fields get loaded into the form, can isInputEqual function properly.
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

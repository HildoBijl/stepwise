import React, { useRef, useMemo, useCallback } from 'react'
import { Box, FormControl, Select, MenuItem } from '@mui/material'
import { Check, Clear, Send, Search, Warning } from '@mui/icons-material'

import { last, fromKeys, isPlainObject, repeat } from '@step-wise/js-utils'
import { getLastAction } from '@step-wise/exercise-definition'
import { toInputValue } from '@step-wise/input-interpretation'
import { getLastRawInput, getCurrentStep } from '@step-wise/input-exercises'

import { useLatest, useConsistentValue } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.
import { useUserId, useIsAdmin, useActiveGroup, useSelfAndOtherMembers } from 'api'
import { Translation, useTranslator, useGetTranslation } from 'i18n'
import { getIcon } from 'ui/theme'
import { Button, useModal, PictureConfirmation, QuickPractice, MemberList } from 'ui/components'
import { useFormData, useFieldRegistration, useFeedbackContext } from 'ui/form'
import { useTestContext } from 'ui/admin'

import { useCourseData } from '../../course/components/CourseProvider'

import { useSubmitAction, useGiveUpAction, useCancelAction, useResolveEvent, canResolveGroupEvent } from '../util'
import { useExerciseData } from '../containers'
import { useSolution } from '../wrappers'

const translationPath = 'eduTools/exercises'

export function ExerciseButtons(props) {
	const { groupExercise } = useExerciseData()
	if (groupExercise)
		return <GroupExerciseButtons {...props} />
	return <SingleUserExerciseButtons {...props} />
}

function SingleUserExerciseButtons({ stepwise = false }) {
	const translate = useTranslator(translationPath)
	const { isAllInputEqual, getAllInputSI, setAllInputSI, getFieldIds } = useFormData()
	const { instance, state, history, submitting, example, inspection } = useExerciseData()
	const solution = useSolution(false)
	const inTestContext = useTestContext()
	const isAdmin = useIsAdmin()
	const courseData = useCourseData()
	const isTeacher = isAdmin || courseData?.course?.role === 'teacher'

	// Set up button handlers.
	const submit = useSubmitAction()
	const giveUp = useGiveUpAction()

	// Include the buttons in the tabbing.
	const insertSolutionButtonRef = useRef(), giveUpButtonRef = useRef(), submitButtonRef = useRef()
	useFieldRegistration({ id: 'insertSolutionButton', element: insertSolutionButtonRef, apply: !inspection && !state.done && isTeacher, focusRefOnActive: true })
	useFieldRegistration({ id: 'submitButton', element: submitButtonRef, apply: !inspection && !state.done, focusRefOnActive: true })
	useFieldRegistration({ id: 'giveUpButton', element: giveUpButtonRef, apply: !inspection && !example && !state.done, focusRefOnActive: true })

	// Set up a warning Modal for when the user gives up a step exercise without even trying.
	const [, setModalOpen] = useModal(<PictureConfirmation
		title={<Box component="span" sx={theme => ({ color: theme.palette.warning.main })}>{translate('Are you sure?', 'stepsModal.title')}</Box>}
		picture={<Warning sx={theme => ({ color: theme.palette.warning.main, height: '8rem', width: '8rem' })} />}
		message={translate('The goal of Step-Wise is that you can eventually solve exercises without using steps. If you give up without trying, then this counts as an incorrect submission. Your skill rating will decrease.', 'stepsModal.message')}
		rejectText={translate('Not yet ...', 'stepsModal.buttons.no')}
		confirmText={translate('Show me the steps', 'stepsModal.buttons.yes')}
		onConfirm={giveUp}
	/>)

	// Are we in inspection mode? Then no buttons are needed.
	if (inspection)
		return null

	// Is the exercise done? Then no buttons are needed.
	if (!example && state.done)
		return null

	// Determine if the input is the same as previously.
	const lastAction = getLastAction(instance)
	const inputIsEqualToLastInput = lastAction && lastAction.type === 'input' && isAllInputEqual(lastAction.input)

	// If the exercise is not done, we need the submit and give-up buttons. First set up the text.
	let giveUpText = translate('I give up', 'buttons.giveUp')
	const step = getCurrentStep(state)
	if (stepwise) {
		if (example)
			giveUpText = translate('Show steps', 'buttons.showSteps')
		else
			giveUpText = step ? translate('I give up this step', 'buttons.giveUpStep') : translate('Solve this Step-Wise', 'buttons.solveStepWise')
	}

	// On giving up, check if a warning needs to be shown.
	const checkGiveUp = () => {
		// Should we warn the user that his rating will go down upon a step-wise solution?
		const showWarning = !example && stepwise && step === 0 && history.length === 0 && !inTestContext
		if (showWarning) {
			setModalOpen(true)
		} else {
			giveUp()
		}
	}

	// Set up a function to insert the solution into the input fields.
	const insertSolution = () => {
		const oldInput = getAllInputSI()
		const newInput = fromKeys(getFieldIds(), (key) => {
			if (solution[key] === undefined)
				return oldInput[key]
			let currNewInput = toInputValue(solution[key], oldInput[key]?.type)
			if (isPlainObject(currNewInput))
				currNewInput = { ...oldInput[key], ...currNewInput } // Keep other parameters like input field settings for expressions.
			return currNewInput
		})
		setAllInputSI(newInput)
	}

	return <Box sx={theme => ({
		display: 'flex',
		flexFlow: 'row wrap',
		justifyContent: 'flex-end',
		margin: '0.2rem 0',
		'& button, & > div': {
			flexGrow: 0,
			flexShrink: 0,
			margin: '0.4rem 0 0.4rem 0.8rem',
			[theme.breakpoints.down('xs')]: {
				marginLeft: '0.4rem',
				width: '100%',
			},
		}
	})}>
		{isTeacher && solution ? <Button variant="contained" startIcon={<QuickPractice />} onClick={insertSolution} disabled={submitting} color="info" ref={insertSolutionButtonRef}>{translate('Insert solution', 'buttons.solve')}</Button> : null}
		<Button variant="contained" startIcon={<Check />} onClick={submit} disabled={submitting || inputIsEqualToLastInput} color="primary" ref={submitButtonRef}>{translate('Submit and check', 'buttons.check')}</Button>
		{example ? null : <Button variant="contained" startIcon={<Clear />} onClick={checkGiveUp} disabled={submitting} color="secondary" ref={giveUpButtonRef}>{giveUpText}</Button>}
		{example && stepwise ? <StepSelect /> : null}
	</Box>
}

function StepSelect() {
	const { state, submitAction, metaData } = useExerciseData()
	const numSteps = metaData.steps.length

	// Set up a handler that manages the state on step changes.
	const handleChange = event => {
		const newSelectedStep = event.target.value
		const newState = { ...state }
		delete newState.done
		delete newState.solved
		for (let i = (newSelectedStep || 0) + 1; newState[i]; i++) { delete newState[i] } // Delete all step states after the given step.
		if (newSelectedStep) {
			newState.split = true
			newState.step = newSelectedStep
			newState[newSelectedStep] = { ...newState[newSelectedStep] } || {}
			delete newState[newSelectedStep].done
			delete newState[newSelectedStep].solved
		} else {
			delete newState.split
			delete newState.step
		}
		submitAction({ type: 'setState', newState })
	}

	// Render the button.
	return <FormControl variant="outlined" size="small" color="info">
		<Select id="stepSelect" color="info" value={getCurrentStep(state)} onChange={handleChange} sx={theme => ({
			'& svg': { color: theme.palette.info.contrastText },
			'& .MuiSelect-select': {
				backgroundColor: theme.palette.info.main,
				color: theme.palette.info.contrastText,
				fontWeight: '500',
				textTransform: 'uppercase',
			},
			'& fieldset': { border: 0 },
		})}>
			<MenuItem value={0} key={0}><Translation path={translationPath} entry="buttons.stepSelect.tryMain">Try the main exercise</Translation></MenuItem>
			{repeat(numSteps, index => <MenuItem value={index + 1} key={index + 1}><Translation path={translationPath} entry="buttons.stepSelect.tryStep">Try out step {{ step: index + 1 }}</Translation></MenuItem>)}
		</Select>
	</FormControl>
}

function GroupExerciseButtons({ stepwise = false }) {
	const { state } = useExerciseData()

	// Determine the status of the exercise.
	const derivedParameters = useDerivedParameters()

	// Is the exercise done? Then return the restart button.
	if (state.done)
		return null

	// Render the variety of buttons required.
	return <Box sx={theme => ({
		display: 'grid',
		gridGap: '0.6rem 0.6rem',
		placeItems: 'center stretch',
		width: '100%',
		[theme.breakpoints.down('xs')]: {
			gridTemplateColumns: 'auto 1fr',
			'& .inBetween': { gridColumnStart: 1, gridColumnEnd: 3, height: '0.25rem' },
			'& .description1, & .description2, & .description3, & .description4': { gridColumnStart: 1 },
			'& .description1': { gridColumnEnd: 2 },
			'& .description2, & .description3, & .description4': { gridColumnEnd: 3 },
			'& .memberList': { gridColumnStart: 2, gridColumnEnd: 3 },
			'& .button1': { gridColumnStart: 1, gridColumnEnd: 3 },
			'& .button2': { gridColumnStart: 1, gridColumnEnd: 3 },
		},
		[theme.breakpoints.up('sm')]: {
			gridTemplateColumns: `auto 1fr auto auto`,
			'& .inBetween': { display: 'none' }, // Only for smartphones.
			'& .description1': { gridColumnStart: 1, gridColumnEnd: 2 },
			'& .description2': { gridColumnStart: 1, gridColumnEnd: 3 },
			'& .description3': { gridColumnStart: 1, gridColumnEnd: 4 },
			'& .description4': { gridColumnStart: 1, gridColumnEnd: 5 },
			'& .memberList': { gridColumnStart: 2, gridColumnEnd: 3 },
			'& .button1': { gridColumnStart: 3, gridColumnEnd: 4 },
			'& .button2': { gridColumnStart: 4, gridColumnEnd: 5 },
		},
		'& .description1, & .description2, & .description3, & .description4': {
			alignItems: 'center',
			display: 'flex',
			flexFlow: 'row nowrap',
			padding: '0.25rem 0',
			'& > svg': { marginRight: '0.3rem' },
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
			width: '100%', // Ensure button icons are still on the far side of the button.
		},
	})}>
		<GiveUpAndSubmitButtons stepwise={stepwise} {...derivedParameters} />
		<CurrentActions {...derivedParameters} />
		<GivenUpNote stepwise={stepwise} {...derivedParameters} />
		<ResolveNote stepwise={stepwise} {...derivedParameters} />
	</Box>
}

function GiveUpAndSubmitButtons({ stepwise, currentAction }) {
	const getTranslation = useGetTranslation(translationPath)
	const translate = useTranslator(translationPath, 'groupExercise')
	const { instance, state, submitting } = useExerciseData()
	const userId = useUserId()
	const { isAllInputEqual } = useFormData()

	// Set up button handlers.
	const submit = useSubmitAction()
	const giveUp = useGiveUpAction()

	// Determine whether the user has given up.
	const hasGivenUp = currentAction && currentAction.type === 'giveUp'

	// Register the buttons to tab control.
	const giveUpButtonRef = useRef(), submitButtonRef = useRef()
	useFieldRegistration({ id: 'giveUpButton', element: giveUpButtonRef, apply: !hasGivenUp, focusRefOnActive: true })
	useFieldRegistration({ id: 'submitButton', element: submitButtonRef, focusRefOnActive: true })

	// Determine if the input is the same as the previous or current action.
	const lastAction = getLastAction(instance, userId)
	const isAllInputEqualToLastInput = lastAction && lastAction.type === 'input' && isAllInputEqual(lastAction.input)
	const isAllInputEqualToCurrentAction = currentAction && currentAction.type === 'input' && isAllInputEqual(currentAction.input)

	// Determine the give-up button text.
	let giveUpText = getTranslation('buttons.giveUp')
	const step = getCurrentStep(state)
	if (stepwise)
		giveUpText = step ? getTranslation('buttons.giveUpStep') : getTranslation('buttons.solveStepWise')

	// Render the buttons.
	const WarningIcon = getIcon('warning')
	return <>
		{currentAction && currentAction.type === 'input' && !isAllInputEqualToCurrentAction ? <div className="description2 warning"><WarningIcon />{translate('The above input is not equal to your submitted solution.', 'unequalSolutionWarning')}</div> : null}
		{hasGivenUp ? null : <Button className="button1" variant="contained" startIcon={<Clear />} onClick={giveUp} disabled={submitting} color="secondary" ref={giveUpButtonRef}><span className="buttonText">{giveUpText}</span></Button>}
		<Button className="button2" variant="contained" endIcon={<Send />} onClick={submit} disabled={submitting || isAllInputEqualToLastInput || isAllInputEqualToCurrentAction} color="primary" ref={submitButtonRef}><span className="buttonText">{translate('Send submission', 'buttons.sendSubmission')}</span></Button>
	</>
}

function CurrentActions(derivedProperties) {
	const { groupedActions } = derivedProperties
	return groupedActions.input.map((actionList, index) => <CurrentActionRow key={index} {...{ ...derivedProperties, index, actionList }} />)
}

function CurrentActionRow({ actionList, submitting, index }) {
	const translate = useTranslator(translationPath, 'groupExercise')
	const exerciseData = useExerciseData()
	const { history } = exerciseData
	const userId = useUserId()
	const activeGroup = useActiveGroup()
	const { setAllInputSI, isAllInputEqual } = useFormData()
	const { updateFeedback } = useFeedbackContext()

	// Set up button handlers.
	const cancel = useCancelAction()
	const submit = useSubmitAction()

	// Register the buttons to tab control.
	const viewButtonRef = useRef(), copyCancelButtonRef = useRef()
	useFieldRegistration({ id: `viewButton${index}`, element: viewButtonRef, focusRefOnActive: true })
	useFieldRegistration({ id: `copyCancelButton${index}`, element: copyCancelButtonRef, focusRefOnActive: true })

	// Determine the members and their names for display purposes.
	const actionMembers = actionList.map(userAction => activeGroup.members.find(member => member.userId === userAction.userId))
	const membersSorted = useSelfAndOtherMembers(actionMembers)
	const isSelfPresent = actionMembers.some(member => member.userId === userId)

	// Set up handlers to put the input into the form and possibly submit it.
	const historyRef = useLatest(history), actionListRef = useLatest(actionList)
	const setFormInput = useCallback(() => {
		// Find the previous input action of the user and show the feedback on this.
		updateFeedback(getLastRawInput({ ...exerciseData, history: historyRef.current }, last(actionListRef.current).userId, { resolvedOnly: true }) || {}) // Show feedback on the last resolved input.
		setAllInputSI(last(actionListRef.current).action.input) // Show the input of the last action.
	}, [exerciseData, historyRef, actionListRef, updateFeedback, setAllInputSI])
	const setAndSubmitFormInput = useCallback(() => {
		setFormInput()
		submit()
	}, [setFormInput, submit])

	// Show the buttons. Which exact button depends on whether the user itself is in the list.
	const actionInput = last(actionList).action.input
	const isEqual = isAllInputEqual(actionInput)
	return <>
		<div className="inBetween" />
		<div className="description1">{translate('Submitted:', 'status.submitted')}</div>
		<div className="memberList"><MemberList members={membersSorted} /></div>
		<Button className="button1" variant="contained" startIcon={<Search />} disabled={isEqual} onClick={setFormInput} color="info" ref={viewButtonRef}><span className="buttonText">{translate('View submission', 'buttons.viewSubmission')}</span></Button>
		{isSelfPresent ?
			<Button className="button2" variant="contained" startIcon={<Clear />} onClick={cancel} disabled={submitting} color="secondary" ref={copyCancelButtonRef}><span className="buttonText">{translate('Cancel submission', 'buttons.cancelSubmission')}</span></Button> :
			<Button className="button2" variant="contained" endIcon={<Send />} onClick={setAndSubmitFormInput} disabled={submitting} color="primary" ref={copyCancelButtonRef}><span className="buttonText">{translate('Submit the same', 'buttons.submitTheSame')}</span></Button>
		}
	</>
}

function GivenUpNote({ stepwise, gaveUp, submitting, groupedActions }) {
	const translate = useTranslator(translationPath, 'groupExercise')
	const { state } = useExerciseData()
	const activeGroup = useActiveGroup()

	// Set up a cancel button ref and register it to tab control.
	const cancel = useCancelAction()
	const cancelButtonRef = useRef()
	useFieldRegistration({ id: 'cancelButton', element: cancelButtonRef, apply: gaveUp, focusRefOnActive: true })

	// Determine who gave up.
	const giveUpMembers = groupedActions.giveUp.map(userAction => activeGroup.members.find(member => member.userId === userAction.userId))
	const membersSorted = useSelfAndOtherMembers(giveUpMembers)

	// If no one gave up, show nothing.
	if (groupedActions.giveUp.length === 0)
		return null

	// Show the people that gave up.
	return <>
		<div className="inBetween" />
		<div className="description1">{!stepwise || state.step ? translate('Given up:', 'status.givenUp') : translate('Solve Step-Wise:', 'status.solveStepWise')}</div>
		<div className="memberList"><MemberList members={membersSorted} /></div>
		{gaveUp ? <Button className="button2" variant="contained" startIcon={<Clear />} onClick={cancel} disabled={submitting} color="secondary" ref={cancelButtonRef}><span className="buttonText">{!stepwise || state.step ? translate('Cancel giving up', 'buttons.cancelGivingUp') : translate('Cancel solving Step-Wise', 'buttons.cancelSolveStepWise')}</span></Button> : null}
	</>
}

function ResolveNote({ stepwise, hasUserAction, canResolve, allGaveUp, submitting, membersWithoutActions }) {
	const translate = useTranslator(translationPath, 'groupExercise')
	const { state } = useExerciseData()

	// Set up a resolve button ref and register it to tab control.
	const resolve = useResolveEvent()
	const resolveButtonRef = useRef()
	useFieldRegistration({ id: 'resolveButton', element: resolveButtonRef, apply: canResolve, focusRefOnActive: true })

	// If the user has no current action, do not show anything.
	if (!hasUserAction)
		return null

	// If everyone gave up, show an alternate note.
	const InfoIcon = getIcon('info')
	if (allGaveUp) {
		return <>
			<div className="inBetween" />
			<div className="description3 info"><InfoIcon />{!stepwise || state.step ? translate('Everyone gave up.', 'status.allGaveUp') : translate('Everyone votes for solving this Step-Wise.', 'status.allStepWise')}</div>
			<Button className="button2" variant="contained" startIcon={<Clear />} onClick={resolve} disabled={submitting} color="primary" ref={resolveButtonRef}><span className="buttonText">{!stepwise || state.step ? translate('Confirm giving up', 'buttons.confirmGivingUp') : translate('Confirm solving Step-Wise', 'buttons.comfirmSolvingStepWise')}</span></Button>
		</>
	}

	// If the exercise can be resolved, show this.
	if (canResolve) {
		return <>
			<div className="inBetween" />
			<div className="description3 info"><InfoIcon />{translate('All submissions have been received.', 'status.submissionsReceived')}</div>
			<Button className="button2" variant="contained" startIcon={<Check />} onClick={resolve} disabled={submitting} color="primary" ref={resolveButtonRef}><span className="buttonText">{translate('Check submissions', 'buttons.checkSubmissions')}</span></Button>
		</>
	}

	// If the exercise cannot be resolved because actions are missing, show remaining members.
	if (membersWithoutActions.length > 0) {
		return <>
			<div className="inBetween" />
			<div className="description1">{translate('Missing:', 'status.missingSubmissions')}</div>
			<div className="memberList"><MemberList members={membersWithoutActions} /></div>
		</>
	}

	// There must simply be too few active members. Note this.
	const WarningIcon = getIcon('warning')
	return <>
		<div className="description4 warning"><WarningIcon />{translate('When practicing together, at least two submissions are needed to complete an exercise. Invite a fellow student.', 'notEnoughSubmissions')}</div>
	</>
}

// useDerivedParameters takes the exercise data and extracts a variety of parameters that can be used to display the right buttons.
function useDerivedParameters() {
	const { history } = useExerciseData()
	const activeGroup = useActiveGroup()
	const userId = useUserId()
	const { isAllInputEqual, getFieldIds } = useFormData()
	const fieldIds = useConsistentValue(getFieldIds())

	// Determine the status of the exercise.	
	return useMemo(() => {
		const currentEvent = history.find(event => !('state' in event))
		const currentActions = currentEvent?.actions || []
		const gaveUp = currentActions.some(userAction => userAction.userId === userId && userAction.action.type === 'giveUp')
		const currentAction = currentActions.find(userAction => userAction.userId === userId)?.action
		const hasUserAction = !!currentAction
		const numActions = currentActions.length
		const membersWithoutActions = activeGroup.members.filter(member => member.active && !currentActions.some(userAction => userAction.userId === member.userId))
		const canResolve = canResolveGroupEvent(activeGroup, history)
		const allGaveUp = canResolve && currentEvent.actions.every(userAction => userAction.action.type === 'giveUp')
		const groupedActions = groupActions(currentActions, userId, isAllInputEqual)
		return { currentEvent, currentActions, currentAction, gaveUp, hasUserAction, numActions, membersWithoutActions, canResolve, allGaveUp, groupedActions }
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeGroup, history, userId, isAllInputEqual, fieldIds]) // The fieldIds dependency is needed because, only after the fields get loaded into the form, can isAllInputEqual function properly.
}

// groupActions takes a set of actions and groups them based on their type. The result is an object of the form { input: [[ ...identical actions...], ]}
function groupActions(actions, userId, isAllInputEqual) {
	// Filter the actions by their type.
	const inputActions = actions.filter(userAction => userAction.action.type === 'input')
	const giveUpActions = actions.filter(userAction => userAction.action.type === 'giveUp')

	// Walk through the input actions and group them based on equality. If there is an earlier user action with equal input, group them together.
	const groupedInputActions = []
	inputActions.forEach(userAction => {
		const index = groupedInputActions.findIndex(actionList => isAllInputEqual(actionList[0].action.input, userAction.action.input))
		if (index !== -1)
			groupedInputActions[index].push(userAction)
		else
			groupedInputActions.push([userAction])
	})

	// Sort the action lists based on their latest action time, with later first. But always put the user's action first.
	const sortedInputActions = groupedInputActions.sort((a, b) => {
		if (a.some(userAction => userAction.userId === userId))
			return -2
		if (b.some(userAction => userAction.userId === userId))
			return 2
		const latestATime = Math.max(...a.map(userAction => new Date(userAction.performedAt).getTime()))
		const latestBTime = Math.max(...b.map(userAction => new Date(userAction.performedAt).getTime()))
		return Math.sign(latestBTime - latestATime)
	})

	// Return the final result.
	return {
		input: sortedInputActions.map(actionList => sortActionList(actionList, userId)),
		giveUp: sortActionList(giveUpActions),
	}
}

// sortActionList takes an array of actions and sorts it: it puts the given user last, and other than that it sorts them based on time with later actions last.
function sortActionList(actions, userId) {
	return actions.sort((a, b) => {
		if (a.userId === userId)
			return 2
		if (b.userId === userId)
			return -2
		return Math.sign(new Date(a.performedAt) - new Date(b.performedAt))
	})
}

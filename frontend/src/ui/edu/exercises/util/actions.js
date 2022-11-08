
import { useCallback } from 'react'

import { lastOf, secondLastOf, count } from 'step-wise/util/arrays'

import { useRefWithValue } from 'util/react'
import { useUserId } from 'api/user'
import { useActiveGroup } from 'api/group'
import { useFormData } from 'ui/form/Form'

import { useExerciseData } from '../ExerciseContainer'

export function useSubmitAction() {
	const { groupExercise, submitting, submitAction, history } = useExerciseData()
	const userId = useUserId()
	const { getInputSI, isValid, getField } = useFormData()

	const groupExerciseRef = useRefWithValue(groupExercise)
	const historyRef = useRefWithValue(history)
	const disabledRef = useRefWithValue(submitting)

	return useCallback(() => {
		// Check if we're enabled. (This is not the case if we're still submitting.)
		if (disabledRef.current)
			return

		// Check if the input has validated.
		if (!isValid())
			return

		// Check if the input is the same as for the previous action. If so, do nothing.
		const input = getInputSI()
		const lastAction = getLastAction(historyRef.current, groupExerciseRef.current, userId)
		if (lastAction && lastAction.type === 'input') {
			const fieldIds = Object.keys(input)
			if (fieldIds.length === Object.keys(lastAction.input).length && fieldIds.every(id => getField(id).equals(input[id], lastAction.input[id])))
				return
		}

		// All checks are fine. Submit the input!
		return submitAction({ type: 'input', input })
	}, [getInputSI, isValid, groupExerciseRef, historyRef, disabledRef, getField, submitAction, userId])
}

export function useGiveUpAction() {
	const { submitting, submitAction } = useExerciseData()
	const disabledRef = useRefWithValue(submitting)

	return useCallback(() => {
		if (disabledRef.current)
			return
		return submitAction({ type: 'giveUp' })
	}, [disabledRef, submitAction])
}

export function useCancelAction() {
	const { cancelAction, history } = useExerciseData()
	const userId = useUserId()
	const historyRef = useRefWithValue(history)

	return useCallback(() => {
		// If the user has not submitted anything, do not do anything.
		const currentEvent = historyRef.current.find(event => event.progress === null)
		const isUserAction = (currentEvent?.actions || []).some(action => action.userId === userId)
		if (!isUserAction)
			return

		// Cancel the action.
		return cancelAction()
	}, [cancelAction, historyRef, userId])
}

export function useResolveEvent() {
	const { resolveEvent, history } = useExerciseData()
	const activeGroup = useActiveGroup()
	const historyRef = useRefWithValue(history)
	const activeGroupRef = useRefWithValue(activeGroup)

	return useCallback(() => {
		// If we cannot resolve the event, do nothing.
		if (!canResolveGroupEvent(activeGroupRef.current, historyRef.current))
			return

		// Send the call to resolve the event.
		return resolveEvent()
	}, [resolveEvent, activeGroupRef, historyRef])
}

export function getLastAction(history, groupExercise, userId) {
	// If the exercise is not a group exercise, find the last element from the history and return its action.
	if (!groupExercise)
		return (history.length > 0 && lastOf(history).action)

	// The exercise is a group exercise.
	const lastResolvedEvent = secondLastOf(history)
	const actions = lastResolvedEvent?.actions || []
	return actions.find(action => action.userId === userId)?.action
}

export function canResolveGroupEvent(group, history) {
	// Check that there are at least two active members.
	const numActiveMembers = count(group.members, member => member.active)
	if (numActiveMembers < 2)
		return false

	// Check that every active member has submitted something.
	const currentEvent = history.find(event => event.progress === null)
	const submissions = currentEvent?.submissions || []
	if (group.members.some(member => member.active && !submissions.some(submission => submission.userId === member.userId)))
		return false

	// All checks are in order.
	return true
}
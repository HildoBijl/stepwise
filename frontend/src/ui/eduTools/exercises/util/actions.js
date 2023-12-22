import { useCallback } from 'react'

import { count } from 'step-wise/util'
import { getLastAction } from 'step-wise/eduTools'

import { useLatest } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.
import { useUserId } from 'api/user'
import { useActiveGroup } from 'api/group'
import { useSubmitCall } from 'ui/form'

import { useExerciseData } from '../containers'

// useFormSubmitAction gives a function that is given to a Form, to be called whenever the form is submitted.
export function useFormSubmitAction() {
	const { submitting, submitAction, history } = useExerciseData()
	const userId = useUserId()

	const historyRef = useLatest(history)
	const disabledRef = useLatest(submitting)

	return useCallback((input, formData) => {
		// Check if we're enabled. (This is not the case if we're still submitting.)
		if (disabledRef.current)
			return

		// Check if the input is the same as for the previous action. If so, do nothing.
		const { getFieldData } = formData
		const lastAction = getLastAction(historyRef.current, userId)
		if (lastAction && lastAction.type === 'input') {
			const fieldIds = Object.keys(input)
			if (fieldIds.length === Object.keys(lastAction.input).length && fieldIds.every(id => getFieldData(id).equals(input[id], lastAction.input[id])))
				return
		}

		// All checks are fine. Submit the input!
		return submitAction({ type: 'input', input: input })
	}, [historyRef, disabledRef, submitAction, userId])
}

export function useSubmitAction() {
	return useSubmitCall()
}

export function useGiveUpAction() {
	const { submitting, submitAction } = useExerciseData()
	const disabledRef = useLatest(submitting)

	return useCallback(() => {
		if (disabledRef.current)
			return
		return submitAction({ type: 'giveUp' })
	}, [disabledRef, submitAction])
}

export function useCancelAction() {
	const { cancelAction, history } = useExerciseData()
	const userId = useUserId()
	const historyRef = useLatest(history)

	return useCallback(() => {
		// If the user has not submitted anything, do not do anything.
		const currentEvent = historyRef.current.find(event => event.progress === null)
		const isUserAction = (currentEvent?.submissions || []).some(submission => submission.userId === userId)
		if (!isUserAction)
			return

		// Cancel the action.
		return cancelAction()
	}, [cancelAction, historyRef, userId])
}

export function useResolveEvent() {
	const { resolveEvent, history } = useExerciseData()
	const activeGroup = useActiveGroup()
	const historyRef = useLatest(history)
	const activeGroupRef = useLatest(activeGroup)

	return useCallback(() => {
		// If we cannot resolve the event, do nothing.
		if (!canResolveGroupEvent(activeGroupRef.current, historyRef.current))
			return

		// Send the call to resolve the event.
		return resolveEvent()
	}, [resolveEvent, activeGroupRef, historyRef])
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

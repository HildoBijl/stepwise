import { lastOf } from 'step-wise/util'

import { TranslationSection, Translation } from 'i18n'
import { Par, TimeAgo } from 'ui/components'

export function SubmissionDate({ exercise, submissionIndex, events, event }) {
	// Determine the previous input event.
	const earlierInputEvents = events.filter((event, index) => index < submissionIndex && event.action.type === 'input')
	const previousInputEvent = lastOf(earlierInputEvents)

	// Determine some important dates.
	const exerciseStartDate = new Date(exercise.startedOn)
	const inputDate = event && new Date(event.performedAt)
	const previousInputDate = previousInputEvent && new Date(previousInputEvent.performedAt)

	// Depending on the situation, determine the right message to show.
	let message
	if (!event)
		message = <Translation entry="exerciseStart">Exercise started <strong><TimeAgo date={exerciseStartDate} displaySeconds={true} addAgo={true} /></strong>.</Translation>
	else if (previousInputEvent)
		message = <Translation entry="timeAfterPreviousInput">Exercise started <strong><TimeAgo date={exerciseStartDate} displaySeconds={true} addAgo={true} /></strong>. Submission made <strong><TimeAgo ms={inputDate - previousInputDate} displaySeconds={true} /></strong> after the previous submission.</Translation>
	else
		message = <Translation entry="timeAfterExerciseStart">Exercise started <strong><TimeAgo date={exerciseStartDate} displaySeconds={true} addAgo={true} /></strong>. Submission made <strong><TimeAgo ms={inputDate - exerciseStartDate} displaySeconds={true} /></strong> after starting the exercise.</Translation>

	// Render the message.
	return <TranslationSection entry="submissionDate">
		<Par sx={{ fontSize: 12, fontWeight: 400 }}>{message}</Par>
	</TranslationSection>
}

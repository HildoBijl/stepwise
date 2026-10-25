import { last } from '@step-wise/js-utils'
import { LocalizedDuration, Translation } from '@step-wise/i18n'

import { TranslationSection } from 'i18n'
import { RelativeTime } from 'i18nNext'
import { Par } from 'ui/components'

export function SubmissionDate({ exercise, submissionIndex, events, event }) {
	// Determine the previous input event.
	const earlierInputEvents = events.filter((event, index) => index < submissionIndex && event.action.type === 'input')
	const previousInputEvent = last(earlierInputEvents, { allowOutOfBounds: true })

	// Determine some important dates.
	const exerciseStartDate = new Date(exercise.startedAt)
	const inputDate = event && new Date(event.performedAt)
	const previousInputDate = previousInputEvent && new Date(previousInputEvent.performedAt)

	// Depending on the situation, determine the right message to show.
	let message
	if (!event)
		message = <Translation id="exerciseStart">Exercise started <strong><RelativeTime date={exerciseStartDate} smallestUnit="second" /></strong>.</Translation>
	else if (previousInputEvent)
		message = <Translation id="timeAfterPreviousInput">Exercise started <strong><RelativeTime date={exerciseStartDate} smallestUnit="second" /></strong>. Submission made <strong><LocalizedDuration milliseconds={inputDate - previousInputDate} smallestUnit="second" /></strong> after the previous submission.</Translation>
	else
		message = <Translation id="timeAfterExerciseStart">Exercise started <strong><RelativeTime date={exerciseStartDate} smallestUnit="second" /></strong>. Submission made <strong><LocalizedDuration milliseconds={inputDate - exerciseStartDate} smallestUnit="second" /></strong> after starting the exercise.</Translation>

	// Render the message.
	return <TranslationSection entry="submissionDate">
		<Par sx={{ fontSize: 12, fontWeight: 400 }}>{message}</Par>
	</TranslationSection>
}

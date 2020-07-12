import { noop } from 'step-wise/util/functions'
import { useExerciseData } from '../ExerciseContainer'

// useGetFeedbackFunction is a hook that tries to find a feedback function defined somewhere, or it creates one itself.
export function useGetFeedbackFunction(props) {
	const { shared } = useExerciseData()

	// Is there a feedback function in the front-end folder that's passed through the properties?
	if (props.getFeedback)
		return (state, input, progress) => props.getFeedback(state, input, progress, shared)

	// Is there a feedback function in the shared folder?
	if (shared.getFeedback)
		return shared.getFeedback

	// Is there a checkInput function in the shared folder that we can use to set up a default getFeedback function?
	if (shared.checkInput)
		return (state, input) => ({ all: shared.checkInput(state, input) })

	// No data is present...
	return noop
}

import { useStableCallback } from '@step-wise/react-utils'

import { useFormData } from '../provider'

// useSubmitRef gives the submitRef which is supposed to contain the function to be called on form submission.
export function useSubmitRef() {
	return useFormData().submitRef
}

// useSubmitCall gives a stable function that can be called to call whatever submit function is registered at the form.
export function useSubmitCall(part) {
	// Pull all data out of the form.
	const formData = useFormData()
	const { submitRef, isInputValid, isPartInputValid, getAllInputSI, getPartInputSI } = formData

	// Give a submit call function.
	return useStableCallback(() => {
		// If the input is not valid, do not submit.
		if (!(part === undefined ? isInputValid() : isPartInputValid(part)))
			return

		// Check if a submit function is present.
		if (typeof submitRef.current !== 'function')
			throw new Error(`Invalid Form submission: tried to submit a form, but there is no registered submission function.`)

		// Call the submit function with the SI and all formData in case it's needed.
		const SI = part === undefined ? getAllInputSI() : getPartInputSI(part)
		submitRef.current(SI, formData)
	})
}

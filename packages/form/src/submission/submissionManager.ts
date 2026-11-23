import type { FormInputValues } from '../input/index.ts'
import type { FormDomainValues } from '../validation/index.ts'

import type { FormSubmission, FormSubmissionManager, FormSubmissionManagerOptions } from './types.ts'

export function createSubmissionManager<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
>({ validateForm, onSubmit }: FormSubmissionManagerOptions<TInputValues, TDomainValues, TResult>): FormSubmissionManager<TInputValues, TDomainValues, TResult> {
	// Set up internal memory for this manager.
	let isSubmitting = false

	// Return whether the form is currently in the process of being submitted.
	const getIsSubmitting = (): boolean => isSubmitting

	// Submit the form, performing validation and invoking the submission handler if valid, while managing the submission state to prevent concurrent submissions.
	const submit: FormSubmissionManager<TInputValues, TDomainValues, TResult>['submit'] = async () => {
		// If the form is already being submitted, return an indication that submission is not possible due to an ongoing submission process.
		if (isSubmitting) return { submitted: false, reason: 'already-submitting' }
		isSubmitting = true

		// Perform validation and handle submission, ensuring that the submission state is reset after the process completes, regardless of success or failure.
		try {
			const validation = await validateForm()
			if (!validation.valid) return { submitted: false, reason: 'invalid', validation }
			const submission: FormSubmission<TInputValues, TDomainValues> = {
				inputValues: validation.inputValues,
				domainValues: validation.domainValues,
				validationReports: validation.reports,
			}
			const result = await onSubmit(submission)
			return { submitted: true, submission, result }
		} finally {
			isSubmitting = false
		}
	}

	// Return the submission manager interface with methods to check submission state and perform form submission.
	return { getIsSubmitting, submit }
}

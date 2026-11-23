import type { Awaitable } from '@step-wise/js-utils'

import type { FormInputValues } from '../input/index.ts'
import type { FormDomainValues, FormValidationReports, FormValidationResult, InvalidFormValidationResult } from '../validation/index.ts'

/*
 * Form submission data.
 */

export type FormSubmission<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
> = {
	inputValues: TInputValues
	domainValues: TDomainValues
	validationReports: FormValidationReports
}

/*
 * Form submission handler and result types.
 */

export type FormSubmitHandler<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
> = (submission: FormSubmission<TInputValues, TDomainValues>) => Awaitable<TResult>

export type FormSubmissionResult<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
> =
	| { submitted: false, reason: 'already-submitting' }
	| { submitted: false, reason: 'invalid', validation: InvalidFormValidationResult<TInputValues, TDomainValues> }
	| { submitted: true, submission: FormSubmission<TInputValues, TDomainValues>, result: TResult }

/*
 * Form submission manager.
 */

export type FormSubmissionManagerOptions<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
> = {
	validateForm: () => Awaitable<FormValidationResult<TInputValues, TDomainValues>>
	onSubmit: FormSubmitHandler<TInputValues, TDomainValues, TResult>
}

export type FormSubmissionManager<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
> = {
	getIsSubmitting: () => boolean
	submit: () => Promise<FormSubmissionResult<TInputValues, TDomainValues, TResult>>
}

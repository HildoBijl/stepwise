import type { Awaitable } from '@step-wise/js-utils'

import type { FormInputValues } from './input/index.ts'
import type { FormDomainValues, FormValidationReports, InvalidFormValidationResult } from './validation/index.ts'

/*
 * Submission.
 */

export type FormSubmission<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
> = {
	inputValues: TInputValues
	domainValues: TDomainValues
	validationReports: FormValidationReports
}

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
